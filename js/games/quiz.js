import { randInt, pick, shuffle, wait, confetti, sayBubble, cheerBuddy } from '../utils.js';
import { sfx, speak } from '../audio.js';

/* เครื่องเกมแบบ "ดูโจทย์ แล้วแตะคำตอบ" ใช้ร่วมกัน 4 ด่าน
   cfg: { kind: 'counting'|'sequence'|'compare'|'letter', count: n } */

const COUNT_ITEMS = ['🍓', '🍎', '🐥', '🐠', '🌷', '🍪', '⭐', '🎈', '🐞', '🍄'];

const LETTER_WORDS = [
  { word: 'CAT', emoji: '🐱' }, { word: 'DOG', emoji: '🐶' }, { word: 'SUN', emoji: '☀️' },
  { word: 'BUS', emoji: '🚌' }, { word: 'HAT', emoji: '🎩' }, { word: 'PIG', emoji: '🐷' },
  { word: 'CUP', emoji: '🥤' }, { word: 'BED', emoji: '🛏️' }, { word: 'KEY', emoji: '🔑' },
  { word: 'FISH', emoji: '🐟' }, { word: 'STAR', emoji: '⭐' }, { word: 'CAKE', emoji: '🍰' },
];

function nearChoices(answer, lo, hi) {
  const out = [answer];
  for (const d of shuffle([1, -1, 2, -2, 3, -3])) {
    if (out.length >= 3) break;
    const v = answer + d;
    if (v >= lo && v <= hi && !out.includes(v)) out.push(v);
  }
  return shuffle(out);
}

const KINDS = {
  counting() {
    const item = pick(COUNT_ITEMS);
    const n = randInt(3, 12);
    return {
      prompt: 'นับดูสิ มีทั้งหมดกี่ชิ้น?',
      visual: `<div class="count-tray">${`<span>${item}</span>`.repeat(n)}</div>`,
      choices: nearChoices(n, 1, 15),
      answer: n,
      say: 'มีทั้งหมดกี่ชิ้น',
    };
  },

  sequence() {
    const start = randInt(1, 14);
    const gap = randInt(0, 3);
    const nums = [0, 1, 2, 3].map((i) => start + i);
    const answer = nums[gap];
    const boxes = nums
      .map((v, i) => `<span class="seq-box${i === gap ? ' blank' : ''}">${i === gap ? '?' : v}</span>`)
      .join('');
    return {
      prompt: 'เลขอะไรหายไปนะ?',
      visual: `<div class="seq-row">${boxes}</div>`,
      choices: nearChoices(answer, 1, 20),
      answer,
      say: 'เลขอะไรหายไป',
    };
  },

  compare() {
    let a = randInt(1, 99);
    let b = randInt(1, 99);
    while (a === b) b = randInt(1, 99);
    return {
      prompt: 'แตะตัวเลขที่มากกว่า 🐊',
      visual: '<div class="croc">🐊</div><div class="croc-hint">จระเข้หิวแล้ว! มันจะอ้าปากกินตัวที่มากกว่าเสมอ</div>',
      choices: shuffle([a, b]),
      answer: Math.max(a, b),
      say: 'ตัวไหนมากกว่า',
    };
  },

  letter() {
    const { word, emoji } = pick(LETTER_WORDS);
    const at = randInt(0, word.length - 1);
    const answer = word[at];
    const boxes = word
      .split('')
      .map((ch, i) => `<span class="seq-box${i === at ? ' blank' : ''}">${i === at ? '?' : ch}</span>`)
      .join('');
    const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter((c) => c !== answer);
    return {
      prompt: 'เติมตัวอักษรที่หายไป',
      visual: `<div class="letter-hint">${emoji}</div><div class="seq-row">${boxes}</div>`,
      choices: shuffle([answer, ...shuffle(pool).slice(0, 2)]),
      answer,
      say: word,
      sayLang: 'en-US',
    };
  },
};

export function play(stage, config, hooks = {}) {
  return new Promise((resolve) => {
    const make = KINDS[config.kind];
    const total = config.count;
    let idx = 0;
    let firstTry = 0;
    let missedThisOne = false;

    stage.innerHTML = `
      <div class="prompt" id="prompt"></div>
      <div class="quiz-visual" id="visual"></div>
      <div class="choices" id="action"></div>
      <div class="buddy">🐰</div>`;

    const $prompt = stage.querySelector('#prompt');
    const $visual = stage.querySelector('#visual');
    const $action = stage.querySelector('#action');

    function startQuestion() {
      const q = make();
      missedThisOne = false;
      hooks.onProgress?.(idx, total);

      $prompt.textContent = q.prompt;
      $visual.innerHTML = q.visual;
      $action.innerHTML = q.choices
        .map((v) => `<button class="choice" data-v="${v}">${v}</button>`)
        .join('');
      $action.querySelectorAll('.choice').forEach((b) => { b.onclick = () => answer(b, q); });
      speak(q.say, q.sayLang || 'th-TH');
    }

    async function answer(btn, q) {
      if (btn.dataset.v !== String(q.answer)) {
        missedThisOne = true;
        sfx.retry();
        btn.classList.remove('nope');
        void btn.offsetWidth;
        btn.classList.add('nope');
        sayBubble(stage, pick(['ยังไม่ใช่นะ ลองอีกที!', 'ค่อยๆ ดูใหม่ 💪', 'เกือบแล้ว!']));
        return;
      }

      if (!missedThisOne) firstTry++;
      $action.querySelectorAll('.choice').forEach((b) => { b.onclick = null; });
      btn.classList.add('correct');
      sfx.correct();
      cheerBuddy(stage);
      confetti(stage, 20);
      sayBubble(stage, pick(['เก่งมาก!', 'ถูกต้อง!', 'สุดยอด 🌟']));
      if (config.kind === 'letter') speak(q.say, 'en-US');

      await wait(1500);
      idx++;
      if (idx >= total) {
        hooks.onProgress?.(total, total);
        resolve({ firstTry, total });
      } else {
        startQuestion();
      }
    }

    startQuestion();
  });
}
