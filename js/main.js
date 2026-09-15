import { setRoot, register, go } from './router.js';
import { showHome } from './screens/home.js';
import { showMap } from './screens/map.js';
import { showGame } from './screens/game.js';
import { showResult } from './screens/result.js';
import { showSummary } from './screens/summary.js';
import { showRewards } from './screens/rewards.js';
import { showMini, showPlayroom } from './screens/mini.js';
import { showCalendar } from './screens/calendar.js';
import { unlockAudio } from './audio.js';
import { getMini } from './state.js';

setRoot(document.getElementById('app'));
document.documentElement.classList.toggle('reduce-motion', getMini('preferences')?.motion === false);

register('home', showHome);
register('map', showMap);
register('game', showGame);
register('result', showResult);
register('summary', showSummary);
register('rewards', showRewards);
register('mini', showMini);
register('playroom', showPlayroom);
register('calendar', showCalendar);

go('home');

// iOS ปลดล็อกเสียงได้เฉพาะตอนผู้ใช้แตะจริงเท่านั้น (และต้องปลุกใหม่หลังสลับแอป)
document.addEventListener('pointerdown', unlockAudio);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => { /* เปิดจาก file:// ก็เล่นได้ปกติ แค่ไม่มีออฟไลน์ */ });
  });
}
