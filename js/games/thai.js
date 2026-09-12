/* ข้อมูลภาษาไทยสำหรับเด็กอนุบาล
   เลือกเฉพาะคำที่มีรูป emoji ชัดเจน และเลี่ยงคำลวงที่ไปพ้องกับคำไม่สุภาพ */

/* พยัญชนะกับคำประกอบ — word คือตัวอักษรที่โชว์บนการ์ด, say คือเสียงอ่าน */
export const THAI_CONSONANTS = [
  { word: 'ก', emoji: '🐔', say: 'กอ ไก่', name: 'ไก่' },
  { word: 'ข', emoji: '🥚', say: 'ขอ ไข่', name: 'ไข่' },
  { word: 'ค', emoji: '🐃', say: 'คอ ควาย', name: 'ควาย' },
  { word: 'ง', emoji: '🐍', say: 'งอ งู', name: 'งู' },
  { word: 'จ', emoji: '🍽️', say: 'จอ จาน', name: 'จาน' },
  { word: 'ช', emoji: '🐘', say: 'ชอ ช้าง', name: 'ช้าง' },
  { word: 'ด', emoji: '👶', say: 'ดอ เด็ก', name: 'เด็ก' },
  { word: 'ต', emoji: '🐢', say: 'ตอ เต่า', name: 'เต่า' },
  { word: 'น', emoji: '🐭', say: 'นอ หนู', name: 'หนู' },
  { word: 'บ', emoji: '🍃', say: 'บอ ใบไม้', name: 'ใบไม้' },
  { word: 'ป', emoji: '🐟', say: 'ปอ ปลา', name: 'ปลา' },
  { word: 'ผ', emoji: '🐝', say: 'ผอ ผึ้ง', name: 'ผึ้ง' },
  { word: 'ม', emoji: '🐴', say: 'มอ ม้า', name: 'ม้า' },
  { word: 'ย', emoji: '👹', say: 'ยอ ยักษ์', name: 'ยักษ์' },
  { word: 'ร', emoji: '⛵', say: 'รอ เรือ', name: 'เรือ' },
  { word: 'ล', emoji: '🐵', say: 'ลอ ลิง', name: 'ลิง' },
  { word: 'ว', emoji: '💍', say: 'วอ แหวน', name: 'แหวน' },
  { word: 'ส', emoji: '🐯', say: 'สอ เสือ', name: 'เสือ' },
  { word: 'ห', emoji: '📦', say: 'หอ หีบ', name: 'หีบ' },
  { word: 'อ', emoji: '🛁', say: 'ออ อ่าง', name: 'อ่าง' },
  { word: 'ฮ', emoji: '🦉', say: 'ฮอ นกฮูก', name: 'นกฮูก' },
];

/* คำตามสระ: เด็กดูรูปแล้วเลือกคำที่สะกดถูก คำลวงต่างกันแค่สระ */
export const THAI_VOWEL_WORDS = [
  { word: 'ปู', emoji: '🦀', wrong: ['ปา', 'ปี'] },
  { word: 'งู', emoji: '🐍', wrong: ['งา', 'งี'] },
  { word: 'ปลา', emoji: '🐟', wrong: ['ปลี', 'ปลู'] },
  { word: 'ตา', emoji: '👁️', wrong: ['ตี', 'ตู'] },
  { word: 'ยา', emoji: '💊', wrong: ['ยี', 'ยู'] },
  { word: 'ชา', emoji: '🍵', wrong: ['ชี', 'ชู'] },
  { word: 'หนู', emoji: '🐭', wrong: ['หนา', 'หนี'] },
  { word: 'ม้า', emoji: '🐴', wrong: ['มี', 'มู'] },
  { word: 'นา', emoji: '🌾', wrong: ['นี', 'นู'] },
  { word: 'โบ', emoji: '🎀', wrong: ['บา', 'บี'] },
  { word: 'รู', emoji: '🕳️', wrong: ['รา', 'รี'] },
  { word: 'ตู้', emoji: '🗄️', wrong: ['ตา', 'ตี'] },
  { word: 'แมว', emoji: '🐱', wrong: ['มาว', 'โมว'] },
  { word: 'เรือ', emoji: '⛵', wrong: ['รือ', 'แรือ'] },
];

/* เติมตัวสะกด: stem คือส่วนหน้า final คือตัวสะกดที่หายไป */
export const THAI_FINAL_WORDS = [
  { stem: 'น', final: 'ก', emoji: '🐦', word: 'นก' },
  { stem: 'บ้า', final: 'น', emoji: '🏠', word: 'บ้าน' },
  { stem: 'แม', final: 'ว', emoji: '🐱', word: 'แมว' },
  { stem: 'ขน', final: 'ม', emoji: '🍬', word: 'ขนม' },
  { stem: 'ร', final: 'ถ', emoji: '🚗', word: 'รถ' },
  { stem: 'เด็', final: 'ก', emoji: '👶', word: 'เด็ก' },
  { stem: 'ดา', final: 'ว', emoji: '⭐', word: 'ดาว' },
  { stem: 'ปา', final: 'ก', emoji: '👄', word: 'ปาก' },
  { stem: 'จา', final: 'น', emoji: '🍽️', word: 'จาน' },
  { stem: 'ส้', final: 'ม', emoji: '🍊', word: 'ส้ม' },
  { stem: 'ผั', final: 'ก', emoji: '🥬', word: 'ผัก' },
  { stem: 'ข้า', final: 'ว', emoji: '🍚', word: 'ข้าว' },
  { stem: 'ลิ', final: 'ง', emoji: '🐵', word: 'ลิง' },
  { stem: 'ช้า', final: 'ง', emoji: '🐘', word: 'ช้าง' },
  { stem: 'ก', final: 'บ', emoji: '🐸', word: 'กบ' },
  { stem: 'ฟั', final: 'น', emoji: '🦷', word: 'ฟัน' },
];

export const THAI_FINAL_POOL = ['ก', 'ง', 'น', 'ม', 'ว', 'บ', 'ด', 'ถ'];
