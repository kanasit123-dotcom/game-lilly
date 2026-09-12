import { go } from '../router.js';
import { LEVELS } from '../levels.js';
import { getStars, totalStars, nextUnplayedId } from '../state.js';
import { sfx } from '../audio.js';

const H = 620;
const EDGE = 110;
const GAP = 165;
const W = EDGE * 2 + GAP * (LEVELS.length - 1);

const POINTS = LEVELS.map((lv, i) => ({
  x: EDGE + i * GAP,
  y: 330 - Math.sin(i * 0.85) * 155,
}));

/* เส้นทางโค้งนุ่มๆ ผ่านทุกด่าน (Catmull-Rom แปลงเป็น Bezier) */
function smoothPath(pts) {
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    d += ` C ${p1.x + (p2.x - p0.x) / 6} ${p1.y + (p2.y - p0.y) / 6},` +
         ` ${p2.x - (p3.x - p1.x) / 6} ${p2.y - (p3.y - p1.y) / 6},` +
         ` ${p2.x} ${p2.y}`;
  }
  return d;
}

function nodeHTML(lv, i, currentId) {
  const stars = getStars(lv.id);
  const dots = [0, 1, 2].map((n) => `<span class="${n < stars ? '' : 'off'}">⭐</span>`).join('');
  return `
    <button class="node${lv.id === currentId ? ' current' : ''}" data-id="${lv.id}"
            style="left:${(POINTS[i].x / W) * 100}%; top:${(POINTS[i].y / H) * 100}%">
      <span class="node-num">${i + 1}</span>
      <span class="node-icon">${lv.icon}</span>
      <span class="node-stars">${dots}</span>
      <span class="node-label">${lv.title}</span>
    </button>`;
}

export function showMap(root) {
  const currentId = nextUnplayedId();
  const el = document.createElement('div');
  el.className = 'screen';
  el.innerHTML = `
    <div class="map-head">
      <button class="icon-btn" id="home">🏠</button>
      <h2 class="outlined">เลือกด่าน</h2>
      <div class="spacer"></div>
      <div class="star-counter">⭐ ${totalStars()}</div>
    </div>
    <div class="map-wrap">
      <div class="map-stage" style="aspect-ratio:${W} / ${H}">
        <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
          <path class="map-path" d="${smoothPath(POINTS)}"/>
        </svg>
        ${LEVELS.map((lv, i) => nodeHTML(lv, i, currentId)).join('')}
      </div>
    </div>`;
  root.appendChild(el);

  el.querySelector('#home').onclick = () => { sfx.tap(); go('home'); };

  el.querySelectorAll('.node').forEach((node) => {
    node.onclick = () => {
      sfx.tap();
      go('game', { levelId: node.dataset.id });
    };
  });

  // เลื่อนไปที่ด่านที่ควรเล่นต่อ ไม่ให้เด็กต้องหาเอง
  const current = el.querySelector('.node.current');
  const wrap = el.querySelector('.map-wrap');
  requestAnimationFrame(() => {
    if (!current) return;
    wrap.scrollLeft = current.offsetLeft - wrap.clientWidth / 2;
  });
}
