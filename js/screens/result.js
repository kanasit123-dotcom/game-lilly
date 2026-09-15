import { go } from '../router.js';
import { nextLevelId, totalStars } from '../state.js';
import { getLevel } from '../levels.js';
import { sfx, speak } from '../audio.js';
import { confetti, wait, randomBuddy } from '../utils.js';
import { claimNewRewards, nextReward } from '../rewards.js';
import { animalHTML } from '../assets.js';
import { completeMissionLevel, getMission, nextMissionId } from '../mission.js';

/* หน้าจบด่าน: ดาวเด้งทีละดวง ชมด้วยเสียง แล้วปุ่มใหญ่ "ด่านต่อไป"
   รางวัลใหม่ (ถ้ามี) เด้ง popup ทีละอัน */

const PRAISE = {
  3: 'เยี่ยมมาก ลิลลี่! 🌟',
  2: 'เก่งมากเลย! 👏',
  1: 'ทำได้แล้ว! 🎉',
};

const PRAISE_SPEECH = { 3: 'เยี่ยมมาก ลิลลี่ ได้สามดาวเลย', 2: 'เก่งมากเลย ได้สองดาว', 1: 'ทำได้แล้ว ได้หนึ่งดาว' };

/* popup สติกเกอร์เมื่อทำภารกิจวันนี้ครบ 3 ด่าน */
function showStickerPopup(host, sticker) {
  return new Promise((resolve) => {
    const el = document.createElement('div');
    el.className = 'reward-overlay';
    el.innerHTML = `
      <div class="reward-card">
        <div class="reward-burst">🎉</div>
        <div class="reward-title">ภารกิจวันนี้ครบแล้ว!</div>
        <div class="reward-emoji sticker"><span>${sticker}</span></div>
        <div class="reward-name">ได้สติกเกอร์ 1 ดวง</div>
        <div class="reward-desc">แปะไว้ในปฏิทินแล้วนะ</div>
        <div class="reward-actions">
          <button class="btn yellow" id="st-ok">เยี่ยม!</button>
          <button class="btn blue" id="st-cal">📅 ดูปฏิทิน</button>
        </div>
      </div>`;
    host.appendChild(el);
    sfx.win();
    confetti(el, 40);
    speak('ภารกิจวันนี้ครบแล้ว ได้สติกเกอร์หนึ่งดวง');
    el.querySelector('#st-ok').onclick = () => { sfx.tap(); el.remove(); resolve(false); };
    el.querySelector('#st-cal').onclick = () => { sfx.tap(); el.remove(); resolve(true); };
  });
}

/* popup รางวัลใหม่ เด้งทีละอัน กดปิดแล้วค่อยโชว์อันถัดไป */
function showRewardPopup(host, reward) {
  return new Promise((resolve) => {
    const el = document.createElement('div');
    el.className = 'reward-overlay';
    el.innerHTML = `
      <div class="reward-card">
        <div class="reward-burst">🎉</div>
        <div class="reward-title">รางวัลใหม่!</div>
        <div class="reward-emoji${reward.cup ? ' cup' : ''}">${reward.cup ? '🏆' : ''}<span>${animalHTML(reward.emoji)}</span></div>
        <div class="reward-name">${reward.title}</div>
        <div class="reward-desc">${reward.desc}</div>
        <div class="reward-actions">
          ${reward.type === 'mini' ? `<button class="btn green" id="rw-play">เล่นเลย! ▶</button>` : ''}
          <button class="btn yellow" id="rw-ok">${reward.type === 'mini' ? 'ไว้ก่อน' : 'เยี่ยม!'}</button>
        </div>
      </div>`;
    host.appendChild(el);
    sfx.win();
    confetti(el, 40);
    speak(`ได้รางวัลใหม่ ${reward.title}`);

    el.querySelector('#rw-ok').onclick = () => { sfx.tap(); el.remove(); resolve(null); };
    el.querySelector('#rw-play')?.addEventListener('click', () => { sfx.tap(); el.remove(); resolve(reward.id); });
  });
}

export function showResult(root, { levelId, stars, firstTry, total }) {
  const level = getLevel(levelId);
  if (!level) { queueMicrotask(() => go('home')); return; }
  // นับภารกิจทันที (ไม่รอแอนิเมชัน) เผื่อเด็กกดออกก่อน ดาวขึ้นครบค่อยเด้งสติกเกอร์
  const mission = completeMissionLevel(levelId);
  const m = getMission();
  const missionNext = m.ids.includes(levelId) ? nextMissionId(m) : null; // เล่นภารกิจอยู่ ปุ่มต่อไปพาไปภารกิจถัดไป
  const next = missionNext || nextLevelId(levelId);
  const upcoming = nextReward();
  const remain = upcoming ? upcoming.stars - totalStars() : 0;
  let gone = false;

  const el = document.createElement('div');
  el.className = 'screen result';
  el.innerHTML = `
    <div class="buddy-big">${animalHTML(randomBuddy())}</div>
    <h2 class="outlined">${PRAISE[stars]}</h2>
    <div class="result-stars"><span>⭐</span><span>⭐</span><span>⭐</span></div>
    <div class="score">${level.icon} ${level.title} · ถูกตั้งแต่ครั้งแรก ${firstTry} จาก ${total}</div>
    ${upcoming ? `<div class="next-reward">อีก <b>${remain}</b> ⭐ จะได้ <span>${upcoming.emoji}</span> ${upcoming.title}</div>` : ''}
    ${m.ids.includes(levelId) ? `<div class="mission-row">📌 ภารกิจวันนี้ ${m.ids.map((id) => `<span class="${m.done.includes(id) ? 'on' : ''}">${getLevel(id).icon}</span>`).join('')}</div>` : ''}
    ${next ? `<button class="btn big green" id="next">${missionNext ? 'ภารกิจต่อไป' : 'ด่านต่อไป'} ▶</button>` : ''}
    <div class="result-actions">
      <button class="btn blue" id="again">🔁 เล่นอีกรอบ</button>
      <button class="btn yellow" id="map">🗺️ แผนที่</button>
      <button class="btn purple" id="break">🎈 พักเล่น</button>
    </div>`;
  root.appendChild(el);

  const open = (screen, params) => () => { sfx.tap(); go(screen, params); };
  el.querySelector('#again').onclick = open('game', { levelId });
  el.querySelector('#map').onclick = open('map');
  el.querySelector('#break').onclick = open('playroom');
  el.querySelector('#next')?.addEventListener('click', open('game', { levelId: next }));

  (async () => {
    const slots = el.querySelectorAll('.result-stars span');
    for (let i = 0; i < stars; i++) {
      await wait(420);
      if (gone) return;
      slots[i].classList.add('on');
      sfx.star(i);
    }
    await wait(250);
    if (gone) return;
    confetti(el, 40);
    sfx.win();
    speak(PRAISE_SPEECH[stars]);

    if (mission.justFinished) {
      await wait(600);
      if (gone) return;
      if (await showStickerPopup(el, mission.sticker)) { go('calendar'); return; }
    }

    // รางวัลที่เพิ่งปลดล็อกจากดาวรอบนี้ เด้งหลังดาวขึ้นครบ
    const fresh = claimNewRewards();
    for (const r of fresh) {
      await wait(700);
      if (gone) return;
      const playNow = await showRewardPopup(el, r);
      if (playNow) { go('mini', { id: playNow }); return; }
    }
  })();

  return () => { gone = true; };
}
