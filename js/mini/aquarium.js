import { randInt, confetti, sayBubble } from '../utils.js';
import { sfx, speak } from '../audio.js';
import { getMini, setMini } from '../state.js';

/* ตู้ปลา: แตะสัตว์/ของตกแต่งในถาดเพื่อใส่ลงตู้ ปลาว่ายไปมาเอง แตะปลาในตู้จะดีดตัวเล่น
   ตู้บันทึกไว้ กลับมาดูใหม่ปลายังอยู่ */

const SWIMMERS = ['🐟', '🐠', '🐡', '🦈', '🐙', '🦑', '🐢', '🦭', '🐬', '🦀'];
const DECOR = ['🌿', '🪨', '🐚', '⭐', '🫧'];
const MAX = 18;

export function mount(stage) {
  const data = getMini('aquarium') || { items: [] };

  stage.innerHTML = `
    <div class="tank" id="tank"></div>
    <div class="mini-top tray" id="tray">
      ${SWIMMERS.map((e) => `<button class="pic-btn" data-e="${e}" data-k="swim">${e}</button>`).join('')}
      ${DECOR.map((e) => `<button class="pic-btn" data-e="${e}" data-k="decor">${e}</button>`).join('')}
    </div>
    <div class="mini-actions">
      <button class="btn blue" id="clear">ล้างตู้ 🧹</button>
    </div>`;

  const $tank = stage.querySelector('#tank');
  const save = () => setMini('aquarium', data);

  function render() {
    $tank.innerHTML = data.items.map((it, i) => `
      <span class="tank-item ${it.k}" data-i="${i}"
            style="left:${it.x}%; top:${it.y}%; --dur:${it.dur}s; --delay:${it.delay}s; font-size:${it.size}rem">${it.e}</span>`).join('');
    $tank.querySelectorAll('.tank-item').forEach((el) => {
      el.onclick = () => {
        sfx.tap();
        el.classList.remove('boing');
        void el.offsetWidth;
        el.classList.add('boing');
      };
    });
  }

  stage.querySelectorAll('.pic-btn').forEach((b) => {
    b.onclick = () => {
      if (data.items.length >= MAX) {
        sfx.retry();
        sayBubble(stage, 'ตู้เต็มแล้ว ล้างตู้ก่อนนะ 🧹');
        return;
      }
      const decor = b.dataset.k === 'decor';
      data.items.push({
        e: b.dataset.e,
        k: b.dataset.k,
        x: randInt(5, 80),
        y: decor ? randInt(70, 82) : randInt(8, 62),
        dur: randInt(8, 16),
        delay: -randInt(0, 10),
        size: decor ? 2.2 : (1.8 + Math.random() * 1.2).toFixed(1),
      });
      sfx.correct();
      save();
      render();
      if (data.items.length === MAX) { confetti(stage, 24); sayBubble(stage, 'ตู้ปลาเต็มแล้ว สวยมาก! 🐠'); }
    };
  });

  stage.querySelector('#clear').onclick = () => {
    sfx.retry();
    data.items = [];
    save();
    render();
  };

  speak('แตะปลาหรือของตกแต่ง เพื่อใส่ลงตู้');
  render();
}
