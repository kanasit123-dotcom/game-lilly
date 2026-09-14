import { pick, wait, confetti, sayBubble, cheerBuddy, buddyHTML } from '../utils.js';
import { sfx, speak } from '../audio.js';
import { THAI_CONSONANTS } from './thai.js';

/* เขียนตัวอักษรตามรอย: ตัวอักษรสีจางเป็นแบบ เด็กลากนิ้วทับ
   ผ่านเมื่อระบายทับตัวอักษรได้มากพอ ไม่จับผิดเรื่องลำดับเส้น เพราะเด็ก 5 ขวบยังไม่ต้องเป๊ะ
   cfg: { set: 'thai1'|'thai2'|'thai3'|'abc'|'abc2'|'abc3'|'abc4'|'digits' }
   แต่ละ "ข้อ" อาจมีหลายตัวให้เขียนต่อกัน (ABC เขียนตัวใหญ่แล้วต่อด้วยตัวเล็กในข้อเดียว)
   จุดความคืบหน้าและดาวนับต่อข้อ ไม่ใช่ต่อตัว */

const SETS = {
  thai1: pickThai('กงจดตบปม'),
  thai2: pickThai('ขคชนผยรล'),
  thai3: pickThai('วสหอฮธทฟ'),
  thai4: pickThai('ฆซญฎถภศษ'),
  abc: pickAbc('ABCDEF'),
  abc2: pickAbc('GHIJKL'),
  abc3: pickAbc('MNOPQR'),
  abc4: pickAbc('STUVWXYZ'),
  digits: '0123456789'.split('').map((d) => ({ parts: [{ glyph: d, say: d, hint: `เขียน ${d}` }], lang: 'th-TH', font: 'latin' })),
};

function pickThai(letters) {
  return [...letters].map((ch) => {
    const c = THAI_CONSONANTS.find((x) => x.word === ch);
    return { parts: [{ glyph: ch, say: c.say, hint: `เขียน ${c.emoji} ${ch} ${c.name}` }], lang: 'th-TH', font: 'thai' };
  });
}

// ตัวใหญ่แล้วตัวเล็กติดกัน เด็กจะได้จำเป็นคู่ (ผู้ใช้ขอมา)
function pickAbc(letters) {
  return [...letters].map((ch) => ({
    parts: [
      { glyph: ch, say: ch, hint: `เขียน ${ch} ตัวใหญ่` },
      { glyph: ch.toLowerCase(), say: ch, hint: `เขียน ${ch.toLowerCase()} ตัวเล็ก` },
    ],
    lang: 'en-US',
    font: 'latin',
  }));
}

// เส้นบางลงแล้ว (7.5% ของกระดาน ≈ ความหนาเส้นตัวอักษร) เลยลดเกณฑ์ให้ยังใจดีเท่าเดิม
const PASS_RATIO = 0.5;

