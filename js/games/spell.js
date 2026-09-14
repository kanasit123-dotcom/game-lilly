import { pick, shuffle, wait, confetti, sayBubble, cheerBuddy, buddyHTML } from '../utils.js';
import { sfx, speak } from '../audio.js';
import { toCells, tileText } from './thai.js';

/* สะกดคำ: ดูรูป ฟังเสียง แล้วแตะตัวอักษรเรียงทีละตัวลงช่อง
   แตะผิดตัวแค่สั่นเบาๆ ไม่ให้สะกดผิดค้างไว้ในช่อง
   cfg: { set: 'en1'|'th1' } */

const SETS = {
  en1: {
    lang: 'en-US',
    words: [
      { word: 'CAT', emoji: '🐱' }, { word: 'DOG', emoji: '🐶' }, { word: 'SUN', emoji: '☀️' },
      { word: 'PIG', emoji: '🐷' }, { word: 'BUS', emoji: '🚌' }, { word: 'HAT', emoji: '🎩' },
      { word: 'CUP', emoji: '🥤' }, { word: 'BED', emoji: '🛏️' }, { word: 'FISH', emoji: '🐟' },
      { word: 'STAR', emoji: '⭐' }, { word: 'SEAL', emoji: '🦭' }, { word: 'CRAB', emoji: '🦀' },
    ],
  },
  th1: {
    lang: 'th-TH',
    words: [
      { word: 'ปลา', emoji: '🐟' }, { word: 'แมว', emoji: '🐱' }, { word: 'นก', emoji: '🐦' },
      { word: 'กบ', emoji: '🐸' }, { word: 'ตา', emoji: '👁️' }, { word: 'มด', emoji: '🐜' },
      { word: 'โบ', emoji: '🎀' }, { word: 'งู', emoji: '🐍' }, { word: 'ปู', emoji: '🦀' },
      { word: 'ขา', emoji: '🦵' }, { word: 'ไก่', emoji: '🐔' }, { word: 'หมู', emoji: '🐷' },
      { word: 'หมี', emoji: '🐻' }, { word: 'ผึ้ง', emoji: '🐝' }, { word: 'เต่า', emoji: '🐢' },
    ],
  },
  en2: {
    lang: 'en-US',
    words: [
      { word: 'BEE', emoji: '🐝' }, { word: 'COW', emoji: '🐮' }, { word: 'EGG', emoji: '🥚' },
      { word: 'FOX', emoji: '🦊' }, { word: 'HEN', emoji: '🐔' }, { word: 'JAM', emoji: '🍯' },
      { word: 'KEY', emoji: '🔑' }, { word: 'MAP', emoji: '🗺️' }, { word: 'NET', emoji: '🥅' },
      { word: 'OWL', emoji: '🦉' }, { word: 'PEN', emoji: '🖊️' }, { word: 'WEB', emoji: '🕸️' },
      { word: 'BOX', emoji: '📦' }, { word: 'CAR', emoji: '🚗' }, { word: 'BUG', emoji: '🐛' },
    ],
  },
  th2: {
    lang: 'th-TH',
    words: [
      { word: 'เสือ', emoji: '🐯' }, { word: 'เรือ', emoji: '⛵' }, { word: 'กุ้ง', emoji: '🦐' },
      { word: 'มือ', emoji: '✋' }, { word: 'ไข่', emoji: '🥚' }, { word: 'ใบ', emoji: '🍃' },
      { word: 'ดาว', emoji: '⭐' }, { word: 'บ้าน', emoji: '🏠' }, { word: 'รถ', emoji: '🚗' },
      { word: 'ช้าง', emoji: '🐘' }, { word: 'ลิง', emoji: '🐵' }, { word: 'หมา', emoji: '🐶' },
      { word: 'ข้าว', emoji: '🍚' }, { word: 'ส้ม', emoji: '🍊' }, { word: 'ฟัน', emoji: '🦷' },
      { word: 'ถุง', emoji: '👝' }, { word: 'หอย', emoji: '🐚' }, { word: 'นม', emoji: '🥛' },
    ],
  },
};

const PER_LEVEL = 6;

