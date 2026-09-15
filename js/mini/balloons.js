import { pick, randInt, confetti } from '../utils.js';
import { sfx, speak } from '../audio.js';

/* ป๊อปลูกโป่ง: ลูกโป่งลอยขึ้นเรื่อยๆ แตะให้แตก ทุก 10 ลูกมีคอนเฟตตี
   ไม่มีแพ้ ไม่มีเวลา ปล่อยลอยหลุดไปก็ไม่เป็นไร */

const COLORS = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#9775fa', '#f783ac', '#63e6be'];
const FACES = ['', '', '', '🐢', '🦭', '⭐', '🌸', '🐟'];

export function mount(stage, cfg = {}) {
  let popped = 0;
  let timer = null;

  stage.innerHTML = `
    <div class="mini-hint balloon-score" id="score">แตะลูกโป่งให้แตก! 🎈 <b>0</b></div>
    <div class="sky-box" id="sky"></div>`;

  const $sky = stage.querySelector('#sky');
  const $score = stage.querySelector('#score b');

  function spawn() {
    if (!stage.isConnected) { clearInterval(timer); return; }
    const b = document.createElement('button');
    b.className = 'balloon';
    b.style.setProperty('--c', pick(COLORS));
    b.style.left = randInt(6, 88) + '%';
    b.style.animationDuration = randInt(5, 9) + 's';
    b.innerHTML = `<span class="face">${pick(FACES)}</span><i class="string"></i>`;
    b.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (b.classList.contains('pop')) return;
      b.classList.add('pop');
      b.textContent = '💥';
      sfx.tap();
      popped++;
      $score.textContent = popped;
      if (popped % 10 === 0) { sfx.win(); confetti(stage, 30); speak(`แตกไป ${popped} ลูกแล้ว เก่งมาก`); }
      setTimeout(() => b.remove(), 350);
      if (popped >= 10) cfg.onComplete?.();
    });
    b.addEventListener('animationend', () => b.remove());
    $sky.appendChild(b);
  }

  timer = setInterval(spawn, 900);
  spawn();
  speak('แตะลูกโป่งให้แตก');
  return () => clearInterval(timer);
}
