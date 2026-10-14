import { test } from 'node:test';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';

test('Override packaging deterministic contracts (no credentials or Apple services)', async () => {
  await promisify(execFile)(
    'python3',
    [
      '-m',
      'unittest',
      'discover',
      '-s',
      'tests',
      '-p',
      'override_packaging_test.py',
      '-v',
    ],
    { env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' } },
  );
});
