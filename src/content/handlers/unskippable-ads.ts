import { SELECTORS } from "../selectors";
import { incrementStat } from "../stats";

interface SavedVideoState {
  muted: boolean;
  volume: number;
  playbackRate: number;
}

let savedState: SavedVideoState | null = null;
let isHandlingUnskippable = false;

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

export const handleUnskippableAd = (): void => {
  const video = getVideo();
  if (!video) return;

  if (!isAdPlaying()) {
    if (isHandlingUnskippable) {
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

  try {
    video.currentTime = video.duration || video.currentTime;
  } catch {
    // Some ads prevent seeking - mute is still active
  }
};
