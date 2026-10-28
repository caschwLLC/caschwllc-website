# Website analytics

## Status and scope

The owner approved the documented Umami behavior and disclosure on 2026-10-20.
`src/content/analytics-publication.json` records the approved source fingerprint
and configured website ID/script URL. Collection remains **disabled** until the
approved revision is deployed with `UMAMI_ENABLED=true`.
Override's app privacy policy now uses the owner's confirmed diagnostics and
no-remote-collection facts. No DNS, release, download destination
or hosting setting is changed by this integration.

When approved and explicitly enabled, one Umami Cloud website covers all public
HTML pages on `https://caschwllc.org`, including support and privacy pages.
404 is excluded. The GitHub Pages review site and local previews never load the
vendor script, even when previewing an enabled production artifact.

## Owner setup: no API keys

1. Create/sign in to [Umami Cloud](https://umami.is/) and choose **Hobby**, not a
   paid trial. At implementation, the advertised free allowance is one website,
   100K usage events per month and six-month retention. Check your account's
   actual entitlements; stored event properties also count toward usage.
2. Add a website for domain `caschwllc.org`, named, for example, `caschw LLC`.
   All products share this site, not separate accounts or trackers.
3. Copy the generated tracking snippet. Provide only the public `data-website-id`
   UUID and script `src`. The currently supported script is exactly
   `https://cloud.umami.is/script.js`. If your snippet differs, stop and have the
   endpoint reviewed rather than bypassing validation.
4. In this GitHub repository, open **Settings > Secrets and variables > Actions >
   Variables > Repository variables**. Set:

   | Repository variable | Value                              |
   | ------------------- | ---------------------------------- |
   | `UMAMI_WEBSITE_ID`  | UUID from the snippet              |
   | `UMAMI_SCRIPT_URL`  | `https://cloud.umami.is/script.js` |
   | `UMAMI_ENABLED`     | `false` initially                  |

   These are public build configuration, not secrets. Both CI and deployment's
   preparation job need them, so do not scope them only to the `github-pages`
   environment (the artifact is built before that environment's deploy job).
   No Umami API key, password, GitHub PAT or dashboard share link is needed.

5. Review the final website analytics disclosure before activating collection.
   Override's app facts and the reuse of recorded publisher/support facts have
   been confirmed by the owner. Policy dates are page-specific: set the actual
   creation/change date on changed pages only, including Web privacy additions.
   Do not request repeated confirmation or bump unrelated pages.
6. After explicit owner approval, the implementing agent records the reviewed
   behavior/disclosure digest and exact website ID/script URL in
   `src/content/analytics-publication.json`. Obtain the current digest with:

   ```sh
   node --input-type=module -e \
     "import { analyticsPolicyDigest } from './analytics.config.mjs'; console.log(analyticsPolicyDigest())"
   ```

   This command only prints a fingerprint. **Never set approval or refresh the
   digest just to make tests pass.** The fingerprint covers runtime behavior and
   policy source, not legal sufficiency. All marketed apps must declare approved
   privacy pages before enabled production builds are admitted.

7. Separately authorize normal final-domain publication. Only then set
   `UMAMI_ENABLED=true` and authorize an approved production rebuild/deployment.
   Changing a variable does not change an existing static artifact. Existing
   production/Pages/domain approvals remain independent and unchanged.
8. Confirm one page view and Override click in Umami Realtime on the final
   domain, with DNT/blockers off for this deliberate check. Verify `app`,
   `version` and source page. Optionally confirm a Feelory `store_click`.
   Test fixtures must not be published.

To disable collection, set `UMAMI_ENABLED=false` and authorize a rebuild and
deployment. Already deployed artifacts keep their existing behavior until
replaced. Deleting previously collected data is a separate Umami account action.

## Data and implementation

`analytics.config.mjs` validates the build mode, switch, public ID, exact HTTPS
script URL and separate policy approval. Malformed enabled configuration fails
the build; review mode never activates collection.

`Site.astro` includes the optional inline loader once. Before contacting Umami,
it requires HTTPS, the exact production hostname and no Do Not Track signal.
The vendor is loaded deferred with automatic tracking disabled. Our small
listener sends explicit page views and these actions:

| Event            | Explicit data                                                   | Source                               |
| ---------------- | --------------------------------------------------------------- | ------------------------------------ |
| Page view        | Website ID, hostname, path, public page title, referring origin | Shared layout                        |
| `download_click` | `app`, `version`, plus page context                             | Valid catalog DMG action             |
| `store_click`    | `app`, plus page context                                        | Verified active catalog store action |

Referring paths, queries and fragments are not sent. Current-page queries and
fragments are excluded; the vendor's automatic page/click/history tracking is
disabled to avoid sending unsanitized defaults or delaying links. There are no
personal IDs, session-data calls, replay, extra performance tracking, advertising
tags, form collection or arbitrary outbound-link tracking.

Umami still receives connection information. Cookie-free does not mean the
provider processes nothing, or establish a universal consent exemption. Owner
review of applicable consent requirements is an activation prerequisite.
The proposed setup has no consent banner and respects Do Not Track.

Allowed vendor origins are `https://cloud.umami.is` (tracker script) and
`https://gateway.umami.is` (`/api/send` collection, as observed in the inspected
Cloud script). Review any vendor endpoint/behavior change before accepting it.
We do not proxy requests or hide collection from visitors.

Links remain native direct anchors. No click handler cancels default navigation,
awaits delivery or redirects. Blocked, offline, stalled or not-yet-loaded
analytics can lose events; links must still work. Script-load failure produces a
console warning without changing UI. Counts are approximate, not installations.
Normal automated tests intercept all vendor traffic; they do not contact the
real analytics account.

## On-demand GitHub downloads

Use the existing authenticated local GitHub CLI; no new token is required.
Published prereleases are included:

```sh
gh api --paginate repos/caschwLLC/caschwllc-website/releases \
  --jq '.[] | select(.draft == false) | .tag_name as $tag | .assets[] | select(.name | endswith(".dmg")) | {release: $tag, asset: .name, downloads: .download_count, url: .browser_download_url}'
```

Public release-asset metadata can also be read anonymously through GitHub REST,
subject to public rate limits. No browser or build calls GitHub for counts.
There is no scheduler, stored daily history or public counter.

GitHub's counters are cumulative across all sources and include repeat/testing
requests. They are not unique users, proof of a completed transfer or installs.
Compare them with Umami's versioned click counts, but do not expect equality or
derive a precise conversion rate from the two.

## Adding apps/pages and maintaining truthful policies

- Use `Site.astro` for public HTML pages and `Availability.astro` for actual
  download/store actions. This automatically inherits page and event coverage.
  A Coming soon app has no store event or fabricated link. Feelory's verified
  App Store link emits `store_click` with `app: feelory`.
- All marketed apps must declare an approved app-specific privacy policy.
- Approved app policy pages end with `WebsitePrivacyNotice.astro` through
  `Reading.astro`: a short Web privacy section linking to the site policy.
  Detailed build-selected disclosures live only in the site policy via
  `WebsiteAnalyticsDisclosure.astro`, not in app policies. App-specific behavior
  remains each app policy's job.
- Review every behavior change for policy impact: providers, endpoints, fields,
  permissions, hosting, retention, deletion, support handling and consent/DNT.
  Revise affected policies and tests together and obtain renewed approval.
- The digest catches changes to covered source/disclosures, and enabled builds
  require current approval. It cannot detect every semantic contradiction.
  Never weaken privacy claims or update approval automatically.
- Do not infer app behavior from a website tracker or a negative source search.
  Use authorized evidence and confirm released-version applicability.

## Validation

Run both ordinary modes with analytics disabled, using Node 22.12+ in 22.x:

```sh
UMAMI_ENABLED=false ASTRO_TELEMETRY_DISABLED=1 npm run verify
UMAMI_ENABLED=false WEBSITE_MODE=production ASTRO_TELEMETRY_DISABLED=1 npm run verify
```

CI also validates whichever real configuration is selected. The browser analytics
suite builds an isolated enabled-production fixture with a dummy UUID and
test-only policy approval, maps the final origin locally and intercepts script/
collection/download/store traffic. No fixture changes approve the real site.

For a bounded integration check against the actual vendor script, download it
outside the repository, then supply its absolute path:

```sh
UMAMI_TRACKER_TEST_FILE=/absolute/session/path/umami-tracker.js \
  npx playwright test tests/browser/analytics.spec.ts --project=desktop
```

Keep the vendor source out of version control. Measure compressed tracker
transfer size before activation; target at most 10 KB compressed, plus the small
local loader. Revisit the choice if it exceeds that budget. Live dashboard
confirmation remains an owner-controlled post-publication acceptance step.

References: [pricing](https://umami.is/pricing),
[tracker configuration](https://docs.umami.is/docs/tracker-configuration),
[tracker API](https://docs.umami.is/docs/tracker-functions),
[usage accounting](https://docs.umami.is/docs/cloud/faq),
[GitHub asset counters](https://docs.github.com/en/rest/releases/assets#get-a-release-asset).
