import { SELECTORS } from "../selectors";
import { incrementStat } from "../stats";

export const tryClickSkipButton = (): boolean => {
  for (const selector of SELECTORS.skipButtons) {
    const button = document.querySelector<HTMLButtonElement>(selector);
    if (button) {
      button.click();
      incrementStat("adsSkipped");
      return true;
    }
  }
  return false;
};
