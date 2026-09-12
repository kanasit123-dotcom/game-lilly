import { randInt, shuffle, wait, confetti, sayBubble, cheerBuddy, pick } from '../utils.js';
import { sfx, speak } from '../audio.js';

/* ตั้งบวก/ตั้งลบแนวตั้ง เดินทีละขั้นตามวิธีที่สอนในโรงเรียน
   cfg: { op: '+' | '-', regroup: true|false, count: n }
   regroup = มีตัวทด (บวก) หรือ มีการยืม (ลบ) */

function genProblem(cfg) {
  for (;;) {
    if (cfg.op === '+') {
      const at = randInt(1, 8);
      const au = randInt(1, 9);
      let bu;
      if (cfg.regroup) {
        bu = randInt(10 - au, 9);
      } else {
        if (au >= 9) continue;
        bu = randInt(1, 9 - au);
      }
      const maxBt = 9 - at - (au + bu >= 10 ? 1 : 0);
      if (maxBt < 1) continue;
      const a = at * 10 + au;
      const b = randInt(1, maxBt) * 10 + bu;
      return { op: '+', a, b, result: a + b };
    }

    const at = randInt(2, 9);
    const au = randInt(0, 9);
    let bu, maxBt;
    if (cfg.regroup) {
      if (au >= 9) continue;
      bu = randInt(au + 1, 9);
      maxBt = at - 2; // ยืมไปแล้วหลักสิบต้องยังเหลืออย่างน้อย 1
    } else {
      if (au < 1) continue;
      bu = randInt(0, au);
      maxBt = at - 1;
    }
    if (maxBt < 1) continue;
    const a = at * 10 + au;
    const b = randInt(1, maxBt) * 10 + bu;
    return { op: '−', a, b, result: a - b };
  }
}

