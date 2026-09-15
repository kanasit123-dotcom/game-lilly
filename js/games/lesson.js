import { animalHTML, escapeHTML, iconHTML, renderIcons } from '../assets.js';
import { speak, sfx } from '../audio.js';
import { shuffle, blocksMarkup, buddyHTML } from '../utils.js';
import { play as memory } from './memory.js';
import { play as wordmatch } from './wordmatch.js';

const members = {
  grandpa: ['ปู่', 'พ่อของพ่อ'], grandma: ['ย่า', 'แม่ของพ่อ'],
  maternalGrandpa: ['ตา', 'พ่อของแม่'], maternalGrandma: ['ยาย', 'แม่ของแม่'],
  father: ['พ่อ', 'คุณพ่อของเรา'], mother: ['แม่', 'คุณแม่ของเรา'], child: ['เรา', 'ตัวเรา']
};
const person = key => `<button class="family-person" data-person="${key}" aria-label="${members[key][1]} เรียกว่า ${members[key][0]}">${members[key][0]}</button>`;
function familyTree() {
  return `<div class="family-tree" aria-label="ผังครอบครัวตัวอย่าง">
    <div class="family-branch"><div class="family-grandparents">${person('grandpa')}${person('grandma')}</div>${person('father')}</div>
    <div class="family-branch maternal"><div class="family-grandparents">${person('maternalGrandpa')}${person('maternalGrandma')}</div>${person('mother')}</div>
    <div class="family-child">${person('child')}</div></div><p class="family-explanation" role="status">ปู่ ย่า อยู่ฝั่งพ่อ · ตา ยาย อยู่ฝั่งแม่</p>`;
}
const carrot = crossed => `<span class="lesson-carrot${crossed ? ' removed' : ''}" aria-hidden="true"></span>`;
export function visualHTML(visual) {
  if (!visual) return '';
  if (visual.kind === 'animal') return `<div class="lesson-picture">${animalHTML(visual.id)}</div>`;
  if (visual.kind === 'blocks') return `<div class="lesson-blocks" role="img" aria-label="${visual.tens} สิบ ${visual.units} หน่วย">${blocksMarkup(visual.tens, visual.units)}</div>`;
  if (visual.kind === 'pattern') {
    const names = { circle: 'วงกลม', square: 'สี่เหลี่ยม', triangle: 'สามเหลี่ยม' };
    return `<div class="lesson-pattern" role="img" aria-label="${visual.shapes.map(s => names[s]).join(' ')} แล้วอะไรต่อ">${visual.shapes.map(s => `<span class="shape-token ${s}"></span>`).join('')}<b>?</b></div>`;
  }
  if (visual.kind === 'quantity') {
    const { a, b, op } = visual;
    const first = Array.from({ length: a }, (_, i) => carrot(op === '-' && i >= a - b)).join('');
    const second = b !== undefined && op !== '-' ? `<span class="quantity-symbol">${op === '|' ? 'กับ' : '+'}</span><span class="quantity-group">${Array.from({ length: b }, () => carrot(false)).join('')}</span>` : '';
    const label = op === '-' ? `มี ${a} หัว เอาออก ${b} หัว` : b === undefined ? `แครอต ${a} หัว` : `กลุ่มแรก ${a} หัว กลุ่มที่สอง ${b} หัว`;
    return `<div class="lesson-quantity" role="img" aria-label="${label}"><span class="quantity-group">${first}</span>${second}</div>`;
  }
  return '';
}

