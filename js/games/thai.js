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
  // ชุดที่เหลือ เว้นตัวที่ไม่มีรูปให้เด็กนึกออก (ฃ ฅ ฏ ฐ ณ พ)
  { word: 'ฆ', emoji: '🔔', say: 'ฆอ ระฆัง', name: 'ระฆัง' },
  { word: 'ซ', emoji: '⛓️', say: 'ซอ โซ่', name: 'โซ่' },
  { word: 'ญ', emoji: '👧', say: 'ญอ หญิง', name: 'หญิง' },
  { word: 'ฎ', emoji: '👑', say: 'ฎอ ชฎา', name: 'ชฎา' },
  { word: 'ถ', emoji: '👝', say: 'ถอ ถุง', name: 'ถุง' },
  { word: 'ท', emoji: '💂', say: 'ทอ ทหาร', name: 'ทหาร' },
  { word: 'ธ', emoji: '🚩', say: 'ธอ ธง', name: 'ธง' },
  { word: 'ฟ', emoji: '🦷', say: 'ฟอ ฟัน', name: 'ฟัน' },
  { word: 'ภ', emoji: '🚢', say: 'ภอ สำเภา', name: 'สำเภา' },
  { word: 'ศ', emoji: '🛖', say: 'ศอ ศาลา', name: 'ศาลา' },
  { word: 'ษ', emoji: '🧙', say: 'ษอ ฤๅษี', name: 'ฤๅษี' },
  { word: 'ฌ', emoji: '🌳', say: 'ฌอ เฌอ', name: 'เฌอ' },
  { word: 'ฑ', emoji: '👸', say: 'ฑอ มณโฑ', name: 'มณโฑ' },
  { word: 'ฒ', emoji: '👴', say: 'ฒอ ผู้เฒ่า', name: 'ผู้เฒ่า' },
  { word: 'ฬ', emoji: '🪁', say: 'ฬอ จุฬา', name: 'จุฬา' },
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
  { word: 'ไก่', emoji: '🐔', wrong: ['กา', 'โก'] },
  { word: 'เต่า', emoji: '🐢', wrong: ['ตา', 'โต'] },
  { word: 'ใบ', emoji: '🍃', wrong: ['บา', 'โบ'] },
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

/* ชุด 2: คำยาวขึ้น ตัวลวงเป็นคำจริงที่สะกดคล้ายกัน ให้ได้ฝึกอ่านจริงๆ */
export const THAI_VOWEL_WORDS2 = [
  { word: 'ปลา', emoji: '🐟', wrong: ['ปลี', 'ปลู'] },
  { word: 'สี', emoji: '🎨', wrong: ['สา', 'สู'] },
  { word: 'เสือ', emoji: '🐯', wrong: ['เสา', 'สือ'] },
  { word: 'เรือ', emoji: '⛵', wrong: ['เรา', 'รือ'] },
  { word: 'มือ', emoji: '✋', wrong: ['มา', 'มี'] },
  { word: 'ไข่', emoji: '🥚', wrong: ['ขา', 'โข่'] },
  { word: 'กุ้ง', emoji: '🦐', wrong: ['กิ้ง', 'แก้ง'] },
  { word: 'ลิง', emoji: '🐵', wrong: ['ลุง', 'แลง'] },
  { word: 'ดาว', emoji: '⭐', wrong: ['ดิว', 'เดา'] },
  { word: 'บ้าน', emoji: '🏠', wrong: ['บิน', 'บุน'] },
  { word: 'ช้าง', emoji: '🐘', wrong: ['ชิง', 'โช้ง'] },
  { word: 'ส้ม', emoji: '🍊', wrong: ['สาม', 'สิม'] },
  { word: 'ฟัน', emoji: '🦷', wrong: ['ฟีน', 'ฟูน'] },
  { word: 'นก', emoji: '🐦', wrong: ['นา', 'นู'] },
  { word: 'หอย', emoji: '🐚', wrong: ['หาย', 'เหย'] },
  { word: 'ผีเสื้อ', emoji: '🦋', wrong: ['ผาเสือ', 'ผีเสา'] },
  { word: 'แตงโม', emoji: '🍉', wrong: ['ตางโม', 'แตงมา'] },
  { word: 'กล้วย', emoji: '🍌', wrong: ['กลาย', 'กลุ้ย'] },
  { word: 'ดอกไม้', emoji: '🌸', wrong: ['ดากไม้', 'ดอกมี'] },
  { word: 'รองเท้า', emoji: '👟', wrong: ['รางเท้า', 'รองเตา'] },
];

