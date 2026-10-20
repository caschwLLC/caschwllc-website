import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  writeFile,
  readFile,
  unlink,
  stat,
  cp,
  mkdir,
  mkdtemp,
  symlink,
  rm,
} from 'node:fs/promises';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import { resolve, join } from 'node:path';
import feelory from '../src/content/apps/feelory.json';
import override from '../src/content/apps/override.json';

const run = promisify(execFile);
const astro = resolve('node_modules/.bin/astro');
const fixture = {
  ...feelory,
  name: 'Public test fixture only',
  slug: 'catalog-contract-fixture',
  visibility: 'draft',
};

test('isolated Astro builds exclude drafts from all discovery and reject malformed or missing content', async () => {
  await mkdir('test-results', { recursive: true });
  const root = await mkdtemp(resolve('test-results/catalog-contract-'));
  const output = join(root, 'out');
  const fixturePath = join(root, 'src/content/apps/__contract-test.json');
  const build = () =>
    run(process.execPath, [astro, 'build', '--outDir', output], {
      cwd: root,
      env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
    });
  try {
    for (const path of [
      'src',
      'public',
      'astro.config.mjs',
      'tsconfig.json',
      'package.json',
      'site.config.mjs',
      'analytics.config.mjs',
    ]) {
      await cp(resolve(path), join(root, path), { recursive: true });
    }
    await symlink(resolve('node_modules'), join(root, 'node_modules'), 'dir');
    await writeFile(fixturePath, JSON.stringify(fixture), { flag: 'wx' });
    await build();
    await assert.rejects(stat(`${output}/apps/${fixture.slug}/index.html`));
    for (const path of [
      'index.html',
      'sitemap.xml',
      'apps/feelory/index.html',
    ]) {
      const html = await readFile(join(output, path), 'utf8');
      assert.ok(!html.includes(fixture.slug) && !html.includes(fixture.name));
    }
    const overridePath = join(root, 'src/content/apps/override.json');
    await writeFile(
      overridePath,
      JSON.stringify({
        ...override,
        status: 'coming-soon',
        distribution: { ...override.distribution, draft: true },
      }),
    );
    await build();
    for (const path of [
      'index.html',
      'apps/override/index.html',
      'apps/override/support/index.html',
    ]) {
      const html = await readFile(join(output, path), 'utf8');
      assert.ok(html.includes('Download coming soon'));
      assert.ok(
        !html.includes('/releases/download/'),
        `${path}: draft release link exposed`,
      );
    }
    await writeFile(overridePath, JSON.stringify(override));
    const privacyPath = join(root, 'src/content/policies/override/privacy.md');
    const privacy = await readFile(privacyPath, 'utf8');
    await unlink(privacyPath);
    await assert.rejects(build(), (error: unknown) => {
      assert.ok(
        error instanceof Error && 'stdout' in error && 'stderr' in error,
      );
      assert.match(
        `${String(error.stdout)}${String(error.stderr)}`,
        /Missing privacy content for override/,
      );
      return true;
    });
    await writeFile(privacyPath, privacy);
    await writeFile(overridePath, JSON.stringify(override));
    for (const [invalid, expected] of [
      [{ ...fixture, hero: undefined }, /hero/],
      [
        {
          ...fixture,
          status: 'available',
          store: { url: 'javascript:alert(1)', verifiedOn: '2026-10-07' },
        },
        /store|url/,
      ],
      [
        { ...fixture, visibility: 'marketed' },
        /Missing (privacy|support|accessibility) content/,
      ],
      [
        {
          ...fixture,
          visibility: 'marketed',
          pages: { ...fixture.pages, privacy: false },
        },
        /Missing approved privacy policy declaration/,
      ],
    ] as const) {
      await writeFile(fixturePath, JSON.stringify(invalid));
      await assert.rejects(build(), (error: unknown) => {
        assert.ok(
          error instanceof Error && 'stdout' in error && 'stderr' in error,
        );
        assert.match(
          `${String(error.stdout)}${String(error.stderr)}`,
          expected,
        );
        return true;
      });
    }
    await unlink(fixturePath);
    await writeFile(
      overridePath,
      JSON.stringify({ ...override, visibility: 'draft' }),
    );
    await build();
    for (const path of [
      'index.html',
      'privacy/index.html',
      '404.html',
      'sitemap.xml',
      'apps/feelory/index.html',
    ]) {
      const html = await readFile(join(output, path), 'utf8');
      assert.ok(
        !/override/i.test(html),
        `${path}: hidden Override artwork or content leaks through shared metadata`,
      );
    }
    await assert.rejects(stat(`${output}/apps/override/index.html`));
    await writeFile(overridePath, JSON.stringify(override));
    await writeFile(
      join(root, 'src/content/apps/feelory.json'),
      JSON.stringify({ ...feelory, visibility: 'draft' }),
    );
    await build();
    await assert.rejects(stat(`${output}/apps/feelory/index.html`));
    for (const path of [
      'index.html',
      'privacy/index.html',
      '404.html',
      'sitemap.xml',
    ]) {
      const html = await readFile(join(output, path), 'utf8');
      assert.ok(
        !/feelory/i.test(html),
        `${path}: hidden app leaks through shared links or metadata`,
      );
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
