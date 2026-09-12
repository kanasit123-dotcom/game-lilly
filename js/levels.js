/* ด่านทั้งหมด เรียงตามลำดับความยาก สลับหมวดไม่ให้เบื่อ
   subject: math | thai | en | brain (เชาวน์) ใช้กรองบนแผนที่
   ทุกด่านเปิดให้เล่นได้หมด ตำแหน่งบนแผนที่คำนวณเองใน screens/map.js */

export const SUBJECTS = [
  { id: 'all', label: 'ทั้งหมด', icon: '🌈' },
  { id: 'math', label: 'คณิต', icon: '🔢' },
  { id: 'thai', label: 'ไทย', icon: '🐔' },
  { id: 'en', label: 'อังกฤษ', icon: '🔤' },
  { id: 'brain', label: 'เชาวน์', icon: '🧠' },
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

  { id: 'w-case', subject: 'en', type: 'wordmatch', icon: '🔤', title: 'A กับ a',
    config: { set: 'letters', rounds: 3 } },

  { id: 'q-shadow', subject: 'brain', type: 'quiz', icon: '🌑', title: 'จับคู่เงา',
    config: { kind: 'shadow', count: 6 } },

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

  { id: 'q-position', subject: 'brain', type: 'quiz', icon: '🧭', title: 'ซ้าย ขวา บน ล่าง',
    config: { kind: 'position', count: 6 } },

  { id: 'b-add2', subject: 'math', type: 'column', icon: '🎈', title: 'บวกสองหลัก',
    config: { op: '+', digitsB: 2, regroup: false, count: 5 } },

  { id: 't-spell', subject: 'thai', type: 'spell', icon: '📖', title: 'ผสมคำไทย',
    config: { set: 'th1' } },

  { id: 'w-sea', subject: 'en', type: 'wordmatch', icon: '🐢', title: 'ใต้ทะเล',
    config: { set: 'sea', rounds: 3 } },

  { id: 'q-place', subject: 'math', type: 'quiz', icon: '🧱', title: 'สิบกับหน่วย',
    config: { kind: 'placeValue', count: 6 } },

  { id: 't-vowel', subject: 'thai', type: 'quiz', icon: '🦀', title: 'คำตามสระ',
    config: { kind: 'thaiVowel', count: 6 } },

  { id: 'e-numbers', subject: 'en', type: 'quiz', icon: '1️⃣', title: 'one two three',
    config: { kind: 'enNumbers', count: 6 } },

  { id: 'q-cmp', subject: 'math', type: 'quiz', icon: '🐊', title: 'ใครมากกว่า',
    config: { kind: 'compare', count: 6 } },

  { id: 'q-evenodd', subject: 'math', type: 'quiz', icon: '👯', title: 'คู่หรือคี่',
    config: { kind: 'evenOdd', count: 6 } },

  { id: 't-cons3', subject: 'thai', type: 'wordmatch', icon: '🔔', title: 'พยัญชนะชุด 3',
    config: { set: 'thaiCons3', rounds: 3 } },

  { id: 'q-odd', subject: 'brain', type: 'quiz', icon: '🤔', title: 'อันไหนไม่เข้าพวก',
    config: { kind: 'oddOne', count: 6 } },

  { id: 'b-add3', subject: 'math', type: 'column', icon: '✨', title: 'มัดสิบครั้งแรก',
    config: { op: '+', digitsB: 1, regroup: true, count: 5 } },

  { id: 't-cons2', subject: 'thai', type: 'wordmatch', icon: '🐘', title: 'พยัญชนะชุด 2',
    config: { set: 'thaiCons2', rounds: 3 } },

  { id: 'e-spell', subject: 'en', type: 'spell', icon: '🔠', title: 'สะกดคำอังกฤษ',
    config: { set: 'en1' } },

  { id: 'q-numline', subject: 'math', type: 'quiz', icon: '🐸', title: 'กบกระโดด',
    config: { kind: 'numberLine', count: 6 } },

  { id: 'w-food', subject: 'en', type: 'wordmatch', icon: '🍰', title: 'ของอร่อย',
    config: { set: 'food', rounds: 3 } },

  { id: 't-thaidigit', subject: 'thai', type: 'quiz', icon: '๑', title: 'เลขไทย ๑๒๓',
    config: { kind: 'thaiNumerals', count: 6 } },

  { id: 't-abc', subject: 'en', type: 'trace', icon: '🅰️', title: 'เขียน ABC',
    config: { set: 'abc' } },

  { id: 'q-letter', subject: 'en', type: 'quiz', icon: '🔡', title: 'เติมตัวอักษร',
    config: { kind: 'letter', count: 5 } },

  { id: 'q-clock', subject: 'math', type: 'quiz', icon: '🕐', title: 'บอกเวลา',
    config: { kind: 'clock', count: 6 } },

  { id: 't-cons4', subject: 'thai', type: 'wordmatch', icon: '🚩', title: 'พยัญชนะชุด 4',
    config: { set: 'thaiCons4', rounds: 3 } },

  { id: 'b-add4', subject: 'math', type: 'column', icon: '👑', title: 'นักคณิตตัวจิ๋ว',
    config: { op: '+', digitsB: 2, regroup: true, count: 6 } },

  { id: 't-final', subject: 'thai', type: 'quiz', icon: '🐦', title: 'เติมตัวสะกด',
    config: { kind: 'thaiFinal', count: 6 } },

  { id: 'w-things', subject: 'en', type: 'wordmatch', icon: '🚗', title: 'ของรอบตัว',
    config: { set: 'things', rounds: 3 } },

  { id: 't-trace2', subject: 'thai', type: 'trace', icon: '✏️', title: 'เขียน ก-ฮ ชุด 2',
    config: { set: 'thai2' } },

  { id: 't-trace3', subject: 'thai', type: 'trace', icon: '✏️', title: 'เขียน ก-ฮ ชุด 3',
    config: { set: 'thai3' } },

  { id: 'w-memory', subject: 'brain', type: 'memory', icon: '🃏', title: 'เกมความจำ',
    config: { set: 'sea', pairs: 4, rounds: 2 } },

  { id: 'c-sub1', subject: 'math', type: 'column', icon: '➖', title: 'ตั้งลบแนวตั้ง',
    config: { op: '-', regroup: false, count: 5 } },

  { id: 'c-sub2', subject: 'math', type: 'column', icon: '🔽', title: 'ตั้งลบมีการยืม',
    config: { op: '-', regroup: true, count: 6 } },
];

export const getLevel = (id) => LEVELS.find((l) => l.id === id);