export const THAI_FINAL_WORDS2 = [
  { stem: 'หมว', final: 'ก', emoji: '🧢', word: 'หมวก' },
  { stem: 'เทีย', final: 'น', emoji: '🕯️', word: 'เทียน' },
  { stem: 'ม', final: 'ด', emoji: '🐜', word: 'มด' },
  { stem: 'เป็', final: 'ด', emoji: '🦆', word: 'เป็ด' },
  { stem: 'น', final: 'ม', emoji: '🥛', word: 'นม' },
  { stem: 'ขว', final: 'ด', emoji: '🍼', word: 'ขวด' },
  { stem: 'ถั', final: 'ง', emoji: '🪣', word: 'ถัง' },
  { stem: 'หมึ', final: 'ก', emoji: '🦑', word: 'หมึก' },
  { stem: 'แข', final: 'น', emoji: '💪', word: 'แขน' },
  { stem: 'เตีย', final: 'ง', emoji: '🛏️', word: 'เตียง' },
  { stem: 'บอ', final: 'ล', emoji: '⚽', word: 'บอล' },
  { stem: 'หอ', final: 'ย', emoji: '🐚', word: 'หอย' },
  { stem: 'กุ้', final: 'ง', emoji: '🦐', word: 'กุ้ง' },
  { stem: 'ตึ', final: 'ก', emoji: '🏢', word: 'ตึก' },
  { stem: 'เค้', final: 'ก', emoji: '🍰', word: 'เค้ก' },
  { stem: 'ร่', final: 'ม', emoji: '☂️', word: 'ร่ม' },
];

export const THAI_FINAL_POOL2 = ['ก', 'ง', 'น', 'ม', 'ด', 'ล', 'ย', 'บ'];

/* ---- ตำแหน่งอักษรไทย ใช้ร่วมกันทุกเกมที่แสดงตัวอักษรแยกส่วน ----
   สระบน + วรรณยุกต์ (ิ ี ึ ื ั ็ ่ ้ ๊ ๋ ์) และ สระล่าง (ุ ู) */
export const ABOVE = /[\u0E31\u0E34-\u0E37\u0E47-\u0E4E]/;
export const BELOW = /[\u0E38-\u0E3A]/;
export const isCombining = (ch) => ABOVE.test(ch) || BELOW.test(ch);

/* สระบน-ล่างกับวรรณยุกต์เป็นตัวลอย ต้องมีวงกลมประให้เห็นตำแหน่ง เหมือนในหนังสือเรียน */
export const tileText = (ch) => (isCombining(ch) ? '◌' + ch : ch);

/* จัดตัวอักษรเป็นช่องตามตำแหน่งจริงของอักษรไทย:
   พยัญชนะและสระหน้า-หลัง (เ แ โ ไ ใ า ะ) อยู่แถวหลัก
   สระบน/วรรณยุกต์ไปช่องเล็กเหนือพยัญชนะตัวก่อนหน้า สระล่างไปช่องเล็กใต้
   ค่าในช่องคือ index ของตัวอักษรในคำ ลำดับการแตะยังเป็นลำดับเขียนปกติ */
export function toCells(letters) {
  const cells = [];
  letters.forEach((ch, i) => {
    const last = cells[cells.length - 1];
    if (last && ABOVE.test(ch)) last.above.push(i);
    else if (last && BELOW.test(ch)) last.below.push(i);
    else cells.push({ base: i, above: [], below: [] });
  });
  return cells;
}

/* ---- สระ ----
   form = รูปสระที่โชว์บนปุ่ม (◌ แทนพยัญชนะ), name = ชื่อที่อ่านให้ฟัง,
   glyphs = ตัวอักษรของสระตามลำดับที่ปรากฏในคำ (สระประสมมีหลายตัว เช่น เ-า) */
