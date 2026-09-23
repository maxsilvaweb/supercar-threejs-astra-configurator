import { useEffect } from "react";
import {
  Matrix4,
  Mesh,
  MeshPhysicalMaterial,
  NoColorSpace,
  PlaneGeometry,
  Quaternion,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
  type Group,
  type Texture,
} from "three";
import { ENZO_SIDE_DECAL, ENZO_SIDE_DECAL_ALPHA } from "../../lib/constants";
import type { CarDefinition } from "../../lib/schema";

const loader = new TextureLoader();
const cache = new Map<string, Texture>();
const up = new Vector3(0, 1, 0);
const xAxis = new Vector3();
const yAxis = new Vector3();
const zAxis = new Vector3();

function texture(url: string, colorSpace: typeof SRGBColorSpace | typeof NoColorSpace) {
  const key = `${colorSpace}:${url}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const next = loader.load(url);
  next.colorSpace = colorSpace;
  next.flipY = true;
  next.anisotropy = 16;
  cache.set(key, next);
  return next;
}

function orient(normal: Vector3) {
  zAxis.copy(normal).normalize();
  xAxis.crossVectors(up, zAxis);
  if (xAxis.lengthSq() < 1e-8) xAxis.set(1, 0, 0).cross(zAxis);
  xAxis.normalize();
  yAxis.crossVectors(zAxis, xAxis).normalize();
  return new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(xAxis, yAxis, zAxis));
}

const PLACEMENTS = [
  { position: new Vector3(-0.8, 0.684, 1.149), normal: new Vector3(0, 0, 1) },
  { position: new Vector3(-0.8, 0.684, -1.153), normal: new Vector3(0, 0, -1) },
];

export function CarDecals({ car, root }: { car: CarDefinition; root: Group }) {
  useEffect(() => {
    if (car.slug !== "ferrari-enzo") return;

    const material = new MeshPhysicalMaterial({
      map: texture(ENZO_SIDE_DECAL, SRGBColorSpace),
      alphaMap: texture(ENZO_SIDE_DECAL_ALPHA, NoColorSpace),
      transparent: true,
      alphaTest: 0.45,
      roughness: 0.3,
      metalness: 0.05,
      envMapIntensity: 0.7,
      depthWrite: true,
      polygonOffset: true,
      polygonOffsetFactor: -8,
      polygonOffsetUnits: -8,
    });
    const geometry = new PlaneGeometry(0.105, 0.148);
    const meshes = PLACEMENTS.map((slot) => {
      const mesh = new Mesh(geometry, material);
      mesh.position.copy(slot.position);
      mesh.quaternion.copy(orient(slot.normal));
      mesh.renderOrder = 2;
      root.add(mesh);
      return mesh;
    });

    return () => {
      for (const mesh of meshes) {
        root.remove(mesh);
      }
      geometry.dispose();
      material.dispose();
    };
  }, [car.slug, root]);

  return null;
}
