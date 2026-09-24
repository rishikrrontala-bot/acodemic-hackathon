// Loads the live site in a fresh Chromium with 4G-like network throttling (CDP) and reports
// Largest Contentful Paint and console errors. Fails if LCP > 2.5 s or any console error.
import { chromium } from 'playwright';

const url = process.argv[2];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
// "Fast 4G"-like: ~9 Mbps down, 150 ms RTT (Chrome DevTools preset values)
await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (9 * 1024 * 1024) / 8, uploadThroughput: (1.5 * 1024 * 1024) / 8 });
await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(url, { waitUntil: 'load' });
await page.waitForSelector('.headline');
const lcp = await page.evaluate(() => new Promise((resolve) => {
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    resolve(entries[entries.length - 1].startTime);
  }).observe({ type: 'largest-contentful-paint', buffered: true });
  setTimeout(() => resolve(-1), 5000);
}));
await browser.close();
console.log(JSON.stringify({ url, lcpMs: Math.round(lcp), consoleErrors: errors }, null, 2));
if (errors.length) process.exit(1);
if (lcp < 0 || lcp > 2500) process.exit(2);
