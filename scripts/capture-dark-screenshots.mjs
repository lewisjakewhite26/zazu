/**
 * Capture dark-mode screenshots for all flow screens (except home — already done).
 * Does not modify app code. Waits for theme transition after dark toggle.
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

const THEME_WAIT_MS = 2600;

mkdirSync(OUT, { recursive: true });

async function wait(page, ms = 2000) {
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.waitForTimeout(ms);
}

async function gotoApp(page, path = '/') {
  await page.goto(`${EXPO_BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
}

async function shot(page, name) {
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(OUT, `${name}.png`), fullPage: true });
  console.log(`Saved ${name}.png`);
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

async function ensureDarkMode(page) {
  const toDark = page.getByRole('button', { name: /Switch to dark mode/i });
  if ((await toDark.count()) > 0) {
    await toDark.click();
    await wait(page, THEME_WAIT_MS);
    return;
  }
  const toLight = page.getByRole('button', { name: /Switch to light mode/i });
  if ((await toLight.count()) > 0) return;
  const dev = page.getByRole('button', { name: 'Toggle theme (dev)' });
  if ((await dev.count()) > 0) {
    await dev.first().click();
    await wait(page, THEME_WAIT_MS);
  }
}

async function answerMorningTask(page) {
  const dismiss = page.getByRole('button', { name: 'Dismiss alarm' });
  for (let attempt = 0; attempt < 10; attempt++) {
    if (await dismiss.isVisible().catch(() => false)) return;
    const texts = await page.evaluate(() =>
      [...document.querySelectorAll('div')].filter((el) => {
        const r = el.getBoundingClientRect();
        const t = (el.textContent ?? '').trim();
        return r.height >= 44 && r.height <= 90 && r.width > 200 && t.length > 3 && t.length < 80;
      }).map((el) => el.textContent?.trim()),
    );
    for (const text of texts) {
      if (!text) continue;
      await page.getByText(text, { exact: true }).first().click({ timeout: 3000 }).catch(() => {});
      await wait(page, 800);
      if (await dismiss.isVisible().catch(() => false)) return;
    }
  }
}

async function puzzleTileCount(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('[role="button"]')].filter((btn) => {
      if (btn.getAttribute('aria-disabled') === 'true') return false;
      const label = `${btn.getAttribute('aria-label') ?? ''} ${btn.textContent ?? ''}`;
      if (/Switch|Start|Skip|Continue|Dismiss|Try|Add|Toggle|yesterday|complete|Word Gym|Home|Find out|Save|Get started/i.test(label)) {
        return false;
      }
      const r = btn.getBoundingClientRect();
      return r.width > 80 && r.height >= 55 && r.height <= 130 && r.top > 80 && r.top < 760 && r.left > 10;
    }).length,
  );
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

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  await seedGuest(page);
  await ensureDarkMode(page);

  // Alarm flow (dark) — alarm screen unchanged in code; screenshot only
  await page.getByRole('button', { name: 'Try the alarm' }).click();
  await wait(page, THEME_WAIT_MS);
  await shot(page, '11-alarm-dark');

  await page.getByRole('button', { name: "I'm awake. Let's go." }).click();
  await wait(page, THEME_WAIT_MS);
  await shot(page, '12-learn-dark');

  await page.getByRole('button', { name: 'Continue' }).click();
  await wait(page, THEME_WAIT_MS);
  await shot(page, '04-morning-task-dark');

  await answerMorningTask(page);
  await page.getByRole('button', { name: 'Dismiss alarm' }).click({ timeout: 15000 });
  await wait(page, THEME_WAIT_MS);
  await shot(page, '05-success-dark');

  // Gym flow (dark) — fresh session, keep dark override in memory
  await gotoApp(page);
  await wait(page, 3000);
  await ensureDarkMode(page);

  await page.getByRole('tab', { name: 'Word Gym' }).click();
  await wait(page, THEME_WAIT_MS);
  await shot(page, '06-gym-tab-dark');

  await page.getByRole('button', { name: /Start practice|Practise again/i }).click();
  await wait(page, THEME_WAIT_MS);
  await shot(page, '07-puzzle-dark');

  for (let round = 0; round < 3; round++) {
    await solvePuzzleRound(page);
  }

  await page.waitForURL(/\/ad/, { timeout: 90000 });
  await wait(page, THEME_WAIT_MS);
  await shot(page, '08-ad-dark');

  await page.getByRole('button', { name: /Skip/i }).click();
  await wait(page, THEME_WAIT_MS);
  await shot(page, '09-gym-success-dark');

  // Refresh home dark while we're here
  await gotoApp(page);
  await wait(page, 2000);
  await ensureDarkMode(page);
  await shot(page, '10-home-dark');

  await browser.close();
  console.log(`\nDone — dark screenshots in ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
