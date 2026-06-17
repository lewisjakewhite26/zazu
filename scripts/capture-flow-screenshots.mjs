/**
 * Capture alarm + gym flows (light + dark) per manual QA checklist.
 * Usage: EXPO_PORT=8083 node scripts/capture-flow-screenshots.mjs
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'New SS');
const EXPO_BASE = process.env.EXPO_PORT
  ? `http://localhost:${process.env.EXPO_PORT}`
  : 'http://localhost:8083';

mkdirSync(OUT, { recursive: true });

async function wait(page, ms = 2000) {
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.waitForTimeout(ms);
}

async function gotoApp(page, path = '/') {
  await page.goto(`${EXPO_BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
}

async function shot(page, name) {
  await page.waitForTimeout(400);
  const path = join(OUT, `${name}.png`);
  await page.screenshot({ path, fullPage: true });
  console.log(`Saved ${name}.png`);
}

async function ensureLightMode(page) {
  const toDark = page.getByRole('button', { name: /Switch to dark mode/i });
  if ((await toDark.count()) === 0) {
    const devToggle = page.getByRole('button', { name: 'Toggle theme (dev)' });
    if ((await devToggle.count()) > 0) {
      await devToggle.first().click();
      await wait(page, 2000);
    }
  }
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

async function seedGuest(page) {
  await gotoApp(page);
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('zazu:') || key.includes('supabase')) {
        localStorage.removeItem(key);
      }
    }
    localStorage.setItem('zazu:hasOnboarded', 'true');
    localStorage.setItem('zazu:isAnonymous', 'true');
  });
  await page.reload();
  await wait(page, 3500);
}

/** Click morning-task options until Dismiss alarm appears. */
async function completeMorningTask(page) {
  const dismiss = page.getByRole('button', { name: 'Dismiss alarm' });
  for (let attempt = 0; attempt < 6; attempt++) {
    if (await dismiss.isVisible().catch(() => false)) return;
    const options = page.locator('div').filter({ has: page.getByText(/.{3,}/) });
    const pressables = page.locator('[style*="border"]').filter({ hasText: /.+/ });
    const candidates = page.locator('div').filter({ hasText: /^[^\\n]{4,80}$/ });
    const count = await candidates.count();
    for (let i = 0; i < Math.min(count, 8); i++) {
      const el = candidates.nth(i);
      const box = await el.boundingBox().catch(() => null);
      if (!box || box.height < 40 || box.height > 120) continue;
      await el.click({ force: true }).catch(() => {});
      await wait(page, 800);
      if (await dismiss.isVisible().catch(() => false)) return;
    }
    await page.mouse.click(195, 420);
    await wait(page, 600);
    await page.mouse.click(195, 490);
    await wait(page, 600);
    await page.mouse.click(195, 560);
    await wait(page, 800);
    if (await dismiss.isVisible().catch(() => false)) return;
  }
}

/** Brute-force match puzzle tiles using viewport-scoped DOM clicks. */
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
        if ((await puzzleTileCount(page)) < count) {
          matched = true;
          break;
        }
      }
    }
    if (!matched) break;
  }
  await wait(page, 1200);
}

async function completePuzzle(page) {
  for (let round = 0; round < 3; round++) {
    await wait(page, 1000);
    await solvePuzzleRound(page);
  }
  await wait(page, 2000);
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  await seedGuest(page);
  await ensureLightMode(page);

  // 1. Home (light) — before alarm
  await shot(page, '01-home-light');

  // Alarm flow
  await page.getByRole('button', { name: 'Try the alarm' }).click();
  await wait(page, 2500);
  await shot(page, '02-alarm-light');

  await page.getByRole('button', { name: "I'm awake. Let's go." }).click();
  await wait(page, 2000);
  await shot(page, '03-learn-light');

  await page.getByRole('button', { name: 'Continue' }).click();
  await wait(page, 2000);
  await shot(page, '04-morning-task-light');

  await completeMorningTask(page);
  await wait(page, 1000);
  if (await page.getByRole('button', { name: 'Dismiss alarm' }).isVisible().catch(() => false)) {
    await page.getByRole('button', { name: 'Dismiss alarm' }).click();
    await wait(page, 2500);
  }
  await shot(page, '05-success-light');

  // Gym flow — fresh home
  await gotoApp(page);
  await wait(page, 3000);
  await ensureLightMode(page);

  await page.getByRole('tab', { name: 'Word Gym' }).click();
  await wait(page, 2500);
  await shot(page, '06-gym-tab-light');

  const startBtn = page.getByRole('button', { name: /Start practice|Practise again/i });
  await startBtn.waitFor({ state: 'visible', timeout: 15000 });
  await startBtn.click();
  await wait(page, 2500);
  await shot(page, '07-puzzle-light');

  await completePuzzle(page);
  await page.waitForURL(/\/ad/, { timeout: 60000 }).catch(() => {});
  await wait(page, 1500);
  await shot(page, '08-ad-light');

  await page.getByRole('button', { name: /Skip/i }).click();
  await wait(page, 2500);
  await shot(page, '09-gym-success-light');

  // Dark mode alarm + learn
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
  console.log(`\nDone — screenshots in ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
