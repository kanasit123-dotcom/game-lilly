/* เสียงทั้งหมดสร้างจาก Web Audio ไม่ต้องโหลดไฟล์เสียง
   เสียงพูดใช้ SpeechSynthesis ของเครื่อง (ถ้าไม่มีเสียงภาษานั้นจะข้ามไปเงียบๆ) */

import { getMini } from './state.js';

const soundEnabled = () => getMini('preferences')?.sound !== false;
let ctx = null;
let unlocked = false;
let voices = [];

function refreshVoices() {
  if ('speechSynthesis' in window) voices = speechSynthesis.getVoices();
}
if ('speechSynthesis' in window) {
  refreshVoices();
  speechSynthesis.addEventListener('voiceschanged', refreshVoices);
}

/** ต้องเรียกจาก event ที่ผู้ใช้แตะครั้งแรก (ข้อจำกัดของ iOS) */
export function unlockAudio() {
  if (unlocked) return;
  unlocked = true;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (AC) ctx = new AC();
  if (ctx?.state === 'suspended') ctx.resume();
  if ('speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    speechSynthesis.speak(u);
    refreshVoices();
  }
}

function tone(freq, at, dur, { type = 'sine', gain = 0.16 } = {}) {
  if (!ctx || !soundEnabled()) return;
  const t0 = ctx.currentTime + at;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  amp.gain.setValueAtTime(0, t0);
  amp.gain.linearRampToValueAtTime(gain, t0 + 0.015);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(amp).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

const N = { C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5, E6: 1318.5, G6: 1568 };

/* โน้ตเดี่ยวสำหรับมินิเกมดนตรี */
export function note(freq, dur = 0.6) {
  tone(freq, 0, dur, { type: 'triangle', gain: 0.2 });
}

export const sfx = {
  tap() { tone(N.E5, 0, 0.1, { type: 'triangle', gain: 0.1 }); },

  correct() {
    tone(N.C5, 0, 0.14, { type: 'triangle' });
    tone(N.E5, 0.09, 0.14, { type: 'triangle' });
    tone(N.G5, 0.18, 0.3, { type: 'triangle' });
  },

  /* เสียงตอบผิด — นุ่มๆ ไม่ดุ ให้รู้สึกว่า "ลองใหม่นะ" */
  retry() {
    tone(392, 0, 0.13, { type: 'sine', gain: 0.11 });
    tone(330, 0.11, 0.2, { type: 'sine', gain: 0.11 });
  },

  bundle() {
    [N.C5, N.E5, N.G5, N.C6, N.E6].forEach((f, i) =>
      tone(f, i * 0.055, 0.2, { type: 'triangle', gain: 0.12 }));
  },

  star(i = 0) { tone([N.C6, N.E6, N.G6][i] || N.G6, 0, 0.35, { type: 'triangle', gain: 0.14 }); },

  win() {
    [[N.C5, 0], [N.E5, 0.12], [N.G5, 0.24], [N.C6, 0.36], [N.G5, 0.52], [N.C6, 0.62]]
      .forEach(([f, t]) => tone(f, t, 0.35, { type: 'triangle', gain: 0.15 }));
  },
};

function findVoice(lang) {
  const p = lang.slice(0, 2).toLowerCase();
  return voices.find((v) => v.lang.toLowerCase().startsWith(p)) || null;
}

/* คืน Promise ที่จบเมื่อพูดเสร็จ (หรือทันทีถ้าเครื่องไม่มีเสียง) เกมที่อยากให้ฟังจนจบ
   ค่อยไปข้อต่อไป ให้ await ได้ มีเวลาสำรองเผื่อเบราว์เซอร์ไม่ยิง event end (iOS เป็นบางครั้ง) */
export function speak(text, lang = 'th-TH') {
  if (!soundEnabled() || !('speechSynthesis' in window)) return Promise.resolve();
  if (!voices.length) refreshVoices();
  const voice = findVoice(lang);
  if (!voice) return Promise.resolve(); // เครื่องไม่มีเสียงภาษานี้ ก็ไม่ต้องพูด
  speechSynthesis.cancel();
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    u.voice = voice;
    u.lang = voice.lang;
    u.rate = lang.startsWith('en') ? 0.75 : 0.95;
    u.pitch = 1.15;
    let done = false;
    const finish = () => { if (!done) { done = true; clearTimeout(guard); resolve(); } };
    const guard = setTimeout(finish, 1500 + text.length * 130);
    u.onend = finish;
    u.onerror = finish;
    speechSynthesis.speak(u);
  });
}

/* ---- เสียงเครื่องเคาะสำหรับมินิเกมกลอง สร้างจาก noise + oscillator ---- */

let noiseBuf = null;
function noise() {
  if (!ctx) return null;
  if (!noiseBuf) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  return src;
}

function burst(dur, { filter = 'highpass', freq = 1000, gain = 0.3, at = 0 } = {}) {
  if (!soundEnabled()) return;
  const src = noise();
  if (!src) return;
  const t0 = ctx.currentTime + at;
  const f = ctx.createBiquadFilter();
  f.type = filter;
  f.frequency.value = freq;
  const amp = ctx.createGain();
  amp.gain.setValueAtTime(gain, t0);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f).connect(amp).connect(ctx.destination);
  src.start(t0);
  src.stop(t0 + dur + 0.05);
}

export const perc = {
  kick() {
    if (!ctx || !soundEnabled()) return;
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.frequency.setValueAtTime(160, t0);
    osc.frequency.exponentialRampToValueAtTime(45, t0 + 0.25);
    amp.gain.setValueAtTime(0.7, t0);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.35);
    osc.connect(amp).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + 0.4);
  },
  snare() { burst(0.18, { filter: 'bandpass', freq: 1800, gain: 0.5 }); tone(190, 0, 0.12, { type: 'triangle', gain: 0.25 }); },
  hihat() { burst(0.07, { filter: 'highpass', freq: 7000, gain: 0.35 }); },
  clap() { [0, 0.025, 0.05].forEach((at) => burst(0.09, { filter: 'bandpass', freq: 1200, gain: 0.4, at })); },
  bell() { tone(880, 0, 0.5, { type: 'triangle', gain: 0.2 }); tone(1320, 0, 0.4, { type: 'sine', gain: 0.12 }); },
  shaker() { burst(0.12, { filter: 'highpass', freq: 4500, gain: 0.25 }); },
};
