const BADGE_COLORS = {
  on: "#4CAF50",
  off: "#9E9E9E",
} as const;

const updateBadge = (enabled: boolean): void => {
  const text = enabled ? "ON" : "OFF";
  const color = enabled ? BADGE_COLORS.on : BADGE_COLORS.off;

  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color });
};

const toggleEnabled = async (): Promise<void> => {
  const result = await chrome.storage.local.get(["enabled"]);
  const current = result.enabled ?? true;
  const next = !current;

  await chrome.storage.local.set({ enabled: next });
  updateBadge(next);

  const tabs = await chrome.tabs.query({ url: ["*://www.youtube.com/*", "*://m.youtube.com/*"] });
  for (const tab of tabs) {
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, { action: next ? "enable" : "disable" }).catch(() => {});
    }
  }
};

chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-extension") {
    toggleEnabled();
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["enabled", "stats"], (result) => {
    const defaults: Record<string, unknown> = {};
    if (result.enabled === undefined) defaults.enabled = true;
    if (result.stats === undefined) defaults.stats = { adsSkipped: 0, timeSaved: 0 };
    if (Object.keys(defaults).length > 0) {
      chrome.storage.local.set(defaults);
    }
    updateBadge(result.enabled ?? true);
  });
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) {
    updateBadge(changes.enabled.newValue as boolean);
  }
});
