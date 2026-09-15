import { go } from '../router.js';
import { LEVELS, SUBJECTS, WORLDS } from '../levels.js';
import { getStars, nextUnplayedId } from '../state.js';
import { sfx, speak } from '../audio.js';
import { topBar, bindTopBar } from './menu.js';

/* แผนที่ด่าน: เส้นทางโค้งไปเรื่อยๆ ด่านเป็นปุ่มใหญ่มีรูป เลข และดาว
   เด็กแตะด่านไหนก็ได้ (ไม่ล็อก) ด่านที่ควรเล่นต่อจะเด้งและเลื่อนมาให้เห็นเอง */

const H = 620;
const EDGE = 110;
const GAP = 165;

// จำหมวดที่เลือกไว้ตลอด session จะได้กลับมาแผนที่แล้วยังอยู่หมวดเดิม
let activeSubject = 'all';

/* เส้นทางโค้งนุ่มๆ ผ่านทุกด่าน (Catmull-Rom แปลงเป็น Bezier) */
function smoothPath(pts) {
  if (pts.length < 2) return '';
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

function nodeHTML(lv, i, pt, W, currentId) {
  const stars = getStars(lv.id);
  const dots = [0, 1, 2].map((n) => `<span class="${n < stars ? '' : 'off'}">⭐</span>`).join('');
  return `
    <button class="node${lv.id === currentId ? ' current' : ''}" data-id="${lv.id}" aria-label="${lv.title}"
            style="left:${(pt.x / W) * 100}%; top:${(pt.y / H) * 100}%">
      <span class="node-num">${i + 1}</span>
      <span class="node-icon">${lv.icon}</span>
      <span class="node-stars">${dots}</span>
      <span class="node-label">${lv.title}</span>
    </button>`;
}

/* ป้ายชื่อโลก ปักไว้ด้านบนเหนือด่านแรกของแต่ละโลก (เฉพาะตอนดูทุกหมวด) */
function signHTML(w, pt, W) {
  return `<div class="world-sign" style="left:${(pt.x / W) * 100}%">${w.icon} ${w.name}</div>`;
}

function stageHTML(levels, currentId, withSigns) {
  const W = EDGE * 2 + GAP * Math.max(levels.length - 1, 0);
  const pts = levels.map((lv, i) => ({ x: EDGE + i * GAP, y: 330 - Math.sin(i * 0.85) * 155 }));
  const signs = withSigns ? WORLDS.filter((w) => w.from < levels.length).map((w) => signHTML(w, pts[w.from], W)) : [];
  return `
    <div class="map-stage" style="aspect-ratio:${W} / ${H}">
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
        <path class="map-path" d="${smoothPath(pts)}"/>
      </svg>
      ${signs.join('')}
      ${levels.map((lv, i) => nodeHTML(lv, i, pts[i], W, currentId)).join('')}
    </div>`;
}

export function showMap(root, params = {}) {
  if (SUBJECTS.some((s) => s.id === params.subject)) activeSubject = params.subject;
  const currentId = nextUnplayedId();
  const el = document.createElement('div');
  el.className = 'screen';
  el.innerHTML = `
    ${topBar('เลือกด่าน')}
    <div class="subject-bar" role="group" aria-label="หมวด">
      ${SUBJECTS.map((s) => `<button class="chip${s.id === activeSubject ? ' on' : ''}" data-s="${s.id}" aria-pressed="${s.id === activeSubject}">${s.icon} ${s.label}</button>`).join('')}
    </div>
    <div class="map-wrap" id="wrap"></div>`;
  root.appendChild(el);
  bindTopBar(el);

  const wrap = el.querySelector('#wrap');

  function renderStage() {
    const levels = activeSubject === 'all' ? LEVELS : LEVELS.filter((l) => l.subject === activeSubject);
    wrap.innerHTML = stageHTML(levels, currentId, activeSubject === 'all');

    wrap.querySelectorAll('.node').forEach((node) => {
      node.onclick = () => {
        sfx.tap();
        go('game', { levelId: node.dataset.id });
      };
    });

    // เลื่อนไปที่ด่านที่ควรเล่นต่อ ไม่ให้เด็กต้องหาเอง
    const current = wrap.querySelector('.node.current');
    requestAnimationFrame(() => {
      wrap.scrollLeft = current ? current.offsetLeft - wrap.clientWidth / 2 : 0;
    });
  }

  el.querySelectorAll('.chip').forEach((chip) => {
    chip.onclick = () => {
      sfx.tap();
      activeSubject = chip.dataset.s;
      el.querySelectorAll('.chip').forEach((c) => {
        c.classList.toggle('on', c === chip);
        c.setAttribute('aria-pressed', String(c === chip));
      });
      renderStage();
      const s = SUBJECTS.find((x) => x.id === activeSubject);
      speak(s.id === 'all' ? 'ทุกด่าน' : `ด่าน${s.label}`);
    };
  });

  renderStage();
  speak('เลือกด่านที่อยากเล่นได้เลย');
}
