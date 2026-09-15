import { go } from '../router.js';
import { sfx } from '../audio.js';
import { totalStars, nextUnplayedId, getMini, setMini } from '../state.js';
import { getLevel } from '../levels.js';
import { animalHTML, iconHTML } from '../assets.js';
import { menuHeader, bindMenu, categories } from './menu.js';

export function showHome(root) {
  const next = getLevel(nextUnplayedId());
  const prefs = getMini('preferences') || {};
  const el = document.createElement('div');
  el.className = 'screen lilly-scroll';
  el.innerHTML = `${menuHeader('home')}<div class="lilly-content">
    <div class="lilly-welcome"><div><div class="lilly-eyebrow">วันนี้ของลิลลี่</div><h1>โลกของลิลลี่</h1><p>วันนี้เราไปเรียนรู้ด้วยกันนะ</p></div><div class="lilly-stars">ดาวสะสม<b>${totalStars()} ดวง</b></div></div>
    <fieldset class="lilly-friends"><legend class="sr-only">เลือกเพื่อนร่วมทาง</legend>${[['seal', 'แมวน้ำ'], ['turtle', 'เต่า'], ['rabbit', 'กระต่าย']].map(([id, label]) => `<label>${animalHTML(id)}<span><input type="radio" name="buddy" value="${id}" aria-label="${label}" ${(prefs.buddy || 'seal') === id ? 'checked' : ''}>${label}</span></label>`).join('')}</fieldset>
    <section class="lilly-daily"><span class="daily-index">01</span><div><h2>ไปเยี่ยมครอบครัวกัน</h2><p>บทเรียนใหม่ · รู้จักญาติทั้งฝั่งพ่อและแม่</p></div><button class="btn green" id="new-lesson">เริ่มเรียน ${iconHTML('arrow-right')}</button></section>
    <div class="lilly-section-title"><h2>วันนี้อยากเรียนอะไร</h2><button class="lilly-text" id="continue">เรียนต่อ ${iconHTML('arrow-right')}</button></div>
    <div class="lilly-category-grid">${categories.map(c => `<button class="lilly-category" data-subject="${c.id}"><span class="category-art ${c.id}">${c.art}</span><b>${c.title}</b><small>${c.detail}</small>${iconHTML('arrow-up-right')}</button>`).join('')}</div>
    <p class="lilly-foot">บทเรียนถัดไปของลิลลี่: ${next.title}</p></div>`;
  root.appendChild(el);
  bindMenu(el);
  el.querySelector('#new-lesson').onclick = () => { sfx.tap(); go('game', { levelId: 'f-home' }); };
  el.querySelector('#continue').onclick = () => { sfx.tap(); go('game', { levelId: next.id }); };
  el.querySelectorAll('[data-subject]').forEach(button => { button.onclick = () => go('map', { subject: button.dataset.subject }); });
  el.querySelectorAll('[name="buddy"]').forEach(input => { input.onchange = () => setMini('preferences', { ...getMini('preferences'), buddy: input.value }); });
}
