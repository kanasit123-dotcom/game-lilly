import { pick, shuffle, wait, confetti, sayBubble, cheerBuddy, buddyHTML } from '../utils.js';
import { sfx, speak } from '../audio.js';

/* เกมโยงเส้นจับคู่ แบบใบงานอนุบาล: ลากนิ้วจากซ้ายไปขวา (หรือแตะ-แตะ ถ้าลากยาก) */

const PER_ROUND = 3;

/* ของที่คู่กัน — ใช้ด้วยกัน/เข้ากัน */
const SET_PAIRS = [
  { a: { e: '🐝', name: 'ผึ้ง' }, b: { e: '🍯', name: 'น้ำผึ้ง' } },
  { a: { e: '🐔', name: 'ไก่' }, b: { e: '🥚', name: 'ไข่' } },
  { a: { e: '🐄', name: 'วัว' }, b: { e: '🥛', name: 'นม' } },
  { a: { e: '🌧️', name: 'ฝน' }, b: { e: '☂️', name: 'ร่ม' } },
  { a: { e: '🔑', name: 'กุญแจ' }, b: { e: '🔒', name: 'แม่กุญแจ' } },
  { a: { e: '🦷', name: 'ฟัน' }, b: { e: '🪥', name: 'แปรงสีฟัน' } },
  { a: { e: '🦶', name: 'เท้า' }, b: { e: '🧦', name: 'ถุงเท้า' } },
  { a: { e: '🐶', name: 'หมา' }, b: { e: '🦴', name: 'กระดูก' } },
  { a: { e: '🐵', name: 'ลิง' }, b: { e: '🍌', name: 'กล้วย' } },
  { a: { e: '🐰', name: 'กระต่าย' }, b: { e: '🥕', name: 'แครอท' } },
  { a: { e: '🐭', name: 'หนู' }, b: { e: '🧀', name: 'ชีส' } },
  { a: { e: '✏️', name: 'ดินสอ' }, b: { e: '📓', name: 'สมุด' } },
  { a: { e: '🎂', name: 'เค้ก' }, b: { e: '🕯️', name: 'เทียน' } },
  { a: { e: '⚽', name: 'ลูกบอล' }, b: { e: '🥅', name: 'ประตู' } },
  { a: { e: '🐢', name: 'เต่า' }, b: { e: '🌊', name: 'ทะเล' } },
  { a: { e: '🦭', name: 'แมวน้ำ' }, b: { e: '🐟', name: 'ปลา' } },
];

/* ใครใช้อะไร — อาชีพกับของที่ใช้ทำงาน */
const SET_JOBS = [
  { a: { e: '👩‍⚕️', name: 'หมอ' }, b: { e: '💉', name: 'เข็มฉีดยา' } },
  { a: { e: '👨‍🍳', name: 'พ่อครัว' }, b: { e: '🍳', name: 'กระทะ' } },
  { a: { e: '👮', name: 'ตำรวจ' }, b: { e: '🚓', name: 'รถตำรวจ' } },
  { a: { e: '👨‍🚒', name: 'นักดับเพลิง' }, b: { e: '🚒', name: 'รถดับเพลิง' } },
  { a: { e: '🧑‍🌾', name: 'ชาวนา' }, b: { e: '🚜', name: 'รถไถ' } },
  { a: { e: '👩‍🏫', name: 'คุณครู' }, b: { e: '📚', name: 'หนังสือ' } },
  { a: { e: '👷', name: 'ช่างก่อสร้าง' }, b: { e: '🔨', name: 'ค้อน' } },
  { a: { e: '🧑‍✈️', name: 'นักบิน' }, b: { e: '✈️', name: 'เครื่องบิน' } },
  { a: { e: '🧑‍🎨', name: 'ศิลปิน' }, b: { e: '🎨', name: 'สี' } },
  { a: { e: '👨‍🔧', name: 'ช่างซ่อม' }, b: { e: '🔧', name: 'ประแจ' } },
  { a: { e: '🧑‍🚀', name: 'นักบินอวกาศ' }, b: { e: '🚀', name: 'จรวด' } },
];

