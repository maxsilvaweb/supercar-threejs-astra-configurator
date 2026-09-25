import { STUDIO_ACCENT_STORAGE_KEY } from "./constants";

export type AccentId = "lime" | "red" | "metallic" | "gold";

export type Accent = {
  id: AccentId;
  label: string;
  color: string;
  hi: string;
  lo: string;
  ink: string;
  edge: string;
  glow: string;
  outline: string;
  outlineDim: string;
  swatch?: string;
};

export const accents: Accent[] = [
  {
    id: "lime",
    label: "Lime",
    color: "#cfff00",
    hi: "#e8ff6a",
    lo: "#6d8a00",
    ink: "#111111",
    edge: "rgb(90 110 0 / 0.7)",
    glow: "rgb(207 255 0 / 0.9)",
    outline: "#cfff00",
    outlineDim: "#7a8f00",
  },
  {
    id: "red",
    label: "Red",
    color: "#e10600",
    hi: "#ff4d3a",
    lo: "#7a0810",
    ink: "#ffffff",
    edge: "rgb(120 8 12 / 0.85)",
    glow: "rgb(225 6 0 / 0.9)",
    outline: "#e10600",
    outlineDim: "#7a0810",
  },
  {
    id: "metallic",
    label: "Metallic",
    color: "#d4d7dc",
    hi: "#ffffff",
    lo: "#8b919a",
    ink: "#1a1a1c",
    edge: "rgb(210 214 220 / 0.9)",
    glow: "rgb(232 234 238 / 0.9)",
    outline: "#e8eaee",
    outlineDim: "#8b919a",
    swatch: "linear-gradient(180deg, #ffffff 0%, #d4d7dc 45%, #8b919a 100%)",
  },
  {
    id: "gold",
    label: "Gold",
    color: "#e6c15a",
    hi: "#fff6d0",
    lo: "#8a6418",
    ink: "#1a1a1c",
    edge: "rgb(180 130 40 / 0.9)",
    glow: "rgb(230 193 90 / 0.9)",
    outline: "#f0d78c",
    outlineDim: "#8a6418",
    swatch: "linear-gradient(180deg, #fff6d0 0%, #e6c15a 45%, #8a6418 100%)",
  },
];

const listeners = new Set<(accent: Accent) => void>();

function readId(): AccentId {
  const stored = window.localStorage.getItem(STUDIO_ACCENT_STORAGE_KEY);
  return accents.some((accent) => accent.id === stored) ? (stored as AccentId) : "lime";
}

let current = accents[0];

export function getAccent() {
  return current;
}

function paint(accent: Accent) {
  const mark = accent.color;
  for (const node of [document.documentElement, document.body]) {
    node.dataset.studioAccent = accent.id;
    node.style.setProperty("--studio-accent", accent.color);
    node.style.setProperty("--studio-accent-hi", accent.hi);
    node.style.setProperty("--studio-accent-lo", accent.lo);
    node.style.setProperty("--studio-accent-ink", accent.ink);
    node.style.setProperty("--studio-accent-edge", accent.edge);
    node.style.setProperty("--studio-accent-glow", accent.glow);
    node.style.setProperty("--studio-accent-mark", mark);
    node.style.setProperty("--primary", accent.color);
    node.style.setProperty("--primary-foreground", accent.ink);
    node.style.setProperty("--ring", mark);
  }
}

export function setAccent(id: AccentId) {
  const accent = accents.find((entry) => entry.id === id) ?? accents[0];
  current = accent;
  window.localStorage.setItem(STUDIO_ACCENT_STORAGE_KEY, accent.id);
  paint(accent);
  for (const listener of listeners) listener(accent);
}

export function subscribeAccent(listener: (accent: Accent) => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

if (typeof window !== "undefined") {
  current = accents.find((accent) => accent.id === readId()) ?? accents[0];
  paint(current);
}
