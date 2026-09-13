import { go } from '../router.js';
import { sfx } from '../audio.js';
import { miniUnlocked } from '../rewards.js';
import { mount as coloring } from '../mini/coloring.js';
import { mount as garden } from '../mini/garden.js';
import { mount as bakery } from '../mini/bakery.js';

/* หน้าโฮสต์มินิเกม ไม่มีคะแนน ไม่มีดาว เล่นเพื่อสนุกอย่างเดียว */

const MINIS = {
  coloring: { title: '🎨 ห้องระบายสี', mount: coloring },
  garden: { title: '🌱 สวนผักของลิลลี่', mount: garden },
  bakery: { title: '🧁 ร้านขนมของลิลลี่', mount: bakery },
};

export function showMini(root, { id }) {
  const mini = MINIS[id];
  if (!mini || !miniUnlocked(id)) { go('rewards'); return; }

  const el = document.createElement('div');
  el.className = 'screen game-screen';
  el.innerHTML = `
    <div class="game-bar">
      <button class="icon-btn" id="back">←</button>
      <div class="spacer"></div>
      <div class="star-counter">${mini.title}</div>
    </div>
    <div class="game-stage mini-stage" id="stage"></div>`;
  root.appendChild(el);

  el.querySelector('#back').onclick = () => { sfx.tap(); go('rewards'); };
  mini.mount(el.querySelector('#stage'));
}
