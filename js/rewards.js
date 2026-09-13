import { totalStars, getClaimed, addClaimed } from './state.js';

/* รางวัลปลดล็อกตามดาวสะสม เรียงจากน้อยไปมาก
   type: trophy = ของสะสมโชว์ในตู้, buddy = เพื่อนซี้ตัวใหม่โผล่ในเกม, mini = มินิเกมให้เล่น
   ดาวสูงสุดที่เป็นไปได้ประมาณ 129 ดวง เลยวางรางวัลสุดท้ายไว้ที่ 125 */
export const REWARDS = [
  { id: 'medal1', stars: 3, type: 'trophy', emoji: '🏅', title: 'เหรียญดาวดวงแรก', desc: 'เริ่มต้นได้สวย!' },
  { id: 'coloring', stars: 5, type: 'mini', emoji: '🎨', title: 'ห้องระบายสี', desc: 'มินิเกมใหม่! ระบายสีรูปน่ารักๆ' },
  { id: 'cat', stars: 10, type: 'buddy', emoji: '🐱', title: 'เพื่อนใหม่: น้องแมว', desc: 'มาเป็นเพื่อนซี้ในเกม' },
  { id: 'seal-cup', stars: 15, type: 'trophy', emoji: '🦭', title: 'ถ้วยแมวน้ำ', desc: 'ถ้วยรางวัลสุดน่ารัก', cup: true },
  { id: 'garden', stars: 20, type: 'mini', emoji: '🌱', title: 'สวนผักของลิลลี่', desc: 'มินิเกมใหม่! ปลูกผัก รดน้ำ เก็บเกี่ยว' },
  { id: 'bear', stars: 27, type: 'buddy', emoji: '🐻', title: 'เพื่อนใหม่: น้องหมี', desc: 'มาเป็นเพื่อนซี้ในเกม' },
  { id: 'turtle-cup', stars: 35, type: 'trophy', emoji: '🐢', title: 'ถ้วยเต่าทอง', desc: 'ค่อยๆ ไป แต่ไปถึงแน่', cup: true },
  { id: 'bakery', stars: 45, type: 'mini', emoji: '🧁', title: 'ร้านขนมของลิลลี่', desc: 'มินิเกมใหม่! แต่งหน้าขนมเอง' },
  { id: 'penguin', stars: 55, type: 'buddy', emoji: '🐧', title: 'เพื่อนใหม่: เพนกวิน', desc: 'มาเป็นเพื่อนซี้ในเกม' },
  { id: 'crown', stars: 66, type: 'trophy', emoji: '👑', title: 'มงกุฎนักเรียนเก่ง', desc: 'ขยันมากจริงๆ' },
  { id: 'fox', stars: 78, type: 'buddy', emoji: '🦊', title: 'เพื่อนใหม่: จิ้งจอก', desc: 'มาเป็นเพื่อนซี้ในเกม' },
  { id: 'unicorn', stars: 90, type: 'buddy', emoji: '🦄', title: 'เพื่อนใหม่: ยูนิคอร์น', desc: 'เพื่อนในฝันมาแล้ว!' },
  { id: 'diamond', stars: 105, type: 'trophy', emoji: '💎', title: 'เพชรแห่งความพยายาม', desc: 'ไม่ยอมแพ้เลย' },
  { id: 'rainbow-cup', stars: 125, type: 'trophy', emoji: '🌈', title: 'ถ้วยรุ้งสุดยอด', desc: 'เก่งที่สุดในโลกของลิลลี่!', cup: true },
];

// ลิลลี่ชอบเต่ากับแมวน้ำเป็นพิเศษ สองตัวนี้อยู่ตั้งแต่แรก ที่เหลือต้องเก็บดาวปลดล็อก
const BASE_BUDDIES = ['🐢', '🦭', '🐰'];

export const isUnlocked = (r) => totalStars() >= r.stars;

export const getBuddies = () =>
  BASE_BUDDIES.concat(REWARDS.filter((r) => r.type === 'buddy' && isUnlocked(r)).map((r) => r.emoji));

export const nextReward = () => REWARDS.find((r) => !isUnlocked(r)) || null;

export const miniUnlocked = (id) => isUnlocked(REWARDS.find((r) => r.id === id));

/* รางวัลที่เพิ่งได้แต่ยังไม่เคยเด้งโชว์ — เรียกหลังเล่นจบ แล้วทำเครื่องหมายว่าโชว์แล้ว */
export function claimNewRewards() {
  const seen = getClaimed();
  const fresh = REWARDS.filter((r) => isUnlocked(r) && !seen.includes(r.id));
  fresh.forEach((r) => addClaimed(r.id));
  return fresh;
}
