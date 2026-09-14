import { randInt, pick, shuffle, wait, confetti, sayBubble, cheerBuddy, buddyHTML } from '../utils.js';
import { sfx, speak } from '../audio.js';

/* เรียงลำดับ: เด็กแตะการ์ดทีละใบตามลำดับที่ถูก การ์ดที่แตะถูกจะไปเรียงในช่องคำตอบ
   cfg: { kind: 'numbers' | 'size' | 'story', count: 5 } */

const SIZE_EMOJI = ['🐢', '🦭', '🐱', '🍎', '⭐', '🎈', '🐟', '🌸'];

/* แต่ละเรื่องคือลำดับเหตุการณ์ที่ถูกต้อง (emoji + คำบรรยายสั้น) */
const STORIES = [
  [{ emoji: '🥚', cap: 'ไข่' }, { emoji: '🐣', cap: 'ฟักออกจากไข่' }, { emoji: '🐥', cap: 'ลูกเจี๊ยบ' }, { emoji: '🐔', cap: 'ไก่' }],
  [{ emoji: '🌰', cap: 'เมล็ด' }, { emoji: '🌱', cap: 'ต้นอ่อน' }, { emoji: '🌳', cap: 'ต้นไม้ใหญ่' }, { emoji: '🍎', cap: 'ออกผล' }],
  [{ emoji: '🥚', cap: 'ไข่' }, { emoji: '🐛', cap: 'หนอน' }, { emoji: '🦋', cap: 'ผีเสื้อ' }],
  [{ emoji: '🛏️', cap: 'ตื่นนอน' }, { emoji: '🪥', cap: 'แปรงฟัน' }, { emoji: '🍳', cap: 'กินข้าว' }, { emoji: '🏫', cap: 'ไปโรงเรียน' }],
  [{ emoji: '☁️', cap: 'เมฆ' }, { emoji: '🌧️', cap: 'ฝนตก' }, { emoji: '🌈', cap: 'รุ้งกินน้ำ' }],
  [{ emoji: '🍞', cap: 'ขนมปัง' }, { emoji: '🧈', cap: 'ทาเนย' }, { emoji: '🥪', cap: 'แซนด์วิช' }],
  [{ emoji: '👶', cap: 'เด็กทารก' }, { emoji: '🧒', cap: 'เด็ก' }, { emoji: '🧑', cap: 'ผู้ใหญ่' }, { emoji: '🧓', cap: 'คุณตาคุณยาย' }],
  [{ emoji: '🧼', cap: 'ถูสบู่' }, { emoji: '💦', cap: 'ล้างน้ำ' }, { emoji: '🧻', cap: 'เช็ดมือ' }],
  [{ emoji: '🥚', cap: 'ไข่เต่า' }, { emoji: '🐢', cap: 'เต่าน้อย' }, { emoji: '🌊', cap: 'ว่ายไปทะเล' }],
];

/* สุ่มลำดับ index แต่ต้องไม่บังเอิญเรียงถูกอยู่แล้ว (เหลือแค่สุ่มโชว์ ไม่ใช่ลำดับคำตอบจริง) */
function shuffledOrder(n) {
  const base = Array.from({ length: n }, (_, i) => i);
  if (n < 2) return base;
  let order = shuffle(base);
  let guard = 0;
  while (order.every((v, i) => v === i) && guard < 30) {
    order = shuffle(base);
    guard++;
  }
  if (order.every((v, i) => v === i)) [order[0], order[1]] = [order[1], order[0]];
  return order;
}

function makeNumbers() {
  let nums;
  let prompt;
  if (Math.random() < 0.3) {
    const start = randInt(1, 6) * 2; // เลขคู่เริ่ม 2..12
    nums = [0, 1, 2, 3, 4].map((i) => start + i * 2);
    prompt = 'นับทีละ 2 เรียงจากน้อยไปมาก';
  } else {
    const start = randInt(1, 16);
    nums = [0, 1, 2, 3, 4].map((i) => start + i);
    prompt = 'เรียงตัวเลขจากน้อยไปมาก';
  }
  const items = nums.map((n) => ({ html: `<span class="ot-num">${n}</span>`, say: String(n) }));
  return { prompt, items, sayDone: nums.join(' ') };
}

