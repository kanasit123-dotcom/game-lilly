import { animalHTML } from '../assets.js';
import { randInt, confetti, sayBubble } from '../utils.js';
import { sfx, speak } from '../audio.js';

/* หย่อนเบ็ดลึก: แตะค้างเพื่อหย่อนสายเบ็ดลงผ่านชั้นทะเล ปล่อยนิ้วเพื่อดึงกลับ
   ชั้นลึกวัตถุเร็วขึ้นและเล็กลงเล็กน้อย เต่ากับแมวน้ำเป็นเพื่อน จับไม่ได้ */

const GOAL = 4;
const HOOK_X = 50;
const SURFACE_Y = 7;
const MAX_Y = 89;
const LANES = [
  { y: 24, speed: 0.018, items: [{ e: '🐟', n: 'ปลา' }, { e: '🐠', n: 'ปลาส้ม' }, { asset: 'turtle', n: 'เต่า', friend: true }] },
  { y: 42, speed: -0.026, items: [{ e: '🦐', n: 'กุ้ง' }, { e: '🐡', n: 'ปลาปักเป้า' }, { e: '🐚', n: 'เปลือกหอย' }] },
  { y: 61, speed: 0.036, items: [{ e: '🦑', n: 'ปลาหมึก' }, { asset: 'seal', n: 'แมวน้ำ', friend: true }, { e: '⭐', n: 'ดาวทะเล' }] },
  { y: 79, speed: -0.048, items: [{ asset: 'octopus', n: 'หมึกยักษ์' }, { e: '💎', n: 'เพชรทะเล' }, { e: '🐠', n: 'ปลาทะเลลึก' }] },
];

function itemHTML(item) {
  return item.asset ? animalHTML(item.asset) : `<span>${item.e}</span>`;
}

