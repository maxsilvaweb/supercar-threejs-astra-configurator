import { Box3, Vector3, type Object3D } from "three";

export interface Hub {
  name: string;
  position: [number, number, number];
  radius: number;
}

const box = new Box3();
const center = new Vector3();
const size = new Vector3();

export function findHubs(root: Object3D, detect = "tire|wheel|rim|tyre"): Hub[] {
  const pattern = new RegExp(detect, "i");
  const hubs: Hub[] = [];

  root.traverse((object) => {
    if (!object.name || !pattern.test(object.name)) return;
    if (object.children.length > 0 && !pattern.test(object.name)) return;

    box.setFromObject(object);
    if (box.isEmpty()) return;
    box.getCenter(center);
    box.getSize(size);
    const radius = Math.max(size.x, size.z) * 0.5;
    if (radius < 0.08) return;

    const duplicate = hubs.some((hub) => {
      const dx = hub.position[0] - center.x;
      const dz = hub.position[2] - center.z;
      return Math.hypot(dx, dz) < radius * 0.4;
    });
    if (duplicate) return;

    hubs.push({
      name: object.name,
      position: [center.x, center.y, center.z],
      radius,
    });
  });

  return hubs.slice(0, 4);
}
