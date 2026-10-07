# Architecture decisions

## Static Astro, no browser application runtime

Marketing/support need content and images, not accounts or app data. Astro's
static output keeps routes small and the privacy boundary straightforward.
No React, backend, contact forms, embedded services or analytics are introduced.

## Catalog visibility separate from release state

Feelory is public marketing content but unreleased. `visibility` determines
publication; `status` controls availability. A coming-soon page is useful,
while an inactive download badge would mislead. One shared validated contract
feeds routes, navigation and discovery.

## Genuine captures, original surrounds, system fonts

The approved software-showroom direction is carried by actual screens, not
invented UI. Original CSS frames avoid third-party hardware-license uncertainty.
OS typography avoids shipping fonts or creating external font requests.
Six selected captures keep the site focused; all 24 are not needed.

## Launch authorization is independent of green CI

Automated checks are necessary but not sufficient for legal facts, provider
disclosures, domain ownership or first publication. Incomplete final content gates
and a default-disabled production repository variable both fail closed.
The user subsequently authorized a public review preview: a separate review
variable and repository-subpath target allow that narrow publication with
separate deployment gates. The owner subsequently approved policy text and
removed its draft labeling: only app availability is Coming soon. Unknown
publisher/date and final-domain gates remain separate. GitHub settings
and DNS remain owner actions. Prepared workflows are not active deployment.
