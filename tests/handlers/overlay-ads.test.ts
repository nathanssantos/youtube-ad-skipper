import { describe, it, expect, beforeEach, vi } from "vitest";
import { closeOverlayAds } from "../../src/content/handlers/overlay-ads";

describe("closeOverlayAds", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("should click overlay close button when present", () => {
    const button = document.createElement("button");
    button.className = "ytp-ad-overlay-close-button";
    button.click = vi.fn();
    document.body.appendChild(button);

    closeOverlayAds();

    expect(button.click).toHaveBeenCalledOnce();
  });

  it("should remove overlay ad elements from DOM", () => {
    const overlay = document.createElement("div");
    overlay.className = "ytp-ad-player-overlay";
    document.body.appendChild(overlay);

    const imageOverlay = document.createElement("div");
    imageOverlay.className = "ytp-ad-image-overlay";
    document.body.appendChild(imageOverlay);

    closeOverlayAds();

    expect(document.querySelector(".ytp-ad-player-overlay")).toBeNull();
    expect(document.querySelector(".ytp-ad-image-overlay")).toBeNull();
  });

  it("should remove pause screen ad elements", () => {
    const pauseAd = document.createElement("div");
    pauseAd.className = "ytp-ad-action-interstitial";
    document.body.appendChild(pauseAd);

    closeOverlayAds();

    expect(document.querySelector(".ytp-ad-action-interstitial")).toBeNull();
  });

  it("should handle case when no overlays exist", () => {
    expect(() => closeOverlayAds()).not.toThrow();
  });

  it("should remove multiple overlay elements of the same type", () => {
    for (let i = 0; i < 3; i++) {
      const el = document.createElement("div");
      el.className = "video-ads";
      document.body.appendChild(el);
    }

    closeOverlayAds();

    expect(document.querySelectorAll(".video-ads")).toHaveLength(0);
  });
});
