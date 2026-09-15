import { setReplay } from './audio.js';

const routes = new Map();
let root = null;
let cleanup = null;

export function setRoot(el) { root = el; }

export function register(name, render) { routes.set(name, render); }

export function go(name, params = {}) {
  const render = routes.get(name);
  if (!render) throw new Error(`ไม่พบหน้าจอ: ${name}`);
  const previous = cleanup;
  cleanup = null;
  previous?.();
  window.speechSynthesis?.cancel();
  setReplay(null);
  root.innerHTML = '';
  cleanup = render(root, params) || null;
  window.lucide?.createIcons();
}
