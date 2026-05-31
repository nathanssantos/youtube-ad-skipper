import { start, stop } from "./ad-skipper";

const apply = (enabled: boolean): void => {
  if (enabled) {
    start();
  } else {
    stop();
  }
};

chrome.storage.local.get(["enabled"], (result) => {
  apply(result.enabled ?? true);
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) {
    apply(Boolean(changes.enabled.newValue));
  }
});
