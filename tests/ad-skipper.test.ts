import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { storageMock } from "./setup";

type AdSkipper = typeof import("../src/content/ad-skipper");

let handleAds: AdSkipper["handleAds"];
let start: AdSkipper["start"];
let stop: AdSkipper["stop"];

// jsdom does not implement media playback, so we build a <video> whose
// duration/currentTime are plain, assertable, writable values.
const makeVideo = (
  duration: number,
  currentTime = 0,
  bufferedEnd = duration,
): HTMLVideoElement => {
  const video = document.createElement("video");
  video.className = "video-stream html5-main-video";
  Object.defineProperty(video, "duration", { value: duration, configurable: true });
  // Minimal TimeRanges stub so fastForwardAd can read how much is buffered.
  Object.defineProperty(video, "buffered", {
    value: { length: bufferedEnd > 0 ? 1 : 0, start: () => 0, end: () => bufferedEnd },
    configurable: true,
  });
  let ct = currentTime;
  Object.defineProperty(video, "currentTime", {
    get: () => ct,
    set: (v: number) => {
      ct = v;
    },
    configurable: true,
  });
  let paused = true;
  Object.defineProperty(video, "paused", {
    get: () => paused,
    configurable: true,
  });
  video.play = vi.fn(() => {
    paused = false;
    return Promise.resolve();
  });
  video.pause = vi.fn(() => {
    paused = true;
  });
  return video;
};

const makePlayer = (adShowing: boolean): HTMLElement => {
  const player = document.createElement("div");
  player.id = "movie_player";
  if (adShowing) player.classList.add("ad-showing");
  return player;
};

