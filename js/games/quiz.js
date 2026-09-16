import { randInt, pick, shuffle, wait, confetti, sayBubble, cheerBuddy, buddyHTML, blocksMarkup } from '../utils.js';
import { sfx, speak, speakPrompt } from '../audio.js';
import { THAI_VOWEL_WORDS, THAI_VOWEL_WORDS2, THAI_FINAL_WORDS, THAI_FINAL_WORDS2, THAI_FINAL_POOL, THAI_FINAL_POOL2, THAI_READ, THAI_VOWELS, THAI_VOWEL_FILL, vowelIndexes, toCells, tileText } from './thai.js';

/* เครื่องเกมแบบ "ดูโจทย์ แล้วแตะคำตอบ" ใช้ร่วมกันหลายด่าน
   cfg: { kind, count, ...ค่าเฉพาะ kind }
   แต่ละ kind รับ cfg แล้วคืน { prompt, visual, choices, answer, say, sayLang, sayAfter, choiceClass, onCorrect }
   onCorrect($visual) ใช้เปลี่ยนภาพหลังตอบถูก เช่น เติมสระลงช่องว่าง
   choices เป็น string หรือ { v, html, cls } ก็ได้ */

const COUNT_ITEMS = ['🐢', '🦭', '🍓', '🍎', '🐥', '🐠', '🌷', '🍪', '⭐', '🎈', '🐞', '🍄'];
const COUNT_ITEMS2 = ['🐬', '🐙', '🦋', '🍭', '🍩', '🧁', '🌈', '🐝', '🦆', '🌻', '🍉', '🐧'];

const LETTER_WORDS = [
  { word: 'CAT', emoji: '🐱' }, { word: 'MAP', emoji: '🗺️' }, { word: 'SUN', emoji: '☀️' },
  { word: 'BUS', emoji: '🚌' }, { word: 'HAT', emoji: '🎩' }, { word: 'PEN', emoji: '🖊️' },
  { word: 'CUP', emoji: '🥤' }, { word: 'BED', emoji: '🛏️' }, { word: 'KEY', emoji: '🔑' },
  { word: 'FISH', emoji: '🐟' }, { word: 'STAR', emoji: '⭐' }, { word: 'CAKE', emoji: '🍰' },
  { word: 'SEAL', emoji: '🦭' }, { word: 'CRAB', emoji: '🦀' }, { word: 'TURTLE', emoji: '🐢' },
];

const LETTER_WORDS2 = [
  { word: 'FROG', emoji: '🐸' }, { word: 'DUCK', emoji: '🦆' }, { word: 'BIRD', emoji: '🐦' },
  { word: 'MILK', emoji: '🥛' }, { word: 'BOOK', emoji: '📕' }, { word: 'MOON', emoji: '🌙' },
  { word: 'TREE', emoji: '🌳' }, { word: 'SHIP', emoji: '🚢' }, { word: 'LION', emoji: '🦁' },
  { word: 'BEE', emoji: '🐝' }, { word: 'CORN', emoji: '🌽' }, { word: 'RAIN', emoji: '🌧️' },
  { word: 'KITE', emoji: '🪁' }, { word: 'DRUM', emoji: '🥁' }, { word: 'RING', emoji: '💍' },
  { word: 'BALL', emoji: '⚽' }, { word: 'APPLE', emoji: '🍎' }, { word: 'HORSE', emoji: '🐴' },
];

/* อ่านคำอังกฤษ: โชว์คำ เลือกรูป (รวมคำจากทุกชุด) */
const EN_READ_WORDS = [...LETTER_WORDS, ...LETTER_WORDS2];

const SHAPES = [
  { name: 'วงกลม', items: ['🔴', '🔵', '🟢', '🟡', '🟠', '🟣'] },
  { name: 'สามเหลี่ยม', items: ['🔺', '🔻'] },
  { name: 'สี่เหลี่ยม', items: ['🟥', '🟦', '🟩', '🟨', '🟧', '🟪'] },
  { name: 'หัวใจ', items: ['❤️', '💙', '💚', '💛', '💜'] },
  { name: 'ดาว', items: ['⭐', '🌟'] },
];

