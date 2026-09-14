import { randInt, wait, confetti, sayBubble, cheerBuddy, buddyHTML, pick, blocksMarkup } from '../utils.js';
import { sfx, speak } from '../audio.js';

/* ตั้งบวก/ตั้งลบแนวตั้ง เดินทีละขั้นตามวิธีที่สอนในโรงเรียน เด็กกดแป้นตัวเลขใส่เอง
   cfg: { op: '+' | '-', digitsB: 1|2, regroup, roundTens, count }
   regroup  = มีตัวทด (บวก) หรือ มีการยืม (ลบ)
   digitsB  = ตัวล่างเป็นเลขหลักเดียว (วางชิดขวาใต้หลักหน่วย) ใช้ได้ทั้งบวกและลบ
   roundTens = แบบง่ายสุด หลักหน่วยเป็น 0 ทั้งคู่ เช่น 10 + 70 หรือ 80 − 30 */

function genAdd(cfg) {
  for (;;) {
    if (cfg.roundTens) {
      const at = randInt(1, 8);
      const bt = randInt(1, 9 - at);
      return { op: '+', a: at * 10, b: bt * 10, result: (at + bt) * 10 };
    }

    const at = randInt(1, 8);
    const au = randInt(1, 9);
    let bu;
    if (cfg.regroup) {
      bu = randInt(10 - au, 9);
    } else {
      if (au >= 9) continue;
      bu = randInt(1, 9 - au);
    }
    const carry = au + bu >= 10 ? 1 : 0;

    let b;
    if (cfg.digitsB === 1) {
      b = bu;
    } else {
      const maxBt = 9 - at - carry;
      if (maxBt < 1) continue;
      b = randInt(1, maxBt) * 10 + bu;
    }
    const a = at * 10 + au;
    return { op: '+', a, b, result: a + b };
  }
}

