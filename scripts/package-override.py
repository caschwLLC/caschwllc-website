"""Package an existing notarized app; never build or re-sign the app."""

import base64
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import plistlib
import re
import shutil
import stat
import subprocess
import sys
import unicodedata
import zipfile

REPOSITORY = "caschwLLC/caschwllc-website"
TEAM = "MF47M54FA9"
BUNDLE = "com.caschw.override"
MAX_UNPACKED = 2 * 1024**3


def require(condition, message):
    if not condition:
        raise ValueError(message)


def inputs(tag, asset):
    match = re.fullmatch(r"override-v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)", tag)
    require(match is not None, "Expected release tag override-vMAJOR.MINOR.PATCH")
    version = tag.removeprefix("override-v")
    require(asset == f"Override.{version}.developer-id.zip",
            "Input must be the exact version-matched Developer ID ZIP name")
    return version


def archive_app(archive):
    """Validate the entire ZIP before ditto can create any filesystem entries."""
    entries = archive.infolist()
    require(0 < len(entries) <= 100000, "Empty or excessively large archive")
    require(sum(item.file_size for item in entries) <= MAX_UNPACKED,
            "Archive exceeds 2 GiB uncompressed limit")
    names = set()
    canonical_paths = {}
    links = {}
    apps = set()
    for item in entries:
        name = item.filename.rstrip("/")
        path = PurePosixPath(name)
        require(name and not path.is_absolute() and "\\" not in name and ":" not in name
                and all(part not in ("", ".", "..") for part in name.split("/"))
                and not any(ord(char) < 32 for char in name),
                "Unsafe archive path")
        require(name not in names, "Duplicate archive entry")
        names.add(name)
        for prefix in (path, *path.parents):
            spelling = str(prefix)
            canonical = unicodedata.normalize("NFD", spelling).casefold()
            require(canonical_paths.get(canonical, spelling) == spelling,
                    "Case or Unicode alias in archive paths")
            canonical_paths[canonical] = spelling
        require(not item.flag_bits & 1, "Encrypted archive entries are unsupported")
        mode = item.external_attr >> 16
        kind = stat.S_IFMT(mode)
        require(kind in (0, stat.S_IFREG, stat.S_IFDIR, stat.S_IFLNK),
                "Special archive files are forbidden")
        require(not mode & (stat.S_ISUID | stat.S_ISGID), "Privileged archive mode")
        if "__MACOSX" not in path.parts:
            for index, part in enumerate(path.parts):
                if part.endswith(".app"):
                    apps.add(PurePosixPath(*path.parts[:index + 1]))
                    break
        if kind == stat.S_IFLNK:
            require(item.file_size <= 4096, "Oversized archive symlink")
            target = archive.read(item).decode("utf-8")
            require(target and not PurePosixPath(target).is_absolute()
                    and "\\" not in target and ":" not in target and "\0" not in target,
                    "Unsafe archive symlink")
            components = list(path.parent.parts)
            for part in target.split("/"):
                if part == "..":
                    require(components, "Archive symlink escapes extraction root")
                    components.pop()
                elif part not in ("", "."):
                    components.append(part)
            links[name] = PurePosixPath(*components)
    require(len(apps) == 1, "Expected exactly one outer app bundle")
    app = apps.pop()
    require(app.name == "Override.app", "Expected Override.app")
    for name in names:
        require(not any(str(parent) in links for parent in PurePosixPath(name).parents),
                "Archive entry descends through a symlink")
    for name, target in links.items():
        require(PurePosixPath(name).is_relative_to(app) and target.is_relative_to(app),
                "Symlinks must remain inside the app bundle")
    return app


def run(*args, check=True):
    # Never echo arguments: security commands contain passwords.
    result = subprocess.run(args, text=True, capture_output=True, check=False)
    if check and result.returncode:
        raise RuntimeError(f"{Path(args[0]).name} {args[1]} failed: {result.stderr}")
    return result


def api(endpoint, *args):
    return json.loads(run("gh", "api", endpoint, *args).stdout)


def sha256(path):
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def draft(release_id, tag):
    release = api(f"repos/{REPOSITORY}/releases/{release_id}")
    require(release["draft"] is True and release["tag_name"] == tag,
            "Release must still be the same tagged draft")
    return release


