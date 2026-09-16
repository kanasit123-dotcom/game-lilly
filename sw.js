const CACHE = 'lilly-world-v29';

const SHELL = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'css/lilly.css',
  'assets/friends/seal.png',
  'assets/friends/turtle.png',
  'assets/friends/rabbit.png',
  'assets/friends/cat.png',
  'assets/friends/penguin.png',
  'assets/friends/fox.png',
  'assets/friends/unicorn.png',
  'assets/friends/dolphin.png',
  'assets/friends/butterfly.png',
  'assets/friends/octopus.png',
  'assets/friends/squirrel.png',
  'assets/stickers/star.png',
  'assets/stickers/rainbow.png',
  'assets/stickers/strawberry.png',
  'assets/stickers/blossom.png',
  'assets/stickers/fish.png',
  'assets/stickers/balloon.png',
  'assets/stickers/icecream.png',
  'assets/stickers/sunflower.png',
  'assets/stickers/lollipop.png',
  'assets/stickers/bow.png',
  'assets/worlds/island.jpg',
  'assets/worlds/forest.jpg',
  'assets/worlds/sea.jpg',
  'assets/worlds/snow.jpg',
  'assets/worlds/space.jpg',
  'assets/worlds/rainbow.jpg',
  'assets/worlds/home.jpg',
  'assets/items/tophat.png',
  'assets/items/sunhat.png',
  'assets/items/cap.png',
  'assets/items/crown.png',
  'assets/items/bow.png',
  'assets/items/bow-blue.png',
  'assets/items/bow-purple.png',
  'assets/items/glasses.png',
  'assets/items/sunglasses.png',
  'assets/items/scarf.png',
  'assets/items/blossom.png',
  'assets/items/star.png',
  'assets/items/balloon.png',
  'assets/items/lollipop.png',
  'vendor/lucide.min.js',
  'js/assets.js',
  'js/lessons.js',
  'js/games/lesson.js',
  'js/screens/menu.js',
  'js/screens/calendar.js',
  'js/mission.js',
  'js/mini/harvest.js',
  'js/mini/writing.js',
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
  'js/screens/summary.js',
  'js/screens/rewards.js',
  'js/screens/mini.js',
  'js/rewards.js',
  'js/mini/coloring.js',
  'js/mini/garden.js',
  'js/mini/bakery.js',
  'js/mini/xylo.js',
  'js/mini/balloons.js',
  'js/mini/aquarium.js',
  'js/mini/dressup.js',
  'js/mini/draw.js',
  'js/mini/drums.js',
  'js/mini/fishing.js',
  'js/games/wordmatch.js',
  'js/games/column.js',
  'js/games/quiz.js',
  'js/games/memory.js',
  'js/games/trace.js',
  'js/games/spell.js',
  'js/games/connect.js',
  'js/games/order.js',
  'js/games/words.js',
  'js/games/thai.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-180.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('lilly-world-') && k !== CACHE).map((k) => caches.delete(k))))
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
  //
  // ต้องใส่ cache:'no-cache' ด้วย ไม่งั้น fetch จะหยิบจาก HTTP cache ของเบราว์เซอร์
  // (GitHub Pages ส่ง max-age=600 มา) แล้วได้ไฟล์เก่าทั้งที่เซิร์ฟเวอร์มีของใหม่แล้ว
  // แบบนี้จะยิงถามเซิร์ฟเวอร์ทุกครั้ง ได้ 304 ตัวเล็กๆ กลับมาถ้าไฟล์ไม่เปลี่ยน
  if (new URL(req.url).origin === self.location.origin) {
    const fresh = new Request(req.url, { cache: 'no-cache', credentials: 'same-origin' });
    e.respondWith(
      fetch(fresh)
        .then((res) => keep(req, res))
        .catch(() => caches.match(req).then((hit) => hit || (req.mode === 'navigate' ? caches.match('index.html') : Response.error())))
    );
    return;
  }

  // ฟอนต์จาก CDN ไม่ค่อยเปลี่ยน ใช้ของที่เก็บไว้ได้เลย
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => keep(req, res)))
  );
});
