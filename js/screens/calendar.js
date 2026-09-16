import { sfx, speak } from '../audio.js';
import { getStickers, stickerCount, dateKey } from '../mission.js';
import { topBar, bindTopBar } from './menu.js';
import { animalHTML } from '../assets.js';

/* ปฏิทินสติกเกอร์: วันไหนทำภารกิจครบ 3 ด่าน จะมีสติกเกอร์แปะไว้
   เดือนละหน้า เลื่อนดูเดือนก่อนได้ (เผื่ออยากอวดว่าเดือนที่แล้วเก็บได้กี่ดวง) */

const DAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

function monthHTML(year, month, stickers) {
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const today = dateKey();
  let cells = '<span></span>'.repeat(first.getDay());
  for (let d = 1; d <= days; d++) {
    const key = dateKey(new Date(year, month, d));
    const sticker = stickers[key];
    const cls = ['cal-day', key === today ? 'today' : '', sticker ? 'got' : '', key > today ? 'future' : ''].join(' ');
    cells += `<span class="${cls}"><small>${d}</small>${sticker ? `<b>${animalHTML(sticker)}</b>` : ''}</span>`;
  }
  return cells;
}

export function showCalendar(root) {
  const stickers = getStickers();
  const total = stickerCount();
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();

  const el = document.createElement('div');
  el.className = 'screen summary';
  el.innerHTML = `
    ${topBar('สติกเกอร์')}
    <div class="summary-body">
      <div class="cal-total">ได้สติกเกอร์แล้ว <b>${total}</b> ดวง</div>
      <div class="card cal-card">
        <div class="cal-head">
          <button class="icon-btn" id="prev" aria-label="เดือนก่อน">◀</button>
          <div class="cal-title" id="title"></div>
          <button class="icon-btn" id="next" aria-label="เดือนถัดไป">▶</button>
        </div>
        <div class="cal-grid">${DAYS.map((d) => `<i>${d}</i>`).join('')}<div class="cal-cells" id="cells"></div></div>
      </div>
      <p class="foot">เล่นภารกิจวันนี้ครบ 3 ด่าน ได้สติกเกอร์ 1 ดวง</p>
    </div>`;
  root.appendChild(el);
  bindTopBar(el);

  function render() {
    el.querySelector('#title').textContent = new Date(year, month, 1).toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
    el.querySelector('#cells').innerHTML = monthHTML(year, month, stickers);
    el.querySelector('#next').disabled = year === now.getFullYear() && month === now.getMonth();
  }
  el.querySelector('#prev').onclick = () => { sfx.tap(); month--; if (month < 0) { month = 11; year--; } render(); };
  el.querySelector('#next').onclick = () => { sfx.tap(); month++; if (month > 11) { month = 0; year++; } render(); };
  render();
  speak(total ? `ได้สติกเกอร์แล้ว ${total} ดวง` : 'เล่นภารกิจวันนี้ให้ครบ จะได้สติกเกอร์นะ');
}
