import { describe, it, expect, beforeEach, vi } from "vitest";
import { chromeMock } from "./setup";
import { incrementStat } from "../src/content/stats";

describe("incrementStat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    chromeMock.storage._reset();
  });

  it("should initialize stats and increment adsSkipped", () => {
    chromeMock.storage.local.get.mockImplementation(
      (_keys: string[], callback?: (result: Record<string, unknown>) => void) => {
        if (callback) callback({});
        return Promise.resolve({});
      },
    );

    incrementStat("adsSkipped");

    expect(chromeMock.storage.local.get).toHaveBeenCalledWith(["stats"], expect.any(Function));
    expect(chromeMock.storage.local.set).toHaveBeenCalledWith({
      stats: { adsSkipped: 1, timeSaved: 0 },
    });
  });

  it("should increment existing stats", () => {
    const existingStats = { adsSkipped: 5, timeSaved: 120 };
    chromeMock.storage.local.get.mockImplementation(
      (_keys: string[], callback?: (result: Record<string, unknown>) => void) => {
        if (callback) callback({ stats: existingStats });
        return Promise.resolve({ stats: existingStats });
      },
    );

    incrementStat("adsSkipped");

    expect(chromeMock.storage.local.set).toHaveBeenCalledWith({
      stats: { adsSkipped: 6, timeSaved: 120 },
    });
  });

  it("should increment by custom value", () => {
    const existingStats = { adsSkipped: 0, timeSaved: 10 };
    chromeMock.storage.local.get.mockImplementation(
      (_keys: string[], callback?: (result: Record<string, unknown>) => void) => {
        if (callback) callback({ stats: existingStats });
        return Promise.resolve({ stats: existingStats });
      },
    );

    incrementStat("timeSaved", 30);

    expect(chromeMock.storage.local.set).toHaveBeenCalledWith({
      stats: { adsSkipped: 0, timeSaved: 40 },
    });
  });
});
