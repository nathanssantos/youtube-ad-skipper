import { startObserving, stopObserving } from "./observers";

const init = (): void => {
  chrome.storage.local.get(["enabled"], (result) => {
    const enabled = result.enabled ?? true;
    if (enabled) startObserving();
  });
};

chrome.runtime.onMessage.addListener((message: { action: string }) => {
  if (message.action === "enable") startObserving();
  if (message.action === "disable") stopObserving();
  return undefined;
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) {
    if (changes.enabled.newValue) {
      startObserving();
    } else {
      stopObserving();
    }
  }
});

init();
