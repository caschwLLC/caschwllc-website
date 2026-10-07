import { launchSchema } from '../src/lib/publication';
import publication from '../src/content/publication.json';
import reviewPublication from '../src/content/review-publication.json';
import { siteConfig } from '../site.config.mjs';

if (process.argv.includes('--review')) {
  if (
    siteConfig().mode !== 'review' ||
    !reviewPublication.userAuthorizedPublicReview ||
    reviewPublication.target !==
      'https://caschwllc.github.io/caschwllc-website/'
  ) {
    throw new Error(
      'Review publication requires explicit review authorization and the repository Pages target',
    );
  }
  console.log(
    'User-authorized public review only; policies remain drafts and final launch gates are unchanged.',
  );
  process.exit(0);
}

const result = launchSchema.safeParse(publication);
if (!result.success) {
  console.error(
    'Public launch is blocked. Owner approval and verified facts are required:',
  );
  for (const issue of result.error.issues)
    console.error(`- ${issue.path.join('.')}: ${issue.message}`);
  process.exitCode = 1;
} else {
  console.log(
    'Content launch gates are complete. Separate deployment authorization and domain setup still apply.',
  );
}
