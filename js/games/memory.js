import { pick, shuffle, wait, confetti, sayBubble, cheerBuddy } from '../utils.js';
import { sfx, speak } from '../audio.js';
import { WORD_SETS } from './words.js';

/* เกมความจำ พลิกการ์ดหาคู่ รูป ↔ คำศัพท์
   cfg: { set: 'animals'|'food'|'things', pairs: n, rounds: n } */

export function play(stage, config, hooks = {}) {
  return new Promise((resolve) => {
    const deck = shuffle(WORD_SETS[config.set] || WORD_SETS.animals);
    const pairs = config.pairs;
    const rounds = Math.min(config.rounds, Math.floor(deck.length / pairs));
    const total = pairs * rounds;

    let roundIdx = 0;
    let matched = 0;
    let mismatches = 0;
    let flipped = [];
    let locked = false;

    stage.innerHTML = `
      <div class="prompt" id="prompt">พลิกการ์ดหาคู่ รูปกับคำที่เข้ากัน</div>
      <div class="mem-grid" id="grid"></div>
      <div class="buddy">🐰</div>`;

    const $prompt = stage.querySelector('#prompt');
    const $grid = stage.querySelector('#grid');

    function renderRound() {
      flipped = [];
      locked = false;
      const chosen = deck.slice(roundIdx * pairs, roundIdx * pairs + pairs);
      const cards = shuffle(
        chosen.flatMap((p) => [
          { key: p.word, face: p.emoji, kind: 'pic' },
          { key: p.word, face: p.word, kind: 'word' },
        ])
      );

      $prompt.textContent = 'พลิกการ์ดหาคู่ รูปกับคำที่เข้ากัน';
      $grid.innerHTML = cards
        .map(
          (c) => `
        <button class="mem-card" data-key="${c.key}">
          <span class="mem-inner">
            <span class="mem-face mem-front">❓</span>
            <span class="mem-face mem-back ${c.kind}">${c.face}</span>
          </span>
        </button>`
        )
        .join('');
      $grid.querySelectorAll('.mem-card').forEach((card) => { card.onclick = () => flip(card); });
    }

    async function flip(card) {
      if (locked || card.classList.contains('open') || card.classList.contains('done')) return;
      sfx.tap();
      card.classList.add('open');
      flipped.push(card);
      if (flipped.length < 2) return;

      locked = true;
      const [a, b] = flipped;

      if (a.dataset.key === b.dataset.key) {
        await wait(400);
        a.classList.add('done');
        b.classList.add('done');
        flipped = [];
        matched++;
        hooks.onProgress?.(matched, total);
        sfx.correct();
        cheerBuddy(stage);
        speak(a.dataset.key, 'en-US');
        sayBubble(stage, pick(['เจอคู่แล้ว!', 'เก่งมาก!', 'ใช่เลย 🌟']));

        if (matched % pairs !== 0) { locked = false; return; }

        confetti(stage, 26);
        $prompt.textContent = 'ครบทุกคู่แล้ว เยี่ยมมาก! 🎉';
        await wait(1600);
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
      a.classList.remove('open');
      b.classList.remove('open');
      flipped = [];
      locked = false;
    }

    hooks.onProgress?.(0, total);
    renderRound();
  });
}
