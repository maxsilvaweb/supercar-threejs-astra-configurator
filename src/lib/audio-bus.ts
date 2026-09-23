import { MUTE_STORAGE_KEY as MUTE_KEY } from "./constants";
const tapped = new WeakSet<HTMLMediaElement>();
const muteListeners = new Set<(muted: boolean) => void>();

let muted = typeof localStorage !== "undefined" && localStorage.getItem(MUTE_KEY) === "1";
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
  nextOut.gain.value = muted ? 0 : 1;

  ctx = next;
  mix = nextMix;
  analyser = nextAnalyser;
  output = nextOut;
  return { ctx, mix, analyser, output };
}

export function isMuted() {
  return muted;
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
  if (output) output.gain.value = value ? 0 : 1;
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
