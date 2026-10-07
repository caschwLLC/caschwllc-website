# Contributing

Read [AGENTS.md](AGENTS.md) first. Use reviewed pull requests to main once the
repository is published. Never add private app source or real user data.

1. Install locked dependencies with `npm ci`, using Node 22.12+ (22.x).
2. Make one coherent change, preserving confirmed product truth and license
   boundaries. Update relevant product, provenance and operation docs.
3. Run `npm run verify`. For visual changes, inspect desktop/mobile together,
   make one batched correction and confirm once. Automated axe is not a complete
   WCAG conformance audit.

Use `npm run format` to apply repository formatting. Catalog changes require
unit tests. New marketed products require their own privacy/support documents
and genuine approved media. See [docs/products.md](docs/products.md).

Publication has a separate review process in [docs/deployment.md](docs/deployment.md).
Passing CI is not first-launch permission.
