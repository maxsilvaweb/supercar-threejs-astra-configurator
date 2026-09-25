import { WAREHOUSE_LIGHTS_STORAGE_KEY } from "./constants";

const listeners = new Set<(level: number) => void>();

function readLevel() {
  try {
    const raw = window.localStorage.getItem(WAREHOUSE_LIGHTS_STORAGE_KEY);
    if (raw == null || raw === "") return 0.68;
    const stored = Number(raw);
    if (Number.isFinite(stored) && stored >= 0 && stored <= 1) return stored;
  } catch {
    // ignore
  }
  return 0.68;
}

let level = 0.68;

export function getWarehouseLights() {
  return level;
}

export function setWarehouseLights(next: number) {
  level = Math.min(1, Math.max(0, next));
  try {
    window.localStorage.setItem(WAREHOUSE_LIGHTS_STORAGE_KEY, String(level));
  } catch {
    // ignore quota
  }
  for (const listener of listeners) listener(level);
}

export function subscribeWarehouseLights(listener: (level: number) => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

if (typeof window !== "undefined") {
  level = readLevel();
}
