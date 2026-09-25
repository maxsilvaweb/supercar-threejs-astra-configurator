import { useLayoutEffect, useRef, type ReactNode } from "react";
import { Vector3, type Group } from "three";
import { detectedHotspotPoint } from "../../lib/cabin";
import { pointOnCarBox } from "../../lib/car-bounds";

const world = new Vector3();

export function CarHotspot({
  carRef,
  point,
  detect,
  visible = true,
  children,
}: {
  carRef: React.RefObject<Group | null>;
  point: { x: number; y: number; z: number };
  detect?: string;
  visible?: boolean;
  children: ReactNode;
}) {
  const marker = useRef<Group>(null);

  useLayoutEffect(() => {
    if (!visible) return;
    let frame = 0;
    let id = 0;

    const place = () => {
      const root = carRef.current;
      const group = marker.current;
      if (!root || !group) return false;
      const next = detect
        ? detectedHotspotPoint(root, point, detect, world)
        : pointOnCarBox(root, point, world);
      if (!next) return false;
      group.position.copy(next);
      return true;
    };

    const tick = () => {
      if (place() || frame++ > 120) return;
      id = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(id);
  }, [carRef, detect, point.x, point.y, point.z, visible]);

  if (!visible) return null;

  return <group ref={marker}>{children}</group>;
}
