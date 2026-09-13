import { totalStars, getClaimed, addClaimed } from './state.js';

/* รางวัลปลดล็อกตามดาวสะสม เรียงจากน้อยไปมาก
   type: trophy = ของสะสมโชว์ในตู้, buddy = เพื่อนซี้ตัวใหม่โผล่ในเกม, mini = มินิเกมให้เล่น
   มินิเกมแต่ละอันสั้นๆ (ระบายสีชุดละ 3 รูป) กระจายทุก 10-15 ดาว ให้มีของใหม่บ่อยๆ ไม่เบื่อ
   ดาวสูงสุดที่เป็นไปได้ประมาณ 129 ดวง เลยวางรางวัลสุดท้ายไว้ที่ 125 */
export const REWARDS = [
  { id: 'medal1', stars: 3, type: 'trophy', emoji: '🏅', title: 'เหรียญดาวดวงแรก', desc: 'เริ่มต้นได้สวย!' },
  { id: 'coloring', stars: 5, type: 'mini', emoji: '🎨', title: 'ระบายสี: ใต้ทะเล', desc: 'เต่า แมวน้ำ ปลา รอให้ระบาย' },
  { id: 'xylo', stars: 8, type: 'mini', emoji: '🎵', title: 'ระนาดหรรษา', desc: 'แตะแท่งสีให้เสียงเพลง' },
  { id: 'cat', stars: 12, type: 'buddy', emoji: '🐱', title: 'เพื่อนใหม่: น้องแมว', desc: 'มาเป็นเพื่อนซี้ในเกม' },
  { id: 'garden', stars: 16, type: 'mini', emoji: '🌱', title: 'สวนผักของลิลลี่', desc: 'ปลูกผัก รดน้ำ เก็บเกี่ยว' },
  { id: 'seal-cup', stars: 20, type: 'trophy', emoji: '🦭', title: 'ถ้วยแมวน้ำ', desc: 'ถ้วยรางวัลสุดน่ารัก', cup: true },
  { id: 'balloons', stars: 25, type: 'mini', emoji: '🎈', title: 'ป๊อปลูกโป่ง', desc: 'แตะลูกโป่งให้แตก สนุกๆ' },
  { id: 'bear', stars: 30, type: 'buddy', emoji: '🐻', title: 'เพื่อนใหม่: น้องหมี', desc: 'มาเป็นเพื่อนซี้ในเกม' },
  { id: 'coloring2', stars: 36, type: 'mini', emoji: '🏠', title: 'ระบายสี: บ้านแสนสุข', desc: 'บ้าน ดอกไม้ รถ' },
  { id: 'bakery', stars: 42, type: 'mini', emoji: '🧁', title: 'ร้านขนมของลิลลี่', desc: 'แต่งหน้าขนมเอง' },
  { id: 'turtle-cup', stars: 49, type: 'trophy', emoji: '🐢', title: 'ถ้วยเต่าทอง', desc: 'ค่อยๆ ไป แต่ไปถึงแน่', cup: true },
  { id: 'aquarium', stars: 56, type: 'mini', emoji: '🐠', title: 'ตู้ปลาของลิลลี่', desc: 'ใส่ปลาลงตู้ ดูมันว่ายน้ำ' },
  { id: 'penguin', stars: 64, type: 'buddy', emoji: '🐧', title: 'เพื่อนใหม่: เพนกวิน', desc: 'มาเป็นเพื่อนซี้ในเกม' },
  { id: 'dressup', stars: 72, type: 'mini', emoji: '👒', title: 'แต่งตัวเพื่อนซี้', desc: 'ใส่หมวก แว่น โบว์ ให้เพื่อน' },
  { id: 'crown', stars: 81, type: 'trophy', emoji: '👑', title: 'มงกุฎนักเรียนเก่ง', desc: 'ขยันมากจริงๆ' },
  { id: 'fox', stars: 90, type: 'buddy', emoji: '🦊', title: 'เพื่อนใหม่: จิ้งจอก', desc: 'มาเป็นเพื่อนซี้ในเกม' },
  { id: 'coloring3', stars: 100, type: 'mini', emoji: '🦋', title: 'ระบายสี: สวนสนุก', desc: 'ผีเสื้อ ไอศกรีม ลูกโป่ง' },
  { id: 'unicorn', stars: 110, type: 'buddy', emoji: '🦄', title: 'เพื่อนใหม่: ยูนิคอร์น', desc: 'เพื่อนในฝันมาแล้ว!' },
  { id: 'diamond', stars: 118, type: 'trophy', emoji: '💎', title: 'เพชรแห่งความพยายาม', desc: 'ไม่ยอมแพ้เลย' },
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
