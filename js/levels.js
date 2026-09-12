/* ด่านทั้งหมด เรียงตามลำดับความยาก สลับคณิต อังกฤษ ไทย ไม่ให้เบื่อ
   ทุกด่านเปิดให้เล่นได้หมด ตำแหน่งบนแผนที่คำนวณเองใน screens/map.js */

export const LEVELS = [
  { id: 'q-count', type: 'quiz', icon: '🍓', title: 'นับของ',
    config: { kind: 'counting', count: 5 } },

  { id: 't-cons1', type: 'wordmatch', icon: '🐔', title: 'ก ไก่ ข ไข่',
    config: { set: 'thaiCons1', rounds: 3 } },

  { id: 'c-easy', type: 'column', icon: '🐚', title: 'ตั้งบวกง่ายๆ',
    config: { op: '+', roundTens: true, count: 5 } },

  { id: 'w-case', type: 'wordmatch', icon: '🔤', title: 'A กับ a',
    config: { set: 'letters', rounds: 3 } },

  { id: 't-trace1', type: 'trace', icon: '✏️', title: 'เขียน ก-ฮ',
    config: { set: 'thai1' } },

  { id: 'b-add1', type: 'column', icon: '🍎', title: 'บวกผลไม้',
    config: { op: '+', digitsB: 1, regroup: false, count: 5 } },

  { id: 'w-animals', type: 'wordmatch', icon: '🐱', title: 'เพื่อนสัตว์',
    config: { set: 'animals', rounds: 3 } },

  { id: 'q-seq', type: 'quiz', icon: '🔢', title: 'เติมเลขหาย',
    config: { kind: 'sequence', count: 5 } },

  { id: 't-digits', type: 'trace', icon: '🖍️', title: 'เขียนตัวเลข',
    config: { set: 'digits' } },

  { id: 'b-add2', type: 'column', icon: '🎈', title: 'บวกสองหลัก',
    config: { op: '+', digitsB: 2, regroup: false, count: 5 } },

  { id: 'w-sea', type: 'wordmatch', icon: '🐢', title: 'ใต้ทะเล',
    config: { set: 'sea', rounds: 3 } },

  { id: 't-vowel', type: 'quiz', icon: '🦀', title: 'คำตามสระ',
    config: { kind: 'thaiVowel', count: 6 } },

  { id: 'q-cmp', type: 'quiz', icon: '🐊', title: 'ใครมากกว่า',
    config: { kind: 'compare', count: 6 } },

  { id: 'b-add3', type: 'column', icon: '✨', title: 'มัดสิบครั้งแรก',
    config: { op: '+', digitsB: 1, regroup: true, count: 5 } },

  { id: 't-cons2', type: 'wordmatch', icon: '🐘', title: 'พยัญชนะชุด 2',
    config: { set: 'thaiCons2', rounds: 3 } },

  { id: 'w-food', type: 'wordmatch', icon: '🍰', title: 'ของอร่อย',
    config: { set: 'food', rounds: 3 } },

  { id: 't-abc', type: 'trace', icon: '🅰️', title: 'เขียน ABC',
    config: { set: 'abc' } },

  { id: 'q-letter', type: 'quiz', icon: '🔡', title: 'เติมตัวอักษร',
    config: { kind: 'letter', count: 5 } },

  { id: 'b-add4', type: 'column', icon: '👑', title: 'นักคณิตตัวจิ๋ว',
    config: { op: '+', digitsB: 2, regroup: true, count: 6 } },

  { id: 't-final', type: 'quiz', icon: '🐦', title: 'เติมตัวสะกด',
    config: { kind: 'thaiFinal', count: 6 } },

  { id: 'w-things', type: 'wordmatch', icon: '🚗', title: 'ของรอบตัว',
    config: { set: 'things', rounds: 3 } },

  { id: 't-trace2', type: 'trace', icon: '✏️', title: 'เขียน ก-ฮ ชุด 2',
    config: { set: 'thai2' } },

  { id: 'w-memory', type: 'memory', icon: '🃏', title: 'เกมความจำ',
    config: { set: 'sea', pairs: 4, rounds: 2 } },

  { id: 'c-sub1', type: 'column', icon: '➖', title: 'ตั้งลบแนวตั้ง',
    config: { op: '-', regroup: false, count: 5 } },

  { id: 'c-sub2', type: 'column', icon: '🔽', title: 'ตั้งลบมีการยืม',
    config: { op: '-', regroup: true, count: 6 } },
];

export const getLevel = (id) => LEVELS.find((l) => l.id === id);
