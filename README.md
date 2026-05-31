# YouTube Ad Skipper

Chrome extension that automatically skips, mutes, and removes YouTube ads.

## Features

- **Skippable ads** - Clicks the "Skip" button the moment it becomes available (all known variants)
- **Unskippable ads** - Fast-forwards the ad to just before its end so it's over in a flash
- **Banner / overlay ads** - Closes banner ads shown over the video
- **Sidebar / feed ads** - Removes display, companion, and feed ad units
- **Anti-adblock popup** - Dismisses YouTube's adblock-detection popup (and only that — normal menus and dialogs are never touched)
- **Stays out of your way** - Never forces playback, so you can pause, scrub, change quality, and let a video end normally without toggling the extension off
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
    content.ts        # Entry point - starts/stops based on the enabled flag
    ad-skipper.ts     # Core: detect ads, fast-forward/skip, throttled cleanup
    selectors.ts      # DOM selectors (verified against the live YouTube DOM)
    stats.ts          # Stats tracking via chrome.storage
  background/
    service-worker.ts # Badge + keyboard-shortcut toggle
  popup/
    popup.html        # Toggle UI
    popup.css         # Popup styles
    popup.ts          # Toggle logic + stats display
```

## How It Works

The core is a single tick (`handleAds`) driven by a `MutationObserver` on the
document (coalesced to once per frame) plus a 1s fallback interval:

1. **If an ad is playing** (`#movie_player` has the `ad-showing` class), it
   seeks the ad video to just before its end (`duration - 0.1s` — seeking to the
   exact end stalls the stream on a black frame) and clicks the "Skip" button if
   it's available. Multi-ad pods are handled per-ad.
2. **If no ad is playing**, it does not touch the `<video>` at all. This is the
   key to a good experience: the extension never calls `play()`, so pausing,
   scrubbing, and a video ending all work normally.
3. **Off-player cleanup** (banner ads, feed ad units, the adblock popup) runs on
   a throttle, and the adblock dismissal only fires when YouTube's enforcement
   message is actually present, so normal menus and dialogs are never broken.

The extension can be toggled on/off via the popup or keyboard shortcut. State is
persisted in `chrome.storage.local`, and every tab reacts via `storage.onChanged`.

## License

MIT
