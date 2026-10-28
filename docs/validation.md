# Local validation evidence

## Feelory App Store availability — 2026-10-28

The owner reported that Feelory is live. The public listing
`https://apps.apple.com/us/app/feelory-app/id6819497727` was fetched on
2026-10-28: title Feelory App, iPhone, iPad and Mac (Designed for iPad),
copyright caschw LLC, privacy label "Data Not Collected", consistent with the
Feelory privacy policy. Price, ratings and reviews are not published on the site.
The catalog records `status: available` and `verifiedOn: 2026-10-28`.
No app build, App Store Connect change, commit, push or deployment was performed.

## Override 0.1.1 download follow-up — 2026-10-19

The owner confirmed that 0.1.1 is published and requested the website version and
download update. Authenticated metadata verified release `417587950`, tag
`override-v0.1.1`, `draft: false`, `prerelease: true`. The final anonymous
redirect-following HEAD request returned HTTP 200 for `Override-0.1.1.dmg`.
Asset `657022500` is 3,268,580 bytes; GitHub reports SHA-256
`0393b1d1bde0d93e1843d5ce3474aa8f043c43e4be658e7da53e2c25f94e307c`.
No installer was executed or repackaged.

The catalog now uses version 0.1.1, matching tag and DMG filename, and verification
date 2026-10-19. Homepage/product/support labels and download links derive from
that record; the support installation filename, product facts, documentation and
regression expectations were updated together. Earlier evidence below remains
a historical record, not the current distribution.

| Exact command                                                       | Result                                                                                                                                                |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ASTRO_TELEMETRY_DISABLED=1 npm run verify`                         | Passed: check/lint clean, 17 unit/build-contract tests, 9 public routes plus 404, 53 browser tests passed and 1 intentional desktop performance skip. |
| `WEBSITE_MODE=production ASTRO_TELEMETRY_DISABLED=1 npm run verify` | Passed with the same counts, including exact 0.1.1 download hrefs and installation filenames.                                                         |

The existing local preview serves the updated 0.1.1 support page. The PR remains
draft; this version/download authorization does not authorize website merge or
deployment. No release, packaging workflow, signing, permission or hosting
configuration was changed.

## Override W2/M2 refresh — 2026-10-19

Prepared for the next release as a draft PR, not as publication authorization.
The website's published 0.1.0 distribution record, versioned installation steps,
download URL, global favicon and publication configuration are unchanged.

On macOS/Apple silicon with Node 22.23.2 and the existing locked dependencies:

| Exact command                                                       | Result                                                                                                                                                                                         |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CAPTURE_VISUAL_REVIEW=1 ASTRO_TELEMETRY_DISABLED=1 npm run verify` | Passed: Astro and lint clean, 16 unit/build-contract tests, 9 public routes plus 404, 53 browser tests passed with 1 intentional desktop performance skip. Captured the website visual matrix. |
| `ASTRO_TELEMETRY_DISABLED=1 npm run verify`                         | Passed on the final current-main baseline: 17 unit/build-contract tests, 9 public routes plus 404, 53 browser tests passed with 1 intentional desktop performance skip; check/lint clean.      |
| `WEBSITE_MODE=production ASTRO_TELEMETRY_DISABLED=1 npm run verify` | Passed on the final current-main baseline with the same counts, checking root-based URLs and social metadata. No deployment.                                                                   |

The captured website source is identical to the final website source; the
current-main baseline additionally contains the existing deterministic packaging
unit test, explaining the 16-to-17 count change. Those tests use mocks, no
credentials or Apple services. No installer packaging workflow or real packaging
command was run.

All 12 imported files match the approved handoff checksums. Tests check icon
dimensions, sRGB/ICC/alpha, transparent corners, the legacy W2 alias and the
1200×630 social card. Catalog tests reject incomplete or unsafe artwork
declarations. Isolated builds exclude hidden Override content/artwork from
discovery and metadata. Browser checks compare inline SVG path markup with the
original files and verify unique IDs and local clip-path references.

Homepage and product icons select the exact 64/128/192px source in both appearance
preferences at device pixel ratios 1, 2 and 3, in wide and narrow contexts.
Checks measure loaded `currentSrc`, decoded raster dimensions and CSS dimensions,
not just declared srcsets. No added rounding, padding, border, filter, shadow or
clipping mask is applied. The site keeps its existing page colors; dark
preference selects dark artwork rather than introducing a new global theme.

