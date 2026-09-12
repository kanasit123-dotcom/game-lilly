import { randInt, pick, shuffle, wait, confetti, sayBubble, cheerBuddy, buddyHTML } from '../utils.js';
import { sfx, speak } from '../audio.js';

/* สร้างโจทย์บวกที่คุมได้ว่าจะมีตัวทดหรือไม่ และผลลัพธ์ไม่เกิน 99 */
function genOne(cfg) {
  for (;;) {
    const at = randInt(1, 8);
    const au = randInt(1, 9);
    let b;

    if (cfg.digitsB === 1) {
      if (cfg.carry) {
        b = randInt(10 - au, 9);
      } else {
        if (au >= 9) continue;
        b = randInt(1, 9 - au);
      }
    } else {
      let bu;
      if (cfg.carry) {
        bu = randInt(10 - au, 9);
      } else {
        if (au >= 9) continue;
        bu = randInt(1, 9 - au);
      }
      const maxBt = 9 - at - (au + bu >= 10 ? 1 : 0);
      if (maxBt < 1) continue;
      b = randInt(1, maxBt) * 10 + bu;
    }

    const a = at * 10 + au;
    if (a + b > 99) continue;
    return { a, b, sum: a + b };
  }
}

function generateProblems(cfg) {
  const out = [];
  const seen = new Set();
  for (let guard = 0; out.length < cfg.count && guard < 400; guard++) {
    const p = genOne(cfg);
    const key = `${p.a}+${p.b}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}

/* ตัวลวงตัวแรกคือคำตอบแบบ "ลืมทด" ซึ่งเป็นความเข้าใจผิดที่เจอบ่อยที่สุด */
function makeChoices({ a, b, sum }) {
  const hasCarry = (a % 10) + (b % 10) >= 10;
  const candidates = hasCarry
    ? [sum - 10, sum + 1, sum - 1, sum + 10]
    : [sum + 10, sum - 1, sum + 1, sum - 10];

  const out = [sum];
  for (const c of candidates) {
    if (out.length >= 3) break;
    if (c >= 10 && c <= 99 && !out.includes(c)) out.push(c);
  }
  return shuffle(out);
}

function blocksMarkup(tens, units, readyCount = 0) {
  const rods = '<div class="rod"></div>'.repeat(tens);
  let cells = '';
  for (let i = 0; i < units; i++) cells += `<div class="unit${i < readyCount ? ' ready' : ''}"></div>`;
  // เต็มแถวที่ 10 พอดี เด็กจะเห็นว่า "ครบสิบ" ตั้งแต่ยังไม่ต้องนับ
  const cols = Math.min(10, Math.max(units, 1));
  return `<div class="rods">${rods}</div>
          <div class="units${units ? '' : ' empty'}" style="grid-template-columns:repeat(${cols},auto)">${cells}</div>`;
}

export function play(stage, config, hooks = {}) {
  return new Promise((resolve) => {
    const problems = generateProblems(config);
    let idx = 0;
    let firstTry = 0;
    let missedThisOne = false;
    let bundling = false;

    stage.innerHTML = `
      <div class="prompt" id="prompt"></div>
      <div class="equation" id="eq"></div>
      <div class="workspace" id="ws"></div>
      <div class="choices" id="action"></div>
      ${buddyHTML()}`;

    const $prompt = stage.querySelector('#prompt');
    const $eq = stage.querySelector('#eq');
    const $ws = stage.querySelector('#ws');
    const $action = stage.querySelector('#action');

    function startProblem() {
      const p = problems[idx];
      missedThisOne = false;
      bundling = false;
      hooks.onProgress?.(idx, problems.length);

      $eq.innerHTML =
        `<span class="num">${p.a}</span><span class="op">+</span>` +
        `<span class="num">${p.b}</span><span class="op">=</span><span class="qmark">?</span>`;
      $prompt.textContent = 'ดูบล็อกนี้สิ แล้วแตะปุ่มเพื่อเอามารวมกัน';
      $ws.innerHTML = `
        <div class="group" id="gA">${blocksMarkup(Math.floor(p.a / 10), p.a % 10)}</div>
        <div class="plus">+</div>
        <div class="group" id="gB">${blocksMarkup(Math.floor(p.b / 10), p.b % 10)}</div>`;
      $action.innerHTML = `<button class="btn big yellow" id="combine">รวมกัน! 🤝</button>`;
      $action.querySelector('#combine').onclick = combine;
      speak(`${p.a} บวก ${p.b} เท่ากับเท่าไหร่`);
    }

    async function combine() {
      sfx.tap();
      const p = problems[idx];
      $ws.querySelector('#gA').classList.add('merge-left');
      $ws.querySelector('#gB').classList.add('merge-right');
      $action.innerHTML = '';
      await wait(420);

      const tens = Math.floor(p.a / 10) + Math.floor(p.b / 10);
      const units = (p.a % 10) + (p.b % 10);
      const needBundle = units >= 10;

      $ws.innerHTML = `<div class="group pop-in">${blocksMarkup(tens, units, needBundle ? 10 : 0)}</div>`;

      if (!needBundle) { askAnswer(); return; }

      $prompt.textContent = 'หน่วยครบ 10 แล้ว! แตะแถวสีเหลืองเพื่อมัดเป็นแท่งสิบ ✨';
      speak('หน่วยครบสิบแล้ว แตะเพื่อมัดเป็นแท่งสิบ');
      // รับการแตะทั้งกล่อง เพราะลูกบอลแต่ละลูกเล็กเกินไปสำหรับนิ้วเด็ก
      const box = $ws.querySelector('.units');
      box.classList.add('bundle-ready');
      box.onclick = doBundle;
    }

    async function doBundle() {
      if (bundling) return;
      bundling = true;
      const p = problems[idx];

      sfx.bundle();
      const box = $ws.querySelector('.units');
      box.onclick = null;
      box.classList.remove('bundle-ready');
      $ws.querySelectorAll('.unit.ready').forEach((u) => {
        u.classList.remove('ready');
        u.classList.add('bundling');
      });

      const badge = document.createElement('div');
      badge.className = 'carry-badge';
      badge.textContent = 'ทด 1 สิบ! ✨';
      stage.appendChild(badge);
      setTimeout(() => badge.remove(), 1700);
      speak('ทดหนึ่งสิบ');

      await wait(480);

      const tens = Math.floor(p.a / 10) + Math.floor(p.b / 10) + 1;
      const units = (p.a % 10) + (p.b % 10) - 10;
      const group = $ws.querySelector('.group');
      group.innerHTML = blocksMarkup(tens, units);
      group.querySelector('.rod:last-child')?.classList.add('new-rod');

      await wait(700);
      askAnswer();
    }

    function askAnswer() {
      const p = problems[idx];
      $prompt.textContent = 'นับดูสิ ได้เท่าไหร่? 🔢';
      $action.innerHTML = makeChoices(p)
        .map((c) => `<button class="choice" data-v="${c}">${c}</button>`)
        .join('');
      $action.querySelectorAll('.choice').forEach((btn) => {
        btn.onclick = () => answer(btn, p);
      });
    }

    async function answer(btn, p) {
      if (Number(btn.dataset.v) !== p.sum) {
        missedThisOne = true;
        sfx.retry();
        btn.classList.remove('nope');
        void btn.offsetWidth;
        btn.classList.add('nope');
        sayBubble(stage, pick(['ไม่เป็นไรนะ ลองอีกที!', 'เกือบแล้ว ลองนับใหม่', 'ลองดูอีกทีสิ 💪']));
        return;
      }

      if (!missedThisOne) firstTry++;
      $action.querySelectorAll('.choice').forEach((b) => { b.onclick = null; });
      btn.classList.add('correct');
      sfx.correct();
      cheerBuddy(stage);
      confetti(stage, 22);
      $prompt.textContent = `${p.a} + ${p.b} = ${p.sum} 🎉`;
      $eq.querySelector('.qmark').textContent = p.sum;
      sayBubble(stage, pick(['เก่งมาก!', 'ถูกต้องเลย!', 'สุดยอด! 🌟']));
      speak(`${p.a} บวก ${p.b} เท่ากับ ${p.sum}`);

      await wait(1700);
      idx++;
      if (idx >= problems.length) {
        hooks.onProgress?.(problems.length, problems.length);
        resolve({ firstTry, total: problems.length });
      } else {
        startProblem();
      }
    }

    startProblem();
  });
}
