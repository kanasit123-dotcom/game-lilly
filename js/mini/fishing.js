import { randInt, pick, confetti, sayBubble } from '../utils.js';
import { sfx, speak } from '../audio.js';

/* ตกปลา: ปลาว่ายผ่านบ่อไปเรื่อยๆ แตะจับใส่ถัง เต่ากับแมวน้ำแตะแล้วแค่ทักทาย จับไม่ได้ (ลิลลี่ชอบสองตัวนี้)
   ไม่มีเวลา ไม่มีแพ้ เล่นได้เรื่อยๆ ปล่อยปลากลับบ้านเมื่อไหร่ก็ได้ */

const FISH = ['🐟', '🐠', '🐡', '🦐', '🦑', '🐙'];
const SPECIAL = ['🐢', '🦭'];
const GREET = { '🐢': 'สวัสดีจ้า 🐢', '🦭': 'แมวน้ำมาทักทาย 🦭' };

export function mount(stage, cfg = {}) {
  let caught = 0;
  let timer = null;
  const bucket = []; // emoji ที่จับล่าสุด เก็บไว้ไม่เกิน 8 ตัว

  stage.innerHTML = `
    <div class="mini-hint fish-count" id="hint">จับได้ <b>0</b> ตัว 🪣</div>
    <div class="bucket" id="bucket"></div>
    <div class="pond" id="pond"></div>
    <div class="mini-actions">
      <button class="btn blue" id="release">ปล่อยปลากลับบ้าน 🌊</button>
    </div>`;

  const $pond = stage.querySelector('#pond');
  const $count = stage.querySelector('#hint b');
  const $bucket = stage.querySelector('#bucket');

  function renderBucket() {
    $bucket.innerHTML = bucket.map((e) => `<span>${e}</span>`).join('');
  }

  function spawn() {
    if (!stage.isConnected) { clearInterval(timer); return; } // ผู้ใช้กดกลับไปหน้าอื่นแล้ว
    const goingRight = Math.random() < 0.5;
    const special = Math.random() < 0.15;
    const emoji = special ? pick(SPECIAL) : pick(FISH);

    const el = document.createElement('button');
    el.className = 'fish';
    el.innerHTML = `<span class="fish-emoji">${emoji}</span>`;
    el.style.top = randInt(10, 80) + '%';
    el.style.setProperty('--sz', randInt(55, 100) / 10 + 'vw'); // ขนาดสุ่ม ผ่าน clamp ใน CSS
    // ใช้ --dur (custom property) แทน el.style.animationDuration ตรงๆ เพราะ inline style
    // จะชนะ animation-duration ของ .fish.caught เสมอไม่ว่า specificity เท่าไหร่ ทำให้ตอนจับได้
    // เล่นแอนิเมชันลอยหาย .5s ไม่ได้ (จะกลายเป็นยาวเท่าเวลาว่าย 6-12s แทน)
    el.style.setProperty('--dur', randInt(6, 12) + 's');
    // emoji ปลา/เต่า/แมวน้ำ หันหน้าไปทางซ้ายอยู่แล้ว (ทั้ง Apple และ Google) ตัวที่ว่ายไปขวาต้องพลิก
    if (goingRight) {
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
      if (el.classList.contains('caught') || el.classList.contains('boing')) return;

      if (special) {
        el.classList.add('boing');
        sayBubble(stage, GREET[emoji]);
        setTimeout(() => el.classList.remove('boing'), 1000);
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
      setTimeout(() => el.remove(), 500);
      if (caught % 5 === 0) { confetti(stage, 26); speak(`จับได้ ${caught} ตัวแล้ว เก่งมาก`); }
      if (caught >= 5) cfg.onComplete?.();
    });

    // e.target !== el กันไว้ เพราะ animationend ของ .fish-emoji (ตอน boing) ก็ผุดขึ้นมาถึงปุ่มนี้ด้วย
    el.addEventListener('animationend', (e) => {
      if (e.target !== el) return;
      if (!el.classList.contains('caught')) el.remove();
    });

    $pond.appendChild(el);
  }

  stage.querySelector('#release').onclick = () => {
    caught = 0;
    $count.textContent = 0;
    bucket.length = 0;
    renderBucket();
    sfx.win();
    speak('ปล่อยปลากลับบ้านแล้ว ใจดีจัง');
  };

  timer = setInterval(spawn, 1100);
  spawn();
  speak('แตะปลาที่ว่ายผ่านมา จับใส่ถัง');
  return () => clearInterval(timer);
}
