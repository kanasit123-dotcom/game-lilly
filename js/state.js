import { LEVELS } from './levels.js';

const KEY = 'lilly-world-v1';

let data = { stars: {} };

try {
  const raw = localStorage.getItem(KEY);
  if (raw) data = { stars: {}, ...JSON.parse(raw) };
} catch {
  /* โหมดส่วนตัวหรือปิด storage อยู่ — เล่นได้แต่ไม่บันทึก */
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* ไม่บันทึกก็ไม่เป็นไร */ }
}

export const getStars = (levelId) => data.stars[levelId] || 0;

export function awardStars(levelId, stars) {
  if (stars > getStars(levelId)) {
    data.stars[levelId] = stars;
    save();
  }
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

/** ให้ดาวแบบใจดี: เล่นจบก็ได้อย่างน้อย 1 ดาวเสมอ */
export function starsFor(firstTry, total) {
  if (firstTry >= total - 1) return 3;
  if (firstTry >= Math.ceil(total / 2)) return 2;
  return 1;
}
