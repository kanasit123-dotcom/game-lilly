export const randInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const CONFETTI_COLORS = ['#ff8fc0', '#ffc94d', '#6ec6ff', '#7ed957', '#b08cff', '#ffa45c'];

export function confetti(host, amount = 26) {
  for (let i = 0; i < amount; i++) {
    const bit = document.createElement('div');
    bit.className = 'confetti';
    bit.style.left = randInt(5, 95) + '%';
    bit.style.top = randInt(-20, 10) + '%';
    bit.style.background = pick(CONFETTI_COLORS);
    bit.style.animationDuration = (1.1 + Math.random() * 0.9).toFixed(2) + 's';
    bit.style.animationDelay = (Math.random() * 0.35).toFixed(2) + 's';
    host.appendChild(bit);
    setTimeout(() => bit.remove(), 2600);
  }
}

/** แสดงคำพูดของเพื่อนซี้สักครู่ */
export function sayBubble(host, text, ms = 1600) {
  host.querySelector('.bubble')?.remove();
  const b = document.createElement('div');
  b.className = 'bubble';
  b.textContent = text;
  host.appendChild(b);
  setTimeout(() => b.remove(), ms);
}

export function cheerBuddy(host) {
  const buddy = host.querySelector('.buddy');
  if (!buddy) return;
  buddy.classList.remove('happy');
  void buddy.offsetWidth;
  buddy.classList.add('happy');
}