export function play(stage, config, hooks = {}) {
  return new Promise(resolve => {
    let index = 0, firstTry = 0, attempted = false, answered = false, settled = false;
    const active = () => !settled && !hooks.signal?.aborted;
    const finish = result => { if (!settled) { settled = true; resolve(result); } };
    hooks.signal?.addEventListener('abort', () => finish(null), { once: true });
    const total = config.practice ? 3 : config.questions.length;
    hooks.onProgress?.(0, total);
    stage.classList.add('learning-stage');

    function teach() {
      stage.innerHTML = `<section class="learning-intro"><div class="lesson-step">เรียนรู้ด้วยกัน</div><h1>${escapeHTML(config.intro)}</h1>
        ${config.tree ? familyTree() : ''}
        <div class="teaching-cards">${config.cards.map((c, i) => `<button class="teaching-card" data-teach="${i}">${c.asset ? animalHTML(c.asset) : ''}<b>${escapeHTML(c.label)}</b><span>${escapeHTML(c.description)}</span>${iconHTML('volume-2')}</button>`).join('')}</div>
        <div class="learning-actions"><button class="btn secondary" id="read-intro">${iconHTML('volume-2')}ฟังอีกครั้ง</button><button class="btn green" id="practice">ลองทำกันเลย ${iconHTML('arrow-right')}</button></div></section>`;
      stage.querySelector('#read-intro').onclick = () => speak(config.intro);
      stage.querySelectorAll('[data-teach]').forEach(button => {
        button.onclick = () => {
          const c = config.cards[Number(button.dataset.teach)];
          speak(c.speech || (c.lang ? c.label : `${c.label} ${c.description}`), c.lang || 'th-TH');
        };
      });
      stage.querySelectorAll('[data-person]').forEach(button => {
        button.onclick = () => {
          const member = members[button.dataset.person];
          stage.querySelectorAll('[data-person]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
          const text = `${member[1]} เรียกว่า ${member[0]}`;
          stage.querySelector('.family-explanation').textContent = text;
          speak(text);
        };
      });
      stage.querySelector('#practice').onclick = () => {
        window.speechSynthesis?.cancel();
        if (config.practice) {
          stage.classList.remove('learning-stage');
          const engine = config.practice === 'memory' ? memory : wordmatch;
          engine(stage, { set: 'lillyFriends', pairs: 3, rounds: 1 }, hooks).then(result => { if (active()) finish(result); });
        } else question();
      };
      renderIcons();
    }

    function question() {
      if (!active()) return;
      attempted = answered = false;
      const item = config.questions[index];
      const options = shuffle(item.options);
      stage.innerHTML = `<section class="learning-question"><div class="lesson-question-head"><span class="lesson-step">ลองทำ · ข้อ ${index + 1} / ${total}</span><button class="icon-btn" id="read-question" title="ฟังโจทย์" aria-label="ฟังโจทย์">${iconHTML('volume-2')}</button></div>
        <h1>${escapeHTML(item.prompt)}</h1>${visualHTML(item.visual)}
        <div class="learning-options">${options.map((option, i) => `<button class="learning-answer" data-option="${i}">${escapeHTML(option)}</button>`).join('')}</div>
        <p class="learning-feedback" role="status">ค่อย ๆ คิดได้นะ</p><div class="learning-actions"><button class="btn green" id="next-question" disabled>${index + 1 === total ? 'ทำครบแล้ว' : 'ข้อต่อไป'} ${iconHTML('arrow-right')}</button></div></section>${buddyHTML()}`;
      stage.querySelector('#read-question').onclick = () => speak(item.speech || item.prompt, item.lang || 'th-TH');
      stage.querySelectorAll('[data-option]').forEach(button => {
        button.onclick = () => {
          if (!active() || answered) return;
          if (options[Number(button.dataset.option)] !== item.answer) {
            attempted = true;
            button.classList.add('retry');
            button.disabled = true;
            stage.querySelector('.learning-feedback').textContent = 'ลองอีกครั้งนะ เราค่อย ๆ คิดด้วยกัน';
            sfx.retry();
            return;
          }
          answered = true;
          if (!attempted) firstTry++;
          stage.querySelectorAll('[data-option]').forEach(b => { b.disabled = true; });
          button.classList.add('correct');
          stage.querySelector('.learning-feedback').textContent = `ใช่เลย! ${item.explanation || item.answer}`;
          stage.querySelector('#next-question').disabled = false;
          hooks.onProgress?.(index + 1, total);
          sfx.correct();
          speak(item.explanation || item.answer, item.answerLang || 'th-TH');
        };
      });
      stage.querySelector('#next-question').onclick = () => {
        if (!answered || !active()) return;
        index++;
        if (index === total) finish({ firstTry, total }); else question();
      };
      renderIcons();
    }
    teach();
  });
}
