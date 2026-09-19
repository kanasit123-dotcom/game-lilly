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

/** ต้องเรียกจาก event ที่ผู้ใช้แตะ (ข้อจำกัดของ iOS) เรียกซ้ำได้ทุกครั้งที่แตะ
    เพราะ iOS จะพัก AudioContext เมื่อสลับแอปหรือล็อกจอ กลับมาแล้วเสียงเอฟเฟกต์เงียบจนกว่าจะ resume */
export function unlockAudio() {
  if (!unlocked) {
    unlocked = true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      speechSynthesis.speak(u);
      refreshVoices();
    }
  }
  if (ctx?.state === 'suspended') ctx.resume();
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
  const same = voices.filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith(p));
  // เสียงที่ติดมากับเครื่อง (localService) มักเสถียรกว่าเสียงออนไลน์ และไม่ต้องรอโหลด
  return same.find((v) => v.localService) || same[0] || null;
}

let seq = 0;

/* คืน Promise ที่จบเมื่อพูดเสร็จ (หรือทันทีถ้าเครื่องไม่มีเสียง) เกมที่อยากให้ฟังจนจบ
   ค่อยไปข้อต่อไป ให้ await ได้ มีเวลาสำรองเผื่อเบราว์เซอร์ไม่ยิง event end (iOS เป็นบางครั้ง)

   บั๊กที่เจอบนเครื่องจริงและกันไว้ที่นี่:
   - iOS/Chrome: เรียก speak() ติดกับ cancel() ทันที ประโยคใหม่หายเงียบ → หน่วงนิดหนึ่งก่อนพูด
   - Chrome ค้างสถานะ paused หลังพูดไปสักพัก → resume() ก่อนทุกครั้ง
   - รายชื่อเสียงยังโหลดไม่เสร็จตอนแตะครั้งแรก → ไม่หา voice เจอก็ยังพูดโดยตั้ง lang ให้เครื่องเลือกเอง */
/* ---- เสียงพูดที่อัดไว้ล่วงหน้า (design/voice.py → assets/voice/<th|en>/) ----
   เสียงในเครื่อง (iOS Kanya) ไม่ชัด เลยอัดทุกข้อความด้วยเสียง Microsoft Neural แล้วเล่นผ่าน Web Audio
   ตัวเดียวกับเอฟเฟกต์ (ถ้าใช้ <audio> แยก iOS จะสลับโหมดเสียงแล้วเอฟเฟกต์เงียบ)
   ประโยคที่ประกอบสด เช่น "5 บวก 3 เท่ากับ 8" หรือ "ทำแพนเค้ก" ต่อจากคลิปย่อย:
   ไล่จากซ้ายไปขวา จับคู่คำที่ยาวที่สุดในคลัง (คำตัวเดียวจับได้เฉพาะเมื่อมีช่องว่าง/จบคำ)
   ถ้าต่อไม่ครบทั้งประโยคจะถอยไปใช้เสียงในเครื่องเหมือนเดิม */
