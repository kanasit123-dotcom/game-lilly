import { randInt, pick, shuffle, wait, confetti, sayBubble, cheerBuddy, buddyHTML, blocksMarkup } from '../utils.js';
import { sfx, speak } from '../audio.js';
import { THAI_VOWEL_WORDS, THAI_FINAL_WORDS, THAI_FINAL_POOL } from './thai.js';

/* เครื่องเกมแบบ "ดูโจทย์ แล้วแตะคำตอบ" ใช้ร่วมกันหลายด่าน
   cfg: { kind, count }
   แต่ละ kind คืน { prompt, visual, choices, answer, say, sayLang, sayAfter, choiceClass }
   choices เป็น string หรือ { v, html, cls } ก็ได้ */

const COUNT_ITEMS = ['🐢', '🦭', '🍓', '🍎', '🐥', '🐠', '🌷', '🍪', '⭐', '🎈', '🐞', '🍄'];

const LETTER_WORDS = [
  { word: 'CAT', emoji: '🐱' }, { word: 'DOG', emoji: '🐶' }, { word: 'SUN', emoji: '☀️' },
  { word: 'BUS', emoji: '🚌' }, { word: 'HAT', emoji: '🎩' }, { word: 'PIG', emoji: '🐷' },
  { word: 'CUP', emoji: '🥤' }, { word: 'BED', emoji: '🛏️' }, { word: 'KEY', emoji: '🔑' },
  { word: 'FISH', emoji: '🐟' }, { word: 'STAR', emoji: '⭐' }, { word: 'CAKE', emoji: '🍰' },
  { word: 'SEAL', emoji: '🦭' }, { word: 'CRAB', emoji: '🦀' }, { word: 'TURTLE', emoji: '🐢' },
];

const SHAPES = [
  { name: 'วงกลม', items: ['🔴', '🔵', '🟢', '🟡', '🟠', '🟣'] },
  { name: 'สามเหลี่ยม', items: ['🔺', '🔻'] },
  { name: 'สี่เหลี่ยม', items: ['🟥', '🟦', '🟩', '🟨', '🟧', '🟪'] },
  { name: 'หัวใจ', items: ['❤️', '💙', '💚', '💛', '💜'] },
  { name: 'ดาว', items: ['⭐', '🌟'] },
];

const PATTERN_PAIRS = [
  ['🔴', '🔵'], ['🍎', '🍌'], ['🐱', '🐶'], ['⭐', '🌙'], ['🟥', '🟨'], ['🐢', '🦭'], ['🌸', '🍀'],
];
const PATTERN_TRIPLES = [['🔴', '🔵', '🟢'], ['🍎', '🍌', '🍇'], ['🐢', '🦭', '🐟']];

const CATEGORY_GROUPS = [
  ['🐱', '🐶', '🐭', '🐰', '🐻', '🐢', '🦭'],
  ['🍎', '🍌', '🍇', '🍓', '🍉', '🍊'],
  ['🚗', '🚌', '🚲', '✈️', '🚂', '⛵'],
  ['👕', '👖', '🧢', '👟', '🧦', '🧤'],
  ['⚽', '🏀', '🎾', '🏐', '🏈'],
  ['🌸', '🌻', '🌹', '🌷', '🌺'],
  ['🍰', '🍪', '🍩', '🍭', '🍦'],
];

const SHADOW_POOL = ['🐱', '🐶', '🐘', '🦒', '🐢', '🦭', '🐟', '🦀', '🐸', '🦋', '🚗', '✈️', '⛵', '🌳', '🏠', '⭐', '🍎', '🍌', '🎈', '☂️'];

const THAI_DIGITS = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙', '๑๐'];

const EN_NUMBERS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

const COLORS = [
  { en: 'RED', th: 'แดง', emoji: '🔴' }, { en: 'BLUE', th: 'น้ำเงิน', emoji: '🔵' },
  { en: 'GREEN', th: 'เขียว', emoji: '🟢' }, { en: 'YELLOW', th: 'เหลือง', emoji: '🟡' },
  { en: 'ORANGE', th: 'ส้ม', emoji: '🟠' }, { en: 'PURPLE', th: 'ม่วง', emoji: '🟣' },
  { en: 'BLACK', th: 'ดำ', emoji: '⚫' }, { en: 'WHITE', th: 'ขาว', emoji: '⚪' },
  { en: 'BROWN', th: 'น้ำตาล', emoji: '🟤' }, { en: 'PINK', th: 'ชมพู', emoji: '🩷' },
];

