import { useGLTF } from "@react-three/drei";
import { useLayoutEffect, useMemo } from "react";
import { Box3, MeshStandardMaterial, type Group, type Mesh, type Object3D, Vector3 } from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { CONFIG_GARAGE_MIN_HEIGHT as MIN_HEIGHT, CONFIG_GARAGE_MODEL as ROOM_URL } from "../../lib/constants";
const box = new Box3();
const center = new Vector3();
const vertex = new Vector3();

useGLTF.preload(ROOM_URL);

function skipRaycast() {}

function styleRoom(root: Object3D) {
  root.traverse((object) => {
    const mesh = object as Mesh;
    if (!mesh.isMesh) return;
    mesh.raycast = skipRaycast;
    mesh.castShadow = false;
    mesh.receiveShadow = false;

    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((material, index) => {
      if (!(material instanceof MeshStandardMaterial)) return;
      const styled = material.clone();
      styled.envMapIntensity = 0.85;
      styled.polygonOffset = true;
      styled.polygonOffsetFactor = 1;
      styled.polygonOffsetUnits = 1;
      materials[index] = styled;
    });
    mesh.material = materials.length === 1 ? materials[0] : materials;
  });
}

function floorY(root: Object3D) {
  root.updateMatrixWorld(true);
  box.setFromObject(root);
  const minY = box.min.y;
  const limit = minY + 1.1;
  const bins = new Map<number, number>();

  root.traverse((object) => {
    const mesh = object as Mesh;
    if (!mesh.isMesh) return;
    const position = mesh.geometry.getAttribute("position");
    if (!position) return;

    for (let i = 0; i < position.count; i += 3) {
      vertex.fromBufferAttribute(position, i).applyMatrix4(mesh.matrixWorld);
      if (vertex.y < minY + 0.05 || vertex.y > limit) continue;
      const key = Math.round((vertex.y - minY) * 20);
      bins.set(key, (bins.get(key) || 0) + 1);
    }
  });

  let bestKey = 0;
  let bestCount = 0;
  for (const [key, count] of bins) {
    if (count > bestCount) {
      bestCount = count;
      bestKey = key;
    }
  }

  const detected = minY + bestKey / 20;
  const minimum = minY + 0.58;
  return Math.max(detected, minimum);
}

function frameRoom(root: Group) {
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
  root.position.y -= floorY(root);
  root.updateMatrixWorld(true);
}

function CleanFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} raycast={skipRaycast}>
      <planeGeometry args={[21.4, 16.6]} />
      <meshStandardMaterial
        color="#c7c4bf"
        roughness={0.96}
        metalness={0.03}
        envMapIntensity={0.22}
        depthWrite
        polygonOffset
        polygonOffsetFactor={-2}
        polygonOffsetUnits={-2}
      />
    </mesh>
  );
}

export function ConfigGarage() {
  const { scene } = useGLTF(ROOM_URL);
  const root = useMemo(() => clone(scene) as Group, [scene]);

  useLayoutEffect(() => {
    frameRoom(root);
    styleRoom(root);
  }, [root]);

  return (
    <group>
      <primitive object={root} />
      <CleanFloor />
    </group>
  );
}
