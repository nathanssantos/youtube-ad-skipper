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
