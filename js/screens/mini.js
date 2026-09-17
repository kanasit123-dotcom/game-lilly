import { go } from '../router.js';
import { sfx, speak } from '../audio.js';
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
import { mount as deepfish } from '../mini/deepfish.js';
import { mount as harvest } from '../mini/harvest.js';
import { mount as writing } from '../mini/writing.js';
import { animalHTML } from '../assets.js';
import { topBar, bindTopBar } from './menu.js';
import { nextLevelId, nextUnplayedId, getMini, setMini } from '../state.js';
import { getLevel } from '../levels.js';
import { REWARDS } from '../rewards.js';

/* หน้าโฮสต์มินิเกม ไม่มีคะแนน ไม่มีดาว เล่นเพื่อสนุกอย่างเดียว
   id ต้องตรงกับ id รางวัลใน rewards.js ยกเว้นเกม always ที่เปิดตั้งแต่แรก
   เล่นได้รอบละ BREAK_SECONDS วินาที (หรือจนถึงเป้าของเกมนั้น) แล้วชวนกลับไปเล่นด่านต่อ
   ยกเว้นเกมเขียนอักษรที่ตั้งใจให้ฝึกช้าๆ ได้โดยไม่หมดเวลา */

export const BREAK_SECONDS = 180;

const MINIS = {
  harvest: { title: 'สวนแครอต', emoji: '🥕', mount: harvest },
  writing: { title: 'ฝึกเขียนอักษร', emoji: '✍️', mount: writing, always: true, noLimit: true },
  coloring: { title: 'ระบายสี ใต้ทะเล', emoji: '🎨', mount: coloring, cfg: { pack: 'sea' } },
  coloring2: { title: 'ระบายสี บ้านแสนสุข', emoji: '🏠', mount: coloring, cfg: { pack: 'home' } },
  coloring3: { title: 'ระบายสี สวนสนุก', emoji: '🦋', mount: coloring, cfg: { pack: 'fun' } },
  coloring4: { title: 'ระบายสี วันเกิด', emoji: '🎂', mount: coloring, cfg: { pack: 'party' } },
  xylo: { title: 'ระนาดหรรษา', emoji: '🎵', mount: xylo },
  garden: { title: 'สวนผัก', emoji: '🌱', mount: garden },
  balloons: { title: 'ป๊อปลูกโป่ง', emoji: '🎈', mount: balloons },
  bakery: { title: 'ร้านขนม', emoji: '🧁', mount: bakery },
  aquarium: { title: 'ตู้ปลา', emoji: '🐠', mount: aquarium },
  dressup: { title: 'แต่งตัวเพื่อนซี้', emoji: '👒', mount: dressup },
  draw: { title: 'กระดานวาดรูป', emoji: '🖍️', mount: draw },
  drums: { title: 'กลองหรรษา', emoji: '🥁', mount: drums },
  fishing: { title: 'ตกปลา', emoji: '🎣', mount: fishing },
  deepfish: { title: 'หย่อนเบ็ดลึก', emoji: '🎣', mount: deepfish },
};

