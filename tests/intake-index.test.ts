import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmdirSync,
  symlinkSync,
  unlinkSync,
} from 'node:fs';
import { basename, dirname, isAbsolute, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const docs = new URL('../docs/', import.meta.url);
const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const canonicalRoot = realpathSync(repositoryRoot);

function isWithin(root: string, path: string) {
  const difference = relative(root, path);
  return (
    difference !== '..' &&
    !difference.startsWith(`..${sep}`) &&
    !isAbsolute(difference)
  );
}

function assertRepositoryLink(target: string) {
  const path = fileURLToPath(new URL(target, docs));
  assert.ok(
    isWithin(repositoryRoot, path),
    `Intake index links outside the repository: ${target}`,
  );
  assert.ok(existsSync(path), `Intake index links to missing ${target}`);
  assert.ok(
    isWithin(canonicalRoot, realpathSync(path)),
    `Intake index links outside the repository: ${target}`,
  );
}

test('intake index links only to existing repository paths', () => {
  const index = readFileSync(new URL('intake-index.md', docs), 'utf8');
  const targets = [
    ...index.matchAll(/\]\((?!https?:|mailto:|#)([^)#\s]+)/g),
  ].map((match) => match[1] ?? '');
  assert.ok(targets.length > 0, 'Intake index has no source links');
  for (const target of targets) assertRepositoryLink(target);
});

test('intake index rejects missing and out-of-repository paths', () => {
  assert.throws(
    () => assertRepositoryLink('../../outside.md'),
    /links outside the repository/,
  );
  assert.throws(
    () => assertRepositoryLink('../tests/intake-index.test.ts/missing'),
    /links to missing/,
  );
});

test('intake index rejects symlinks that lead outside the repository', () => {
  const temporaryDirectory = mkdtempSync(
    join(repositoryRoot, '.intake-index-'),
  );
  const link = join(temporaryDirectory, 'outside');
  try {
    symlinkSync(
      dirname(canonicalRoot),
      link,
      process.platform === 'win32' ? 'junction' : 'dir',
    );
    assert.throws(
      () => assertRepositoryLink(`../${basename(temporaryDirectory)}/outside`),
      /links outside the repository/,
    );
  } finally {
    if (existsSync(link)) unlinkSync(link);
    rmdirSync(temporaryDirectory);
  }
});
