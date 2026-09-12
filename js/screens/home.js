import { go } from '../router.js';
import { unlockAudio, sfx } from '../audio.js';
import { totalStars } from '../state.js';

export function showHome(root) {
  const el = document.createElement('div');
  el.className = 'screen home';
  el.innerHTML = `
    <div class="home-buddies"><span>🐢</span><span>🐰</span><span>🦭</span></div>
    <h1 class="outlined">โลกของลิลลี่</h1>
    <p class="tagline">เกมคณิตศาสตร์ และ ภาษาอังกฤษ</p>
    <button class="btn big green" id="play">เล่นเลย! ▶</button>
    <div class="home-stars">⭐ ดาวสะสม ${totalStars()} ดวง</div>`;
  root.appendChild(el);

  el.querySelector('#play').onclick = () => {
    unlockAudio();
    sfx.tap();
    go('map');
  };
}
