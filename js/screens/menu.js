import { go } from '../router.js';
import { sfx } from '../audio.js';
import { totalStars } from '../state.js';

/* แถบบนของหน้าเมนู (แผนที่ / พักเล่น / ตู้รางวัล): ปุ่มบ้านใหญ่ๆ ซ้าย ชื่อหน้า ดาวสะสมขวา
   เด็กจำได้ว่า "บ้าน = กลับหน้าแรก" ทุกหน้าเหมือนกัน */
export function topBar(title, { back = 'home', icon = '🏠' } = {}) {
  return `
    <div class="map-head">
      <button class="icon-btn" id="top-back" data-route="${back}" aria-label="กลับ">${icon}</button>
      <h2 class="outlined">${title}</h2>
      <div class="spacer"></div>
      <div class="star-counter">⭐ ${totalStars()}</div>
    </div>`;
}

export function bindTopBar(el) {
  el.querySelectorAll('[data-route]').forEach((button) => {
    button.onclick = () => { sfx.tap(); go(button.dataset.route); };
  });
}
