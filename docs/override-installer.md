# Override installer packaging

This public repository packages an existing Developer ID export from the private
Override repository. It never fetches private source, builds, re-signs the app,
publishes a release, or changes website links. Stapling the app is part of the
pipeline, including for already-stapled inputs.

## Owner prerequisites

1. Review and merge the workflow/scripts through the normal authorized process.
   This implementation alone does not authorize commit, push or execution.
2. In the existing draft release, save tag `override-v0.1.0` and retain the exact
   asset `Override.0.1.0.developer-id.zip`. Read-only metadata on 2026-10-14
   verified the owner-added tag now resolves to a draft with asset ID `640831214`
   (2,889,064 bytes). This resolves the earlier missing-tag prerequisite.
   Keep the release a draft.
3. Configure the `override-release` environment with required owner approval and
   main-only deployment restrictions where supported. An environment name alone
   does not enforce approval; inspect these protections before dispatch.
   Read-only inspection on 2026-10-14 confirmed a required owner reviewer, but no
   environment deployment-branch policy. The workflow independently rejects
   non-main runs; configure the environment restriction before the first live
   run as defense in depth. This implementation does not change permissions.
4. Configure environment secrets `DEVELOPER_ID_CERTIFICATE_P12_BASE64`,
   `DEVELOPER_ID_CERTIFICATE_PASSWORD`, `RELEASE_KEYCHAIN_PASSWORD`,
   `APP_STORE_CONNECT_API_KEY_P8_BASE64`; variables `DEVELOPER_ID_APPLICATION`,
   `APPLE_TEAM_ID`, `APP_STORE_CONNECT_KEY_ID`, `APP_STORE_CONNECT_ISSUER_ID`.
   The certificate must include its private key and be valid for Developer ID
   Application signing; the API key must permit notarization. The identity is the
   full Developer ID Application identity, ending in `(MF47M54FA9)`.
   `APPLE_TEAM_ID` must be `MF47M54FA9`. Never paste credentials into logs,
   workflow inputs, release descriptions or this repository.

## Manual run (separate owner authorization)

From Actions, select **Package Override installer** on **main** and provide the
saved draft tag and exact input asset name. Approve the environment deployment.
Do not publish or edit the release while this workflow is running. Packaging is
serialized across all tags; it cannot cancel an earlier packaging run.

The workflow uses authenticated GitHub asset access and rejects wrong names,
versions, bundle IDs, signing teams, unsigned/unnotarized apps, unsafe archive
paths, privileged/special files and escaping symlinks. It expects one outer
`Override.app`, bundle ID `com.caschw.override`, with the version from the tag.
There is a 2 GiB expanded archive limit. Nested framework symlinks are supported.
It validates the existing app signature and notarization, staples and validates
the app, copies it using `ditto`, and verifies the staged copy. A conventional
compressed DMG contains the genuine app and an `/Applications` link.

The disk image opens in native Finder icon view (640 by 400 points), with the
unmodified app icon on the left, Applications on the right, and
`Installation Guide.txt` below. Finder's native background follows the user's
appearance. No custom artwork, Finder scripting, background process, or app
launch is needed to build the layout. The included plain-text guide covers
Apple silicon/macOS 27+, drag-to-Applications installation, ejection, launching
the installed copy, manual Accessibility access for window overrides, quitting
before upgrades, and quitting/removing the app to uninstall. It does not grant
permissions, reset settings, remove saved data, or change app behavior.

Only the DMG is signed, using a temporary keychain. It is submitted separately
to Apple, awaited for at most 20 minutes, then stapled and checked with
`stapler`, `codesign`, `hdiutil` and Gatekeeper. The final
`Override-0.1.0.dmg` and `Override-0.1.0.dmg.sha256` are attached to the same
still-draft release only after all gates pass. Existing final assets are never
overwritten. No auto-publish, automatic Xcode Cloud retrieval or website change
is included.

## Failure and recovery

