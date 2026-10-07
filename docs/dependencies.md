# Dependency review

Dependencies are lockfile-pinned and installed with `npm ci`. Actions are pinned
to independently verified upstream release SHAs. No dependency tools or native
browser binaries are deployed in the static artifact.

## Outstanding advisories as of 2026-10-07

`npm audit` reported **three high package findings representing two advisories**:

| Package              | Version | Advisory                                                                 | Relevant boundary                                                                                     |
| -------------------- | ------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| http-cache-semantics | 4.2.0   | [GHSA-ch52-4w7c-c8xp](https://github.com/advisories/GHSA-ch52-4w7c-c8xp) | Shared cached response max-stale behavior; no authenticated/shared response cache in this static site |
| astro                | 7.3.5   | Transitive finding above                                                 | Build/development tooling, not a deployed application server                                          |
| source-map-js        | 1.2.1   | [GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q) | Indexed source-map processing denial of service; no user-upload/source-map processing endpoint        |

Upstream GitHub advisory metadata explicitly identifies **source-map-js 1.2.2**
as the first patched version. The exact-version check
`npm view source-map-js@1.2.2 version --fetch-retries=1 --fetch-timeout=30000`
returned **E404: No match found for version 1.2.2** from the configured registry,
`https://packagefeedproxy.microsoft.io/npm/`, on 2026-10-07. An upstream patch
exists, but this registry has not supplied that version; checking `latest` alone
was insufficient. No unavailable override or remote tarball workaround was added.

For http-cache-semantics, GitHub advisory metadata reports **no patched version**;
the installed version is 4.2.0. The audit's suggested Astro downgrade to 2.10.9 is not an acceptable
automatic repair: it breaks the supported content API/current implementation.
No advisory has been hidden, suppressed, or called fixed.

The dependency follow-up attempted a fresh `npm audit --json` three times. The
configured audit endpoint failed with HTTP 400 and then ECONNRESET twice, so no
attempt produced a new findings count. The table above remains the last
successful audit, not a claim that the failed endpoint returned a clean result.

The smol-toml quadratic-parse advisory was addressed with a compatible **1.9.0**
override, recorded in package/lock files. Recheck it when upstream Astro catches up.

## Before launch

Re-run `npm audit`, check actual upstream releases/advisories, apply compatible
fixes and rerun verification. If no fix exists, the owner must review the
documented boundaries and decide whether to accept the remaining build-tool
risk. `dependencyRiskReviewed` deliberately defaults to false and is a launch
gate. Green functional CI is not evidence of zero dependency advisories.

Keep dev/preview bound locally. CI for untrusted PRs is read-only and cannot
reach the Pages deploy path. Do not add SSR, authenticated caching, source-map
uploads or public development servers without revisiting these assumptions.
