import { MUTE_STORAGE_KEY as MUTE_KEY, VOLUME_STORAGE_KEY as VOLUME_KEY } from "./constants";
const tapped = new WeakSet<HTMLMediaElement>();
const muteListeners = new Set<(muted: boolean) => void>();
const volumeListeners = new Set<(volume: number) => void>();

let muted = typeof localStorage !== "undefined" && localStorage.getItem(MUTE_KEY) === "1";
let volume = readVolume();
let ctx: AudioContext | null = null;
let mix: GainNode | null = null;
let analyser: AnalyserNode | null = null;
let output: GainNode | null = null;

function readMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

function readVolume() {
  try {
    const raw = localStorage.getItem(VOLUME_KEY);
    if (raw == null) return 1;
    const stored = Number(raw);
    if (Number.isFinite(stored) && stored >= 0 && stored <= 1) return stored;
  } catch {
    // ignore
  }
  return 1;
}

function applyOutput() {
  if (!output) return;
  output.gain.value = muted ? 0 : volume;
}

muted = readMuted();

function ensureGraph() {
  if (ctx && mix && analyser && output) return { ctx, mix, analyser, output };

  const next = new AudioContext();
  const nextMix = next.createGain();
  const nextAnalyser = next.createAnalyser();
  const nextOut = next.createGain();
  nextAnalyser.fftSize = 256;
  nextAnalyser.smoothingTimeConstant = 0.72;
  nextMix.connect(nextAnalyser);
  nextAnalyser.connect(nextOut);
  nextOut.connect(next.destination);
  nextOut.gain.value = muted ? 0 : volume;

  ctx = next;
  mix = nextMix;
  analyser = nextAnalyser;
  output = nextOut;
  return { ctx, mix, analyser, output };
}

export function isMuted() {
  return muted;
}

export function getVolume() {
  return volume;
}

export function subscribeVolume(listener: (value: number) => void) {
  volumeListeners.add(listener);
  return () => {
    volumeListeners.delete(listener);
  };
}

export function setVolume(value: number) {
  volume = Math.min(1, Math.max(0, value));
  try {
    localStorage.setItem(VOLUME_KEY, String(volume));
  } catch {
    // ignore quota
  }
  applyOutput();
  volumeListeners.forEach((listener) => listener(volume));
  void resumeAudio();
}

export function subscribeMute(listener: (value: boolean) => void) {
  muteListeners.add(listener);
  return () => {
    muteListeners.delete(listener);
  };
}

export function setMuted(value: boolean) {
  muted = value;
  try {
    localStorage.setItem(MUTE_KEY, value ? "1" : "0");
  } catch {
    // ignore quota
  }
  applyOutput();
  muteListeners.forEach((listener) => listener(value));
  void resumeAudio();
}

export async function resumeAudio() {
  const graph = ensureGraph();
  if (graph.ctx.state === "suspended") await graph.ctx.resume().catch(() => {});
}

export function getAnalyser() {
  return ensureGraph().analyser;
}

export function tapAudio(audio: HTMLMediaElement) {
  if (tapped.has(audio)) return;
  tapped.add(audio);
  audio.crossOrigin = "anonymous";
  const graph = ensureGraph();
  const source = graph.ctx.createMediaElementSource(audio);
  source.connect(graph.mix);
}
