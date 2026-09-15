import { randInt, pick, confetti, sayBubble } from '../utils.js';
import { sfx, speak } from '../audio.js';

/* ตกปลา: ปลาว่ายผ่านบ่อ แตะจับใส่ถัง เต่ากับแมวน้ำแตะแล้วแค่ทักทาย
   ครบ 5 ตัวจบรอบ เพื่อให้เด็กเห็นเป้าหมายและรู้ว่าเล่นต่อได้เมื่อไหร่ */

const FISH = ['🐟', '🐠', '🐡', '🦐', '🦑', '🐙'];
const SPECIAL = ['🐢', '🦭'];
const GREET = { '🐢': 'สวัสดีจ้า 🐢', '🦭': 'แมวน้ำมาทักทาย 🦭' };
const FISH_NAMES = { '🐟': 'ปลาสีฟ้า', '🐠': 'ปลาการ์ตูน', '🐡': 'ปลาปักเป้า', '🦐': 'กุ้ง', '🦑': 'ปลาหมึก', '🐙': 'หมึกยิ้ม' };
const GOAL = 5;

export function mount(stage, cfg = {}) {
  let caught = 0;
  let timer = null;
  let disposed = false;
  let completed = false;
  const timers = new Set();
  const bucket = []; // emoji ที่จับล่าสุด เก็บไว้ไม่เกิน 8 ตัว

  stage.innerHTML = `
    <div class="mini-hint fish-count" id="hint" role="status" aria-live="polite">ภารกิจ: จับปลา <b>0</b> / ${GOAL} ตัว</div>
    <div class="bucket" id="bucket" aria-label="ปลาที่จับได้" role="list"></div>
    <div class="pond" id="pond"></div>
    <div class="fish-feedback" id="fish-feedback" role="status" aria-live="polite">ปลาว่ายมาแล้ว แตะปลาให้ทันนะ</div>
    <div class="mini-actions">
      <button class="btn blue" id="release" aria-label="ปล่อยปลากลับบ้านและเริ่มใหม่">ปล่อยปลากลับบ้าน 🌊</button>
    </div>`;

  const $pond = stage.querySelector('#pond');
  const $count = stage.querySelector('#hint b');
  const $bucket = stage.querySelector('#bucket');
  const $feedback = stage.querySelector('#fish-feedback');

  function renderBucket() {
    $bucket.innerHTML = bucket.map((e, i) => `<span role="listitem" aria-label="${FISH_NAMES[e] || 'ปลาที่จับได้'} ตัวที่ ${i + 1}">${e}</span>`).join('');
  }

  function spawn() {
    if (disposed || !stage.isConnected) { cleanup(); return; }
    const goingRight = Math.random() < 0.5;
    const special = Math.random() < 0.15;
    const emoji = special ? pick(SPECIAL) : pick(FISH);
    const motionOff = document.documentElement.classList.contains('reduce-motion') || matchMedia('(prefers-reduced-motion: reduce)').matches;

    const el = document.createElement('button');
    el.className = 'fish';
    el.innerHTML = `<span class="fish-emoji">${emoji}</span>`;
    el.setAttribute('aria-label', special ? GREET[emoji] : `จับ${FISH_NAMES[emoji] || 'ปลา'}`);
    el.style.top = randInt(10, 80) + '%';
    el.style.setProperty('--sz', randInt(55, 100) / 10 + 'vw'); // ขนาดสุ่ม ผ่าน clamp ใน CSS
    // ใช้ --dur (custom property) แทน el.style.animationDuration ตรงๆ เพราะ inline style
    // จะชนะ animation-duration ของ .fish.caught เสมอไม่ว่า specificity เท่าไหร่ ทำให้ตอนจับได้
    // เล่นแอนิเมชันลอยหาย .5s ไม่ได้ (จะกลายเป็นยาวเท่าเวลาว่าย 6-12s แทน)
    el.style.setProperty('--dur', randInt(6, 12) + 's');
    // emoji ปลา/เต่า/แมวน้ำ หันหน้าไปทางซ้ายอยู่แล้ว (ทั้ง Apple และ Google) ตัวที่ว่ายไปขวาต้องพลิก
    if (motionOff) {
      el.classList.add('motion-off');
      el.style.left = randInt(8, 82) + '%';
      el.style.setProperty('--flip', goingRight ? '-1' : '1');
      const expiryTimer = setTimeout(() => { timers.delete(expiryTimer); el.remove(); }, 6500);
      timers.add(expiryTimer);
    } else if (goingRight) {
      el.style.left = '-14%';
      el.style.setProperty('--dx', 'calc(100vw + 20%)');
      el.style.setProperty('--flip', '-1');
    } else {
      el.style.left = '110%';
      el.style.setProperty('--dx', 'calc(-100vw - 20%)');
      el.style.setProperty('--flip', '1');
    }

    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (disposed || completed || el.classList.contains('caught') || el.classList.contains('boing')) return;

      if (special) {
        el.classList.add('boing');
        sayBubble(stage, GREET[emoji]);
        $feedback.textContent = GREET[emoji] + ' แตะปลาแทนได้เลย';
        const greetingTimer = setTimeout(() => { timers.delete(greetingTimer); el.classList.remove('boing'); }, 1000);
        timers.add(greetingTimer);
        return; // เต่า/แมวน้ำ จับไม่ได้ แค่ทักทาย ยังว่ายต่อ
      }

      // ตรึงตำแหน่งปัจจุบันไว้ก่อน ไม่งั้นพอสลับ animation ตัวปลาจะเด้งกลับไปจุดเริ่มนอกบ่อ
      const pr = $pond.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      el.style.left = `${r.left - pr.left}px`;
      el.style.top = `${r.top - pr.top}px`;
      el.classList.add('caught');
      sfx.tap();
      caught++;
      $count.textContent = caught;
      bucket.unshift(emoji);
      if (bucket.length > 8) bucket.length = 8;
      renderBucket();
      $feedback.textContent = `จับ${FISH_NAMES[emoji] || 'ปลา'}ได้แล้ว อีก ${Math.max(GOAL - caught, 0)} ตัวนะ`;
      const removeTimer = setTimeout(() => { timers.delete(removeTimer); el.remove(); }, 500);
      timers.add(removeTimer);
      if (caught % 5 === 0) { confetti(stage, 26); speak(`จับได้ ${caught} ตัวแล้ว เก่งมาก`); }
      if (caught >= GOAL && !completed) {
        completed = true;
        $feedback.textContent = 'เยี่ยมมาก! จับครบ 5 ตัวแล้ว จบรอบตกปลา 🎉';
        clearInterval(timer);
        cfg.onComplete?.();
      }
    });

    // e.target !== el กันไว้ เพราะ animationend ของ .fish-emoji (ตอน boing) ก็ผุดขึ้นมาถึงปุ่มนี้ด้วย
    el.addEventListener('animationend', (e) => {
      if (e.target !== el) return;
      if (!el.classList.contains('caught')) el.remove();
    });

    $pond.appendChild(el);
  }

  stage.querySelector('#release').onclick = () => {
    if (disposed) return;
    caught = 0;
    completed = false;
    $count.textContent = 0;
    bucket.length = 0;
    renderBucket();
    $feedback.textContent = 'ปล่อยปลากลับบ้านแล้ว เริ่มจับรอบใหม่ได้เลย';
    sfx.win();
    speak('ปล่อยปลากลับบ้านแล้ว ใจดีจัง');
  };

  function cleanup() {
    if (disposed) return;
    disposed = true;
    clearInterval(timer);
    timers.forEach((timeout) => clearTimeout(timeout));
    timers.clear();
    $pond.querySelectorAll('.fish').forEach((fish) => fish.remove());
  }

  timer = setInterval(spawn, 1100);
  spawn();
  speak('ภารกิจจับปลา 5 ตัว แตะปลาที่ว่ายผ่านมา จับใส่ถัง');
  return cleanup;
}
