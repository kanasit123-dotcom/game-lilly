import { go } from '../router.js';
import { iconHTML } from '../assets.js';
import { sfx } from '../audio.js';

export function menuHeader(active) {
  return `<header class="lilly-header"><button class="lilly-brand" data-route="home"><span class="lilly-mark">ล</span><span>โลกของลิลลี่<small>LILLY'S LITTLE WORLD</small></span></button>
    <nav aria-label="เมนูหลัก">${[['home', 'house', 'วันนี้'], ['map', 'book-open', 'บทเรียน'], ['playroom', 'sprout', 'พักเล่น'], ['rewards', 'sparkles', 'รางวัล']].map(([route, icon, title]) => `<button data-route="${route}" ${active === route ? 'aria-current="page"' : ''}>${iconHTML(icon)}<span>${title}</span></button>`).join('')}</nav>
    <button class="icon-btn" data-route="summary" title="สำหรับผู้ปกครอง" aria-label="สำหรับผู้ปกครอง">${iconHTML('settings-2')}</button></header>`;
}
export function bindMenu(el) {
  el.querySelectorAll('[data-route]').forEach(button => { button.onclick = () => { sfx.tap(); go(button.dataset.route); }; });
}
export const categories = [
  { id: 'family', title: 'ครอบครัวของเรา', art: 'บ้าน', detail: 'ปู่ ย่า ตา ยาย และญาติของเรา' },
  { id: 'thai', title: 'สวนภาษาไทย', art: 'ก อา', detail: 'สระ ประสมคำ และตัวสะกด' },
  { id: 'math', title: 'สวนสนุกตัวเลข', art: '1 2 3', detail: 'นับ บวก ลบ และหลักสิบ' },
  { id: 'en', title: 'เพื่อนภาษาอังกฤษ', art: 'Aa Bb', detail: 'ฟังคำศัพท์และจับคู่ภาพ' },
  { id: 'brain', title: 'นักคิดตัวน้อย', art: '○ △', detail: 'ความจำ แบบรูป และการสังเกต' },
  { id: 'life', title: 'โลกใกล้ตัว', art: 'เรา', detail: 'ความรู้สึก กิจวัตร และธรรมชาติ' }
];
