/* ด่านทั้งหมด เรียงตามลำดับความยาก สลับคณิตกับภาษาอังกฤษไม่ให้เบื่อ
   ตำแหน่งบนแผนที่คำนวณเองใน screens/map.js */

export const LEVELS = [
  { id: 'q-count', type: 'quiz', icon: '🍓', title: 'นับของ',
    config: { kind: 'counting', count: 5 } },

  { id: 'w-case', type: 'wordmatch', icon: '🔤', title: 'A กับ a',
    config: { set: 'letters', rounds: 3 } },

  { id: 'b-add1', type: 'addition', icon: '🍎', title: 'บวกผลไม้',
    config: { digitsB: 1, carry: false, count: 5 } },

  { id: 'w-animals', type: 'wordmatch', icon: '🐱', title: 'เพื่อนสัตว์',
    config: { set: 'animals', rounds: 3 } },

  { id: 'w-sea', type: 'wordmatch', icon: '🐢', title: 'ใต้ทะเล',
    config: { set: 'sea', rounds: 3 } },

  { id: 'q-seq', type: 'quiz', icon: '🔢', title: 'เติมเลขหาย',
    config: { kind: 'sequence', count: 5 } },

  { id: 'b-add2', type: 'addition', icon: '🎈', title: 'บวกสองหลัก',
    config: { digitsB: 2, carry: false, count: 5 } },

  { id: 'w-food', type: 'wordmatch', icon: '🍰', title: 'ของอร่อย',
    config: { set: 'food', rounds: 3 } },

  { id: 'q-cmp', type: 'quiz', icon: '🐊', title: 'ใครมากกว่า',
    config: { kind: 'compare', count: 6 } },

  { id: 'b-add3', type: 'addition', icon: '✨', title: 'มัดสิบครั้งแรก',
    config: { digitsB: 1, carry: true, count: 5 } },

  { id: 'q-letter', type: 'quiz', icon: '🔡', title: 'เติมตัวอักษร',
    config: { kind: 'letter', count: 5 } },

  { id: 'w-things', type: 'wordmatch', icon: '🚗', title: 'ของรอบตัว',
    config: { set: 'things', rounds: 3 } },

  { id: 'b-add4', type: 'addition', icon: '👑', title: 'นักคณิตตัวจิ๋ว',
    config: { digitsB: 2, carry: true, count: 6 } },

  { id: 'w-memory', type: 'memory', icon: '🃏', title: 'เกมความจำ',
    config: { set: 'sea', pairs: 4, rounds: 2 } },

  { id: 'c-easy', type: 'column', icon: '🐚', title: 'ตั้งบวกง่ายๆ',
    config: { op: '+', roundTens: true, count: 5 } },

  { id: 'c-add1', type: 'column', icon: '📝', title: 'ตั้งบวกแนวตั้ง',
    config: { op: '+', regroup: false, count: 5 } },

  { id: 'c-add2', type: 'column', icon: '🔼', title: 'ตั้งบวกมีตัวทด',
    config: { op: '+', regroup: true, count: 5 } },

  { id: 'c-sub1', type: 'column', icon: '➖', title: 'ตั้งลบแนวตั้ง',
    config: { op: '-', regroup: false, count: 5 } },

  { id: 'c-sub2', type: 'column', icon: '🔽', title: 'ตั้งลบมีการยืม',
    config: { op: '-', regroup: true, count: 6 } },
];

export const getLevel = (id) => LEVELS.find((l) => l.id === id);
