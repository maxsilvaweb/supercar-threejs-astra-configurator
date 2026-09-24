import { resumeAudio, tapAudio } from "./audio-bus";
import { ENGINE_SFX_STORAGE_KEY, LOW_ENGINE_NOISE, LOW_ENGINE_VOLUME } from "./constants";

let bed: HTMLAudioElement | null = null;
let wanted = false;
let enabled = readEnabled();
const listeners = new Set<(value: boolean) => void>();

function readEnabled() {
  try {
    return localStorage.getItem(ENGINE_SFX_STORAGE_KEY) !== "0";
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
    bed.src = LOW_ENGINE_NOISE;
  }
  return bed;
}

function apply() {
  if (!wanted || !enabled) {
    if (!bed) return;
    bed.pause();
    if (!wanted) bed.currentTime = 0;
    return;
  }

  const audio = ensureBed();
  tapAudio(audio);
  void resumeAudio();
  audio.volume = LOW_ENGINE_VOLUME;
  if (!audio.paused && !audio.ended) return;
  void audio.play().catch(() => {});
}

export function isEngineSfxEnabled() {
  return enabled;
}

export function subscribeEngineSfx(listener: (value: boolean) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setEngineSfxEnabled(value: boolean) {
  enabled = value;
  try {
    localStorage.setItem(ENGINE_SFX_STORAGE_KEY, value ? "1" : "0");
  } catch {
    // ignore quota
  }
  listeners.forEach((listener) => listener(value));
  apply();
}

export function startEngineLoop() {
  wanted = true;
  apply();
}

export function stopEngineLoop() {
  wanted = false;
  apply();
}
