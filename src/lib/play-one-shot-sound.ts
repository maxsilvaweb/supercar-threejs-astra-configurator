import { resumeAudio, tapAudio } from "./audio-bus";

const cache = new Map<string, HTMLAudioElement>();

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
      audio.currentTime = 0;
      void audio.play().catch(() => {});
    };
    window.addEventListener("pointerdown", resume, { once: true });
  }
}

export function preloadSound(src: string): void {
  getAudio(src).load();
}
