---
title: Override accessibility & permissions
description: Why Override needs Accessibility permission, how to grant or revoke it, and how to pause window overrides.
---

## Why window management needs permission

Override uses macOS Accessibility access to manage other applications' windows:
for example, to move, resize, minimize, or restore a window. This is a system
permission, not a website setting.

You decide whether to grant access. Override cannot grant it for you. Without
access, dependent window-management features are unavailable; you can still
open Override's menu bar item and review Settings.

The exclamation-mark menu bar indicator means Accessibility access is needed.
It takes priority over the paused and stashed-window indicators. Granting access
is still your choice; the indicator cannot grant permission for you.

## Grant access in System Settings

1. Launch Override from Applications.
2. Open its menu bar item and choose **Settings…**.
3. Review the Accessibility explanation and status.
4. Choose **Grant Accessibility Access**. Use **Open Accessibility Settings**
   if you need to return to the permission pane.
5. In **System Settings → Privacy & Security → Accessibility**, enable Override.
   Complete any authentication yourself in macOS.
6. Return to Override's Settings and check that the status reads **Granted**.
7. Turn on **Enable window overrides**, then enable the individual behaviours
   you want.

Permission checks refresh when Override's Settings becomes active. A matching
name in System Settings is not always sufficient: macOS authorises the app's
signed identity. If access still appears missing after an upgrade, check the
running copy's path in Override Settings and the entry in System Settings.

## Denial, revocation, and native behaviour

You can turn off Override's access in the same System Settings pane. If
previously granted access is revoked, Override reports that state and stops
dependent window actions.

Use **Pause All Overrides** from the menu bar to suspend overrides while keeping
your configuration. Application exclusions let you keep native behaviour for
particular applications.

Pause bars in the menu bar indicate paused overrides, unless the higher-priority
Accessibility warning is showing. Pausing keeps your configuration. An access
warning or paused state can take precedence over the tray indicator for windows
available to restore.

Interception is best-effort. Unsupported controls, unavailable permission, or
an unsafe target can leave an action with native macOS handling.

## Shortcuts and assistive tools

Global shortcuts can be configured or disabled in Override Settings. Choose
bindings that do not conflict with your assistive tools or other applications.
Menu commands provide another path to pause, restore stashed windows, undo a
supported action, or select a snap layout.

This page explains the window-management permission and available controls.
It is not a claim that the beta has been certified with every assistive
technology.

## Get help

Email [apps@caschw.com](mailto:apps@caschw.com) with your macOS version,
Override version, the permission status shown, and the steps you tried.
Do not send private window or document content.

[Installation, upgrades, uninstall, and troubleshooting](../support/)