/* ตรงข้ามกัน */
const SET_OPPOSITES = [
  { a: { e: '☀️', name: 'กลางวัน' }, b: { e: '🌙', name: 'กลางคืน' } },
  { a: { e: '🔥', name: 'ร้อน' }, b: { e: '🧊', name: 'เย็น' } },
  { a: { e: '🐘', name: 'ใหญ่' }, b: { e: '🐭', name: 'เล็ก' } },
  { a: { e: '😀', name: 'ยิ้ม' }, b: { e: '😢', name: 'ร้องไห้' } },
  { a: { e: '⬆️', name: 'ขึ้น' }, b: { e: '⬇️', name: 'ลง' } },
  { a: { e: '🐢', name: 'ช้า' }, b: { e: '🐇', name: 'เร็ว' } },
  { a: { e: '🔓', name: 'เปิด' }, b: { e: '🔒', name: 'ปิด' } },
  { a: { e: '🌕', name: 'สว่าง' }, b: { e: '🌑', name: 'มืด' } },
  { a: { e: '📖', name: 'เปิดหนังสือ' }, b: { e: '📕', name: 'ปิดหนังสือ' } },
];

const SETS = { pairs: SET_PAIRS, jobs: SET_JOBS, opposites: SET_OPPOSITES };
const PROMPTS = {
  pairs: 'ลากเส้นจับคู่ของที่เข้ากัน',
  jobs: 'ใครใช้ของอะไร ลากเส้นจับคู่',
  opposites: 'ลากเส้นจับคู่ที่ตรงข้ามกัน',
};