describe("ad-skipper", () => {
  beforeEach(async () => {
    vi.resetModules();
    storageMock._reset();
    document.body.innerHTML = "";
    const mod = await import("../src/content/ad-skipper");
    handleAds = mod.handleAds;
    start = mod.start;
    stop = mod.stop;
  });

  afterEach(() => {
    stop();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("when no ad is playing", () => {
    it("never plays a paused video (so the user can pause) [bug #1]", () => {
      const player = makePlayer(false);
      const video = makeVideo(100, 42);
      player.appendChild(video);
      document.body.appendChild(player);

      handleAds();

      expect(video.play).not.toHaveBeenCalled();
      expect(video.currentTime).toBe(42); // untouched
    });

    it("never restarts a finished video (so it doesn't loop) [bug #3]", () => {
      // A finished video is paused at its end with no ad-showing class.
      const player = makePlayer(false);
      const video = makeVideo(100, 100);
      player.appendChild(video);
      document.body.appendChild(player);

      handleAds();

      expect(video.play).not.toHaveBeenCalled();
      expect(video.currentTime).toBe(100); // not rewound, not replayed
    });

    it("never resumes a video the user paused mid-playback [bug #1 guard]", () => {
      const player = makePlayer(false);
      const video = makeVideo(100, 42); // paused partway through, no ad
      player.appendChild(video);
      document.body.appendChild(player);

      handleAds();
      handleAds(); // repeated ticks must never fight a manual pause

      expect(video.play).not.toHaveBeenCalled();
    });
  });

  describe("resuming content after an ad (without breaking manual pause)", () => {
    it("nudges just-started content to play once, only on the ad->content edge", () => {
      const player = makePlayer(true);
      const video = makeVideo(30, 0);
      player.appendChild(video);
      document.body.appendChild(player);

      handleAds(); // ad showing → we are skipping it

      // Ad ends: content is freshly loaded, paused at the very start.
      player.classList.remove("ad-showing");
      video.currentTime = 0;
      handleAds(); // the edge → resume once

      expect(video.play).toHaveBeenCalledTimes(1);
    });

    it("does NOT resume again after the edge, so a later manual pause sticks", () => {
      const player = makePlayer(true);
      const video = makeVideo(30, 0);
      player.appendChild(video);
      document.body.appendChild(player);

      handleAds(); // ad
      player.classList.remove("ad-showing");
      video.currentTime = 0;
      handleAds(); // edge → resume (1 call)

      // User watches a bit, then pauses themselves.
      video.currentTime = 12;
      video.pause();
      handleAds();
      handleAds();

      expect(video.paused).toBe(true); // manual pause respected
      expect(video.play).toHaveBeenCalledTimes(1); // never resumed again
    });

    it("does not resume mid-video content even right after an ad", () => {
      // Edge case: content resumes from a saved position (currentTime well past
      // the start). We stay hands-off to avoid overriding any intentional state.
      const player = makePlayer(true);
      const video = makeVideo(300, 0);
      player.appendChild(video);
      document.body.appendChild(player);

      handleAds(); // ad
      player.classList.remove("ad-showing");
      video.currentTime = 120; // resumed mid-video
      handleAds(); // edge, but currentTime is not at the start

      expect(video.play).not.toHaveBeenCalled();
    });
  });

  describe("when an ad is playing", () => {
    it("fast-forwards an unskippable ad to just before its end", () => {
      const player = makePlayer(true);
      const video = makeVideo(30, 0);
      player.appendChild(video);
      document.body.appendChild(player);

      handleAds();

      expect(video.currentTime).toBeCloseTo(29.9, 5); // duration - 0.1
    });

    it("does NOT seek exactly to duration (that causes the black screen) [bug #4]", () => {
      const player = makePlayer(true);
      const video = makeVideo(30, 0);
      player.appendChild(video);
      document.body.appendChild(player);

      handleAds();

      expect(video.currentTime).toBeLessThan(30);
    });

    it("never seeks past the buffered range on a long ad (avoids the stall/freeze)", () => {
      // 190s ad, only 52s buffered: seeking to ~190 would stall the player.
      const player = makePlayer(true);
      const video = makeVideo(190, 20, 52);
      player.appendChild(video);
      document.body.appendChild(player);

      handleAds();

      expect(video.currentTime).toBeCloseTo(51.9, 5); // bufferedEnd - 0.1
      expect(video.currentTime).toBeLessThan(52); // never jumps into unbuffered territory
    });

    it("does nothing until the ad has buffered anything", () => {
      const player = makePlayer(true);
      const video = makeVideo(30, 0, 0); // nothing buffered yet
      player.appendChild(video);
      document.body.appendChild(player);

      handleAds();

      expect(video.currentTime).toBe(0);
    });

    it("clicks the current skip button when present", () => {
      const player = makePlayer(true);
      const video = makeVideo(30, 0);
      const skip = document.createElement("button");
      skip.className = "ytp-skip-ad-button";
      skip.click = vi.fn();
      player.appendChild(video);
      player.appendChild(skip);
      document.body.appendChild(player);

      handleAds();

      expect(skip.click).toHaveBeenCalled();
    });

    it("never removes the in-player ad container [bug #4]", () => {
      const player = makePlayer(true);
      const video = makeVideo(30, 0);
      const adModule = document.createElement("div");
      adModule.className = "video-ads ytp-ad-module";
      player.appendChild(video);
      player.appendChild(adModule);
      document.body.appendChild(player);

      handleAds();

      expect(document.querySelector(".video-ads")).not.toBeNull();
    });

    it("does not re-seek an ad it already fast-forwarded", () => {
      const player = makePlayer(true);
      const video = makeVideo(30, 29.9);
      player.appendChild(video);
      document.body.appendChild(player);

      handleAds();

      expect(video.currentTime).toBe(29.9); // already near the end, left alone
    });

    it("records a skip in stats", async () => {
      const player = makePlayer(true);
      const video = makeVideo(30, 0);
      player.appendChild(video);
      document.body.appendChild(player);

      handleAds();

      const { stats } = await new Promise<{ stats: { adsSkipped: number; timeSaved: number } }>(
        (resolve) => chrome.storage.local.get(["stats"], (r) => resolve(r as never)),
      );
      expect(stats.adsSkipped).toBe(1);
      expect(stats.timeSaved).toBe(30);
    });

    it("counts every ad in a multi-ad pod, not just the first [pods]", async () => {
      // A pod keeps `ad-showing` on while the ad <video> swaps duration/time.
      const player = makePlayer(true);
      const video = makeVideo(30, 0);
      player.appendChild(video);
      document.body.appendChild(player);

      handleAds(); // ad #1 (30s)

      Object.defineProperty(video, "duration", { value: 20, configurable: true });
      video.currentTime = 0;
      handleAds(); // ad #2 (20s), still under the same ad-showing session

      const { stats } = await new Promise<{ stats: { adsSkipped: number } }>((resolve) =>
        chrome.storage.local.get(["stats"], (r) => resolve(r as never)),
      );
      expect(stats.adsSkipped).toBe(2);
    });
  });

  describe("overlay / sidebar / anti-adblock cleanup", () => {
    it("clicks the close button on banner overlay ads", () => {
      const close = document.createElement("button");
      close.className = "ytp-ad-overlay-close-button";
      close.click = vi.fn();
      document.body.appendChild(close);

      handleAds();

      expect(close.click).toHaveBeenCalled();
    });

    it("leaves feed/sidebar ad units untouched (only video ads matter)", () => {
      // Removing feed ads shifts the page and breaks YouTube's menus, so we
      // must NOT touch them.
      const ad = document.createElement("ytd-ad-slot-renderer");
      document.body.appendChild(ad);

      handleAds();

      expect(document.querySelector("ytd-ad-slot-renderer")).not.toBeNull();
    });

    it("leaves normal menus alone when there is no adblock popup [bug #2]", () => {
      // The backdrop is shared by every YouTube menu/dialog. Without an
      // enforcement message present, we must not touch it.
      const backdrop = document.createElement("tp-yt-iron-overlay-backdrop");
      document.body.appendChild(backdrop);

      handleAds();

      expect(document.querySelector("tp-yt-iron-overlay-backdrop")).not.toBeNull();
    });

    it("dismisses the adblock popup only when its enforcement message exists", () => {
      const enforcement = document.createElement("ytd-enforcement-message-view-model");
      const dismiss = document.createElement("button");
      dismiss.id = "dismiss-button";
      dismiss.click = vi.fn();
      const backdrop = document.createElement("tp-yt-iron-overlay-backdrop");
      document.body.append(enforcement, dismiss, backdrop);

      handleAds();

      expect(dismiss.click).toHaveBeenCalled();
      expect(document.querySelector("ytd-enforcement-message-view-model")).toBeNull();
      expect(document.querySelector("tp-yt-iron-overlay-backdrop")).toBeNull();
    });

    it("removes the adblock dialog but KEEPS the shared popup container [menu fix]", () => {
      // The 3-dot menu and every other popup render into ytd-popup-container.
      // Dismissing the adblock popup must not delete it.
      const container = document.createElement("ytd-popup-container");
      const dialog = document.createElement("tp-yt-paper-dialog");
      const enforcement = document.createElement("ytd-enforcement-message-view-model");
      dialog.appendChild(enforcement);
      container.appendChild(dialog);
      document.body.appendChild(container);

      handleAds();

      expect(document.querySelector("ytd-enforcement-message-view-model")).toBeNull();
      expect(document.querySelector("tp-yt-paper-dialog")).toBeNull();
      expect(document.querySelector("ytd-popup-container")).not.toBeNull(); // kept!
    });

    it("resumes the video the adblock popup had paused", () => {
      const player = makePlayer(false);
      const video = makeVideo(200, 30); // paused partway through, behind the popup
      const enforcement = document.createElement("ytd-enforcement-message-view-model");
      player.appendChild(video);
      document.body.append(player, enforcement);

      handleAds();

      expect(video.play).toHaveBeenCalled();
    });
  });

  describe("lifecycle", () => {
    it("starts, double-starts, and stops without throwing", () => {
      expect(() => start()).not.toThrow();
      expect(() => start()).not.toThrow();
      expect(() => stop()).not.toThrow();
    });

    it("stops cleanly even if never started", () => {
      expect(() => stop()).not.toThrow();
    });

    it("handles ads on the fallback interval", () => {
      vi.useFakeTimers();
      const player = makePlayer(true);
      const video = makeVideo(30, 0);
      player.appendChild(video);
      document.body.appendChild(player);

      start();
      vi.advanceTimersByTime(1000);

      expect(video.currentTime).toBeCloseTo(29.9, 5);
    });

    it("stops acting after stop() is called", () => {
      vi.useFakeTimers();
      start();
      stop();

      const player = makePlayer(true);
      const video = makeVideo(30, 0);
      player.appendChild(video);
      document.body.appendChild(player);

      vi.advanceTimersByTime(3000);

      expect(video.currentTime).toBe(0); // never fast-forwarded
    });
  });
});
