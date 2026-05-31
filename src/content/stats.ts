interface Stats {
  adsSkipped: number;
  timeSaved: number;
}

const DEFAULT_STATS: Stats = { adsSkipped: 0, timeSaved: 0 };

// Record one skipped ad and the seconds it saved in a single read-modify-write,
// so the two counters can never clobber each other under back-to-back skips.
export const recordSkip = (secondsSaved = 0): void => {
  chrome.storage.local.get(["stats"], (result) => {
    const stats = (result.stats as Stats | undefined) ?? DEFAULT_STATS;
    chrome.storage.local.set({
      stats: {
        adsSkipped: stats.adsSkipped + 1,
        timeSaved: stats.timeSaved + Math.max(0, Math.round(secondsSaved)),
      },
    });
  });
};
