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
  letters2: [
    { word: 'd', emoji: 'D' }, { word: 'f', emoji: 'F' }, { word: 'i', emoji: 'I' },
    { word: 'j', emoji: 'J' }, { word: 'l', emoji: 'L' }, { word: 'n', emoji: 'N' },
    { word: 't', emoji: 'T' }, { word: 'k', emoji: 'K' }, { word: 'p', emoji: 'P' },
  ],
  // รู้จักสระ: การ์ดลาก = รูปสระ (word), การ์ดรูป = emoji + คำที่ใช้สระนั้น (emoji เป็น HTML)
  // แต่ละสระมีคำเดียว จะได้ไม่มีสระซ้ำกันในรอบเดียว
  thaiVowels: [
    { word: '◌า', emoji: '🐟<b>ปลา</b>', say: 'สระอา', done: 'ปลา สระอา' },
    { word: '◌ี', emoji: '🐻<b>หมี</b>', say: 'สระอี', done: 'หมี สระอี' },
    { word: '◌ู', emoji: '🦀<b>ปู</b>', say: 'สระอู', done: 'ปู สระอู' },
    { word: '◌ิ', emoji: '🐵<b>ลิง</b>', say: 'สระอิ', done: 'ลิง สระอิ' },
    { word: '◌ึ', emoji: '🐝<b>ผึ้ง</b>', say: 'สระอึ', done: 'ผึ้ง สระอึ' },
    { word: '◌ือ', emoji: '✋<b>มือ</b>', say: 'สระอือ', done: 'มือ สระอือ' },
    { word: '◌ุ', emoji: '🦐<b>กุ้ง</b>', say: 'สระอุ', done: 'กุ้ง สระอุ' },
    { word: '◌ั', emoji: '🦷<b>ฟัน</b>', say: 'ไม้หันอากาศ', done: 'ฟัน ไม้หันอากาศ' },
    { word: '◌ำ', emoji: '💧<b>น้ำ</b>', say: 'สระอำ', done: 'น้ำ สระอำ' },
    { word: 'แ◌', emoji: '🐱<b>แมว</b>', say: 'สระแอ', done: 'แมว สระแอ' },
    { word: 'โ◌', emoji: '🎀<b>โบ</b>', say: 'สระโอ', done: 'โบ สระโอ' },
    { word: 'ไ◌', emoji: '🐔<b>ไก่</b>', say: 'สระไอ', done: 'ไก่ สระไอ' },
    { word: 'ใ◌', emoji: '🍃<b>ใบ</b>', say: 'สระใอ', done: 'ใบ สระใอ' },
    { word: 'เ◌า', emoji: '🐢<b>เต่า</b>', say: 'สระเอา', done: 'เต่า สระเอา' },
    { word: 'เ◌ือ', emoji: '🐯<b>เสือ</b>', say: 'สระเอือ', done: 'เสือ สระเอือ' },
  ],
};
