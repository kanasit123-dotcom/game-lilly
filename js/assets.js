const labels = { seal: 'แมวน้ำ', turtle: 'เต่า', rabbit: 'กระต่าย' };
const emojiAssets = { '🦭': 'seal', '🐢': 'turtle', '🐰': 'rabbit', '🐇': 'rabbit' };

export const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const assetId = value => labels[value] ? value : emojiAssets[value] || null;
export function animalHTML(value, extra = '') {
  const id = assetId(value);
  return id ? `<span class="lilly-animal ${id} ${extra}" role="img" aria-label="${labels[id]}"></span>` : escapeHTML(value);
}

// Legacy word sets also contain authored vowel markup; preserve that fallback.
export function pictureHTML(item) {
  const id = assetId(item.asset) || assetId(item.emoji) || assetId(item.word?.toLowerCase());
  return id ? animalHTML(id) : item.emoji || escapeHTML(item.word || '');
}

export const iconHTML = name => `<i data-lucide="${name}" aria-hidden="true"></i>`;
export const renderIcons = () => window.lucide?.createIcons();
