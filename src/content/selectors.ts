export const SELECTORS = {
  skipButtons: [
    ".ytp-ad-skip-button",
    ".ytp-ad-skip-button-modern",
    ".ytp-skip-ad-button",
    ".videoAdUiSkipButton",
    ".ytp-ad-skip-button-text",
    "button.ytp-ad-skip-button-modern",
    ".ytp-ad-skip-button-slot",
    'button[id^="skip-button"]',
    ".ytp-ad-skip-button-container button",
  ],

  overlayClose: [
    ".ytp-ad-overlay-close-button",
    ".ytp-ad-overlay-close-container",
    'button[aria-label="Close ad"]',
    ".ytp-ad-overlay-close-button button",
  ],

  overlayAds: [
    ".ytp-ad-player-overlay",
    ".ytp-ad-player-overlay-layout",
    ".ytp-ad-image-overlay",
    ".ytp-ad-overlay-container",
    ".ytp-ad-overlay-slot",
    ".video-ads",
    ".ytp-ad-text-overlay",
  ],

  adPlaying: [
    ".ad-showing",
    ".ad-interrupting",
  ],

  sidebarAds: [
    "ytd-action-companion-ad-renderer",
    "ytd-display-ad-renderer",
    "ytd-ad-slot-renderer",
    "ytd-promoted-sparkles-web-renderer",
    "ytd-promoted-video-renderer",
    "ytd-in-feed-ad-layout-renderer",
    "ytd-banner-promo-renderer",
    "ytd-statement-banner-renderer",
    "#player-ads",
    "#masthead-ad",
    "#panels ads",
    "#related ytd-ad-slot-renderer",
    "#below ytd-ad-slot-renderer",
    "ytd-merch-shelf-renderer",
    "ytd-engagement-panel-section-list-renderer[target-id='engagement-panel-ads']",
    "ad-slot-renderer",
  ],

  antiAdblock: {
    dismissButton: "#dismiss-button",
    backdrop: "tp-yt-iron-overlay-backdrop",
    enforcementMessage: "ytd-enforcement-message-view-model",
    popupContainer: "ytd-popup-container",
    dialogOverlay: "yt-dialog-overlay",
  },

  pauseScreenAds: [
    ".ytp-ad-action-interstitial",
    ".ytp-ad-action-interstitial-background-container",
    ".ytp-ad-player-overlay-instream-info",
  ],
} as const;
