import { useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useLayoutEffect, useMemo, useState } from "react";
import type { Group } from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { frameModel, poseClosedSpoilers } from "../../lib/framing";
import { findHubs, type Hub } from "../../lib/hubs";
import { applyCarBuild } from "../../lib/materials";
import { useShallow } from "zustand/react/shallow";
import { snapshotBuild, useConfig } from "../../lib/store";
import type { CarBuild, CarDefinition } from "../../lib/schema";
import { AftermarketWheels } from "./garage/AftermarketWheels";
import { CarDecals } from "./CarDecals";

function useApplyCarBuild(root: Group, car: CarDefinition, build: CarBuild) {
  useEffect(() => {
    const token = useConfig.getState().applyToken;
    const applying = useConfig.getState().applying;
    const shownAt = performance.now();
    let timeout = 0;
    let first = 0;
    let second = 0;
    let hold = 0;

    const finish = () => {
      hold = window.setTimeout(() => {
        const state = useConfig.getState();
        if (state.applying && state.applyToken === token) state.endApply(token);
      }, Math.max(0, 420 - (performance.now() - shownAt)));
    };

    const run = () => {
      applyCarBuild(root, car, build);
      first = requestAnimationFrame(() => {
        second = requestAnimationFrame(finish);
      });
    };

    if (applying) timeout = window.setTimeout(run, 50);
    else run();

    return () => {
      window.clearTimeout(timeout);
      window.clearTimeout(hold);
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [build.aero, build.finish, build.paints, build.rimColor, build.wheel, car, root]);
}

function modelUrl(car: CarDefinition) {
  return car.model;
}

function GltfBody({
  url,
  car,
  build,
  onHubs,
}: {
  url: string;
  car: CarDefinition;
  build: CarBuild;
  onHubs: (hubs: Hub[]) => void;
}) {
  const { scene, animations } = useGLTF(url);
  const root = useMemo(() => clone(scene) as Group, [scene]);

  useLayoutEffect(() => {
    poseClosedSpoilers(root, animations);
    frameModel(root, car);
    onHubs(findHubs(root, car.wheelDetect));
  }, [animations, car, onHubs, root]);

  useApplyCarBuild(root, car, build);

  return (
    <group position={[0, build.rideHeight * 0.08, 0]}>
      <primitive object={root} />
      <CarDecals car={car} root={root} />
    </group>
  );
}

function CarModelReady({ car, build }: { car: CarDefinition; build: CarBuild }) {
  const url = modelUrl(car);
  const [hubs, setHubs] = useState<Hub[]>([]);

  if (!url) return null;

  return (
    <group>
      <GltfBody url={url} car={car} build={build} onHubs={setHubs} />
      {build.wheel === "aftermarket" && hubs.length > 0 && (
        <Suspense fallback={null}>
          <AftermarketWheels hubs={hubs} color={build.rimColor} />
        </Suspense>
      )}
    </group>
  );
}

function CarModelLive({ car }: { car: CarDefinition }) {
  const build = useConfig(useShallow(snapshotBuild));
  return <CarModelReady car={car} build={build} />;
}

export function CarModel({ car, build }: { car: CarDefinition; build?: CarBuild }) {
  if (build) return <CarModelReady car={car} build={build} />;
  return <CarModelLive car={car} />;
}
