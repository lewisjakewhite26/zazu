/**
 * Resume capture from gym puzzle → ad → gym-success → dark alarm/learn.
 */
import { chromium } from 'playwright';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'New SS');
const EXPO_BASE = process.env.EXPO_PORT
  ? `http://localhost:${process.env.EXPO_PORT}`
  : 'http://localhost:8083';

async function wait(page, ms = 2000) {
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.waitForTimeout(ms);
}

async function gotoApp(page, path = '/') {
  await page.goto(`${EXPO_BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
}

async function shot(page, name) {
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(OUT, `${name}.png`), fullPage: true });
  console.log(`Saved ${name}.png`);
}

async function seedGuest(page) {
  await gotoApp(page);
  await page.evaluate(() => {
    localStorage.setItem('zazu:hasOnboarded', 'true');
    localStorage.setItem('zazu:isAnonymous', 'true');
  });
  await page.reload();
  await wait(page, 3500);
}

async function ensureDarkMode(page) {
  const toLight = page.getByRole('button', { name: /Switch to light mode/i });
  if ((await toLight.count()) > 0) {
    await toLight.click();
    await wait(page, 2000);
    return;
  }
  const toDark = page.getByRole('button', { name: /Switch to dark mode/i });
  if ((await toDark.count()) > 0) {
    await toDark.click();
    await wait(page, 2000);
  }
}


async function clickPuzzleTile(page, index) {
  await page.evaluate((idx) => {
    const tiles = [...document.querySelectorAll('[role="button"]')].filter((btn) => {
      if (btn.getAttribute('aria-disabled') === 'true') return false;
      const label = `${btn.getAttribute('aria-label') ?? ''} ${btn.textContent ?? ''}`;
      if (/Switch|Start|Skip|Continue|Dismiss|Try|Add|Toggle|yesterday|complete|Word Gym|Home|Find out|Save|Get started/i.test(label)) {
        return false;
      }
      const r = btn.getBoundingClientRect();
      return r.width > 80 && r.height >= 55 && r.height <= 130 && r.top > 80 && r.top < 760 && r.left > 10;
    });
    tiles[idx]?.click();
  }, index);
}

async function puzzleTileCount(page) {
  return page.evaluate(() => {
    return [...document.querySelectorAll('[role="button"]')].filter((btn) => {
      if (btn.getAttribute('aria-disabled') === 'true') return false;
      const label = `${btn.getAttribute('aria-label') ?? ''} ${btn.textContent ?? ''}`;
      if (/Switch|Start|Skip|Continue|Dismiss|Try|Add|Toggle|yesterday|complete|Word Gym|Home|Find out|Save|Get started/i.test(label)) {
        return false;
      }
      const r = btn.getBoundingClientRect();
      return r.width > 80 && r.height >= 55 && r.height <= 130 && r.top > 80 && r.top < 760 && r.left > 10;
    }).length;
  });
}

async function solvePuzzleRound(page) {
  for (let attempt = 0; attempt < 24; attempt++) {
    const count = await puzzleTileCount(page);
    if (count < 2) break;

    let matched = false;
    for (let i = 0; i < count && !matched; i++) {
      for (let j = i + 1; j < count; j++) {
        await clickPuzzleTile(page, i);
        await page.waitForTimeout(220);
        await clickPuzzleTile(page, j);
        await page.waitForTimeout(900);
        const after = await puzzleTileCount(page);
        if (after < count) {
          matched = true;
          break;
        }
      }
    }
    if (!matched) break;
  }
  await wait(page, 1200);
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  await seedGuest(page);
  await page.getByRole('tab', { name: 'Word Gym' }).click();
  await wait(page, 2500);
  await page.getByRole('button', { name: /Start practice|Practise again/i }).click();
  await wait(page, 2500);

  for (let round = 0; round < 3; round++) {
    await solvePuzzleRound(page);
  }

  await page.waitForURL(/\/ad/, { timeout: 90000 });
  await wait(page, 1500);
  await shot(page, '08-ad-light');

  await page.getByRole('button', { name: /Skip/i }).click();
  await wait(page, 2500);
  await shot(page, '09-gym-success-light');

  await gotoApp(page);
  await wait(page, 3000);
  await ensureDarkMode(page);
  await shot(page, '10-home-dark');

  await page.getByRole('button', { name: 'Try the alarm' }).click();
  await wait(page, 2500);
  await shot(page, '11-alarm-dark');

  await page.getByRole('button', { name: "I'm awake. Let's go." }).click();
  await wait(page, 2000);
  await shot(page, '12-learn-dark');

  await browser.close();
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
