import { animalHTML, escapeHTML, iconHTML, renderIcons } from '../assets.js';
import { speak, setReplay, langOf, sfx } from '../audio.js';
import { shuffle, blocksMarkup, buddyHTML, confetti, cheerBuddy, sayBubble, pick, wait } from '../utils.js';
import { play as memory } from './memory.js';
import { play as wordmatch } from './wordmatch.js';

/* บทเรียน: หน้าสอน (การ์ด) แล้วค่อยลองทำ (เลือกตอบ)
   เด็กยังอ่านไม่ออก ทุกอย่างจึงต้องอ่านให้ฟังเอง — เข้าหน้าไหนก็อ่านโจทย์ทันที
   แล้วอ่านตัวเลือกไล่ทีละอันพร้อมไฮไลต์ แตะการ์ด/ตัวเลือกไหนก็ได้ยินอันนั้นซ้ำ
   ปุ่ม 🔊 บนแถบเกมอ่านทั้งชุดใหม่ */

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

const cardSpeech = c => c.speech || (c.lang ? c.label : `${c.label} ${c.description}`);

export function play(stage, config, hooks = {}) {
  return new Promise(resolve => {
    let index = 0, firstTry = 0, attempted = false, answered = false, settled = false;
    let readToken = 0; // เพิ่มทุกครั้งที่เริ่มอ่านชุดใหม่ ชุดเก่าที่ยังอ่านค้างจะหยุดเอง
    const active = () => !settled && !hooks.signal?.aborted;
    const finish = result => { if (!settled) { settled = true; resolve(result); } };
    hooks.signal?.addEventListener('abort', () => { readToken++; finish(null); }, { once: true });
    const practicePairs = config.practicePairs || 3;
    const practiceRounds = config.practiceRounds || 1;
    const total = config.practice ? practicePairs * practiceRounds : config.questions.length;
    hooks.onProgress?.(0, total);
    stage.classList.add('learning-stage');

    /* อ่านหลายอย่างต่อกัน ไฮไลต์อันที่กำลังอ่าน [{ text, lang, el }] */
    async function readAll(parts) {
      const token = ++readToken;
      stage.querySelectorAll('.reading').forEach(el => el.classList.remove('reading'));
      for (const part of parts) {
        if (token !== readToken || !active()) return;
        part.el?.classList.add('reading');
        await speak(part.text, part.lang);
        part.el?.classList.remove('reading');
        if (token !== readToken) return;
        await wait(250);
      }
    }
    const stopReading = () => { readToken++; stage.querySelectorAll('.reading').forEach(el => el.classList.remove('reading')); };

    function teach() {
      stage.innerHTML = `<section class="learning-intro"><div class="lesson-step">เรียนรู้ด้วยกัน</div><h1>${escapeHTML(config.intro)}</h1>
        ${config.tree ? familyTree() : ''}
        <div class="teaching-cards">${config.cards.map((c, i) => `<button class="teaching-card" data-teach="${i}">${c.asset ? animalHTML(c.asset) : ''}<b>${escapeHTML(c.label)}</b><span>${escapeHTML(c.description)}</span>${iconHTML('volume-2')}</button>`).join('')}</div>
        <div class="learning-actions"><button class="btn secondary" id="read-intro">${iconHTML('volume-2')}ฟังอีกครั้ง</button><button class="btn green big" id="practice">ลองทำกันเลย ${iconHTML('arrow-right')}</button></div></section>`;
      const cards = [...stage.querySelectorAll('[data-teach]')];
      const autoCards = config.cards.slice(0, config.autoReadCards ?? 2);
      const readIntro = () => readAll([
        { text: config.intro, lang: 'th-TH' },
        ...autoCards.map((c, i) => ({ text: cardSpeech(c), lang: c.lang || 'th-TH', el: cards[i] })),
      ]);
      setReplay(readIntro);
      stage.querySelector('#read-intro').onclick = readIntro;
      cards.forEach((button, i) => {
        button.onclick = () => {
          sfx.tap();
          const c = config.cards[i];
          readAll([{ text: cardSpeech(c), lang: c.lang || 'th-TH', el: button }]);
        };
      });
      stage.querySelectorAll('[data-person]').forEach(button => {
        button.onclick = () => {
          const member = members[button.dataset.person];
          stage.querySelectorAll('[data-person]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
          const text = `${member[1]} เรียกว่า ${member[0]}`;
          stage.querySelector('.family-explanation').textContent = text;
          readAll([{ text, lang: 'th-TH', el: button }]);
        };
      });
      stage.querySelector('#practice').onclick = () => {
        sfx.tap();
        stopReading();
        if (config.practice) {
          stage.classList.remove('learning-stage');
          const engine = config.practice === 'memory' ? memory : wordmatch;
          engine(stage, { set: config.practiceSet || 'lillyFriends', pairs: practicePairs, rounds: practiceRounds }, hooks).then(result => { if (active()) finish(result); });
        } else question();
      };
      renderIcons();
      readIntro();
    }

    function question() {
      if (!active()) return;
      attempted = answered = false;
      const item = config.questions[index];
      const options = shuffle(item.options);
      stage.innerHTML = `<section class="learning-question"><div class="lesson-step">ข้อ ${index + 1} / ${total}</div>
        <h1>${escapeHTML(item.prompt)}</h1>${visualHTML(item.visual)}
        <div class="learning-options">${options.map((option, i) => `<button class="learning-answer" data-option="${i}">${escapeHTML(option)}</button>`).join('')}</div>
        <p class="learning-feedback" role="status">ฟังแล้วแตะคำตอบนะ</p></section>${buddyHTML()}`;
      const buttons = [...stage.querySelectorAll('[data-option]')];
      const readQuestion = () => readAll([
        { text: item.speech || item.prompt, lang: item.lang || 'th-TH' },
      ]);
      setReplay(readQuestion);
      buttons.forEach((button, i) => {
        button.onclick = async () => {
          if (!active() || answered) return;
          stopReading();
          const option = options[i];
          if (option !== item.answer) {
            attempted = true;
            button.classList.add('retry');
            button.disabled = true;
            stage.querySelector('.learning-feedback').textContent = 'ยังไม่ใช่ ลองใหม่อีกทีนะ';
            sfx.retry();
            sayBubble(stage, pick(['ยังไม่ใช่นะ ลองอีกที!', 'ค่อยๆ ฟังใหม่ 💪', 'เกือบแล้ว!']));
            await readAll([{ text: option, lang: langOf(option) }, { text: 'ยังไม่ใช่ ลองใหม่นะ', lang: 'th-TH' }]);
            return;
          }
          answered = true;
          if (!attempted) firstTry++;
          buttons.forEach(b => { b.disabled = true; });
          button.classList.add('correct');
          const explanation = item.explanation || item.answer;
          stage.querySelector('.learning-feedback').textContent = `ใช่เลย! ${explanation}`;
          hooks.onProgress?.(index + 1, total);
          sfx.correct();
          cheerBuddy(stage);
          confetti(stage, 20);
          sayBubble(stage, pick(['เก่งมาก!', 'ถูกต้อง!', 'สุดยอด 🌟']));
          // อ่านเฉลยให้จบก่อน ค่อยไปข้อต่อไป ไม่ต้องกดอะไรเพิ่ม
          await Promise.all([wait(1500), speak(explanation, item.answerLang || langOf(explanation))]);
          if (!active()) return;
          index++;
          if (index === total) finish({ firstTry, total }); else question();
        };
      });
      renderIcons();
      readQuestion();
    }
    teach();
  });
}
