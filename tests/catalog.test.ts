import { test } from 'node:test';
import assert from 'node:assert/strict';
import feelory from '../src/content/apps/feelory.json';
import {
  appSchema,
  parseCatalog,
  marketedApps,
  navigation,
  publicRoutes,
  storeAction,
  httpsUrl,
  localPath,
} from '../src/lib/catalog';

const app = appSchema.parse(feelory);

test('coming soon is marketed without a download or store badge', () => {
  assert.equal(marketedApps([app]).length, 1);
  assert.deepEqual(storeAction(app), { label: 'Coming soon', href: null });
  assert.equal(navigation([app])[0]?.label, null);
  assert.deepEqual(publicRoutes([app]), [
    '/',
    '/privacy/',
    '/apps/feelory/',
    '/apps/feelory/privacy/',
    '/apps/feelory/support/',
  ]);
});

test('drafts never enter route discovery or navigation, even when available', () => {
  const draft = appSchema.parse({
    ...feelory,
    slug: 'future-tool',
    visibility: 'draft',
    status: 'available',
    platforms: ['windows'],
    store: {
      url: 'https://apps.microsoft.com/detail/ABC123',
      verifiedOn: '2026-10-07',
    },
  });
  assert.deepEqual(marketedApps([app, draft]), [app]);
  assert.deepEqual(navigation([app, draft]), navigation([app]));
  assert.deepEqual(publicRoutes([app, draft]), publicRoutes([app]));
  assert.deepEqual(publicRoutes([draft]), ['/', '/privacy/']);
});

test('platform groups appear only when real marketed products span Apple and Windows', () => {
  const windows = appSchema.parse({
    ...feelory,
    slug: 'windows-tool',
    platforms: ['windows'],
  });
  assert.deepEqual(
    navigation([app, windows]).map((group) => group.label),
    ['Apple', 'Windows'],
  );
  assert.equal(navigation([windows])[0]?.label, null);
  const both = appSchema.parse({ ...feelory, platforms: ['apple', 'windows'] });
  assert.equal(navigation([both]).length, 2);
});

test('available state requires a verified platform store URL; coming soon forbids it', () => {
  const store = {
    url: 'https://apps.apple.com/us/app/feelory/id6819497727',
    verifiedOn: '2026-10-07',
  };
  const live = appSchema.parse({ ...feelory, status: 'available', store });
  assert.equal(storeAction(live).href, store.url);
  assert.throws(() => appSchema.parse({ ...feelory, status: 'available' }));
  assert.throws(() => appSchema.parse({ ...feelory, store }));
  for (const url of [
    'https://evil.test/app/id6819497727',
    'https://apps.apple.com.evil.test/us/app/feelory/id6819497727',
    'https://apps.microsoft.com/detail/ABC123',
    'https://apps.apple.com/us/app/feelory/id6819497727?redirect=evil',
  ]) {
    assert.throws(() =>
      appSchema.parse({
        ...feelory,
        status: 'available',
        store: { ...store, url },
      }),
    );
  }
  assert.throws(() =>
    appSchema.parse({
      ...feelory,
      status: 'available',
      store: { ...store, verifiedOn: '2026-02-31' },
    }),
  );
});

test('invalid and missing catalog fields fail loudly', () => {
  for (const slug of ['../secret', 'UPPER', 'a/b', 'privacy', '', 'x--x'])
    assert.throws(() => appSchema.parse({ ...feelory, slug }));
  for (const key of [
    'name',
    'visibility',
    'status',
    'platforms',
    'hero',
    'features',
    'compatibility',
    'icon',
  ]) {
    const input: Record<string, unknown> = { ...feelory };
    delete input[key];
    assert.throws(() => appSchema.parse(input), key);
  }
  assert.throws(() => parseCatalog([feelory, feelory]));
  assert.throws(() => appSchema.parse({ ...feelory, status: 'released' }));
  assert.throws(() => appSchema.parse({ ...feelory, platforms: ['linux'] }));
  assert.throws(() => appSchema.parse({ ...feelory, platforms: [] }));
  assert.throws(() =>
    appSchema.parse({ ...feelory, platforms: ['apple', 'apple'] }),
  );
  assert.throws(() =>
    appSchema.parse({ ...feelory, hero: { ...feelory.hero, alt: '' } }),
  );
  assert.throws(() =>
    appSchema.parse({
      ...feelory,
      hero: { ...feelory.hero, name: '../secret' },
    }),
  );
  assert.throws(() =>
    appSchema.parse({ ...feelory, hero: { ...feelory.hero, width: 0 } }),
  );
  assert.throws(() =>
    appSchema.parse({ ...feelory, icon: '//evil.test/icon.png' }),
  );
});

test('unsafe URLs and internal paths are rejected', () => {
  for (const value of [
    'javascript:alert(1)',
    'data:text/html,hi',
    'http://example.com',
    '//example.com',
    'https://user:pass@example.com',
    'https://example.com\\evil',
    ' https://example.com',
  ])
    assert.throws(() => httpsUrl.parse(value), value);
  for (const value of [
    '//evil.test',
    'javascript:evil',
    '/foo\\bar',
    '/foo?bar',
  ])
    assert.throws(() => localPath(value));
  assert.equal(
    localPath('/apps/feelory/', '/caschwllc-website/'),
    '/caschwllc-website/apps/feelory/',
  );
});
