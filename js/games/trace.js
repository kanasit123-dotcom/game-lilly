import { pick, wait, confetti, sayBubble, cheerBuddy, buddyHTML } from '../utils.js';
import { sfx, speak } from '../audio.js';
import { THAI_CONSONANTS } from './thai.js';

/* เขียนตัวอักษรตามรอย: ตัวอักษรสีจางเป็นแบบ เด็กลากนิ้วทับ
   ผ่านเมื่อระบายทับตัวอักษรได้มากพอ ไม่จับผิดเรื่องลำดับเส้น เพราะเด็ก 5 ขวบยังไม่ต้องเป๊ะ
   cfg: { set: 'thai1'|'thai2'|'abc'|'digits' } */

const SETS = {
  thai1: pickThai('กงจดตบปม'),
  thai2: pickThai('ขคชนผยรล'),
  abc: 'ABCDEFGH'.split('').map((ch) => ({ glyph: ch, say: ch, lang: 'en-US', font: 'latin' })),
  digits: '0123456789'.split('').map((d) => ({ glyph: d, say: d, lang: 'th-TH', font: 'latin' })),
};

function pickThai(letters) {
  return [...letters].map((ch) => {
    const c = THAI_CONSONANTS.find((x) => x.word === ch);
    return { glyph: ch, say: c.say, hint: `${c.emoji} ${ch} ${c.name}`, lang: 'th-TH', font: 'thai' };
  });
}

const PASS_RATIO = 0.6;

export function play(stage, config, hooks = {}) {
  return new Promise(async (resolve) => {
    const items = SETS[config.set] || SETS.thai1;
    let idx = 0;
    let firstTry = 0;
    let clears = 0;
    let done = false;

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

    // ตัวอักษรไทยมีที่ว่างบน-ล่างสำหรับสระและวรรณยุกต์ ตัวจริงเลยดูเล็ก ต้องขยายเผื่อ
    function fontFor(item) {
      return item.font === 'thai' ? `${size * 0.98}px Itim, sans-serif` : `700 ${size * 0.8}px Fredoka, Itim, sans-serif`;
    }

    function layout() {
      const box = Math.min($wrap.clientWidth, $wrap.clientHeight, 460);
      size = Math.max(200, Math.floor(box));
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
      ctx.font = fontFor(item);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#e6dcef';
      ctx.fillText(item.glyph, size / 2, size / 2);
      // เส้นประรอบขอบตัวอักษร ให้ดูเหมือนแบบฝึกคัด
      ctx.strokeStyle = '#b08cff';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.strokeText(item.glyph, size / 2, size / 2);
      ctx.setLineDash([]);
    }

    function buildMask(item) {
      pctx.clearRect(0, 0, size, size);
      pctx.font = fontFor(item);
      pctx.textAlign = 'center';
      pctx.textBaseline = 'middle';
      pctx.fillStyle = '#000';
      pctx.fillText(item.glyph, size / 2, size / 2);
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

    $pad.addEventListener('pointerdown', (e) => {
      if (done) return;
      drawing = true;
      $pad.setPointerCapture(e.pointerId);
      const { x, y } = pos(e);
      const w = size * 0.11;
      strokeStyle(ctx, w);
      strokeStyle(pctx, w);
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
      const item = items[idx];
      layout();
      drawGuide(item);
      buildMask(item);
      $ok.hidden = true;
      $prompt.textContent = item.hint ? `เขียน ${item.hint}` : `เขียน ${item.glyph}`;
    }

    async function succeed() {
      done = true;
      const item = items[idx];
      if (clears <= 1) firstTry++;
      $ok.hidden = false;
      sfx.correct();
      cheerBuddy(stage);
      confetti(stage, 20);
      speak(item.say, item.lang);
      sayBubble(stage, pick(['เขียนสวยมาก!', 'เก่งจัง!', 'ได้แล้ว 🌟']));
      await wait(1400);

      idx++;
      clears = 0;
      done = false;
      if (idx >= items.length) {
        hooks.onProgress?.(items.length, items.length);
        resolve({ firstTry, total: items.length });
      } else {
        hooks.onProgress?.(idx, items.length);
        showItem();
        speak(items[idx].say, items[idx].lang);
      }
    }

    hooks.onProgress?.(0, items.length);
    showItem();
    speak(items[0].say, items[0].lang);
  });
}
