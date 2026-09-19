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
  // ติดตั้งครั้งแรก: เกมต้องโหลดรูปกับเสียงทั้งหมด (~30 MB) ไว้ก่อน ให้เห็นแถบความคืบหน้าแทนความเงียบ
  // ตอนอัปเดตรุ่นใหม่ไม่โชว์ เพราะรุ่นเก่ายังเล่นได้ระหว่างโหลด
  const firstInstall = !navigator.serviceWorker.controller;
  let overlay = null;
  const showProgress = (done, total) => {
    if (!firstInstall) return;
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'first-load';
      overlay.innerHTML = '<div class="first-load-card"><div class="first-load-title">กำลังเตรียมเสียงและรูปภาพ…</div><div class="first-load-bar"><i></i></div><div class="first-load-note">ครั้งแรกครั้งเดียว หลังจากนี้เล่นได้ไม่ต้องรอ</div></div>';
      document.body.appendChild(overlay);
    }
    overlay.querySelector('.first-load-bar i').style.width = `${Math.round((done / total) * 100)}%`;
    if (done >= total) setTimeout(() => { overlay?.remove(); overlay = null; }, 600);
  };
  navigator.serviceWorker.addEventListener('message', (e) => {
    if (e.data?.type === 'install-progress') showProgress(e.data.done, e.data.total);
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => { overlay?.remove(); overlay = null; });
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => { /* เปิดจาก file:// ก็เล่นได้ปกติ แค่ไม่มีออฟไลน์ */ });
  });
}
