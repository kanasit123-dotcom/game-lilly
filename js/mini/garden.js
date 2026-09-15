import { confetti, sayBubble } from '../utils.js';
import { sfx, speak } from '../audio.js';
import { getMini, setMini } from '../state.js';

/* สวนผัก: เลือกเมล็ด → แตะแปลงว่างเพื่อปลูก → แตะรดน้ำจนโต → แตะเก็บใส่ตะกร้า
   stage 0 ว่าง, 1 ต้นอ่อน, 2 ใบ, 3 กำลังออกผล, 4 เก็บได้ */

const SEEDS = [
  { id: 'carrot', emoji: '🥕', name: 'แครอท' },
  { id: 'tomato', emoji: '🍅', name: 'มะเขือเทศ' },
  { id: 'corn', emoji: '🌽', name: 'ข้าวโพด' },
  { id: 'strawberry', emoji: '🍓', name: 'สตรอว์เบอร์รี' },
  { id: 'eggplant', emoji: '🍆', name: 'มะเขือม่วง' },
  { id: 'lettuce', emoji: '🥬', name: 'ผักกาด' },
];
const PLOTS = 6;
const READY = 4;

export function mount(stage, cfg = {}) {
  let harvested = 0;
  let disposed = false;
  let completed = false;
  const timers = new Set();
  const saved = getMini('garden') || {};
  // Keep the old save shape, while making partially-written saves safe to open.
  const data = {
    plots: Array.from({ length: PLOTS }, (_, i) => ({ kind: null, stage: 0, ...(saved.plots?.[i] || {}) })),
    basket: { ...(saved.basket || {}) },
  };
  let seed = SEEDS[0];

  stage.innerHTML = `
    <div class="garden-toolbar">
      <div class="basket" id="basket" role="status" aria-live="polite"></div>
      <div class="mini-hint" style="margin-left:auto;white-space:nowrap">เก็บผัก <b id="goal">0</b> / 3 ต้น</div>
    </div>
    <div class="garden" id="garden"></div>
    <div class="seed-tray" id="tray">
      ${SEEDS.map((s) => `<button class="seed-btn" data-id="${s.id}" title="${s.name}" aria-label="เลือกเมล็ด${s.name}">${s.emoji}</button>`).join('')}
    </div>
    <div class="mini-hint" id="hint" role="status" aria-live="polite">เลือกเมล็ด แล้วแตะแปลงว่างเพื่อปลูก 🌱</div>`;

  const $garden = stage.querySelector('#garden');
  const $basket = stage.querySelector('#basket');
  const $hint = stage.querySelector('#hint');
  const $goal = stage.querySelector('#goal');

  const save = () => setMini('garden', data);
  const seedOf = (id) => SEEDS.find((s) => s.id === id);

  function plotHTML(p, i) {
    const s = p.kind ? seedOf(p.kind) : null;
    const name = s?.name || 'แปลงว่าง';
    let face = '';
    if (p.stage === 1) face = '🌱';
    else if (p.stage === 2) face = '🌿';
    else if (p.stage === 3) face = `<span class="growing">${s?.emoji || '🌿'}</span>`;
    else if (p.stage >= READY) face = `<span class="ready">${s?.emoji || '🌱'}</span><i class="spark">✨</i>`;
    const action = p.stage === 0 ? 'ปลูก' : p.stage >= READY ? 'เก็บ' : 'รดน้ำ';
    return `<button class="plot s${p.stage}" data-i="${i}" title="${action}${name}" aria-label="แปลงที่ ${i + 1}: ${action}${name}">${face}<span class="soil"></span></button>`;
  }

  function renderBasket() {
    const items = Object.entries(data.basket).filter(([k, n]) => seedOf(k) && n > 0);
    $basket.innerHTML = `<span aria-hidden="true">🧺</span>${items.length
      ? items.map(([k, n]) => `<span>${seedOf(k).emoji}<b>${n}</b></span>`).join('')
      : '<span class="dim">ยังไม่มีผักในตะกร้า</span>'}`;
  }

  function render() {
    $garden.innerHTML = data.plots.map(plotHTML).join('');
    $garden.querySelectorAll('.plot').forEach((el) => { el.onclick = () => tapPlot(el); });
    renderBasket();
    $goal.textContent = harvested;
  }

  function splash(el, emoji) {
    const d = document.createElement('span');
    d.className = 'splash';
    d.textContent = emoji;
    el.appendChild(d);
    const timer = setTimeout(() => { timers.delete(timer); d.remove(); }, 800);
    timers.add(timer);
  }

  function tapPlot(el) {
    if (disposed || completed) return;
    const i = Number(el.dataset.i);
    const p = data.plots[i];

    if (p.stage === 0) {
      p.kind = seed.id;
      p.stage = 1;
      sfx.tap();
      $hint.textContent = `ปลูก${seed.name}แล้ว แตะอีกทีเพื่อรดน้ำ 💧`;
      speak(`ปลูก${seed.name}แล้ว`);
      save();
      render();
      return;
    }

    if (p.stage < READY) {
      p.stage++;
      sfx.bundle();
      speak('รดน้ำแล้ว');
      save();
      render();
      const fresh = $garden.querySelector(`.plot[data-i="${i}"]`);
      splash(fresh, '💧');
      $hint.textContent = p.stage >= READY ? `เยี่ยม! ${seedOf(p.kind)?.name || 'ผัก'} โตเต็มที่แล้ว แตะเพื่อเก็บ 🧺` : 'รดน้ำอีกนิด กำลังโต 🌿';
      return;
    }

    const s = seedOf(p.kind);
    data.basket[p.kind] = (data.basket[p.kind] || 0) + 1;
    p.kind = null;
    p.stage = 0;
    sfx.correct();
    confetti(stage, 18);
    sayBubble(stage, `เก็บ${s.name}ได้แล้ว! ${s.emoji}`);
    speak(`เก็บ${s.name}ได้แล้ว`);
    harvested++;
    $hint.textContent = `เก็บผักแล้ว ${harvested} / 3 ต้น`;
    save();
    render();
    if (harvested >= 3 && !completed) {
      completed = true;
      $hint.textContent = 'เก่งมาก! เก็บครบ 3 ต้นแล้ว ไปเล่นต่อได้เลย 🎉';
      cfg.onComplete?.();
    }
  }

  stage.querySelectorAll('.seed-btn').forEach((b) => {
    b.onclick = () => {
      sfx.tap();
      seed = seedOf(b.dataset.id);
      stage.querySelectorAll('.seed-btn').forEach((x) => x.classList.toggle('on', x === b));
      speak(seed.name);
    };
  });
  stage.querySelector('.seed-btn').classList.add('on');

  speak('เลือกเมล็ด แล้วแตะแปลงว่างเพื่อปลูก');
  render();
  return () => {
    if (disposed) return;
    disposed = true;
    timers.forEach((timer) => clearTimeout(timer));
    timers.clear();
    stage.querySelectorAll('.plot, .seed-btn').forEach((button) => { button.onclick = null; });
  };
}
