import { describe, it, expect, beforeEach, vi } from "vitest";
import { chromeMock } from "./setup";
import { recordSkip } from "../src/content/stats";

describe("recordSkip", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    chromeMock.storage._reset();
  });

  it("initializes stats and records the first skip", () => {
    chromeMock.storage.local.get.mockImplementation(
      (_keys: string[], callback?: (result: Record<string, unknown>) => void) => {
        if (callback) callback({});
        return Promise.resolve({});
      },
    );

    recordSkip(30);

    expect(chromeMock.storage.local.get).toHaveBeenCalledWith(["stats"], expect.any(Function));
    expect(chromeMock.storage.local.set).toHaveBeenCalledWith({
      stats: { adsSkipped: 1, timeSaved: 30 },
    });
  });

  it("increments both counters atomically in one write", () => {
    const existingStats = { adsSkipped: 5, timeSaved: 120 };
    chromeMock.storage.local.get.mockImplementation(
      (_keys: string[], callback?: (result: Record<string, unknown>) => void) => {
        if (callback) callback({ stats: existingStats });
        return Promise.resolve({ stats: existingStats });
      },
    );

    recordSkip(15);

    expect(chromeMock.storage.local.set).toHaveBeenCalledWith({
      stats: { adsSkipped: 6, timeSaved: 135 },
    });
  });

  it("counts the skip even when no time was saved", () => {
    chromeMock.storage.local.get.mockImplementation(
      (_keys: string[], callback?: (result: Record<string, unknown>) => void) => {
        if (callback) callback({ stats: { adsSkipped: 2, timeSaved: 10 } });
        return Promise.resolve({});
      },
    );

    recordSkip(0);

    expect(chromeMock.storage.local.set).toHaveBeenCalledWith({
      stats: { adsSkipped: 3, timeSaved: 10 },
    });
  });
});
