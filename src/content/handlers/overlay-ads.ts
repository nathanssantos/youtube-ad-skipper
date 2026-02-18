import { SELECTORS } from "../selectors";
import { incrementStat } from "../stats";

export const closeOverlayAds = (): void => {
  for (const selector of SELECTORS.overlayClose) {
    const button = document.querySelector<HTMLButtonElement>(selector);
    if (button) {
      button.click();
      incrementStat("adsSkipped");
    }
  }

  for (const selector of SELECTORS.overlayAds) {
    const elements = document.querySelectorAll<HTMLElement>(selector);
    elements.forEach((el) => {
      el.remove();
    });
  }

  for (const selector of SELECTORS.pauseScreenAds) {
    const element = document.querySelector<HTMLElement>(selector);
    if (element) {
      element.remove();
      incrementStat("adsSkipped");
    }
  }
};
