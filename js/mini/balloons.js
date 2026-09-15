import { pick, randInt, confetti } from '../utils.js';
import { sfx, speak } from '../audio.js';

/* ป๊อปลูกโป่ง: ลูกโป่งลอยขึ้นเรื่อยๆ แตะให้แตก ทุก 10 ลูกมีคอนเฟตตี
   ไม่มีแพ้ ไม่มีเวลา ปล่อยลอยหลุดไปก็ไม่เป็นไร */

const COLORS = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#9775fa', '#f783ac', '#63e6be'];
const FACES = ['', '', '', '🐢', '🦭', '⭐', '🌸', '🐟'];

export function mount(stage, cfg = {}) {
  let popped = 0;
  let timer = null;
  let disposed = false;
  let completed = false;
  const timers = new Set();

  stage.innerHTML = `
    <div class="mini-hint balloon-score" id="score">แตะลูกโป่งให้แตก! 🎈 <b>0</b></div>
    <div class="sky-box" id="sky"></div>`;

  const $sky = stage.querySelector('#sky');
  const $score = stage.querySelector('#score b');

  function spawn() {
    if (disposed || !stage.isConnected) { cleanup(); return; }
    const b = document.createElement('button');
    b.className = 'balloon';
    b.setAttribute('aria-label', 'แตะลูกโป่งให้แตก');
    b.style.setProperty('--c', pick(COLORS));
    b.style.left = randInt(6, 88) + '%';
    b.style.animationDuration = randInt(5, 9) + 's';
    b.innerHTML = `<span class="face">${pick(FACES)}</span><i class="string"></i>`;
    const motionOff = document.documentElement.classList.contains('reduce-motion') || matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (motionOff) {
      b.classList.add('motion-off');
      b.style.bottom = randInt(8, 70) + '%';
      const expiryTimer = setTimeout(() => { timers.delete(expiryTimer); b.remove(); }, 6500);
      timers.add(expiryTimer);
    }
    b.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (disposed || completed || b.classList.contains('pop')) return;
      b.classList.add('pop');
      b.textContent = '💥';
      sfx.tap();
      popped++;
      $score.textContent = popped;
      if (popped % 10 === 0) { sfx.win(); confetti(stage, 30); speak(`แตกไป ${popped} ลูกแล้ว เก่งมาก`); }
      const removeTimer = setTimeout(() => { timers.delete(removeTimer); b.remove(); }, 350);
      timers.add(removeTimer);
      if (popped >= 10 && !completed) {
        completed = true;
        clearInterval(timer);
        cfg.onComplete?.();
      }
    });
    b.addEventListener('animationend', () => b.remove());
    $sky.appendChild(b);
  }

  timer = setInterval(spawn, 900);
  spawn();
  speak('แตะลูกโป่งให้แตก');
  function cleanup() {
    if (disposed) return;
    disposed = true;
    clearInterval(timer);
    timers.forEach(timeout => clearTimeout(timeout));
    timers.clear();
    $sky.querySelectorAll('.balloon').forEach(balloon => balloon.remove());
  }
  return cleanup;
}