/* สวนพักเล่น: ปุ่มรูปใหญ่ๆ อันละเกม แตะแล้วเล่นเลย อันที่ยังไม่ปลดล็อกเป็นสีเทามีแม่กุญแจ */
export function showPlayroom(root) {
  const el = document.createElement('div');
  el.className = 'screen summary';
  el.innerHTML = `
    ${topBar('พักเล่น')}
    <div class="summary-body">
      <div class="playroom-grid">
        ${Object.entries(MINIS).map(([id, mini]) => ({ id, mini, unlocked: mini.always || miniUnlocked(id), reward: REWARDS.find((r) => r.id === id) }))
          // เกมที่เล่นได้อยู่บนสุด ที่ล็อกอยู่เรียงตามดาวที่ต้องใช้ เด็กจะได้เห็นว่าอันไหนใกล้ได้
          .sort((a, b) => (b.unlocked - a.unlocked) || ((a.reward?.stars || 0) - (b.reward?.stars || 0)))
          .map(({ id, mini, unlocked, reward }) => `
            <button class="playroom-item${unlocked ? '' : ' locked'}" data-mini="${id}" aria-label="${mini.title}${unlocked ? '' : ' (ยังไม่ปลดล็อก)'}">
              <span class="tile-icon">${unlocked ? mini.emoji : '🔒'}</span>
              <b>${mini.title}</b>
              ${unlocked ? '' : `<small>⭐ ${reward.stars}</small>`}
            </button>`).join('')}
      </div>
    </div>`;
  root.appendChild(el);
  bindTopBar(el);
  el.querySelectorAll('[data-mini]').forEach((button) => {
    button.onclick = () => {
      if (button.classList.contains('locked')) {
        sfx.retry();
        button.classList.remove('nope'); void button.offsetWidth; button.classList.add('nope');
        speak(`เก็บดาวให้ครบ ${REWARDS.find((r) => r.id === button.dataset.mini).stars} ดวงก่อนนะ`);
        return;
      }
      sfx.tap();
      go('mini', { id: button.dataset.mini });
    };
  });
  speak('เลือกเกมที่อยากเล่น');
}

export function showMini(root, { id, fromLevelId }) {
  const mini = MINIS[id];
  if (!mini || !(mini.always || miniUnlocked(id))) { queueMicrotask(() => go('playroom')); return; }
  const noLimit = Boolean(mini.noLimit);
  const limit = BREAK_SECONDS * 1000;

  const el = document.createElement('div');
  el.className = 'screen game-screen';
  el.innerHTML = `
    <div class="game-bar">
      <button class="icon-btn" id="back" aria-label="กลับไปเลือกเกม">←</button>
      ${noLimit ? '' : `<div class="break-clock" title="เวลาพักเล่น"><span>⏳</span><progress id="break-progress" max="${limit}" value="0" aria-label="เวลาพักเล่นที่ผ่านไป"></progress></div>`}
      <div class="spacer"></div>
      <div class="star-counter">${mini.emoji} ${mini.title}</div>
      <button class="icon-btn" id="finish-break" aria-label="เล่นเสร็จแล้ว">✅</button>
    </div>
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
    el.querySelector('#finish-break').remove();
    el.querySelector('.break-clock')?.remove();
    el.querySelector('#stage').innerHTML = `
      <div class="break-complete">
        ${animalHTML(getMini('preferences')?.buddy || 'turtle', 'happy')}
        <h1 class="outlined">สนุกจังเลย!</h1>
        <p>ไปเล่นด่านต่อกันนะ: ${getLevel(target).icon} ${getLevel(target).title}</p>
        <div class="result-actions">
          <button class="btn big green" id="return-lesson">เล่นด่านต่อ ▶</button>
          <button class="btn yellow" id="more-play">🎈 เล่นเกมอื่น</button>
          <button class="btn blue" id="finish-today">🏠 หน้าแรก</button>
        </div>
      </div>`;
    el.querySelector('#return-lesson').onclick = () => { sfx.tap(); go('game', { levelId: target }); };
    el.querySelector('#more-play').onclick = () => { sfx.tap(); go('playroom'); };
    el.querySelector('#finish-today').onclick = () => { sfx.tap(); go('home'); };
    sfx.win();
    speak('สนุกจังเลย ไปเล่นด่านต่อกันนะ');
  }
  function resetClock() { last = performance.now(); }
  el.querySelector('#back').onclick = () => { sfx.tap(); go('playroom'); };
  el.querySelector('#finish-break').onclick = () => { sfx.tap(); finish(); };
  disposeMini = mini.mount(child, { ...mini.cfg, onComplete: finish });
  if (!noLimit) {
    document.addEventListener('visibilitychange', resetClock);
    timer = setInterval(() => {
      const now = performance.now();
      if (!document.hidden) elapsed += now - last;
      last = now;
      const bar = el.querySelector('#break-progress');
      if (bar) bar.value = Math.min(elapsed, limit);
      if (elapsed >= limit) finish();
    }, 250);
  }
  return dispose;
}
