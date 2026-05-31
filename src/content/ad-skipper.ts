import { SELECTORS } from "./selectors";
import { recordSkip } from "./stats";

// Seeking to the EXACT ad duration makes the MSE ad stream stall on a black
// frame (reproduced on live ads). Stopping a hair short lets the ad fire
// "ended" naturally and hand off to the real video cleanly.
const SEEK_END_MARGIN_S = 0.1;

// Off-player banner/sidebar cleanup is not latency-sensitive, so it runs at
// most this often instead of scanning the whole document on every frame.
const CLEANUP_INTERVAL_MS = 500;

const getPlayer = (): HTMLElement | null =>
  document.querySelector<HTMLElement>(SELECTORS.player);

const getVideo = (): HTMLVideoElement | null =>
  document.querySelector<HTMLVideoElement>(SELECTORS.video);

const isAdShowing = (player: HTMLElement | null): player is HTMLElement =>
  player?.classList.contains(SELECTORS.adShowingClass) ?? false;

// --- ad handling -----------------------------------------------------------

const clickSkipButton = (): void => {
  for (const selector of SELECTORS.skipButtons) {
    const button = document.querySelector<HTMLElement>(selector);
    if (button) {
      button.click();
      return;
    }
  }
};

// Jump (almost) to the end of the ad. Returns the seconds skipped, or 0 if it
// did nothing (duration not known yet, or we already jumped this ad).
const fastForwardAd = (video: HTMLVideoElement): number => {
  const { duration, currentTime } = video;
  if (!Number.isFinite(duration) || duration <= 0) return 0;
  if (currentTime >= duration - 1) return 0;
  try {
    video.currentTime = duration - SEEK_END_MARGIN_S;
    return duration - currentTime;
  } catch {
    return 0;
  }
};

// Count each distinct ad once. A multi-ad pod keeps "ad-showing" on the whole
// time, so we key off the ad's duration changing rather than the class toggle.
let lastCountedAdDuration = 0;

const countSkippedAd = (video: HTMLVideoElement, saved: number): void => {
  if (saved <= 0 || video.duration === lastCountedAdDuration) return;
  lastCountedAdDuration = video.duration;
  recordSkip(saved);
};

// --- off-player cleanup (throttled) ----------------------------------------

const closeOverlayBanners = (): void => {
  for (const selector of SELECTORS.overlayClose) {
    document.querySelector<HTMLElement>(selector)?.click();
  }
};

const removeSidebarAds = (): void => {
  for (const selector of SELECTORS.sidebarAds) {
    document.querySelectorAll<HTMLElement>(selector).forEach((el) => el.remove());
  }
};

const dismissAntiAdblock = (): void => {
  const { enforcementMessage, dismissButton, popupContainer, backdrop } =
    SELECTORS.antiAdblock;

  // Only touch YouTube's popup primitives when the adblock-detection message is
  // actually present — otherwise we'd break every normal menu/dialog backdrop.
  const enforcement = document.querySelector<HTMLElement>(enforcementMessage);
  if (!enforcement) return;

  document.querySelector<HTMLElement>(dismissButton)?.click();
  (enforcement.closest(popupContainer) ?? enforcement).remove();
  document.querySelector<HTMLElement>(backdrop)?.remove();
  document.documentElement.style.removeProperty("overflow");
  document.body?.style.removeProperty("overflow");
};

let lastCleanup = 0;

const runCleanup = (): void => {
  closeOverlayBanners();
  removeSidebarAds();
  dismissAntiAdblock();
};

// --- main tick -------------------------------------------------------------

export const handleAds = (): void => {
  // Latency-sensitive path, every tick: detect an ad and skip it immediately.
  const player = getPlayer();
  if (isAdShowing(player)) {
    const video = getVideo();
    if (video) {
      const saved = fastForwardAd(video);
      clickSkipButton();
      countSkippedAd(video, saved);
    }
  } else {
    // No ad → never touch the <video>. This is what lets the user pause,
    // scrub, change settings, and reach the end of a video without the
    // extension fighting them.
    lastCountedAdDuration = 0;
  }

  // Throttled, latency-insensitive cleanup of off-player ad units.
  const now = Date.now();
  if (now - lastCleanup >= CLEANUP_INTERVAL_MS) {
    lastCleanup = now;
    runCleanup();
  }
};

// --- lifecycle -------------------------------------------------------------

const FALLBACK_INTERVAL_MS = 1000;

const raf: (cb: () => void) => void =
  typeof requestAnimationFrame === "function"
    ? (cb) => requestAnimationFrame(() => cb())
    : (cb) => setTimeout(cb, 16);

let observer: MutationObserver | null = null;
let fallbackTimer: ReturnType<typeof setInterval> | null = null;
let scheduled = false;

// Coalesce bursts of mutations into a single handleAds() per frame.
const schedule = (): void => {
  if (scheduled) return;
  scheduled = true;
  raf(() => {
    scheduled = false;
    handleAds();
  });
};

export const start = (): void => {
  if (observer) return;

  // React instantly to ad start / skip button appearing (both toggle classes),
  // coalesced to once per frame for performance.
  observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  });

  // Safety net in case a mutation is ever missed.
  fallbackTimer = setInterval(handleAds, FALLBACK_INTERVAL_MS);

  handleAds();
};

export const stop = (): void => {
  observer?.disconnect();
  observer = null;
  if (fallbackTimer !== null) {
    clearInterval(fallbackTimer);
    fallbackTimer = null;
  }
  scheduled = false;
};
