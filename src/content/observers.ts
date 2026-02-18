import { tryClickSkipButton } from "./handlers/skip-button";
import { closeOverlayAds } from "./handlers/overlay-ads";
import { handleUnskippableAd } from "./handlers/unskippable-ads";
import { removeSidebarAds } from "./handlers/sidebar-ads";
import { dismissAntiAdblock } from "./handlers/anti-adblock";

const FALLBACK_INTERVAL_MS = 5000;

const runAllHandlers = (): void => {
  tryClickSkipButton();
  handleUnskippableAd();
  closeOverlayAds();
  removeSidebarAds();
  dismissAntiAdblock();
};

let observer: MutationObserver | null = null;
let fallbackTimer: ReturnType<typeof setInterval> | null = null;

export const startObserving = (): void => {
  if (observer) return;

  observer = new MutationObserver((mutations) => {
    let shouldRun = false;

    for (const mutation of mutations) {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        shouldRun = true;
        break;
      }
      if (
        mutation.type === "attributes" &&
        (mutation.attributeName === "class" || mutation.attributeName === "style")
      ) {
        shouldRun = true;
        break;
      }
    }

    if (shouldRun) {
      runAllHandlers();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "style"],
  });

  fallbackTimer = setInterval(runAllHandlers, FALLBACK_INTERVAL_MS);

  runAllHandlers();
};

export const stopObserving = (): void => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  if (fallbackTimer !== null) {
    clearInterval(fallbackTimer);
    fallbackTimer = null;
  }
};
