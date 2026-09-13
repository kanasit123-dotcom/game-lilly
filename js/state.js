import { LEVELS } from './levels.js';

const KEY = 'lilly-world-v1';
const MAX_PLAYS = 400;

const EMPTY = () => ({ stars: {}, plays: [], claimed: [], mini: {} });
let data = EMPTY();

try {
  const raw = localStorage.getItem(KEY);
  if (raw) data = { ...EMPTY(), ...JSON.parse(raw) };
} catch {
  /* โหมดส่วนตัวหรือปิด storage อยู่ — เล่นได้แต่ไม่บันทึก */
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* ไม่บันทึกก็ไม่เป็นไร */ }
}

export const getStars = (levelId) => data.stars[levelId] || 0;

/* บันทึกทุกครั้งที่เล่นจบ เก็บดาวที่ดีที่สุดไว้โชว์บนแผนที่
   และเก็บประวัติแยกไว้ให้หน้าผู้ปกครองดูว่าเล่นกี่ครั้ง ถูกกี่ข้อ */
export function recordPlay(levelId, stars, firstTry, total) {
  if (stars > getStars(levelId)) data.stars[levelId] = stars;
  data.plays.push({ id: levelId, s: stars, f: firstTry, t: total, at: Date.now() });
  if (data.plays.length > MAX_PLAYS) data.plays = data.plays.slice(-MAX_PLAYS);
  save();
}

export const getPlays = () => data.plays;

/* รางวัลที่เด้ง popup ไปแล้ว จะได้ไม่เด้งซ้ำ */
export const getClaimed = () => data.claimed;
export function addClaimed(id) {
  if (!data.claimed.includes(id)) { data.claimed.push(id); save(); }
}

/* ที่เก็บของมินิเกม (สวนผัก ขนม รูประบายสี) แยกตามชื่อเกม */
export const getMini = (id) => data.mini[id];
export function setMini(id, value) {
  data.mini[id] = value;
  save();
}

export function resetAll() {
  data = EMPTY();
  save();
}

export const totalStars = () => LEVELS.reduce((sum, l) => sum + getStars(l.id), 0);

/* ด่านแรกที่ยังไม่เคยได้ดาว ใช้ชี้ว่าควรเล่นอันไหนต่อ
   (ทุกด่านเปิดให้เล่นได้หมด ไม่มีการล็อก เด็กจะได้ข้ามไปเล่นอันที่อยากเล่นได้) */
export function nextUnplayedId() {
  return (LEVELS.find((l) => getStars(l.id) === 0) || LEVELS[0]).id;
}

export function nextLevelId(levelId) {
  const i = LEVELS.findIndex((l) => l.id === levelId);
  return i >= 0 && i < LEVELS.length - 1 ? LEVELS[i + 1].id : null;
}

/* ให้ดาวแบบใจดี: เล่นจบก็ได้อย่างน้อย 1 ดาวเสมอ */
export function starsFor(firstTry, total) {
  if (firstTry >= total - 1) return 3;
  if (firstTry >= Math.ceil(total / 2)) return 2;
  return 1;
}
