import { sayBubble } from '../utils.js';
import { sfx, speak } from '../audio.js';
import { getMini, setMini } from '../state.js';

/* กระดานวาดรูปอิสระ: เลือกสีแล้วลากนิ้ววาด หรือแตะแสตมป์แล้วแตะบนกระดานเพื่อวาง
   ยางลบวาดทับด้วยสีขาวเส้นหนา บันทึกเป็นรูป (jpeg) ทุกครั้งที่วาดเสร็จ กลับมาเปิดใหม่ก็วาดต่อได้ */

const COLORS = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#9775fa', '#f783ac', '#4a3b52'];
const COLOR_NAMES = ['แดง', 'ส้ม', 'เหลือง', 'เขียว', 'ฟ้า', 'ม่วง', 'ชมพู', 'ม่วงเข้ม'];
const DEFAULT_COLOR = '#f783ac';
const STAMPS = ['🐢', '🦭', '🐱', '⭐', '🌸', '🌈', '🦋', '🍓'];

export function mount(stage, cfg = {}) {
  stage.innerHTML = `
    <div class="mini-top palette" id="palette">
      ${COLORS.map((c, i) => `<button class="swatch${c === DEFAULT_COLOR ? ' on' : ''}" data-c="${c}" style="background:${c}" aria-label="เลือกสี${COLOR_NAMES[i]}"></button>`).join('')}
      <button class="swatch eraser" data-c="#ffffff" title="ยางลบ" aria-label="เลือกยางลบ">🧽</button>
      <span class="palette-gap"></span>
      <button class="swatch brush-size" data-size="s" aria-label="พู่กันเส้นเล็ก">•</button>
      <button class="swatch brush-size on" data-size="l" aria-label="พู่กันเส้นใหญ่">●</button>
    </div>
    <div class="mini-top stamps" id="stamps">
      ${STAMPS.map((e) => `<button class="pic-btn" data-stamp="${e}" aria-label="เลือกตราประทับ ${e}">${e}</button>`).join('')}
    </div>
    <div class="draw-wrap" id="wrap"><canvas id="pad"></canvas></div>
    <div class="mini-actions"><button class="btn blue" id="clear">ล้างกระดาน 🧽</button></div>`;

  const $palette = stage.querySelector('#palette');
  const $stamps = stage.querySelector('#stamps');
  const $wrap = stage.querySelector('#wrap');
  const $pad = stage.querySelector('#pad');
  const ctx = $pad.getContext('2d');

  let mode = 'draw'; // 'draw' | 'eraser' | 'stamp'
  let color = DEFAULT_COLOR;
  let stampEmoji = STAMPS[0];
  let brushSize = 'l';
  let cssW = 0;
  let cssH = 0;
  let shortSide = 200;
  let drawing = false;

  function save() {
    setMini('draw', { img: $pad.toDataURL('image/jpeg', 0.6) });
  }

  // วาดพื้นขาวก่อนเสมอ ไม่งั้น toDataURL jpeg จะกลายเป็นพื้นดำ (canvas โปร่งใสตามค่าเริ่มต้น)
  // แล้วค่อยวาดรูปเดิม (ถ้ามี) ทับยืดเต็มกระดาน เพื่อไม่ให้รูปหายตอน resize/โหลดกลับ
  function layout(prevURL) {
    cssW = Math.min($wrap.clientWidth, 720);
    cssH = Math.max($wrap.clientHeight, 220);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    $pad.width = Math.round(cssW * dpr);
    $pad.height = Math.round(cssH * dpr);
    $pad.style.width = cssW + 'px';
    $pad.style.height = cssH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    shortSide = Math.min(cssW, cssH);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, cssW, cssH);
    if (prevURL) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, cssW, cssH);
      img.src = prevURL;
    }
  }

  function pos(e) {
    const r = $pad.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function lineWidthFor() {
    if (mode === 'eraser') return shortSide * 0.08;
    return shortSide * (brushSize === 's' ? 0.02 : 0.05);
  }

  function placeStamp(x, y) {
    const px = shortSide * 0.16;
    ctx.font = `${px}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(stampEmoji, x, y);
    sfx.tap();
    save();
  }

  function setActiveSwatch(target) {
    $palette.querySelectorAll('.swatch:not(.brush-size)').forEach((b) => b.classList.toggle('on', b === target));
    $stamps.querySelectorAll('.pic-btn').forEach((b) => b.classList.remove('on'));
  }

  function setActiveStamp(target) {
    $stamps.querySelectorAll('.pic-btn').forEach((b) => b.classList.toggle('on', b === target));
    $palette.querySelectorAll('.swatch:not(.brush-size)').forEach((b) => b.classList.remove('on'));
  }

  $palette.querySelectorAll('.swatch:not(.brush-size)').forEach((b) => {
    b.onclick = () => {
      sfx.tap();
      mode = b.classList.contains('eraser') ? 'eraser' : 'draw';
      color = b.dataset.c;
      setActiveSwatch(b);
    };
  });

  $palette.querySelectorAll('.swatch.brush-size').forEach((b) => {
    b.onclick = () => {
      sfx.tap();
      brushSize = b.dataset.size;
      $palette.querySelectorAll('.swatch.brush-size').forEach((x) => x.classList.toggle('on', x === b));
    };
  });

  $stamps.querySelectorAll('.pic-btn').forEach((b) => {
    b.onclick = () => {
      sfx.tap();
      mode = 'stamp';
      stampEmoji = b.dataset.stamp;
      setActiveStamp(b);
    };
  });

  // touch-action:none ใน CSS ยังไม่พอบนมือถือบางรุ่น หน้ายังเลื่อนตามนิ้ว ต้องกันที่ touch event ตรงๆ
  const block = (e) => e.preventDefault();
  $pad.addEventListener('touchstart', block, { passive: false });
  $pad.addEventListener('touchmove', block, { passive: false });

  $pad.addEventListener('pointerdown', (e) => {
    $pad.setPointerCapture(e.pointerId);
    const { x, y } = pos(e);
    if (mode === 'stamp') {
      placeStamp(x, y);
      return;
    }
    drawing = true;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = lineWidthFor();
    ctx.strokeStyle = mode === 'eraser' ? '#ffffff' : color;
    // แตะเฉยๆ ไม่ลาก ก็ต้องเห็นจุด เลยลากเส้นสั้นจิ๋วๆ ไปด้วย (+0.01)
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 0.01, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y);
  });

  $pad.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  });

  const endStroke = () => {
    if (!drawing) return;
    drawing = false;
    save();
  };
  $pad.addEventListener('pointerup', endStroke);
  $pad.addEventListener('pointercancel', endStroke);

  // ผู้ใช้กดกลับได้ตลอด ถอด listener เมื่อ stage หลุดออกจากหน้าแล้ว
  const onResize = () => {
    if (!stage.isConnected) { window.removeEventListener('resize', onResize); return; }
    const prevURL = $pad.toDataURL();
    layout(prevURL);
  };
  window.addEventListener('resize', onResize);

  stage.querySelector('#clear').onclick = () => {
    sfx.retry();
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, cssW, cssH);
    save();
    sayBubble(stage, 'กระดานสะอาดแล้ว วาดใหม่ได้เลย ✨');
  };

  const saved = getMini('draw');
  layout(saved?.img || null);

  speak('วาดรูปได้เลย เลือกสีแล้วลากนิ้ว');
  return () => { endStroke(); window.removeEventListener('resize', onResize); };
}
