# Contributor and agent instructions

Work only in this website repository. Never read or import private app source.
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

- Brand exactly **caschw LLC**. This display brand is not a verified legal name.
- One validated app catalog drives all marketed routes, navigation and sitemap.
  Draft apps must not publish. A public repository does not make draft content
  confidential: never add confidential future-product data.
- Feelory is **Coming soon** until a public store listing is verified and a
  verification date is recorded. No release date, inactive badge, fake download
  affordance, pricing, ratings, reviews, award or clinical claims.
- Local-first is not a claim that hosting/email providers collect nothing.
  Maintain explicit opt-in iCloud, write-only Health, optional on-device AI and
  deletion/export/backup distinctions.
- No forms, analytics, newsletters, tracking, external fonts, remote embeds,
  client runtime or remote AI fallback.
- Screens are genuine, proportional and unmodified except resizing/encoding.
  Synthetic reflections and saved AI-tag provenance are not live AI evidence.
- Code is MIT; media, branding and copy are not. See `LICENSE` and
  `docs/media-provenance.md` before reusing assets.

## Change discipline

Read `PRODUCT.md`, `DESIGN.md` and relevant docs. Use semantic HTML, accessible
focus/skip links, reduced motion, responsive images and explicit dimensions.
Keep catalogue schema and tests together. Reject invalid data instead of silently
substituting defaults. Update directly related docs.

Do not commit, push, create branches/worktrees, enable Pages, change permissions,
deploy, or change DNS without the user's explicit authorization. The user has
authorized a **public review site only**, and the parent session owns hosting,
commit/push and deployment setup. Preserve dirty user-owned work.
`src/content/review-publication.json` records that narrow authorization;
`PAGES_REVIEW_APPROVED=true` admits only the repository-URL review build.
`src/content/publication.json`, production mode and `PAGES_LAUNCH_APPROVED`
remain independent final-publication barriers. Never infer final policy approval
or store release from review publication.
