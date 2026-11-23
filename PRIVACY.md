# Pinprompt Privacy Policy

_Last updated: November 23, 2026_

Pinprompt does not collect, transmit, sell or share any user data.

## What the extension accesses

When you click the toolbar icon or press the shortcut, Pinprompt runs on the active tab only. While you are selecting, it reads the elements you click (tag name, accessible name, visible text and a CSS selector) and the page URL, so it can build your prompt.

## Where data is stored

Your notes are kept in the page's `sessionStorage`, inside your own browser, and are deleted when the tab is closed. You can also clear them at any time from the tray.

## What leaves your browser

Nothing. Pinprompt makes no network requests, has no server, and uses no analytics or tracking. The generated prompt is only placed on your clipboard when you click **Copy**, and you decide where to paste it.

## Permissions

- `activeTab`: access the current tab only after you start selecting.
- `scripting`: inject the selection overlay into that tab.
- `clipboardWrite`: copy the generated prompt when you click **Copy**.

## Contact

Questions about this policy can be opened as an issue at https://github.com/Lyem/pinprompt/issues.
