import { SELECTORS } from "../selectors";

export const removeSidebarAds = (): void => {
  for (const selector of SELECTORS.sidebarAds) {
    const elements = document.querySelectorAll<HTMLElement>(selector);
    elements.forEach((el) => {
      el.remove();
    });
  }
};
