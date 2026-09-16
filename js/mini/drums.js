import { wait } from '../utils.js';
import { perc, sfx, speak } from '../audio.js';

/* กลองหรรษา: แตะแป้นกลองสีสันต่างๆ ให้เสียงเครื่องเคาะ มีจังหวะตัวอย่างให้ฟังแล้วดูแป้นไฮไลต์ตาม
   ไม่มีคะแนน ไม่มีแพ้ แตะเล่นเองหรือกดฟังจังหวะตัวอย่างก็ได้ */

const PADS = [
  { e: '🥁', n: 'กลองใหญ่', fn: 'kick', c: 'var(--pink)', dc: 'var(--pink-dark)' },
  { e: '🪘', n: 'กลองเล็ก', fn: 'snare', c: 'var(--orange)', dc: 'var(--orange-dark)' },
  { e: '🔔', n: 'ระฆัง', fn: 'bell', c: 'var(--yellow)', dc: 'var(--yellow-dark)' },
  { e: '👏', n: 'ตบมือ', fn: 'clap', c: 'var(--green)', dc: 'var(--green-dark)' },
  { e: '🎶', n: 'ฉาบ', fn: 'hihat', c: 'var(--blue)', dc: 'var(--blue-dark)' },
  { e: '🎉', n: 'เขย่า', fn: 'shaker', c: 'var(--purple)', dc: 'var(--purple-dark)' },
];

// แพทเทิร์นจังหวะตัวอย่าง (index ของแป้นใน PADS, -1 = พัก) ที่ 380ms/จังหวะ
const SONGS = [
  { name: 'มาร์ช 🥁', seq: [0, -1, 1, -1, 0, 0, 1, -1, 0, -1, 1, -1, 0, 0, 1, -1] },
  { name: 'ปาร์ตี้ 🎉', seq: [0, 4, 1, 4, 0, 4, 1, 3, 0, 4, 1, 4, 0, 3, 1, 4] },
];

export function mount(stage) {
  let playing = false; // กันกดเล่นจังหวะตัวอย่างซ้อนกันระหว่างกำลังเล่นอยู่

  stage.innerHTML = `
    <div class="mini-hint">แตะกลองให้เสียงดัง 🥁</div>
    <div class="drum-kit" id="kit">
      ${PADS.map((p, i) => `
        <button class="drum-pad" data-i="${i}" style="--c:${p.c}; --dc:${p.dc}">
          <span class="dp-emoji">${p.e}</span>
          <span class="dp-name">${p.n}</span>
        </button>`).join('')}
    </div>
    <div class="mini-actions">
      ${SONGS.map((s, i) => `<button class="btn purple" data-song="${i}">▶ ${s.name}</button>`).join('')}
    </div>`;

  const pads = [...stage.querySelectorAll('.drum-pad')];

  function hit(i) {
    const pad = pads[i];
    perc[PADS[i].fn]();
    pad.classList.remove('hit');
    void pad.offsetWidth; // รีสตาร์ตแอนิเมชันได้แม้แตะรัวๆ
    pad.classList.add('hit');
  }

  // pointerdown ผูกแยกทีละแป้น เบราว์เซอร์ยิง event ให้เองต่อจุดสัมผัส จึงรองรับแตะหลายนิ้วพร้อมกันได้อยู่แล้ว
  pads.forEach((pad, i) => {
    pad.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (playing) return;
      hit(i);
    });
  });

  stage.querySelectorAll('[data-song]').forEach((btn) => {
    btn.onclick = async () => {
      if (playing) return;
      playing = true;
      try {
        sfx.tap();
        const song = SONGS[Number(btn.dataset.song)];
        await speak('ฟังจังหวะก่อนนะ แล้วลองเล่นตาม');
        await wait(200);
        for (const i of song.seq) {
          if (!stage.isConnected) return; // ผู้ใช้กดกลับระหว่างกำลังเล่นจังหวะ
          if (i >= 0) hit(i);
          await wait(380);
        }
      } finally {
        playing = false;
      }
    };
  });

  speak('แตะกลองให้เสียงดัง ตุ้ม ตุ้ม');
}
