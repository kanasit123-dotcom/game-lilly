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

export function mount(stage) {
  const data = getMini('garden') || { plots: Array.from({ length: PLOTS }, () => ({ kind: null, stage: 0 })), basket: {} };
  let seed = SEEDS[0];

  stage.innerHTML = `
    <div class="basket" id="basket"></div>
    <div class="garden" id="garden"></div>
    <div class="seed-tray" id="tray">
      ${SEEDS.map((s) => `<button class="seed-btn" data-id="${s.id}" title="${s.name}">${s.emoji}</button>`).join('')}
    </div>
    <div class="mini-hint" id="hint">เลือกเมล็ด แล้วแตะแปลงว่างเพื่อปลูก 🌱</div>`;

  const $garden = stage.querySelector('#garden');
  const $basket = stage.querySelector('#basket');
  const $hint = stage.querySelector('#hint');

  const save = () => setMini('garden', data);
  const seedOf = (id) => SEEDS.find((s) => s.id === id);

  function plotHTML(p, i) {
    const s = p.kind ? seedOf(p.kind) : null;
    let face = '';
    if (p.stage === 1) face = '🌱';
    else if (p.stage === 2) face = '🌿';
    else if (p.stage === 3) face = `<span class="growing">${s.emoji}</span>`;
    else if (p.stage >= READY) face = `<span class="ready">${s.emoji}</span><i class="spark">✨</i>`;
    return `<button class="plot s${p.stage}" data-i="${i}">${face}<span class="soil"></span></button>`;
  }

  function renderBasket() {
    const items = Object.entries(data.basket).filter(([, n]) => n > 0);
    $basket.innerHTML = '🧺 ' + (items.length
      ? items.map(([k, n]) => `<span>${seedOf(k).emoji}<b>${n}</b></span>`).join('')
      : '<span class="dim">ยังไม่มีผักในตะกร้า</span>');
  }

  function render() {
    $garden.innerHTML = data.plots.map(plotHTML).join('');
    $garden.querySelectorAll('.plot').forEach((el) => { el.onclick = () => tapPlot(el); });
    renderBasket();
  }

  function splash(el, emoji) {
    const d = document.createElement('span');
    d.className = 'splash';
    d.textContent = emoji;
    el.appendChild(d);
    setTimeout(() => d.remove(), 800);
  }

  function tapPlot(el) {
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
      save();
      render();
      const fresh = $garden.querySelector(`.plot[data-i="${i}"]`);
      splash(fresh, '💧');
      $hint.textContent = p.stage >= READY ? 'โตเต็มที่แล้ว! แตะเพื่อเก็บ 🧺' : 'รดน้ำอีกนิด กำลังโต 🌿';
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
    $hint.textContent = 'เก่งมาก! ปลูกต่อได้เลย 🌱';
    save();
    render();
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
}
