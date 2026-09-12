import { go } from '../router.js';
import { getLevel } from '../levels.js';
import { awardStars, starsFor } from '../state.js';
import { sfx } from '../audio.js';
import { play as playWordmatch } from '../games/wordmatch.js';
import { play as playColumn } from '../games/column.js';
import { play as playQuiz } from '../games/quiz.js';
import { play as playMemory } from '../games/memory.js';
import { play as playTrace } from '../games/trace.js';
import { play as playSpell } from '../games/spell.js';

const GAMES = {
  wordmatch: playWordmatch,
  column: playColumn,
  quiz: playQuiz,
  memory: playMemory,
  trace: playTrace,
  spell: playSpell,
};

export function showGame(root, { levelId }) {
  const level = getLevel(levelId);

  const el = document.createElement('div');
  el.className = 'screen game-screen';
  el.innerHTML = `
    <div class="game-bar">
      <button class="icon-btn" id="back">←</button>
      <div class="dots" id="dots"></div>
      <div class="spacer"></div>
      <div class="star-counter">${level.icon} ${level.title}</div>
    </div>
    <div class="game-stage" id="stage"></div>`;
  root.appendChild(el);

  const $dots = el.querySelector('#dots');
  const $stage = el.querySelector('#stage');

  let left = false;
  el.querySelector('#back').onclick = () => {
    left = true;
    sfx.tap();
    go('map');
  };

  function renderDots(done, total) {
    let html = '';
    for (let i = 0; i < total; i++) {
      html += `<i class="${i < done ? 'done' : i === done ? 'now' : ''}"></i>`;
    }
    $dots.innerHTML = html;
  }

  GAMES[level.type]($stage, level.config, { onProgress: renderDots }).then((res) => {
    if (left) return;
    const stars = starsFor(res.firstTry, res.total);
    awardStars(levelId, stars);
    go('result', { levelId, stars, ...res });
  });
}
