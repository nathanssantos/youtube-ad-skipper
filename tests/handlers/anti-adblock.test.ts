import { describe, it, expect, beforeEach, vi } from "vitest";
import { dismissAntiAdblock } from "../../src/content/handlers/anti-adblock";

describe("dismissAntiAdblock", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("should click dismiss button when present", () => {
    const button = document.createElement("button");
    button.id = "dismiss-button";
    button.click = vi.fn();
    document.body.appendChild(button);

    dismissAntiAdblock();

    expect(button.click).toHaveBeenCalledOnce();
  });

  it("should hide backdrop element", () => {
    const backdrop = document.createElement("tp-yt-iron-overlay-backdrop");
    document.body.appendChild(backdrop);

    dismissAntiAdblock();

    expect(backdrop.style.display).toBe("none");
  });

  it("should remove enforcement message element", () => {
    const enforcement = document.createElement("ytd-enforcement-message-view-model");
    document.body.appendChild(enforcement);

    dismissAntiAdblock();

    expect(document.querySelector("ytd-enforcement-message-view-model")).toBeNull();
  });

  it("should remove popup container that contains enforcement message", () => {
    const popup = document.createElement("ytd-popup-container");
    const enforcement = document.createElement("ytd-enforcement-message-view-model");
    popup.appendChild(enforcement);
    document.body.appendChild(popup);

    dismissAntiAdblock();

    expect(document.querySelector("ytd-popup-container")).toBeNull();
  });

  it("should not remove popup container without enforcement message", () => {
    const popup = document.createElement("ytd-popup-container");
    const other = document.createElement("div");
    popup.appendChild(other);
    document.body.appendChild(popup);

    dismissAntiAdblock();

    expect(document.querySelector("ytd-popup-container")).not.toBeNull();
  });

  it("should resume paused video when anti-adblock was dismissed", () => {
    const enforcement = document.createElement("ytd-enforcement-message-view-model");
    document.body.appendChild(enforcement);

    const video = document.createElement("video");
    video.className = "html5-main-video";
    Object.defineProperty(video, "paused", { value: true, writable: true });
    video.play = vi.fn().mockResolvedValue(undefined);
    document.body.appendChild(video);

    dismissAntiAdblock();

    expect(video.play).toHaveBeenCalledOnce();
  });

  it("should not call play if no anti-adblock elements were found", () => {
    const video = document.createElement("video");
    video.className = "html5-main-video";
    Object.defineProperty(video, "paused", { value: true, writable: true });
    video.play = vi.fn();
    document.body.appendChild(video);

    dismissAntiAdblock();

    expect(video.play).not.toHaveBeenCalled();
  });

  it("should not call play if video is already playing", () => {
    const enforcement = document.createElement("ytd-enforcement-message-view-model");
    document.body.appendChild(enforcement);

    const video = document.createElement("video");
    video.className = "html5-main-video";
    Object.defineProperty(video, "paused", { value: false, writable: true });
    video.play = vi.fn();
    document.body.appendChild(video);

    dismissAntiAdblock();

    expect(video.play).not.toHaveBeenCalled();
  });

  it("should remove dialog overlay", () => {
    const overlay = document.createElement("yt-dialog-overlay");
    document.body.appendChild(overlay);

    dismissAntiAdblock();

    expect(document.querySelector("yt-dialog-overlay")).toBeNull();
  });

  it("should handle case when no anti-adblock elements exist", () => {
    expect(() => dismissAntiAdblock()).not.toThrow();
  });
});
