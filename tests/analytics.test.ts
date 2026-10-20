import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { analyticsConfig } from '../analytics.config.mjs';

test('analytics is absent by default and on review builds; active configuration fails closed', () => {
  assert.equal(analyticsConfig({}), null);
  assert.equal(analyticsConfig({ WEBSITE_MODE: 'production' }), null);
  assert.equal(analyticsConfig({ UMAMI_ENABLED: 'true' }), null);
  assert.throws(() => analyticsConfig({ UMAMI_ENABLED: 'yes' }), /must be/);
  const active = { WEBSITE_MODE: 'production', UMAMI_ENABLED: 'true' };
  assert.throws(() => analyticsConfig(active), /WEBSITE_ID/);
  const identified = {
    ...active,
    UMAMI_WEBSITE_ID: '00000000-0000-0000-0000-000000000001',
  };
  for (const url of [
    'http://cloud.umami.is/script.js',
    'https://cloud.umami.is.evil.example/script.js',
    'https://cloud.umami.is/script.js?key=secret',
    'https://cloud.umami.is/script.js#fragment',
    'https://user@cloud.umami.is/script.js',
  ])
    assert.throws(
      () => analyticsConfig({ ...identified, UMAMI_SCRIPT_URL: url }),
      /approved Umami Cloud endpoint/,
    );
  assert.throws(
    () =>
      analyticsConfig({
        ...identified,
        UMAMI_SCRIPT_URL: 'https://cloud.umami.is/script.js',
      }),
    /approval is missing or stale/,
  );
});

test('policy approval covers behavior, disclosures, account and app privacy completeness', async () => {
  await mkdir('test-results', { recursive: true });
  const root = await mkdtemp(resolve('test-results/analytics-contract-'));
  try {
    for (const path of ['src', 'analytics.config.mjs', 'site.config.mjs'])
      await cp(resolve(path), join(root, path), { recursive: true });
    const { analyticsConfig: config, analyticsPolicyDigest: digest } =
      await import(pathToFileURL(join(root, 'analytics.config.mjs')).href);
    const env = {
      WEBSITE_MODE: 'production',
      UMAMI_ENABLED: 'true',
      UMAMI_WEBSITE_ID: '00000000-0000-0000-0000-000000000001',
      UMAMI_SCRIPT_URL: 'https://cloud.umami.is/script.js',
    };
    const approve = () =>
      writeFile(
        join(root, 'src/content/analytics-publication.json'),
        JSON.stringify({
          approved: true,
          digest: digest(root),
          websiteId: env.UMAMI_WEBSITE_ID,
          scriptUrl: env.UMAMI_SCRIPT_URL,
        }),
      );
    const appPath = join(root, 'src/content/apps/override.json');
    const app = JSON.parse(await readFile(appPath, 'utf8'));
    app.pages.privacy = false;
    await writeFile(appPath, JSON.stringify(app));
    await approve();
    assert.throws(() => config(env, root), /approved privacy policy: override/);
    app.pages.privacy = true;
    await writeFile(appPath, JSON.stringify(app));
    await writeFile(
      join(root, 'src/content/policies/override/privacy.md'),
      'Public test fixture only: not an approved app policy.',
    );
    await approve();
    assert.equal(config(env, root).hostname, 'caschwllc.org');
    assert.throws(
      () =>
        config(
          {
            ...env,
            UMAMI_WEBSITE_ID: env.UMAMI_WEBSITE_ID.replace(/1$/, '2'),
          },
          root,
        ),
      /approval is missing or stale/,
    );
    for (const path of [
      'src/content/policies/website/privacy.md',
      'src/content/policies/override/privacy.md',
      'src/scripts/analytics.js',
      'src/components/WebsitePrivacyNotice.astro',
      'src/components/WebsiteAnalyticsDisclosure.astro',
    ]) {
      const fullPath = join(root, path);
      const before = await readFile(fullPath, 'utf8');
      await writeFile(fullPath, `${before}\nChanged behavior or disclosure\n`);
      assert.throws(() => config(env, root), /approval is missing or stale/);
      await writeFile(fullPath, before);
    }
    assert.equal(config(env, root).hostname, 'caschwllc.org');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
