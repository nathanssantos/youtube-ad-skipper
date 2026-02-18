import { describe, it, expect, beforeEach } from "vitest";
import { removeSidebarAds } from "../../src/content/handlers/sidebar-ads";

describe("removeSidebarAds", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("should remove ytd-ad-slot-renderer elements", () => {
    const el = document.createElement("ytd-ad-slot-renderer");
    document.body.appendChild(el);

    removeSidebarAds();

    expect(document.querySelector("ytd-ad-slot-renderer")).toBeNull();
  });

  it("should remove ytd-display-ad-renderer elements", () => {
    const el = document.createElement("ytd-display-ad-renderer");
    document.body.appendChild(el);

    removeSidebarAds();

    expect(document.querySelector("ytd-display-ad-renderer")).toBeNull();
  });

  it("should remove #masthead-ad element", () => {
    const el = document.createElement("div");
    el.id = "masthead-ad";
    document.body.appendChild(el);

    removeSidebarAds();

    expect(document.getElementById("masthead-ad")).toBeNull();
  });

  it("should remove #player-ads element", () => {
    const el = document.createElement("div");
    el.id = "player-ads";
    document.body.appendChild(el);

    removeSidebarAds();

    expect(document.getElementById("player-ads")).toBeNull();
  });

  it("should remove multiple ad elements at once", () => {
    const ad1 = document.createElement("ytd-ad-slot-renderer");
    const ad2 = document.createElement("ytd-display-ad-renderer");
    const ad3 = document.createElement("ytd-promoted-video-renderer");
    document.body.append(ad1, ad2, ad3);

    removeSidebarAds();

    expect(document.querySelector("ytd-ad-slot-renderer")).toBeNull();
    expect(document.querySelector("ytd-display-ad-renderer")).toBeNull();
    expect(document.querySelector("ytd-promoted-video-renderer")).toBeNull();
  });

  it("should handle case when no sidebar ads exist", () => {
    expect(() => removeSidebarAds()).not.toThrow();
  });
});
