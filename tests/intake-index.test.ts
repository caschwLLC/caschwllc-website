import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const docs = new URL('../docs/', import.meta.url);

test('intake index links only to existing repository paths', () => {
  const index = readFileSync(new URL('intake-index.md', docs), 'utf8');
  const targets = [
    ...index.matchAll(/\]\((?!https?:|mailto:|#)([^)#\s]+)/g),
  ].map((match) => match[1] ?? '');
  assert.ok(targets.length > 0, 'Intake index has no source links');
  for (const target of targets)
    assert.ok(
      existsSync(fileURLToPath(new URL(target, docs))),
      `Intake index links to missing ${target}`,
    );
});