All three Override routes have absolute website-hosted Open Graph/Twitter image
URLs, dimensions and alt text; the caschw LLC favicon is unchanged. State guides
are static semantic text with decorative currentColor glyphs, valid help anchors
and the exact Accessibility-missing > paused > stashed > ready priority.
Light/dark route checks passed axe with zero violations. Existing keyboard,
no-runtime, no-external-request, overflow and reduced-motion checks also pass.
The 320px layouts pass both appearance preferences and 200% body-text scaling.
These checks do not certify app accessibility or every browser/assistive tool.

One batched visual review inspected the homepage, product and help layouts,
including light/dark and desktop/mobile examples, native-density icon crops
and the supplied social card. No corrective visual pass was needed. Review
captures are archived outside the repository in the implementing session's
`files/override-visual-review/` directory, including the six appearance/density
combinations. No app screenshot or installation illustration existed in the
website to replace, and no application UI was fabricated.

The Impeccable mechanical scan of the changed UI files returned 46 advisory CSS
scale matches (exit 2): existing font/color/radius values, plus the two guide
heading rules that deliberately reuse the incumbent utility/reading ramp.
These are contextually intentional matches, not broken layout or contrast
findings. The guide ramp is documented in `DESIGN.md`; no detector suppression
or unrelated design-system changes were added. Hook matches on the unchanged
Feelory fixture color and the validator's image-matching regex likewise describe
test/source text, not new rendered defects.

Final mobile localhost performance: Override LCP 408–420ms in review and
416–420ms in production, CLS 0, initial transfer 23,700/23,614 bytes respectively.
Homepage and Feelory retained all existing budgets. These are laboratory
measurements, not public-host performance claims.

**Publication hold at initial handoff:** the new branding and menu bar guide
initially retained 0.1.0 pending release verification. The owner subsequently
confirmed publication of 0.1.1 and authorized the verified distribution update
below. Keep the PR draft and unmerged until the owner explicitly authorizes
coordinated website publication. Successful main push CI can trigger the existing deployment.
No release, signing, packaging workflow, credentials, release assets, hosting,
DNS, permissions or download links were changed.

## Override beta addition — 2026-10-14

On macOS/Apple silicon with Node 22.23.2 and the existing locked dependencies:

