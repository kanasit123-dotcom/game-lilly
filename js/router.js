const routes = new Map();
let root = null;

export function setRoot(el) { root = el; }

export function register(name, render) { routes.set(name, render); }

export function go(name, params = {}) {
  const render = routes.get(name);
  if (!render) throw new Error(`ไม่พบหน้าจอ: ${name}`);
  root.innerHTML = '';
  render(root, params);
}
