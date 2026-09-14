import { go } from '../router.js';
import { sfx } from '../audio.js';
import { miniUnlocked } from '../rewards.js';
import { mount as coloring } from '../mini/coloring.js';
import { mount as garden } from '../mini/garden.js';
import { mount as bakery } from '../mini/bakery.js';
import { mount as xylo } from '../mini/xylo.js';
import { mount as balloons } from '../mini/balloons.js';
import { mount as aquarium } from '../mini/aquarium.js';
import { mount as dressup } from '../mini/dressup.js';
import { mount as draw } from '../mini/draw.js';
import { mount as drums } from '../mini/drums.js';
import { mount as fishing } from '../mini/fishing.js';

/* หน้าโฮสต์มินิเกม ไม่มีคะแนน ไม่มีดาว เล่นเพื่อสนุกอย่างเดียว
   id ต้องตรงกับ id รางวัลใน rewards.js */

const MINIS = {
  coloring: { title: '🎨 ระบายสี: ใต้ทะเล', mount: coloring, cfg: { pack: 'sea' } },
  coloring2: { title: '🏠 ระบายสี: บ้านแสนสุข', mount: coloring, cfg: { pack: 'home' } },
  coloring3: { title: '🦋 ระบายสี: สวนสนุก', mount: coloring, cfg: { pack: 'fun' } },
  xylo: { title: '🎵 ระนาดหรรษา', mount: xylo },
  garden: { title: '🌱 สวนผักของลิลลี่', mount: garden },
  balloons: { title: '🎈 ป๊อปลูกโป่ง', mount: balloons },
  bakery: { title: '🧁 ร้านขนมของลิลลี่', mount: bakery },
  aquarium: { title: '🐠 ตู้ปลาของลิลลี่', mount: aquarium },
  dressup: { title: '👒 แต่งตัวเพื่อนซี้', mount: dressup },
  draw: { title: '🖍️ กระดานวาดรูป', mount: draw },
  drums: { title: '🥁 กลองหรรษา', mount: drums },
  fishing: { title: '🎣 ตกปลา', mount: fishing },
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
  mini.mount(el.querySelector('#stage'), mini.cfg || {});
}
