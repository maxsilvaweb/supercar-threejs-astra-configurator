import { resumeAudio, tapAudio } from "./audio-bus";
import { INTERFACE_SFX_STORAGE_KEY } from "./constants";

const cache = new Map<string, HTMLAudioElement>();
const warming = new Set<string>();
let enabled = readEnabled();
const listeners = new Set<(value: boolean) => void>();

function readEnabled() {
  try {
    return localStorage.getItem(INTERFACE_SFX_STORAGE_KEY) !== "0";
  } catch {
    return true;
  }
}

export function isInterfaceSfxEnabled() {
  return enabled;
}

export function subscribeInterfaceSfx(listener: (value: boolean) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setInterfaceSfxEnabled(value: boolean) {
  enabled = value;
  try {
    localStorage.setItem(INTERFACE_SFX_STORAGE_KEY, value ? "1" : "0");
  } catch {
    // ignore quota
  }
  listeners.forEach((listener) => listener(value));
}

function getAudio(src: string): HTMLAudioElement {
  let audio = cache.get(src);
  if (!audio) {
    audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.preload = "auto";
    audio.src = src;
    cache.set(src, audio);
  }
  return audio;
}

export async function playOneShotSound(src: string, volume = 0.85, retryOnGesture = false): Promise<void> {
  if (!enabled) return;
  const audio = getAudio(src);
  tapAudio(audio);
  void resumeAudio();
  audio.volume = volume;
  audio.currentTime = 0;
  try {
    await audio.play();
  } catch {
    if (!retryOnGesture) return;
    const resume = () => {
      if (!enabled) return;
      audio.currentTime = 0;
      void audio.play().catch(() => {});
    };
    window.addEventListener("pointerdown", resume, { once: true });
  }
}

export function preloadSound(src: string): void {
  const audio = getAudio(src);
  audio.load();
  if (warming.has(src)) return;
  warming.add(src);
  void fetch(src, { cache: "force-cache" }).catch(() => {});
}

export function preloadSounds(urls: Array<string | undefined>) {
  for (const url of urls) {
    if (url) preloadSound(url);
  }
}