const PATTERN_PAIRS = [
  ['🔴', '🔵'], ['🍎', '🍌'], ['🐱', '🐰'], ['⭐', '🌙'], ['🟥', '🟨'], ['🐢', '🦭'], ['🌸', '🍀'],
];
const PATTERN_TRIPLES = [['🔴', '🔵', '🟢'], ['🍎', '🍌', '🍇'], ['🐢', '🦭', '🐟']];
const PATTERN_PAIRS2 = [
  ['🐰', '🥕'], ['☀️', '🌙'], ['🍦', '🍩'], ['🚗', '🚌'], ['🦋', '🌸'], ['🐬', '🐙'], ['⚽', '🏀'], ['🟦', '🟪'],
];
const PATTERN_TRIPLES2 = [['🌸', '🌻', '🌷'], ['🍓', '🍋', '🍇'], ['🐬', '🐙', '🦀'], ['🔺', '🟡', '🟦']];

const CATEGORY_GROUPS = [
  ['🐱', '🐝', '🐭', '🐰', '🦋', '🐢', '🦭'],
  ['🍎', '🍌', '🍇', '🍓', '🍉', '🍊'],
  ['🚗', '🚌', '🚲', '✈️', '🚂', '⛵'],
  ['👕', '👖', '🧢', '👟', '🧦', '🧤'],
  ['⚽', '🏀', '🎾', '🏐', '🏈'],
  ['🌸', '🌻', '🌹', '🌷', '🌺'],
  ['🍰', '🍪', '🍩', '🍭', '🍦'],
];

const CATEGORY_GROUPS2 = [
  ['🐟', '🐙', '🦀', '🐬', '🦈', '🐳'],
  ['🐦', '🦆', '🦉', '🐧', '🦜'],
  ['🐝', '🦋', '🐞', '🐜', '🐛'],
  ['✈️', '🚁', '🚀', '🛸'],
  ['🍴', '🥄', '🍽️', '🥣', '🥢'],
  ['✏️', '📕', '🎒', '✂️', '📏'],
  ['👁️', '👃', '👂', '✋', '🦶'],
  ['🎸', '🥁', '🎹', '🎺', '🎻'],
];

const SHADOW_POOL2 = ['🐰', '🐢', '🦁', '🐧', '🐬', '🐙', '🦆', '🐝', '🦋', '🌵', '🚲', '🚂', '🚁', '🎸', '🍄', '🍦', '⛄', '🎂', '👑', '🪁'];

const SHADOW_POOL = ['🐱', '🐰', '🐘', '🦒', '🐢', '🦭', '🐟', '🦀', '🐸', '🦋', '🚗', '✈️', '⛵', '🌳', '🏠', '⭐', '🍎', '🍌', '🎈', '☂️'];

const THAI_DIGITS = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙', '๑๐'];

const EN_NUMBERS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];

const thaiNumeral = (n) => String(n).split('').map((d) => THAI_DIGITS[+d]).join('');

/* เหรียญบาท: ค่ากับสีตามเหรียญจริง (1 บาทเงิน, 2 บาททอง, 5 บาทเงิน, 10 บาทสองสี) */
const COINS = [
  { v: 1, cls: 'c1' }, { v: 2, cls: 'c2' }, { v: 5, cls: 'c5' }, { v: 10, cls: 'c10' },
];

