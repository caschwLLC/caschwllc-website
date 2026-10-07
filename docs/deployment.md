# GitHub Pages and Hover runbook

**User-authorized public review is prepared.** This child implementation has
made no Pages settings, deployments, protections, permissions or DNS writes.
The parent owns commit/push and hosting setup. Final production/custom-domain
publication remains separately gated.

## Review publication now

The user requested a publicly accessible review site and accepted the normal
repository Pages URL; custom-domain DNS is on the user and is **not a review
blocker**. Parent setup:

1. Configure Pages source as GitHub Actions without a custom domain.
2. Set `PAGES_REVIEW_APPROVED=true`; leave `WEBSITE_MODE` unset or set `review`.
   Leave `PAGES_LAUNCH_APPROVED` unset/false and final publication facts unchanged.
3. Commit/push the user-authorized reviewed source. Successful trusted main CI
   triggers deployment at `https://caschwllc.github.io/caschwllc-website/`.
4. Verify links, assets, sitemap/canonical and 404 beneath that subpath. Privacy
   pages must not describe the owner-approved policy as draft or under review.
   Feelory privacy states that the app is coming soon; policy pages omit the
   public-review banner. Non-policy pages retain the site review banner.

The review build defaults to the repository subpath and noindex. Policy text
approval is independent of build mode, domain approval and app release status.
`npx tsx scripts/check-launch.ts --review` passes only in review mode;
the ordinary final launch check still fails. CI verifies **both** review and
production mode. Review approval cannot admit a production build.
The dependency advisories remain documented; this narrow review authorization
does not imply that they were fixed or that final risk review is complete.

## Current prerequisite: delegation and zone readiness

The parent session's read-only checks on 2026-10-07 reported **SERVFAIL** for
`caschwllc.org NS` from both the local resolver and `dig @1.1.1.1`. Cloudflare's
extended DNS error referred to the `caschwllc.org` delegation and reported an
authoritative address returning **REFUSED**. Authoritative readiness is **not
verified**. This does not establish a registration, billing, DNSSEC or other
root cause; do not guess or change DNS based on that symptom.

Before Pages verification, the owner must inspect authoritative delegation
and zone readiness at Hover, confirming the actual delegated nameservers and
that they answer for the zone. Hover DNS instructions apply only if Hover is
authoritative. Preserve an export/screenshot of all records, including MX/TXT,
SPF/DKIM/DMARC and unrelated records. No wildcard records.

Read-only checks, when appropriate:

```sh
dig caschwllc.org NS
dig @1.1.1.1 caschwllc.org NS
dig +trace caschwllc.org NS
dig @CONFIRMED_AUTHORITATIVE_SERVER caschwllc.org SOA
```

The final placeholder is a command template, not a server to use literally.
Require non-SERVFAIL/non-REFUSED authoritative answers before proceeding.

## Review and protections (owner setup only)

Publish source only after explicit commit/push authorization. Review the public
repository for private content. Protect main with pull requests, at least one
review, required **Validate website (review)** and **Validate website (production)**
CI statuses, dismissal of stale approvals,
blocked force pushes/deletion and limited bypass. Require branches to be up
to date or use a merge queue if available. Verify the exact check name after
the first CI run; do not claim settings are enforced before inspecting them.
If the account plan cannot enforce a feature, document that limitation and use
a manual review policy; do not silently call it protected.

Set the `github-pages` environment to main only and require owner approval for
deployments where supported. Limit Actions permissions to read by default.
Pin every action to a reviewed release SHA; documented pins were checked against
upstream tags on 2026-10-07. Review updates through PRs, never mutable action tags.

| Action                        | Verified release |
| ----------------------------- | ---------------- |
| actions/checkout              | v7.0.1           |
| actions/setup-node            | v7.0.0           |
| actions/upload-artifact       | v7.0.2           |
| actions/configure-pages       | v6.0.0           |
| actions/upload-pages-artifact | v5.0.0           |
| actions/deploy-pages          | v5.0.1           |

## Final custom-domain launch sequence (separate authorization required)

1. Resolve delegation/zone readiness. Approve publication facts and media,
   verify supported-device deletion guidance, review remaining build dependency
   advisories, and run `npm run verify`. Fill `src/content/publication.json`;
   require `npx tsx scripts/check-launch.ts` to pass.
2. Verify **caschwllc.org under the caschwLLC organization**, using its Settings
   → Pages domain verification flow and the exact TXT name/token GitHub supplies.
   Add only that TXT record to authoritative DNS after approval. Do not invent
   the token. Keep verification TXT in place to prevent domain takeover.
3. Configure repository Settings → Pages source **GitHub Actions**, and save
   **caschwllc.org** as the custom domain **before pointing web traffic DNS**.
   Actions custom-domain settings are authoritative; a `CNAME` file alone is
   ignored/insufficient. This repository intentionally does not ship one.
4. At Hover, only if authoritative and specifically authorized, change the
   apex web records and `www`. Preserve all mail and unrelated TXT/MX records.
   Check current GitHub values again immediately before editing.