export const THAI_VOWELS = {
  'า': { form: '◌า', name: 'สระอา', glyphs: ['า'] },
  'ี': { form: '◌ี', name: 'สระอี', glyphs: ['ี'] },
  'ู': { form: '◌ู', name: 'สระอู', glyphs: ['ู'] },
  'ิ': { form: '◌ิ', name: 'สระอิ', glyphs: ['ิ'] },
  'ึ': { form: '◌ึ', name: 'สระอึ', glyphs: ['ึ'] },
  'ื': { form: '◌ือ', name: 'สระอือ', glyphs: ['ื', 'อ'] },
  'ุ': { form: '◌ุ', name: 'สระอุ', glyphs: ['ุ'] },
  'ั': { form: '◌ั', name: 'สระอะ ไม้หันอากาศ', glyphs: ['ั'] },
  'ำ': { form: '◌ำ', name: 'สระอำ', glyphs: ['ำ'] },
  'เ': { form: 'เ◌', name: 'สระเอ', glyphs: ['เ'] },
  'แ': { form: 'แ◌', name: 'สระแอ', glyphs: ['แ'] },
  'โ': { form: 'โ◌', name: 'สระโอ', glyphs: ['โ'] },
  'ไ': { form: 'ไ◌', name: 'สระไอ ไม้มลาย', glyphs: ['ไ'] },
  'ใ': { form: 'ใ◌', name: 'สระใอ ไม้ม้วน', glyphs: ['ใ'] },
  'เ-า': { form: 'เ◌า', name: 'สระเอา', glyphs: ['เ', 'า'] },
  'เ-ือ': { form: 'เ◌ือ', name: 'สระเอือ', glyphs: ['เ', 'ื', 'อ'] },
  'เ-ีย': { form: 'เ◌ีย', name: 'สระเอีย', glyphs: ['เ', 'ี', 'ย'] },
  'ั-ว': { form: '◌ัว', name: 'สระอัว', glyphs: ['ั', 'ว'] },
  'แ-ะ': { form: 'แ◌ะ', name: 'สระแอะ', glyphs: ['แ', 'ะ'] },
  'โ-ะ': { form: 'โ◌ะ', name: 'สระโอะ', glyphs: ['โ', 'ะ'] },
};

/* เติมสระ: คำที่สระหายไป แบ่ง 2 ชุด สระเดี่ยวหลังพยัญชนะ กับ สระหน้า/สระประสม
   เลือกเฉพาะคำที่มี emoji ชัดและเด็กอนุบาลรู้จัก */