function makeSize() {
  const emoji = pick(SIZE_EMOJI);
  const growing = Math.random() < 0.65;
  const order = growing ? [1, 2, 3, 4] : [4, 3, 2, 1];
  const items = order.map((n) => ({ html: `<span class="ot-emoji size-${n}">${emoji}</span>` }));
  return {
    prompt: growing ? 'เรียงจากเล็กไปใหญ่' : 'เรียงจากใหญ่ไปเล็ก',
    items,
    sayDone: growing ? 'เล็กไปใหญ่' : 'ใหญ่ไปเล็ก',
  };
}

/* คิวเรื่อง สลับไว้ล่วงหน้าแล้วหยิบเรียง กันเรื่องซ้ำกันใน 1 ด่าน */
function makeStoryPicker() {
  const pool = shuffle(STORIES);
  return () => {
    if (!pool.length) pool.push(...shuffle(STORIES)); // ด่านยาวกว่าจำนวนเรื่อง ค่อยสลับชุดใหม่
    return pool.shift();
  };
}

function makeStory(nextStory) {
  const story = nextStory();
  const items = story.map((s) => ({
    html: `<span class="ot-emoji">${s.emoji}</span><span class="ot-cap">${s.cap}</span>`,
    cls: 'story',
    say: s.cap,
  }));
  return {
    prompt: 'เรียงลำดับเหตุการณ์ อะไรเกิดก่อน-หลัง',
    items,
    sayDone: story.map((s) => s.cap).join(' แล้ว '),
  };
}

export function play(stage, config, hooks = {}) {
  return new Promise((resolve) => {
    const kind = config.kind || 'numbers';
    const total = config.count || 5;
    const nextStory = makeStoryPicker();
    let idx = 0;
    let firstTry = 0;
    let missedThisRound = false;
    let placed = 0;
    let round = null;

    stage.innerHTML = `
      <div class="prompt" id="prompt"></div>
      <div class="order-area">
        <div class="order-slots" id="slots"></div>
        <div class="order-tiles" id="tiles"></div>
      </div>
      ${buddyHTML()}`;

    const $prompt = stage.querySelector('#prompt');
    const $slots = stage.querySelector('#slots');
    const $tiles = stage.querySelector('#tiles');

    function makeRound() {
      if (kind === 'size') return makeSize();
      if (kind === 'story') return makeStory(nextStory);
      return makeNumbers();
    }

    function renderSlots() {
      $slots.innerHTML = round.items
        .map((item, i) => {
          const state = i < placed ? ' filled' : i === placed ? ' now' : '';
          const cls = `order-slot${state} ${item.cls || ''}`.trim();
          const content = i < placed ? item.html : '';
          return `<div class="${cls}">${content}</div>`;
        })
        .join('');
    }

    function renderTiles() {
      const order = shuffledOrder(round.items.length);
      $tiles.innerHTML = order
        .map((origIdx) => {
          const item = round.items[origIdx];
          const cls = `order-tile ${item.cls || ''}`.trim();
          return `<button class="${cls}" data-idx="${origIdx}">${item.html}</button>`;
        })
        .join('');
      $tiles.querySelectorAll('.order-tile').forEach((t) => { t.onclick = () => tap(t); });
    }

    function startRound() {
      round = makeRound();
      missedThisRound = false;
      placed = 0;
      hooks.onProgress?.(idx, total);
      $prompt.textContent = round.prompt;
      renderSlots();
      renderTiles();
      speak(round.prompt);
    }

    async function tap(tile) {
      if (tile.classList.contains('used')) return;
      const itemIdx = Number(tile.dataset.idx);

      if (itemIdx !== placed) {
        missedThisRound = true;
        sfx.retry();
        tile.classList.remove('nope');
        void tile.offsetWidth;
        tile.classList.add('nope');
        sayBubble(stage, pick(['ลองดูอีกทีนะ', 'ใบไหนมาก่อนนะ 🤔', 'เกือบแล้ว!']));
        return;
      }

      const item = round.items[placed];
      tile.classList.add('used');
      placed++;
      sfx.tap();
      renderSlots();

      const done = placed >= round.items.length;
      if (item.say && !done) speak(item.say);
      if (!done) return;

      if (!missedThisRound) firstTry++;
      $tiles.querySelectorAll('.order-tile').forEach((t) => { t.onclick = null; });
      sfx.correct();
      cheerBuddy(stage);
      confetti(stage, 22);
      sayBubble(stage, pick(['เรียงถูกเลย!', 'เก่งมาก!', 'ใช่เลย 🌟']));

      await Promise.all([wait(1600), speak(round.sayDone)]);
      idx++;
      if (idx >= total) {
        hooks.onProgress?.(total, total);
        resolve({ firstTry, total });
      } else {
        startRound();
      }
    }

    startRound();
  });
}
