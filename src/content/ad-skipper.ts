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

// Jump toward the end of the ad. Returns the seconds skipped, or 0 if there is
// nothing to skip to yet.
//
// Critically, we never seek past the buffered range. Seeking to an unbuffered
// position (e.g. the exact end of a long, half-loaded ad) makes the player
// stall fetching that segment — readyState drops to 0 and the ad freezes on a
// black/skip frame for seconds. So we cap the target at what's already loaded
// and let the next ticks ride the buffer forward as the ad downloads.
const fastForwardAd = (video: HTMLVideoElement): number => {
  const { duration, currentTime, buffered } = video;
  if (!Number.isFinite(duration) || duration <= 0) return 0;

  const bufferedEnd = buffered.length ? buffered.end(buffered.length - 1) : 0;
  const target = Math.min(duration, bufferedEnd) - SEEK_END_MARGIN_S;
  if (target <= currentTime + SEEK_END_MARGIN_S) return 0;

  try {
    video.currentTime = target;
    return target - currentTime;
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

// Skipping an ad with a seek can leave the freshly loaded content paused
// (its "play" was never resumed because the ad "ended" via a seek). Nudge the
// just-started content back to playing — ONLY at the very start, and only on
// the ad->content edge (see handleAds). We never call play() on any other tick,
// so pausing a video yourself always sticks.
const resumeStartingContent = (): void => {
  const video = getVideo();
  if (video && video.paused && video.currentTime < 1) {
    video.play().catch(() => {});
  }
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
let wasAdShowing = false;

const runCleanup = (): void => {
  closeOverlayBanners();
  removeSidebarAds();
  dismissAntiAdblock();
};

// --- main tick -------------------------------------------------------------

export const handleAds = (): void => {
  // Latency-sensitive path, every tick: detect an ad and skip it immediately.
  const player = getPlayer();
  const adShowing = isAdShowing(player);

  if (adShowing) {
    const video = getVideo();
    if (video) {
      const saved = fastForwardAd(video);
      clickSkipButton();
      countSkippedAd(video, saved);
    }
  } else {
    // No ad → never touch the <video>, EXCEPT a one-shot resume right when an
    // ad just ended (the ad->content edge), so a skipped ad doesn't leave the
    // next video paused. Outside that edge the video is never played, so the
    // user can pause, scrub, and let a video end without us fighting them.
    if (wasAdShowing) resumeStartingContent();
    lastCountedAdDuration = 0;
  }
  wasAdShowing = adShowing;

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
  wasAdShowing = false;
};
