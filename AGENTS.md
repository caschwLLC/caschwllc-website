# Contributor and agent instructions

Work only in this website repository. Never read or import private app source.
The owner authorized a task-specific read-only review of Override for the
analytics/privacy integration. Verify privacy facts only; do not modify the app,
run its builds/workflows, or import private source/internal documents here.
This is not standing permission to inspect other app repositories.
Approved app screenshots and icon artwork may be transferred only with explicit
owner authorization and documented provenance. Do not copy internal planning
packets into the repository.

## Commands

Use Node 22.12+ (22.x) and `npm ci`. Run `npm run verify` before handing off code.
Install browser binaries with `npx playwright install chromium` locally or
`npx playwright install --with-deps chromium` on Linux CI.
`npm run dev` is local development; `npm run build` produces static `dist/`.
Astro telemetry is disabled for CI; use `ASTRO_TELEMETRY_DISABLED=1` locally.

## Invariants

- Brand exactly **caschw LLC**. The owner confirmed this as the legal publisher name.
- One validated app catalog drives all marketed routes, navigation and sitemap.
  Draft apps must not publish. A public repository does not make draft content
  confidential: never add confidential future-product data.
- Feelory is **Coming soon** until a public store listing is verified and a
  verification date is recorded. No release date, inactive badge, fake download
  affordance, pricing, ratings, reviews, award or clinical claims.
- Local-first is not a claim that hosting/email providers collect nothing.
  Maintain explicit opt-in iCloud, write-only Health, optional on-device AI and
  deletion/export/backup distinctions.
- No forms, newsletters, advertising, external fonts, remote embeds, application
  client runtime or remote AI fallback. The sole analytics exception is the
  explicitly enabled, owner-approved production-only Umami integration described
  in `docs/analytics.md`; review hosting and local previews remain untracked.
- Screens are genuine, proportional and unmodified except resizing/encoding.
  Synthetic reflections and saved AI-tag provenance are not live AI evidence.
- Code is MIT; media, branding and copy are not. See `LICENSE` and
  `docs/media-provenance.md` before reusing assets.

## Change discipline

Read `PRODUCT.md`, `DESIGN.md` and relevant docs. Use semantic HTML, accessible
focus/skip links, reduced motion, responsive images and explicit dimensions.
Keep catalogue schema and tests together. Reject invalid data instead of silently
substituting defaults. Update directly related docs.

New public pages must use the shared site layout; new app download/store actions
must use the shared Availability component. This inherits analytics coverage
without per-app scripts. Marketed apps need an approved app privacy policy.
End each app privacy policy with the shared Web privacy section linking to the
site privacy policy. Keep detailed hosting/analytics disclosures in the site
policy, not copied into app policies. Keep website analytics distinct from each
app's actual data handling.

Every change must include a policy-impact review. When collection, event fields,
providers/endpoints, hosting, retention, deletion, consent/DNT or support handling
changes, revise all affected statements, docs and tests in the same change.
Verify app claims from authorized evidence; never infer them from website
behavior or the absence of a search match. Analytics behavior/disclosure changes
invalidate the separate analytics approval digest. Never refresh approval just
to make a build pass: obtain the owner's explicit approval of the revision.
Do not weaken unchanged app privacy promises. Reuse the recorded responsible
publisher and support-handling facts without asking the owner to reconfirm them.
The owner authorizes setting each created or changed policy/page's date to the
actual creation/change date, including adding the Web privacy link. Keep dates
in individual content records; never bump unrelated pages or the global
publication date to date a single-page change.

Do not commit, push, create branches/worktrees, enable Pages, change permissions,
deploy, or change DNS without the user's explicit authorization. The user has
authorized a **public review site only**, and the parent session owns hosting,
commit/push and deployment setup. Preserve dirty user-owned work.
`src/content/review-publication.json` records that narrow authorization;
`PAGES_REVIEW_APPROVED=true` admits only the repository-URL review build.
`src/content/publication.json`, production mode and `PAGES_LAUNCH_APPROVED`
remain independent final-domain publication barriers. Owner-approved policy
text is recorded in `src/content/policy-publication.json`; never label it draft
or under review because the app is unreleased or domain gates are incomplete.
Privacy pages omit the shared review banner. Never infer store release, legal
identity or an effective date from policy approval.
