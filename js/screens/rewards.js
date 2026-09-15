import { go } from '../router.js';
import { totalStars } from '../state.js';
import { REWARDS, isUnlocked, nextReward } from '../rewards.js';
import { sfx, speak } from '../audio.js';
import { animalHTML } from '../assets.js';
import { topBar, bindTopBar } from './menu.js';

/* ตู้รางวัล: โชว์ทุกรางวัล อันที่ยังไม่ได้เป็นเงาพร้อมบอกว่าอีกกี่ดาว */

const TYPE_LABEL = { trophy: 'ถ้วยรางวัล', buddy: 'เพื่อนซี้', mini: 'มินิเกม' };

function cardHTML(r) {
  const open = isUnlocked(r);
  const need = r.stars - totalStars();
  return `
    <div class="reward-tile${open ? ' open' : ' locked'}" data-id="${r.id}" data-type="${r.type}" data-need="${need}">
      <div class="reward-emoji small${r.cup ? ' cup' : ''}">${r.cup ? '🏆' : ''}<span>${animalHTML(r.emoji)}</span></div>
      <div class="tile-name">${open ? r.title : '???'}</div>
      <div class="tile-meta">${open
        ? (r.type === 'mini' ? '<b class="play-tag">เล่นเลย ▶</b>' : TYPE_LABEL[r.type])
        : `🔒 อีก ${need} ⭐`}</div>
      <div class="tile-stars">⭐ ${r.stars}</div>
    </div>`;
}

export function showRewards(root) {
  const stars = totalStars();
  const upcoming = nextReward();
  const got = REWARDS.filter(isUnlocked).length;

  const el = document.createElement('div');
  el.className = 'screen summary';
  el.innerHTML = `
    ${topBar('ตู้รางวัล')}
    <div class="summary-body">
      <div class="card reward-progress">
        <div>ได้รางวัลแล้ว <b>${got}</b> จาก ${REWARDS.length}</div>
        ${upcoming
          ? `<div class="bar"><i style="width:${Math.min(100, (stars / upcoming.stars) * 100)}%"></i></div>
             <div class="hint">อีก <b>${upcoming.stars - stars}</b> ⭐ จะได้ ${upcoming.emoji} ${upcoming.title}</div>`
          : '<div class="hint">ได้ครบทุกรางวัลแล้ว สุดยอดไปเลย! 🌈</div>'}
      </div>
      <div class="reward-grid">${REWARDS.map(cardHTML).join('')}</div>
    </div>`;
  root.appendChild(el);

  bindTopBar(el);

  el.querySelectorAll('.reward-tile.open[data-type="mini"]').forEach((t) => {
    t.onclick = () => { sfx.tap(); go('mini', { id: t.dataset.id }); };
  });
  el.querySelectorAll('.reward-tile.locked').forEach((t) => {
    t.onclick = () => {
      sfx.retry(); t.classList.remove('nope'); void t.offsetWidth; t.classList.add('nope');
      speak(`อีก ${t.dataset.need} ดาว จะได้อันนี้`);
    };
  });
  speak(upcoming ? `ตู้รางวัล อีก ${upcoming.stars - stars} ดาว จะได้ ${upcoming.title}` : 'ได้ครบทุกรางวัลแล้ว สุดยอด');
}
