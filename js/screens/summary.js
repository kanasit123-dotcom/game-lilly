import { go } from '../router.js';
import { LEVELS, SUBJECTS } from '../levels.js';
import { getStars, getPlays, totalStars, resetAll } from '../state.js';
import { sfx } from '../audio.js';

/* หน้าสำหรับผู้ปกครอง: ดูว่าลูกเล่นอะไรไปแล้ว เก่งตรงไหน ควรฝึกตรงไหน
   ปุ่มล้างข้อมูลต้องกดค้าง 2 วินาที กันเด็กเผลอกด */

const pct = (n) => `${Math.round(n * 100)}%`;
const thDate = (ts) => new Date(ts).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
const starText = (n) => '⭐'.repeat(n) + '<span class="dim">' + '⭐'.repeat(3 - n) + '</span>';

function buildStats() {
  const allPlays = getPlays();
  const byLevel = {};
  for (const p of allPlays) (byLevel[p.id] ||= []).push(p);
  const F = allPlays.reduce((s, p) => s + p.f, 0);
  const T = allPlays.reduce((s, p) => s + p.t, 0);

  const levels = LEVELS.map((lv) => {
    const plays = byLevel[lv.id] || [];
    const f = plays.reduce((s, p) => s + p.f, 0);
    const t = plays.reduce((s, p) => s + p.t, 0);
    return {
      ...lv,
      stars: getStars(lv.id),
      count: plays.length,
      acc: t ? f / t : null,
      last: plays.length ? Math.max(...plays.map((p) => p.at)) : null,
    };
  });

  const played = levels.filter((l) => l.count > 0);

  return {
    levels,
    played,
    totalPlays: allPlays.length,
    overallAcc: T ? F / T : null,
    lastPlayed: played.length ? Math.max(...played.map((l) => l.last)) : null,
    strong: played.filter((l) => l.stars === 3 && l.acc >= 0.8).sort((a, b) => b.acc - a.acc),
    weak: played.filter((l) => l.acc < 0.6 || (l.stars === 1 && l.count >= 2)).sort((a, b) => a.acc - b.acc),
    untried: levels.filter((l) => l.count === 0),
  };
}

const chip = (l) => `<button class="lv-chip" data-id="${l.id}">${l.icon} ${l.title}${l.acc != null ? ` <b>${pct(l.acc)}</b>` : ''}</button>`;

function subjectRows(levels) {
  return SUBJECTS.filter((s) => s.id !== 'all').map((s) => {
    const mine = levels.filter((l) => l.subject === s.id);
    const done = mine.filter((l) => l.stars > 0).length;
    const withAcc = mine.filter((l) => l.acc != null);
    const acc = withAcc.length ? withAcc.reduce((a, l) => a + l.acc, 0) / withAcc.length : null;
    return `
      <div class="subj-row">
        <div class="subj-name">${s.icon} ${s.label}</div>
        <div class="bar"><i style="width:${(done / mine.length) * 100}%"></i></div>
        <div class="subj-meta">${done}/${mine.length} ด่าน${acc != null ? ` · ถูก ${pct(acc)}` : ''}</div>
      </div>`;
  }).join('');
}

function tableRows(levels) {
  return levels.map((l, i) => `
    <tr class="${l.count ? '' : 'untried'}">
      <td>${i + 1}</td>
      <td class="lv">${l.icon} ${l.title}</td>
      <td class="stars">${starText(l.stars)}</td>
      <td>${l.count || '–'}</td>
      <td>${l.acc != null ? pct(l.acc) : '–'}</td>
      <td>${l.last ? thDate(l.last) : '–'}</td>
    </tr>`).join('');
}