| Exact command                                                       | Result                                                                                                                                                                        |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CAPTURE_VISUAL_REVIEW=1 ASTRO_TELEMETRY_DISABLED=1 npm run verify` | Passed: Astro check clean, ESLint/Prettier clean, 14 unit/build-contract tests, 9 public routes plus 404, 33 browser tests passed and 1 intentional desktop performance skip. |
| `WEBSITE_MODE=production ASTRO_TELEMETRY_DISABLED=1 npm run verify` | Passed with the same counts, covering root-based routes and metadata rather than the review repository subpath. No deployment performed.                                      |

The new catalog tests cover the exact public beta DMG, matching version/tag/asset,
unsafe or unverified distribution rejection, and a draft release with no
download href. Isolated builds exercise that unavailable state on the homepage,
product and support pages and reject missing declared privacy content.
The shared website privacy index now lists only declared app policies; its
opening description was adjusted to describe published policies rather than
assert a policy exists for every marketed app. Existing approved policy status,
publisher facts, effective dates, and substantive provider/deletion terms are
unchanged.

Browser coverage includes all three Override routes, home discovery, contextual
navigation, exact installation order, quit-before-upgrade, uninstall caveats,
user-granted permission guidance, and absent unapproved privacy links/routes.
All route axe checks reported zero violations in desktop and mobile Chromium;
keyboard skip navigation, no horizontal overflow, no page errors and no
unexpected external requests passed. Additional Override checks passed at 320px
and 200% body-text scaling. These automated checks are not accessibility
certification or an app-level assistive-technology test.

One batched desktop/mobile visual inspection and a confirmation pass covered the
homepage, Override overview and both subpages. A download-link contrast conflict
between reading and button styles was corrected before the successful checks.
Screenshots are preserved outside the repository in the implementing session's
`files/override-visual-review/` directory.

Under the existing mobile cold-load lab conditions, Override LCP was 544–604ms
in review and 544–616ms in production, CLS was 0, and initial transfer was
6,501 / 6,417 bytes respectively. Override requests no hero image. Homepage and
Feelory also remained within all existing performance/media budgets.
These are localhost laboratory measurements, not public-host performance claims.

Authenticated release metadata confirmed `override-v0.1.0` is public and marked
prerelease; an anonymous redirect-following HEAD request to the exact final
`Override-0.1.0.dmg` returned HTTP 200. This session did not publish or modify the
release. No app build, installation, macOS permission changes, commit, push, PR,
hosting change or deployment was performed. The Override privacy draft remains
an unpublished session artifact pending separate approval.

## Earlier validation

Validated on 2026-10-07, macOS/Apple Silicon, Node 22.23.2, using locked
dependencies. No GitHub CI/deployment, public CDN, DNS, live certificate, or
App Store availability validation has been performed by this implementation.

## Commands and results

`ASTRO_TELEMETRY_DISABLED=1 npm run verify` completed successfully:

| Check                   | Result                                                                   |
| ----------------------- | ------------------------------------------------------------------------ |
| `npm run check`         | 0 errors, warnings or hints                                              |
| `npm run lint`          | ESLint and Prettier pass                                                 |
| `npm test`              | 12 unit/build/launch/icon-contract tests pass                            |
| `npm run build`         | 6 static pages plus sitemap/robots                                       |
| `npm run validate:site` | 5 public routes + 404; links, metadata, discovery and media budgets pass |
| `npm run test:browser`  | 17 pass, 1 intentional desktop skip for mobile-only performance lab      |

Real Astro build tests use an isolated temporary copy of this website and add a
public-safe draft fixture to verify its absence from homepage, routes and
discovery. They also mark Feelory itself draft to verify that shared links,
policy references and social metadata expose no hidden product.
Separate malformed/missing-data
and unsafe-store-URL fixtures must fail builds; a marketed fixture without
policy/support also must fail. The exact temporary project is removed afterward;
the user's source catalog is never edited by the tests.
These checks do not commit a future product.

Both `npm run verify` (default review) and `WEBSITE_MODE=production npm run verify`
passed after the owner-approved policy and icon corrections. Review routes/assets/canonical
and sitemap use `/caschwllc-website/` on the normal Pages host. Review has
noindex and a banner on non-policy pages only. Policy text is owner-approved.
Rendered policy HTML and browser checks reject policy draft/unapproved labels,
public-review banners and review metadata in both modes; legitimate journal
draft and correspondence review descriptions remain part of the policy.
Coming soon apps display an availability notice on their privacy page;
Feelory no longer does.
The icon test compares the complete 192px PNG pixels to the unchanged genuine SVG
layers in back-to-front order and checks the pale center. All three copied SVG
SHA-256 hashes match the allowed Feelory icon resources. Direct image inspection
confirmed the neutral middle is visible; generated screenshot files were unchanged.
`npx tsx scripts/check-launch.ts --review` passes only for authorized review;
`npx tsx scripts/check-launch.ts` still exits 1 while final confirmations are
missing. Deployment gate/pin tests pass; this is not a real Actions run.

## Browser and accessibility

The Feelory accessibility page was added and revalidated on 2026-10-12 with
`CAPTURE_VISUAL_REVIEW=1 ASTRO_TELEMETRY_DISABLED=1 npm run verify`: 12
unit/build-contract tests passed, 6 public routes plus 404 passed site
validation, and browser tests reported 23 passed with 1 intentional desktop
performance-test skip. Axe found zero violations across all route checks at
desktop and mobile sizes and on the accessibility page in dark appearance.
The new page also passed checks at 320px width, 200% text scaling, keyboard
skip/focus, and light/dark screenshot selection. These automated checks are not
a certification of WCAG conformance.

Chromium desktop: 1440×1000. Mobile: iPhone 13 emulation at 390×844.
In the 2026-10-07 browser run, all six page bodies passed axe WCAG 2/2.1/2.2
A/AA tagged checks with **zero violations**, no horizontal overflow, no page
errors and **zero external requests**. Keyboard skip-link activation,
navigation/footer paths, product anchor and reduced motion were exercised.
Lazy captures were scrolled into view and checked for successful loading
before final full-page screenshots.
Unknown routes return an actual local 404 response with the accessible custom
body, including a 320px-wide check.

One batched desktop/mobile visual review prompted a single mobile homepage
composition adjustment and a lazy-image screenshot capture correction. One
confirmation round verified the complete images, reading measure, responsive
layout and unchanged product truth. No open-ended visual-polish loop.

Automated axe and keyboard checks are not a certification of WCAG conformance.
Manual VoiceOver, all screen-reader/browser combinations, Windows font rendering
and real hardware have **not** been measured. Safari/Firefox are not included in
this Chromium run.

## Performance and media

Repeatable local lab: Chromium, 390×844, DPR 2, cold cache, 150ms network
latency, 1.6Mbps down / 0.75Mbps up, CPU throttled 4× through CDP, three trials
per opening route, no interaction or scrolling during measurement.

| Route                       | LCP range | Median LCP | CLS | Initial transfer | Combined selected heroes |
| --------------------------- | --------- | ---------- | --- | ---------------- | ------------------------ |
| Review `/`                  | 412–428ms | 412ms      | 0   | 108,603 bytes    | 91,170 bytes             |
| Review `/apps/feelory/`     | 416–432ms | 420ms      | 0   | 163,330 bytes    | 91,170 bytes             |
| Production `/`              | 404–412ms | 412ms      | 0   | 108,500 bytes    | 91,170 bytes             |
| Production `/apps/feelory/` | 432–452ms | 436ms      | 0   | 163,223 bytes    | 91,170 bytes             |

Limits: LCP ≤2.5s, CLS ≤0.1, initial transfer ≤1,500,000 bytes, combined hero
images ≤500,000 bytes. All twelve trials passed. These are localhost laboratory
results, **not public-host field performance or a customer-facing claim**.
LCP reflects the largest content visible in the initial mobile viewport.
Transfer includes the document, CSS, icon and images requested without scrolling.

All 18 responsive WebPs total 793,790 bytes. Largest image: 98,276 bytes.
Selected source hashes, natural dimensions and output byte sizes are in
`public/media/manifest.json`. System fonts generate no font requests.

## Evidence locations

`playwright-report/index.html` and `test-results/` contain ignored, local browser
evidence including the attached `mobile-performance.json`. Final visual-review
screenshots are separately archived in the implementing session's
`files/website-visual-review/` artifact directory. Set
`CAPTURE_VISUAL_REVIEW=1 npm run test:browser` when an explicitly needed visual
review should produce fresh screenshots; normal validation avoids extra capture
rounds.
`dist/` contains the persistent local static build. These generated artifacts
are not source files to commit. Rerunning Playwright replaces its evidence.

## Remaining blockers

The exact-version dependency follow-up reran `ASTRO_TELEMETRY_DISABLED=1 npm run
verify` successfully: 9 unit/build tests, 17 browser tests and 1 intentional skip.
The configured registry returned E404 for `source-map-js@1.2.2`, although upstream
advisory metadata confirms that patch exists. No package or lockfile change was
made. Fresh `npm audit --json` attempts failed at the provider endpoint (HTTP 400,
then ECONNRESET twice); the previous successful audit remains the last findings
evidence. See [dependency review](dependencies.md) for exact commands and scope.

See [privacy gates](privacy.md), [deployment and DNS](deployment.md) and
[dependency advisories](dependencies.md). Responsible publisher/effective date,
final provider/content approvals, DNS delegation readiness and separately
authorized final custom-domain launch remain unresolved. These are **not**
blockers to the user-authorized repository-URL review publication handled by the parent. Feelory in-app policy/support
links remain a separate app change.

# Minimal website analytics (staged, disabled)

Owner-directed privacy separation follow-up: approved app policy routes now end
with a short Web privacy link; only the website policy renders detailed
build-selected analytics disclosures. Removed the duplicated Feelory website
paragraph. Browser fixtures assert final-section placement, site-policy links
and absence of Umami details in app-policy prose, including a future-app fixture.
The private session Override draft now uses the owner-directed privacy-safe
diagnostics explanation and explicitly distinguishes in-app loss on quit from
already exported copies. It remains unpublished and awaiting its other approvals.
Both full verification commands below passed again after this change (19
unit/build-contract tests, 69 browser passes, one intentional skip per mode).

The repository variables were read back successfully: the supplied public UUID,
`https://cloud.umami.is/script.js`, and `UMAMI_ENABLED=false`. No setting was
changed by the implementation. The analytics-specific approval record remains
false; Override's app privacy draft and evidence stay outside the repository.
No merge, publication, DNS change, app build or installer packaging occurred.

