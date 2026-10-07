import { test, expect } from '@playwright/test';
import { siteConfig } from '../../site.config.mjs';
import { localPath } from '../../src/lib/catalog';

declare global {
  interface Window {
    siteMetrics: { lcp: number; cls: number };
  }
}

test('mobile cold-load LCP, CLS, hero and initial transfer budgets', async ({
  browser,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Mobile lab run only');
  const report = [];
  for (const route of ['/', '/apps/feelory/']) {
    for (let trial = 1; trial <= 3; trial++) {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      });
      const page = await context.newPage();
      await page.addInitScript(() => {
        window.siteMetrics = { lcp: 0, cls: 0 };
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries())
            window.siteMetrics.lcp = entry.startTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (
              'value' in entry &&
              typeof entry.value === 'number' &&
              'hadRecentInput' in entry &&
              !entry.hadRecentInput
            )
              window.siteMetrics.cls += entry.value;
          }
        }).observe({ type: 'layout-shift', buffered: true });
      });
      const cdp = await context.newCDPSession(page);
      await cdp.send('Network.enable');
      await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
      await cdp.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: 150,
        downloadThroughput: 200_000,
        uploadThroughput: 93_750,
        connectionType: 'cellular4g',
      });
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      let totalBytes = 0;
      cdp.on('Network.loadingFinished', (event) => {
        totalBytes += event.encodedDataLength;
      });
      await page.goto(
        `http://127.0.0.1:4321${localPath(route, siteConfig().base)}`,
      );
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      const metrics = await page.evaluate(() => ({
        ...window.siteMetrics,
        heroBytes: performance
          .getEntriesByType('resource')
          .filter((entry) => /phone-(emotion|reflection)-/.test(entry.name))
          .reduce(
            (sum, entry) =>
              sum +
              ('encodedBodySize' in entry &&
              typeof entry.encodedBodySize === 'number'
                ? entry.encodedBodySize
                : 0),
            0,
          ),
      }));
      report.push({
        route,
        trial,
        ...metrics,
        initialTransferBytes: totalBytes,
      });
      expect(metrics.lcp, `${route}: LCP must be observed`).toBeGreaterThan(0);
      expect(metrics.lcp, `${route}: LCP`).toBeLessThanOrEqual(2500);
      expect(metrics.cls, `${route}: CLS`).toBeLessThanOrEqual(0.1);
      expect(metrics.heroBytes).toBeGreaterThan(0);
      expect(metrics.heroBytes).toBeLessThanOrEqual(500_000);
      expect(totalBytes).toBeLessThanOrEqual(1_500_000);
      await context.close();
    }
  }
  await testInfo.attach('mobile-performance.json', {
    body: JSON.stringify(
      {
        conditions:
          'Chromium; 390x844; DPR 2; cold cache; 150ms latency; 1.6Mbps down; .75Mbps up; CPU 4x; 3 trials per route; localhost origin',
        report,
      },
      null,
      2,
    ),
    contentType: 'application/json',
  });
  console.log(JSON.stringify(report));
});
