import { setRoot, register, go, currentRoute } from './router.js';
import { showHome } from './screens/home.js';
import { showMap } from './screens/map.js';
import { showGame } from './screens/game.js';
import { showResult } from './screens/result.js';
import { showSummary } from './screens/summary.js';
import { showRewards } from './screens/rewards.js';
import { showMini, showPlayroom } from './screens/mini.js';
import { showCalendar } from './screens/calendar.js';
import { unlockAudio, markAudioStale, stopSpeech, checkAudioClock } from './audio.js';
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

// iOS ปลดล็อกเสียงได้เฉพาะตอนผู้ใช้แตะจริงเท่านั้น และนับเฉพาะ touchend/click/pointerup (pointerdown อย่างเดียวบน iPad ไม่พอ)
// พับแอปแล้วกลับมา: แตะครั้งถัดไปสร้างระบบเสียงใหม่ (iPad ที่เปิดจากไอคอนบนหน้าจอโฮมทำให้ตัวเก่าเงียบ ดู audio.js)
// ถ้าสร้างใหม่แล้วยังเงียบ (ผู้ปกครองเจอ 2026-10-03: ล็อกจอแล้วกลับมาเงียบ รีเฟรชแล้วมีเสียง) รีเฟรชหน้าให้เอง
// แต่ไม่รีเฟรชระหว่างเล่นด่าน/มินิเกม (ความคืบหน้าในด่านยังไม่ได้บันทึก) — รอจนกลับไปหน้าอื่นแล้วแตะ ระหว่างนั้นใช้เสียงเครื่องอ่านแทน
// รีเฟรชได้ไม่เกินครั้งละ 1 นาที กันวนซ้ำ
let returned = false;
let checking = false;
function afterReturnTap() {
  if (!returned || checking || getMini('preferences')?.sound === false) return;
  if (['game', 'mini'].includes(currentRoute())) return;
  checking = true;
  checkAudioClock(800).then((ok) => {
    checking = false;
    if (['game', 'mini'].includes(currentRoute())) return;   // เพิ่งเข้าด่านระหว่างรอ: ไว้เช็คใหม่ทีหลัง
    returned = false;
    if (ok) return;
    let last = 0;
    try { last = Number(sessionStorage.getItem('lilly-audio-reload-at') || 0); } catch {}
    if (Date.now() - last < 60000) return;
    try { sessionStorage.setItem('lilly-audio-reload-at', String(Date.now())); } catch { return; }
    window.location.reload();
  });
}
['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'].forEach((type) => window.addEventListener(type, () => { unlockAudio(); afterReturnTap(); }, { capture: true, passive: true }));
document.addEventListener('visibilitychange', () => { if (document.hidden) { stopSpeech(); markAudioStale(); returned = true; } });
window.addEventListener('pagehide', markAudioStale);

/* กันซูม — เด็กแตะรัวๆ แล้ว Safari ซูมหน้าเข้า (double-tap zoom) หรือสองนิ้วบีบ
   - gesture* = pinch ของ Safari
   - แตะครั้งที่สองภายใน 350 ms ใกล้จุดเดิม: ยกเลิก default (ซูม) แล้วยิง click ให้เอง ปุ่มจะได้ยังกดติดเหมือนเดิม */
['gesturestart', 'gesturechange', 'gestureend'].forEach((name) => document.addEventListener(name, (e) => e.preventDefault(), { passive: false }));
document.addEventListener('touchstart', (e) => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
let lastTap = { at: 0, x: 0, y: 0 };
document.addEventListener('touchend', (e) => {
  if (e.touches.length) return;
  const touch = e.changedTouches[0];
  const now = Date.now();
  const quick = now - lastTap.at < 350 && Math.hypot(touch.clientX - lastTap.x, touch.clientY - lastTap.y) < 40;
  lastTap = { at: now, x: touch.clientX, y: touch.clientY };
  if (!quick || e.cancelable === false) return;
  e.preventDefault();
  const target = document.elementFromPoint(touch.clientX, touch.clientY);
  target?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, clientX: touch.clientX, clientY: touch.clientY }));
}, { passive: false });

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