const COLORS = [
  { en: 'RED', th: 'แดง', emoji: '🔴' }, { en: 'BLUE', th: 'น้ำเงิน', emoji: '🔵' },
  { en: 'GREEN', th: 'เขียว', emoji: '🟢' }, { en: 'YELLOW', th: 'เหลือง', emoji: '🟡' },
  { en: 'ORANGE', th: 'ส้ม', emoji: '🟠' }, { en: 'PURPLE', th: 'ม่วง', emoji: '🟣' },
  { en: 'BLACK', th: 'ดำ', emoji: '⚫' }, { en: 'WHITE', th: 'ขาว', emoji: '⚪' },
  { en: 'BROWN', th: 'น้ำตาล', emoji: '🟤' }, { en: 'PINK', th: 'ชมพู', emoji: '💗' },
];

/* โจทย์ปัญหา: ของที่นับได้พร้อมลักษณนาม ให้ประโยคอ่านเป็นภาษาไทยถูกต้อง */
const STORY_ITEMS = [
  { e: '🍎', n: 'แอปเปิ้ล', cl: 'ลูก' }, { e: '🍓', n: 'สตรอว์เบอร์รี', cl: 'ลูก' },
  { e: '🍪', n: 'คุกกี้', cl: 'ชิ้น' }, { e: '🎈', n: 'ลูกโป่ง', cl: 'ลูก' },
  { e: '🐢', n: 'เต่า', cl: 'ตัว' }, { e: '🦭', n: 'แมวน้ำ', cl: 'ตัว' },
  { e: '🐟', n: 'ปลา', cl: 'ตัว' }, { e: '🌷', n: 'ดอกไม้', cl: 'ดอก' },
  { e: '🐥', n: 'ลูกเจี๊ยบ', cl: 'ตัว' }, { e: '⭐', n: 'ดาว', cl: 'ดวง' },
];

/* คำ CVC ที่สระตรงกลางหายไป ให้เลือก a e i o u */
const EN_VOWEL_WORDS = [
  { word: 'CAT', emoji: '🐱' }, { word: 'LOG', emoji: '🪵' }, { word: 'SUN', emoji: '☀️' },
  { word: 'BUS', emoji: '🚌' }, { word: 'HAT', emoji: '🎩' }, { word: 'PIN', emoji: '📌' },
  { word: 'CUP', emoji: '🥤' }, { word: 'BED', emoji: '🛏️' }, { word: 'PEN', emoji: '🖊️' },
  { word: 'BAT', emoji: '🦇' }, { word: 'BUG', emoji: '🐛' }, { word: 'HEN', emoji: '🐔' },
  { word: 'FOX', emoji: '🦊' }, { word: 'BOX', emoji: '📦' }, { word: 'JAM', emoji: '🍯' },
  { word: 'NET', emoji: '🥅' }, { word: 'POT', emoji: '🍲' }, { word: 'WEB', emoji: '🕸️' },
  { word: 'LIP', emoji: '👄' }, { word: 'TEN', emoji: '🔟' },
];

const SIZE_ITEMS = ['🐘', '🐢', '🦭', '🐱', '🍎', '⭐', '🎈', '🚗', '🌳', '🐟'];

function nearChoices(answer, lo, hi, deltas = [1, -1, 2, -2, 3, -3]) {
  const out = [answer];
  for (const d of shuffle(deltas)) {
    if (out.length >= 3) break;
    const v = answer + d;
    if (v >= lo && v <= hi && !out.includes(v)) out.push(v);
  }
  return shuffle(out);
}

/* นาฬิกาเข็ม เข็มยาวชี้ 12 (เต็มชั่วโมง) หรือชี้ 6 (ครึ่งชั่วโมง เข็มสั้นอยู่กึ่งกลางระหว่างเลข) */
function clockSVG(hour, half = false) {
  let nums = '';
  for (let n = 1; n <= 12; n++) {
    const a = (n / 12) * Math.PI * 2;
    nums += `<text x="${50 + 38 * Math.sin(a)}" y="${50 - 38 * Math.cos(a)}">${n}</text>`;
  }
  const a = ((hour + (half ? 0.5 : 0)) / 12) * Math.PI * 2;
  return `
    <svg class="clock" viewBox="0 0 100 100">
      <circle class="face" cx="50" cy="50" r="47"/>
      ${nums}
      <line class="minute" x1="50" y1="50" x2="50" y2="${half ? 83 : 17}"/>
      <line class="hour" x1="50" y1="50" x2="${50 + 24 * Math.sin(a)}" y2="${50 - 24 * Math.cos(a)}"/>
      <circle class="pin" cx="50" cy="50" r="3.5"/>
    </svg>`;
}

