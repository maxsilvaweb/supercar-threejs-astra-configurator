import { useGLTF } from "@react-three/drei";
import { useEffect, useLayoutEffect, useMemo } from "react";
import {
  Box3,
  Color,
  MeshStandardMaterial,
  type Group,
  type Mesh,
  type Object3D,
  Vector3,
} from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { STUDIO_GARAGE_MIN_HEIGHT as MIN_HEIGHT, STUDIO_GARAGE_MODEL as GARAGE_URL } from "../../lib/constants";
import { getWarehouseLights } from "../../lib/warehouse-lights";
const box = new Box3();
const center = new Vector3();

useGLTF.preload(GARAGE_URL);

function skipRaycast() {}

function styleGarage(root: Object3D, cinematic: boolean) {
  const light = cinematic ? 4.2 : 2.8;

  root.traverse((object) => {
    const mesh = object as Mesh;
    if (!mesh.isMesh) return;
    mesh.raycast = skipRaycast;
    mesh.castShadow = false;
    mesh.receiveShadow = true;

    const name = mesh.name.toLowerCase();
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

    if (name === "plane") {
      mesh.visible = !cinematic;
      return;
    }

    materials.forEach((material, index) => {
      if (!(material instanceof MeshStandardMaterial)) return;
      const glow =
        material.emissiveIntensity > 0.4 &&
        material.emissive.r + material.emissive.g + material.emissive.b > 0.2;
      const isLight = /жарык|lamp|light/.test(name) || glow;
      const styled = material.clone();
      const mapped = Boolean(styled.map || styled.normalMap || styled.roughnessMap);

      if (isLight) {
        const lamp = glow ? material.emissiveIntensity : mapped ? (cinematic ? 2.4 : 1.6) : light;
        styled.userData.warehouseLamp = lamp;
        if (!glow) styled.emissive = new Color(cinematic ? "#dce8ff" : "#f0f4ff");
        styled.emissiveIntensity = lamp * getWarehouseLights();
        styled.toneMapped = false;
        if (!mapped && !glow) {
          styled.color = new Color("#f4f7ff");
          styled.roughness = 0.18;
          styled.metalness = 0.05;
        }
      } else if (!mapped) {
        const isIron = name.includes("iron");
        const isSofa = name.includes("sofa");
        const isStand = name.includes("stoyka") || name.includes("cube");
        if (isIron) {
          styled.color = new Color("#2a2c31");
          styled.metalness = 0.82;
          styled.roughness = 0.38;
        } else if (isSofa) {
          styled.color = new Color("#16171b");
          styled.metalness = 0.08;
          styled.roughness = 0.86;
        } else if (isStand) {
          styled.color = new Color("#1a1b1f");
          styled.metalness = 0.45;
          styled.roughness = 0.55;
        }
      }

      styled.envMapIntensity = cinematic ? 0.95 : 0.6;
      materials[index] = styled;
    });

    mesh.material = materials.length === 1 ? materials[0] : materials;
  });
}

function floorTop(root: Object3D) {
  let top = Infinity;
  root.traverse((object) => {
    if (object.name !== "Plane") return;
    box.setFromObject(object);
    if (!box.isEmpty()) top = box.max.y;
  });
  return Number.isFinite(top) ? top : undefined;
}

function frameGarage(root: Group) {
  root.position.set(0, 0, 0);
  root.scale.setScalar(1);
  root.updateMatrixWorld(true);

  box.setFromObject(root);
  const height = Math.max(box.max.y - box.min.y, 0.001);
  if (height < MIN_HEIGHT) {
    root.scale.setScalar(MIN_HEIGHT / height);
    root.updateMatrixWorld(true);
  }

  box.setFromObject(root);
  box.getCenter(center);
  root.position.x -= center.x;
  root.position.z -= center.z;
  root.updateMatrixWorld(true);

  const floor = floorTop(root);
  root.position.y -= floor ?? box.min.y;
  root.updateMatrixWorld(true);
}

function applyLampLevel(root: Object3D, level: number) {
  root.traverse((object) => {
    const mesh = object as Mesh;
    if (!mesh.isMesh) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      if (!(material instanceof MeshStandardMaterial)) continue;
      const lamp = material.userData.warehouseLamp;
      if (typeof lamp !== "number") continue;
      material.emissiveIntensity = lamp * level;
    }
  });
}

export function WarehouseRoom({ cinematic, level }: { cinematic: boolean; level: number }) {
  const { scene } = useGLTF(GARAGE_URL);
  const root = useMemo(() => clone(scene) as Group, [scene]);

  useLayoutEffect(() => {
    frameGarage(root);
    styleGarage(root, cinematic);
  }, [cinematic, root]);

  useEffect(() => {
    applyLampLevel(root, level);
  }, [level, root]);

  return <primitive object={root} />;
}