export function play(stage, config, hooks = {}) {
  return new Promise((resolve) => {
    const deck = shuffle(SETS[config.set] || SETS.pairs);
    const rounds = Math.min(config.rounds, Math.floor(deck.length / PER_ROUND));
    const totalPairs = rounds * PER_ROUND;
    const promptText = PROMPTS[config.set] || PROMPTS.pairs;

    let roundIdx = 0;
    let roundPairs = [];
    let matchedTotal = 0;
    let matchedInRound = 0;
    let firstTry = 0;
    let locked = false;
    let drag = null;
    let selected = null;
    let tempLine = null;
    let doneLines = {};
    let wrongKeys = new Set();

    stage.innerHTML = `
      <div class="prompt" id="prompt">${promptText}</div>
      <div class="connect-area" id="area">
        <svg class="connect-lines" id="lines"></svg>
        <div class="connect-col left" id="left"></div>
        <div class="connect-col right" id="right"></div>
      </div>
      ${buddyHTML()}`;

    const $prompt = stage.querySelector('#prompt');
    const $area = stage.querySelector('#area');
    const $svg = stage.querySelector('#lines');
    const $left = stage.querySelector('#left');
    const $right = stage.querySelector('#right');

    /* สุ่มลำดับฝั่งขวาให้ต่างจากลำดับฝั่งซ้าย (ซึ่งเรียงตาม key 0..n-1) */
    function shuffledOrder(n) {
      if (n <= 1) return [...Array(n).keys()];
      let order;
      do { order = shuffle([...Array(n).keys()]); } while (order.every((v, i) => v === i));
      return order;
    }

    function itemHTML(key, side) {
      return `<button type="button" class="connect-item" data-key="${key}"><span class="ci-emoji">${side.e}</span><span class="ci-name">${side.name}</span></button>`;
    }

    function renderRound() {
      matchedInRound = 0;
      selected = null;
      locked = false;
      wrongKeys = new Set();
      doneLines = {};

      roundPairs = deck.slice(roundIdx * PER_ROUND, roundIdx * PER_ROUND + PER_ROUND);
      const rightOrder = shuffledOrder(roundPairs.length);

      $prompt.textContent = promptText;
      $svg.innerHTML = '';
      $left.innerHTML = roundPairs.map((p, i) => itemHTML(i, p.a)).join('');
      $right.innerHTML = rightOrder.map((i) => itemHTML(i, roundPairs[i].b)).join('');

      $left.querySelectorAll('.connect-item').forEach((el) => {
        el.addEventListener('pointerdown', (e) => onPointerDown(e, el, 'left'));
      });
      $right.querySelectorAll('.connect-item').forEach((el) => {
        el.addEventListener('pointerdown', (e) => onPointerDown(e, el, 'right'));
      });
    }

    /* ---- ตำแหน่งจุดยึดปลายเส้น: กึ่งกลางขอบด้านในของปุ่ม (พิกัดสัมพัทธ์กับ area) ---- */
    function anchorOf(el, side) {
      const r = el.getBoundingClientRect();
      const a = $area.getBoundingClientRect();
      const x = side === 'left' ? r.right - a.left : r.left - a.left;
      const y = r.top - a.top + r.height / 2;
      return { x, y };
    }

    function areaPoint(clientX, clientY) {
      const a = $area.getBoundingClientRect();
      return { x: clientX - a.left, y: clientY - a.top };
    }

    function sideOf(el) {
      if (el.closest('.connect-col.left')) return 'left';
      if (el.closest('.connect-col.right')) return 'right';
      return null;
    }

    function targetAt(clientX, clientY, fromSide) {
      const el = document.elementFromPoint(clientX, clientY)?.closest('.connect-item');
      if (!el) return null;
      if (sideOf(el) === fromSide) return null;
      if (el.classList.contains('solved')) return null;
      return el;
    }

    function clearHover() {
      $left.querySelectorAll('.hover-target').forEach((b) => b.classList.remove('hover-target'));
      $right.querySelectorAll('.hover-target').forEach((b) => b.classList.remove('hover-target'));
    }

    function makeLine(cls, x1, y1, x2, y2) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.classList.add(cls);
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      $svg.appendChild(line);
      return line;
    }

    function removeTempLine() {
      tempLine?.remove();
      tempLine = null;
    }

    /* ---- ลากด้วยนิ้ว/เมาส์ ---- */
    function onPointerDown(e, el, side) {
      if (locked || el.classList.contains('solved') || drag) return;
      e.preventDefault();
      const key = el.dataset.key;
      try { el.setPointerCapture(e.pointerId); } catch { /* บางเบราว์เซอร์เก่าไม่รองรับ ข้ามไปเงียบๆ */ }
      drag = { key, side, el, pointerId: e.pointerId, x0: e.clientX, y0: e.clientY, moved: 0 };
      el.classList.add('selected');
      const p0 = anchorOf(el, side);
      tempLine = makeLine('temp', p0.x, p0.y, p0.x, p0.y);
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
      document.addEventListener('pointercancel', onPointerUp);
    }

    function onPointerMove(e) {
      if (!drag || e.pointerId !== drag.pointerId) return;
      const dx = e.clientX - drag.x0;
      const dy = e.clientY - drag.y0;
      drag.moved = Math.max(drag.moved, Math.hypot(dx, dy));
      const pt = areaPoint(e.clientX, e.clientY);
      tempLine?.setAttribute('x2', pt.x);
      tempLine?.setAttribute('y2', pt.y);
      clearHover();
      targetAt(e.clientX, e.clientY, drag.side)?.classList.add('hover-target');
    }

    function onPointerUp(e) {
      if (!drag || e.pointerId !== drag.pointerId) return;
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('pointercancel', onPointerUp);

      const { key, side, el, moved } = drag;
      drag = null;
      el.classList.remove('selected');
      clearHover();

      if (moved < 10) {
        removeTempLine();
        handleTap(el, side, key);
        return;
      }

      // ลากจริง: ทิ้งอันที่แตะเลือกค้างไว้ก่อนหน้า (ถ้ามี) ไม่ให้ค้างสองอัน
      if (selected) { selected.el.classList.remove('selected'); selected = null; }
      const hit = targetAt(e.clientX, e.clientY, side);
      if (!hit) { removeTempLine(); return; }
      settleAttempt(el, side, key, hit);
    }

    /* ---- แตะ-แตะ สำรอง (เผื่อเด็กลากไม่ถนัด) ---- */
    function handleTap(el, side, key) {
      if (locked || el.classList.contains('solved')) return;
      sfx.tap();
      if (selected && selected.el === el) {
        selected.el.classList.remove('selected');
        selected = null;
        return;
      }
      if (selected && selected.side === side) {
        selected.el.classList.remove('selected');
        selected = { el, side, key };
        el.classList.add('selected');
        return;
      }
      if (selected) {
        const from = selected;
        selected = null;
        from.el.classList.remove('selected');
        const p1 = anchorOf(from.el, from.side);
        const p2 = anchorOf(el, side);
        tempLine = makeLine('temp', p1.x, p1.y, p2.x, p2.y);
        settleAttempt(from.el, from.side, from.key, el);
        return;
      }
      selected = { el, side, key };
      el.classList.add('selected');
    }

    /* ---- ตัดสินคู่ที่ลาก/แตะมาว่าใช่หรือไม่ ---- */
    async function settleAttempt(sourceEl, sourceSide, sourceKey, targetEl) {
      const targetKey = targetEl.dataset.key;
      removeTempLine();

      if (targetKey !== sourceKey) {
        wrongKeys.add(sourceKey);
        wrongKeys.add(targetKey);
        sfx.retry();
        targetEl.classList.remove('nope');
        void targetEl.offsetWidth;
        targetEl.classList.add('nope');
        sayBubble(stage, pick(['ยังไม่ใช่คู่นี้นะ ลองอีกที!', 'ลองเส้นอื่นดูสิ 💪', 'เกือบแล้ว!']));
        return;
      }

      const leftEl = $left.querySelector(`.connect-item[data-key="${sourceKey}"]`);
      const rightEl = $right.querySelector(`.connect-item[data-key="${sourceKey}"]`);
      leftEl.classList.add('solved');
      rightEl.classList.add('solved');
      const p1 = anchorOf(leftEl, 'left');
      const p2 = anchorOf(rightEl, 'right');
      doneLines[sourceKey] = makeLine('done', p1.x, p1.y, p2.x, p2.y);

      if (!wrongKeys.has(sourceKey)) firstTry++;
      matchedTotal++;
      matchedInRound++;
      hooks.onProgress?.(matchedTotal, totalPairs);

      sfx.correct();
      cheerBuddy(stage);
      const pair = roundPairs[sourceKey];
      const say = config.set === 'opposites'
        ? `${pair.a.name} ตรงข้ามกับ ${pair.b.name}`
        : `${pair.a.name} กับ ${pair.b.name}`;
      speak(say);
      sayBubble(stage, pick(['เก่งมาก!', 'ถูกต้อง!', 'ใช่เลย 🌟']));

      if (matchedInRound < PER_ROUND) return;

      locked = true;
      confetti(stage, 24);
      $prompt.textContent = 'ครบทุกคู่แล้ว เยี่ยมมาก! 🎉';
      await wait(1600);

      roundIdx++;
      if (roundIdx >= rounds) finish();
      else renderRound();
    }

    /* ---- จอหมุน/ปรับขนาด: คำนวณเส้นที่จับคู่แล้วใหม่จาก key ---- */
    function onResize() {
      if (!stage.isConnected) { window.removeEventListener('resize', onResize); return; }
      Object.keys(doneLines).forEach((key) => {
        const leftEl = $left.querySelector(`.connect-item[data-key="${key}"]`);
        const rightEl = $right.querySelector(`.connect-item[data-key="${key}"]`);
        const line = doneLines[key];
        if (!leftEl || !rightEl || !line) return;
        const p1 = anchorOf(leftEl, 'left');
        const p2 = anchorOf(rightEl, 'right');
        line.setAttribute('x1', p1.x);
        line.setAttribute('y1', p1.y);
        line.setAttribute('x2', p2.x);
        line.setAttribute('y2', p2.y);
      });
    }
    window.addEventListener('resize', onResize);

    /* กัน Safari เลื่อนหน้าตามนิ้วตอนลากเส้น */
    $area.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
    $area.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

    function finish() {
      window.removeEventListener('resize', onResize);
      resolve({ firstTry, total: totalPairs });
    }

    hooks.onProgress?.(0, totalPairs);
    renderRound();
  });
}