export const THAI_VOWEL_FILL = {
  simple: [
    { word: 'ปลา', emoji: '🐟', vowel: 'า' }, { word: 'ตา', emoji: '👁️', vowel: 'า' },
    { word: 'ขา', emoji: '🦵', vowel: 'า' }, { word: 'ม้า', emoji: '🐴', vowel: 'า' },
    { word: 'ชา', emoji: '🍵', vowel: 'า' }, { word: 'นา', emoji: '🌾', vowel: 'า' },
    { word: 'ดี', emoji: '✅', vowel: 'ี' }, { word: 'สี', emoji: '🎨', vowel: 'ี' },
    { word: 'ผี', emoji: '👻', vowel: 'ี' },
    { word: 'ปู', emoji: '🦀', vowel: 'ู' }, { word: 'งู', emoji: '🐍', vowel: 'ู' },
    { word: 'หนู', emoji: '🐭', vowel: 'ู' }, { word: 'ดู', emoji: '👀', vowel: 'ู' },
    { word: 'ตู้', emoji: '🗄️', vowel: 'ู' },
    { word: 'ลิง', emoji: '🐵', vowel: 'ิ' }, { word: 'หิน', emoji: '🪨', vowel: 'ิ' },
    { word: 'ลิ้น', emoji: '👅', vowel: 'ิ' },
    { word: 'ผึ้ง', emoji: '🐝', vowel: 'ึ' }, { word: 'ตึก', emoji: '🏢', vowel: 'ึ' },
    { word: 'หมึก', emoji: '🦑', vowel: 'ึ' },
    { word: 'มือ', emoji: '✋', vowel: 'ื' }, { word: 'หนังสือ', emoji: '📖', vowel: 'ื' },
    { word: 'กุ้ง', emoji: '🦐', vowel: 'ุ' }, { word: 'ถุง', emoji: '👝', vowel: 'ุ' },
    { word: 'ตุ๊กตา', emoji: '🧸', vowel: 'ุ' },
    { word: 'ฟัน', emoji: '🦷', vowel: 'ั' }, { word: 'ผัก', emoji: '🥬', vowel: 'ั' },
    { word: 'ถัง', emoji: '🪣', vowel: 'ั' }, { word: 'นั่ง', emoji: '🪑', vowel: 'ั' },
    { word: 'น้ำ', emoji: '💧', vowel: 'ำ' }, { word: 'ดำ', emoji: '⚫', vowel: 'ำ' },
    { word: 'ขำ', emoji: '😂', vowel: 'ำ' },
  ],
  front: [
    { word: 'เกม', emoji: '🎮', vowel: 'เ' }, { word: 'เพลง', emoji: '🎵', vowel: 'เ' },
    { word: 'เลข', emoji: '🔢', vowel: 'เ' },
    { word: 'แมว', emoji: '🐱', vowel: 'แ' }, { word: 'แขน', emoji: '💪', vowel: 'แ' },
    { word: 'แก้ว', emoji: '🥛', vowel: 'แ' }, { word: 'แหวน', emoji: '💍', vowel: 'แ' },
    { word: 'แพะ', emoji: '🐐', vowel: 'แ-ะ' },
    { word: 'โบ', emoji: '🎀', vowel: 'โ' }, { word: 'โซ่', emoji: '⛓️', vowel: 'โ' },
    { word: 'โคม', emoji: '🏮', vowel: 'โ' }, { word: 'โลก', emoji: '🌍', vowel: 'โ' },
    { word: 'โต๊ะ', emoji: '🪑', vowel: 'โ-ะ' },
    { word: 'ไก่', emoji: '🐔', vowel: 'ไ' }, { word: 'ไข่', emoji: '🥚', vowel: 'ไ' },
    { word: 'ไม้', emoji: '🪵', vowel: 'ไ' }, { word: 'ไฟ', emoji: '🔥', vowel: 'ไ' },
    { word: 'ใบ', emoji: '🍃', vowel: 'ใ' }, { word: 'ใจ', emoji: '❤️', vowel: 'ใ' },
    { word: 'เต่า', emoji: '🐢', vowel: 'เ-า' }, { word: 'เขา', emoji: '⛰️', vowel: 'เ-า' },
    { word: 'เก้า', emoji: '9️⃣', vowel: 'เ-า' },
    { word: 'เสือ', emoji: '🐯', vowel: 'เ-ือ' }, { word: 'เรือ', emoji: '⛵', vowel: 'เ-ือ' },
    { word: 'เสื้อ', emoji: '👕', vowel: 'เ-ือ' },
    { word: 'เตียง', emoji: '🛏️', vowel: 'เ-ีย' }, { word: 'เขียน', emoji: '✏️', vowel: 'เ-ีย' },
    { word: 'เรียน', emoji: '📚', vowel: 'เ-ีย' },
    { word: 'วัว', emoji: '🐄', vowel: 'ั-ว' }, { word: 'หัวใจ', emoji: '❤️', vowel: 'ั-ว' },
  ],
};

/* หา index ของตัวสระในคำ ไล่หาทีละตัวตามลำดับ (สระประสมกระจายอยู่หน้า-บน-หลังพยัญชนะ) */
export function vowelIndexes(word, vowelKey) {
  const out = [];
  let from = 0;
  for (const g of THAI_VOWELS[vowelKey].glyphs) {
    const i = word.indexOf(g, from);
    if (i < 0) return out;
    out.push(i);
    from = i + 1;
  }
  return out;
}

/* อ่านคำ: โชว์คำให้อ่านเอง แล้วเลือกรูปที่ตรง (ไม่อ่านออกเสียงให้ก่อน)
   ชุด 1 คำสั้นสระเดี่ยว ชุด 2 สระหน้า/สระประสม/มีตัวสะกด */
const uniq = (list) => {
  const seen = new Set();
  return list.filter((w) => (seen.has(w.word) ? false : (seen.add(w.word), true)));
};
export const THAI_READ = {
  1: uniq([
    ...THAI_VOWEL_FILL.simple,
    { word: 'นก', emoji: '🐦' }, { word: 'กบ', emoji: '🐸' }, { word: 'มด', emoji: '🐜' },
    { word: 'โบ', emoji: '🎀' }, { word: 'ไก่', emoji: '🐔' }, { word: 'เต่า', emoji: '🐢' },
  ]),
  2: uniq([
    ...THAI_VOWEL_FILL.front,
    ...THAI_FINAL_WORDS2.map((w) => ({ word: w.word, emoji: w.emoji })),
    { word: 'บ้าน', emoji: '🏠' }, { word: 'ช้าง', emoji: '🐘' }, { word: 'ดาว', emoji: '⭐' },
    { word: 'รถ', emoji: '🚗' }, { word: 'ผีเสื้อ', emoji: '🦋' }, { word: 'กล้วย', emoji: '🍌' },
  ]),
};