/* ตัวลวงที่ไม่ซ้ำกับตัวในคำ */
function distractors(word, lang, n) {
  const pool = lang === 'en-US'
    ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
    : 'กขคงจชดตนบปผมยรลวสหอ'.split('');
  return shuffle(pool.filter((c) => !word.includes(c))).slice(0, n);
}

export function play(stage, config, hooks = {}) {
  return new Promise((resolve) => {
    const set = SETS[config.set] || SETS.en1;
    const words = shuffle(set.words).slice(0, PER_LEVEL);
    let idx = 0;
    let firstTry = 0;
    let missedThisOne = false;
    let placed = 0;
    let letters = [];

    stage.innerHTML = `
      <div class="prompt" id="prompt"></div>
      <div class="spell-area">
        <div class="letter-hint big" id="pic"></div>
        <div class="spell-slots" id="slots"></div>
        <div class="spell-tiles" id="tiles"></div>
      </div>
      ${buddyHTML()}`;

    const $prompt = stage.querySelector('#prompt');
    const $pic = stage.querySelector('#pic');
    const $slots = stage.querySelector('#slots');
    const $tiles = stage.querySelector('#tiles');

    function slotHTML(i, small) {
      const state = i < placed ? ' filled' : i === placed ? ' now' : '';
      const shown = i < placed ? tileText(letters[i]) : '';
      return `<span class="${small ? 'mark-slot' : 'spell-slot'}${state}">${shown}</span>`;
    }

    function renderSlots() {
      $slots.innerHTML = toCells(letters)
        .map((c) => `
          <div class="spell-cell">
            <div class="mark-row">${c.above.map((i) => slotHTML(i, true)).join('')}</div>
            ${slotHTML(c.base, false)}
            <div class="mark-row">${c.below.map((i) => slotHTML(i, true)).join('')}</div>
          </div>`)
        .join('');
    }

    function startWord() {
      const w = words[idx];
      missedThisOne = false;
      placed = 0;
      letters = [...w.word];
      hooks.onProgress?.(idx, words.length);

      $prompt.textContent = set.lang === 'en-US'
        ? 'ฟังแล้วสะกดคำ แตะตัวอักษรเรียงทีละตัว'
        : 'ผสมคำ แตะตัวอักษรเรียงทีละตัว';
      $pic.textContent = w.emoji;
      renderSlots();

      const tiles = shuffle([...letters, ...distractors(w.word, set.lang, 2)]);
      $tiles.innerHTML = tiles
        .map((ch, i) => `<button class="spell-tile" data-ch="${ch}" data-i="${i}">${tileText(ch)}</button>`)
        .join('');
      $tiles.querySelectorAll('.spell-tile').forEach((t) => { t.onclick = () => tap(t); });

      speak(w.word, set.lang);
    }

    async function tap(tile) {
      if (tile.classList.contains('used')) return;
      const ch = tile.dataset.ch;

      if (ch !== letters[placed]) {
        missedThisOne = true;
        sfx.retry();
        tile.classList.remove('nope');
        void tile.offsetWidth;
        tile.classList.add('nope');
        sayBubble(stage, pick(['ยังไม่ใช่ตัวนี้นะ', 'ลองตัวอื่นดูสิ 💪', 'เกือบแล้ว!']));
        return;
      }

      tile.classList.add('used');
      placed++;
      sfx.tap();
      renderSlots();
      if (placed < letters.length) return;

      if (!missedThisOne) firstTry++;
      $tiles.querySelectorAll('.spell-tile').forEach((t) => { t.onclick = null; });
      sfx.correct();
      cheerBuddy(stage);
      confetti(stage, 22);
      sayBubble(stage, `${pick(['สะกดถูกเลย!', 'เก่งมาก!', 'อ่านได้แล้ว 🌟'])} ${words[idx].word}`);

      await Promise.all([wait(1600), speak(words[idx].word, set.lang)]);
      idx++;
      if (idx >= words.length) {
        hooks.onProgress?.(words.length, words.length);
        resolve({ firstTry, total: words.length });
      } else {
        startWord();
      }
    }

    startWord();
  });
}
