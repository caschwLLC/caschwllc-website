# Local validation evidence

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
Feelory privacy displays the app's Coming soon notice separately.
The icon test compares the complete 192px PNG pixels to the unchanged genuine SVG
layers in back-to-front order and checks the pale center. All three copied SVG
SHA-256 hashes match the allowed Feelory icon resources. Direct image inspection
confirmed the neutral middle is visible; generated screenshot files were unchanged.
`npx tsx scripts/check-launch.ts --review` passes only for authorized review;
`npx tsx scripts/check-launch.ts` still exits 1 while final confirmations are
missing. Deployment gate/pin tests pass; this is not a real Actions run.

## Browser and accessibility

Chromium desktop: 1440×1000. Mobile: iPhone 13 emulation at 390×844.
All six page bodies passed axe WCAG 2/2.1/2.2 A/AA tagged checks with **zero
violations**, no horizontal overflow, no page errors and **zero external
requests**. Keyboard skip-link activation, navigation/footer paths,
product anchor and reduced motion were exercised. Lazy captures were scrolled
into view and checked for successful loading before final full-page screenshots.
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
