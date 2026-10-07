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
        /Missing (privacy|support) content/,
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
