import { pick, shuffle, wait, confetti, sayBubble, cheerBuddy, buddyHTML } from '../utils.js';
import { sfx, speak, speakPrompt } from '../audio.js';
import { WORD_SETS } from './words.js';
import { pictureHTML, escapeHTML } from '../assets.js';

/* เกมความจำ พลิกการ์ดหาคู่ รูป ↔ คำศัพท์
   cfg: { set: 'animals'|'food'|'things', pairs: n, rounds: n } */

export function play(stage, config, hooks = {}) {
  return new Promise((resolve) => {
    const deck = shuffle(WORD_SETS[config.set] || WORD_SETS.animals);
    const pairs = Math.max(1, Math.min(config.pairs || 3, deck.length));
    const rounds = Math.max(1, Math.min(config.rounds || 1, Math.floor(deck.length / pairs)));
    const total = pairs * rounds;

    let roundIdx = 0;
    let matched = 0;
    let mismatches = 0;
    let flipped = [];
    let locked = false;

    stage.innerHTML = `
      <div class="prompt" id="prompt">พลิกการ์ดหาคู่ รูปกับคำที่เข้ากัน</div>
      <div class="mem-grid" id="grid"></div>
      ${buddyHTML()}`;

    const $prompt = stage.querySelector('#prompt');
    const $grid = stage.querySelector('#grid');
    $grid.style.setProperty('--mem-cols', pairs <= 3 ? 3 : 4);

    function renderRound() {
      flipped = [];
      locked = false;
      const chosen = deck.slice(roundIdx * pairs, roundIdx * pairs + pairs);
      const cards = shuffle(
        chosen.flatMap((p) => [
          { key: p.word, face: pictureHTML(p), kind: 'pic' },
          { key: p.word, face: escapeHTML(p.word), kind: 'word' },
        ])
      );

      $prompt.textContent = 'พลิกการ์ดหาคู่ รูปกับคำที่เข้ากัน';
      if (roundIdx === 0) speakPrompt('พลิกการ์ด หาคู่รูปกับคำที่เข้ากัน');
      $grid.innerHTML = cards
        .map(
          (c) => `
        <button class="mem-card" data-key="${escapeHTML(c.key)}" aria-label="เปิดการ์ด" aria-pressed="false">
          <span class="mem-inner">
            <span class="mem-face mem-front">❓</span>
            <span class="mem-face mem-back ${c.kind}" aria-hidden="true">${c.face}</span>
          </span>
        </button>`
        )
        .join('');
      $grid.querySelectorAll('.mem-card').forEach((card) => { card.onclick = () => flip(card); });
    }

    async function flip(card) {
      if (hooks.signal?.aborted || locked || card.classList.contains('open') || card.classList.contains('done')) return;
      sfx.tap();
      card.classList.add('open');
      card.setAttribute('aria-label', card.dataset.key);
      card.setAttribute('aria-pressed', 'true');
      card.querySelector('.mem-back').setAttribute('aria-hidden', 'false');
      flipped.push(card);
      if (flipped.length < 2) return;

      locked = true;
      const [a, b] = flipped;

      if (a.dataset.key === b.dataset.key) {
        await wait(400);
        if (hooks.signal?.aborted) return;
        a.classList.add('done');
        b.classList.add('done');
        a.disabled = b.disabled = true;
        flipped = [];
        matched++;
        hooks.onProgress?.(matched, total);
        sfx.correct();
        cheerBuddy(stage);
        speak(a.dataset.key, config.lang || 'en-US');
        sayBubble(stage, pick(['เจอคู่แล้ว!', 'เก่งมาก!', 'ใช่เลย 🌟']));

        if (matched % pairs !== 0) { locked = false; return; }

        confetti(stage, 26);
        $prompt.textContent = 'ครบทุกคู่แล้ว เยี่ยมมาก! 🎉';
        await wait(1600);
        if (hooks.signal?.aborted) return;
        roundIdx++;
        if (roundIdx >= rounds) {
          resolve({ firstTry: Math.max(0, total - mismatches), total });
        } else {
          renderRound();
        }
        return;
      }

      mismatches++;
      sfx.retry();
      sayBubble(stage, pick(['ยังไม่ใช่คู่ จำไว้นะ!', 'ลองใหม่อีกที 💪']));
      await wait(1000);
      if (hooks.signal?.aborted) return;
      a.classList.remove('open');
      b.classList.remove('open');
      [a, b].forEach(c => {
        c.setAttribute('aria-label', 'เปิดการ์ด');
        c.setAttribute('aria-pressed', 'false');
        c.querySelector('.mem-back').setAttribute('aria-hidden', 'true');
      });
      flipped = [];
      locked = false;
    }

    hooks.onProgress?.(0, total);
    renderRound();
  });
}
