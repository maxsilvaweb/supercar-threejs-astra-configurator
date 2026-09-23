import { useGLTF } from "@react-three/drei";
import { useLayoutEffect, useMemo } from "react";
import { Box3, Vector3, type Group, type Mesh } from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import type { Hub } from "../../lib/hubs";
import { RIM_MODEL as RIM_URL } from "../../lib/constants";
import { createRimMaterial } from "../../lib/materials";

function fitRim(root: Group, hub: Hub) {
  const box = new Box3().setFromObject(root);
  const size = box.getSize(new Vector3());
  const radius = Math.max(size.x, size.z) * 0.5 || 1;
  const scale = (hub.radius * 0.78) / radius;
  root.scale.setScalar(scale);
  root.position.set(...hub.position);
}

export function AftermarketWheels({ hubs, color }: { hubs: Hub[]; color: string }) {
  const { scene } = useGLTF(RIM_URL);
  const clones = useMemo(() => hubs.map(() => clone(scene) as Group), [hubs, scene]);

  useLayoutEffect(() => {
    clones.forEach((root, index) => {
      const hub = hubs[index];
      if (!hub) return;
      fitRim(root, hub);
      root.traverse((object) => {
        const mesh = object as Mesh;
        if (!mesh.isMesh) return;
        mesh.castShadow = true;
        mesh.material = createRimMaterial(color);
      });
    });
  }, [clones, color, hubs]);

  return (
    <group>
      {clones.map((root, index) => (
        <primitive key={`${hubs[index]?.name}-${index}`} object={root} />
      ))}
    </group>
  );
}

