import { pick, shuffle, wait, confetti, sayBubble, cheerBuddy, buddyHTML } from '../utils.js';
import { sfx, speak, speakPrompt } from '../audio.js';
import { WORD_SETS } from './words.js';
import { pictureHTML, escapeHTML } from '../assets.js';

const DEFAULT_PAIRS = 3;

export function play(stage, config, hooks = {}) {
  return new Promise((resolve) => {
    const deck = shuffle(WORD_SETS[config.set] || WORD_SETS.animals);
    const pairsPerRound = Math.max(1, Math.min(config.pairs || DEFAULT_PAIRS, deck.length));
    const rounds = Math.min(config.rounds || 1, Math.floor(deck.length / pairsPerRound));
    const totalPairs = rounds * pairsPerRound;

    let roundIdx = 0;
    let matchedTotal = 0;
    let matchedInRound = 0;
    let firstTry = 0;
    let locked = false;
    let selected = null;
    let drag = null;
    const wrongWords = new Set();

    const isThai = config.set.startsWith('thai');
    const isVowel = config.set.startsWith('thaiVowels');
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
      const pairs = deck.slice(roundIdx * pairsPerRound, roundIdx * pairsPerRound + pairsPerRound);

      $prompt.textContent = hint;
      if (roundIdx === 0) speakPrompt(hint);
      $pics.innerHTML = shuffle(pairs)
        .map((p) => `<button class="pic-card" data-word="${escapeHTML(p.word)}">${pictureHTML(p)}</button>`)
        .join('');
      $words.innerHTML = shuffle(pairs)
        .map((p) => `<button class="word-card" data-word="${p.word}" data-say="${p.say || p.word}" data-done="${p.done || p.say || p.word}">${p.word}</button>`)
        .join('');

      $pics.querySelectorAll('.pic-card').forEach((pic) => {
        pic.onclick = () => { if (selected) tryMatch(selected, pic); };
      });
      $words.querySelectorAll('.word-card').forEach((card) => {
        card.addEventListener('pointerdown', (e) => onPointerDown(e, card));
        card.addEventListener('click', e => { if (e.detail === 0 && !locked && !card.classList.contains('used')) selectCard(card); });
      });
    }

    /* ---- ลากวาง (ใช้ transform ไม่ให้การ์ดใบอื่นขยับตาม) ---- */

    function onPointerDown(e, card) {
      if (hooks.signal?.aborted || locked || card.classList.contains('used') || drag) return;
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

      if (e.type === 'pointercancel') return;
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
      if (hooks.signal?.aborted || locked || pic.classList.contains('solved') || card.classList.contains('used')) return;
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
      sayBubble(stage, pick(['เก่งมาก!', 'ถูกต้อง!', 'ใช่เลย 🌟']));

      locked = true;
      await speak(card.dataset.done, lang);
      if (hooks.signal?.aborted) return;

      if (matchedInRound < pairsPerRound) {
        locked = false;
        return;
      }

      confetti(stage, 24);
      $prompt.textContent = 'ครบทุกคู่แล้ว เยี่ยมมาก! 🎉';
      await wait(900);
      if (hooks.signal?.aborted) return;

      roundIdx++;
      if (roundIdx >= rounds) resolve({ firstTry, total: totalPairs });
      else renderRound();
    }

    hooks.signal?.addEventListener('abort', () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('pointercancel', onPointerUp);
      drag = null;
      locked = true;
    }, { once: true });
    hooks.onProgress?.(0, totalPairs);
    renderRound();
  });
}