Commands and final results:

- `UMAMI_ENABLED=false ASTRO_TELEMETRY_DISABLED=1 npm run verify` -- passed:
  type check and lint clean, 19 unit/build-contract tests passed, built-site
  checks passed, 69 browser tests passed and the existing desktop-only
  performance case intentionally skipped.
- `UMAMI_ENABLED=false WEBSITE_MODE=production ASTRO_TELEMETRY_DISABLED=1 npm run verify`
  -- passed with the same counts.
- `UMAMI_TRACKER_TEST_FILE=<session-artifact>/umami-tracker.js npx playwright test tests/browser/analytics.spec.ts --project=desktop`
  -- passed all 8 tests against the fetched actual Cloud tracker. Every script,
  collection, installer and store request was intercepted; no real account
  events or actual downloads were generated. The fixture runs the enabled
  production built-site validator as well as browser assertions.
- The documented read-only GitHub release-asset command returned the public
  0.1.0 and 0.1.1 DMG counters. Counts are cumulative and are not pinned in docs.
- `git diff --check` -- passed before this documentation-only record.

Enabled-production tests use isolated public-safe future-app/policy/page fixtures
and a dummy UUID/approval. They verify inherited coverage, exactly one sanitized
page/event payload, future store clicks, DNT, 404 exclusion, localhost/review/
unapproved-host guards, JavaScript-disabled links, and native ordinary/keyboard/
modified/middle-click download requests with loaded, blocked and stalled
trackers. Fixture approvals do not approve the real site.