After certificate import, the runner preserves its user keychain search list and
adds only the temporary signing keychain for certificate-chain discovery.
`codesign --keychain` alone restricts identity selection but does not include that
keychain in chain lookup. The original search list is restored during cleanup.
The runner enumerates valid codesigning identities only in that temporary
keychain, requires one exact configured identity, then signs by its certificate
fingerprint with the explicit keychain restriction retained.
`signing-identity.json` records valid-identity and exact-match counts, not key
material. Missing, mismatched or ambiguous identities fail before DMG signing.
Successful import alone does not prove a usable signing identity exists.

Draft discovery uses the authenticated, paginated release collection and exact
tag matching, then revalidates the selected release by ID. GitHub's release-by-tag
endpoint can return 404 for a saved draft tag even when the draft is visible in
the collection. The first live run failed at that endpoint before downloading
the ZIP or accessing Apple services; this is not evidence of invalid signing
credentials. Missing, ambiguous, published or changed releases still fail closed.

The run summary and `override-notarization-RUN_ID-ATTEMPT` artifact retain the
submission ID, input asset ID/hash, submit/wait/status output, and Apple's log
when available, for 14 days. A wait timeout **does not cancel** Apple's server-side
submission. Inspect its status using `xcrun notarytool info SUBMISSION_ID` and
retrieve `xcrun notarytool log SUBMISSION_ID` with owner-managed authentication;
do not put keys in shell history. In-progress submissions may not yet have a log.
No installer is uploaded unless status is `Accepted` and all subsequent checks
pass. A rerun submits a newly packaged DMG; there is no implicit submission resume.
Failed command diagnostics include bounded stdout and stderr without echoing
command arguments, so tools that report errors on stdout remain actionable.
Stapler output from every attempt is retained in `stapler-*.json` reports.
Both staple and validate contact Apple's ticket service. Only the observed
transient failure combination (exit 68 and `NSURLErrorDomain Code=-1005`,
connection lost) is retried: at most three attempts, with 10s then 30s delays.
Exit 68 alone is not retried: it can also mean an unnotarized file or an
unexpected ticket response. Invalid/missing/revoked tickets and all other
failures stop immediately; exhausted retries still block every asset upload.

GitHub has no atomic draft-check-and-upload or two-asset transaction. Draft state
is checked before each upload and afterward, but an owner must not concurrently
publish the release. A network error on the second upload may leave only the DMG
in the draft; inspect assets and, with separate owner authorization, remove the
incomplete final asset set before rerunning. Never use an overwrite/clobber retry.
Any detected draft/tag change fails explicitly; it cannot undo a concurrent
human publication.

Signing material and the temporary keychain are removed in a `finally` block and
an always-run workflow cleanup step. A forcibly terminated runner may prevent
cleanup; use only GitHub-hosted ephemeral macOS runners, never a persistent
self-hosted runner. Diagnostic artifacts contain no app binaries or credential
files. Do not enable shell tracing or print secret environment variables.

## Local deterministic checks

`python3 -m unittest discover -s tests -p 'override_packaging_test.py' -v`
checks safe/unsafe archive fixtures, app identity/notarization, input/draft
contracts, failure cleanup, and mocked pipeline success/failure upload gates
without credentials, downloads or Apple services. These checks also run through
`npm test` and `npm run verify`. These standard-library contracts require
Python 3.9+ and do not require the separate layout dependencies below.
The layout writer has a separate isolated Python environment:

```sh
python3 -m venv /tmp/override-layout-venv
/tmp/override-layout-venv/bin/python -m pip install --require-hashes --only-binary=:all: -r scripts/override-installer-requirements.txt
/tmp/override-layout-venv/bin/python -m unittest discover -s tests -p 'override_*test.py' -v
```

This runs the packaging contracts plus actual `.DS_Store` round-trip tests and,
on macOS, an unsigned DMG creation/read-only mount test. The packaging workflow
runs this expanded suite before credentials are passed to the packaging step.
The website `npm run verify` continues to run the standard-library packaging
contracts without installing the installer-only Python tools.

The previous installer successfully completed signing/notarization/stapling and
the owner reported installation and basic functionality after granting permission.
The new presentation/guide still needs a separately approved fresh-version
packaging run and visual/installation review of its final signed DMG. Existing
final assets are never replaced: the current draft's completed DMG/checksum must
remain untouched; use a new version-matched export/draft, or obtain separate owner
authorization for any different asset/release plan.
