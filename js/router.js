import { setReplay, stopSpeech } from './audio.js';

const routes = new Map();
let root = null;
let cleanup = null;
let currentName = null;

export function setRoot(el) { root = el; }

/** ชื่อหน้าที่เปิดอยู่ (ใช้ตัดสินว่ารีเฟรชหน้าเพื่อแก้เสียงได้ไหม — ไม่รีเฟรชระหว่างเล่นด่าน) */
export const currentRoute = () => currentName;

export function register(name, render) { routes.set(name, render); }

export function go(name, params = {}) {
  const render = routes.get(name);
  if (!render) throw new Error(`ไม่พบหน้าจอ: ${name}`);
  const previous = cleanup;
  cleanup = null;
  previous?.();
  stopSpeech();
  setReplay(null);
  currentName = name;
  root.innerHTML = '';
  cleanup = render(root, params) || null;
  window.lucide?.createIcons();
}
