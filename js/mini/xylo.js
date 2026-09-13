import { wait } from '../utils.js';
import { note, sfx, speak } from '../audio.js';

/* ระนาดหรรษา: แตะแท่งสีให้เสียงโน้ต มีเพลงสั้นๆ ให้ดูแล้วเล่นตาม */

const BARS = [
  { n: 'โด', f: 523.25, c: '#ff6b6b' },
  { n: 'เร', f: 587.33, c: '#ffa94d' },
  { n: 'มี', f: 659.25, c: '#ffd43b' },
  { n: 'ฟา', f: 698.46, c: '#69db7c' },
  { n: 'ซอล', f: 783.99, c: '#4dabf7' },
  { n: 'ลา', f: 880.0, c: '#9775fa' },
  { n: 'ที', f: 987.77, c: '#f783ac' },
  { n: 'โด', f: 1046.5, c: '#ff6b6b' },
];

// เพลงตัวอย่าง (index ของแท่ง) — Twinkle Twinkle ท่อนแรก และ ช้าง ช้าง ช้าง
const SONGS = [
  { name: 'ดาวดวงน้อย ⭐', seq: [0, 0, 4, 4, 5, 5, 4, -1, 3, 3, 2, 2, 1, 1, 0] },
  { name: 'ช้าง ช้าง ช้าง 🐘', seq: [4, 4, 4, -1, 2, 2, 2, -1, 0, 2, 4, 5, 4] },
];

export function mount(stage) {
  let playing = false;

  stage.innerHTML = `
    <div class="mini-hint">แตะแท่งสีให้เสียงเพลง 🎵</div>
    <div class="xylo" id="xylo">
      ${BARS.map((b, i) => `<button class="xbar" data-i="${i}" style="--c:${b.c}; --h:${100 - i * 7}%"><span>${b.n}</span></button>`).join('')}
    </div>
    <div class="mini-actions">
      ${SONGS.map((s, i) => `<button class="btn purple" data-song="${i}">▶ ${s.name}</button>`).join('')}
    </div>`;

  const bars = [...stage.querySelectorAll('.xbar')];

  function hit(i) {
    const b = bars[i];
    note(BARS[i].f);
    b.classList.remove('hit');
    void b.offsetWidth;
    b.classList.add('hit');
  }

  bars.forEach((b, i) => {
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); hit(i); });
  });

  stage.querySelectorAll('[data-song]').forEach((btn) => {
    btn.onclick = async () => {
      if (playing) return;
      playing = true;
      sfx.tap();
      const song = SONGS[Number(btn.dataset.song)];
      speak('ฟังก่อนนะ แล้วลองเล่นตาม');
      await wait(1400);
      for (const i of song.seq) {
        if (i >= 0) hit(i);
        await wait(i >= 0 ? 420 : 300);
      }
      playing = false;
    };
  });

  speak('แตะแท่งสีให้เสียงเพลง');
}
