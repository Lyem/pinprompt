# Pinprompt

🇺🇸 English · [🇧🇷 Português](README.pt-BR.md)

Chrome and Firefox extension that turns elements on a page into a prompt ready to paste into Claude, ChatGPT or any other AI. Works on any site and uses no server.

[![Firefox Add-on](https://img.shields.io/badge/Firefox-Get%20the%20add--on-FF7139?logo=firefoxbrowser&logoColor=white)](https://addons.mozilla.org/firefox/addon/pinprompt/)

## Usage

1. Click the extension icon (or press `Alt+Shift+P`). The icon shows **ON** and selection starts.
2. Hover and click an element. Write what you want changed, pick **Change** or **Question**, and click **Add** (`Ctrl+Enter`).
3. Repeat for other elements. Each one gets a numbered blue pin.
4. In the tray at the bottom right, click **Copy** and paste it into your AI.
5. Click the icon again (or press `Esc`) to stop selecting.

Annotations stay saved in the tab until it is closed. You can edit, delete or clear everything from the tray.

## Copied format

```markdown
## Design Feedback: /settings

**URL:** http://localhost:5173/settings

### 1. button "Save"
**Intent:** change
**Selector:** `#save`
**Text:** "Save changes"
**Feedback:** Make this button bigger
```

## Install

**Chrome / Chromium / Helium:** `chrome://extensions` → enable Developer mode → **Load unpacked** → pick this folder.

**Firefox (142+):** install from [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/pinprompt/). For development, run `npm run build:firefox`, then open `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on** → pick `dist/firefox/manifest.json`. To build the `.zip`: `npm run package:firefox`.

## Publishing

```sh
npm run package
```

Builds `dist/pinprompt-chrome-<version>.zip` (Chrome Web Store) and `dist/pinprompt-firefox-<version>.zip` (addons.mozilla.org). The source icon lives in `icons/source/`.

## Development

```sh
npm test
npm run lint:firefox
```

Structure:

- `manifest.json`: Chrome MV3 manifest. Firefox uses a copy generated in `dist/firefox` by `scripts/build-firefox.mjs`, which swaps `service_worker` for `scripts` and adds the Gecko id.
- `src/background.js`: injects the overlay into the tab when the icon is clicked and shows the badge.
- `src/content/overlay.js`: selection, card, pins and tray.
- `src/content/format.js`: generates the Markdown.
- `src/content/styles.js`: overlay styles (shadow DOM).

## Credits

See [PRIVACY.md](PRIVACY.md) for the privacy policy.

The prompt format and annotation logic are adapted from [Orca](https://github.com/stablyai/orca) (MIT, Lovecast Inc.). See `LICENSE`.
