import { LEVELS } from './levels.js';
import { getStars, getMini, setMini } from './state.js';
import { pick, shuffle } from './utils.js';

/* ภารกิจวันนี้: สุ่ม 3 ด่านต่างหมวดให้เล่นในวันนั้น เล่นครบได้สติกเกอร์ 1 ดวงแปะปฏิทิน
   จุดประสงค์คือให้ลูกได้เล่นด่านที่หลากหลาย ไม่วนแต่ด่านโปรดจาก 124 ด่าน
   - คณิตกับไทยมีทุกวัน ด่านที่สามสุ่มจากอังกฤษ (โอกาสสองเท่า) เชาวน์ ครอบครัว โลกใกล้ตัว
   - เลือกด่านที่ยังไม่เคยเล่นก่อน (สุ่มจาก 4 ด่านแรกตามลำดับความยาก) แล้วค่อยด่านที่ยังไม่ครบ 3 ดาว
   - ภารกิจของวันเก็บใน mini.mission { date, ids, done } สติกเกอร์เก็บใน mini.stickers { 'YYYY-MM-DD': emoji }
   ไม่มีการลงโทษถ้าไม่ทำ วันใหม่ก็สุ่มชุดใหม่เฉยๆ */

export const MISSION_SIZE = 3;
export const STICKERS = ['🐢', '🦭', '🐰', '🌟', '🌈', '🍓', '🦋', '🌸', '🐠', '🎈', '🍦', '🌻', '🐬', '🍭', '🎀'];

export const dateKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function pickLevel(subject, exclude) {
  const pool = LEVELS.filter((l) => l.subject === subject && !exclude.includes(l.id));
  if (!pool.length) return null;
  const tiers = [pool.filter((l) => getStars(l.id) === 0), pool.filter((l) => getStars(l.id) < 3), pool];
  // ด่านเรียงตามความยากอยู่แล้ว สุ่มจากไม่กี่ด่านแรกของกลุ่ม จะได้ไม่โดดไปเจอด่านยากเกินตัว
  return pick(tiers.find((t) => t.length).slice(0, 4));
}

function makeMission() {
  const subjects = ['math', 'thai', pick(['en', 'en', 'brain', 'family', 'life'])];
  const ids = [];
  for (const s of shuffle(subjects)) {
    const lv = pickLevel(s, ids);
    if (lv) ids.push(lv.id);
  }
  return { date: dateKey(), ids, done: [] };
}

/* ภารกิจของวันนี้ (สร้างใหม่ถ้าเพิ่งขึ้นวันใหม่) */
export function getMission() {
  let m = getMini('mission');
  if (!m || m.date !== dateKey() || !Array.isArray(m.ids) || !m.ids.every((id) => LEVELS.some((l) => l.id === id))) {
    m = makeMission();
    setMini('mission', m);
  }
  return m;
}

export const isMissionLevel = (levelId) => getMission().ids.includes(levelId);
export const missionDone = (m = getMission()) => m.done.length >= m.ids.length;
export const nextMissionId = (m = getMission()) => m.ids.find((id) => !m.done.includes(id)) || null;

/* เรียกตอนเล่นด่านจบ คืน { hit, justFinished, sticker } — justFinished = เพิ่งครบ 3 ด่านในการเล่นครั้งนี้ */
export function completeMissionLevel(levelId) {
  const m = getMission();
  if (!m.ids.includes(levelId) || m.done.includes(levelId)) return { hit: false, justFinished: false, sticker: null };
  m.done.push(levelId);
  setMini('mission', m);
  if (!missionDone(m)) return { hit: true, justFinished: false, sticker: null };
  const stickers = getMini('stickers') || {};
  const sticker = stickers[m.date] || pick(STICKERS);
  if (!stickers[m.date]) setMini('stickers', { ...stickers, [m.date]: sticker });
  return { hit: true, justFinished: true, sticker };
}

export const getStickers = () => getMini('stickers') || {};
export const stickerCount = () => Object.keys(getStickers()).length;
