import { go } from '../router.js';
import { unlockAudio, sfx } from '../audio.js';
import { totalStars } from '../state.js';
import { nextReward } from '../rewards.js';

export function showHome(root) {
  const stars = totalStars();
  const upcoming = nextReward();

  const el = document.createElement('div');
  el.className = 'screen home';
  el.innerHTML = `
    <div class="home-buddies"><span>🐢</span><span>🐰</span><span>🦭</span></div>
    <h1 class="outlined">โลกของลิลลี่</h1>
    <p class="tagline">เกมคณิตศาสตร์ ภาษาไทย และ ภาษาอังกฤษ</p>
    <button class="btn big green" id="play">เล่นเลย! ▶</button>
    <div class="home-row">
      <div class="home-stars">⭐ ดาวสะสม ${stars} ดวง</div>
      <button class="btn purple small" id="rewards">🏆 ตู้รางวัล</button>
    </div>
    ${upcoming ? `<div class="home-next">อีก <b>${upcoming.stars - stars}</b> ⭐ จะได้ ${upcoming.emoji} ${upcoming.title}</div>` : ''}
    <button class="parent-link" id="parents">👨‍👩‍👧 สำหรับผู้ปกครอง</button>`;
  root.appendChild(el);

  const open = (screen) => () => { unlockAudio(); sfx.tap(); go(screen); };
  el.querySelector('#play').onclick = open('map');
  el.querySelector('#rewards').onclick = open('rewards');
  el.querySelector('#parents').onclick = open('summary');
}
