export const SELECTORS = {
  // Player + video elements (verified against the live YouTube DOM).
  player: "#movie_player",
  video: "video.html5-main-video",

  // Class YouTube adds to #movie_player while an ad is on the video.
  // This is the only reliable signal from a content script — the player's
  // getAdState() API lives in the page's main world and isn't reachable here.
  adShowingClass: "ad-showing",

  // Native "Skip Ad" buttons. ".ytp-skip-ad-button" is the current one
  // (confirmed live); the rest stay as fallbacks for older/experiment variants.
  skipButtons: [
    ".ytp-skip-ad-button",
    ".ytp-ad-skip-button-modern",
    ".ytp-ad-skip-button",
    'button[id^="skip-button"]',
    ".ytp-ad-skip-button-container button",
  ],

  // Close buttons for banner/overlay ads shown over a regular video.
  overlayClose: [
    ".ytp-ad-overlay-close-button",
    ".ytp-ad-overlay-close-container button",
    'button[aria-label="Close ad"]',
  ],

  // Adblock-detection popup. We only touch these primitives when the
  // enforcement message is actually present, so normal YouTube menus and
  // dialogs (which share the same backdrop/popup elements) are never broken.
  antiAdblock: {
    enforcementMessage: "ytd-enforcement-message-view-model",
    dismissButton: "#dismiss-button",
    // The adblock message lives in its own dialog. We remove THIS, never the
    // shared ytd-popup-container that every menu/dialog renders into.
    dialog: "tp-yt-paper-dialog",
    backdrop: "tp-yt-iron-overlay-backdrop",
  },
} as const;