const SIZE_ITEMS = ['🐘', '🐢', '🦭', '🐱', '🍎', '⭐', '🎈', '🚗', '🌳', '🐟'];

function nearChoices(answer, lo, hi) {
  const out = [answer];
  for (const d of shuffle([1, -1, 2, -2, 3, -3])) {
    if (out.length >= 3) break;
    const v = answer + d;
    if (v >= lo && v <= hi && !out.includes(v)) out.push(v);
  }
  return shuffle(out);
}

/* นาฬิกาเข็ม เข็มยาวชี้ 12 เสมอ (บอกเวลาเต็มชั่วโมง) */
function clockSVG(hour) {
  let nums = '';
  for (let n = 1; n <= 12; n++) {
    const a = (n / 12) * Math.PI * 2;
    nums += `<text x="${50 + 38 * Math.sin(a)}" y="${50 - 38 * Math.cos(a)}">${n}</text>`;
  }
  const a = (hour / 12) * Math.PI * 2;
  return `
    <svg class="clock" viewBox="0 0 100 100">
      <circle class="face" cx="50" cy="50" r="47"/>
      ${nums}
      <line class="minute" x1="50" y1="50" x2="50" y2="17"/>
      <line class="hour" x1="50" y1="50" x2="${50 + 24 * Math.sin(a)}" y2="${50 - 24 * Math.cos(a)}"/>
      <circle class="pin" cx="50" cy="50" r="3.5"/>
    </svg>`;
}

