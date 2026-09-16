import { pick, confetti, sayBubble, cheerBuddy, buddyHTML } from '../utils.js';
import { sfx, speak } from '../audio.js';
import { getMini, setMini } from '../state.js';

/* ฝึกเขียนอักษรอิสระ: ไม่ตรวจว่าลากตามรอยหรือไม่ เด็กเขียนในกรอบเอง
   โหมดตัวอย่างจะวางตัวอักษรจางๆ ในกรอบ ส่วนโหมดไม่มีตัวอย่างเหลือแค่เส้นบรรทัด */

const THAI = [
  ['ก', 'กอ ไก่'], ['ข', 'ขอ ไข่'], ['ฃ', 'ขอ ขวด'], ['ค', 'คอ ควาย'], ['ฅ', 'คอ คน'], ['ฆ', 'ฆอ ระฆัง'],
  ['ง', 'งอ งู'], ['จ', 'จอ จาน'], ['ฉ', 'ฉอ ฉิ่ง'], ['ช', 'ชอ ช้าง'], ['ซ', 'ซอ โซ่'], ['ฌ', 'ฌอ เฌอ'],
  ['ญ', 'ญอ หญิง'], ['ฎ', 'ฎอ ชฎา'], ['ฏ', 'ฏอ ปฏัก'], ['ฐ', 'ฐอ ฐาน'], ['ฑ', 'ฑอ มณโฑ'], ['ฒ', 'ฒอ ผู้เฒ่า'],
  ['ณ', 'ณอ เณร'], ['ด', 'ดอ เด็ก'], ['ต', 'ตอ เต่า'], ['ถ', 'ถอ ถุง'], ['ท', 'ทอ ทหาร'], ['ธ', 'ธอ ธง'],
  ['น', 'นอ หนู'], ['บ', 'บอ ใบไม้'], ['ป', 'ปอ ปลา'], ['ผ', 'ผอ ผึ้ง'], ['ฝ', 'ฝอ ฝา'], ['พ', 'พอ พาน'],
  ['ฟ', 'ฟอ ฟัน'], ['ภ', 'ภอ สำเภา'], ['ม', 'มอ ม้า'], ['ย', 'ยอ ยักษ์'], ['ร', 'รอ เรือ'], ['ล', 'ลอ ลิง'],
  ['ว', 'วอ แหวน'], ['ศ', 'ศอ ศาลา'], ['ษ', 'ษอ ฤๅษี'], ['ส', 'สอ เสือ'], ['ห', 'หอ หีบ'], ['ฬ', 'ฬอ จุฬา'],
  ['อ', 'ออ อ่าง'], ['ฮ', 'ฮอ นกฮูก'],
].map(([ch, say]) => ({ ch, say, lang: 'th-TH' }));

const EN_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((ch) => ({ ch, say: ch, lang: 'en-US' }));
const EN_LOWER = 'abcdefghijklmnopqrstuvwxyz'.split('').map((ch) => ({ ch, say: ch, lang: 'en-US' }));

const SETS = {
  thai: { title: 'ไทย', icon: 'ก', kind: 'thai', items: THAI },
  upper: { title: 'ABC', icon: 'A', kind: 'upper', items: EN_UPPER },
  lower: { title: 'abc', icon: 'a', kind: 'lower', items: EN_LOWER },
};

const CHEERS = ['เขียนสวยมาก!', 'มือเก่งจัง!', 'เยี่ยมเลย!', 'ค่อยๆ เขียนได้ดีมาก!'];
const STROKE = '#d9648a';

const emptyDone = () => ({ thai: [], upper: [], lower: [] });
const initialState = () => ({
  set: 'thai',
  mode: 'sample',
  index: { thai: 0, upper: 0, lower: 0 },
  done: emptyDone(),
});

