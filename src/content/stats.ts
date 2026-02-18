type StatKey = "adsSkipped" | "timeSaved";

export const incrementStat = (key: StatKey, value = 1): void => {
  chrome.storage.local.get(["stats"], (result) => {
    const stats = result.stats ?? { adsSkipped: 0, timeSaved: 0 };
    stats[key] += value;
    chrome.storage.local.set({ stats });
  });
};
