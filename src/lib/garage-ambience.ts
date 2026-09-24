import { resumeAudio, tapAudio } from "./audio-bus";
import { GARAGE_AMBIENCE_STORAGE_KEY, GARAGE_VENT_URL, GARAGE_VENT_VOLUME } from "./constants";

const VOLUME = GARAGE_VENT_VOLUME;

let bed: HTMLAudioElement | null = null;
let resumeOnGesture: (() => void) | null = null;
let enabled = readEnabled();
const listeners = new Set<(value: boolean) => void>();

function readEnabled() {
  try {
    return localStorage.getItem(GARAGE_AMBIENCE_STORAGE_KEY) !== "0";
  } catch {
    return true;
  }
}

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

function clearGestureWait() {
  if (!resumeOnGesture) return;
  window.removeEventListener("pointerdown", resumeOnGesture);
  resumeOnGesture = null;
}

export function isGarageAmbienceEnabled() {
  return enabled;
}

export function subscribeGarageAmbience(listener: (value: boolean) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setGarageAmbienceEnabled(value: boolean) {
  enabled = value;
  try {
    localStorage.setItem(GARAGE_AMBIENCE_STORAGE_KEY, value ? "1" : "0");
  } catch {
    // ignore quota
  }
  listeners.forEach((listener) => listener(value));
  if (value) startGarageAmbience();
  else pauseGarageAmbience();
}

function pauseGarageAmbience() {
  clearGestureWait();
  if (!bed) return;
  bed.pause();
}

export function stopGarageAmbience() {
  clearGestureWait();
  if (!bed) return;
  bed.pause();
  bed.currentTime = 0;
}

export function startGarageAmbience(volume = VOLUME) {
  if (!enabled) return;
  const audio = ensureBed();
  tapAudio(audio);
  void resumeAudio();
  audio.volume = volume;
  if (!audio.paused && !audio.ended) return;

  const resume = () => {
    resumeOnGesture = null;
    if (!enabled) return;
    void audio.play().catch(() => {});
  };

  void audio.play().catch(() => {
    if (resumeOnGesture) return;
    resumeOnGesture = resume;
    window.addEventListener("pointerdown", resume, { once: true });
  });
}
