/* ตัวละครที่มีรูปวาดจริง (assets/friends/<id>.png พื้นโปร่งใส 800px สร้างด้วย design/cutout.py)
   เพิ่มตัวใหม่: ใส่ id + ชื่อไทยใน labels และ emoji ที่ใช้แทนใน emojiAssets แล้วเพิ่มไฟล์ใน sw.js */
const labels = { seal: 'แมวน้ำ', turtle: 'เต่า', rabbit: 'กระต่าย', cat: 'แมว' };
const emojiAssets = { '🦭': 'seal', '🐢': 'turtle', '🐰': 'rabbit', '🐇': 'rabbit', '🐱': 'cat' };

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

export const iconHTML = name => `<i data-lucide="${name}" aria-hidden="true"></i>`;
export const renderIcons = () => window.lucide?.createIcons();
