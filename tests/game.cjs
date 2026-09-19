const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  const base = process.env.LILLY_TEST_URL || 'http://127.0.0.1:5173';
  const localLevels = await import(pathToFileURL(path.join(__dirname, '..', 'js', 'levels.js')).href);
  const legacyIds = localLevels.LEVELS.filter(level => !level.fresh).map(level => level.id);
  assert.equal(legacyIds.length, 92, 'legacy level count remains stable');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const output = path.join(__dirname, 'screenshots');
  fs.mkdirSync(output, { recursive: true });
  const errors = [];
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.setDefaultTimeout(12000);
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(ids => {
      if (localStorage.getItem('lilly-world-v1')) return;
      localStorage.setItem('lilly-world-v1', JSON.stringify({
        stars: Object.fromEntries(ids.map(id => [id, 2])),
        plays: [{ id: 'q-count', s: 2, f: 2, t: 5, at: 1700000000000 }],
        claimed: ['medal1', 'bear'], mini: { sentinel: { saved: true }, preferences: { buddy: 'seal', sound: false } }
      }));
    }, legacyIds);
    await page.goto(base);
    await page.locator('.home-friends').waitFor();
    await page.evaluate(() => document.fonts.ready);
    const levels = await page.evaluate(async () => (await import('/js/levels.js')).LEVELS);
    assert.equal(levels.length, legacyIds.length + 32);
    assert.deepEqual(levels.slice(0, legacyIds.length).map(l => l.id), legacyIds, 'original IDs and order preserved');
    assert.equal(new Set(levels.map(l => l.id)).size, levels.length);
    const readState = () => page.evaluate(() => JSON.parse(localStorage.getItem('lilly-world-v1')));
    let saved = await readState();
    assert.equal(saved.stars['q-count'], 2);
    assert.deepEqual(saved.mini.sentinel, { saved: true });
    await page.locator('#parents').click();
    assert.equal(await page.locator('.home-friends').count(), 1, 'parent page requires a hold');
    await page.locator('#parents').dispatchEvent('pointerdown', { pointerId: 1 });
    await page.waitForTimeout(2100);
    await page.locator('.summary').waitFor();
    await page.locator('#home').click();
    await page.locator('.home-friends').waitFor();
    await page.locator('[data-buddy="rabbit"]').click();
    assert.equal((await readState()).mini.preferences.buddy, 'rabbit');
    await page.screenshot({ path: path.join(output, 'home-desktop.png'), fullPage: true });
    const route = (name, params = {}) => page.evaluate(async ({ name, params }) => (await import('/js/router.js')).go(name, params), { name, params });
    const play = id => route('game', { levelId: id });

    // ภารกิจวันนี้: 3 ด่านต่างหมวด เล่นครบได้สติกเกอร์ 1 ดวงในปฏิทิน
    assert.equal(await page.locator('.mission-level').count(), 3);
    const mission = (await readState()).mini.mission;
    assert.equal(new Set(mission.ids).size, 3);
    assert.equal(new Set(mission.ids.map(id => levels.find(l => l.id === id).subject)).size, 3, 'mission spans three subjects');
    await page.locator('.mission-level').first().click();
    await page.locator('#stage').waitFor();
    for (const [i, id] of mission.ids.entries()) {
      await route('result', { levelId: id, stars: 3, firstTry: 3, total: 3 });
      if (i < 2) assert.match(await page.locator('#next').innerText(), /ภารกิจต่อไป/);
    }
    await page.locator('.reward-title', { hasText: 'ภารกิจวันนี้ครบแล้ว' }).waitFor();
    await page.locator('#st-cal').click();
    assert.equal(await page.locator('.cal-day.got').count(), 1);
    assert.equal(Object.keys((await readState()).mini.stickers).length, 1);
    await route('home');
    assert.equal(await page.locator('.mission.complete .mission-sticker').count(), 1);
    assert.equal(await page.locator('.mission-level.done').count(), 3);
    console.log('PASS daily mission: three subjects, sticker awarded once, calendar and home reflect it.');
    const fresh = levels.filter(l => l.fresh);
    for (const level of fresh) {
      await play(level.id);
      await page.locator('#practice').waitFor();
      if (level.id === 'f-paternal') {
        await page.locator('[data-person="grandma"]').click();
        assert.match(await page.locator('.family-explanation').innerText(), /แม่ของพ่อ/);
        await page.screenshot({ path: path.join(output, 'family-desktop.png') });
      }
      await page.locator('#practice').click();
      if (level.config.practice === 'memory') {
        let usedRetry = false;
        while ((await page.locator('.result').count()) === 0) {
          await page.locator('.mem-card').first().waitFor();
          const keys = await page.locator('.mem-card').evaluateAll(cards => [...new Set(cards.map(c => c.dataset.key))]);
          if (!usedRetry) {
            const wrong = page.locator(`.mem-card[data-key="${keys[0]}"]`).first();
            await wrong.click();
            await page.locator(`.mem-card[data-key="${keys[1]}"]`).first().click();
            await page.waitForFunction(() => !document.querySelector('.mem-card.open'));
            usedRetry = true;
          }
          for (const key of keys) {
            const pair = page.locator(`.mem-card[data-key="${key}"]`);
            await pair.nth(0).click(); await pair.nth(1).click();
            await page.waitForFunction(key => [...document.querySelectorAll('.mem-card')].filter(c => c.dataset.key === key).every(c => c.classList.contains('done')), key);
          }
          await page.waitForFunction(() => document.querySelector('.result') || document.querySelector('.mem-card:not(.done)'));
        }
      } else if (level.config.practice === 'wordmatch') {
        while ((await page.locator('.result').count()) === 0) {
          await page.locator('.word-card').first().waitFor();
          const words = await page.locator('.word-card').evaluateAll(nodes => nodes.map(n => n.dataset.word));
          for (const word of words) {
            await page.locator(`.word-card[data-word="${word}"]`).click();
            await page.locator(`.pic-card[data-word="${word}"]`).click();
          }
          await page.waitForFunction(() => document.querySelector('.result') || document.querySelector('.word-card:not(.used)'));
        }
      } else {
        for (let i = 0; i < level.config.questions.length; i++) {
          const item = level.config.questions[i];
          assert.equal(new Set(item.options).size, item.options.length, `unique options ${level.id}`);
          if (i === 0) {
            await page.getByRole('button', { name: item.options.find(o => o !== item.answer), exact: true }).click();
            assert.equal(await page.locator('.learning-answer.retry').count(), 1, 'wrong pick stays disabled, question does not advance');
          }
          await page.getByRole('button', { name: item.answer, exact: true }).click();
          // เฉลยอ่านจบแล้วไปข้อต่อไปเอง ไม่มีปุ่มให้กด
          if (i + 1 < level.config.questions.length) await page.locator('.lesson-step', { hasText: `ข้อ ${i + 2} /` }).waitFor();
        }
      }
      await page.locator('.result').waitFor();
      saved = await readState();
      const record = saved.plays.at(-1);
      assert.equal(record.id, level.id);
      assert.equal(record.t, level.config.practice ? (level.config.practicePairs || 3) * (level.config.practiceRounds || 1) : level.config.questions.length);
      if (!level.config.practice) assert.equal(record.f, record.t - 1, 'first attempt tracked despite retries');
    }
    console.log(`PASS ${fresh.length} new lessons completed; scores and first-attempt counts verified.`);

    await page.locator('#break').click();
    await page.locator('.playroom-item[data-mini="harvest"]').click();
    for (let i = 0; i < 5; i++) await page.locator('.harvest-plant').nth(i).click();
    await page.locator('#return-lesson').waitFor();
    assert.equal(await page.locator('.harvest-plant').count(), 0);
    await page.locator('#return-lesson').click();
    await page.locator('.game-stage').waitFor();
    await route('mini', { id: 'harvest', fromLevelId: 'f-paternal' });
    await page.locator('#finish-break').click();
    await page.locator('#return-lesson').click();
    assert.match(await page.locator('.game-bar .star-counter').innerText(), /ตากับยาย/);
    // A route change during memory's delayed match must not save or navigate later.
    await play('w-memory');
    const matchKey = await page.locator('.mem-card').first().getAttribute('data-key');
    await page.locator(`.mem-card[data-key="${matchKey}"]`).nth(0).click();
    await page.locator(`.mem-card[data-key="${matchKey}"]`).nth(1).click();
    const playsBeforeExit = (await readState()).plays.length;
    await page.locator('#back').click();
    await page.waitForTimeout(2100);
    assert.equal((await readState()).plays.length, playsBeforeExit);
    assert.equal(await page.locator('.map-wrap').count(), 1, 'back button returns to the map');

    for (const level of levels.filter(l => !l.fresh)) {
      await play(level.id);
      assert.ok(await page.locator('#stage').innerText(), `legacy level mounts ${level.id}`);
      await route('home');
    }
    console.log(`PASS ${legacyIds.length} original levels mount; leaving games does not record progress.`);

    for (const levelId of ['t-vowelfill1', 't-vowelfill2']) {
      await play(levelId);
      const vowelChoices = page.locator('.choice.vowel');
      await vowelChoices.first().waitFor();
      const forms = await vowelChoices.allTextContents();
      assert.ok(forms.every(form => form.includes('-')), `${levelId} uses a hyphen for the consonant position`);
      assert.ok(forms.every(form => !form.includes('◌')), `${levelId} does not show dotted-circle placeholders`);
      assert.doesNotMatch(await page.locator('#stage').innerText(), /◌/, `${levelId} keeps existing tone marks attached to their consonants`);
      for (let i = 0; i < await vowelChoices.count(); i++) {
        await vowelChoices.nth(i).click();
        if (await page.locator('.vowel-complete-word').count()) break;
      }
      const completedWord = await page.locator('.vowel-complete-word').innerText();
      assert.doesNotMatch(completedWord, /[-◌]/, `${levelId} removes the placeholder from the completed word`);
      await route('home');
    }
    console.log('PASS Thai vowel cards use textbook hyphens and completed words remove placeholders.');

    await route('mini', { id: 'coloring' });
    const region = page.locator('.art .r').first();
    const originalFill = await region.getAttribute('fill');
    await region.focus();
    await region.press('Enter');
    assert.equal(await page.locator('#undo').isEnabled(), true);
    await page.locator('#undo').click();
    assert.equal(await page.locator('.art .r').first().getAttribute('fill'), originalFill);
    await page.locator('#finish-break').click();
    await page.locator('#finish-today').click();
    await page.locator('.home-friends').waitFor();

    await route('mini', { id: 'dressup' });
    await page.locator('[data-slot="head"]').click();
    assert.equal(await page.locator('.worn').count(), 1);
    await page.locator('#finish-break').click();
    await page.locator('#finish-today').click();

    await route('mini', { id: 'garden' });
    for (let plot = 0; plot < 3; plot++) {
      for (let step = 0; step < 5; step++) await page.locator('.plot').nth(plot).click();
    }
    await page.locator('#return-lesson').waitFor();
    await page.locator('#finish-today').click();

    await route('mini', { id: 'fishing' });
    for (let fish = 0; fish < 5; fish++) {
      const targetFish = page.locator('.fish[aria-label^="จับ"]:not(.caught)').first();
      await targetFish.waitFor();
      await targetFish.dispatchEvent('pointerdown');
    }
    await page.locator('#return-lesson').waitFor();
    await page.locator('#finish-today').click();

    await route('summary');
    await page.locator('#motion-setting').uncheck();
    assert.equal(await page.locator('html').evaluate(el => el.classList.contains('reduce-motion')), true);
    await route('mini', { id: 'balloons' });
    await page.locator('.balloon').first().waitFor();
    assert.equal(await page.locator('.balloon').first().evaluate(el => getComputedStyle(el).animationName), 'none');
    await route('mini', { id: 'deepfish' });
    await page.locator('.deep-sea').waitFor();
    for (let catchNo = 1; catchNo <= 4; catchNo++) {
      await page.locator('.deep-sea').dispatchEvent('pointerdown', { pointerId: 10 + catchNo });
      if (catchNo < 4) {
        await page.waitForFunction(n => document.querySelector('#deep-count b')?.textContent === String(n), catchNo);
        await page.locator('.deep-sea').dispatchEvent('pointerup', { pointerId: 10 + catchNo });
      } else {
        await page.locator('#return-lesson').waitFor();
      }
    }
    await page.locator('#finish-today').click();
    await route('summary');
    await page.locator('#motion-setting').check();
    assert.equal(await page.locator('html').evaluate(el => el.classList.contains('reduce-motion')), false);
    await route('home');
    assert.ok(((await readState()).mini.dailyActivity?.breaks || 0) >= 1, 'break rounds are counted');

    await route('mini', { id: 'writing' });
    await page.locator('.writing-wrap canvas').waitFor();
    await page.locator('[data-writing-set="upper"]').click();
    await page.locator('[data-writing-mode="blank"]').click();
    await page.locator('#writing-sound').click();
    const writeBox = await page.locator('.writing-wrap canvas').boundingBox();
    await page.mouse.move(writeBox.x + writeBox.width * 0.25, writeBox.y + writeBox.height * 0.75);
    await page.mouse.down();
    await page.mouse.move(writeBox.x + writeBox.width * 0.5, writeBox.y + writeBox.height * 0.25);
    await page.mouse.move(writeBox.x + writeBox.width * 0.75, writeBox.y + writeBox.height * 0.75);
    await page.mouse.up();
    await page.locator('#writing-done').click();
    await page.locator('.writing-letter.done').first().waitFor();
    await page.locator('#finish-break').click();
    await page.locator('#finish-today').click();

    for (const id of ['harvest', 'writing', 'coloring', 'coloring2', 'coloring3', 'coloring4', 'garden', 'xylo', 'balloons', 'bakery', 'aquarium', 'dressup', 'draw', 'drums', 'fishing', 'deepfish']) {
      await route('mini', { id });
      await page.locator('.mini-content').waitFor();
      await page.locator('#finish-break').click();
      await page.locator('#finish-today').click();
    }
    // Advance the browser's clock to verify writing is the only no-time-limit mini-game.
    await page.clock.install();
    await route('mini', { id: 'writing' });
    await page.locator('.writing-wrap canvas').waitFor();
    assert.equal(await page.locator('#break-progress').count(), 0, 'writing has no countdown bar');
    await page.clock.runFor(190000);
    assert.equal(await page.locator('#return-lesson').count(), 0, 'writing does not auto-finish after the break limit');
    assert.equal(await page.locator('.writing-wrap canvas').count(), 1, 'writing stays open without a timer');
    await route('mini', { id: 'xylo' });
    await page.clock.runFor(170000);
    assert.equal(await page.locator('#return-lesson').count(), 0, 'still playing before the break limit');
    await page.clock.runFor(11000);
    await page.locator('#return-lesson').waitFor();
    await page.clock.resume();
    console.log('PASS all 16 mini-game menu entries, manual finish, no-limit writing, five-carrot finish, source lesson return, and 180-second session end.');

    for (const width of [1280, 768, 390, 320]) {
      await page.setViewportSize({ width, height: width <= 390 ? 844 : 900 });
      for (const screen of ['home', 'map', 'playroom', 'summary', 'rewards', 'calendar']) {
        await route(screen);
        const overflow = await page.evaluate(() => ({ page: document.documentElement.scrollWidth > innerWidth, app: document.querySelector('#app').scrollWidth > document.querySelector('#app').clientWidth }));
        assert.deepEqual(overflow, { page: false, app: false }, `${screen} fits ${width}px`);
        if (width === 390 && ['home', 'map'].includes(screen)) await page.screenshot({ path: path.join(output, `${screen}-mobile.png`) });
      }
      for (const id of ['f-paternal', 'f-english-relatives', 'l-m-sub10', 'l-en-friends']) {
        await play(id);
        assert.equal(await page.evaluate(() => document.querySelector('#stage').scrollWidth <= document.querySelector('#stage').clientWidth), true, `${id} lesson fits at ${width}`);
        if (width === 390 && id === 'f-paternal') await page.screenshot({ path: path.join(output, 'family-mobile.png') });
        await page.locator('#practice').click();
        assert.equal(await page.evaluate(() => document.querySelector('#stage').scrollWidth <= document.querySelector('#stage').clientWidth), true, `${id} exercise fits at ${width}`);
      }
      await route('mini', { id: 'harvest' });
      if (width === 390) await page.screenshot({ path: path.join(output, 'harvest-mobile.png') });
      await route('mini', { id: 'dressup' });
      assert.equal(await page.evaluate(() => document.querySelector('.mini-content').scrollWidth <= document.querySelector('.mini-content').clientWidth), true, `dressup fits at ${width}`);
      if (width === 390) await page.screenshot({ path: path.join(output, 'dressup-mobile.png') });
      await route('mini', { id: 'garden' });
      assert.equal(await page.evaluate(() => document.querySelector('.mini-content').scrollWidth <= document.querySelector('.mini-content').clientWidth), true, `garden fits at ${width}`);
      if (width === 390) await page.screenshot({ path: path.join(output, 'garden-mobile.png') });
      await route('mini', { id: 'fishing' });
      await page.locator('.fish').first().waitFor();
      assert.equal(await page.evaluate(() => document.querySelector('.mini-content').scrollWidth <= document.querySelector('.mini-content').clientWidth), true, `fishing fits at ${width}`);
      if (width === 390) await page.screenshot({ path: path.join(output, 'fishing-mobile.png') });
      await route('mini', { id: 'deepfish' });
      await page.locator('.deep-sea').waitFor();
      assert.equal(await page.evaluate(() => document.querySelector('.mini-content').scrollWidth <= document.querySelector('.mini-content').clientWidth), true, `deepfish fits at ${width}`);
      if (width === 390) await page.screenshot({ path: path.join(output, 'deepfish-mobile.png') });
      await route('mini', { id: 'coloring' });
      assert.equal(await page.evaluate(() => document.querySelector('.mini-content').scrollWidth <= document.querySelector('.mini-content').clientWidth), true, `coloring fits at ${width}`);
      if (width === 390) await page.screenshot({ path: path.join(output, 'coloring-mobile.png') });
      await route('mini', { id: 'writing' });
      await page.locator('.writing-wrap canvas').waitFor();
      assert.equal(await page.evaluate(() => document.querySelector('.mini-content').scrollWidth <= document.querySelector('.mini-content').clientWidth), true, `writing fits at ${width}`);
      if (width === 390) await page.screenshot({ path: path.join(output, 'writing-mobile.png') });
    }
    await route('home');
    await page.reload();
    saved = await readState();
    for (const id of legacyIds) assert.equal(saved.stars[id], 2, `legacy best score unchanged ${id}`);
    assert.equal(saved.plays[0].at, 1700000000000);
    assert.ok(saved.claimed.includes('bear'));
    assert.deepEqual(saved.mini.sentinel, { saved: true });
    assert.equal(saved.mini.preferences.buddy, 'rabbit');
    assert.equal(saved.mini.preferences.sound, false);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
    assert.ok((await page.evaluate(() => caches.keys())).includes('lilly-world-v36'));
    await context.setOffline(true);
    await page.reload();
    await page.locator('.home-friends').waitFor();
    assert.equal(await page.locator('.lilly-animal').first().evaluate(el => el.tagName), 'IMG');
    await play('f-paternal');
    await page.locator('#practice').waitFor();
    assert.equal(await page.evaluate(async () => Promise.all(['seal', 'turtle', 'rabbit'].map(async id => { const img = new Image(); img.src = `/assets/friends/${id}.png`; await img.decode(); return img.naturalWidth > 0; })).then(results => results.every(Boolean))), true);
    assert.equal(await page.evaluate(async () => Promise.all(['seal', 'turtle', 'rabbit'].map(async id => { const img = new Image(); img.src = `/assets/friends/${id}.png`; await img.decode(); const canvas = document.createElement('canvas'); canvas.width = img.naturalWidth; canvas.height = img.naturalHeight; canvas.getContext('2d').drawImage(img, 0, 0); return canvas.getContext('2d').getImageData(0, 0, 1, 1).data[3] === 0; })).then(results => results.every(Boolean))), true);
    // เสียงพูดที่อัดไว้: ประโยคที่ประกอบสดต้องต่อจากคลิปย่อยได้ (offline อยู่ = คลิปมาจาก cache ของ service worker)
    const clips = await page.evaluate(async () => {
      const audio = await import('/js/audio.js');
      await new Promise((resolve) => { const tick = () => (audio.clipsFor('1', 'th-TH') && audio.clipsFor('cat', 'en-US') ? resolve() : setTimeout(tick, 100)); tick(); });
      return {
        math: audio.clipsFor('46 บวก 37 เท่ากับ 83', 'th-TH')?.length,
        balloons: audio.clipsFor('แตกไป 10 ลูกแล้ว เก่งมาก', 'th-TH')?.length,
        whole: audio.clipsFor('แตะลูกโป่งให้แตก', 'th-TH')?.length,
        english: audio.clipsFor('Stand up', 'en-US')?.length,
        symbols: audio.clipsFor('หลักหน่วย 46 + 37 = ?', 'th-TH')?.length,   // อ่านว่า "หลักหน่วย สี่สิบหก บวก สามสิบเจ็ด เท่ากับ"
        subtract: audio.spokenForm('9 - 3 = ?', 'th-TH'),
        symbolsEn: audio.clipsFor('2 + 3 = 5', 'en-US')?.length,
        story: audio.clipsFor('ลิลลี่มีแอปเปิ้ล 5 ลูก แม่ให้อีก 2 ลูก รวมกันมีกี่ลูก?', 'th-TH')?.length,   // วลียาว 5 ชิ้น ไม่ใช่ทีละคำ
        thaiDigits: audio.clipsFor('๕ + ๒ = ?', 'th-TH')?.length,
        unknown: audio.clipsFor('ฅฆฑฒ zzqx', 'th-TH')
      };
    });
    assert.deepEqual(clips, { math: 5, balloons: 3, whole: 1, english: 1, symbols: 5, subtract: '9 ลบ 3 เท่ากับ ?', symbolsEn: 5, story: 5, thaiDigits: 4, unknown: null });
    const clipUrl = await page.evaluate(async () => (await import('/js/audio.js')).clipsFor('เก่งมาก', 'th-TH')[0]);
    assert.equal((await page.evaluate(async (file) => (await fetch(`/assets/voice/${file}`)).status, clipUrl)), 200, 'voice clips are cached for offline play');
    await context.setOffline(false);
    assert.deepEqual(errors, [], 'no uncaught browser errors');
    console.log('PASS responsive views, original saved data after reload, and offline app/new lessons/artwork.');
    console.log(`Screenshots: ${output}`);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
