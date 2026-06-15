/**
 * Vercel build: copy static web app into dist/ and generate public/config.js.
 * Vercel runs a build step but only deploys outputDirectory — index.html must land there.
 */

import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const dist = resolve(root, 'dist');

dotenv.config({ path: resolve(root, '.env') });

rmSync(dist, { recursive: true, force: true });
mkdirSync(resolve(dist, 'lib'), { recursive: true });
mkdirSync(resolve(dist, 'public'), { recursive: true });

cpSync(resolve(root, 'index.html'), resolve(dist, 'index.html'));
cpSync(resolve(root, 'lib'), resolve(dist, 'lib'), { recursive: true });

const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🐦</text></svg>`;
writeFileSync(resolve(dist, 'favicon.svg'), faviconSvg, 'utf8');

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;

if (url && anonKey && !url.includes('YOUR_PROJECT')) {
  const content = `// Auto-generated at Vercel build — do not commit
window.ZAZU_CONFIG = {
  supabaseUrl: ${JSON.stringify(url)},
  supabaseAnonKey: ${JSON.stringify(anonKey)},
};
`;
  writeFileSync(resolve(dist, 'public/config.js'), content, 'utf8');
  console.log('[Zazu] Wrote dist/public/config.js from environment variables');
} else {
  console.warn('[Zazu] SUPABASE_URL / SUPABASE_ANON_KEY not set — demo words only on deploy');
}

console.log('[Zazu] Static build ready in dist/');
