# Dependency review

Dependencies are lockfile-pinned and installed with `npm ci`. Actions are pinned
to independently verified upstream release SHAs. No dependency tools or native
browser binaries are deployed in the static artifact.

## Outstanding advisories as of 2026-10-08

`npm audit` reports **two high package findings representing one unresolved advisory**:

| Package              | Version | Advisory                                                                 | Relevant boundary                                                                                     |
| -------------------- | ------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| http-cache-semantics | 4.2.0   | [GHSA-ch52-4w7c-c8xp](https://github.com/advisories/GHSA-ch52-4w7c-c8xp) | Shared cached response max-stale behavior; no authenticated/shared response cache in this static site |
| astro                | 7.3.5   | Transitive finding above                                                 | Build/development tooling, not a deployed application server                                          |

The source-map-js advisory is addressed by the compatible **1.2.2** override in
`package.json`; the configured registry now supplies this first patched version,
and `npm audit` no longer reports the advisory.

For http-cache-semantics, GitHub advisory metadata reports **no patched version**;
the installed version is 4.2.0. The audit's suggested Astro downgrade to 2.10.9 is not an acceptable
automatic repair: it breaks the supported content API/current implementation.
No advisory has been hidden, suppressed, or called fixed.

The smol-toml quadratic-parse advisory was addressed with a compatible **1.9.0**
override, recorded in package/lock files. Recheck it when upstream Astro catches up.

## Before launch

Re-run `npm audit` and check actual upstream releases/advisories. The current
report has two high-severity package findings for one unresolved
http-cache-semantics advisory; no compatible fix is available. The owner must
review the documented boundary and decide whether to accept the remaining
build-tool risk. `dependencyRiskReviewed` deliberately defaults to false and
is a launch gate. Green functional CI is not evidence of zero dependency
advisories.

On 2026-10-08 the owner accepted the documented residual risk for publication.
Mitigation follow-up is tracked in
[issue #1](https://github.com/caschwLLC/caschwllc-website/issues/1).
The advisory remains unresolved; this acceptance is not a technical fix.

Keep dev/preview bound locally. CI for untrusted PRs is read-only and cannot
reach the Pages deploy path. Do not add SSR, authenticated caching, source-map
uploads or public development servers without revisiting these assumptions.
