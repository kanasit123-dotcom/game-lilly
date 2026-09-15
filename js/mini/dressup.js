import { confetti, sayBubble } from '../utils.js';
import { sfx, speak } from '../audio.js';
import { getMini, setMini } from '../state.js';
import { getBuddies } from '../rewards.js';
import { animalHTML } from '../assets.js';

/* แต่งตัวเพื่อนซี้: เลือกเพื่อน แล้วแตะเครื่องประดับ → แตะตำแหน่งบนตัวเพื่อนเพื่อวาง
   ชุดของแต่ละตัวบันทึกแยกกัน */

const ITEMS = ['🎩', '👒', '🧢', '👑', '🎀', '👓', '🕶️', '🧣', '🌸', '⭐', '🎈', '🍭'];
const SLOTS = [
  { id: 'head', label: 'บนหัว', x: 50, y: 22 },
  { id: 'face', label: 'บนหน้า', x: 50, y: 43 },
  { id: 'neck', label: 'รอบคอ', x: 50, y: 64 },
  { id: 'left', label: 'ด้านซ้าย', x: 25, y: 58 },
  { id: 'right', label: 'ด้านขวา', x: 75, y: 58 },
];

export function mount(stage, cfg = {}) {
  const data = getMini('dressup') || { fits: {} };
  const buddies = getBuddies();
  let buddy = buddies.includes(data.current) ? data.current : buddies[0];
  let item = ITEMS[0];
  let slot = SLOTS[0];

  stage.innerHTML = `
    <div class="mini-top dress-buddies" aria-label="เลือกเพื่อนซี้">
      ${buddies.map((b) => `<button class="pic-btn" data-b="${b}" aria-label="เลือกเพื่อนซี้${b}" aria-pressed="false">${animalHTML(b)}</button>`).join('')}
    </div>
    <p class="mini-hint" id="dress-hint">เลือกเครื่องประดับ แล้วเลือกตำแหน่งวาง</p>
    <div class="dress-stage" id="dress" role="group" aria-label="พื้นที่แต่งตัว${buddy}"><span class="dress-buddy" id="dbuddy"></span></div>
    <div class="palette dress-items" aria-label="เลือกเครื่องประดับ">
      ${ITEMS.map((e) => `<button class="swatch topping" data-e="${e}" title="เครื่องประดับ ${e}" aria-label="เลือกเครื่องประดับ ${e}">${e}</button>`).join('')}
    </div>
    <div class="mini-top dress-slots" aria-label="เลือกตำแหน่งวางเครื่องประดับ">
      ${SLOTS.map((s) => `<button class="pic-btn slot-btn" data-slot="${s.id}" aria-label="วางเครื่องประดับ${s.label}" aria-pressed="false">${s.label}</button>`).join('')}
    </div>
    <div class="mini-actions">
      <button class="btn blue" id="clear">ถอดหมด 🔄</button>
      <button class="btn green" id="photo">ถ่ายรูป 📸</button>
    </div>`;

  const $dress = stage.querySelector('#dress');
  const $buddy = stage.querySelector('#dbuddy');
  const save = () => { data.current = buddy; setMini('dressup', data); };
  const place = (x, y) => {
    (data.fits[buddy] ||= []).push({ e: item, x, y });
    sfx.tap();
    save();
    render();
  };

  function render() {
    $buddy.innerHTML = animalHTML(buddy);
    $dress.setAttribute('aria-label', `พื้นที่แต่งตัว${buddy} เลือกตำแหน่งวางเครื่องประดับได้`);
    $dress.querySelectorAll('.worn').forEach((w) => w.remove());
    (data.fits[buddy] || []).forEach((w, i) => {
      const el = document.createElement('span');
      el.className = 'worn';
      el.textContent = w.e;
      el.style.left = w.x + '%';
      el.style.top = w.y + '%';
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', `ถอดเครื่องประดับ ${w.e}`);
      el.onclick = (ev) => {
        ev.stopPropagation();
        sfx.retry();
        data.fits[buddy].splice(i, 1);
        save();
        render();
      };
      el.onkeydown = (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') el.click();
      };
      $dress.appendChild(el);
    });
    stage.querySelectorAll('.pic-btn[data-b]').forEach((b) => {
      const selected = b.dataset.b === buddy;
      b.classList.toggle('on', selected);
      b.setAttribute('aria-pressed', String(selected));
    });
    stage.querySelectorAll('.slot-btn').forEach((b) => {
      const selected = b.dataset.slot === slot.id;
      b.classList.toggle('on', selected);
      b.setAttribute('aria-pressed', String(selected));
    });
  }

  $dress.onclick = (e) => {
    if (e.target.closest('.worn')) return;
    const r = $dress.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    place(Math.round(x), Math.round(y));
  };

  stage.querySelectorAll('.pic-btn').forEach((b) => {
    b.onclick = () => {
      if (b.dataset.slot) {
        slot = SLOTS.find((s) => s.id === b.dataset.slot) || SLOTS[0];
        place(slot.x, slot.y);
        return;
      }
      sfx.tap();
      buddy = b.dataset.b;
      save();
      render();
    };
  });
  stage.querySelectorAll('.swatch').forEach((s) => {
    s.onclick = () => {
      sfx.tap();
      item = s.dataset.e;
      stage.querySelectorAll('.swatch').forEach((x) => {
        const selected = x === s;
        x.classList.toggle('on', selected);
        x.setAttribute('aria-pressed', String(selected));
      });
    };
  });
  stage.querySelector('.swatch').classList.add('on');
  stage.querySelector('.swatch').setAttribute('aria-pressed', 'true');

  stage.querySelector('#clear').onclick = () => { sfx.retry(); data.fits[buddy] = []; save(); render(); };
  stage.querySelector('#photo').onclick = () => {
    sfx.win();
    confetti(stage, 30);
    sayBubble(stage, 'หล่อสวยมากเลย! 📸');
    speak('สวยมากเลย');
  };

  speak('เลือกเครื่องประดับ แล้วแตะบนตัวเพื่อนเพื่อใส่');
  render();
}