The actual tracker transfer measured **2,333 bytes gzip** (4,810 decoded bytes)
with `Accept-Encoding: gzip`, below the proposed 10 KB compressed tracker budget.
The local inline loader adds no separate request. A first tracked page requires
the vendor script and one collection request; an eligible click adds a collection
request. This is a measurement of the inspected script, not a permanent size
guarantee. The external Cloud URL is mutable and its bytes are not covered by
the local policy digest; review vendor behavior changes separately.

The design hook's broken-image finding in `scripts/validate-site.ts` is a false
positive on the existing image-validation regular expression, not an image
element in rendered UI. No suppression or unrelated design change was added.

At this initial validation checkpoint, Override's app-data and policy-date
questions were still pending. The owner confirmations below supersede those
questions. Analytics-specific approval and live activation remain separate.

## Owner-confirmed app privacy and page-specific dates (2026-10-19)

The owner confirmed Override's optional diagnostics behavior and absence of
automatic update checks, remote services, crash reporting service, telemetry
and third-party SDKs. The new app privacy policy is wired through the catalog,
product/support/accessibility links and sitemap. Diagnostics are off by default,
privacy-safe, in memory only and discarded immediately on quit; copying requires
the user's explicit action after enabling diagnostics. Exported copies remain
separate.

Each app policy ends with the shared Web privacy link; detailed website
analytics disclosures remain only in the website policy. Website, Feelory and
Override privacy pages have individual effective dates of 2026-10-19.
Override support and accessibility pages have that updated date. Unchanged
pages and the global publication date retain their existing dates. Contributor
instructions record the owner's authorization to reuse established publisher
and support facts and date only pages actually created or changed.

Commands and results after these changes:

- `UMAMI_ENABLED=false ASTRO_TELEMETRY_DISABLED=1 npm run verify` -- passed:
  type check and lint clean, 19 unit/build-contract tests passed, built-site
  checks passed, 73 browser tests passed and one intentional skip.
- `UMAMI_ENABLED=false WEBSITE_MODE=production ASTRO_TELEMETRY_DISABLED=1 npm run verify`
  -- passed with the same counts.

Analytics remains disabled with its approval record false. No commit, push,
deployment, release publication or app packaging occurred. Remaining live
acceptance requires explicit analytics-disclosure approval, separately
authorized production activation/deployment and Umami Realtime verification,
not repeated confirmation of resolved app facts or policy dates.

## Analytics approval (2026-10-20)

The owner explicitly approved the documented analytics behavior and disclosure.
The separate approval record now binds the current source fingerprint to the
configured Umami website ID and Cloud script URL. The repository variable
remains `UMAMI_ENABLED=false`; approval does not itself start collection.

`UMAMI_ENABLED=true UMAMI_WEBSITE_ID=<configured-public-id> UMAMI_SCRIPT_URL=https://cloud.umami.is/script.js WEBSITE_MODE=production ASTRO_TELEMETRY_DISABLED=1 npm run verify`
passed: type/lint clean, 19 unit/build-contract tests, built-site checks,
73 browser passes and one intentional skip. Browser tests run locally on an
untracked hostname or intercept vendor requests; no live account events were
sent. Catalog mutation fixtures explicitly disable analytics so their intended
content-validation failures are not preempted by the policy fingerprint guard.

## Full-site dark appearance (2026-10-28)

All public pages and the 404 now follow `prefers-color-scheme: dark` through
shared CSS tokens; previously only screenshots, the Override icon and the
accessibility page adapted. The Override dark icons already in `public/media/`
are byte-identical to the Override repository's website export, so no new
artwork was needed. A browser test emulates dark appearance on every route,
checking root background/text colors, `color-scheme` and dark `theme-color`
metadata, zero axe WCAG 2.2 AA violations, tinted chapter fields, skip link,
review banner and both apps' button default/hover colors.

Policy impact: presentation only. No collection, event fields, providers,
hosting, retention, consent or support handling changed. `Site.astro` and
`Reading.astro` are part of the analytics fingerprint, so the recorded approval
digest no longer matches and needs the owner's explicit re-approval before
production analytics can be enabled.
