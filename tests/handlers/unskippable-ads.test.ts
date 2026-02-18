import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

describe("handleUnskippableAd", () => {
  let handleUnskippableAd: () => void;

  beforeEach(async () => {
    document.body.innerHTML = "";
    vi.resetModules();
    const module = await import("../../src/content/handlers/unskippable-ads");
    handleUnskippableAd = module.handleUnskippableAd;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createVideo = (opts: Partial<HTMLVideoElement> = {}): HTMLVideoElement => {
    const video = document.createElement("video");
    video.className = "html5-main-video";
    Object.assign(video, { volume: 0.8, muted: false, playbackRate: 1, ...opts });
    document.body.appendChild(video);
    return video;
  };

  const addAdShowingClass = (): void => {
    const container = document.createElement("div");
    container.className = "ad-showing";
    document.body.appendChild(container);
  };

  it("should do nothing when no video element exists", () => {
    addAdShowingClass();
    expect(() => handleUnskippableAd()).not.toThrow();
  });

  it("should do nothing when no ad is playing", () => {
    const video = createVideo();
    handleUnskippableAd();
    expect(video.muted).toBe(false);
    expect(video.playbackRate).toBe(1);
  });

  it("should mute and speed up when unskippable ad is playing", () => {
    const video = createVideo();
    addAdShowingClass();

    handleUnskippableAd();

    expect(video.muted).toBe(true);
  });

  it("should still skip ad even when skip button is available", () => {
    const video = createVideo();
    addAdShowingClass();

    const skipButton = document.createElement("button");
    skipButton.className = "ytp-ad-skip-button";
    document.body.appendChild(skipButton);

    handleUnskippableAd();

    expect(video.muted).toBe(true);
  });

  it("should restore video state when ad stops", () => {
    const video = createVideo({ volume: 0.6, muted: false, playbackRate: 1.5 });
    addAdShowingClass();

    handleUnskippableAd();
    expect(video.muted).toBe(true);

    document.querySelector(".ad-showing")!.remove();

    handleUnskippableAd();
    expect(video.muted).toBe(false);
    expect(video.volume).toBe(0.6);
    expect(video.playbackRate).toBe(1.5);
  });

  it("should handle video without html5-main-video class", () => {
    const video = document.createElement("video");
    document.body.appendChild(video);
    addAdShowingClass();

    handleUnskippableAd();

    expect(video.muted).toBe(true);
  });
});
