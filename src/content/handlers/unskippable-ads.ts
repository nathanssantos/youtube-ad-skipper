import { SELECTORS } from "../selectors";
import { incrementStat } from "../stats";

interface SavedVideoState {
  muted: boolean;
  volume: number;
  playbackRate: number;
}

let savedState: SavedVideoState | null = null;
let isHandlingUnskippable = false;
let skipInterval: ReturnType<typeof setInterval> | null = null;

const getVideo = (): HTMLVideoElement | null =>
  document.querySelector<HTMLVideoElement>("video.html5-main-video") ??
  document.querySelector<HTMLVideoElement>("video");

const isAdPlaying = (): boolean =>
  SELECTORS.adPlaying.some((selector) =>
    document.querySelector(selector) !== null
  );

const saveVideoState = (video: HTMLVideoElement): void => {
  if (savedState) return;
  savedState = {
    muted: video.muted,
    volume: video.volume,
    playbackRate: video.playbackRate,
  };
};

const restoreVideoState = (video: HTMLVideoElement): void => {
  if (!savedState) return;
  video.muted = savedState.muted;
  video.volume = savedState.volume;
  video.playbackRate = savedState.playbackRate;
  savedState = null;
};

const clearSkipInterval = (): void => {
  if (skipInterval !== null) {
    clearInterval(skipInterval);
    skipInterval = null;
  }
};

const trySkipToEnd = (video: HTMLVideoElement): boolean => {
  const duration = video.duration;
  if (!duration || !isFinite(duration)) return false;

  try {
    video.currentTime = duration;
    return true;
  } catch {
    return false;
  }
};

const startSkipLoop = (video: HTMLVideoElement): void => {
  if (skipInterval !== null) return;

  if (trySkipToEnd(video)) return;

  skipInterval = setInterval(() => {
    if (!isAdPlaying()) {
      clearSkipInterval();
      return;
    }
    if (trySkipToEnd(video)) {
      clearSkipInterval();
    }
  }, 100);
};

export const handleUnskippableAd = (): void => {
  const video = getVideo();
  if (!video) return;

  if (!isAdPlaying()) {
    if (isHandlingUnskippable) {
      clearSkipInterval();
      restoreVideoState(video);
      isHandlingUnskippable = false;
    }
    return;
  }

  if (!isHandlingUnskippable) {
    saveVideoState(video);
    isHandlingUnskippable = true;
    incrementStat("adsSkipped");
  }

  video.muted = true;
  startSkipLoop(video);
};