5. Once the owner has approved final production publication, set `WEBSITE_MODE`
   to `production` and repository variable
   `PAGES_LAUNCH_APPROVED` to exact string `true`. Without that production
   approval, production jobs do not run. Merge the reviewed launch change to main. CI success
   triggers the prepared workflow; an environment approval can gate it further.
6. Wait for DNS/certificate readiness, enforce HTTPS, and verify redirects,
   routes, content and provider disclosures. Record actual results. DNS changes
   and certificate provisioning may take up to 24 hours.

### DNS values

From [GitHub's custom-domain documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site),
read on 2026-10-07. Recheck at execution time:

| Type  | Host     | Target              |
| ----- | -------- | ------------------- |
| A     | apex / @ | 185.199.108.153     |
| A     | apex / @ | 185.199.109.153     |
| A     | apex / @ | 185.199.110.153     |
| A     | apex / @ | 185.199.111.153     |
| AAAA  | apex / @ | 2606:50c0:8000::153 |
| AAAA  | apex / @ | 2606:50c0:8001::153 |
| AAAA  | apex / @ | 2606:50c0:8002::153 |
| AAAA  | apex / @ | 2606:50c0:8003::153 |
| CNAME | www      | caschwllc.github.io |

Use A alongside AAAA for IPv6 support. `www` points to the organization Pages
host, **not** a repository path or `*.pages.github.io` private-host address.
Only replace conflicting **web** records after confirming their purpose.
No apex CNAME that could interfere with mail. No wildcard records.

### Exact post-launch checks

```sh
dig caschwllc.org A +noall +answer
dig caschwllc.org AAAA +noall +answer
dig www.caschwllc.org CNAME +noall +answer
curl -I https://caschwllc.org/
curl -IL https://www.caschwllc.org/
curl -IL http://caschwllc.org/
curl -I https://caschwllc.org/apps/feelory/
curl -I https://caschwllc.org/apps/feelory/privacy/
curl -I https://caschwllc.org/apps/feelory/support/
curl -I https://caschwllc.org/privacy/
curl -I https://caschwllc.org/sitemap.xml
curl -I https://caschwllc.org/robots.txt
curl -I https://caschwllc.org/not-a-real-page/
```

Expect valid HTTPS, apex canonical, www → apex and HTTP → HTTPS redirects,
200 public routes/assets, correct sitemap, and a real 404 response with the
accessible custom body. Check browser mixed-content/network requests, footer
links and Coming soon status. Recheck MX/TXT records against the saved snapshot.

## Ongoing deployment

CI runs on main pushes and pull requests with `contents: read`. The deploy
workflow listens for CI completion but admits only a successful **push on main
from this repository** and the exact approval variable for its mode:
`PAGES_REVIEW_APPROVED=true` for review or `PAGES_LAUNCH_APPROVED=true` for production.
PR/workflow-dispatch runs
cannot deploy, and no `pull_request_target` trigger exists. Prepare checks out
the exact validated head SHA with no persisted credentials, rechecks launch
permission (or final facts in production), rebuilds and uploads `dist`. The deploy-only job has Pages write/OIDC
permissions; it runs no repo code. Existing Pages URL must match the repository
URL in review or `https://caschwllc.org` in production; `configure-pages` has
`enablement: false`.
Deployment is serialized, and both prepare/deploy reject a stale CI SHA when
main has advanced; reviewed merges are required by owner protections,
not inferred by CI. Never give production permissions to PR code.

## Rollback / emergency stop

The owner can set the mode's approval variable to false to stop **future** deployment
(`PAGES_REVIEW_APPROVED` for review, `PAGES_LAUNCH_APPROVED` for production);
this does not unpublish content already served or revoke a running job.
Cancel an active deployment if necessary. Revert a bad change through a
reviewed PR and let its successful CI redeploy; do not force-push history.
Unpublishing Pages, changing DNS or permissions needs separate authorization.
Do not remove verification TXT or repoint a domain without a coordinated
takeover-safe plan; retain mail records and saved zone data.

## Build targets and custom-domain transition

`site.config.mjs` is shared by Astro and validation. Default review uses
`site: https://caschwllc.github.io`, `base: /caschwllc-website/`.
`WEBSITE_MODE=production` uses `site: https://caschwllc.org`, `base: /`.
All internal media/navigation paths, sitemap and canonical follow the target.
Unsupported modes fail rather than falling back.

For final transition, retain the organization verification → Pages domain
setting → traffic DNS ordering above. Complete policy/risk approvals, revise
conditional hosting copy to actual hosting, switch mode, and authorize final
deployment. Review approval does not waive custom-domain readiness. Local
preview needs neither Pages nor DNS.

## References

- [Domain verification](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)
- [Hover DNS records](https://support.hover.com/support/solutions/articles/201000064728-managing-dns-records-at-hover)
- [Astro GitHub deployment](https://docs.astro.build/en/guides/deploy/github/)
