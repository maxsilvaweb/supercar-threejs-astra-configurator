import { useSyncExternalStore } from "react";
import type { PerspectiveCamera } from "three";

export type OverlayFrame = "closed" | "side" | "sheet";

const SIDE_QUERY = "(min-width: 768px)";

let frame: OverlayFrame = "closed";
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listen) => listen());
}

export function isSideOverlay() {
  return typeof window !== "undefined" && window.matchMedia(SIDE_QUERY).matches;
}

export function setOverlayOpen(open: boolean) {
  const next: OverlayFrame = open ? (isSideOverlay() ? "side" : "sheet") : "closed";
  if (frame === next) return;
  frame = next;
  emit();
}

export function getOverlayFrame() {
  return frame;
}

export function subscribeOverlayFrame(listen: () => void) {
  listeners.add(listen);
  return () => listeners.delete(listen);
}

export function useOverlayFrame() {
  return useSyncExternalStore(subscribeOverlayFrame, getOverlayFrame, getOverlayFrame);
}

export function watchOverlayOpen(open: boolean) {
  setOverlayOpen(open);
  if (typeof window === "undefined") return () => undefined;
  const query = window.matchMedia(SIDE_QUERY);
  const sync = () => setOverlayOpen(open);
  query.addEventListener("change", sync);
  return () => query.removeEventListener("change", sync);
}

export function applyOverlayView(
  camera: PerspectiveCamera,
  width: number,
  height: number,
  overlay: OverlayFrame,
  interior = false,
) {
  if (interior || overlay === "closed") {
    camera.clearViewOffset();
    camera.fov = interior ? 62 : width < 768 ? 46 : 34;
    camera.updateProjectionMatrix();
    return;
  }

  if (overlay === "side") {
    camera.setViewOffset(width, height, -Math.min(width * 0.14, 168), 0, width, height);
    camera.fov = width < 1100 ? 40 : 34;
  } else {
    camera.setViewOffset(width, height, 0, Math.min(height * 0.12, 120), width, height);
    camera.fov = 48;
  }
  camera.updateProjectionMatrix();
}
