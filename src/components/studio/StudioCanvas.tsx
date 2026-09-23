import { CameraControls, Environment, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import CameraControlsImpl from "camera-controls";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Box3, BoxGeometry, Mesh, MeshBasicMaterial, Vector3, type Group, type PerspectiveCamera as PerspectiveCameraType } from "three";
import { cabinBounds, cabinLookAround, cabinView, type CabinSide } from "../../lib/cabin";
import {
  CABIN_LOOK_AHEAD,
  CONFIG_BAY as BAY,
  CONFIG_CAMERA_MAX_DISTANCE,
  CONFIG_CAMERA_MIN_DISTANCE,
  CONFIG_CAR_SCALE as CAR_SCALE,
  CONFIG_ROOM as ROOM,
} from "../../lib/constants";
import { rightHandDoorApproach } from "../../lib/camera-paths";
import { applyOverlayView, useOverlayFrame } from "../../lib/overlay-frame";
import { sitOnGround } from "../../lib/framing";
import type { CameraPreset, CarDefinition } from "../../lib/schema";
import { useConfig } from "../../lib/store";
import { CarModel } from "./CarModel";
import { ConfigGarage } from "./ConfigGarage";
import { DoorHotspots } from "./DoorHotspots";
import { IgnitionHotspot } from "./IgnitionHotspot";

const ROOM_BOUNDS = new Box3(
  new Vector3(ROOM.minX, ROOM.floor, ROOM.minZ),
  new Vector3(ROOM.maxX, ROOM.ceiling, ROOM.maxZ),
);

const colliderMaterial = new MeshBasicMaterial({
  transparent: true,
  opacity: 0,
  depthWrite: false,
  colorWrite: false,
});

function createRoomColliders() {
  const ceiling = new Mesh(new BoxGeometry(ROOM.maxX - ROOM.minX, 0.12, ROOM.maxZ - ROOM.minZ), colliderMaterial);
  ceiling.position.set(0, ROOM.ceiling, 0);

  const left = new Mesh(new BoxGeometry(0.12, ROOM.ceiling, ROOM.maxZ - ROOM.minZ), colliderMaterial);
  left.position.set(ROOM.minX, ROOM.ceiling / 2, 0);

  const right = new Mesh(new BoxGeometry(0.12, ROOM.ceiling, ROOM.maxZ - ROOM.minZ), colliderMaterial);
  right.position.set(ROOM.maxX, ROOM.ceiling / 2, 0);

  const front = new Mesh(new BoxGeometry(ROOM.maxX - ROOM.minX, ROOM.ceiling, 0.12), colliderMaterial);
  front.position.set(0, ROOM.ceiling / 2, ROOM.maxZ);

  const back = new Mesh(new BoxGeometry(ROOM.maxX - ROOM.minX, ROOM.ceiling, 0.12), colliderMaterial);
  back.position.set(0, ROOM.ceiling / 2, ROOM.minZ);

  const colliders = [ceiling, left, right, front, back];
  colliders.forEach((mesh) => mesh.updateMatrixWorld(true));
  return colliders;
}

function bayView(
  position: [number, number, number],
  target: [number, number, number],
): { position: [number, number, number]; target: [number, number, number] } {
  return {
    position: [position[0] + BAY.x, position[1], position[2] + BAY.z],
    target: [target[0] + BAY.x, target[1], target[2] + BAY.z],
  };
}

const views: Record<Exclude<CameraPreset, "interior">, { position: [number, number, number]; target: [number, number, number] }> = {
  front: bayView([0, 1.85, 6.4], [0, 0.5, 0]),
  threeQuarter: bayView([-4.6, 2.7, 5.1], [0, 0.42, 0]),
  side: bayView([3.55, 1.52, 0.18], [0, 0.55, 0]),
  rear: bayView([0, 1.95, -5.8], [0, 0.5, 0]),
  detail: bayView([2.1, 1.4, 3.0], [0.3, 0.55, 0.15]),
};

