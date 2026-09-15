import { go } from '../router.js';
import { sfx } from '../audio.js';
import { miniUnlocked } from '../rewards.js';
import { mount as coloring } from '../mini/coloring.js';
import { mount as garden } from '../mini/garden.js';
import { mount as bakery } from '../mini/bakery.js';
import { mount as xylo } from '../mini/xylo.js';
import { mount as balloons } from '../mini/balloons.js';
import { mount as aquarium } from '../mini/aquarium.js';
import { mount as dressup } from '../mini/dressup.js';
import { mount as draw } from '../mini/draw.js';
import { mount as drums } from '../mini/drums.js';
import { mount as fishing } from '../mini/fishing.js';
import { mount as harvest } from '../mini/harvest.js';
import { animalHTML, iconHTML, renderIcons } from '../assets.js';
import { menuHeader, bindMenu } from './menu.js';
import { nextLevelId, nextUnplayedId, getMini, setMini } from '../state.js';
import { getLevel } from '../levels.js';
import { REWARDS } from '../rewards.js';

/* หน้าโฮสต์มินิเกม ไม่มีคะแนน ไม่มีดาว เล่นเพื่อสนุกอย่างเดียว
   id ต้องตรงกับ id รางวัลใน rewards.js */

const MINIS = {
  harvest: { title: 'สวนแครอตของเรา', mount: harvest },
  coloring: { title: '🎨 ระบายสี: ใต้ทะเล', mount: coloring, cfg: { pack: 'sea' } },
  coloring2: { title: '🏠 ระบายสี: บ้านแสนสุข', mount: coloring, cfg: { pack: 'home' } },
  coloring3: { title: '🦋 ระบายสี: สวนสนุก', mount: coloring, cfg: { pack: 'fun' } },
  coloring4: { title: '🎂 ระบายสี: วันเกิด', mount: coloring, cfg: { pack: 'party' } },
  xylo: { title: '🎵 ระนาดหรรษา', mount: xylo },
  garden: { title: '🌱 สวนผักของลิลลี่', mount: garden },
  balloons: { title: '🎈 ป๊อปลูกโป่ง', mount: balloons },
  bakery: { title: '🧁 ร้านขนมของลิลลี่', mount: bakery },
  aquarium: { title: '🐠 ตู้ปลาของลิลลี่', mount: aquarium },
  dressup: { title: '👒 แต่งตัวเพื่อนซี้', mount: dressup },
  draw: { title: '🖍️ กระดานวาดรูป', mount: draw },
  drums: { title: '🥁 กลองหรรษา', mount: drums },
  fishing: { title: '🎣 ตกปลา', mount: fishing },
};

export function showPlayroom(root) {
  const el = document.createElement('div');
  el.className = 'screen lilly-scroll';
  el.innerHTML = `${menuHeader('playroom')}<div class="lilly-content"><div class="lilly-eyebrow">พักสักนิด แล้วเรียนต่อ</div><h1>สวนพักเล่นของลิลลี่</h1><p class="lilly-subtitle">เลือกเล่นหนึ่งรอบ แล้วไปเรียนรู้เรื่องใหม่กัน</p><div class="playroom-grid">${Object.entries(MINIS).map(([id, mini]) => {
    const unlocked = miniUnlocked(id);
    const reward = REWARDS.find(r => r.id === id);
    return `<button class="playroom-item" data-mini="${id}" ${unlocked ? '' : 'disabled'}>${animalHTML(id === 'harvest' || id === 'garden' ? 'turtle' : id.includes('coloring') ? 'rabbit' : 'seal')}<b>${mini.title}</b><small>${unlocked ? (id === 'harvest' ? 'เก็บแครอต 5 หัว' : 'หนึ่งรอบไม่เกิน 90 วินาที') : `ปลดล็อกที่ ${reward.stars} ดาว`}</small></button>`;
  }).join('')}</div></div>`;
  root.appendChild(el);
  bindMenu(el);
  el.querySelectorAll('[data-mini]:not(:disabled)').forEach(button => { button.onclick = () => go('mini', { id: button.dataset.mini }); });
}

export function showMini(root, { id, fromLevelId }) {
  const mini = MINIS[id];
  if (!mini || !miniUnlocked(id)) { queueMicrotask(() => go('playroom')); return; }

  const el = document.createElement('div');
  el.className = 'screen game-screen';
  el.innerHTML = `
    <div class="game-bar">
      <button class="icon-btn" id="back" title="เลือกเกมพักเล่น" aria-label="เลือกเกมพักเล่น">${iconHTML('arrow-left')}</button>
      <div class="spacer"></div>
      <div class="star-counter">${mini.title}</div>
    </div>
    <div class="mini-session-bar"><span>ช่วงพักของลิลลี่</span><progress id="break-progress" max="90000" value="0" aria-label="ช่วงพักที่ผ่านไป"></progress><button class="lilly-text" id="finish-break">พักพอแล้ว</button></div>
    <div class="game-stage mini-stage" id="stage"><div class="mini-content"></div></div>`;
  root.appendChild(el);

  let ended = false, disposed = false, elapsed = 0, last = performance.now();
  let disposeMini;
  let timer;
  const child = el.querySelector('.mini-content');
  const target = (getLevel(fromLevelId) && nextLevelId(fromLevelId)) || nextUnplayedId();
  function dispose() {
    if (disposed) return;
    disposed = true;
    clearInterval(timer);
    document.removeEventListener('visibilitychange', resetClock);
    disposeMini?.();
    child.remove();
    window.speechSynthesis?.cancel();
  }
  function finish() {
    if (ended) return;
    ended = true;
    const date = new Date().toDateString();
    const activity = getMini('dailyActivity') || {};
    setMini('dailyActivity', { date, breaks: (activity.date === date ? activity.breaks || 0 : 0) + 1 });
    dispose();
    el.querySelector('.mini-session-bar').remove();
    el.querySelector('#stage').innerHTML = `<div class="break-complete">${animalHTML(getMini('preferences')?.buddy || 'rabbit', 'happy')}<h1>พักเต็มอิ่มแล้ว</h1><p>เรื่องใหม่รอเราอยู่: ${getLevel(target).title}</p><div class="learning-actions"><button class="btn green" id="return-lesson">ไปเรียนต่อ ${iconHTML('arrow-right')}</button><button class="btn secondary" id="finish-today">วันนี้พอแค่นี้</button></div></div>`;
    el.querySelector('#return-lesson').onclick = () => go('game', { levelId: target });
    el.querySelector('#finish-today').onclick = () => go('home');
    renderIcons();
  }
  function resetClock() { last = performance.now(); }
  el.querySelector('#back').onclick = () => { sfx.tap(); go('playroom'); };
  el.querySelector('#finish-break').onclick = finish;
  disposeMini = mini.mount(child, { ...mini.cfg, onComplete: finish });
  document.addEventListener('visibilitychange', resetClock);
  timer = setInterval(() => {
    const now = performance.now();
    if (!document.hidden) elapsed += now - last;
    last = now;
    el.querySelector('#break-progress').value = Math.min(elapsed, 90000);
    if (elapsed >= 90000) finish();
  }, 250);
  return dispose;
}
