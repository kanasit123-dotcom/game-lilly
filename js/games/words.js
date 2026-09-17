import { THAI_CONSONANTS } from './thai.js';

export const WORD_SETS = {
  lillyFriends: [
    { word: 'SEAL', emoji: '🦭', asset: 'seal' },
    { word: 'TURTLE', emoji: '🐢', asset: 'turtle' },
    { word: 'RABBIT', emoji: '🐰', asset: 'rabbit' },
  ],
  lillyFriends6: [
    { word: 'SEAL', emoji: '🦭', asset: 'seal' },
    { word: 'TURTLE', emoji: '🐢', asset: 'turtle' },
    { word: 'RABBIT', emoji: '🐰', asset: 'rabbit' },
    { word: 'CAT', emoji: '🐱', asset: 'cat' },
    { word: 'PENGUIN', emoji: '🐧', asset: 'penguin' },
    { word: 'FOX', emoji: '🦊', asset: 'fox' },
  ],
  // พยัญชนะไทย แบ่ง 4 ชุด ชุดละ 9 ตัว การ์ดรูป = สิ่งของ การ์ดคำ = ตัวอักษร
  thaiCons1: THAI_CONSONANTS.slice(0, 9),
  thaiCons2: THAI_CONSONANTS.slice(9, 18),
  thaiCons3: THAI_CONSONANTS.slice(18, 27),
  thaiCons4: THAI_CONSONANTS.slice(27, 36),

  animals: [
    { word: 'CAT', emoji: '🐱' }, { word: 'RABBIT', emoji: '🐰' }, { word: 'BUTTERFLY', emoji: '🦋' },
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
  body: [
    { word: 'EYE', emoji: '👁️' }, { word: 'NOSE', emoji: '👃' }, { word: 'EAR', emoji: '👂' },
    { word: 'HAND', emoji: '✋' }, { word: 'FOOT', emoji: '🦶' }, { word: 'MOUTH', emoji: '👄' },
    { word: 'TOOTH', emoji: '🦷' }, { word: 'LEG', emoji: '🦵' }, { word: 'TONGUE', emoji: '👅' },
  ],
  veg: [
    { word: 'CARROT', emoji: '🥕' }, { word: 'TOMATO', emoji: '🍅' }, { word: 'POTATO', emoji: '🥔' },
    { word: 'LEMON', emoji: '🍋' }, { word: 'PEACH', emoji: '🍑' }, { word: 'KIWI', emoji: '🥝' },
    { word: 'CHERRY', emoji: '🍒' }, { word: 'PEAR', emoji: '🍐' }, { word: 'MELON', emoji: '🍈' },
    { word: 'MANGO', emoji: '🥭' }, { word: 'COCONUT', emoji: '🥥' }, { word: 'ONION', emoji: '🧅' },
  ],
  nature: [
    { word: 'RAIN', emoji: '🌧️' }, { word: 'SNOW', emoji: '❄️' }, { word: 'CLOUD', emoji: '☁️' },
    { word: 'MOON', emoji: '🌙' }, { word: 'TREE', emoji: '🌳' }, { word: 'FLOWER', emoji: '🌸' },
    { word: 'LEAF', emoji: '🍃' }, { word: 'RAINBOW', emoji: '🌈' }, { word: 'FIRE', emoji: '🔥' },
  ],
  animals2: [
    { word: 'HORSE', emoji: '🐴' }, { word: 'SHEEP', emoji: '🐑' }, { word: 'GOAT', emoji: '🐐' },
    { word: 'RABBIT', emoji: '🐰' }, { word: 'MOUSE', emoji: '🐭' }, { word: 'MONKEY', emoji: '🐵' },
    { word: 'LION', emoji: '🦁' }, { word: 'TIGER', emoji: '🐯' }, { word: 'ELEPHANT', emoji: '🐘' },
    { word: 'SEAL', emoji: '🦭' }, { word: 'TURTLE', emoji: '🐢' }, { word: 'DOLPHIN', emoji: '🐬' },
  ],
  home: [
    { word: 'BED', emoji: '🛏️' }, { word: 'DOOR', emoji: '🚪' }, { word: 'CHAIR', emoji: '🪑' },
    { word: 'LAMP', emoji: '💡' }, { word: 'CLOCK', emoji: '🕐' }, { word: 'PHONE', emoji: '📱' },
    { word: 'SOAP', emoji: '🧼' }, { word: 'BATH', emoji: '🛁' }, { word: 'SPOON', emoji: '🥄' },
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
    { word: '-า', emoji: '🐟<b>ปลา</b>', say: 'สระอา', done: 'ปลา สระอา' },
    { word: '-ี', emoji: '🎨<b>สี</b>', say: 'สระอี', done: 'สี สระอี' },
    { word: '-ู', emoji: '🦀<b>ปู</b>', say: 'สระอู', done: 'ปู สระอู' },
    { word: '-ิ', emoji: '🐵<b>ลิง</b>', say: 'สระอิ', done: 'ลิง สระอิ' },
    { word: '-ึ', emoji: '🐝<b>ผึ้ง</b>', say: 'สระอึ', done: 'ผึ้ง สระอึ' },
    { word: '-ือ', emoji: '✋<b>มือ</b>', say: 'สระอือ', done: 'มือ สระอือ' },
    { word: '-ุ', emoji: '🦐<b>กุ้ง</b>', say: 'สระอุ', done: 'กุ้ง สระอุ' },
    { word: '-ั', emoji: '🦷<b>ฟัน</b>', say: 'ไม้หันอากาศ', done: 'ฟัน ไม้หันอากาศ' },
    { word: '-ำ', emoji: '💧<b>น้ำ</b>', say: 'สระอำ', done: 'น้ำ สระอำ' },
    { word: 'แ-', emoji: '🐱<b>แมว</b>', say: 'สระแอ', done: 'แมว สระแอ' },
    { word: 'โ-', emoji: '🎀<b>โบ</b>', say: 'สระโอ', done: 'โบ สระโอ' },
    { word: 'ไ-', emoji: '🐔<b>ไก่</b>', say: 'สระไอ', done: 'ไก่ สระไอ' },
    { word: 'ใ-', emoji: '🍃<b>ใบ</b>', say: 'สระใอ', done: 'ใบ สระใอ' },
    { word: 'เ-า', emoji: '🐢<b>เต่า</b>', say: 'สระเอา', done: 'เต่า สระเอา' },
    { word: 'เ-ือ', emoji: '🐯<b>เสือ</b>', say: 'สระเอือ', done: 'เสือ สระเอือ' },
  ],
  thaiVowels2: [
    { word: '-า', emoji: '🦵<b>ขา</b>', say: 'สระอา', done: 'ขา สระอา' },
    { word: '-ี', emoji: '🎨<b>สี</b>', say: 'สระอี', done: 'สี สระอี' },
    { word: '-ู', emoji: '🐍<b>งู</b>', say: 'สระอู', done: 'งู สระอู' },
    { word: '-ิ', emoji: '🪨<b>หิน</b>', say: 'สระอิ', done: 'หิน สระอิ' },
    { word: '-ึ', emoji: '🏢<b>ตึก</b>', say: 'สระอึ', done: 'ตึก สระอึ' },
    { word: '-ือ', emoji: '📖<b>หนังสือ</b>', say: 'สระอือ', done: 'หนังสือ สระอือ' },
    { word: '-ุ', emoji: '👝<b>ถุง</b>', say: 'สระอุ', done: 'ถุง สระอุ' },
    { word: '-ั', emoji: '🥬<b>ผัก</b>', say: 'ไม้หันอากาศ', done: 'ผัก ไม้หันอากาศ' },
    { word: '-ำ', emoji: '⚫<b>ดำ</b>', say: 'สระอำ', done: 'ดำ สระอำ' },
    { word: 'แ-', emoji: '💪<b>แขน</b>', say: 'สระแอ', done: 'แขน สระแอ' },
    { word: 'โ-', emoji: '🌍<b>โลก</b>', say: 'สระโอ', done: 'โลก สระโอ' },
    { word: 'ไ-', emoji: '🥚<b>ไข่</b>', say: 'สระไอ', done: 'ไข่ สระไอ' },
    { word: 'ใ-', emoji: '❤️<b>ใจ</b>', say: 'สระใอ', done: 'ใจ สระใอ' },
    { word: 'เ-า', emoji: '⛰️<b>เขา</b>', say: 'สระเอา', done: 'เขา สระเอา' },
    { word: 'เ-ือ', emoji: '⛵<b>เรือ</b>', say: 'สระเอือ', done: 'เรือ สระเอือ' },
    { word: 'เ-ีย', emoji: '🛏️<b>เตียง</b>', say: 'สระเอีย', done: 'เตียง สระเอีย' },
    { word: '-ัว', emoji: '🐄<b>วัว</b>', say: 'สระอัว', done: 'วัว สระอัว' },
  ],
};
