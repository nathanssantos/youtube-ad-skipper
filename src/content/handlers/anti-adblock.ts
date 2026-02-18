import { SELECTORS } from "../selectors";

export const dismissAntiAdblock = (): void => {
  const { dismissButton, backdrop, enforcementMessage, popupContainer, dialogOverlay } =
    SELECTORS.antiAdblock;

  const dismiss = document.querySelector<HTMLButtonElement>(dismissButton);
  if (dismiss) {
    dismiss.click();
  }

  const backdropEl = document.querySelector<HTMLElement>(backdrop);
  if (backdropEl) {
    backdropEl.style.display = "none";
  }

  const popup = document.querySelector<HTMLElement>(popupContainer);
  if (popup?.querySelector(enforcementMessage)) {
    popup.remove();
  }

  const enforcement = document.querySelector<HTMLElement>(enforcementMessage);
  if (enforcement) {
    enforcement.remove();
  }

  const overlay = document.querySelector<HTMLElement>(dialogOverlay);
  if (overlay) {
    overlay.remove();
  }
};