const VOICE = { th: null, en: null };        // manifest: ข้อความ → ชื่อไฟล์
const VOICE_INDEX = { th: null, en: null };  // ตัวอักษรแรก → คำที่ขึ้นต้นด้วยตัวนั้น (ยาวก่อน)
const buffers = new Map();
let playing = null;
for (const lang of ['th', 'en']) {
  fetch(`assets/voice/${lang}/manifest.json`).then((r) => r.json()).then((manifest) => {
    VOICE[lang] = manifest;
    const index = new Map();
    for (const key of Object.keys(manifest)) {
      const first = key[0];
      if (!index.has(first)) index.set(first, []);
      index.get(first).push(key);
    }
    index.forEach((list) => list.sort((a, b) => b.length - a.length));
    VOICE_INDEX[lang] = index;
  }).catch(() => {});
}
const SKIP = /[\s,.!?:;·()"“”‘’…\-]/;
const isBoundary = (text, at) => at >= text.length || SKIP.test(text[at]) || (/[฀-๿]/.test(text[at - 1] || '') !== /[฀-๿]/.test(text[at]));

/* เครื่องหมายเลขคณิตอ่านเป็นคำ: "4 + 5 = ?" → "4 บวก 5 เท่ากับ" (เด็กจะได้ยินว่าบวกหรือลบ)
   ขีดกลางเป็น "ลบ" เฉพาะเมื่ออยู่ระหว่างตัวเลข (ในบทเรียนไทยใช้ขีดแทนตำแหน่งสระ เช่น "เ-") */
const MATH_WORDS = {
  th: { '+': 'บวก', '−': 'ลบ', '=': 'เท่ากับ', '×': 'คูณ', '÷': 'หาร' },
  en: { '+': 'plus', '−': 'minus', '=': 'equals', '×': 'times', '÷': 'divided by' }
};
export function spokenForm(text, lang = 'th-TH') {
  const words = MATH_WORDS[lang.startsWith('en') ? 'en' : 'th'];
  return String(text)
    .replace(/(\d)\s*-\s*(?=\d)/g, '$1 − ')
    .replace(/[+−=×÷]/g, (symbol) => ` ${words[symbol]} `)
    .replace(/\s+/g, ' ').trim();
}

export function clipsFor(text, lang = 'th-TH') {
  const code = lang.startsWith('en') ? 'en' : 'th';
  const manifest = VOICE[code];
  const index = VOICE_INDEX[code];
  if (!manifest || !index) return null;
  const normalized = code === 'en' ? spokenForm(text, lang).toLowerCase() : spokenForm(text, lang);
  if (manifest[normalized.trim()]) return [`${code}/${manifest[normalized.trim()]}`];
  const files = [];
  let i = 0;
  while (i < normalized.length) {
    if (SKIP.test(normalized[i])) { i++; continue; }
    const candidates = index.get(normalized[i]) || [];
    const key = candidates.find((k) => normalized.startsWith(k, i) && (k.length > 1 || isBoundary(normalized, i + k.length)) && (code === 'th' || isBoundary(normalized, i + k.length)));
    if (!key) return null;
    files.push(`${code}/${manifest[key]}`);
    i += key.length;
  }
  return files.length ? files : null;
}

function clipBuffer(file) {
  if (buffers.has(file)) return buffers.get(file);
  const promise = fetch(`assets/voice/${file}`).then((r) => r.arrayBuffer()).then((bytes) => new Promise((resolve, reject) => {
    const result = ctx.decodeAudioData(bytes, resolve, reject);   // iOS เก่าใช้แบบ callback
    if (result?.then) result.then(resolve, reject);
  })).catch((error) => { buffers.delete(file); throw error; });
  buffers.set(file, promise);
  return promise;
}

function stopClips() {
  if (playing) { try { playing.stop(); } catch {} playing = null; }
}

/* หยุดเสียงพูดทุกแบบ (คลิปที่อัดไว้ + เสียงในเครื่อง) — ใช้ตอนเปลี่ยนหน้า/ปิดเสียง */
export function stopSpeech() {
  seq++;
  stopClips();
  window.speechSynthesis?.cancel();
}

// คืน true เมื่อเล่นจบ (หรือถูกแทรก) / false เมื่อเล่นไม่ได้ ให้ไปใช้เสียงในเครื่อง
async function playClips(files, my) {
  if (!ctx) return false;
  for (const file of files) {
    if (my !== seq) return true;
    let buffer;
    try { buffer = await clipBuffer(file); } catch { return false; }
    if (my !== seq) return true;
    if (ctx.state !== 'running') { try { await ctx.resume(); } catch {} }
    await new Promise((resolve) => {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      const guard = setTimeout(resolve, buffer.duration * 1000 + 500);
      source.onended = () => { clearTimeout(guard); resolve(); };
      playing = source;
      source.start();
    });
  }
  return true;
}

export function speak(text, lang = 'th-TH') {
  if (!text || !soundEnabled() || !('speechSynthesis' in window)) return Promise.resolve();
  if (!voices.length) refreshVoices();
  const my = ++seq;
  speechSynthesis.cancel();
  stopClips();
  const files = clipsFor(text, lang);
  if (files && ctx) return playClips(files, my).then((ok) => (ok ? undefined : synthesize(text, lang, my)));
  return synthesize(text, lang, my);
}

function synthesize(text, lang, my) {
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(spokenForm(text, lang));
    const voice = findVoice(lang);
    if (voice) u.voice = voice;
    u.lang = voice?.lang || lang;
    u.rate = lang.startsWith('en') ? 0.75 : 0.95;
    u.pitch = 1.15;
    let done = false;
    let guard = null;
    const finish = () => { if (!done) { done = true; clearTimeout(guard); resolve(); } };
    u.onend = finish;
    u.onerror = finish;
    setTimeout(() => {
      if (my !== seq) { finish(); return; } // มีประโยคใหม่แทรกมาก่อนได้พูด
      guard = setTimeout(finish, 1500 + String(text).length * 130);
      try { speechSynthesis.resume(); speechSynthesis.speak(u); } catch { finish(); }
    }, 60);
  });
}

/* ---- ประโยคโจทย์ที่กดฟังซ้ำได้ ----
   เกมเรียก speakPrompt() ตอนขึ้นโจทย์ใหม่ ปุ่ม 🔊 บนแถบเกมเรียก replay() ได้ทุกเมื่อ
   ถ้าเกมอยากอ่านหลายอย่างต่อกัน (โจทย์ + ตัวเลือก) ให้ setReplay(fn) เองได้ */
let replayFn = null;
export function speakPrompt(text, lang = 'th-TH') {
  replayFn = () => speak(text, lang);
  return speak(text, lang);
}
export function setReplay(fn) { replayFn = fn; }
export function replay() { return replayFn ? replayFn() : Promise.resolve(); }

/* ภาษาที่ควรใช้อ่านข้อความนี้: มีตัวอักษรอังกฤษ → อ่านอังกฤษ นอกนั้น (ไทย ตัวเลข) → ไทย */
export const langOf = (text) => (/[A-Za-z]/.test(String(text)) ? 'en-US' : 'th-TH');

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
