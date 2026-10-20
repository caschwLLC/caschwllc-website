---
title: Override support
description: Install the Override beta, grant window access, upgrade, uninstall, and troubleshoot window management.
updatedOn: '2026-10-19'
---

Override is beta software. You may encounter bugs, and some applications expose
limited window controls to macOS Accessibility. Need help? Email
[apps@caschw.com](mailto:apps@caschw.com).

## Install Override

Use the linked beta DMG above when available.

1. Download **Override-0.1.1.dmg**.
2. Open the DMG.
3. Drag **Override** to **Applications**.
4. Eject the DMG.
5. Launch **Override** from **Applications**.

Override runs in the menu bar. Open its menu bar item and choose **Settings…**
to configure it. Optional window overrides start off.

## Grant Accessibility access

Override needs Accessibility permission to manage other applications' windows.
The user grants this permission in **System Settings → Privacy & Security →
Accessibility**; Override cannot grant it on your behalf.

An exclamation mark in the menu bar means Accessibility access is needed.
This indicator takes priority over paused overrides and windows available to
restore; it does not mean those other states have been cleared.

In Override's Settings, choose **Grant Accessibility Access** and, if needed,
**Open Accessibility Settings**. Enable Override in System Settings, then
return to Override. Its permission status refreshes when Settings becomes active.
Once permission is granted, turn on **Enable window overrides** and the
individual behaviours you want.

[Read Accessibility & permissions](../accessibility/)

## Upgrade Override

1. Choose **Quit Override** from the menu bar before replacing the installed app.
2. Open the new DMG and drag Override to Applications, replacing the existing copy.
3. Eject the DMG, then launch Override from Applications.

If permission is no longer recognised after replacing the app, return to
Accessibility settings and check the installed copy. Do not run a second copy
from the mounted DMG.

## Uninstall Override

Choose **Quit Override** from its menu bar item, then remove Override from
Applications.

Before quitting, you can optionally:

- Choose **Restore Stashed Windows** if you want Override to restore the windows
  it has minimized and remembered.
- Turn off **Launch at login** in Settings if you enabled it.
- Choose **Reset to Defaults** in Settings if you want to reset the app's
  configuration. This writes default preferences; it does not erase every
  stored preference or revoke macOS permissions.

Override stores configuration in macOS preferences. Removing the app is not a
promise that preferences or macOS permission entries have been erased. You can
manage Override's Accessibility access separately in System Settings.
Any troubleshooting reports you copied or sent remain wherever you saved or
shared them.

## A window does not respond

Check that Accessibility access is granted, **Enable window overrides** is on,
the relevant feature is enabled, and Override is not paused. Check application
exclusions and per-application rules too.

Window management depends on the controls and size limits exposed by each
application. Override may leave native behaviour in place if it cannot safely
identify or control a window. It cannot guarantee every shortcut or window-button
click will be intercepted.

**Pause All Overrides** returns to native handling without discarding your
configuration. **Restore Stashed Windows** restores remembered windows that
still exist. **Undo Last Action** reverses the most recent supported window
action only while its target still matches the recorded change.

Pause bars indicate that overrides are paused. The tray indicator means hidden
or minimized windows are available to restore. A higher-priority access warning
or paused indicator can hide the tray, so check the restore command even when
the tray is not visible.

## Report a beta problem

Include your Mac model, macOS version, Override version, affected app, steps to
reproduce, and what you expected versus what happened. Do not include private
window content, document names, or sensitive screenshots.

Override's Diagnostics settings include an optional detailed troubleshooting
mode and a report-copy command. Diagnostics are off by default; when enabled,
they generate only privacy-safe descriptions of Override's own actions for bug
identification and troubleshooting. No personal information, window titles,
content, or pointer data is included. When disabled, no diagnostics are generated.
All in-app diagnostics stay in memory and are lost immediately when you quit.
Only choosing the copy button after enabling diagnostics copies a report to the
clipboard; it does not send an email or delete copies you already saved/shared.

See [Override privacy](../privacy/) for app data and support handling.

Support email is hosted by Outlook.com/Microsoft. See
[website privacy](../../../privacy/) for email-provider disclosures and support
correspondence handling and this website's current analytics behavior. Website
analytics does not describe what the Override app reads or stores.
