import { go } from '../router.js';
import { nextLevelId } from '../state.js';
import { sfx, speak } from '../audio.js';
import { confetti, wait } from '../utils.js';

const PRAISE = {
  3: 'เยี่ยมมาก ลิลลี่! 🌟',
  2: 'เก่งมากเลย! 👏',
  1: 'ทำได้แล้ว! 🎉',
};

const PRAISE_SPEECH = { 3: 'เยี่ยมมาก ลิลลี่', 2: 'เก่งมากเลย', 1: 'ทำได้แล้ว' };

export function showResult(root, { levelId, stars, firstTry, total }) {
  const next = nextLevelId(levelId);

  const el = document.createElement('div');
  el.className = 'screen result';
  el.innerHTML = `
    <div class="buddy-big">🐰</div>
    <h2 class="outlined">${PRAISE[stars]}</h2>
    <div class="result-stars"><span>⭐</span><span>⭐</span><span>⭐</span></div>
    <div class="score">ตอบถูกตั้งแต่ครั้งแรก ${firstTry} จาก ${total}</div>
    <div class="result-actions">
      <button class="btn blue" id="again">เล่นอีกรอบ 🔁</button>
      <button class="btn yellow" id="map">แผนที่ 🗺️</button>
      ${next ? '<button class="btn green" id="next">ด่านต่อไป ▶</button>' : ''}
    </div>`;
  root.appendChild(el);

  el.querySelector('#again').onclick = () => { sfx.tap(); go('game', { levelId }); };
  el.querySelector('#map').onclick = () => { sfx.tap(); go('map'); };
  el.querySelector('#next')?.addEventListener('click', () => { sfx.tap(); go('game', { levelId: next }); });

  (async () => {
    const slots = el.querySelectorAll('.result-stars span');
    for (let i = 0; i < stars; i++) {
      await wait(420);
      slots[i].classList.add('on');
      sfx.star(i);
    }
    await wait(250);
    confetti(el, 40);
    sfx.win();
    speak(PRAISE_SPEECH[stars]);
  })();
}
