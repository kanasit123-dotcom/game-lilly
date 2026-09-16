import { go } from '../router.js';
import { sfx, speak } from '../audio.js';
import { totalStars, getMini, setMini } from '../state.js';
import { nextReward, REWARDS, isUnlocked } from '../rewards.js';
import { animalHTML, assetId } from '../assets.js';
import { getLevel } from '../levels.js';
import { getMission, stickerCount, getStickers } from '../mission.js';

/* หน้าแรกสำหรับเด็ก 5 ขวบ: ตัวหนังสือน้อยที่สุด ปุ่มใหญ่ 3 ปุ่ม แตะแล้วไปเลย
   เพื่อนซี้ 3 ตัวอยู่บนสุด แตะเลือกตัวที่จะไปด้วยกัน (พูดชื่อให้ฟัง) */

const BASE_FRIENDS = [['seal', 'แมวน้ำ'], ['turtle', 'เต่า'], ['rabbit', 'กระต่าย']];

/* เพื่อนซี้ที่เลือกได้: 3 ตัวแรก + เพื่อนจากตู้รางวัลที่ปลดล็อกแล้วและมีรูปวาดแล้ว */
function friends() {
  const list = BASE_FRIENDS.slice();
  for (const r of REWARDS) {
    const id = r.type === 'buddy' && isUnlocked(r) ? assetId(r.emoji) : null;
    // รางวัล "กระต่ายน้อย" ใช้รูปเดียวกับกระต่ายตัวแรก ไม่ต้องโชว์ซ้ำ
    if (id && !list.some(([f]) => f === id)) list.push([id, r.title.replace('เพื่อนใหม่: ', '')]);
  }
  return list;
}

export function showHome(root) {
  const stars = totalStars();
  const upcoming = nextReward();
  const prefs = getMini('preferences') || {};
  const buddy = prefs.buddy || 'seal';
  const mission = getMission();
  const allDone = mission.done.length >= mission.ids.length;
  const todaySticker = getStickers()[mission.date];

  const el = document.createElement('div');
  el.className = 'screen home';
  el.innerHTML = `
    <h1 class="outlined">โลกของลิลลี่</h1>
    <div class="home-friends" role="group" aria-label="เลือกเพื่อนร่วมทาง">
      ${friends().map(([id, name]) => `
        <button class="friend${id === buddy ? ' on' : ''}" data-buddy="${id}" aria-pressed="${id === buddy}">
          ${animalHTML(id)}<span>${name}</span>
        </button>`).join('')}
    </div>
    <section class="mission${allDone ? ' complete' : ''}" aria-label="ภารกิจวันนี้">
      <div class="mission-head">
        <span>📌 ภารกิจวันนี้</span>
        <button class="mission-cal" id="calendar" aria-label="ดูปฏิทินสติกเกอร์">📅 <b>${stickerCount()}</b></button>
      </div>
      <div class="mission-levels">
        ${mission.ids.map((id) => {
          const lv = getLevel(id);
          const done = mission.done.includes(id);
          return `<button class="mission-level${done ? ' done' : ''}" data-level="${id}" aria-label="${lv.title}${done ? ' (ทำแล้ว)' : ''}">
            <span class="m-icon">${lv.icon}</span>${done ? '<span class="m-check">✓</span>' : ''}<small>${lv.title}</small></button>`;
        }).join('')}
        ${allDone ? `<div class="mission-sticker"><b>${animalHTML(todaySticker || '🌟')}</b><small>ครบแล้ว!</small></div>` : ''}
      </div>
    </section>
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
  el.querySelector('#calendar').onclick = open('calendar');
  el.querySelectorAll('[data-level]').forEach((button) => {
    button.onclick = () => { sfx.tap(); go('game', { levelId: button.dataset.level }); };
  });

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