function applyLimits(
  cameraControls: CameraControlsImpl,
  camera: PerspectiveCameraType,
  interior: boolean,
  cabin?: Box3,
  width = 1280,
  height = 800,
  overlay: ReturnType<typeof useOverlayFrame> = "closed",
) {
  const action = CameraControlsImpl.ACTION;
  cameraControls.truckSpeed = 0;
  cameraControls.infinityDolly = false;
  cameraControls.minDistance = interior ? CABIN_LOOK_AHEAD : CONFIG_CAMERA_MIN_DISTANCE;
  cameraControls.maxDistance = interior ? CABIN_LOOK_AHEAD : CONFIG_CAMERA_MAX_DISTANCE;
  cameraControls.minPolarAngle = interior ? 0.28 : 0.78;
  cameraControls.maxPolarAngle = interior ? Math.PI - 0.32 : Math.PI / 2 - 0.1;
  cameraControls.minAzimuthAngle = -Infinity;
  cameraControls.maxAzimuthAngle = Infinity;
  cameraControls.dollySpeed = interior ? 0 : 1;
  cameraControls.azimuthRotateSpeed = interior ? 0.72 : 1;
  cameraControls.polarRotateSpeed = interior ? 0.55 : 1;
  cameraControls.mouseButtons.left = action.ROTATE;
  cameraControls.mouseButtons.right = interior ? action.ROTATE : action.TRUCK;
  cameraControls.mouseButtons.wheel = interior ? action.NONE : action.DOLLY;
  cameraControls.mouseButtons.middle = interior ? action.NONE : action.DOLLY;
  cameraControls.touches.one = action.TOUCH_ROTATE;
  cameraControls.touches.two = interior ? action.TOUCH_ROTATE : action.TOUCH_DOLLY_TRUCK;
  cameraControls.setBoundary(interior && cabin ? cabin : ROOM_BOUNDS);
  cameraControls.boundaryEnclosesCamera = true;
  camera.near = interior ? 0.08 : 0.12;
  applyOverlayView(camera, width, height, overlay, interior);
}

function seatLook(root: Group, side: CabinSide, car: CarDefinition) {
  return cabinLookAround(cabinView(root, side, car));
}

