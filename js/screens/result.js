import { go } from '../router.js';
import { nextLevelId } from '../state.js';
import { getLevel } from '../levels.js';
import { sfx } from '../audio.js';
import { randomBuddy } from '../utils.js';
import { claimNewRewards } from '../rewards.js';
import { animalHTML, iconHTML } from '../assets.js';

export function showResult(root, { levelId, stars, total }) {
  const level = getLevel(levelId);
  if (!level) { queueMicrotask(() => go('home')); return; }
  const next = nextLevelId(levelId);
  const fresh = claimNewRewards();
  const el = document.createElement('div');
  el.className = 'screen lilly-result';
  el.innerHTML = `<div class="lilly-result-content">${animalHTML(randomBuddy())}<div class="lilly-eyebrow">ทำครบแล้ว ${total} ข้อ</div><h1>ลิลลี่ทำได้แล้ว!</h1><p>${level.title}</p>
    <div class="earned-stars" aria-label="ได้รับ ${stars} ดาว">${'★'.repeat(stars)}</div>
    ${fresh.length ? `<div class="new-rewards"><h2>ได้รางวัลใหม่แล้ว</h2>${fresh.map(r => `<p>${r.title}</p>`).join('')}<button class="lilly-text" id="rewards">ดูตู้รางวัล ${iconHTML('arrow-right')}</button></div>` : ''}
    <div class="learning-actions"><button class="btn green" id="break">ไปเก็บแครอต ${iconHTML('sprout')}</button>${next ? '<button class="btn secondary" id="next">เรียนต่อ</button>' : ''}<button class="btn secondary" id="home">วันนี้พอแค่นี้</button></div>
    <div class="learning-actions"><button class="lilly-text" id="again">${iconHTML('rotate-ccw')}ทบทวนอีกครั้ง</button><button class="lilly-text" id="map">${iconHTML('book-open')}เลือกบทเรียน</button></div></div>`;
  root.appendChild(el);
  sfx.win();
  el.querySelector('#break').onclick = () => go('mini', { id: 'harvest', fromLevelId: levelId });
  el.querySelector('#next')?.addEventListener('click', () => go('game', { levelId: next }));
  el.querySelector('#home').onclick = () => go('home');
  el.querySelector('#again').onclick = () => go('game', { levelId });
  el.querySelector('#map').onclick = () => go('map');
  el.querySelector('#rewards')?.addEventListener('click', () => go('rewards'));
}