export function mount(stage, cfg = {}) {
  let caught = 0;
  let hookY = SURFACE_Y;
  let mode = 'idle';
  let held = false;
  let attached = null;
  let completed = false;
  let disposed = false;
  let last = performance.now();
  let raf = 0;
  const motionOff = document.documentElement.classList.contains('reduce-motion') || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const objects = [];

  stage.innerHTML = `
    <div class="mini-hint deep-count" id="deep-count" role="status" aria-live="polite">ดึงของทะเล <b>0</b> / ${GOAL}</div>
    <div class="deep-sea" id="deep-sea" role="button" tabindex="0" aria-label="หย่อนเบ็ดลงทะเล">
      <div class="deep-skyline"><span>🎪</span><span>🎣</span><span>⭐</span></div>
      <div class="deep-water">
        <div class="deep-ripple"></div>
        ${LANES.map((lane, i) => `<div class="deep-band band-${i + 1}" style="--lane-y:${lane.y}%"></div>`).join('')}
        <div class="deep-line" id="deep-line"></div>
        <div class="deep-hook" id="deep-hook"><span>🎣</span></div>
      </div>
    </div>
    <div class="fish-feedback" id="deep-feedback" role="status" aria-live="polite">แตะค้างเพื่อหย่อนเบ็ด ปล่อยเพื่อดึงขึ้น</div>`;

  const $sea = stage.querySelector('#deep-sea');
  const $water = stage.querySelector('.deep-water');
  const $line = stage.querySelector('#deep-line');
  const $hook = stage.querySelector('#deep-hook');
  const $count = stage.querySelector('#deep-count b');
  const $feedback = stage.querySelector('#deep-feedback');

  function addObject(lane, laneIndex, item, itemIndex) {
    const el = document.createElement('div');
    el.className = `deep-object lane-${laneIndex + 1}${item.friend ? ' friend' : ''}`;
    el.innerHTML = itemHTML(item);
    el.setAttribute('aria-label', item.friend ? `${item.n} เป็นเพื่อน` : `ตก${item.n}`);
    $water.appendChild(el);
    const firstCatchable = lane.items.findIndex((candidate) => !candidate.friend);
    const stillX = [28, 70, 86][itemIndex] + (laneIndex % 2) * 2;
    const x = motionOff
      ? stillX
      : randInt(0, 100);
    const state = {
      el,
      item,
      x,
      y: lane.y,
      size: Math.max(40, 58 - laneIndex * 4),
      speed: motionOff ? 0 : lane.speed * (0.8 + Math.random() * 0.45),
      caught: false,
    };
    if (motionOff && !item.friend && itemIndex === firstCatchable) state.x = HOOK_X;
    objects.push(state);
  }

  LANES.forEach((lane, laneIndex) => lane.items.forEach((item, itemIndex) => addObject(lane, laneIndex, item, itemIndex)));

  function setHook(y) {
    hookY = Math.max(SURFACE_Y, Math.min(MAX_Y, y));
    $line.style.height = `${hookY}%`;
    $hook.style.left = `${HOOK_X}%`;
    $hook.style.top = `${hookY}%`;
  }

  function startDrop() {
    if (completed || disposed || mode === 'up') return;
    held = true;
    mode = 'down';
    $sea.classList.add('dropping');
    $feedback.textContent = 'เบ็ดกำลังลงไปลึกขึ้น';
    sfx.tap();
  }

  function pullUp() {
    held = false;
    if (mode === 'down') {
      mode = 'up';
      $sea.classList.remove('dropping');
      $feedback.textContent = attached ? `ดึง${attached.item.n}ขึ้นมาเลย` : 'ดึงเบ็ดกลับขึ้นมา';
      sfx.tap();
    }
  }

  function resetHook(message) {
    attached = null;
    mode = 'idle';
    held = false;
    setHook(SURFACE_Y);
    $sea.classList.remove('dropping');
    $hook.classList.remove('has-catch', 'friend-bump');
    if (message) $feedback.textContent = message;
  }

  function completeCatch() {
    if (!attached || completed) return;
    caught++;
    $count.textContent = caught;
    $feedback.textContent = `ได้${attached.item.n}แล้ว อีก ${Math.max(GOAL - caught, 0)} อย่างนะ`;
    attached.el.remove();
    objects.splice(objects.indexOf(attached), 1);
    attached = null;
    $hook.classList.remove('has-catch');
    sfx.correct();
    confetti(stage, 12);
    if (caught >= GOAL) {
      completed = true;
      $feedback.textContent = 'เยี่ยมมาก! ดึงของทะเลครบแล้ว';
      speak('เยี่ยมมาก ดึงของทะเลครบแล้ว');
      cfg.onComplete?.();
      return;
    }
    resetHook();
  }

  function bumpFriend(obj) {
    mode = 'up';
    held = false;
    $sea.classList.remove('dropping');
    $hook.classList.add('friend-bump');
    obj.el.classList.add('wave');
    sfx.retry();
    sayBubble(stage, `${obj.item.n}มาทักทาย`);
    $feedback.textContent = `${obj.item.n}เป็นเพื่อน ดึงเบ็ดขึ้นก่อนนะ`;
    speak(`${obj.item.n}เป็นเพื่อน ลองหย่อนตรงอื่นนะ`);
    setTimeout(() => obj.el.classList.remove('wave'), 800);
  }

  function catchObject(obj) {
    attached = obj;
    obj.caught = true;
    mode = 'up';
    held = false;
    $sea.classList.remove('dropping');
    $hook.classList.add('has-catch');
    $feedback.textContent = `ติด${obj.item.n}แล้ว ดึงขึ้นมา`;
    sfx.bundle();
  }

  function checkCollision() {
    if (mode !== 'down' || attached) return;
    for (const obj of objects) {
      if (obj.caught) continue;
      const dx = Math.abs(obj.x - HOOK_X);
      const dy = Math.abs(obj.y - hookY);
      if (dx < 6 && dy < 5) {
        if (obj.item.friend) bumpFriend(obj);
        else catchObject(obj);
        return;
      }
    }
  }

  function renderObjects(dt) {
    objects.forEach((obj) => {
      if (!obj.caught) {
        obj.x += obj.speed * dt;
        if (obj.x < -12) obj.x = 112;
        if (obj.x > 112) obj.x = -12;
      } else {
        obj.x = HOOK_X;
        obj.y = hookY + 2;
      }
      obj.el.style.left = `${obj.x}%`;
      obj.el.style.top = `${obj.y}%`;
      obj.el.style.width = `${obj.size}px`;
      obj.el.style.height = `${obj.size}px`;
      obj.el.style.setProperty('--flip', obj.speed < 0 ? '-1' : '1');
    });
  }

  function tick(now) {
    if (disposed) return;
    const dt = Math.min(40, now - last);
    last = now;
    if (mode === 'down') {
      setHook(hookY + dt * 0.035);
      if (!held || hookY >= MAX_Y) pullUp();
      checkCollision();
    } else if (mode === 'up') {
      setHook(hookY - dt * 0.055);
      if (hookY <= SURFACE_Y + 0.5) {
        if (attached) completeCatch();
        else resetHook('แตะค้างเพื่อหย่อนเบ็ดอีกครั้ง');
      }
    }
    renderObjects(dt);
    raf = requestAnimationFrame(tick);
  }

  $sea.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    try { $sea.setPointerCapture?.(e.pointerId); } catch {}
    startDrop();
  });
  $sea.addEventListener('pointerup', pullUp);
  $sea.addEventListener('pointercancel', pullUp);
  $sea.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); startDrop(); }
  });
  $sea.addEventListener('keyup', (e) => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); pullUp(); }
  });

  setHook(SURFACE_Y);
  renderObjects(0);
  raf = requestAnimationFrame(tick);
  speak('แตะค้างเพื่อหย่อนเบ็ดลงไป ปล่อยนิ้วเพื่อดึงขึ้น เต่ากับแมวน้ำเป็นเพื่อนนะ');

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
  };
}
