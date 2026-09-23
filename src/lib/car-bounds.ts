import { Box3, Vector3, type Object3D } from "three";

export function pointOnCarBox(root: Object3D, fractions: { x: number; y: number; z: number }, target: Vector3) {
  const box = new Box3().setFromObject(root);
  if (box.isEmpty()) return null;
  const size = box.getSize(new Vector3());
  if (size.x < 0.8 || size.z < 0.8) return null;
  return target.set(
    box.min.x + size.x * fractions.x,
    box.min.y + size.y * fractions.y,
    box.min.z + size.z * fractions.z,
  );
}
