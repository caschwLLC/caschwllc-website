import { test } from 'node:test';
import assert from 'node:assert/strict';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import publication from '../src/content/publication.json';
import { launchSchema } from '../src/lib/publication';
import { siteConfig } from '../site.config.mjs';

test('initial publication facts fail closed without owner confirmations', async () => {
  const incomplete = {
    contentAndAssetsApproved: false,
    responsiblePublisher: null,
    effectiveDate: null,
    providerDisclosuresApproved: false,
    deletionGuidanceVerified: false,
    domainAndHostingVerified: false,
  };
  assert.equal(launchSchema.safeParse(incomplete).success, false);
  const run = promisify(execFile);
  if (launchSchema.safeParse(publication).success) {
    await run(process.execPath, ['--import', 'tsx', 'scripts/check-launch.ts']);
    return;
  }
  await assert.rejects(
    run(process.execPath, ['--import', 'tsx', 'scripts/check-launch.ts']),
    (error: unknown) => {
      assert.ok(error instanceof Error && 'stderr' in error);
      assert.match(String(error.stderr), /Public launch is blocked/);
      return true;
    },
  );
});

test('deployment workflow has trusted push and default-disabled gates with immutable pins', async () => {
  const workflow = await readFile('.github/workflows/deploy.yml', 'utf8');
  assert.ok(workflow.includes("vars.PAGES_LAUNCH_APPROVED == 'true'"));
  assert.ok(workflow.includes("vars.PAGES_REVIEW_APPROVED == 'true'"));
  assert.ok(workflow.includes("vars.WEBSITE_MODE == 'production'"));
  assert.ok(workflow.includes("github.event.workflow_run.event == 'push'"));
  assert.ok(
    workflow.includes("github.event.workflow_run.conclusion == 'success'"),
  );
  assert.ok(
    workflow.includes("github.event.workflow_run.head_branch == 'main'"),
  );
  assert.ok(
    workflow.includes(
      'github.event.workflow_run.head_repository.full_name == github.repository',
    ),
  );
  assert.ok(
    workflow.includes('ref: ${{ github.event.workflow_run.head_sha }}'),
  );
  assert.ok(workflow.includes('enablement: false'));
  assert.ok(workflow.includes('scripts/check-launch.ts'));
  assert.ok(!workflow.includes('pull_request_target'));
  for (const file of [
    '.github/workflows/ci.yml',
    '.github/workflows/deploy.yml',
  ]) {
    const yaml = await readFile(file, 'utf8');
    const uses = [...yaml.matchAll(/uses:\s+([^\s]+)/g)].map(
      (match) => match[1],
    );
    assert.ok(uses.length > 0);
    for (const action of uses)
      assert.match(action!, /^[a-z-]+\/[a-z-]+@[a-f0-9]{40}$/);
  }
});

test('review uses repository subpath without approving final policies', async () => {
  assert.deepEqual(siteConfig('review'), {
    mode: 'review',
    site: 'https://caschwllc.github.io',
    base: '/caschwllc-website/',
  });
  assert.deepEqual(siteConfig('production'), {
    mode: 'production',
    site: 'https://caschwllc.org',
    base: '/',
  });
  assert.throws(() => siteConfig('invalid'));
  const run = promisify(execFile);
  const result = await run(
    process.execPath,
    ['--import', 'tsx', 'scripts/check-launch.ts', '--review'],
    { env: { ...process.env, WEBSITE_MODE: 'review' } },
  );
  assert.match(result.stdout, /policies remain drafts/);
  await assert.rejects(
    run(
      process.execPath,
      ['--import', 'tsx', 'scripts/check-launch.ts', '--review'],
      { env: { ...process.env, WEBSITE_MODE: 'production' } },
    ),
  );
});
