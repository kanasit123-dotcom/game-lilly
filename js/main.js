import { setRoot, register, go } from './router.js';
import { showHome } from './screens/home.js';
import { showMap } from './screens/map.js';
import { showGame } from './screens/game.js';
import { showResult } from './screens/result.js';
import { showSummary } from './screens/summary.js';
import { showRewards } from './screens/rewards.js';
import { showMini, showPlayroom } from './screens/mini.js';
import { unlockAudio } from './audio.js';

setRoot(document.getElementById('app'));

register('home', showHome);
register('map', showMap);
register('game', showGame);
register('result', showResult);
register('summary', showSummary);
register('rewards', showRewards);
register('mini', showMini);
register('playroom', showPlayroom);

go('home');

// iOS ปลดล็อกเสียงได้เฉพาะตอนผู้ใช้แตะจริงเท่านั้น
document.addEventListener('pointerdown', unlockAudio, { once: true });

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => { /* เปิดจาก file:// ก็เล่นได้ปกติ แค่ไม่มีออฟไลน์ */ });
  });
}