function CameraRig({
  car,
  colliders,
  carRef,
}: {
  car: CarDefinition;
  colliders: Mesh[];
  carRef: React.RefObject<Group | null>;
}) {
  const controls = useRef<CameraControls>(null);
  const settled = useRef(false);
  const preset = useConfig((state) => state.cameraPreset);
  const cabinSide = useConfig((state) => state.cabinSide);
  const autoRotate = useConfig((state) => state.autoRotate);
  const camera = useThree((state) => state.camera) as PerspectiveCameraType;
  const size = useThree((state) => state.size);
  const overlay = useOverlayFrame();
  const interior = preset === "interior";

  useLayoutEffect(() => {
    applyOverlayView(camera, size.width, size.height, overlay, interior);
  }, [camera, interior, overlay, size.height, size.width]);

  useLayoutEffect(() => {
    const outside = preset === "interior" ? views.threeQuarter : views[preset];
    const side = cabinSide ?? "left";
    const seated = interior && carRef.current ? seatLook(carRef.current, side, car) : null;
    const view = seated ?? outside;
    const approachRight = interior && side === "right" && car.cabin?.entry !== "direct";

    if (!approachRight) {
      camera.position.set(...view.position);
      camera.lookAt(...view.target);
    }

    let frame = 0;
    let cancelled = false;
    const apply = async () => {
      if (cancelled) return;
      const cameraControls = controls.current;
      const root = carRef.current;
      if (!cameraControls || (interior && !root)) {
        frame = requestAnimationFrame(() => {
          void apply();
        });
        return;
      }
      const next = interior && root ? seatLook(root, side, car) : outside;
      const cabin = interior && root ? cabinBounds(root, side, next) : undefined;
      cameraControls.truckSpeed = 0;

      if (approachRight) {
        const path = rightHandDoorApproach(BAY, ROOM);
        cameraControls.colliderMeshes = [];
        applyLimits(cameraControls, camera, false, undefined, size.width, size.height, overlay);
        cameraControls.smoothTime = 0.18;
        await cameraControls.setLookAt(...path.front.position, ...path.front.target, false);
        if (cancelled) return;
        await cameraControls.setLookAt(...path.right.position, ...path.right.target, true);
        if (cancelled) return;
        cameraControls.minDistance = 0.08;
        cameraControls.maxDistance = 8;
        cameraControls.smoothTime = 0.16;
        await cameraControls.setLookAt(...next.position, ...next.target, true);
        if (cancelled) return;
        applyLimits(cameraControls, camera, true, cabin, size.width, size.height, overlay);
        cameraControls.colliderMeshes = [];
        cameraControls.smoothTime = 0.22;
        settled.current = true;
        return;
      }

      applyLimits(cameraControls, camera, interior, cabin, size.width, size.height, overlay);
      cameraControls.colliderMeshes = interior ? [] : colliders;
      cameraControls.setLookAt(...next.position, ...next.target, settled.current);
      settled.current = true;
    };
    void apply();
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [cabinSide, camera, car, carRef, colliders, interior, overlay, preset, size.height, size.width]);

  useEffect(() => {
    const cameraControls = controls.current;
    if (!cameraControls) return;
    cameraControls.truckSpeed = 0;
    let frame = 0;
    const tick = () => {
      if (autoRotate) cameraControls.azimuthAngle += 0.0016;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [autoRotate]);

  return (
    <CameraControls
      ref={controls}
      minDistance={2.5}
      maxDistance={7.6}
      minPolarAngle={0.78}
      maxPolarAngle={Math.PI / 2 - 0.1}
      smoothTime={0.35}
    />
  );
}

function CaptureBridge() {
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    const capture = () => gl.domElement.toDataURL("image/png");
    window.carModelerCapture = capture;
    return () => {
      delete window.carModelerCapture;
    };
  }, [gl]);
  return null;
}

function GroundedCar({ car, carRef }: { car: CarDefinition; carRef: React.RefObject<Group | null> }) {
  useLayoutEffect(() => {
    const group = carRef.current;
    if (!group) return;
    group.position.set(BAY.x, 0, BAY.z);
    group.updateMatrixWorld(true);
    sitOnGround(group, 0.02, car.wheelDetect);
  }, [car, carRef]);

  return (
    <group ref={carRef} position={[BAY.x, 0, BAY.z]} scale={CAR_SCALE}>
      <CarModel car={car} />
    </group>
  );
}

function Scene({ car }: { car: CarDefinition }) {
  const carRef = useRef<Group>(null);
  const colliders = useMemo(() => createRoomColliders(), []);

  return (
    <>
      <color attach="background" args={["#0c0d10"]} />
      <PerspectiveCamera makeDefault fov={34} near={0.12} position={views.threeQuarter.position} />
      <ambientLight intensity={0.28} />
      <spotLight position={[BAY.x + 2.6, 4.8, BAY.z + 2.2]} angle={0.5} penumbra={0.75} intensity={1.8} />
      <spotLight position={[BAY.x - 2.4, 4.4, BAY.z + 1.4]} angle={0.55} penumbra={0.85} intensity={1} color="#d5e2ff" />
      <Suspense fallback={null}>
        <Environment preset="warehouse" background={false} blur={0.65} resolution={128} />
        <ConfigGarage />
        <GroundedCar car={car} carRef={carRef} />
        <DoorHotspots car={car} carRef={carRef} />
        <IgnitionHotspot car={car} carRef={carRef} />
      </Suspense>
      {colliders.map((mesh, index) => (
        <primitive key={index} object={mesh} />
      ))}
      <CameraRig car={car} colliders={colliders} carRef={carRef} />
      <CaptureBridge />
      <EffectComposer disableNormalPass multisampling={0}>
        <Bloom intensity={0.2} luminanceThreshold={0.82} mipmapBlur />
        <Vignette darkness={0.32} offset={0.38} />
      </EffectComposer>
    </>
  );
}

declare global {
  interface Window {
    carModelerCapture?: () => string;
  }
}

export function StudioCanvas({ car }: { car: CarDefinition }) {
  return (
    <Canvas
      className="absolute inset-0"
      dpr={[1, 2]}
      gl={{ antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance", stencil: false }}
    >
      <Scene car={car} />
    </Canvas>
  );
}
