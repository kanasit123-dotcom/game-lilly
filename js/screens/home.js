import { go } from '../router.js';
import { sfx, speak } from '../audio.js';
import { totalStars, getMini, setMini } from '../state.js';
import { nextReward } from '../rewards.js';
import { animalHTML } from '../assets.js';

/* หน้าแรกสำหรับเด็ก 5 ขวบ: ตัวหนังสือน้อยที่สุด ปุ่มใหญ่ 3 ปุ่ม แตะแล้วไปเลย
   เพื่อนซี้ 3 ตัวอยู่บนสุด แตะเลือกตัวที่จะไปด้วยกัน (พูดชื่อให้ฟัง) */

const FRIENDS = [['seal', 'แมวน้ำ'], ['turtle', 'เต่า'], ['rabbit', 'กระต่าย']];

export function showHome(root) {
  const stars = totalStars();
  const upcoming = nextReward();
  const prefs = getMini('preferences') || {};
  const buddy = prefs.buddy || 'seal';

  const el = document.createElement('div');
  el.className = 'screen home';
  el.innerHTML = `
    <h1 class="outlined">โลกของลิลลี่</h1>
    <div class="home-friends" role="group" aria-label="เลือกเพื่อนร่วมทาง">
      ${FRIENDS.map(([id, name]) => `
        <button class="friend${id === buddy ? ' on' : ''}" data-buddy="${id}" aria-pressed="${id === buddy}">
          ${animalHTML(id)}<span>${name}</span>
        </button>`).join('')}
    </div>
    <button class="btn big green home-play" id="play">▶ เล่นเลย</button>
    <div class="home-menu">
      <button class="home-tile" id="playroom"><span class="tile-icon">🎈</span><span>พักเล่น</span></button>
      <button class="home-tile" id="rewards"><span class="tile-icon">🏆</span><span>ตู้รางวัล</span></button>
    </div>
    <div class="home-stars">⭐ ดาวสะสม ${stars} ดวง</div>
    ${upcoming ? `<div class="home-next">อีก <b>${upcoming.stars - stars}</b> ⭐ จะได้ ${upcoming.emoji} ${upcoming.title}</div>` : ''}
    <button class="parent-link" id="parents">👨‍👩‍👧 สำหรับผู้ปกครอง</button>`;
  root.appendChild(el);

  const open = (screen) => () => { sfx.tap(); go(screen); };
  el.querySelector('#play').onclick = open('map');
  el.querySelector('#playroom').onclick = open('playroom');
  el.querySelector('#rewards').onclick = open('rewards');
  el.querySelector('#parents').onclick = open('summary');

  el.querySelectorAll('[data-buddy]').forEach((button) => {
    button.onclick = () => {
      sfx.tap();
      setMini('preferences', { ...getMini('preferences'), buddy: button.dataset.buddy });
      el.querySelectorAll('[data-buddy]').forEach((b) => {
        const on = b === button;
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', String(on));
      });
      button.querySelector('.lilly-animal')?.classList.remove('happy');
      void button.offsetWidth;
      button.querySelector('.lilly-animal')?.classList.add('happy');
      speak(`${button.querySelector('span').textContent} ไปด้วยกันนะ`);
    };
  });
}
