# caschw LLC website

An image-led, static software showroom for [caschwllc.org](https://caschwllc.org).
Built with Astro and TypeScript. **Prepared for user-authorized public review**
at `https://caschwllc.github.io/caschwllc-website/`; hosting setup and push are
handled separately by the parent session. Policy text is owner-approved;
policy publication status is separate from the app's availability.
Feelory is marketed
as **Coming soon**; no public store listing or release date is assumed.

## Local use

```sh
export ASTRO_TELEMETRY_DISABLED=1
npm ci
npx playwright install chromium
npm run dev
```

Node 22.12+ (22.x) is required. On this Mac, Node/npm are available under
`/opt/homebrew/bin`; add that directory to `PATH` if needed.
No backend, accounts, analytics, forms, newsletters or remote font requests.
The shipped pages need no JavaScript runtime.

## Commands

| Command                           | Purpose                                                         |
| --------------------------------- | --------------------------------------------------------------- |
| `npm run check`                   | Astro and strict TypeScript diagnostics                         |
| `npm run lint`                    | ESLint and formatting                                           |
| `npm test`                        | Catalog, visibility, navigation, availability and URL contracts |
| `npm run build`                   | Generate the static site                                        |
| `npm run validate:site`           | Built routes, links, metadata, media proportions and budgets    |
| `npm run test:browser`            | Desktop/mobile Chromium, axe, keyboard and performance          |
| `npm run verify`                  | All required checks above                                       |
| `npx tsx scripts/check-launch.ts` | Intentionally fails until publication facts are approved        |

Routes: `/`, `/apps/feelory/`, `/apps/feelory/privacy/`,
`/apps/feelory/support/`, `/privacy/`, and `404.html`.

## Contributing and operations

Start with [AGENTS.md](AGENTS.md) and [CONTRIBUTING.md](CONTRIBUTING.md).
[Architecture](docs/architecture.md), [product catalog](docs/products.md),
[media provenance](docs/media-provenance.md), [privacy gates](docs/privacy.md),
[deployment and Hover DNS](docs/deployment.md), and
[validation evidence](docs/validation.md) describe the contracts.
[Dependency review](docs/dependencies.md) records outstanding build-tool advisories.

Review builds are now the default (`WEBSITE_MODE=review`) with the repository
subpath and canonical. Parent must set `PAGES_REVIEW_APPROVED=true` for this
user-authorized review deployment. Final production requires
`WEBSITE_MODE=production`, `PAGES_LAUNCH_APPROVED=true` and all publication facts.
Both approval variables default to unset; CI cannot deploy
pull-request code. No Pages settings, DNS, protections or cloud permissions have
been configured by this implementation. A `CNAME` file is intentionally absent:
the Actions Pages custom-domain setting is authoritative.

## License

Website code is MIT. Branding, prose, screenshots, app artwork and marketing
media are excluded and reserved rights. Third-party components retain their
own licenses. See [LICENSE](LICENSE) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
