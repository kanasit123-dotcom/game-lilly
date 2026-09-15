import { go } from '../router.js';
import { LEVELS, SUBJECTS } from '../levels.js';
import { getStars, nextUnplayedId } from '../state.js';
import { iconHTML } from '../assets.js';
import { menuHeader, bindMenu, categories } from './menu.js';

let activeSubject = 'all';
let collection = 'all';
export function showMap(root, params = {}) {
  if (SUBJECTS.some(s => s.id === params.subject)) activeSubject = params.subject;
  const currentId = nextUnplayedId();
  const el = document.createElement('div');
  el.className = 'screen lilly-scroll';
  el.innerHTML = `${menuHeader('map')}<div class="lilly-content"><div class="lilly-eyebrow">ทีละนิด เก่งขึ้นทุกวัน</div><h1>เลือกโลกที่อยากไป</h1>
    <div class="library-controls"><div class="subject-tabs" role="group" aria-label="หมวดบทเรียน">${SUBJECTS.map(s => `<button data-s="${s.id}" aria-pressed="${activeSubject === s.id}">${s.label}</button>`).join('')}</div>
    <div class="collection-tabs" role="group" aria-label="ชุดบทเรียน"><button data-collection="all" aria-pressed="${collection === 'all'}">ทุกด่าน</button><button data-collection="new" aria-pressed="${collection === 'new'}">ชุดใหม่ 32 ด่าน</button></div></div>
    <p class="library-count" role="status"></p><div class="lesson-library"></div></div>`;
  root.appendChild(el);
  bindMenu(el);
  function render() {
    const levels = LEVELS.filter(l => (activeSubject === 'all' || l.subject === activeSubject) && (collection === 'all' || l.fresh));
    el.querySelector('.library-count').textContent = `${levels.length} บทเรียน`;
    el.querySelector('.lesson-library').innerHTML = levels.length ? levels.map(l => {
      const subject = categories.find(c => c.id === l.subject);
      return `<button class="library-level${l.id === currentId ? ' current' : ''}" data-id="${l.id}"><span class="level-art ${l.subject}">${l.type === 'lesson' ? subject.art : l.icon}</span><span class="level-info"><b>${l.title}</b><small>${subject.title}${l.fresh ? ' · ใหม่' : ''}</small><span class="level-stars" aria-label="${getStars(l.id)} ดาว">${getStars(l.id) ? '★'.repeat(getStars(l.id)) : 'ยังไม่ได้เล่น'}</span></span>${iconHTML('chevron-right')}</button>`;
    }).join('') : '<p class="library-empty">หมวดนี้ยังไม่มีบทเรียนในชุดใหม่ เลือกทุกด่านเพื่อเล่นได้เลย</p>';
    el.querySelectorAll('[data-id]').forEach(button => { button.onclick = () => go('game', { levelId: button.dataset.id }); });
    window.lucide?.createIcons();
  }
  el.querySelectorAll('[data-s]').forEach(button => { button.onclick = () => {
    activeSubject = button.dataset.s;
    el.querySelectorAll('[data-s]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    render();
  }; });
  el.querySelectorAll('[data-collection]').forEach(button => { button.onclick = () => {
    collection = button.dataset.collection;
    el.querySelectorAll('[data-collection]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    render();
  }; });
  render();
}
