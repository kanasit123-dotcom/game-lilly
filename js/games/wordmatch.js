import { pick, shuffle, wait, confetti, sayBubble, cheerBuddy, buddyHTML } from '../utils.js';
import { sfx, speak } from '../audio.js';
import { WORD_SETS } from './words.js';

const PER_ROUND = 3;

export function play(stage, config, hooks = {}) {
  return new Promise((resolve) => {
    const deck = shuffle(WORD_SETS[config.set] || WORD_SETS.animals);
    const rounds = Math.min(config.rounds, Math.floor(deck.length / PER_ROUND));
    const totalPairs = rounds * PER_ROUND;

    let roundIdx = 0;
    let matchedTotal = 0;
    let matchedInRound = 0;
    let firstTry = 0;
    let locked = false;
    let selected = null;
    let drag = null;
    const wrongWords = new Set();

    const isThai = config.set.startsWith('thai');
    const isVowel = config.set === 'thaiVowels';
    const isLetters = config.set.startsWith('letters');
    const hint = isVowel
      ? 'ลากสระไปวางบนคำที่ใช้สระนั้น'
      : isLetters
        ? 'ลากตัวพิมพ์เล็กไปวางบนตัวพิมพ์ใหญ่ที่คู่กัน'
        : isThai
          ? 'ลากตัวอักษรไปวางบนรูป เช่น ก ไปที่ ไก่'
          : 'ลากคำไปวางบนรูป หรือแตะคำแล้วแตะรูป';
    const lang = isThai ? 'th-TH' : 'en-US';

    stage.innerHTML = `
      <div class="prompt" id="prompt">${hint}</div>
      <div class="match-area${isLetters || isThai ? ' letter-mode' : ''}${isVowel ? ' vowel-mode' : ''}">
        <div class="pic-row" id="pics"></div>
        <div class="word-row" id="words"></div>
      </div>
      ${buddyHTML()}`;

    const $prompt = stage.querySelector('#prompt');
    const $pics = stage.querySelector('#pics');
    const $words = stage.querySelector('#words');

    function renderRound() {
      matchedInRound = 0;
      selected = null;
      locked = false;
      const pairs = deck.slice(roundIdx * PER_ROUND, roundIdx * PER_ROUND + PER_ROUND);

      $prompt.textContent = hint;
      $pics.innerHTML = shuffle(pairs)
        .map((p) => `<div class="pic-card" data-word="${p.word}">${p.emoji}</div>`)
        .join('');
      $words.innerHTML = shuffle(pairs)
        .map((p) => `<button class="word-card" data-word="${p.word}" data-say="${p.say || p.word}" data-done="${p.done || p.say || p.word}">${p.word}</button>`)
        .join('');

      $pics.querySelectorAll('.pic-card').forEach((pic) => {
        pic.onclick = () => { if (selected) tryMatch(selected, pic); };
      });
      $words.querySelectorAll('.word-card').forEach((card) => {
        card.addEventListener('pointerdown', (e) => onPointerDown(e, card));
      });
    }

    /* ---- ลากวาง (ใช้ transform ไม่ให้การ์ดใบอื่นขยับตาม) ---- */

    function onPointerDown(e, card) {
      if (locked || card.classList.contains('used') || drag) return;
      e.preventDefault();
      drag = { card, x0: e.clientX, y0: e.clientY, moved: 0 };
      card.classList.add('dragging');
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
      document.addEventListener('pointercancel', onPointerUp);
    }

    function onPointerMove(e) {
      if (!drag) return;
      const dx = e.clientX - drag.x0;
      const dy = e.clientY - drag.y0;
      drag.moved = Math.max(drag.moved, Math.hypot(dx, dy));
      drag.card.style.transform = `translate(${dx}px, ${dy}px) scale(1.1) rotate(-3deg)`;

      const hit = targetAt(e.clientX, e.clientY);
      $pics.querySelectorAll('.pic-card').forEach((p) => p.classList.toggle('hover-target', p === hit));
    }

    function onPointerUp(e) {
      if (!drag) return;
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('pointercancel', onPointerUp);

      const { card, moved } = drag;
      const hit = targetAt(e.clientX, e.clientY);
      drag = null;

      card.classList.remove('dragging');
      card.style.transform = '';
      $pics.querySelectorAll('.pic-card').forEach((p) => p.classList.remove('hover-target'));

      if (moved < 10) { selectCard(card); return; }
      if (hit) tryMatch(card, hit);
    }

    function targetAt(x, y) {
      const el = document.elementFromPoint(x, y)?.closest('.pic-card');
      return el && !el.classList.contains('solved') ? el : null;
    }

    function selectCard(card) {
      sfx.tap();
      speak(card.dataset.say, lang);
      if (selected === card) {
        card.classList.remove('selected');
        selected = null;
        return;
      }
      selected?.classList.remove('selected');
      selected = card;
      card.classList.add('selected');
    }

    async function tryMatch(card, pic) {
      if (locked || pic.classList.contains('solved') || card.classList.contains('used')) return;
      const word = card.dataset.word;

      if (word !== pic.dataset.word) {
        wrongWords.add(word);
        sfx.retry();
        card.classList.remove('nope');
        void card.offsetWidth;
        card.classList.add('nope');
        sayBubble(stage, pick(['ยังไม่ใช่นะ ลองอีกที!', 'ลองใบอื่นดูสิ 💪', 'เกือบแล้ว!']));
        return;
      }

      selected?.classList.remove('selected');
      selected = null;
      card.classList.add('used');
      pic.classList.add('solved');
      pic.insertAdjacentHTML('beforeend', `<div class="answer-tag">${word}</div>`);

      if (!wrongWords.has(word)) firstTry++;
      matchedTotal++;
      matchedInRound++;
      hooks.onProgress?.(matchedTotal, totalPairs);

      sfx.correct();
      cheerBuddy(stage);
      speak(card.dataset.done, lang);
      sayBubble(stage, pick(['เก่งมาก!', 'ถูกต้อง!', 'ใช่เลย 🌟']));

      if (matchedInRound < PER_ROUND) return;

      locked = true;
      confetti(stage, 24);
      $prompt.textContent = 'ครบทุกคู่แล้ว เยี่ยมมาก! 🎉';
      await wait(1600);

      roundIdx++;
      if (roundIdx >= rounds) resolve({ firstTry, total: totalPairs });
      else renderRound();
    }

    hooks.onProgress?.(0, totalPairs);
    renderRound();
  });
}
