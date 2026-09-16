/* ตัวละครที่มีรูปวาดจริง (assets/friends/<id>.png พื้นโปร่งใส 800px สร้างด้วย design/cutout.py)
   เพิ่มตัวใหม่: ใส่ id + ชื่อไทยใน labels และ emoji ที่ใช้แทนใน emojiAssets แล้วเพิ่มไฟล์ใน sw.js */
const labels = {
  seal: 'แมวน้ำ', turtle: 'เต่า', rabbit: 'กระต่าย', cat: 'แมว', penguin: 'เพนกวิน', fox: 'จิ้งจอก',
  unicorn: 'ยูนิคอร์น', dolphin: 'โลมา', butterfly: 'ผีเสื้อ', octopus: 'หมึกยักษ์', squirrel: 'กระรอก',
};
const emojiAssets = {
  '🦭': 'seal', '🐢': 'turtle', '🐰': 'rabbit', '🐇': 'rabbit', '🐱': 'cat', '🐧': 'penguin', '🦊': 'fox',
  '🦄': 'unicorn', '🐬': 'dolphin', '🦋': 'butterfly', '🐙': 'octopus', '🐿️': 'squirrel', '🐿': 'squirrel',
};

export const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const assetId = value => labels[value] ? value : emojiAssets[value] || null;
export function animalHTML(value, extra = '') {
  const id = assetId(value);
  return id ? `<img class="lilly-animal ${id} ${extra}" src="./assets/friends/${id}.png" alt="${labels[id]}" draggable="false">` : escapeHTML(value);
}

// Legacy word sets also contain authored vowel markup; preserve that fallback.
export function pictureHTML(item) {
  const id = assetId(item.asset) || assetId(item.emoji) || assetId(item.word?.toLowerCase());
  return id ? animalHTML(id) : item.emoji || escapeHTML(item.word || '');
}

/* สติกเกอร์ภารกิจวันนี้ (assets/stickers/<id>.png) — สติกเกอร์ที่เป็นสัตว์ใช้รูปเพื่อนซี้แทน */
const stickerAssets = {
  '🌟': ['star', 'ดาว'], '🌈': ['rainbow', 'รุ้ง'], '🍓': ['strawberry', 'สตรอว์เบอร์รี'], '🌸': ['blossom', 'ดอกไม้'],
  '🐠': ['fish', 'ปลา'], '🎈': ['balloon', 'ลูกโป่ง'], '🍦': ['icecream', 'ไอศกรีม'], '🌻': ['sunflower', 'ทานตะวัน'],
  '🍭': ['lollipop', 'อมยิ้ม'], '🎀': ['bow', 'โบว์'],
};
export function stickerHTML(emoji) {
  const s = stickerAssets[emoji];
  return s ? `<img class="lilly-animal sticker-img" src="./assets/stickers/${s[0]}.png" alt="${s[1]}" draggable="false">` : animalHTML(emoji);
}

export const iconHTML = name => `<i data-lucide="${name}" aria-hidden="true"></i>`;
export const renderIcons = () => window.lucide?.createIcons();
