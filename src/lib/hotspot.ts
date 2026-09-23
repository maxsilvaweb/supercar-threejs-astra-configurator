import type { CarDoor } from "./schema";

export function doorHotspotPoint(door: CarDoor) {
  return {
    x: door.position?.x ?? (door.side === "left" ? 0.05 : 0.95),
    y: door.position?.y ?? 0.33,
    z: door.position?.z ?? 0.62,
  };
}