const emojiBoxes = (items, blankAt = -1) =>
  `<div class="seq-row">${items
    .map((it, i) => `<span class="seq-box emoji${i === blankAt ? ' blank' : ''}">${i === blankAt ? '?' : it}</span>`)
    .join('')}</div>`;

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
      sayAfter: true,
    };
  },

  thaiVowel() {
    const { word, emoji, wrong } = pick(THAI_VOWEL_WORDS);
    return {
      prompt: 'รูปนี้อ่านว่าอะไร? แตะคำที่สะกดถูก',
      visual: `<div class="letter-hint big">${emoji}</div>`,
      choices: shuffle([word, ...wrong]),
      answer: word,
      say: word,
      sayLang: 'th-TH',
      sayAfter: true,
      choiceClass: 'thai',
    };
  },

  thaiFinal() {
    const { stem, final, emoji, word } = pick(THAI_FINAL_WORDS);
    const pool = THAI_FINAL_POOL.filter((c) => c !== final);
    return {
      prompt: 'เติมตัวสะกดที่หายไป',
      visual: `<div class="letter-hint">${emoji}</div>
               <div class="seq-row thai"><span class="seq-box">${stem}</span><span class="seq-box blank">?</span></div>`,
      choices: shuffle([final, ...shuffle(pool).slice(0, 2)]),
      answer: final,
      say: word,
      sayLang: 'th-TH',
      sayAfter: true,
      choiceClass: 'thai',
    };
  },

  /* ---------- ชุดใหม่ตามแบบฝึกหัดอนุบาล 2-3 ---------- */

  shapes() {
    const target = pick(SHAPES);
    const others = shuffle(SHAPES.filter((s) => s !== target)).slice(0, 2);
    const answer = pick(target.items);
    return {
      prompt: `แตะรูป${target.name}`,
      visual: `<div class="shape-hint">${target.name}</div>`,
      choices: shuffle([answer, ...others.map((s) => pick(s.items))]),
      answer,
      say: `แตะรูป${target.name}`,
      choiceClass: 'emoji',
    };
  },

  pattern() {
    const useTriple = Math.random() < 0.3;
    const set = useTriple ? pick(PATTERN_TRIPLES) : pick(PATTERN_PAIRS);
    const unit = useTriple ? set : pick([[set[0], set[1]], [set[0], set[0], set[1]], [set[0], set[1], set[1]]]);
    const len = unit.length * 2 + (unit.length === 2 ? 1 : 0);
    const seq = Array.from({ length: len }, (_, i) => unit[i % unit.length]);
    const answer = seq[len - 1];
    const distract = shuffle(PATTERN_PAIRS.flat().filter((e) => !set.includes(e)))[0];
    return {
      prompt: 'ดูแบบรูปสิ ตัวต่อไปคืออะไร?',
      visual: emojiBoxes(seq, len - 1),
      choices: shuffle([...new Set([...set, distract])].slice(0, 3)),
      answer,
      say: 'ตัวต่อไปคืออะไร',
      choiceClass: 'emoji',
    };
  },

  oddOne() {
    const [gA, gB] = shuffle(CATEGORY_GROUPS).slice(0, 2);
    const same = shuffle(gA).slice(0, 3);
    const odd = pick(gB);
    return {
      prompt: 'อันไหนไม่เข้าพวก?',
      visual: '<div class="shape-hint">มี 3 อันเป็นพวกเดียวกัน อีก 1 อันแปลกออกไป</div>',
      choices: shuffle([...same, odd]),
      answer: odd,
      say: 'อันไหนไม่เข้าพวก',
      choiceClass: 'emoji',
    };
  },

  shadow() {
    const [answer, ...others] = shuffle(SHADOW_POOL).slice(0, 3);
    return {
      prompt: 'เงานี้เป็นของใครนะ?',
      visual: `<div class="shadow">${answer}</div>`,
      choices: shuffle([answer, ...others]),
      answer,
      say: 'เงานี้เป็นของใคร',
      choiceClass: 'emoji',
    };
  },

  placeValue() {
    const t = randInt(1, 5);
    const u = randInt(1, 9);
    const n = t * 10 + u;
    return {
      prompt: 'นับแท่งสิบ นับลูกบอลหน่วย ได้เลขอะไร?',
      visual: `<div class="blocks-card">${blocksMarkup(t, u)}</div>`,
      choices: shuffle([n, n + 10 <= 99 ? n + 10 : n - 10, u * 10 + t !== n ? u * 10 + t : n + 1]),
      answer: n,
      say: `${t} สิบ กับ ${u} หน่วย เป็นเลขอะไร`,
    };
  },

  numberLine() {
    const back = Math.random() < 0.6;
    const start = back ? randInt(4, 10) : randInt(0, 6);
    const hops = back ? randInt(1, start) : randInt(1, 10 - start);
    const answer = back ? start - hops : start + hops;
    const cells = Array.from({ length: 11 }, (_, i) =>
      `<span class="nl-cell${i === start ? ' start' : ''}">${i === start ? '🐸' : ''}<b>${i}</b></span>`).join('');
    return {
      prompt: `กบอยู่ที่เลข ${start} กระโดด${back ? 'ถอยหลัง' : 'ไปข้างหน้า'} ${hops} ช่อง จะไปอยู่เลขอะไร?`,
      visual: `<div class="numline">${cells}</div><div class="shape-hint">${back ? '⬅️ ถอยหลัง' : 'ไปข้างหน้า ➡️'} ${hops} ช่อง</div>`,
      choices: nearChoices(answer, 0, 10),
      answer,
      say: `กบอยู่ที่เลข ${start} กระโดด${back ? 'ถอยหลัง' : 'ไปข้างหน้า'} ${hops} ช่อง`,
    };
  },

  thaiNumerals() {
    const item = pick(COUNT_ITEMS);
    const n = randInt(1, 9);
    const wrong = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9].filter((k) => k !== n)).slice(0, 2);
    return {
      prompt: 'นับแล้วแตะเลขไทย',
      visual: `<div class="count-tray">${`<span>${item}</span>`.repeat(n)}</div>`,
      choices: shuffle([n, ...wrong]).map((k) => ({ v: k, html: THAI_DIGITS[k] })),
      answer: n,
      say: 'นับแล้วแตะเลขไทย',
      choiceClass: 'thai',
    };
  },

  enNumbers() {
    const item = pick(COUNT_ITEMS);
    const n = randInt(1, 10);
    const wrong = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter((k) => k !== n)).slice(0, 2);
    return {
      prompt: 'มีกี่อัน? แตะคำภาษาอังกฤษ',
      visual: `<div class="count-tray">${`<span>${item}</span>`.repeat(n)}</div>`,
      choices: shuffle([n, ...wrong]).map((k) => ({ v: k, html: EN_NUMBERS[k] })),
      answer: n,
      say: EN_NUMBERS[n],
      sayLang: 'en-US',
      sayAfter: true,
      choiceClass: 'word',
    };
  },

  colors() {
    const [c, ...others] = shuffle(COLORS).slice(0, 3);
    return {
      prompt: `สี${c.th} ภาษาอังกฤษว่าอะไร?`,
      visual: `<div class="letter-hint big">${c.emoji}</div>`,
      choices: shuffle([c, ...others]).map((k) => ({ v: k.en, html: k.en })),
      answer: c.en,
      say: c.en,
      sayLang: 'en-US',
      sayAfter: true,
      choiceClass: 'word',
    };
  },

  size() {
    const item = pick(SIZE_ITEMS);
    const wantBig = Math.random() < 0.5;
    const sizes = shuffle(['s', 'm', 'l']);
    return {
      prompt: wantBig ? 'แตะตัวที่ใหญ่ที่สุด' : 'แตะตัวที่เล็กที่สุด',
      visual: '',
      choices: sizes.map((sz) => ({ v: sz, html: item, cls: `size-${sz}` })),
      answer: wantBig ? 'l' : 's',
      say: wantBig ? 'แตะตัวที่ใหญ่ที่สุด' : 'แตะตัวที่เล็กที่สุด',
      choiceClass: 'emoji',
    };
  },

  clock() {
    const hour = randInt(1, 12);
    const wrong = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter((h) => h !== hour)).slice(0, 2);
    return {
      prompt: 'เข็มสั้นชี้เลขอะไร? นาฬิกาบอกกี่นาฬิกา',
      visual: clockSVG(hour),
      choices: shuffle([hour, ...wrong]).map((h) => ({ v: h, html: `${h} นาฬิกา` })),
      answer: hour,
      say: 'นาฬิกาบอกกี่นาฬิกา',
      choiceClass: 'thai',
    };
  },

  /* ตำแหน่งของตัวเลือกคือคำตอบ ต้องล็อกไม่ให้แถวพับบรรทัด */
  position() {
    const vertical = Math.random() < 0.4;
    const items = shuffle(SIZE_ITEMS).slice(0, 3);
    const target = randInt(0, 2);
    const label = vertical
      ? ['ข้างบน', 'ตรงกลาง', 'ข้างล่าง'][target]
      : ['ทางซ้าย', 'ตรงกลาง', 'ทางขวา'][target];
    return {
      prompt: `แตะตัวที่อยู่${label}`,
      visual: `<div class="shape-hint">${vertical ? '⬆️ บน · ล่าง ⬇️' : '⬅️ ซ้าย · ขวา ➡️'}</div>`,
      choices: items.map((it, i) => ({ v: i, html: it })),
      answer: target,
      say: `แตะตัวที่อยู่${label}`,
      choiceClass: 'emoji',
      layout: vertical ? 'col' : 'row-fixed',
    };
  },

  evenOdd() {
    const item = pick(COUNT_ITEMS);
    const n = randInt(1, 10);
    return {
      prompt: 'จับคู่ทีละสอง มีตัวเหลือไหม? เป็นจำนวนคู่หรือคี่',
      visual: `<div class="big-num">${n}</div><div class="pair-tray">${`<span>${item}</span>`.repeat(n)}</div>`,
      choices: [{ v: 'even', html: 'คู่' }, { v: 'odd', html: 'คี่' }],
      answer: n % 2 === 0 ? 'even' : 'odd',
      say: `${n} เป็นจำนวนคู่หรือคี่`,
      choiceClass: 'thai',
    };
  },
};

const normalize = (c) => (typeof c === 'object' ? c : { v: c, html: c });

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
      ${buddyHTML()}`;

    const $prompt = stage.querySelector('#prompt');
    const $visual = stage.querySelector('#visual');
    const $action = stage.querySelector('#action');

    function startQuestion() {
      const q = make();
      missedThisOne = false;
      hooks.onProgress?.(idx, total);

      $prompt.textContent = q.prompt;
      $visual.innerHTML = q.visual;
      $action.className = `choices ${q.layout || ''}`;
      $action.innerHTML = q.choices
        .map(normalize)
        .map((c) => `<button class="choice ${q.choiceClass || ''} ${c.cls || ''}" data-v="${c.v}">${c.html}</button>`)
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
      if (q.sayAfter) speak(q.say, q.sayLang);

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