export function play(stage, config, hooks = {}) {
  return new Promise(async (resolve) => {
    const items = SETS[config.set] || SETS.thai1;
    let idx = 0;      // ข้อ
    let part = 0;     // ตัวที่กำลังเขียนในข้อนั้น
    let firstTry = 0;
    let clears = 0;
    let missedItem = false; // ตัวไหนในข้อล้างเกิน 1 ครั้ง ข้อนั้นไม่นับว่าได้ตั้งแต่ครั้งแรก
    let done = false;
    const current = () => items[idx].parts[part];

    stage.innerHTML = `
      <div class="prompt" id="prompt"></div>
      <div class="trace-wrap" id="wrap">
        <canvas id="pad"></canvas>
        <div class="trace-ok" id="ok" hidden>✓</div>
      </div>
      <div class="trace-actions">
        <button class="btn blue" id="clear">ล้างแล้วเขียนใหม่ 🧽</button>
      </div>
      ${buddyHTML()}`;

    const $prompt = stage.querySelector('#prompt');
    const $wrap = stage.querySelector('#wrap');
    const $pad = stage.querySelector('#pad');
    const $ok = stage.querySelector('#ok');
    const ctx = $pad.getContext('2d');

    const paint = document.createElement('canvas');
    const pctx = paint.getContext('2d');
    let maskPoints = [];
    let size = 300;
    let dpr = 1;
    let drawing = false;

    await document.fonts.ready;

    // ตัวเลข/ABC ใช้น้ำหนัก 600 พอ 700 หนาจนเด็กระบายไม่ทั่ว
    const fontStr = (item, px) =>
      item.font === 'thai' ? `${px}px Itim, sans-serif` : `600 ${px}px Fredoka, Itim, sans-serif`;
    let glyphPos = { font: '', x: 0, y: 0 };

    /* วัดขอบหมึกจริงของตัวอักษร แล้วขยายให้พอดี 68% ของกระดานและจัดกลางเอง
       ใช้ textAlign=left กับ baseline=alphabetic ซึ่งเป็นค่าเริ่มต้นที่ทุกเบราว์เซอร์ตรงกัน
       เพราะ Safari บนมือถือเคยวางตัวอักษรไปกองมุมขวาล่างตอนใช้ center/middle */
    function fitGlyph(item) {
      const probe = 100;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.font = fontStr(item, probe);
      let m = ctx.measureText(item.glyph);
      const inkW = (m.actualBoundingBoxLeft + m.actualBoundingBoxRight) || probe * 0.6;
      const inkH = (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) || probe * 0.7;
      const px = Math.floor(probe * (size * 0.68) / Math.max(inkW, inkH));
      const font = fontStr(item, px);
      ctx.font = font;
      m = ctx.measureText(item.glyph);
      // หมึกอยู่ช่วง [x - left, x + right] และ [y - ascent, y + descent] เลื่อนให้กึ่งกลางตรงกลางกระดาน
      glyphPos = {
        font,
        x: size / 2 - (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2,
        y: size / 2 + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2,
      };
    }

    function layout() {
      const box = Math.min($wrap.clientWidth, $wrap.clientHeight, window.innerWidth - 24, 460);
      size = Math.max(180, Math.floor(box));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      $pad.width = size * dpr;
      $pad.height = size * dpr;
      $pad.style.width = size + 'px';
      $pad.style.height = size + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paint.width = size;
      paint.height = size;
    }

    function drawGuide(item) {
      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, size, size);
      ctx.font = glyphPos.font;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#e6dcef';
      ctx.fillText(item.glyph, glyphPos.x, glyphPos.y);
      // เส้นประรอบขอบตัวอักษร ให้ดูเหมือนแบบฝึกคัด
      ctx.strokeStyle = '#b08cff';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.strokeText(item.glyph, glyphPos.x, glyphPos.y);
      ctx.setLineDash([]);
    }

    function buildMask(item) {
      pctx.clearRect(0, 0, size, size);
      pctx.font = glyphPos.font;
      pctx.textAlign = 'left';
      pctx.textBaseline = 'alphabetic';
      pctx.fillStyle = '#000';
      pctx.fillText(item.glyph, glyphPos.x, glyphPos.y);
      const data = pctx.getImageData(0, 0, size, size).data;
      maskPoints = [];
      const step = 3;
      for (let y = 0; y < size; y += step) {
        for (let x = 0; x < size; x += step) {
          if (data[(y * size + x) * 4 + 3] > 40) maskPoints.push(x, y);
        }
      }
      pctx.clearRect(0, 0, size, size);
    }

    function coverage() {
      if (!maskPoints.length) return 0;
      const data = pctx.getImageData(0, 0, size, size).data;
      let hit = 0;
      for (let i = 0; i < maskPoints.length; i += 2) {
        if (data[(maskPoints[i + 1] * size + maskPoints[i]) * 4 + 3] > 0) hit++;
      }
      return hit / (maskPoints.length / 2);
    }

    function pos(e) {
      const r = $pad.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    function strokeStyle(target, width) {
      target.lineCap = 'round';
      target.lineJoin = 'round';
      target.lineWidth = width;
    }

    // touch-action:none ใน CSS ยังไม่พอบนมือถือบางรุ่น หน้ายังเลื่อนตามนิ้ว ต้องกันที่ touch event ตรงๆ
    const block = (e) => e.preventDefault();
    $pad.addEventListener('touchstart', block, { passive: false });
    $pad.addEventListener('touchmove', block, { passive: false });

    $pad.addEventListener('pointerdown', (e) => {
      if (done) return;
      drawing = true;
      $pad.setPointerCapture(e.pointerId);
      const { x, y } = pos(e);
      // เส้นที่เห็นบาง แต่เส้นที่ใช้ตรวจ (บน paint) กว้างกว่า 2 เท่า
      // ตัวเลขฟอนต์หนามาก ถ้าตรวจด้วยเส้นบางเด็กต้องขีดซ้ำหลายรอบถึงผ่าน
      strokeStyle(ctx, size * 0.075);
      strokeStyle(pctx, size * 0.16);
      ctx.strokeStyle = '#ff8fc0';
      pctx.strokeStyle = '#000';
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 0.01, y); ctx.stroke();
      pctx.beginPath(); pctx.moveTo(x, y); pctx.lineTo(x + 0.01, y); pctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y);
      pctx.beginPath(); pctx.moveTo(x, y);
    });

    $pad.addEventListener('pointermove', (e) => {
      if (!drawing) return;
      const { x, y } = pos(e);
      ctx.lineTo(x, y); ctx.stroke();
      pctx.lineTo(x, y); pctx.stroke();
    });

    const endStroke = () => {
      if (!drawing) return;
      drawing = false;
      if (coverage() >= PASS_RATIO) succeed();
    };
    $pad.addEventListener('pointerup', endStroke);
    $pad.addEventListener('pointercancel', endStroke);

    stage.querySelector('#clear').onclick = () => {
      if (done) return;
      sfx.tap();
      clears++;
      showItem();
    };

    function showItem() {
      const item = { ...items[idx], ...current() };
      layout();
      fitGlyph(item);
      drawGuide(item);
      buildMask(item);
      $ok.hidden = true;
      $prompt.textContent = item.hint;
    }

    async function succeed() {
      done = true;
      const item = items[idx];
      if (clears > 1) missedItem = true;
      $ok.hidden = false;
      sfx.correct();
      cheerBuddy(stage);
      confetti(stage, 20);
      sayBubble(stage, pick(['เขียนสวยมาก!', 'เก่งจัง!', 'ได้แล้ว 🌟']));
      await Promise.all([wait(1400), speak(current().say, item.lang)]);

      clears = 0;
      done = false;
      part++;
      if (part < item.parts.length) {
        showItem();
        speak(current().say, item.lang);
        return;
      }

      if (!missedItem) firstTry++;
      missedItem = false;
      part = 0;
      idx++;
      if (idx >= items.length) {
        hooks.onProgress?.(items.length, items.length);
        resolve({ firstTry, total: items.length });
      } else {
        hooks.onProgress?.(idx, items.length);
        showItem();
        speak(current().say, items[idx].lang);
      }
    }

    hooks.onProgress?.(0, items.length);
    showItem();
    speak(current().say, items[0].lang);
  });
}