/* ตั้งเลขแนวตั้งแบบย่อ (ไม่มีขั้นตอน) ใช้ในบวกเร็ว/ลบเร็ว ให้หน้าตาเหมือนเกมตั้งเลขจริง */
function miniSumHTML(a, op, b) {
  const digits = (n) => (n >= 10
    ? `<span class="cell digit">${Math.floor(n / 10)}</span><span class="cell digit">${n % 10}</span>`
    : `<span class="cell blank"></span><span class="cell digit">${n}</span>`);
  return `
    <div class="col-sum mini-sum">
      <span class="cell spacer"></span>${digits(a)}
      <span class="cell op">${op}</span>${digits(b)}
      <div class="col-rule"></div>
      <span class="cell spacer"></span><span class="cell blank"></span><span class="cell slot ask" id="mini-ans">?</span>
    </div>`;
}
function fillMiniSum($visual, answer) {
  const slot = $visual.querySelector('#mini-ans');
  if (!slot) return;
  slot.textContent = answer;
  slot.classList.add('filled', 'pop');
  slot.classList.remove('ask');
  if (answer >= 10) slot.classList.add('wide');
}

const emojiBoxes = (items, blankAt = -1) =>
  `<div class="seq-row">${items
    .map((it, i) => `<span class="seq-box emoji${i === blankAt ? ' blank' : ''}">${i === blankAt ? '?' : it}</span>`)
    .join('')}</div>`;

