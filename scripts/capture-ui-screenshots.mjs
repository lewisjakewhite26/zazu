/**
 * Capture Expo web screenshots at desktop and mobile viewports.
 * Usage: node scripts/capture-ui-screenshots.mjs
 * Requires: dev server on EXPO_PORT (default 8087), npx playwright
 */
import { chromium, devices } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'screenshots', 'ui-audit');
const EXPO_BASE = process.env.EXPO_PORT
  ? `http://localhost:${process.env.EXPO_PORT}`
  : 'http://localhost:8087';

mkdirSync(OUT, { recursive: true });

async function gotoApp(page, path = '/') {
  await page.goto(`${EXPO_BASE}${path}`, {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  });
}

async function waitForApp(page, ms = 2500) {
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.waitForTimeout(ms);
}

async function shot(page, folder, name) {
  const dir = join(OUT, folder);
  mkdirSync(dir, { recursive: true });
  await page.waitForTimeout(400);
  await page.screenshot({
    path: join(dir, `${name}.png`),
    fullPage: true,
  });
  console.log(`  ✓ ${folder}/${name}.png`);
}

async function clearAuth(page) {
  await gotoApp(page);
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('zazu:') || key.includes('supabase')) {
        localStorage.removeItem(key);
      }
    }
  });
}

async function seedGuest(page) {
  await gotoApp(page);
  await page.evaluate(() => {
    localStorage.setItem('zazu:hasOnboarded', 'true');
    localStorage.setItem('zazu:isAnonymous', 'true');
  });
  await page.reload();
  await waitForApp(page);
}

async function captureExpo(context, folder) {
  const page = await context.newPage();
  console.log(`\nExpo → ${folder}`);

  await clearAuth(page);
  await page.reload();
  await waitForApp(page, 2000);
  await shot(page, folder, '01-welcome');

  await page.getByRole('button', { name: 'I already have an account' }).click();
  await waitForApp(page, 1500);
  await shot(page, folder, '02-sign-in');

  await gotoApp(page, '/name');
  await waitForApp(page, 1500);
  await shot(page, folder, '02b-name');

  await seedGuest(page);
  await shot(page, folder, '03-home');

  await page.getByRole('tab', { name: 'Word Gym' }).click();
  await waitForApp(page, 1500);
  await shot(page, folder, '04-gym-locked');

  await page.getByRole('tab', { name: 'Home' }).click();
  await waitForApp(page, 1000);

  await page.getByRole('button', { name: '+ Add alarm' }).click();
  await waitForApp(page, 1200);
  await shot(page, folder, '05-add-alarm');

  await page.goBack();
  await waitForApp(page, 1000);

  await gotoApp(page, '/calendar');
  await waitForApp(page, 1500);
  await shot(page, folder, '06-calendar');

  await gotoApp(page, '/settings');
  await waitForApp(page, 1500);
  await shot(page, folder, '07-settings-guest');

  await gotoApp(page, '/gold');
  await waitForApp(page, 1500);
  await shot(page, folder, '08-gold-paywall');

  await seedGuest(page);
  const tryAlarm = page.getByRole('button', { name: 'Try the alarm' });
  await tryAlarm.scrollIntoViewIfNeeded().catch(() => {});
  await tryAlarm.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  if (await tryAlarm.isVisible()) {
    await tryAlarm.click();
    await waitForApp(page, 2000);
    await shot(page, folder, '09-alarm');

    const wake = page.getByRole('button', { name: "I'm awake. Let's go." });
    if (await wake.isVisible()) {
      await wake.click();
      await waitForApp(page, 1500);
      await shot(page, folder, '10-learn');

      const cont = page.getByRole('button', { name: 'Continue' });
      if (await cont.isVisible()) {
        await cont.click();
        await waitForApp(page, 1500);
        await shot(page, folder, '11-morning-task');
      }
    }
  }

  await page.close();
}

async function main() {
  const scope = process.env.SCOPE ?? 'all';
  console.log(`Expo base: ${EXPO_BASE}`);
  console.log(`Output: ${OUT}`);
  console.log(`Scope: ${scope}`);

  const browser = await chromium.launch();
  const desktop = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    defaultNavigationTimeout: 120000,
  });
  const mobile = await browser.newContext({
    ...devices['iPhone 14'],
    defaultNavigationTimeout: 120000,
  });

  try {
    if (scope === 'all' || scope === 'expo-desktop') {
      await captureExpo(desktop, 'expo-web-desktop');
    }
    if (scope === 'all' || scope === 'expo-mobile') {
      await captureExpo(mobile, 'expo-web-mobile');
    }
  } finally {
    await browser.close();
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
