const toggle = document.getElementById("toggle") as HTMLInputElement;
const statusLabel = document.getElementById("status-label") as HTMLSpanElement;
const adsSkippedEl = document.getElementById("ads-skipped") as HTMLSpanElement;
const timeSavedEl = document.getElementById("time-saved") as HTMLSpanElement;

const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
};

const updateUI = (enabled: boolean): void => {
  toggle.checked = enabled;
  statusLabel.textContent = enabled ? "Active" : "Paused";
  statusLabel.className = `status-label ${enabled ? "active" : "paused"}`;
};

chrome.storage.local.get(["enabled", "stats"], (result) => {
  const enabled = result.enabled ?? true;
  const stats = result.stats ?? { adsSkipped: 0, timeSaved: 0 };

  updateUI(enabled);
  adsSkippedEl.textContent = String(stats.adsSkipped);
  timeSavedEl.textContent = formatTime(stats.timeSaved);
});

toggle.addEventListener("change", () => {
  const enabled = toggle.checked;
  chrome.storage.local.set({ enabled });
  updateUI(enabled);
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) {
    updateUI(changes.enabled.newValue as boolean);
  }
  if (changes.stats) {
    const stats = changes.stats.newValue as { adsSkipped: number; timeSaved: number };
    adsSkippedEl.textContent = String(stats.adsSkipped);
    timeSavedEl.textContent = formatTime(stats.timeSaved);
  }
});