def validate_app(app, version):
    with (app / "Contents/Info.plist").open("rb") as handle:
        info = plistlib.load(handle)
    require(info.get("CFBundleIdentifier") == BUNDLE, "Unexpected app bundle ID")
    require(info.get("CFBundleShortVersionString") == version, "Unexpected app version")
    run("codesign", "--verify", "--deep", "--strict", "--verbose=2", str(app))
    details = run("codesign", "-d", "--verbose=4", str(app)).stderr
    require(f"TeamIdentifier={TEAM}" in details.splitlines(), "Unexpected signing team")
    require(any(line.startswith("Authority=Developer ID Application:")
                for line in details.splitlines()), "App is not Developer ID signed")
    assessment = run("spctl", "--assess", "--type", "execute", "--verbose=2", str(app))
    require("source=Notarized Developer ID" in assessment.stderr,
            "App must already have accepted Developer ID notarization")


def cleanup(work):
    keychain = work / "release.keychain-db"
    if keychain.exists():
        run("security", "delete-keychain", str(keychain))
    if work.exists():
        shutil.rmtree(work)


def package(work, reports):
    tag, asset = os.environ["RELEASE_TAG"], os.environ["INPUT_ASSET"]
    version = inputs(tag, asset)
    require(os.environ["GITHUB_REPOSITORY"] == REPOSITORY, "Unexpected repository")
    require(os.environ["GITHUB_REF"] == "refs/heads/main", "Use the reviewed main branch")
    require(os.environ["APPLE_TEAM_ID"] == TEAM, "Unexpected configured Apple team")
    identity = os.environ["DEVELOPER_ID_APPLICATION"]
    require(identity.startswith("Developer ID Application: ")
            and identity.endswith(f"({TEAM})"), "Unexpected DMG signing identity")
    release = api(f"repos/{REPOSITORY}/releases/tags/{tag}")
    release_id = release["id"]
    release = draft(release_id, tag)
    matches = [item for item in release["assets"] if item["name"] == asset]
    require(len(matches) == 1, "Expected exactly one input asset on the draft")
    dmg_name = f"Override-{version}.dmg"
    checksum_name = f"{dmg_name}.sha256"
    require(not any(item["name"] in (dmg_name, checksum_name) for item in release["assets"]),
            "Final assets already exist; no overwrites are allowed")
    source = work / "input.zip"
    with source.open("wb") as handle:
        download = subprocess.run(
            ["gh", "api", f"repos/{REPOSITORY}/releases/assets/{matches[0]['id']}",
             "-H", "Accept: application/octet-stream"],
            stdout=handle, stderr=subprocess.PIPE, check=False)
    require(download.returncode == 0, "Authenticated asset download failed")
    require(source.stat().st_size == matches[0]["size"], "Input asset size changed")
    digest = "sha256:" + sha256(source)
    if matches[0].get("digest"):
        require(digest == matches[0]["digest"], "Input asset digest mismatch")
    (reports / "input.json").write_text(json.dumps({
        "release_id": release_id, "tag": tag, "asset_id": matches[0]["id"],
        "asset": asset, "digest": digest,
    }, indent=2))
    with zipfile.ZipFile(source) as archive:
        relative_app = archive_app(archive)
    extracted = work / "extracted"
    run("ditto", "-x", "-k", str(source), str(extracted))
    app = extracted.joinpath(*relative_app.parts)
    for path in extracted.rglob("*"):
        require(path.resolve().is_relative_to(extracted.resolve()),
                "Extracted path escapes workspace")
        if path.is_symlink():
            require(path.resolve().is_relative_to(app.resolve()) and path.exists(),
                    "Broken, cyclic or escaping app symlink")
    validate_app(app, version)
    run("xcrun", "stapler", "staple", "-v", str(app))
    run("xcrun", "stapler", "validate", "-v", str(app))
    validate_app(app, version)

    stage = work / "stage"
    stage.mkdir()
    staged_app = stage / "Override.app"
    run("ditto", str(app), str(staged_app))
    validate_app(staged_app, version)
    run("xcrun", "stapler", "validate", "-v", str(staged_app))
    (stage / "Applications").symlink_to("/Applications")
    dmg = work / dmg_name
    run("hdiutil", "create", "-volname", "Override", "-srcfolder", str(stage),
        "-format", "UDZO", "-fs", "HFS+", str(dmg))

    p12, key = work / "certificate.p12", work / "AuthKey.p8"
    p12.write_bytes(base64.b64decode(os.environ["DEVELOPER_ID_CERTIFICATE_P12_BASE64"],
                                   validate=True))
    key.write_bytes(base64.b64decode(os.environ["APP_STORE_CONNECT_API_KEY_P8_BASE64"],
                                   validate=True))
    p12.chmod(0o600)
    key.chmod(0o600)
    keychain = work / "release.keychain-db"
    password = os.environ["RELEASE_KEYCHAIN_PASSWORD"]
    run("security", "create-keychain", "-p", password, str(keychain))
    run("security", "set-keychain-settings", "-lut", "21600", str(keychain))
    run("security", "unlock-keychain", "-p", password, str(keychain))
    run("security", "import", str(p12), "-k", str(keychain),
        "-P", os.environ["DEVELOPER_ID_CERTIFICATE_PASSWORD"], "-T", "/usr/bin/codesign")
    run("security", "set-key-partition-list", "-S", "apple-tool:,apple:,codesign:",
        "-s", "-k", password, str(keychain))
    run("codesign", "--sign", identity, "--keychain", str(keychain),
        "--timestamp", str(dmg))
    run("codesign", "--verify", "--strict", "--verbose=2", str(dmg))
    dmg_details = run("codesign", "-d", "--verbose=4", str(dmg)).stderr
    require(f"TeamIdentifier={TEAM}" in dmg_details.splitlines(),
            "Unexpected DMG signing team")
    auth = ("--key", str(key), "--key-id", os.environ["APP_STORE_CONNECT_KEY_ID"],
            "--issuer", os.environ["APP_STORE_CONNECT_ISSUER_ID"])
    submitted = run("xcrun", "notarytool", "submit", str(dmg), *auth,
                    "--output-format", "json", check=False)
    (reports / "submit.json").write_text(submitted.stdout)
    (reports / "submit.stderr.txt").write_text(submitted.stderr)
    require(submitted.returncode == 0, "DMG submission failed; inspect submit diagnostics")
    submission_id = json.loads(submitted.stdout)["id"]
    require(re.fullmatch(r"[0-9a-fA-F-]{36}", submission_id), "Invalid submission ID")
    (reports / "submission-id.txt").write_text(submission_id + "\n")
    with Path(os.environ["GITHUB_STEP_SUMMARY"]).open("a") as summary:
        summary.write(f"Override DMG notarization submission: `{submission_id}`\n\n")
    waited = run("xcrun", "notarytool", "wait", submission_id, *auth,
                 "--timeout", "20m", "--output-format", "json", check=False)
    (reports / "wait.json").write_text(waited.stdout)
    (reports / "wait.stderr.txt").write_text(waited.stderr)
    status = run("xcrun", "notarytool", "info", submission_id, *auth,
                 "--output-format", "json", check=False)
    (reports / "info.json").write_text(status.stdout)
    (reports / "info.stderr.txt").write_text(status.stderr)
    log = run("xcrun", "notarytool", "log", submission_id, *auth, check=False)
    (reports / "notarization-log.json").write_text(log.stdout)
    (reports / "notarization-log.stderr.txt").write_text(log.stderr)
    require(status.returncode == 0, "Cannot retrieve notarization status")
    require(json.loads(status.stdout).get("status") == "Accepted",
            "DMG not accepted; inspect reports. A wait timeout does not cancel Apple's submission")
    run("xcrun", "stapler", "staple", "-v", str(dmg))
    run("xcrun", "stapler", "validate", "-v", str(dmg))
    run("codesign", "--verify", "--strict", "--verbose=2", str(dmg))
    run("hdiutil", "verify", str(dmg))
    run("spctl", "--assess", "--type", "open", "--context",
        "context:primary-signature", "--verbose=2", str(dmg))
    checksum = work / checksum_name
    checksum.write_text(f"{sha256(dmg)}  {dmg_name}\n")
    for path in (dmg, checksum):
        current = draft(release_id, tag)
        require(not any(item["name"] == path.name for item in current["assets"]),
                "Refusing to replace an existing final asset")
        uploaded = api(
            f"https://uploads.github.com/repos/{REPOSITORY}/releases/{release_id}/assets?name={path.name}",
            "--method", "POST", "-H", "Content-Type: application/octet-stream",
            "--input", str(path))
        require(uploaded["name"] == path.name and uploaded["size"] == path.stat().st_size
                and uploaded["state"] == "uploaded", "Release upload did not complete")
    draft(release_id, tag)
    with Path(os.environ["GITHUB_STEP_SUMMARY"]).open("a") as summary:
        summary.write(f"Attached `{dmg_name}` and `{checksum_name}`. Release remains a draft.\n")


def main():
    os.umask(0o077)
    work = Path(os.environ["RUNNER_TEMP"]) / "override-packaging"
    if sys.argv[1:] == ["--cleanup"]:
        cleanup(work)
        return
    require(not sys.argv[1:], "Unsupported arguments")
    require(not work.exists(), "Stale signing workspace; clean up before retrying")
    reports = Path(os.environ["RUNNER_TEMP"]) / "override-reports"
    reports.mkdir(exist_ok=True)
    work.mkdir()
    try:
        package(work, reports)
    finally:
        cleanup(work)


if __name__ == "__main__":
    main()
