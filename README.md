# YouTube Ad Skipper

Chrome extension that automatically skips, mutes, and removes YouTube ads.

## Features

- **Skip button ads** - Automatically clicks all known skip button variants
- **Unskippable ads** - Mutes and speeds up (16x) unskippable ads, restores original state after
- **Overlay ads** - Closes overlay ads and removes them from the DOM
- **Sidebar/display ads** - Removes companion ads, display ads, promoted content, and feed ads
- **Anti-adblock popup** - Dismisses YouTube's anti-adblock enforcement popups and resumes playback
- **Pause screen ads** - Removes interstitial ads shown when pausing
- **Toggle on/off** - Popup UI with toggle switch or keyboard shortcut (Ctrl+Shift+Y / Cmd+Shift+Y)
- **Stats tracking** - Counts ads skipped and time saved

## Tech Stack

- TypeScript
- esbuild (bundler)
- Vitest (testing)
- ESLint + Prettier (linting/formatting)
- Chrome Extension Manifest V3

## Setup

```bash
npm install
npm run build
```

Load the extension in Chrome:
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the project root directory

## Development

```bash
npm run build          # Bundle TypeScript to dist/
npm test               # Run tests
npm run type-check     # TypeScript type checking
npm run lint           # ESLint
npm run format         # Prettier formatting
```

## Project Structure

```
src/
  content/
    content.ts          # Entry point - init and message handling
    selectors.ts        # 25+ ad selectors organized by category
    observers.ts        # MutationObserver + fallback interval
    stats.ts            # Stats tracking via chrome.storage
    handlers/
      skip-button.ts    # Click skip button variants
      overlay-ads.ts    # Close/remove overlay ads
      unskippable-ads.ts # Mute + 16x speed for unskippable ads
      sidebar-ads.ts    # Remove sidebar/display/feed ads
      anti-adblock.ts   # Dismiss anti-adblock popups
  background/
    service-worker.ts   # Badge, shortcuts, messaging
  popup/
    popup.html          # Toggle UI
    popup.css           # Popup styles
    popup.ts            # Toggle logic + stats display
```

## How It Works

Uses a `MutationObserver` on `document.body` to detect DOM changes (new ad elements, class changes like `.ad-showing`). When changes are detected, all handlers run to skip/remove/mute ads. A fallback `setInterval` (5s) catches edge cases.

The extension can be toggled on/off via the popup or keyboard shortcut. State is persisted in `chrome.storage.local`.

## License

MIT
