// Capture a site into sites/<slug>/: hero, scroll stills, a phone shot, and motion frames.
// usage: npm run shoot -- <slug> <url> [--wait=6000] [--steps=4] [--step=900] [--frames=16] [--click=x,y]
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const [slug, url, ...rest] = process.argv.slice(2);
if (!slug || !url) {
  console.error('usage: npm run shoot -- <slug> <url> [--wait=ms] [--steps=n] [--step=px] [--frames=n] [--click=x,y]');
  process.exit(1);
}
const opt = Object.fromEntries(rest.map(a => a.replace(/^--/, '').split('=')));
const wait = +(opt.wait ?? 6000);
const steps = +(opt.steps ?? 4);
const step = +(opt.step ?? 900);
const frames = +(opt.frames ?? 16);
const click = opt.click ? opt.click.split(',').map(Number) : null;

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '..');
const dir = path.join(root, 'sites', slug);
const framesDir = path.join(root, '.frames', slug);
fs.mkdirSync(dir, { recursive: true });
fs.rmSync(framesDir, { recursive: true, force: true });
fs.mkdirSync(framesDir, { recursive: true });

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
].find(p => fs.existsSync(p));

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=d3d11', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required', '--hide-scrollbars'],
});

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Decline cookie banners where a plain "reject" button exists; otherwise hide them. Never accept.
async function declineCookies(page) {
  for (const re of [/reject all/i, /decline/i, /only (strictly )?necessary/i, /essential only/i, /refuse/i, /^reject$/i]) {
    const b = page.getByRole('button', { name: re }).first();
    if (await b.isVisible().catch(() => false)) { await b.click().catch(() => {}); await sleep(600); break; }
  }
  await page.addStyleTag({ content: `
    #onetrust-consent-sdk, #CybotCookiebotDialog, #usercentrics-root, .cc-window, .cky-consent-container,
    [id*="cookie" i]:not(html):not(body), [class*="cookie" i]:not(html):not(body),
    [id*="consent" i]:not(html):not(body), [class*="consent" i]:not(html):not(body),
    [aria-label*="cookie" i][role="dialog"], [aria-label*="consent" i] { display: none !important; }
  ` }).catch(() => {});
}

async function shot(page, file, q = 82) {
  await page.screenshot({ path: path.join(dir, file), type: 'jpeg', quality: q });
}

// Desktop
const desk = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
const page = await desk.newPage();
const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(e => console.warn('goto:', e.message));
await sleep(wait);
await declineCookies(page);

// Stack fingerprint: response headers, globals, fonts, weight.
const headers = res ? res.headers() : {};
const fp = await page.evaluate(() => {
  const w = window, q = s => document.querySelector(s);
  const libs = [];
  if (w.__THREE__ || w.THREE) libs.push('three.js r' + (w.__THREE__ || w.THREE.REVISION));
  if (w.gsap) libs.push('GSAP ' + (w.gsap.version || ''));
  if (w.ScrollTrigger) libs.push('ScrollTrigger');
  if (w.Lenis || document.documentElement.classList.contains('lenis')) libs.push('Lenis');
  if (w.PIXI) libs.push('PixiJS');
  if (w.barba) libs.push('Barba');
  if (w.__NEXT_DATA__ || q('script[src*="/_next/"]')) libs.push('Next.js');
  if (w.__NUXT__ || w.$nuxt || q('#__nuxt')) libs.push('Nuxt');
  if (q('astro-island, [data-astro-cid], script[src*="/_astro/"], link[href*="/_astro/"]')) libs.push('Astro');
  if (q('[class*="svelte-"]')) libs.push('Svelte');
  if (q('[data-wf-site]')) libs.push('Webflow');
  if (q('script[src*="framer"], [data-framer-hydrate-v2]')) libs.push('Framer');
  if (w.Shopify) libs.push('Shopify');
  if (q('link[href*="squarespace"], script[src*="squarespace"]')) libs.push('Squarespace');
  if (q('link[href*="wp-content"], script[src*="wp-content"]')) libs.push('WordPress');
  const gen = q('meta[name="generator"]');
  if (gen) libs.push('generator: ' + gen.content);
  const fonts = [...new Set([...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replace(/["']/g, '')))]
    .filter(f => !/fallback/i.test(f));
  const canvases = [...document.querySelectorAll('canvas')].filter(c => c.width * c.height > 40000).map(c => `${c.width}x${c.height}`);
  const nav = performance.getEntriesByType('navigation')[0];
  const resources = performance.getEntriesByType('resource');
  const kb = n => Math.round(n / 1024);
  const sum = f => resources.filter(f).reduce((a, r) => a + (r.transferSize || r.encodedBodySize || 0), 0);
  return {
    libs, fonts: fonts.slice(0, 8), canvases,
    weightKB: { total: kb(sum(() => true) + (nav ? nav.transferSize : 0)), js: kb(sum(r => r.initiatorType === 'script' || /\.m?js(\?|$)/.test(r.name))),
      img: kb(sum(r => /\.(jpe?g|png|webp|avif|gif|svg)(\?|$)/.test(r.name))), font: kb(sum(r => /\.(woff2?|ttf|otf)(\?|$)/.test(r.name))),
      video: kb(sum(r => /\.(mp4|webm|m3u8)(\?|$)/.test(r.name))) },
    requests: resources.length,
    reducedMotionCSS: [...document.styleSheets].some(s => { try { return [...s.cssRules].some(r => r.conditionText && r.conditionText.includes('prefers-reduced-motion')); } catch { return false; } }),
  };
}).catch(e => ({ error: e.message }));
fp.server = [headers['server'], headers['x-powered-by'], headers['x-vercel-id'] && 'Vercel', headers['x-nf-request-id'] && 'Netlify', headers['cf-ray'] && 'Cloudflare'].filter(Boolean).join(' · ');
if (click) { await page.mouse.click(click[0], click[1]); await sleep(1500); }

// Motion frames at the hero: the cursor drifts so pointer-driven scenes move.
for (let i = 0; i < frames; i++) {
  const t = i / Math.max(1, frames - 1);
  await page.mouse.move(360 + 720 * t, 330 + 240 * Math.sin(t * Math.PI));
  await page.screenshot({ path: path.join(framesDir, `f${String(i).padStart(2, '0')}.jpg`), type: 'jpeg', quality: 80 });
  await sleep(140);
}
await shot(page, '01-hero.jpg');

// Scroll stills: wheel events, so scroll-driven WebGL sites advance too.
for (let i = 0; i < steps; i++) {
  for (let k = 0; k < 6; k++) { await page.mouse.wheel(0, step / 6); await sleep(90); }
  await sleep(1600);
  await shot(page, `${String(i + 2).padStart(2, '0')}-scroll.jpg`);
}
const title = await page.title().catch(() => '');
const finalUrl = page.url();
await desk.close();

// Phone
const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' });
const mp = await phone.newPage();
await mp.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(e => console.warn('phone goto:', e.message));
await sleep(wait);
await declineCookies(mp);
await mp.screenshot({ path: path.join(dir, 'phone.jpg'), type: 'jpeg', quality: 78 });
await phone.close();

await browser.close();

const metaFile = path.join(dir, 'meta.json');
const prev = fs.existsSync(metaFile) ? JSON.parse(fs.readFileSync(metaFile, 'utf8')) : {};
fs.writeFileSync(metaFile, JSON.stringify({ ...prev, slug, url, finalUrl, title, captured: new Date().toISOString().slice(0, 10), stack: fp }, null, 2) + '\n');
console.log(`shot ${slug}: hero + ${steps} scroll + phone + ${frames} frames -> ${path.relative(root, dir)}`);
