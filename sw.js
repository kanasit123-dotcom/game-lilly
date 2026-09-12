const CACHE = 'lilly-world-v1';

const SHELL = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'js/main.js',
  'js/router.js',
  'js/utils.js',
  'js/audio.js',
  'js/state.js',
  'js/levels.js',
  'js/screens/home.js',
  'js/screens/map.js',
  'js/screens/game.js',
  'js/screens/result.js',
  'js/games/addition.js',
  'js/games/wordmatch.js',
  'js/games/column.js',
  'js/games/quiz.js',
  'js/games/memory.js',
  'js/games/words.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-180.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.allSettled(SHELL.map((u) => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function keep(req, res) {
  if (res.ok && (res.type === 'basic' || res.type === 'cors')) {
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
  }
  return res;
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // ไฟล์เกมของเราเอง: เอาของใหม่จากเน็ตก่อน แก้เกมแล้วเห็นผลทันที
  // ถ้าไม่มีเน็ตค่อยใช้ของที่เก็บไว้ เกมจึงยังเล่นออฟไลน์ได้
  if (new URL(req.url).origin === self.location.origin) {
    e.respondWith(
      fetch(req)
        .then((res) => keep(req, res))
        .catch(() => caches.match(req).then((hit) => hit || caches.match('index.html')))
    );
    return;
  }

  // ฟอนต์จาก CDN ไม่ค่อยเปลี่ยน ใช้ของที่เก็บไว้ได้เลย
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => keep(req, res)))
  );
});
