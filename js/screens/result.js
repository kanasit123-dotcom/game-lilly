import { go } from '../router.js';
import { nextLevelId, totalStars } from '../state.js';
import { sfx, speak } from '../audio.js';
import { confetti, wait, randomBuddy } from '../utils.js';
import { claimNewRewards, nextReward } from '../rewards.js';

const PRAISE = {
  3: 'เยี่ยมมาก ลิลลี่! 🌟',
  2: 'เก่งมากเลย! 👏',
  1: 'ทำได้แล้ว! 🎉',
};

const PRAISE_SPEECH = { 3: 'เยี่ยมมาก ลิลลี่', 2: 'เก่งมากเลย', 1: 'ทำได้แล้ว' };

/* popup รางวัลใหม่ เด้งทีละอัน กดปิดแล้วค่อยโชว์อันถัดไป */
function showRewardPopup(host, reward) {
  return new Promise((resolve) => {
    const el = document.createElement('div');
    el.className = 'reward-overlay';
    el.innerHTML = `
      <div class="reward-card">
        <div class="reward-burst">🎉</div>
        <div class="reward-title">รางวัลใหม่!</div>
        <div class="reward-emoji${reward.cup ? ' cup' : ''}">${reward.cup ? '🏆' : ''}<span>${reward.emoji}</span></div>
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
  const next = nextLevelId(levelId);
  const upcoming = nextReward();
  const remain = upcoming ? upcoming.stars - totalStars() : 0;

  const el = document.createElement('div');
  el.className = 'screen result';
  el.innerHTML = `
    <div class="buddy-big">${randomBuddy()}</div>
    <h2 class="outlined">${PRAISE[stars]}</h2>
    <div class="result-stars"><span>⭐</span><span>⭐</span><span>⭐</span></div>
    <div class="score">ตอบถูกตั้งแต่ครั้งแรก ${firstTry} จาก ${total}</div>
    ${upcoming ? `<div class="next-reward">อีก <b>${remain}</b> ⭐ จะได้ <span>${upcoming.emoji}</span> ${upcoming.title}</div>` : ''}
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

    // รางวัลที่เพิ่งปลดล็อกจากดาวรอบนี้ เด้งหลังดาวขึ้นครบ
    const fresh = claimNewRewards();
    for (const r of fresh) {
      await wait(700);
      const playNow = await showRewardPopup(el, r);
      if (playNow) { go('mini', { id: playNow }); return; }
    }
  })();
}