export function mount(stage, cfg = {}) {
  let saved = { ...initialState(), ...(getMini('writing') || {}) };
  saved.index = { ...initialState().index, ...(saved.index || {}) };
  saved.done = { ...emptyDone(), ...(saved.done || {}) };
  if (!SETS[saved.set]) saved.set = 'thai';
  if (!['sample', 'blank'].includes(saved.mode)) saved.mode = 'sample';

  stage.innerHTML = `
    <div class="mini-top writing-tabs" id="writing-sets">
      ${Object.entries(SETS).map(([id, set]) => `
        <button class="writing-tab" data-writing-set="${id}" aria-label="${set.title}">
          <b>${set.icon}</b><span>${set.title}</span>
        </button>`).join('')}
    </div>
    <div class="mini-top writing-modes" id="writing-modes">
      <button class="writing-mode" data-writing-mode="sample"><span>👀</span><b>มีตัวอย่าง</b></button>
      <button class="writing-mode" data-writing-mode="blank"><span>✍️</span><b>ไม่มีตัวอย่าง</b></button>
      <button class="writing-sound" id="writing-sound" aria-label="ฟังเสียงตัวอักษร">🔊</button>
    </div>
    <div class="writing-current">
      <button class="icon-btn writing-nav" id="writing-prev" aria-label="ตัวก่อนหน้า">‹</button>
      <button class="writing-card" id="writing-current-card" aria-label="ฟังเสียงตัวอักษร">
        <span id="writing-char"></span>
        <small id="writing-say"></small>
      </button>
      <button class="icon-btn writing-nav" id="writing-next" aria-label="ตัวถัดไป">›</button>
    </div>
    <div class="writing-wrap" id="writing-wrap">
      <canvas id="writing-pad"></canvas>
      <div class="writing-pop" id="writing-pop" hidden>✓</div>
    </div>
    <div class="writing-rail" id="writing-rail" aria-label="ตัวอักษรทั้งหมด"></div>
    <div class="mini-actions writing-actions">
      <button class="btn blue" id="writing-clear">ล้าง 🧽</button>
      <button class="btn green" id="writing-done">เสร็จแล้ว ✅</button>
    </div>
    ${buddyHTML()}`;

  const $wrap = stage.querySelector('#writing-wrap');
  const $pad = stage.querySelector('#writing-pad');
  const $rail = stage.querySelector('#writing-rail');
  const $pop = stage.querySelector('#writing-pop');
  const $char = stage.querySelector('#writing-char');
  const $say = stage.querySelector('#writing-say');
  const ctx = $pad.getContext('2d');
  const ink = document.createElement('canvas');
  const inkCtx = ink.getContext('2d');

  let cssW = 280;
  let cssH = 340;
  let dpr = 1;
  let main = { x: 0, y: 0, size: 0 };
  let drawing = false;
  let lastPoint = null;
  let stopped = false;

  const activeSet = () => SETS[saved.set];
  const items = () => activeSet().items;
  const currentIndex = () => Math.min(saved.index[saved.set] || 0, items().length - 1);
  const current = () => items()[currentIndex()];
  const doneList = () => saved.done[saved.set] || [];
  const persist = () => setMini('writing', saved);

  function fitIndex() {
    saved.index[saved.set] = Math.max(0, Math.min(saved.index[saved.set] || 0, items().length - 1));
  }

  function isDone(ch) {
    return doneList().includes(ch);
  }

  function speakCurrent() {
    const item = current();
    return speak(item.say, item.lang);
  }

  function clearInk() {
    inkCtx.clearRect(0, 0, cssW, cssH);
    $pop.hidden = true;
    renderBoard();
  }

  function labelFor(item) {
    if (activeSet().kind === 'thai') return item.say;
    return activeSet().kind === 'upper' ? `${item.ch} ตัวใหญ่` : `${item.ch} ตัวเล็ก`;
  }

  function renderControls() {
    fitIndex();
    const item = current();
    stage.querySelectorAll('[data-writing-set]').forEach((b) => {
      b.classList.toggle('on', b.dataset.writingSet === saved.set);
    });
    stage.querySelectorAll('[data-writing-mode]').forEach((b) => {
      b.classList.toggle('on', b.dataset.writingMode === saved.mode);
    });
    $char.textContent = item.ch;
    $say.textContent = labelFor(item);
    $rail.innerHTML = items().map((it, i) => `
      <button class="writing-letter${i === currentIndex() ? ' on' : ''}${isDone(it.ch) ? ' done' : ''}"
              data-i="${i}" aria-label="${labelFor(it)}">
        ${it.ch}${isDone(it.ch) ? '<span>✓</span>' : ''}
      </button>`).join('');
    $rail.querySelectorAll('[data-i]').forEach((b) => {
      b.onclick = () => {
        sfx.tap();
        saved.index[saved.set] = Number(b.dataset.i);
        persist();
        clearInk();
        renderControls();
        speakCurrent();
      };
    });
  }

  function fontFor(px) {
    if (activeSet().kind === 'thai') return `${px}px Itim, sans-serif`;
    return `600 ${px}px Fredoka, Itim, sans-serif`;
  }

  function samplePosition(item) {
    const target = main.size * (activeSet().kind === 'lower' ? 0.64 : 0.72);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.font = fontFor(100);
    let m = ctx.measureText(item.ch);
    const inkW = (m.actualBoundingBoxLeft + m.actualBoundingBoxRight) || 60;
    const inkH = (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) || 75;
    const px = Math.floor(100 * target / Math.max(inkW, inkH));
    ctx.font = fontFor(px);
    m = ctx.measureText(item.ch);
    return {
      font: fontFor(px),
      x: main.x + main.size / 2 - (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2,
      y: main.y + main.size / 2 + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2,
    };
  }

  function drawGuideLines() {
    const kind = activeSet().kind;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, cssW, cssH);

    if (kind === 'thai') {
      ctx.fillStyle = '#f7fbf8';
      ctx.fillRect(main.x, 0, main.size, main.y);
      ctx.fillRect(main.x, main.y + main.size, main.size, cssH - (main.y + main.size));
    }

    ctx.strokeStyle = '#cfe0da';
    ctx.lineWidth = 3;
    ctx.strokeRect(main.x, main.y, main.size, main.size);

    ctx.strokeStyle = '#e5ece9';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(main.x, main.y + main.size * 0.5);
    ctx.lineTo(main.x + main.size, main.y + main.size * 0.5);
    ctx.stroke();
    ctx.setLineDash([]);

    if (kind === 'thai') {
      ctx.strokeStyle = '#d9cbea';
      ctx.setLineDash([6, 7]);
      ctx.beginPath();
      ctx.moveTo(main.x, main.y);
      ctx.lineTo(main.x + main.size, main.y);
      ctx.moveTo(main.x, main.y + main.size);
      ctx.lineTo(main.x + main.size, main.y + main.size);
      ctx.stroke();
      ctx.setLineDash([]);
      return;
    }

    const cap = main.y + main.size * 0.18;
    const mid = main.y + main.size * 0.48;
    const base = main.y + main.size * 0.72;
    const desc = main.y + main.size * 0.9;
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#d9cbea';
    ctx.beginPath();
    ctx.moveTo(main.x, cap);
    ctx.lineTo(main.x + main.size, cap);
    ctx.moveTo(main.x, base);
    ctx.lineTo(main.x + main.size, base);
    ctx.stroke();
    ctx.setLineDash([5, 8]);
    ctx.beginPath();
    ctx.moveTo(main.x, mid);
    ctx.lineTo(main.x + main.size, mid);
    ctx.moveTo(main.x, desc);
    ctx.lineTo(main.x + main.size, desc);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawSample() {
    if (saved.mode !== 'sample') return;
    const item = current();
    const pos = samplePosition(item);
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.font = pos.font;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#6f5487';
    ctx.fillText(item.ch, pos.x, pos.y);
    ctx.globalAlpha = 0.65;
    ctx.strokeStyle = '#b08cff';
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 7]);
    ctx.strokeText(item.ch, pos.x, pos.y);
    ctx.restore();
  }

  function renderBoard() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawGuideLines();
    drawSample();
    ctx.drawImage(ink, 0, 0, cssW, cssH);
  }

  function layout() {
    const ratio = activeSet().kind === 'thai' ? 1.24 : 1.08;
    const maxW = Math.min($wrap.clientWidth || 320, 520);
    const maxH = Math.max(210, $wrap.clientHeight || 320);
    cssW = Math.floor(Math.max(210, Math.min(maxW, maxH / ratio)));
    cssH = Math.floor(cssW * ratio);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    $pad.width = Math.round(cssW * dpr);
    $pad.height = Math.round(cssH * dpr);
    $pad.style.width = cssW + 'px';
    $pad.style.height = cssH + 'px';
    ink.width = cssW;
    ink.height = cssH;
    const margin = cssW * 0.045;
    main = {
      x: margin,
      y: activeSet().kind === 'thai' ? cssH * 0.1 : (cssH - (cssW - margin * 2)) / 2,
      size: cssW - margin * 2,
    };
    clearInk();
  }

  function point(e) {
    const r = $pad.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function prepStroke(target) {
    target.lineCap = 'round';
    target.lineJoin = 'round';
    target.lineWidth = Math.max(12, cssW * 0.055);
    target.strokeStyle = STROKE;
  }

  function strokeTo(p) {
    prepStroke(ctx);
    prepStroke(inkCtx);
    if (!lastPoint) lastPoint = p;
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    inkCtx.beginPath();
    inkCtx.moveTo(lastPoint.x, lastPoint.y);
    inkCtx.lineTo(p.x, p.y);
    inkCtx.stroke();
    lastPoint = p;
  }

  const blockTouch = (e) => e.preventDefault();
  $pad.addEventListener('touchstart', blockTouch, { passive: false });
  $pad.addEventListener('touchmove', blockTouch, { passive: false });

  $pad.addEventListener('pointerdown', (e) => {
    drawing = true;
    $pad.setPointerCapture(e.pointerId);
    const p = point(e);
    lastPoint = p;
    strokeTo({ x: p.x + 0.01, y: p.y + 0.01 });
  });
  $pad.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    strokeTo(point(e));
  });
  const endStroke = () => {
    drawing = false;
    lastPoint = null;
  };
  $pad.addEventListener('pointerup', endStroke);
  $pad.addEventListener('pointercancel', endStroke);

  stage.querySelector('#writing-clear').onclick = () => {
    sfx.retry();
    clearInk();
    sayBubble(stage, 'ลองเขียนใหม่ได้เลย ✨');
  };

  stage.querySelector('#writing-done').onclick = () => {
    const item = current();
    if (!isDone(item.ch)) saved.done[saved.set] = [...doneList(), item.ch];
    sfx.correct();
    $pop.hidden = false;
    cheerBuddy(stage);
    confetti(stage, 18);
    sayBubble(stage, pick(CHEERS));
    persist();
    renderControls();
    speakCurrent();

    const allDone = doneList().length >= items().length;
    if (allDone) {
      setTimeout(() => {
        if (stopped || !stage.isConnected) return;
        speak('เขียนครบทุกตัวแล้ว เก่งมาก');
        cfg.onComplete?.();
      }, 900);
      return;
    }

    const next = items().findIndex((it, i) => i > currentIndex() && !isDone(it.ch));
    saved.index[saved.set] = next >= 0 ? next : items().findIndex((it) => !isDone(it.ch));
    persist();
    setTimeout(() => {
      if (stopped || !stage.isConnected) return;
      clearInk();
      renderControls();
      speakCurrent();
    }, 900);
  };

  stage.querySelector('#writing-sound').onclick = () => { sfx.tap(); speakCurrent(); };
  stage.querySelector('#writing-current-card').onclick = () => { sfx.tap(); speakCurrent(); };
  stage.querySelector('#writing-prev').onclick = () => {
    sfx.tap();
    saved.index[saved.set] = (currentIndex() + items().length - 1) % items().length;
    persist();
    clearInk();
    renderControls();
    speakCurrent();
  };
  stage.querySelector('#writing-next').onclick = () => {
    sfx.tap();
    saved.index[saved.set] = (currentIndex() + 1) % items().length;
    persist();
    clearInk();
    renderControls();
    speakCurrent();
  };
  stage.querySelectorAll('[data-writing-set]').forEach((b) => {
    b.onclick = () => {
      sfx.tap();
      saved.set = b.dataset.writingSet;
      fitIndex();
      persist();
      clearInk();
      renderControls();
      layout();
      speakCurrent();
    };
  });
  stage.querySelectorAll('[data-writing-mode]').forEach((b) => {
    b.onclick = () => {
      sfx.tap();
      saved.mode = b.dataset.writingMode;
      persist();
      renderControls();
      renderBoard();
      speak(saved.mode === 'sample' ? 'มีตัวอย่าง' : 'ไม่มีตัวอย่าง');
    };
  });

  const onResize = () => {
    if (!stage.isConnected) { window.removeEventListener('resize', onResize); return; }
    layout();
    renderControls();
  };
  window.addEventListener('resize', onResize);

  renderControls();
  requestAnimationFrame(() => {
    if (!stage.isConnected) return;
    layout();
    speak('เลือกตัวอักษร แล้วเขียนในกรอบได้เลย').then(() => speakCurrent());
  });
  document.fonts.ready.then(() => {
    if (!stage.isConnected) return;
    renderBoard();
  });

  return () => {
    stopped = true;
    endStroke();
    window.removeEventListener('resize', onResize);
  };
}
