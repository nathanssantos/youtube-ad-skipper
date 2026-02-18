import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

describe("observers", () => {
  let startObserving: () => void;
  let stopObserving: () => void;

  beforeEach(async () => {
    vi.resetModules();
    vi.useFakeTimers();
    document.body.innerHTML = "";

    const mod = await import("../src/content/observers");
    startObserving = mod.startObserving;
    stopObserving = mod.stopObserving;
  });

  afterEach(() => {
    stopObserving();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("should start observing without throwing", () => {
    expect(() => startObserving()).not.toThrow();
  });

  it("should not throw when starting twice", () => {
    startObserving();
    expect(() => startObserving()).not.toThrow();
  });

  it("should stop observing without throwing", () => {
    startObserving();
    expect(() => stopObserving()).not.toThrow();
  });

  it("should stop even if not started", () => {
    expect(() => stopObserving()).not.toThrow();
  });

  it("should run fallback interval handler", () => {
    startObserving();

    const adButton = document.createElement("button");
    adButton.className = "ytp-ad-skip-button";
    adButton.click = vi.fn();
    document.body.appendChild(adButton);

    vi.advanceTimersByTime(5000);

    expect(adButton.click).toHaveBeenCalled();
  });

  it("should not run handlers after stopping", () => {
    startObserving();
    stopObserving();

    const adButton = document.createElement("button");
    adButton.className = "ytp-ad-skip-button";
    adButton.click = vi.fn();
    document.body.appendChild(adButton);

    vi.advanceTimersByTime(5000);

    expect(adButton.click).not.toHaveBeenCalled();
  });
});
