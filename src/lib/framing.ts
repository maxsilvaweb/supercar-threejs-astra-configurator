import { AnimationClip, AnimationMixer, Box3, Vector3, type Mesh, type Object3D } from "three";
import type { CarDefinition } from "./schema";

const box = new Box3();
const size = new Vector3();
const center = new Vector3();
const vertex = new Vector3();

function materialName(material: Mesh["material"], index: number) {
  const entry = Array.isArray(material) ? material[index] : material;
  return entry && "name" in entry ? String(entry.name) : "";
}

function lowestMaterialPoint(mesh: Mesh, pattern: RegExp) {
  const geometry = mesh.geometry;
  const position = geometry.getAttribute("position");
  if (!position) return Infinity;

  const groups =
    geometry.groups.length > 0
      ? geometry.groups
      : [{ start: 0, count: position.count, materialIndex: 0 }];

  let minY = Infinity;
  mesh.updateWorldMatrix(true, false);

  for (const group of groups) {
    if (!pattern.test(materialName(mesh.material, group.materialIndex ?? 0))) continue;
    const index = geometry.index;
    const end = group.start + group.count;
    for (let i = group.start; i < end; i += 1) {
      vertex.fromBufferAttribute(position, index ? index.getX(i) : i);
      vertex.applyMatrix4(mesh.matrixWorld);
      if (vertex.y < minY) minY = vertex.y;
    }
  }

  return minY;
}

function lowestPoint(root: Object3D, detect?: string) {
  let minY = Infinity;
  const pattern = detect ? new RegExp(detect, "i") : null;

  root.traverse((object) => {
    if (pattern && object.name && pattern.test(object.name)) {
      box.setFromObject(object);
      if (!box.isEmpty()) minY = Math.min(minY, box.min.y);
    }

    const mesh = object as Mesh;
    if (!mesh.isMesh || !pattern) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    if (!materials.some((material) => material?.name && pattern.test(material.name))) return;
    minY = Math.min(minY, lowestMaterialPoint(mesh, pattern));
  });

  if (!Number.isFinite(minY)) {
    box.setFromObject(root);
    minY = box.min.y;
  }

  return minY;
}

/** Valhalla's rear wing is skinned; without this clip the bind pose leaves it floating. */
export function poseClosedSpoilers(root: Object3D, clips: AnimationClip[]) {
  const clip = clips.find((entry) => /SpoilerClose/i.test(entry.name));
  if (!clip) return;
  const mixer = new AnimationMixer(root);
  mixer.clipAction(clip).play();
  mixer.setTime(clip.duration);
}

export function frameModel(root: Object3D, car: CarDefinition) {
  root.position.set(0, 0, 0);
  root.rotation.set(0, car.yaw ?? 0, 0);
  root.scale.setScalar(1);
  if (car.slug === "toyota-supra-mk5") {
    const pads: Object3D[] = [];
    root.traverse((object) => {
      if (/^Plane\.?028$/.test(object.name)) pads.push(object);
    });
    for (const pad of pads) pad.removeFromParent();
  }
  root.updateMatrixWorld(true);

  box.setFromObject(root);
  box.getSize(size);
  const longest = Math.max(size.x, size.y, size.z) || 1;
  root.scale.setScalar(car.targetLength / longest);
  root.updateMatrixWorld(true);

  box.setFromObject(root);
  box.getCenter(center);
  root.position.x -= center.x;
  root.position.z -= center.z;
  root.updateMatrixWorld(true);

  const ground = lowestPoint(root, car.wheelDetect);
  root.position.y -= ground - 0.006;
  root.updateMatrixWorld(true);
}

export function sitOnGround(root: Object3D, floorY = 0, detect?: string) {
  root.updateMatrixWorld(true);
  const ground = lowestPoint(root, detect);
  if (!Number.isFinite(ground)) return;
  root.position.y += floorY - ground + 0.012;
  root.updateMatrixWorld(true);
}

export function modelSize(root: Object3D) {
  box.setFromObject(root);
  box.getSize(size);
  box.getCenter(center);
  return { size: size.clone(), center: center.clone(), box: box.clone() };
}
