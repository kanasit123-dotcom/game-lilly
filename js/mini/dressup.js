import { confetti, sayBubble } from '../utils.js';
import { sfx, speak } from '../audio.js';
import { getMini, setMini } from '../state.js';
import { getBuddies } from '../rewards.js';

/* แต่งตัวเพื่อนซี้: เลือกเพื่อน แล้วแตะเครื่องประดับ → แตะตำแหน่งบนตัวเพื่อนเพื่อวาง
   ชุดของแต่ละตัวบันทึกแยกกัน */

const ITEMS = ['🎩', '👒', '🧢', '👑', '🎀', '👓', '🕶️', '🧣', '🌸', '⭐', '🎈', '🍭'];

export function mount(stage) {
  const data = getMini('dressup') || { fits: {} };
  const buddies = getBuddies();
  let buddy = buddies.includes(data.current) ? data.current : buddies[0];
  let item = ITEMS[0];

  stage.innerHTML = `
    <div class="mini-top">
      ${buddies.map((b) => `<button class="pic-btn" data-b="${b}">${b}</button>`).join('')}
    </div>
    <div class="dress-stage" id="dress"><span class="dress-buddy" id="dbuddy"></span></div>
    <div class="palette">
      ${ITEMS.map((e) => `<button class="swatch topping" data-e="${e}">${e}</button>`).join('')}
    </div>
    <div class="mini-actions">
      <button class="btn blue" id="clear">ถอดหมด 🔄</button>
      <button class="btn green" id="photo">ถ่ายรูป 📸</button>
    </div>`;

  const $dress = stage.querySelector('#dress');
  const $buddy = stage.querySelector('#dbuddy');
  const save = () => { data.current = buddy; setMini('dressup', data); };

  function render() {
    $buddy.textContent = buddy;
    $dress.querySelectorAll('.worn').forEach((w) => w.remove());
    (data.fits[buddy] || []).forEach((w, i) => {
      const el = document.createElement('span');
      el.className = 'worn';
      el.textContent = w.e;
      el.style.left = w.x + '%';
      el.style.top = w.y + '%';
      el.onclick = (ev) => {
        ev.stopPropagation();
        sfx.retry();
        data.fits[buddy].splice(i, 1);
        save();
        render();
      };
      $dress.appendChild(el);
    });
    stage.querySelectorAll('.pic-btn').forEach((b) => b.classList.toggle('on', b.dataset.b === buddy));
  }

  $dress.onclick = (e) => {
    const r = $dress.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    (data.fits[buddy] ||= []).push({ e: item, x: Math.round(x), y: Math.round(y) });
    sfx.tap();
    save();
    render();
  };

  stage.querySelectorAll('.pic-btn').forEach((b) => {
    b.onclick = () => { sfx.tap(); buddy = b.dataset.b; save(); render(); };
  });
  stage.querySelectorAll('.swatch').forEach((s) => {
    s.onclick = () => {
      sfx.tap();
      item = s.dataset.e;
      stage.querySelectorAll('.swatch').forEach((x) => x.classList.toggle('on', x === s));
    };
  });
  stage.querySelector('.swatch').classList.add('on');

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