const KINDS = {
  counting(cfg) {
    const item = pick(cfg.items === 2 ? COUNT_ITEMS2 : COUNT_ITEMS);
    const max = cfg.max || 12;
    const n = randInt(cfg.min || 3, max);
    return {
      prompt: 'นับดูสิ มีทั้งหมดกี่ชิ้น?',
      visual: `<div class="count-tray">${`<span>${item}</span>`.repeat(n)}</div>`,
      choices: nearChoices(n, 1, max + 3),
      answer: n,
      say: 'มีทั้งหมดกี่ชิ้น',
    };
  },

  /* cfg.steps = [1] | [1, 2, 5, 10] สุ่มว่านับทีละเท่าไหร่, cfg.max = เลขสูงสุด */
  sequence(cfg) {
    const step = pick(cfg.steps || [1]);
    const max = cfg.max || 17;
    const start = step === 1 ? randInt(1, max - 3) : step * randInt(1, Math.floor(max / step) - 3);
    const gap = randInt(0, 3);
    const nums = [0, 1, 2, 3].map((i) => start + i * step);
    const answer = nums[gap];
    const boxes = nums
      .map((v, i) => `<span class="seq-box${i === gap ? ' blank' : ''}">${i === gap ? '?' : v}</span>`)
      .join('');
    const deltas = step === 1 ? undefined : [step, -step, 1, -1, 2, -2];
    return {
      prompt: step === 1 ? 'เลขอะไรหายไปนะ?' : `นับทีละ ${step} เลขอะไรหายไป?`,
      visual: `<div class="seq-row">${boxes}</div>`,
      choices: nearChoices(answer, 1, max + step, deltas),
      answer,
      say: step === 1 ? 'เลขอะไรหายไป' : `นับทีละ ${step} เลขอะไรหายไป`,
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

  letter(cfg) {
    const { word, emoji } = pick(cfg.set === 2 ? LETTER_WORDS2 : LETTER_WORDS);
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

  thaiVowel(cfg) {
    const { word, emoji, wrong } = pick(cfg.set === 2 ? THAI_VOWEL_WORDS2 : THAI_VOWEL_WORDS);
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

  thaiFinal(cfg) {
    const { stem, final, emoji, word } = pick(cfg.set === 2 ? THAI_FINAL_WORDS2 : THAI_FINAL_WORDS);
    const pool = (cfg.set === 2 ? THAI_FINAL_POOL2 : THAI_FINAL_POOL).filter((c) => c !== final);
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

  pattern(cfg) {
    const useTriple = Math.random() < (cfg.set === 2 ? 0.45 : 0.3);
    const pairs = cfg.set === 2 ? PATTERN_PAIRS2 : PATTERN_PAIRS;
    const set = useTriple ? pick(cfg.set === 2 ? PATTERN_TRIPLES2 : PATTERN_TRIPLES) : pick(pairs);
    const unit = useTriple ? set : pick([[set[0], set[1]], [set[0], set[0], set[1]], [set[0], set[1], set[1]]]);
    const len = unit.length * 2 + (unit.length === 2 ? 1 : 0);
    const seq = Array.from({ length: len }, (_, i) => unit[i % unit.length]);
    const answer = seq[len - 1];
    const distract = shuffle(pairs.flat().filter((e) => !set.includes(e)))[0];
    return {
      prompt: 'ดูแบบรูปสิ ตัวต่อไปคืออะไร?',
      visual: emojiBoxes(seq, len - 1),
      choices: shuffle([...new Set([...set, distract])].slice(0, 3)),
      answer,
      say: 'ตัวต่อไปคืออะไร',
      choiceClass: 'emoji',
    };
  },

  oddOne(cfg) {
    const [gA, gB] = shuffle(cfg.set === 2 ? CATEGORY_GROUPS2 : CATEGORY_GROUPS).slice(0, 2);
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

  shadow(cfg) {
    const [answer, ...others] = shuffle(cfg.set === 2 ? SHADOW_POOL2 : SHADOW_POOL).slice(0, 3);
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

  thaiNumerals(cfg) {
    const item = pick(cfg.max > 10 ? COUNT_ITEMS2 : COUNT_ITEMS);
    const lo = cfg.min || 1, hi = cfg.max || 9;
    const n = randInt(lo, hi);
    const wrong = nearChoices(n, lo, hi).filter((k) => k !== n).slice(0, 2);
    return {
      prompt: 'นับแล้วแตะเลขไทย',
      visual: `<div class="count-tray">${`<span>${item}</span>`.repeat(n)}</div>`,
      choices: shuffle([n, ...wrong]).map((k) => ({ v: k, html: thaiNumeral(k) })),
      answer: n,
      say: 'นับแล้วแตะเลขไทย',
      choiceClass: 'thai',
    };
  },

  enNumbers(cfg) {
    const item = pick(cfg.max > 10 ? COUNT_ITEMS2 : COUNT_ITEMS);
    const lo = cfg.min || 1, hi = cfg.max || 10;
    const n = randInt(lo, hi);
    const wrong = nearChoices(n, lo, hi).filter((k) => k !== n).slice(0, 2);
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

  clock(cfg) {
    const hour = randInt(1, 12);
    if (!cfg.half) {
      const wrong = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter((h) => h !== hour)).slice(0, 2);
      return {
        prompt: 'เข็มสั้นชี้เลขอะไร? นาฬิกาบอกกี่นาฬิกา',
        visual: clockSVG(hour),
        choices: shuffle([hour, ...wrong]).map((h) => ({ v: h, html: `${h} นาฬิกา` })),
        answer: hour,
        say: 'นาฬิกาบอกกี่นาฬิกา',
        choiceClass: 'thai',
      };
    }
    // ครึ่งชั่วโมง: เข็มยาวชี้ 6 ตัวเลือกเป็นเวลาแบบ 3:30 ให้เทียบเข็มยาวเป็นหลัก
    const half = Math.random() < 0.6;
    const label = (h, hf) => `${h}:${hf ? '30' : '00'}`;
    const say = (h, hf) => `${h} นาฬิกา${hf ? ' 30 นาที' : ''}`;
    const next = (hour % 12) + 1;
    const answer = label(hour, half);
    const wrong = half ? [label(hour, false), label(next, true)] : [label(hour, true), label(next, false)];
    return {
      prompt: 'เข็มยาวชี้ 12 คือเต็มชั่วโมง ชี้ 6 คือครึ่งชั่วโมง นาฬิกาบอกเวลาเท่าไหร่?',
      visual: clockSVG(hour, half),
      choices: shuffle([answer, ...wrong]).map((t) => ({ v: t, html: t })),
      answer,
      say: 'นาฬิกาบอกเวลาเท่าไหร่',
      sayDone: say(hour, half),
      choiceClass: 'time',
    };
  },

  /* ---------- ชุด 2: บวกลบเร็ว (ยังตั้งแนวตั้งเหมือนเกมตั้งเลข ให้เด็กคิดวิธีเดียว) ---------- */

  quickAdd(cfg) {
    const max = cfg.max || 10;
    const a = randInt(1, max - 1);
    const b = randInt(1, max - a);
    return {
      prompt: 'บวกเร็ว! ได้เท่าไหร่?',
      visual: miniSumHTML(a, '+', b),
      choices: nearChoices(a + b, 0, max + 2),
      answer: a + b,
      say: `${a} บวก ${b} ได้เท่าไหร่`,
      sayDone: `${a} บวก ${b} เท่ากับ ${a + b}`,
      onCorrect($visual) { fillMiniSum($visual, a + b); },
    };
  },

  quickSub(cfg) {
    const max = cfg.max || 10;
    const a = randInt(2, max);
    const b = randInt(1, a - 1);
    return {
      prompt: 'ลบเร็ว! เหลือเท่าไหร่?',
      visual: miniSumHTML(a, '−', b),
      choices: nearChoices(a - b, 0, max),
      answer: a - b,
      say: `${a} ลบ ${b} เหลือเท่าไหร่`,
      sayDone: `${a} ลบ ${b} เท่ากับ ${a - b}`,
      onCorrect($visual) { fillMiniSum($visual, a - b); },
    };
  },

  /* ครบสิบ: กรอบสิบช่อง มีลูกบอลอยู่แล้ว n ลูก ต้องเติมอีกกี่ลูก */
  makeTen() {
    const n = randInt(1, 9);
    const cells = (fill) => Array.from({ length: 10 }, (_, i) =>
      `<span class="tf-cell${i < n ? ' on' : fill && i >= n ? ' new' : ''}"></span>`).join('');
    return {
      prompt: `มีอยู่ ${n} ลูก ต้องเติมอีกกี่ลูกถึงจะครบ 10?`,
      visual: `<div class="ten-frame">${cells(false)}</div>`,
      choices: nearChoices(10 - n, 1, 9),
      answer: 10 - n,
      say: `มีอยู่ ${n} ลูก ต้องเติมอีกกี่ลูกถึงจะครบสิบ`,
      sayDone: `${n} กับ ${10 - n} รวมเป็น 10`,
      onCorrect($visual) { $visual.querySelector('.ten-frame').innerHTML = cells(true); },
    };
  },

  /* เหรียญบาท: รวมค่าเหรียญ 2-4 เหรียญ ไม่เกิน 20 บาท */
  money() {
    let coins;
    do {
      coins = Array.from({ length: randInt(2, 4) }, () => pick(COINS));
    } while (coins.reduce((s, c) => s + c.v, 0) > 20);
    const total = coins.reduce((s, c) => s + c.v, 0);
    return {
      prompt: 'เหรียญทั้งหมดรวมกันกี่บาท?',
      visual: `<div class="coins">${coins.map((c) => `<span class="coin ${c.cls}"><b>${c.v}</b><small>บาท</small></span>`).join('')}</div>`,
      choices: nearChoices(total, 1, 24, [1, -1, 2, -2, 5, -5]),
      answer: total,
      say: 'เหรียญทั้งหมดรวมกันกี่บาท',
      sayDone: `รวมเป็น ${total} บาท`,
    };
  },

  /* อ่านคำไทย: โชว์คำ (ไม่อ่านให้ฟังก่อน) เลือกรูปที่ตรง */
  thaiRead(cfg) {
    const pool = THAI_READ[cfg.set] || THAI_READ[1];
    const target = pick(pool);
    const others = shuffle(pool.filter((w) => w.emoji !== target.emoji && w.word !== target.word)).slice(0, 2);
    return {
      prompt: 'อ่านคำนี้สิ แล้วแตะรูปที่ตรงกับคำ',
      visual: `<div class="read-word thai">${target.word}</div>`,
      choices: shuffle([target, ...others]).map((w) => ({ v: w.word, html: w.emoji })),
      answer: target.word,
      say: 'อ่านคำนี้ แล้วแตะรูปที่ตรงกับคำ',
      sayDone: target.word,
      choiceClass: 'emoji',
    };
  },

  enRead() {
    const target = pick(EN_READ_WORDS);
    const others = shuffle(EN_READ_WORDS.filter((w) => w.emoji !== target.emoji && w.word !== target.word)).slice(0, 2);
    return {
      prompt: 'อ่านคำภาษาอังกฤษ แล้วแตะรูปที่ตรงกับคำ',
      visual: `<div class="read-word">${target.word}</div>`,
      choices: shuffle([target, ...others]).map((w) => ({ v: w.word, html: w.emoji })),
      answer: target.word,
      say: 'อ่านคำภาษาอังกฤษ แล้วแตะรูป',
      sayDone: target.word,
      sayDoneLang: 'en-US',
      choiceClass: 'emoji',
    };
  },

  /* ตัวอักษรถัดไป: A B ? หรือ A ? C */
  abcNext() {
    const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const i = randInt(0, 23);
    const gap = randInt(1, 2);
    const letters = [ABC[i], ABC[i + 1], ABC[i + 2]];
    const answer = letters[gap];
    const boxes = letters
      .map((ch, k) => `<span class="seq-box${k === gap ? ' blank' : ''}">${k === gap ? '?' : ch}</span>`)
      .join('');
    const others = shuffle([i - 2, i - 1, i + 3, i + 4].filter((k) => k >= 0 && k < 26).map((k) => ABC[k])).slice(0, 2);
    return {
      prompt: 'ตัวอักษรอะไรหายไป? เรียง A B C',
      visual: `<div class="seq-row">${boxes}</div>`,
      choices: shuffle([answer, ...others]),
      answer,
      say: 'ตัวอักษรอะไรหายไป',
      sayDone: letters.join(' '),
      sayDoneLang: 'en-US',
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

  /* เติมสระ: โชว์คำที่สระหายไป (ช่องว่างอยู่ตำแหน่งจริงของสระ หน้า/บน/ล่าง/หลัง)
     ตอบถูกแล้วสระเด้งลงช่อง พร้อมอ่านคำและชื่อสระให้ฟัง */
  thaiVowelFill(cfg) {
    const pool = THAI_VOWEL_FILL[cfg.pool] || THAI_VOWEL_FILL.simple;
    const { word, emoji, vowel } = pick(pool);
    const letters = [...word];
    const blanks = new Set(vowelIndexes(word, vowel));
    const others = shuffle([...new Set(pool.map((w) => w.vowel))].filter((v) => v !== vowel)).slice(0, 2);

    const wordHTML = (showAll) => toCells(letters).map((c) => {
      const slot = (i, small) => {
        const blank = blanks.has(i) && !showAll;
        const fresh = blanks.has(i) && showAll;
        return `<span class="${small ? 'mark-slot' : 'spell-slot'} ${blank ? 'now' : fresh ? 'filled' : 'given'}">${blank ? '' : tileText(letters[i])}</span>`;
      };
      return `<div class="spell-cell">
        <div class="mark-row">${c.above.map((i) => slot(i, true)).join('')}</div>
        ${slot(c.base, false)}
        <div class="mark-row">${c.below.map((i) => slot(i, true)).join('')}</div>
      </div>`;
    }).join('');

    return {
      prompt: 'สระอะไรหายไป? แตะสระที่ถูก',
      visual: `<div class="letter-hint">${emoji}</div><div class="spell-slots vowel-fill">${wordHTML(false)}</div>`,
      choices: shuffle([vowel, ...others]).map((v) => ({ v, html: THAI_VOWELS[v].form })),
      answer: vowel,
      say: `${word} ${THAI_VOWELS[vowel].name}`,
      sayLang: 'th-TH',
      sayAfter: true,
      choiceClass: 'thai vowel',
      onCorrect($visual) { $visual.querySelector('.vowel-fill').innerHTML = wordHTML(true); },
    };
  },

  /* โจทย์ปัญหาบวก-ลบไม่เกิน 10 มีรูปให้นับ ตัวที่ให้เพื่อนไปจะจางลง */
  wordProblem() {
    const it = pick(STORY_ITEMS);
    const add = Math.random() < 0.55;
    const a = add ? randInt(2, 6) : randInt(3, 9);
    const b = add ? randInt(1, 9 - a) : randInt(1, a - 1);
    const answer = add ? a + b : a - b;
    const tray = (n, dim = 0) =>
      `<div class="count-tray story">${Array.from({ length: n }, (_, i) => `<span class="${i >= n - dim ? 'gone' : ''}">${it.e}</span>`).join('')}</div>`;
    const prompt = add
      ? `ลิลลี่มี${it.n} ${a} ${it.cl} แม่ให้อีก ${b} ${it.cl} รวมกันมีกี่${it.cl}?`
      : `ลิลลี่มี${it.n} ${a} ${it.cl} ให้เพื่อนไป ${b} ${it.cl} เหลือกี่${it.cl}?`;
    return {
      prompt,
      visual: add
        ? `<div class="story-row">${tray(a)}<span class="story-op">+</span>${tray(b)}</div>`
        : `<div class="story-row">${tray(a, b)}</div>`,
      choices: nearChoices(answer, 0, 12),
      answer,
      say: prompt.replace('?', ''),
    };
  },

  /* เติมสระอังกฤษ a e i o u ตรงกลางคำ CVC */
  enVowel() {
    const { word, emoji } = pick(EN_VOWEL_WORDS);
    const at = 1;
    const answer = word[at];
    const boxes = word
      .split('')
      .map((ch, i) => `<span class="seq-box${i === at ? ' blank' : ''}">${i === at ? '?' : ch}</span>`)
      .join('');
    const others = shuffle('AEIOU'.split('').filter((c) => c !== answer)).slice(0, 2);
    return {
      prompt: 'เติมสระ a e i o u ที่หายไป',
      visual: `<div class="letter-hint">${emoji}</div><div class="seq-row">${boxes}</div>`,
      choices: shuffle([answer, ...others]),
      answer,
      say: word,
      sayLang: 'en-US',
      sayAfter: true,
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
      const q = make(config);
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
      speakPrompt(q.say, q.sayLang || 'th-TH');
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
      q.onCorrect?.($visual);

      // รอเสียงอ่านคำเฉลยจบก่อน ไม่ให้โจทย์ข้อถัดไปพูดแทรก
      const after = q.sayDone || (q.sayAfter ? q.say : null);
      await Promise.all([wait(1500), after ? speak(after, q.sayDoneLang || q.sayLang) : null]);
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
