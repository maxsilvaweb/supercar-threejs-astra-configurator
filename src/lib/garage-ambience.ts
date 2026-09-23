import { resumeAudio, tapAudio } from "./audio-bus";
import { GARAGE_VENT_URL, GARAGE_VENT_VOLUME } from "./constants";

const VOLUME = GARAGE_VENT_VOLUME;

let bed: HTMLAudioElement | null = null;
let waitingForGesture = false;

function ensureBed() {
  if (!bed) {
    bed = new Audio();
    bed.crossOrigin = "anonymous";
    bed.loop = true;
    bed.preload = "auto";
    bed.volume = VOLUME;
    bed.src = GARAGE_VENT_URL;
  }
  return bed;
}

export function preloadGarageAmbience() {
  ensureBed();
}

export function stopGarageAmbience() {
  waitingForGesture = false;
  if (!bed) return;
  bed.pause();
  bed.currentTime = 0;
}

export function startGarageAmbience(volume = VOLUME) {
  const audio = ensureBed();
  tapAudio(audio);
  void resumeAudio();
  audio.volume = volume;
  if (!audio.paused && !audio.ended) return;

  const resume = () => {
    waitingForGesture = false;
    void audio.play().catch(() => {});
  };

  void audio.play().catch(() => {
    if (waitingForGesture) return;
    waitingForGesture = true;
    window.addEventListener("pointerdown", resume, { once: true });
  });
}