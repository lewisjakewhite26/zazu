/**
 * Capture home screen in light and dark theme.
 * Usage: node scripts/capture-new-ss.mjs
 * Requires: Expo web on EXPO_PORT (default 8087), playwright
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

async function gotoApp(page, path = '/') {
  await page.goto(`${EXPO_BASE}${path}`, {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  });
}

async function waitForApp(page, ms = 3000) {
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.waitForTimeout(ms);
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
  await waitForApp(page, 3500);
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
  });

  await seedGuest(page);

  // Ensure light mode (button shows "Switch to dark mode" when light)
  const darkModeBtn = page.getByRole('button', { name: /Switch to dark mode/i });
  if ((await darkModeBtn.count()) === 0) {
    await page.getByRole('button', { name: 'Toggle theme (dev)' }).first().click();
    await waitForApp(page, 2500);
  }

  await page.screenshot({
    path: join(OUT, 'home-light.png'),
    fullPage: true,
  });
  console.log('Saved home-light.png');

  await page.getByRole('button', { name: /Switch to dark mode/i }).click();
  await waitForApp(page, 2500);

  await page.screenshot({
    path: join(OUT, 'home-dark.png'),
    fullPage: true,
  });
  console.log('Saved home-dark.png');

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
