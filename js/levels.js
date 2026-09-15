/* ด่านทั้งหมด เรียงตามลำดับความยาก สลับหมวดไม่ให้เบื่อ
   subject: math | thai | en | brain (เชาวน์) ใช้กรองบนแผนที่
   ทุกด่านเปิดให้เล่นได้หมด ตำแหน่งบนแผนที่คำนวณเองใน screens/map.js */

import { NEW_LEVELS } from './lessons.js';

export const SUBJECTS = [
  { id: 'all', label: 'ทั้งหมด', icon: '🌈' },
  { id: 'math', label: 'คณิต', icon: '🔢' },
  { id: 'thai', label: 'ไทย', icon: '🐔' },
  { id: 'en', label: 'อังกฤษ', icon: '🔤' },
  { id: 'brain', label: 'เชาวน์', icon: '🧠' },
  { id: 'family', label: 'ครอบครัว', icon: '🏡' },
  { id: 'life', label: 'โลกใกล้ตัว', icon: '🌼' },
];

export const LEVELS = [
  { id: 'q-count', subject: 'math', type: 'quiz', icon: '🍓', title: 'นับของ',
    config: { kind: 'counting', count: 5 } },

  { id: 't-cons1', subject: 'thai', type: 'wordmatch', icon: '🐔', title: 'ก ไก่ ข ไข่',
    config: { set: 'thaiCons1', rounds: 3 } },

  { id: 'q-shapes', subject: 'brain', type: 'quiz', icon: '🔺', title: 'รูปทรง',
    config: { kind: 'shapes', count: 6 } },

  { id: 'c-easy', subject: 'math', type: 'column', icon: '🐚', title: 'ตั้งบวกง่ายๆ',
    config: { op: '+', roundTens: true, count: 5 } },

  { id: 'c-sub-easy', subject: 'math', type: 'column', icon: '🐌', title: 'ตั้งลบง่ายๆ',
    config: { op: '-', roundTens: true, count: 5 } },

  { id: 'w-case', subject: 'en', type: 'wordmatch', icon: '🔤', title: 'A กับ a',
    config: { set: 'letters', rounds: 3 } },

  { id: 'q-shadow', subject: 'brain', type: 'quiz', icon: '🌑', title: 'จับคู่เงา',
    config: { kind: 'shadow', count: 6 } },

  { id: 'b-connect1', subject: 'brain', type: 'connect', icon: '🐝', title: 'โยงเส้นคู่กัน',
    config: { set: 'pairs', rounds: 3 } },

  { id: 't-trace1', subject: 'thai', type: 'trace', icon: '✏️', title: 'เขียน ก-ฮ',
    config: { set: 'thai1' } },

  { id: 'b-add1', subject: 'math', type: 'column', icon: '🍎', title: 'บวกผลไม้',
    config: { op: '+', digitsB: 1, regroup: false, count: 5 } },

  { id: 'e-colors', subject: 'en', type: 'quiz', icon: '🎨', title: 'สีภาษาอังกฤษ',
    config: { kind: 'colors', count: 6 } },

  { id: 'q-pattern', subject: 'brain', type: 'quiz', icon: '🧩', title: 'แบบรูป',
    config: { kind: 'pattern', count: 6 } },

  { id: 'w-animals', subject: 'en', type: 'wordmatch', icon: '🐱', title: 'เพื่อนสัตว์',
    config: { set: 'animals', rounds: 3 } },

  { id: 'q-seq', subject: 'math', type: 'quiz', icon: '🔢', title: 'เติมเลขหาย',
    config: { kind: 'sequence', count: 5 } },

  { id: 't-digits', subject: 'math', type: 'trace', icon: '🖍️', title: 'เขียนตัวเลข',
    config: { set: 'digits' } },

  { id: 'q-size', subject: 'brain', type: 'quiz', icon: '🐘', title: 'ใหญ่หรือเล็ก',
    config: { kind: 'size', count: 6 } },

  { id: 'b-order-size', subject: 'brain', type: 'order', icon: '🎈', title: 'เรียงเล็กไปใหญ่',
    config: { kind: 'size', count: 5 } },

  { id: 'm-order', subject: 'math', type: 'order', icon: '📈', title: 'เรียงตัวเลข',
    config: { kind: 'numbers', count: 5 } },

  { id: 'q-position', subject: 'brain', type: 'quiz', icon: '🧭', title: 'ซ้าย ขวา บน ล่าง',
    config: { kind: 'position', count: 6 } },

  { id: 'b-add2', subject: 'math', type: 'column', icon: '🎈', title: 'บวกสองหลัก',
    config: { op: '+', digitsB: 2, regroup: false, count: 5 } },

  { id: 't-spell', subject: 'thai', type: 'spell', icon: '📖', title: 'ผสมคำไทย',
    config: { set: 'th1' } },

  { id: 't-vowel-match', subject: 'thai', type: 'wordmatch', icon: '🐟', title: 'รู้จักสระ',
    config: { set: 'thaiVowels', rounds: 3 } },

  { id: 'w-sea', subject: 'en', type: 'wordmatch', icon: '🐢', title: 'ใต้ทะเล',
    config: { set: 'sea', rounds: 3 } },

  { id: 'q-place', subject: 'math', type: 'quiz', icon: '🧱', title: 'สิบกับหน่วย',
    config: { kind: 'placeValue', count: 6 } },

  { id: 't-vowel', subject: 'thai', type: 'quiz', icon: '🦀', title: 'คำตามสระ',
    config: { kind: 'thaiVowel', count: 6 } },

  { id: 't-vowelfill1', subject: 'thai', type: 'quiz', icon: '✍️', title: 'เติมสระ',
    config: { kind: 'thaiVowelFill', pool: 'simple', count: 6 } },

  { id: 'b-connect2', subject: 'brain', type: 'connect', icon: '🚒', title: 'ใครใช้อะไร',
    config: { set: 'jobs', rounds: 3 } },

  { id: 'e-numbers', subject: 'en', type: 'quiz', icon: '1️⃣', title: 'one two three',
    config: { kind: 'enNumbers', count: 6 } },

  { id: 'q-cmp', subject: 'math', type: 'quiz', icon: '🐊', title: 'ใครมากกว่า',
    config: { kind: 'compare', count: 6 } },

  { id: 'm-story', subject: 'math', type: 'quiz', icon: '🧺', title: 'โจทย์ปัญหา',
    config: { kind: 'wordProblem', count: 6 } },

  { id: 'w-case2', subject: 'en', type: 'wordmatch', icon: '🅾️', title: 'A กับ a ชุด 2',
    config: { set: 'letters2', rounds: 3 } },

  { id: 'q-evenodd', subject: 'math', type: 'quiz', icon: '👯', title: 'คู่หรือคี่',
    config: { kind: 'evenOdd', count: 6 } },

  { id: 't-cons3', subject: 'thai', type: 'wordmatch', icon: '🔔', title: 'พยัญชนะชุด 3',
    config: { set: 'thaiCons3', rounds: 3 } },

  { id: 'q-odd', subject: 'brain', type: 'quiz', icon: '🤔', title: 'อันไหนไม่เข้าพวก',
    config: { kind: 'oddOne', count: 6 } },

  { id: 'b-connect3', subject: 'brain', type: 'connect', icon: '☀️', title: 'ตรงข้ามกัน',
    config: { set: 'opposites', rounds: 3 } },

  { id: 'b-add3', subject: 'math', type: 'column', icon: '✨', title: 'มัดสิบครั้งแรก',
    config: { op: '+', digitsB: 1, regroup: true, count: 5 } },

  { id: 't-cons2', subject: 'thai', type: 'wordmatch', icon: '🐘', title: 'พยัญชนะชุด 2',
    config: { set: 'thaiCons2', rounds: 3 } },

  { id: 'e-spell', subject: 'en', type: 'spell', icon: '🔠', title: 'สะกดคำอังกฤษ',
    config: { set: 'en1' } },

  { id: 'b-story', subject: 'brain', type: 'order', icon: '🐣', title: 'เรียงลำดับเหตุการณ์',
    config: { kind: 'story', count: 5 } },

  { id: 'q-numline', subject: 'math', type: 'quiz', icon: '🐸', title: 'กบกระโดด',
    config: { kind: 'numberLine', count: 6 } },

  { id: 'w-food', subject: 'en', type: 'wordmatch', icon: '🍰', title: 'ของอร่อย',
    config: { set: 'food', rounds: 3 } },

  { id: 't-thaidigit', subject: 'thai', type: 'quiz', icon: '๑', title: 'เลขไทย ๑๒๓',
    config: { kind: 'thaiNumerals', count: 6 } },

  { id: 't-abc', subject: 'en', type: 'trace', icon: '🅰️', title: 'เขียน A-F ใหญ่เล็ก',
    config: { set: 'abc' } },

  { id: 't-vowelfill2', subject: 'thai', type: 'quiz', icon: '🐯', title: 'เติมสระหน้า',
    config: { kind: 'thaiVowelFill', pool: 'front', count: 6 } },

  { id: 'q-letter', subject: 'en', type: 'quiz', icon: '🔡', title: 'เติมตัวอักษร',
    config: { kind: 'letter', count: 5 } },

  { id: 't-abc2', subject: 'en', type: 'trace', icon: '🖊️', title: 'เขียน G-L ใหญ่เล็ก',
    config: { set: 'abc2' } },

  { id: 'q-clock', subject: 'math', type: 'quiz', icon: '🕐', title: 'บอกเวลา',
    config: { kind: 'clock', count: 6 } },

  { id: 't-cons4', subject: 'thai', type: 'wordmatch', icon: '🚩', title: 'พยัญชนะชุด 4',
    config: { set: 'thaiCons4', rounds: 3 } },

  { id: 'b-add4', subject: 'math', type: 'column', icon: '👑', title: 'นักคณิตตัวจิ๋ว',
    config: { op: '+', digitsB: 2, regroup: true, count: 6 } },

  { id: 't-final', subject: 'thai', type: 'quiz', icon: '🐦', title: 'เติมตัวสะกด',
    config: { kind: 'thaiFinal', count: 6 } },

  { id: 'e-vowel', subject: 'en', type: 'quiz', icon: '🦊', title: 'สระ a e i o u',
    config: { kind: 'enVowel', count: 6 } },

  { id: 't-abc3', subject: 'en', type: 'trace', icon: '🖊️', title: 'เขียน M-R ใหญ่เล็ก',
    config: { set: 'abc3' } },

  { id: 'w-things', subject: 'en', type: 'wordmatch', icon: '🚗', title: 'ของรอบตัว',
    config: { set: 'things', rounds: 3 } },

  { id: 't-trace2', subject: 'thai', type: 'trace', icon: '✏️', title: 'เขียน ก-ฮ ชุด 2',
    config: { set: 'thai2' } },

  { id: 't-trace3', subject: 'thai', type: 'trace', icon: '✏️', title: 'เขียน ก-ฮ ชุด 3',
    config: { set: 'thai3' } },

  { id: 'w-memory', subject: 'brain', type: 'memory', icon: '🃏', title: 'เกมความจำ',
    config: { set: 'sea', pairs: 4, rounds: 2 } },

  { id: 't-abc4', subject: 'en', type: 'trace', icon: '🖊️', title: 'เขียน S-Z ใหญ่เล็ก',
    config: { set: 'abc4' } },

  { id: 'c-sub1', subject: 'math', type: 'column', icon: '➖', title: 'ตั้งลบแนวตั้ง',
    config: { op: '-', regroup: false, count: 5 } },

  { id: 'c-sub2', subject: 'math', type: 'column', icon: '🔽', title: 'ตั้งลบมีการยืม',
    config: { op: '-', regroup: true, count: 6 } },

  /* ---------- ชุด 2: คำใหม่ เลขใหม่ รูปใหม่ (ผู้ใช้ขอเพิ่มเมื่อลูกเล่นเกือบครบ) ---------- */

  { id: 'q-count2', subject: 'math', type: 'quiz', icon: '🐬', title: 'นับของ ชุด 2',
    config: { kind: 'counting', items: 2, min: 8, max: 20, count: 6 } },

  { id: 't-spell2', subject: 'thai', type: 'spell', icon: '📗', title: 'ผสมคำไทย ชุด 2',
    config: { set: 'th2' } },

  { id: 'w-body', subject: 'en', type: 'wordmatch', icon: '👃', title: 'ร่างกาย',
    config: { set: 'body', rounds: 3 } },

  { id: 'q-shadow2', subject: 'brain', type: 'quiz', icon: '🐧', title: 'จับคู่เงา ชุด 2',
    config: { kind: 'shadow', set: 2, count: 6 } },

  { id: 'q-quickadd', subject: 'math', type: 'quiz', icon: '⚡', title: 'บวกเร็ว',
    config: { kind: 'quickAdd', max: 10, count: 6 } },

  { id: 't-vowel2', subject: 'thai', type: 'quiz', icon: '📖', title: 'คำตามสระ ชุด 2',
    config: { kind: 'thaiVowel', set: 2, count: 6 } },

  { id: 'w-veg', subject: 'en', type: 'wordmatch', icon: '🥕', title: 'ผักผลไม้',
    config: { set: 'veg', rounds: 3 } },

  { id: 'q-pattern2', subject: 'brain', type: 'quiz', icon: '🎠', title: 'แบบรูป ชุด 2',
    config: { kind: 'pattern', set: 2, count: 6 } },

  { id: 'q-maketen', subject: 'math', type: 'quiz', icon: '🔟', title: 'เติมให้ครบสิบ',
    config: { kind: 'makeTen', count: 6 } },

  { id: 't-final2', subject: 'thai', type: 'quiz', icon: '🧢', title: 'เติมตัวสะกด ชุด 2',
    config: { kind: 'thaiFinal', set: 2, count: 6 } },

  { id: 'e-spell2', subject: 'en', type: 'spell', icon: '🦉', title: 'สะกดคำอังกฤษ ชุด 2',
    config: { set: 'en2' } },

  { id: 'b-connect4', subject: 'brain', type: 'connect', icon: '🏜️', title: 'ใครอยู่ที่ไหน',
    config: { set: 'homes', rounds: 3 } },

  { id: 'c-sub-d1', subject: 'math', type: 'column', icon: '🍬', title: 'ลบเลขหลักเดียว',
    config: { op: '-', digitsB: 1, regroup: false, count: 5 } },

  { id: 't-read1', subject: 'thai', type: 'quiz', icon: '👀', title: 'อ่านคำ ชุด 1',
    config: { kind: 'thaiRead', set: 1, count: 6 } },

  { id: 'w-nature', subject: 'en', type: 'wordmatch', icon: '🌈', title: 'ธรรมชาติ',
    config: { set: 'nature', rounds: 3 } },

  { id: 'q-odd2', subject: 'brain', type: 'quiz', icon: '🎻', title: 'ไม่เข้าพวก ชุด 2',
    config: { kind: 'oddOne', set: 2, count: 6 } },

  { id: 'q-seq2', subject: 'math', type: 'quiz', icon: '🐇', title: 'นับทีละ 2 5 10',
    config: { kind: 'sequence', steps: [2, 5, 10], max: 50, count: 6 } },

  { id: 't-trace4', subject: 'thai', type: 'trace', icon: '✏️', title: 'เขียน ก-ฮ ชุด 4',
    config: { set: 'thai4' } },

  { id: 'q-letter2', subject: 'en', type: 'quiz', icon: '🦁', title: 'เติมตัวอักษร ชุด 2',
    config: { kind: 'letter', set: 2, count: 6 } },

  { id: 'm-order2', subject: 'math', type: 'order', icon: '📉', title: 'เรียงจากมากไปน้อย',
    config: { kind: 'numbers', max: 30, desc: true, count: 5 } },

  { id: 't-vowel-match2', subject: 'thai', type: 'wordmatch', icon: '🐍', title: 'รู้จักสระ ชุด 2',
    config: { set: 'thaiVowels2', rounds: 3 } },

  { id: 'w-animals2', subject: 'en', type: 'wordmatch', icon: '🐰', title: 'สัตว์ ชุด 2',
    config: { set: 'animals2', rounds: 3 } },

  { id: 'w-memory2', subject: 'brain', type: 'memory', icon: '🍰', title: 'เกมความจำ ชุด 2',
    config: { set: 'food', pairs: 4, rounds: 2 } },

  { id: 'q-quicksub', subject: 'math', type: 'quiz', icon: '💨', title: 'ลบเร็ว',
    config: { kind: 'quickSub', max: 10, count: 6 } },

  { id: 't-thaidigit2', subject: 'thai', type: 'quiz', icon: '๒', title: 'เลขไทย ๑๑-๒๐',
    config: { kind: 'thaiNumerals', min: 11, max: 20, count: 6 } },

  { id: 'q-abcnext', subject: 'en', type: 'quiz', icon: '🅱️', title: 'ตัวอักษรถัดไป',
    config: { kind: 'abcNext', count: 6 } },

  { id: 'q-money', subject: 'math', type: 'quiz', icon: '🪙', title: 'เหรียญบาท',
    config: { kind: 'money', count: 6 } },

  { id: 't-read2', subject: 'thai', type: 'quiz', icon: '🔎', title: 'อ่านคำ ชุด 2',
    config: { kind: 'thaiRead', set: 2, count: 6 } },

  { id: 'w-home', subject: 'en', type: 'wordmatch', icon: '🚪', title: 'ของในบ้าน',
    config: { set: 'home', rounds: 3 } },

  { id: 'c-sub-d1b', subject: 'math', type: 'column', icon: '🎯', title: 'ลบหลักเดียวมีการยืม',
    config: { op: '-', digitsB: 1, regroup: true, count: 5 } },

  { id: 'e-numbers2', subject: 'en', type: 'quiz', icon: '2️⃣', title: 'eleven to twenty',
    config: { kind: 'enNumbers', min: 11, max: 20, count: 6 } },

  { id: 'q-clock2', subject: 'math', type: 'quiz', icon: '🕠', title: 'บอกเวลาครึ่งชั่วโมง',
    config: { kind: 'clock', half: true, count: 6 } },

  { id: 'e-read', subject: 'en', type: 'quiz', icon: '🧐', title: 'อ่านคำอังกฤษ',
    config: { kind: 'enRead', count: 6 } },
  ...NEW_LEVELS,
];

/* โลกบนแผนที่: แค่ป้ายบอกช่วง ให้เด็กรู้สึกว่าเดินทางไปเรื่อยๆ (ทุกด่านยังเล่นได้หมด)
   from = index ของด่านแรกในโลกนั้น (นับตามลำดับ LEVELS ตอนดูแบบ "ทั้งหมด") */
export const WORLDS = [
  { from: 0, icon: '🏝️', name: 'เกาะเริ่มต้น' },
  { from: 15, icon: '🌲', name: 'ป่าใหญ่' },
  { from: 30, icon: '🌊', name: 'ใต้ทะเล' },
  { from: 45, icon: '🏔️', name: 'ภูเขาหิมะ' },
  { from: 60, icon: '🚀', name: 'อวกาศ' },
  { from: 76, icon: '🌈', name: 'เมืองสายรุ้ง' },
];

export const getLevel = (id) => LEVELS.find((l) => l.id === id);
