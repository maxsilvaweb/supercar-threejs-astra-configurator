import { Box3, Vector3, type Mesh, type Object3D } from "three";
import { pointOnCarBox } from "./car-bounds";
import { CABIN_LOOK_AHEAD } from "./constants";
import type { CarDefinition } from "./schema";

export type CabinSide = "left" | "right";

export type LookAt = {
  position: [number, number, number];
  target: [number, number, number];
};

const vertex = new Vector3();
const eye = new Vector3();
const look = new Vector3();
const forward = new Vector3();
const wheelCenter = new Vector3();
const carBox = new Box3();
const carSize = new Vector3();
const carCenter = new Vector3();
const materialBoxCache = new WeakMap<Object3D, Map<string, Box3 | null>>();

function materialName(material: Mesh["material"], index: number) {
  const entry = Array.isArray(material) ? material[index] : material;
  return entry && "name" in entry ? String(entry.name) : "";
}

/** World AABB of faces whose material or object name matches `detect`. */
export function materialWorldBox(root: Object3D, detect: string): Box3 | null {
  const cached = materialBoxCache.get(root)?.get(detect);
  if (cached !== undefined) return cached?.clone() ?? null;

  const pattern = new RegExp(detect, "i");
  const box = new Box3();
  let found = false;

  root.updateMatrixWorld(true);
  root.traverse((object) => {
    const mesh = object as Mesh;
    if (!mesh.isMesh) return;

    const named = Boolean(object.name && pattern.test(object.name));
    const geometry = mesh.geometry;
    const position = geometry.getAttribute("position");
    if (!position) return;

    const groups =
      geometry.groups.length > 0
        ? geometry.groups
        : [{ start: 0, count: position.count, materialIndex: 0 }];

    for (const group of groups) {
      const matches =
        named || pattern.test(materialName(mesh.material, group.materialIndex ?? 0));
      if (!matches) continue;

      const index = geometry.index;
      const end = group.start + group.count;
      for (let i = group.start; i < end; i += 1) {
        vertex.fromBufferAttribute(position, index ? index.getX(i) : i);
        vertex.applyMatrix4(mesh.matrixWorld);
        if (!found) {
          box.setFromPoints([vertex]);
          found = true;
        } else {
          box.expandByPoint(vertex);
        }
      }
    }
  });

  const result = found && !box.isEmpty() ? box : null;
  const byDetect = materialBoxCache.get(root) ?? new Map<string, Box3 | null>();
  byDetect.set(detect, result);
  materialBoxCache.set(root, byDetect);
  return result;
}

function defaultSeatFractions(side: CabinSide) {
  const toward = side === "right" ? 0.68 : 0.32;
  return {
    eye: { x: toward, y: 0.42, z: 0.5 },
    look: { x: toward, y: 0.36, z: 0.7 },
  };
}

function seatFromFractions(root: Object3D, side: CabinSide, car?: CarDefinition): LookAt | null {
  const configured = car?.cabin?.[side] ?? defaultSeatFractions(side);
  const lookFractions = configured.look ?? defaultSeatFractions(side).look;
  if (!pointOnCarBox(root, configured.eye, eye)) return null;
  if (!pointOnCarBox(root, lookFractions, look)) return null;
  return { position: eye.toArray(), target: look.toArray() };
}

/**
 * Sit in the named seat. The right-hand (driver) view aims straight at the wheel
 * when a steering-wheel mesh is found; the left-hand view looks forward.
 */
export function cabinView(root: Object3D, side: CabinSide = "left", car?: CarDefinition): LookAt {
  const fallback = seatFromFractions(root, side, car);
  const wheelBox = car?.cabin?.wheelDetect
    ? materialWorldBox(root, car.cabin.wheelDetect)
    : null;

  carBox.setFromObject(root);
  carBox.getSize(carSize);
  carBox.getCenter(carCenter);

  if (wheelBox && !wheelBox.isEmpty()) {
    wheelBox.getCenter(wheelCenter);
    const behind = Math.max(carSize.z * 0.08, 0.42);
    const headAbove = Math.max(carSize.y * 0.04, 0.1);

    const lift = car?.cabin?.seatLift ?? 0;
    const back = car?.cabin?.seatBack ?? 0;
    if (side === "right") {
      eye.set(wheelCenter.x, wheelCenter.y + headAbove + lift, wheelCenter.z - behind - back);
      look.copy(wheelCenter);
      look.y += lift;
    } else {
      const seatX = carCenter.x - Math.abs(wheelCenter.x - carCenter.x);
      eye.set(seatX, wheelCenter.y + headAbove + lift, wheelCenter.z - behind - back);
      look.set(seatX, wheelCenter.y + headAbove * 0.85 + lift, wheelCenter.z + carSize.z * 0.12);
    }
    return { position: eye.toArray(), target: look.toArray() };
  }

  return (
    fallback ?? {
      position: [carCenter.x, carBox.min.y + carSize.y * 0.4, carCenter.z],
      target: [carCenter.x, carBox.min.y + carSize.y * 0.32, carCenter.z + carSize.z * 0.18],
    }
  );
}

/** Tight box around the occupant cell so the camera cannot leave the cabin. */
export function cabinBounds(root: Object3D, side: CabinSide, view: LookAt): Box3 {
  carBox.setFromObject(root);
  carBox.getSize(carSize);
  const [px, py, pz] = view.position;
  const halfX = Math.max(carSize.x * 0.16, 0.42);
  const halfZ = Math.max(carSize.z * 0.14, 0.38);
  return new Box3(
    new Vector3(
      Math.max(carBox.min.x + carSize.x * 0.18, px - halfX),
      Math.max(carBox.min.y + carSize.y * 0.18, py - 0.28),
      Math.max(carBox.min.z + carSize.z * 0.22, pz - halfZ),
    ),
    new Vector3(
      Math.min(carBox.max.x - carSize.x * 0.18, px + halfX),
      Math.min(carBox.max.y - carSize.y * 0.22, py + 0.32),
      Math.min(carBox.max.z - carSize.z * 0.12, pz + halfZ + 0.2),
    ),
  );
}

/** Sit a hotspot on a named material, falling back to AABB fractions. */
export function detectedHotspotPoint(
  root: Object3D,
  fractions: { x: number; y: number; z: number },
  detect: string | undefined,
  target: Vector3,
) {
  const hint = pointOnCarBox(root, fractions, target);
  if (!detect) return hint;
  const box = materialWorldBox(root, detect);
  if (!box || !hint) return hint;
  box.clampPoint(hint, target);
  return target;
}

/** Look-at a few centimetres ahead of the eyes so orbit becomes in-place look-around. */
export function cabinLookAround(view: LookAt): LookAt {
  eye.set(...view.position);
  look.set(...view.target);
  forward.subVectors(look, eye);
  if (forward.lengthSq() < 1e-6) forward.set(0, 0, 1);
  forward.setLength(CABIN_LOOK_AHEAD);
  look.copy(eye).add(forward);
  return { position: eye.toArray(), target: look.toArray() };
}

