import { describe, it, expect } from "vitest";
import { SELECTORS } from "../src/content/selectors";

describe("SELECTORS", () => {
  it("should target the player and video elements", () => {
    expect(SELECTORS.player).toBe("#movie_player");
    expect(SELECTORS.video).toBe("video.html5-main-video");
    expect(SELECTORS.adShowingClass).toBe("ad-showing");
  });

  it("should list skip button selectors, current one first", () => {
    expect(SELECTORS.skipButtons[0]).toBe(".ytp-skip-ad-button");
    expect(SELECTORS.skipButtons).toContain(".ytp-ad-skip-button-modern");
    expect(SELECTORS.skipButtons).toContain(".ytp-ad-skip-button");
  });

  it("should have overlay close selectors", () => {
    expect(SELECTORS.overlayClose.length).toBeGreaterThan(0);
    expect(SELECTORS.overlayClose).toContain(".ytp-ad-overlay-close-button");
  });

  it("should only act on the video, never on feed/sidebar ad units", () => {
    // We intentionally do not carry feed/sidebar selectors anymore — removing
    // those shifts the page and breaks YouTube's menus.
    expect("sidebarAds" in SELECTORS).toBe(false);
  });

  it("should NOT remove the in-player ad container", () => {
    // .video-ads is the element the ad video renders into — removing it
    // breaks the ad->content hand-off (black screen).
    const all = [...SELECTORS.skipButtons, ...SELECTORS.overlayClose];
    expect(all).not.toContain(".video-ads");
  });

  it("should have anti-adblock selectors", () => {
    expect(SELECTORS.antiAdblock.enforcementMessage).toBe("ytd-enforcement-message-view-model");
    expect(SELECTORS.antiAdblock.dismissButton).toBe("#dismiss-button");
    expect(SELECTORS.antiAdblock.backdrop).toBe("tp-yt-iron-overlay-backdrop");
    expect(SELECTORS.antiAdblock.dialog).toBe("tp-yt-paper-dialog");
  });

  it("must NOT target the shared ytd-popup-container (it holds every menu)", () => {
    expect(JSON.stringify(SELECTORS.antiAdblock)).not.toContain("ytd-popup-container");
  });

  it("should have every array selector as a non-empty string", () => {
    const all = [...SELECTORS.skipButtons, ...SELECTORS.overlayClose];
    for (const selector of all) {
      expect(typeof selector).toBe("string");
      expect(selector.length).toBeGreaterThan(0);
    }
  });
});
