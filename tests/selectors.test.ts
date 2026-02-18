import { describe, it, expect } from "vitest";
import { SELECTORS } from "../src/content/selectors";

describe("SELECTORS", () => {
  it("should have skip button selectors", () => {
    expect(SELECTORS.skipButtons.length).toBeGreaterThan(0);
    expect(SELECTORS.skipButtons).toContain(".ytp-ad-skip-button");
    expect(SELECTORS.skipButtons).toContain(".ytp-ad-skip-button-modern");
  });

  it("should have overlay close selectors", () => {
    expect(SELECTORS.overlayClose.length).toBeGreaterThan(0);
    expect(SELECTORS.overlayClose).toContain(".ytp-ad-overlay-close-button");
  });

  it("should have overlay ad selectors", () => {
    expect(SELECTORS.overlayAds.length).toBeGreaterThan(0);
    expect(SELECTORS.overlayAds).toContain(".ytp-ad-player-overlay");
  });

  it("should have ad playing indicator selectors", () => {
    expect(SELECTORS.adPlaying).toContain(".ad-showing");
    expect(SELECTORS.adPlaying).toContain(".ad-interrupting");
  });

  it("should have sidebar ad selectors", () => {
    expect(SELECTORS.sidebarAds.length).toBeGreaterThan(0);
    expect(SELECTORS.sidebarAds).toContain("ytd-ad-slot-renderer");
    expect(SELECTORS.sidebarAds).toContain("#masthead-ad");
  });

  it("should have anti-adblock selectors", () => {
    expect(SELECTORS.antiAdblock.dismissButton).toBe("#dismiss-button");
    expect(SELECTORS.antiAdblock.backdrop).toBe("tp-yt-iron-overlay-backdrop");
    expect(SELECTORS.antiAdblock.enforcementMessage).toBe("ytd-enforcement-message-view-model");
  });

  it("should have pause screen ad selectors", () => {
    expect(SELECTORS.pauseScreenAds.length).toBeGreaterThan(0);
    expect(SELECTORS.pauseScreenAds).toContain(".ytp-ad-action-interstitial");
  });

  it("should have all selectors as strings", () => {
    const allArraySelectors = [
      ...SELECTORS.skipButtons,
      ...SELECTORS.overlayClose,
      ...SELECTORS.overlayAds,
      ...SELECTORS.adPlaying,
      ...SELECTORS.sidebarAds,
      ...SELECTORS.pauseScreenAds,
    ];
    for (const selector of allArraySelectors) {
      expect(typeof selector).toBe("string");
      expect(selector.length).toBeGreaterThan(0);
    }
  });
});
