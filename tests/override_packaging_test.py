import importlib.util
import io
import json
import os
from pathlib import Path
import plistlib
import shutil
import stat
import subprocess
import tempfile
import unittest
import zipfile
from unittest.mock import patch

spec = importlib.util.spec_from_file_location(
    "packaging", Path(__file__).resolve().parents[1] / "scripts/package-override.py")
packaging = importlib.util.module_from_spec(spec)
spec.loader.exec_module(packaging)


class PackagingTests(unittest.TestCase):
    def archive(self, names, links=()):
        data = io.BytesIO()
        with zipfile.ZipFile(data, "w") as archive:
            for name in names:
                archive.writestr(name, "fixture")
            for name, target in links:
                entry = zipfile.ZipInfo(name)
                entry.create_system = 3
                entry.external_attr = (stat.S_IFLNK | 0o777) << 16
                archive.writestr(entry, target)
        data.seek(0)
        return zipfile.ZipFile(data)

    def test_inputs(self):
        self.assertEqual(packaging.inputs(
            "override-v0.1.0", "Override.0.1.0.developer-id.zip"), "0.1.0")
        for tag, asset in [
            ("override-v01.1.0", "Override.01.1.0.developer-id.zip"),
            ("override-v0.1.0;echo bad", "Override.0.1.0.developer-id.zip"),
            ("override-v0.1.0", "../Override.0.1.0.developer-id.zip"),
            ("override-v0.1.0", "Override.0.2.0.developer-id.zip"),
        ]:
            with self.subTest(tag=tag, asset=asset), self.assertRaises(ValueError):
                packaging.inputs(tag, asset)

    def test_valid_nested_export_and_framework_links(self):
        with self.archive(
            ["Export/Override.app/Contents/Info.plist",
             "Export/Override.app/Contents/Frameworks/F.framework/Versions/A/F"],
            [("Export/Override.app/Contents/Frameworks/F.framework/Versions/Current", "A"),
             ("Export/Override.app/Contents/Frameworks/F.framework/F", "Versions/Current/F")]
        ) as archive:
            self.assertEqual(str(packaging.archive_app(archive)), "Export/Override.app")

    def test_rejects_unsafe_archives(self):
        for names, links in [
            (["../Override.app/Contents/Info.plist"], []),
            (["/Override.app/Contents/Info.plist"], []),
            (["Override.app\\Contents\\Info.plist"], []),
            (["Override.app/./Contents/Info.plist"], []),
            (["Override.app/Contents/Info.plist", "Other.app/Contents/Info.plist"], []),
            (["Override.app/Contents/Info.plist"],
             [("Override.app/escape", "../../outside")]),
            (["Override.app/Contents/Info.plist"],
             [("Override.app/escape", "/Applications")]),
            (["Override.app/Contents/Info.plist", "Override.app/link/file"],
             [("Override.app/link", "Contents")]),
            (["Override.app/Contents/Info.plist"],
             [("outside", "Override.app")]),
            (["Override.app/Contents/file", "Override.app/contents/other"], []),
            (["Override.app/Caf\u00e9/file", "Override.app/Cafe\u0301/other"], []),
            (["Override.app/Contents:Info.plist"], []),
        ]:
            with self.subTest(names=names, links=links), self.archive(names, links) as archive:
                with self.assertRaises(ValueError):
                    packaging.archive_app(archive)

    def test_size_limit(self):
        with self.archive(["Override.app/Contents/Info.plist"]) as archive:
            with patch.object(packaging, "MAX_UNPACKED", 1), self.assertRaises(ValueError):
                packaging.archive_app(archive)

    def test_app_identity_and_notarization_fail_closed(self):
        with tempfile.TemporaryDirectory() as directory:
            app = Path(directory) / "Override.app"
            (app / "Contents").mkdir(parents=True)
            for bundle, version, team, source in [
                (packaging.BUNDLE, "0.1.0", packaging.TEAM, "Notarized Developer ID"),
                ("com.example.other", "0.1.0", packaging.TEAM, "Notarized Developer ID"),
                (packaging.BUNDLE, "0.2.0", packaging.TEAM, "Notarized Developer ID"),
                (packaging.BUNDLE, "0.1.0", "OTHERTEAM", "Notarized Developer ID"),
                (packaging.BUNDLE, "0.1.0", packaging.TEAM, "Developer ID"),
            ]:
                (app / "Contents/Info.plist").write_bytes(plistlib.dumps({
                    "CFBundleIdentifier": bundle, "CFBundleShortVersionString": version,
                }))

                def fake_run(*args):
                    return subprocess.CompletedProcess(args, 0, "", (
                        f"TeamIdentifier={team}\nAuthority=Developer ID Application: Fixture\n"
                        if args[0] == "codesign" else f"source={source}"))

                with patch.object(packaging, "run", side_effect=fake_run):
                    if (bundle, version, team, source) == (
                            packaging.BUNDLE, "0.1.0", packaging.TEAM, "Notarized Developer ID"):
                        packaging.validate_app(app, "0.1.0")
                    else:
                        with self.assertRaises(ValueError):
                            packaging.validate_app(app, "0.1.0")

    def test_release_must_remain_same_draft(self):
        for release in [
            {"draft": False, "tag_name": "override-v0.1.0"},
            {"draft": True, "tag_name": ""},
            {"draft": True, "tag_name": "override-v0.2.0"},
        ]:
            with patch.object(packaging, "api", return_value=release):
                with self.assertRaises(ValueError):
                    packaging.draft(123, "override-v0.1.0")

    def test_notarization_pipeline_and_upload_gates(self):
        for failure in (None, "app-staple", "Invalid", "In Progress", "dmg-staple",
                        "draft-changed"):
            with self.subTest(failure=failure), tempfile.TemporaryDirectory() as directory:
                root = Path(directory)
                work, reports = root / "work", root / "reports"
                work.mkdir()
                reports.mkdir()
                calls, uploads = [], []
                asset = {"id": 7, "name": "Override.0.1.0.developer-id.zip"}
                release = {"id": 12, "draft": True, "tag_name": "override-v0.1.0",
                           "assets": [asset]}
                archive_bytes = io.BytesIO()
                with zipfile.ZipFile(archive_bytes, "w") as archive:
                    archive.writestr("Override.app/Contents/Info.plist", plistlib.dumps({
                        "CFBundleIdentifier": packaging.BUNDLE,
                        "CFBundleShortVersionString": "0.1.0",
                    }))
                asset["size"] = len(archive_bytes.getvalue())
                environment = {
                    "RELEASE_TAG": "override-v0.1.0",
                    "INPUT_ASSET": asset["name"],
                    "GITHUB_REPOSITORY": packaging.REPOSITORY,
                    "GITHUB_REF": "refs/heads/main",
                    "APPLE_TEAM_ID": packaging.TEAM,
                    "DEVELOPER_ID_APPLICATION": f"Developer ID Application: Fixture ({packaging.TEAM})",
                    "DEVELOPER_ID_CERTIFICATE_P12_BASE64": "Zml4dHVyZQ==",
                    "DEVELOPER_ID_CERTIFICATE_PASSWORD": "fixture",
                    "RELEASE_KEYCHAIN_PASSWORD": "fixture",
                    "APP_STORE_CONNECT_API_KEY_P8_BASE64": "Zml4dHVyZQ==",
                    "APP_STORE_CONNECT_KEY_ID": "fixture",
                    "APP_STORE_CONNECT_ISSUER_ID": "fixture",
                    "GITHUB_STEP_SUMMARY": str(root / "summary"),
                }

                def fake_download(args, **kwargs):
                    kwargs["stdout"].write(archive_bytes.getvalue())
                    return subprocess.CompletedProcess(args, 0, b"", b"")

                def fake_api(endpoint, *args):
                    if endpoint.startswith("https://uploads."):
                        self.assertTrue(any(call[:3] == ("xcrun", "stapler", "validate")
                                            and call[-1].endswith(".dmg") for call in calls))
                        path = Path(args[-1])
                        uploads.append(path.name)
                        return {"name": path.name, "size": path.stat().st_size,
                                "state": "uploaded"}
                    if failure == "draft-changed" and (reports / "info.json").exists():
                        return {**release, "draft": False}
                    return release

                def fake_run(*args, **kwargs):
                    calls.append(args)
                    stdout, stderr = "", ""
                    if args[:3] == ("ditto", "-x", "-k"):
                        with zipfile.ZipFile(args[3]) as archive:
                            archive.extractall(args[4])
                    elif args[0] == "ditto":
                        shutil.copytree(args[1], args[2])
                    elif args[0] == "hdiutil" and args[1] == "create":
                        Path(args[-1]).write_bytes(b"fixture dmg")
                    elif args[0] == "codesign" and args[1] == "-d":
                        stderr = (f"TeamIdentifier={packaging.TEAM}\n"
                                  "Authority=Developer ID Application: Fixture\n")
                    elif args[0] == "spctl":
                        stderr = "source=Notarized Developer ID"
                    elif args[:3] == ("xcrun", "notarytool", "submit"):
                        stdout = json.dumps({"id": "12345678-1234-1234-1234-123456789abc"})
                    elif args[:3] == ("xcrun", "notarytool", "info"):
                        stdout = json.dumps({"status": failure if failure in
                                             ("Invalid", "In Progress") else "Accepted"})
                    elif args[:3] == ("xcrun", "stapler", "staple"):
                        if ((failure == "app-staple" and args[-1].endswith(".app"))
                                or (failure == "dmg-staple" and args[-1].endswith(".dmg"))):
                            raise RuntimeError("stapling fixture failure")
                    return subprocess.CompletedProcess(args, 0, stdout, stderr)

                with patch.dict(os.environ, environment), \
                        patch.object(packaging, "api", side_effect=fake_api), \
                        patch.object(packaging, "run", side_effect=fake_run), \
                        patch.object(packaging.subprocess, "run", side_effect=fake_download):
                    if failure:
                        with self.assertRaises((ValueError, RuntimeError)):
                            packaging.package(work, reports)
                        self.assertEqual(uploads, [])
                    else:
                        packaging.package(work, reports)
                        self.assertEqual(uploads, ["Override-0.1.0.dmg",
                                                   "Override-0.1.0.dmg.sha256"])
                        app_staple = next(index for index, call in enumerate(calls)
                                          if call[:3] == ("xcrun", "stapler", "staple"))
                        create_dmg = next(index for index, call in enumerate(calls)
                                          if call[:2] == ("hdiutil", "create"))
                        self.assertLess(app_staple, create_dmg)
                        signed = [call for call in calls
                                  if call[:2] == ("codesign", "--sign")]
                        self.assertEqual(len(signed), 1)
                        self.assertTrue(signed[0][-1].endswith(".dmg"))
                        self.assertTrue((work / "stage/Applications").is_symlink())
                    if failure in ("Invalid", "In Progress"):
                        self.assertTrue((reports / "submission-id.txt").exists())
                        self.assertTrue((reports / "info.json").exists())

    def test_cleanup_runs_after_packaging_failure(self):
        with tempfile.TemporaryDirectory() as directory:
            with patch.dict(os.environ, {"RUNNER_TEMP": directory}), \
                    patch.object(packaging.sys, "argv", ["package-override.py"]), \
                    patch.object(packaging, "package", side_effect=RuntimeError("fixture")), \
                    patch.object(packaging, "cleanup") as cleanup:
                with self.assertRaises(RuntimeError):
                    packaging.main()
                cleanup.assert_called_once_with(Path(directory) / "override-packaging")


if __name__ == "__main__":
    unittest.main()
