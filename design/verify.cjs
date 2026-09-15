// Run with Playwright available on NODE_PATH; no server is required.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const fs = require('node:fs');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const out = path.join(__dirname, 'review');
  fs.mkdirSync(out, { recursive: true });
  const errors = [];
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(pathToFileURL(path.join(__dirname, 'index.html')).href);
    await page.evaluate(async () => {
      localStorage.removeItem('lilly-design-preview-v1');
      localStorage.setItem('lilly-production-sentinel', 'unchanged');
      await document.fonts.ready;
    });
    await page.reload();
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.lucide-house').waitFor();
    assert.equal(await page.evaluate(async () => {
      const image = new Image();
      image.src = '../assets/lilly-friends.png';
      await image.decode();
      return image.naturalWidth > 0;
    }), true, 'character illustration loads');
    await page.screenshot({ path: path.join(out, 'desktop-home.png'), fullPage: true });
    await page.getByRole('radio', { name: 'กระต่าย', exact: true }).check();
    await page.locator('[data-subject="family"]').first().click();
    await page.locator('[data-person="maternalGrandma"]').click();
    assert.match(await page.locator('#explanation').innerText(), /แม่ของแม่ เรียกว่า ยาย/);
    await page.screenshot({ path: path.join(out, 'desktop-family.png'), fullPage: true });
    await page.locator('[data-action="start-practice"]').click();
    await page.getByRole('button', { name: 'ตา', exact: true }).click();
    assert.equal(await page.locator('[data-action="next-question"]').isDisabled(), true);
    for (const label of ['ปู่', 'ย่า', 'ยาย']) {
      await page.getByRole('button', { name: label, exact: true }).click();
      await page.locator('[data-action="next-question"]').click();
    }
    await page.locator('[data-action="start-mini"]').click();
    await page.screenshot({ path: path.join(out, 'desktop-garden.png'), fullPage: true });
    for (let i = 0; i < 5; i++) await page.locator(`[data-harvest="${i}"]`).click();
    await page.locator('[data-action="continue-learning"]').waitFor();
    assert.equal(await page.locator('[data-harvest]').count(), 0, 'mini ends after five pickups');
    await page.locator('[data-action="continue-learning"]').click();
    await page.locator('[data-action="start-practice"]').click();
    for (const label of ['กา', 'ตา', 'มา']) {
      await page.getByRole('button', { name: label, exact: true }).click();
      await page.locator('[data-action="next-question"]').click();
    }
    await page.getByRole('button', { name: 'ข้ามการพักเล่น', exact: true }).click();
    await page.locator('[data-action="continue-learning"]').click();
    await page.locator('[data-action="start-practice"]').click();
    for (const label of ['5', '3', '4']) {
      await page.getByRole('button', { name: label, exact: true }).click();
      await page.locator('[data-action="next-question"]').click();
    }
    await page.getByRole('button', { name: 'ข้ามการพักเล่น', exact: true }).click();
    await page.locator('[data-action="continue-learning"]').click();
    await page.locator('[data-action="start-practice"]').click();
    const cards = await page.locator('[data-memory]').evaluateAll(nodes => nodes.map(n => ({
      id: n.dataset.memory,
      key: n.querySelector('.animal')?.getAttribute('aria-label') || n.querySelector('.face').textContent.trim().toLowerCase()
    })));
    const translate = { 'แมวน้ำ': 'seal', 'เต่า': 'turtle', 'กระต่าย': 'rabbit' };
    cards.forEach(c => { c.key = translate[c.key] || c.key; });
    const first = cards[0], wrong = cards.find(c => c.key !== first.key);
    await page.locator(`[data-memory="${first.id}"]`).click();
    await page.locator(`[data-memory="${wrong.id}"]`).click();
    await page.waitForFunction(() => document.querySelectorAll('.memory-card.flipped').length === 0);
    for (const key of ['seal', 'turtle', 'rabbit']) {
      for (const card of cards.filter(c => c.key === key)) await page.locator(`[data-memory="${card.id}"]`).click();
    }
    assert.equal(await page.locator('.memory-card.matched').count(), 6);
    await page.locator('[data-action="finish-practice"]').click();
    await page.getByRole('button', { name: 'ข้ามการพักเล่น', exact: true }).click();
    await page.getByRole('button', { name: 'วันนี้พอแค่นี้', exact: true }).click();
    await page.reload();
    assert.equal(await page.getByRole('radio', { name: 'กระต่าย', exact: true }).isChecked(), true);
    await page.locator('nav [data-go="collection"]').click();
    assert.equal(await page.locator('.sticker:not(.locked)').count(), 4, 'all completed subjects persist');
    assert.equal(await page.evaluate(() => localStorage.getItem('lilly-production-sentinel')), 'unchanged');
    await page.locator('[data-go="parents"]').click();
    await page.locator('#sound-setting').uncheck();
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('lilly-design-preview-v1')).sound), false);

    for (const width of [1280, 768, 390, 320]) {
      await page.setViewportSize({ width, height: width < 400 ? 844 : 900 });
      for (const view of ['home', 'worlds', 'collection', 'parents']) {
        await page.locator(`[data-go="${view}"]`).first().click();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `no horizontal overflow ${view} at ${width}`);
        if (view === 'home' && width === 390) await page.screenshot({ path: path.join(out, 'mobile-home.png'), fullPage: true });
      }
      await page.locator('nav [data-go="worlds"]').click();
      await page.locator('[data-subject="family"]').click();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `family fits at ${width}`);
      if (width === 390) await page.screenshot({ path: path.join(out, 'mobile-family.png'), fullPage: true });
      if (width <= 390) {
        await page.locator('[data-action="start-practice"]').click();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `quiz fits at ${width}`);
        for (const label of ['ปู่', 'ย่า', 'ยาย']) {
          await page.getByRole('button', { name: label, exact: true }).click();
          await page.locator('[data-action="next-question"]').click();
        }
        await page.locator('[data-action="start-mini"]').click();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `mini fits at ${width}`);
        if (width === 390) await page.screenshot({ path: path.join(out, 'mobile-garden.png'), fullPage: true });
        await page.locator('nav [data-go="worlds"]').click();
        await page.locator('[data-subject="english"]').click();
        await page.locator('[data-action="start-practice"]').click();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `memory fits at ${width}`);
      }
    }
    assert.deepEqual(errors, [], 'no uncaught browser errors');
    console.log('PASS: four learning flows, retry, memory match/mismatch, finite mini-game, persistence, sound setting, original storage preserved, and layouts at 320/390/768/1280px.');
    console.log(`Screenshots: ${out}`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