export function showSummary(root) {
  const st = buildStats();

  const el = document.createElement('div');
  el.className = 'screen summary';
  el.innerHTML = `
    <div class="map-head">
      <button class="icon-btn" id="home">🏠</button>
      <h2 class="outlined">สำหรับผู้ปกครอง</h2>
      <div class="spacer"></div>
      <div class="star-counter">⭐ ${totalStars()}</div>
    </div>

    <div class="summary-body">
      <div class="stat-row">
        <div class="stat"><b>${st.played.length}<small>/${LEVELS.length}</small></b><span>ด่านที่เล่นแล้ว</span></div>
        <div class="stat"><b>${st.totalPlays}</b><span>ครั้งที่เล่นทั้งหมด</span></div>
        <div class="stat"><b>${st.overallAcc != null ? pct(st.overallAcc) : '–'}</b><span>ตอบถูกตั้งแต่ครั้งแรก</span></div>
        <div class="stat"><b>${st.lastPlayed ? thDate(st.lastPlayed) : '–'}</b><span>เล่นล่าสุด</span></div>
      </div>

      ${st.totalPlays === 0 ? `
        <div class="card empty">
          ยังไม่มีข้อมูลเลย ให้ลิลลี่เล่นสักด่านก่อน แล้วกลับมาดูที่นี่ได้ 🐢
        </div>` : ''}

      <div class="card">
        <h3>ความคืบหน้าแต่ละหมวด</h3>
        ${subjectRows(st.levels)}
      </div>

      ${st.strong.length ? `
      <div class="card">
        <h3>💪 เก่งเรื่องนี้แล้ว</h3>
        <p class="hint">ได้ 3 ดาว และตอบถูกตั้งแต่ครั้งแรกเกิน 80%</p>
        <div class="chips">${st.strong.map(chip).join('')}</div>
      </div>` : ''}

      ${st.weak.length ? `
      <div class="card">
        <h3>🌱 ควรฝึกเพิ่ม</h3>
        <p class="hint">ตอบถูกครั้งแรกน้อยกว่า 60% หรือเล่นหลายรอบแล้วยังได้ 1 ดาว — ลองนั่งเล่นด้วยกันสักรอบ</p>
        <div class="chips">${st.weak.map(chip).join('')}</div>
      </div>` : ''}

      ${st.untried.length ? `
      <div class="card">
        <h3>🎈 ยังไม่ได้ลอง (${st.untried.length} ด่าน)</h3>
        <div class="chips">${st.untried.map(chip).join('')}</div>
      </div>` : ''}

      <div class="card">
        <h3>ทุกด่าน</h3>
        <div class="table-wrap">
          <table class="lv-table">
            <thead><tr><th>#</th><th>ด่าน</th><th>ดาว</th><th>เล่น</th><th>ถูกครั้งแรก</th><th>ล่าสุด</th></tr></thead>
            <tbody>${tableRows(st.levels)}</tbody>
          </table>
        </div>
      </div>

      <div class="card danger">
        <h3>ล้างข้อมูลทั้งหมด</h3>
        <p class="hint">ลบดาวและประวัติการเล่นทั้งหมดในเครื่องนี้ กู้คืนไม่ได้ — กดปุ่มค้างไว้ 2 วินาที</p>
        <button class="btn hold-btn" id="reset"><span class="fill"></span><span class="label">กดค้างเพื่อล้างข้อมูล</span></button>
      </div>

      <p class="foot">ข้อมูลเก็บอยู่ในเครื่องนี้เท่านั้น ถ้าเล่นบนเครื่องอื่นจะแยกกัน</p>
    </div>`;
  root.appendChild(el);

  el.querySelector('#home').onclick = () => { sfx.tap(); go('home'); };

  el.querySelectorAll('.lv-chip').forEach((c) => {
    c.onclick = () => { sfx.tap(); go('game', { levelId: c.dataset.id }); };
  });

  const reset = el.querySelector('#reset');
  let timer = null;
  const cancel = () => { clearTimeout(timer); timer = null; reset.classList.remove('holding'); };
  reset.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    reset.classList.add('holding');
    timer = setTimeout(() => {
      resetAll();
      sfx.bundle();
      go('summary');
    }, 2000);
  });
  reset.addEventListener('pointerup', cancel);
  reset.addEventListener('pointerleave', cancel);
  reset.addEventListener('pointercancel', cancel);
}