function generateProblems(cfg) {
  const out = [];
  const seen = new Set();
  for (let guard = 0; out.length < cfg.count && guard < 400; guard++) {
    const p = genProblem(cfg);
    const key = `${p.a}${p.op}${p.b}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}

function choicesFor(answer) {
  const out = [answer];
  for (const d of shuffle([1, -1, 2, -2, 3])) {
    if (out.length >= 3) break;
    const v = answer + d;
    if (v >= 0 && v <= 18 && !out.includes(v)) out.push(v);
  }
  return shuffle(out);
}

function buildSteps(p) {
  const at = Math.floor(p.a / 10), au = p.a % 10;
  const bt = Math.floor(p.b / 10), bu = p.b % 10;
  const steps = [];

  if (p.op === '+') {
    const sumU = au + bu;
    steps.push({ type: 'ask', col: 'units', answer: sumU, text: `หลักหน่วย: ${au} + ${bu} = ?` });

    if (sumU >= 10) {
      steps.push({
        type: 'write', col: 'units', slot: 'answer', value: sumU % 10,
        text: `${sumU} คือ 1 สิบ กับ ${sumU % 10} หน่วย — แตะช่องหลักหน่วยเพื่อเขียน ${sumU % 10}`,
      });
      steps.push({
        type: 'write', col: 'tens', slot: 'carry', value: 1,
        text: 'ทด 1 สิบ ขึ้นไปข้างบนหลักสิบ — แตะช่องทด ✨',
      });
    } else {
      steps.push({
        type: 'write', col: 'units', slot: 'answer', value: sumU,
        text: `แตะช่องหลักหน่วยเพื่อเขียน ${sumU}`,
      });
    }

    const carried = sumU >= 10 ? 1 : 0;
    const sumT = at + bt + carried;
    steps.push({
      type: 'ask', col: 'tens', answer: sumT,
      text: carried ? `หลักสิบ: 1 + ${at} + ${bt} = ?` : `หลักสิบ: ${at} + ${bt} = ?`,
    });
    steps.push({ type: 'write', col: 'tens', slot: 'answer', value: sumT, text: `แตะช่องหลักสิบเพื่อเขียน ${sumT}` });
    return steps;
  }

  const needBorrow = au < bu;
  if (needBorrow) {
    steps.push({
      type: 'borrow',
      text: `${au} ลบ ${bu} ไม่ได้ ต้องยืม 1 สิบ — แตะเลข ${at} ที่หลักสิบ`,
    });
  }
  const topU = needBorrow ? au + 10 : au;
  const topT = needBorrow ? at - 1 : at;

  steps.push({ type: 'ask', col: 'units', answer: topU - bu, text: `หลักหน่วย: ${topU} − ${bu} = ?` });
  steps.push({
    type: 'write', col: 'units', slot: 'answer', value: topU - bu,
    text: `แตะช่องหลักหน่วยเพื่อเขียน ${topU - bu}`,
  });
  steps.push({ type: 'ask', col: 'tens', answer: topT - bt, text: `หลักสิบ: ${topT} − ${bt} = ?` });
  steps.push({
    type: 'write', col: 'tens', slot: 'answer', value: topT - bt,
    text: `แตะช่องหลักสิบเพื่อเขียน ${topT - bt}`,
  });
  return steps;
}

function gridHTML(p, s) {
  const at = Math.floor(p.a / 10), au = p.a % 10;
  const bt = Math.floor(p.b / 10), bu = p.b % 10;
  const on = (col) => (s.activeCol === col ? ' active' : '');
  const pulsing = (col, slot) => (s.pulse && s.pulse.col === col && s.pulse.slot === slot ? ' pulse' : '');
  const popping = (col, slot) => (s.pop && s.pop.col === col && s.pop.slot === slot ? ' pop' : '');

  const carry = (col) =>
    `<span class="cell carry${pulsing(col, 'carry')}${popping(col, 'carry')}"
           data-slot="carry" data-col="${col}">${s.carries[col] ?? ''}</span>`;

  const top = (col, v) =>
    `<span class="cell digit${on(col)}${s.struck[col] ? ' struck' : ''}${pulsing(col, 'top')}"
           data-slot="top" data-col="${col}">${v}</span>`;

  const slot = (col) =>
    `<span class="cell slot${on(col)}${pulsing(col, 'answer')}${popping(col, 'answer')}${s.answer[col] != null ? ' filled' : ''}"
           data-slot="answer" data-col="${col}">${s.answer[col] ?? ''}</span>`;

  return `
    <span class="cell spacer"></span>${carry('tens')}${carry('units')}
    <span class="cell spacer"></span>${top('tens', at)}${top('units', au)}
    <span class="cell op">${p.op}</span>
    <span class="cell digit${on('tens')}">${bt}</span><span class="cell digit${on('units')}">${bu}</span>
    <div class="col-rule"></div>
    <span class="cell spacer"></span>${slot('tens')}${slot('units')}`;
}

export function play(stage, config, hooks = {}) {
  return new Promise((resolve) => {
    const problems = generateProblems(config);
    let idx = 0;
    let firstTry = 0;
    let missedThisOne = false;
    let steps = [];
    let si = 0;
    let s = null;

    stage.innerHTML = `
      <div class="prompt" id="prompt"></div>
      <div class="col-sum" id="grid"></div>
      <div class="choices" id="action"></div>
      <div class="buddy">🐰</div>`;

    const $prompt = stage.querySelector('#prompt');
    const $grid = stage.querySelector('#grid');
    const $action = stage.querySelector('#action');

    const render = () => { $grid.innerHTML = gridHTML(problems[idx], s); };

    function nudge(cell) {
      sfx.retry();
      cell.classList.remove('nope');
      void cell.offsetWidth;
      cell.classList.add('nope');
    }

    $grid.onclick = (e) => {
      const cell = e.target.closest('.cell');
      const st = steps[si];
      if (!cell || !st) return;

      if (st.type === 'write') {
        if (cell.dataset.slot !== st.slot || cell.dataset.col !== st.col) { nudge(cell); return; }
        if (st.slot === 'answer') s.answer[st.col] = st.value;
        else s.carries[st.col] = st.value;
        s.pop = { col: st.col, slot: st.slot };
        s.pulse = null;
        st.slot === 'carry' ? sfx.bundle() : sfx.tap();
        si++;
        render();
        setTimeout(runStep, 450);
        return;
      }

      if (st.type === 'borrow') {
        if (cell.dataset.slot !== 'top' || cell.dataset.col !== 'tens') { nudge(cell); return; }
        const p = problems[idx];
        s.carries.tens = Math.floor(p.a / 10) - 1;
        s.carries.units = (p.a % 10) + 10;
        s.struck.tens = true;
        s.struck.units = true;
        s.pulse = null;
        s.pop = { col: 'units', slot: 'carry' };
        sfx.bundle();
        speak('ยืมหนึ่งสิบ');
        sayBubble(stage, 'ยืม 1 สิบ มาเป็น 10 หน่วย!');
        si++;
        render();
        setTimeout(runStep, 900);
      }
    };

    function onChoice(btn, st) {
      if (Number(btn.dataset.v) !== st.answer) {
        missedThisOne = true;
        sfx.retry();
        btn.classList.remove('nope');
        void btn.offsetWidth;
        btn.classList.add('nope');
        sayBubble(stage, pick(['ลองอีกทีนะ', 'เกือบแล้ว!', 'ค่อยๆ นับดูสิ 💪']));
        return;
      }
      $action.querySelectorAll('.choice').forEach((b) => { b.onclick = null; });
      btn.classList.add('correct');
      sfx.correct();
      si++;
      setTimeout(runStep, 600);
    }

    function runStep() {
      const st = steps[si];
      if (!st) { finishProblem(); return; }

      s.pop = null;
      $prompt.textContent = st.text;

      if (st.type === 'ask') {
        s.activeCol = st.col;
        s.pulse = null;
        render();
        $action.innerHTML = choicesFor(st.answer)
          .map((v) => `<button class="choice" data-v="${v}">${v}</button>`)
          .join('');
        $action.querySelectorAll('.choice').forEach((b) => { b.onclick = () => onChoice(b, st); });
        speak(st.text.replace(/[?:]/g, ' '));
        return;
      }

      $action.innerHTML = '';
      s.activeCol = st.type === 'borrow' ? 'tens' : st.col;
      s.pulse = st.type === 'borrow' ? { col: 'tens', slot: 'top' } : { col: st.col, slot: st.slot };
      render();
    }

    async function finishProblem() {
      const p = problems[idx];
      if (!missedThisOne) firstTry++;
      s.activeCol = null;
      s.pulse = null;
      render();
      $prompt.textContent = `${p.a} ${p.op} ${p.b} = ${p.result} 🎉`;
      confetti(stage, 22);
      cheerBuddy(stage);
      sfx.win();
      sayBubble(stage, pick(['เยี่ยมมาก!', 'ตั้งเลขเก่งมาก!', 'ถูกต้อง 🌟']));
      speak(`${p.a} ${p.op === '+' ? 'บวก' : 'ลบ'} ${p.b} เท่ากับ ${p.result}`);

      await wait(2000);
      idx++;
      if (idx >= problems.length) {
        hooks.onProgress?.(problems.length, problems.length);
        resolve({ firstTry, total: problems.length });
      } else {
        startProblem();
      }
    }

    function startProblem() {
      missedThisOne = false;
      si = 0;
      steps = buildSteps(problems[idx]);
      s = {
        carries: { tens: null, units: null },
        struck: { tens: false, units: false },
        answer: { tens: null, units: null },
        activeCol: null,
        pulse: null,
        pop: null,
      };
      hooks.onProgress?.(idx, problems.length);
      runStep();
    }

    startProblem();
  });
}
