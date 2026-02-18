import { SELECTORS } from "../selectors";

const getVideo = (): HTMLVideoElement | null =>
  document.querySelector<HTMLVideoElement>("video.html5-main-video") ??
  document.querySelector<HTMLVideoElement>("video");

export const dismissAntiAdblock = (): void => {
  const { dismissButton, backdrop, enforcementMessage, popupContainer, dialogOverlay } =
    SELECTORS.antiAdblock;

  let dismissed = false;

  const dismiss = document.querySelector<HTMLButtonElement>(dismissButton);
  if (dismiss) {
    dismiss.click();
    dismissed = true;
  }

  const backdropEl = document.querySelector<HTMLElement>(backdrop);
  if (backdropEl) {
    backdropEl.style.display = "none";
    dismissed = true;
  }

  const popup = document.querySelector<HTMLElement>(popupContainer);
  if (popup?.querySelector(enforcementMessage)) {
    popup.remove();
    dismissed = true;
  }

  const enforcement = document.querySelector<HTMLElement>(enforcementMessage);
  if (enforcement) {
    enforcement.remove();
    dismissed = true;
  }

  const overlay = document.querySelector<HTMLElement>(dialogOverlay);
  if (overlay) {
    overlay.remove();
    dismissed = true;
  }

  if (dismissed) {
    const video = getVideo();
    if (video?.paused) {
      video.play().catch(() => {});
    }
  }
};
