import { animalHTML } from '../assets.js';
import { sfx, speak } from '../audio.js';

export function mount(stage, cfg = {}) {
  let count = 0;
  stage.innerHTML = `<h2>สวนแครอตของเรา</h2><p class="mini-hint">เก็บแครอต 5 หัวให้เพื่อนกัน</p>
    <div class="harvest-garden">${Array.from({ length: 5 }, (_, i) => `<button class="harvest-plant" aria-label="เก็บแครอตหัวที่ ${i + 1}"><span class="lesson-carrot" aria-hidden="true"></span><span class="plant-number">${i + 1}</span></button>`).join('')}</div>
    <div class="harvest-status">${animalHTML('turtle')}<p role="status">เก็บแล้ว <b id="harvest-count">0</b> / 5 หัว</p></div>`;
  stage.querySelectorAll('.harvest-plant').forEach(button => {
    button.onclick = () => {
      if (button.disabled) return;
      button.disabled = true;
      button.classList.add('picked');
      button.querySelector('.plant-number').textContent = '✓';
      count++;
      stage.querySelector('#harvest-count').textContent = count;
      sfx.correct();
      speak(['หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า'][count - 1]);
      if (count === 5) cfg.onComplete?.();
    };
  });
}