function genSub(cfg) {
  for (;;) {
    if (cfg.roundTens) {
      const at = randInt(2, 9);
      const bt = randInt(1, at - 1);
      return { op: '−', a: at * 10, b: bt * 10, result: (at - bt) * 10 };
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
    const a = at * 10 + au;
    // ตัวลบหลักเดียว: หลักสิบไม่มีอะไรมาลบ (at >= 2 ทำให้ยืมแล้วหลักสิบยังไม่เป็น 0)
    if (cfg.digitsB === 1) {
      if (bu < 1) continue;
      return { op: '−', a, b: bu, result: a - bu };
    }
    if (maxBt < 1) continue;
    const b = randInt(1, maxBt) * 10 + bu;
    return { op: '−', a, b, result: a - b };
  }
}

function generateProblems(cfg) {
  const gen = cfg.op === '+' ? genAdd : genSub;
  const out = [];
  const seen = new Set();
  for (let guard = 0; out.length < cfg.count && guard < 400; guard++) {
    const p = gen(cfg);
    const key = `${p.a}${p.op}${p.b}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}

const KEYPAD_HTML =
  '<div class="entry" id="entry"></div><div class="keypad">' +
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) => `<button class="key" data-k="${n}">${n}</button>`).join('') +
  '<button class="key del" data-k="del">⌫</button></div>';

function buildSteps(p) {
  const at = Math.floor(p.a / 10), au = p.a % 10;
  const bt = Math.floor(p.b / 10), bu = p.b % 10;
  const steps = [];

  if (p.op === '+') {
    const sumU = au + bu;
    steps.push({ type: 'ask', col: 'units', answer: sumU, text: `หลักหน่วย: ${au} + ${bu} = ?` });

    if (sumU >= 10) {
      steps.push({
        type: 'write', col: 'units', slot: 'answer', value: sumU % 10, aid: 'bundle',
        text: `${sumU} คือ 1 สิบ กับ ${sumU % 10} หน่วย — แตะช่องหลักหน่วยเพื่อเขียน ${sumU % 10}`,
      });
      steps.push({
        type: 'write', col: 'tens', slot: 'carry', value: 1, aid: 'keep',
        text: 'แท่งสิบที่มัดได้ ทดขึ้นไปบนหลักสิบ — แตะช่องทด ✨',
      });
    } else {
      steps.push({
        type: 'write', col: 'units', slot: 'answer', value: sumU,
        text: `แตะช่องหลักหน่วยเพื่อเขียน ${sumU}`,
      });
    }

    const carried = sumU >= 10 ? 1 : 0;
    const sumT = at + bt + carried;

    // ตัวล่างเป็นหลักเดียวและไม่มีทด: หลักสิบไม่มีอะไรมาบวก ยกลงมาเขียนได้เลย
    if (bt === 0 && !carried) {
      steps.push({
        type: 'write', col: 'tens', slot: 'answer', value: at,
        text: `หลักสิบไม่มีตัวบวก ก็ยก ${at} ลงมาเลย — แตะช่องหลักสิบ`,
      });
      return steps;
    }

    let askText;
    if (bt === 0) askText = `หลักสิบ: 1 + ${at} = ?`;
    else if (carried) askText = `หลักสิบ: 1 + ${at} + ${bt} = ?`;
    else askText = `หลักสิบ: ${at} + ${bt} = ?`;

    steps.push({ type: 'ask', col: 'tens', answer: sumT, text: askText });
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
  // ตัวลบหลักเดียว: หลักสิบไม่มีตัวลบ ยกลงมาเขียนได้เลย (ถ้ายืมไปแล้วก็ยกตัวที่เหลือ)
  if (p.b < 10) {
    steps.push({
      type: 'write', col: 'tens', slot: 'answer', value: topT,
      text: `หลักสิบไม่มีตัวลบ ก็ยก ${topT} ลงมาเลย — แตะช่องหลักสิบ`,
    });
    return steps;
  }
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

  // ตัวล่างหลักเดียว: ช่องหลักสิบเว้นว่าง ให้เลขไปอยู่ชิดขวาใต้หลักหน่วย
  const bottomTens = p.b < 10
    ? '<span class="cell blank"></span>'
    : `<span class="cell digit${on('tens')}">${bt}</span>`;

  return `
    <span class="cell spacer"></span>${carry('tens')}${carry('units')}
    <span class="cell spacer"></span>${top('tens', at)}${top('units', au)}
    <span class="cell op">${p.op}</span>${bottomTens}<span class="cell digit${on('units')}">${bu}</span>
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
    let typed = '';

    stage.innerHTML = `
      <div class="prompt" id="prompt"></div>
      <div class="col-area">
        <div class="col-sum" id="grid"></div>
        <div class="carry-aid" id="aid" hidden></div>
      </div>
      <div class="pad-wrap" id="action"></div>
      ${buddyHTML()}`;

    const $prompt = stage.querySelector('#prompt');
    const $grid = stage.querySelector('#grid');
    const $aid = stage.querySelector('#aid');
    const $action = stage.querySelector('#action');

    const render = () => { $grid.innerHTML = gridHTML(problems[idx], s); };

    function nudge(cell) {
      sfx.retry();
      cell.classList.remove('nope');
      void cell.offsetWidth;
      cell.classList.add('nope');
    }

    async function showBundleAid() {
      const p = problems[idx];
      const au = p.a % 10, bu = p.b % 10;
      const sumU = au + bu;
      $aid.hidden = false;
      $aid.innerHTML = `
        <div class="carry-aid-title">${au} + ${bu} = ${sumU}</div>
        <div class="blocks">${blocksMarkup(0, sumU, 10)}</div>
        <div class="carry-aid-note">ครบ 10 หน่วยแล้ว มัดเป็น 1 สิบ!</div>`;

      await wait(900);
      sfx.bundle();
      $aid.querySelectorAll('.unit.ready').forEach((u) => {
        u.classList.remove('ready');
        u.classList.add('bundling');
      });
      await wait(480);
      $aid.querySelector('.blocks').innerHTML = blocksMarkup(1, sumU - 10);
      $aid.querySelector('.rod')?.classList.add('new-rod');
      $aid.querySelector('.carry-aid-note').textContent = `ได้ 1 สิบ เหลือ ${sumU - 10} หน่วย`;
      speak('ครบสิบแล้ว มัดเป็นหนึ่งสิบ');
      await wait(600);
    }

    $grid.onclick = (e) => {
      const cell = e.target.closest('.cell');
      const st = steps[si];
      if (!cell || !st || !s.pulse) return;

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

    function renderEntry(state = '') {
      const $entry = $action.querySelector('#entry');
      if ($entry) $entry.innerHTML = `<span class="entry-box ${state}">${typed || '?'}</span>`;
    }

    function onKey(k, st) {
      const max = String(st.answer).length;

      if (k === 'del') {
        typed = typed.slice(0, -1);
        sfx.tap();
        renderEntry();
        return;
      }
      if (typed.length >= max) return;

      typed += k;
      sfx.tap();
      renderEntry();
      if (typed.length < max) return;

      if (typed !== String(st.answer)) {
        missedThisOne = true;
        sfx.retry();
        renderEntry('nope');
        sayBubble(stage, pick(['ลองอีกทีนะ', 'เกือบแล้ว!', 'ค่อยๆ นับดูสิ 💪']));
        setTimeout(() => { typed = ''; renderEntry(); }, 700);
        return;
      }

      $action.querySelectorAll('.key').forEach((b) => { b.onclick = null; });
      renderEntry('correct');
      sfx.correct();
      si++;
      setTimeout(runStep, 700);
    }

    async function runStep() {
      const st = steps[si];
      if (!st) { finishProblem(); return; }

      s.pop = null;
      $prompt.textContent = st.text;
      if (st.aid !== 'keep') $aid.hidden = true;

      if (st.type === 'ask') {
        s.activeCol = st.col;
        s.pulse = null;
        render();
        typed = '';
        $action.innerHTML = KEYPAD_HTML;
        renderEntry();
        $action.querySelectorAll('.key').forEach((b) => { b.onclick = () => onKey(b.dataset.k, st); });
        speak(st.text.replace(/[?:]/g, ' '));
        return;
      }

      $action.innerHTML = '';
      s.activeCol = st.type === 'borrow' ? 'tens' : st.col;
      s.pulse = null;
      render();

      // ให้เด็กดูบล็อกมัดสิบให้จบก่อน ค่อยเปิดให้แตะช่อง
      if (st.aid === 'bundle') await showBundleAid();

      s.pulse = st.type === 'borrow' ? { col: 'tens', slot: 'top' } : { col: st.col, slot: st.slot };
      render();
    }

    /* สรุปวิธีทำเป็นบรรทัดสั้นๆ เอาจากขั้นตอน "ask" ที่เด็กเพิ่งตอบไป
       ให้เห็นภาพรวมทั้งข้ออีกครั้งก่อนไปข้อต่อไป */
    function recapLines(p) {
      const lines = steps
        .filter((st) => st.type === 'ask')
        .map((st) => st.text.replace('?', st.answer));
      const au = p.a % 10, bu = p.b % 10;
      if (p.op === '+' && au + bu >= 10) lines.splice(1, 0, `${au + bu} คือ 1 สิบ กับ ${(au + bu) % 10} หน่วย เขียน ${(au + bu) % 10} ทด 1`);
      if (p.op !== '+' && au < bu) lines.unshift(`${au} ลบ ${bu} ไม่ได้ ยืม 1 สิบ มาเป็น ${au + 10}`);
      if (p.op === '+' && p.b < 10 && au + bu < 10) lines.push(`หลักสิบไม่มีตัวบวก ยก ${Math.floor(p.a / 10)} ลงมา`);
      if (p.op !== '+' && p.b < 10) lines.push(`หลักสิบไม่มีตัวลบ ยก ${Math.floor(p.a / 10) - (au < bu ? 1 : 0)} ลงมา`);
      return lines;
    }

    async function finishProblem() {
      const p = problems[idx];
      if (!missedThisOne) firstTry++;
      s.activeCol = null;
      s.pulse = null;
      $aid.hidden = true;
      render();

      const last = idx + 1 >= problems.length;
      $prompt.textContent = 'ทำเสร็จแล้ว! 🎉';
      $action.innerHTML = `
        <div class="col-summary">
          <div class="col-summary-eq">
            <b>${p.a}</b><span>${p.op}</span><b>${p.b}</b><span>=</span><b class="ans">${p.result}</b>
          </div>
          <div class="col-summary-steps">${recapLines(p).map((t) => `<div>${t}</div>`).join('')}</div>
          <button class="btn green col-next" id="next" hidden>${last ? 'เสร็จแล้ว ⭐' : 'ข้อต่อไป ▶'}</button>
        </div>`;
      confetti(stage, 22);
      cheerBuddy(stage);
      sfx.win();
      sayBubble(stage, pick(['เยี่ยมมาก!', 'ตั้งเลขเก่งมาก!', 'ถูกต้อง 🌟']));

      // อ่านสรุปให้จบก่อน ค่อยโผล่ปุ่มไปข้อต่อไป (ผู้ใช้ทักว่าเมื่อก่อนเสียงโดนตัดกลางคัน)
      await Promise.all([
        wait(1200),
        speak(`${p.a} ${p.op === '+' ? 'บวก' : 'ลบ'} ${p.b} เท่ากับ ${p.result}`),
      ]);

      const $next = $action.querySelector('#next');
      if (!$next) return; // ผู้ใช้กดออกไปแล้ว
      $next.hidden = false;
      await new Promise((r) => { $next.onclick = () => { sfx.tap(); r(); }; });

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
