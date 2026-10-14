import importlib.util
from pathlib import Path
import tempfile
import subprocess
import sys
import unittest

from ds_store import DSStore

spec = importlib.util.spec_from_file_location(
    "packaging", Path(__file__).resolve().parents[1] / "scripts/package-override.py")
packaging = importlib.util.module_from_spec(spec)
spec.loader.exec_module(packaging)


class LayoutTests(unittest.TestCase):
    @unittest.skipUnless(sys.platform == "darwin", "Disk image mounting requires macOS")
    def test_unsigned_disk_image_preserves_layout_guide_and_link(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            stage = root / "stage"
            stage.mkdir()
            (stage / "Override.app").mkdir()
            (stage / "Override.app/fixture").write_bytes(b"unmodified")
            (stage / "Applications").symlink_to("/Applications")
            packaging.write_installer_layout(stage)
            self.assertEqual({path.name for path in stage.iterdir()}, {
                "Override.app", "Applications", "Installation Guide.txt", ".DS_Store",
            })
            dmg = root / "fixture.dmg"
            packaging.run("hdiutil", "create", "-volname", "Override",
                          "-srcfolder", str(stage), "-format", "UDZO",
                          "-fs", "HFS+", str(dmg))
            packaging.run("hdiutil", "verify", str(dmg))
            mount = root / "mounted"
            mount.mkdir()
            packaging.run("hdiutil", "attach", "-readonly", "-nobrowse",
                          "-noautoopen", "-mountpoint", str(mount), str(dmg))
            try:
                self.assertEqual((mount / "Override.app/fixture").read_bytes(), b"unmodified")
                self.assertEqual((mount / "Applications").readlink(), Path("/Applications"))
                self.assertEqual((mount / "Installation Guide.txt").read_bytes(),
                                 (stage / "Installation Guide.txt").read_bytes())
                with DSStore.open(str(mount / ".DS_Store"), "r") as store:
                    self.assertEqual(store["Override.app"]["Iloc"], (170, 120))
                    self.assertEqual(store["Applications"]["Iloc"], (470, 120))
                    self.assertEqual(store["."]["bwsp"]["WindowBounds"],
                                     "{{160, 160}, {640, 400}}")
            finally:
                packaging.run("hdiutil", "detach", str(mount))

    def test_layout_roundtrip_and_guide_leave_app_untouched(self):
        with tempfile.TemporaryDirectory() as directory:
            stage = Path(directory)
            app = stage / "Override.app"
            app.mkdir()
            (app / "fixture").write_bytes(b"unchanged app fixture")
            (stage / "Applications").symlink_to("/Applications")
            packaging.write_installer_layout(stage)
            self.assertEqual((app / "fixture").read_bytes(), b"unchanged app fixture")
            self.assertEqual(list(app.iterdir()), [app / "fixture"])
            self.assertEqual((stage / "Applications").readlink(), Path("/Applications"))
            with DSStore.open(str(stage / ".DS_Store"), "r") as store:
                self.assertEqual(store["Override.app"]["Iloc"], (170, 120))
                self.assertEqual(store["Applications"]["Iloc"], (470, 120))
                self.assertEqual(store["Installation Guide.txt"]["Iloc"], (320, 285))
                self.assertEqual(store["."]["icvl"], (b"type", b"icnv"))
                self.assertEqual(store["."]["icvp"]["arrangeBy"], "none")
                self.assertEqual(store["."]["icvp"]["iconSize"], 96.0)
                self.assertFalse(store["."]["bwsp"]["ShowSidebar"])
            guide = (stage / "Installation Guide.txt").read_text()
            for text in ("Apple silicon", "macOS 27", "Eject", "Applications",
                         "Accessibility", "Quit Override", "UNINSTALL"):
                self.assertIn(text, guide)
            self.assertEqual(
                guide, Path(packaging.__file__).with_name(
                    "override-installation-guide.txt").read_text())


if __name__ == "__main__":
    unittest.main()
