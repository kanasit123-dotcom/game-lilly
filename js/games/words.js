import { THAI_CONSONANTS } from './thai.js';

export const WORD_SETS = {
  // พยัญชนะไทย แบ่ง 4 ชุด ชุดละ 9 ตัว การ์ดรูป = สิ่งของ การ์ดคำ = ตัวอักษร
  thaiCons1: THAI_CONSONANTS.slice(0, 9),
  thaiCons2: THAI_CONSONANTS.slice(9, 18),
  thaiCons3: THAI_CONSONANTS.slice(18, 27),
  thaiCons4: THAI_CONSONANTS.slice(27, 36),

  animals: [
    { word: 'CAT', emoji: '🐱' }, { word: 'DOG', emoji: '🐶' }, { word: 'PIG', emoji: '🐷' },
    { word: 'COW', emoji: '🐮' }, { word: 'DUCK', emoji: '🦆' }, { word: 'FISH', emoji: '🐟' },
    { word: 'BEE', emoji: '🐝' }, { word: 'BIRD', emoji: '🐦' }, { word: 'FROG', emoji: '🐸' },
    { word: 'TURTLE', emoji: '🐢' }, { word: 'SEAL', emoji: '🦭' },
  ],
  sea: [
    { word: 'TURTLE', emoji: '🐢' }, { word: 'SEAL', emoji: '🦭' }, { word: 'CRAB', emoji: '🦀' },
    { word: 'WHALE', emoji: '🐳' }, { word: 'SHARK', emoji: '🦈' }, { word: 'SQUID', emoji: '🦑' },
    { word: 'FISH', emoji: '🐟' }, { word: 'SHELL', emoji: '🐚' }, { word: 'WAVE', emoji: '🌊' },
  ],
  food: [
    { word: 'APPLE', emoji: '🍎' }, { word: 'CAKE', emoji: '🍰' }, { word: 'MILK', emoji: '🥛' },
    { word: 'EGG', emoji: '🥚' }, { word: 'RICE', emoji: '🍚' }, { word: 'BANANA', emoji: '🍌' },
    { word: 'BREAD', emoji: '🍞' }, { word: 'CORN', emoji: '🌽' }, { word: 'GRAPE', emoji: '🍇' },
  ],
  things: [
    { word: 'CAR', emoji: '🚗' }, { word: 'BALL', emoji: '⚽' }, { word: 'BOOK', emoji: '📕' },
    { word: 'STAR', emoji: '⭐' }, { word: 'SUN', emoji: '☀️' }, { word: 'HAT', emoji: '🎩' },
    { word: 'BOAT', emoji: '⛵' }, { word: 'KEY', emoji: '🔑' }, { word: 'CUP', emoji: '🥤' },
  ],
  // จับคู่ตัวพิมพ์ใหญ่กับตัวพิมพ์เล็ก — emoji คือฝั่งที่โชว์เป็นการ์ดรูป
  letters: [
    { word: 'a', emoji: 'A' }, { word: 'b', emoji: 'B' }, { word: 'e', emoji: 'E' },
    { word: 'g', emoji: 'G' }, { word: 'h', emoji: 'H' }, { word: 'm', emoji: 'M' },
    { word: 'q', emoji: 'Q' }, { word: 'r', emoji: 'R' }, { word: 'y', emoji: 'Y' },
  ],
};
