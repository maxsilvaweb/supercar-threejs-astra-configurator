import { ContactShadows, Environment, MeshReflectorMaterial, PerspectiveCamera, useCursor } from "@react-three/drei";
import { Canvas, events, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Outline, Select, Selection, Vignette } from "@react-three/postprocessing";
import { Pointer, Wrench } from "lucide-react";
import { Suspense, useEffect, useRef, useState } from "react";
import {
  MeshStandardMaterial,
  Raycaster,
  Vector2,
  type Object3D,
  type PerspectiveCamera as PerspectiveCameraType,
  PointLight,
  Vector3,
} from "three";
import { listConfigurableCars } from "../../cars";
import {
  GARAGE_BAY_FACE as FACE,
  GARAGE_BAY_SPACING as BAY_SPACING,
  GARAGE_FOCUS_DURATION as FOCUS_DURATION,
  GARAGE_HOME_LOOK,
  GARAGE_HOME_POSITION,
  GARAGE_LINE as LINE,
} from "../../lib/constants";
import { applyOverlayView, useOverlayFrame } from "../../lib/overlay-frame";
import { preloadModels } from "../../lib/models";
import { createDefaultBuild } from "../../lib/schema";
import { CarModel } from "./CarModel";
import { GarageRoom } from "./GarageRoom";
import { SceneOrb } from "./SceneOrb";

preloadModels();

const garageCars = listConfigurableCars();
const garageBuilds = new Map(garageCars.map((car) => [car.slug, createDefaultBuild(car)]));

const bays = [
  { slug: "ferrari-sf25", empty: false, reserved: false, shift: 2.1 },
  { slug: "ferrari-enzo", empty: false, reserved: false, shift: 0 },
  { slug: "lamborghini-aventador", empty: false, reserved: false, shift: -2.1 },
  { slug: "reserve-1", empty: true, reserved: true, shift: 0 },
].map((bay, index, list) => {
  const x = LINE.x + (index - (list.length - 1) / 2) * BAY_SPACING + bay.shift;
  return {
    ...bay,
    position: [x, 0, LINE.z] as [number, number, number],
    rotation: FACE,
  };
});

const lookTargets = Object.fromEntries(
  bays.map((bay) => [bay.slug, [bay.position[0], 0.55, bay.position[2]] as [number, number, number]]),
);

const HOME_LOOK = new Vector3(GARAGE_HOME_LOOK.x, GARAGE_HOME_LOOK.y, GARAGE_HOME_LOOK.z);
const HOME_POS = new Vector3(GARAGE_HOME_POSITION.x, GARAGE_HOME_POSITION.y, GARAGE_HOME_POSITION.z);

function restLook(slug?: string) {
  const bay = bays.find((entry) => entry.slug === slug && !entry.empty);
  const target = bay ? lookTargets[bay.slug] : undefined;
  return target ? new Vector3(...target) : HOME_LOOK.clone();
}

function restPosition(slug?: string) {
  const bay = bays.find((entry) => entry.slug === slug && !entry.empty);
  if (!bay) return HOME_POS.clone();
  return new Vector3(bay.position[0] + 0.5, 1.65, HOME_POS.z);
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function DriftCamera({ focused }: { focused?: string }) {
  const camera = useRef<PerspectiveCameraType>(null);
  const overlay = useOverlayFrame();
  const look = useRef(restLook(focused));
  const pos = useRef(restPosition(focused));
  const fromLook = useRef(look.current.clone());
  const toLook = useRef(look.current.clone());
  const fromPos = useRef(pos.current.clone());
  const toPos = useRef(pos.current.clone());
  const lastFocused = useRef<string | undefined>(focused);
  const tween = useRef(1);
  const drift = useRef(0);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30);

    if (lastFocused.current !== focused) {
      fromLook.current.copy(look.current);
      fromPos.current.copy(pos.current);
      toLook.current.copy(restLook(focused));
      toPos.current.copy(restPosition(focused));
      tween.current = 0;
      lastFocused.current = focused;
    }

    if (tween.current < 1) {
      tween.current = Math.min(1, tween.current + dt / FOCUS_DURATION);
      const k = easeOutCubic(tween.current);
      look.current.lerpVectors(fromLook.current, toLook.current, k);
      pos.current.lerpVectors(fromPos.current, toPos.current, k);
    }

    if (camera.current) {
      applyOverlayView(camera.current, state.size.width, state.size.height, overlay);
    }

    const settled = tween.current >= 1;
    if (settled) drift.current += dt;
    const sway = settled ? 0.16 : 0;

    camera.current?.position.set(
      pos.current.x + Math.sin(drift.current * 0.32) * sway,
      pos.current.y,
      pos.current.z + Math.cos(drift.current * 0.32) * sway * 0.45,
    );
    camera.current?.lookAt(look.current);
  });

  return <PerspectiveCamera ref={camera} makeDefault fov={36} position={HOME_POS.toArray()} />;
}

function skipRaycast() {}

function baySlug(object: Object3D | null) {
  let node = object;
  while (node) {
    if (typeof node.userData.bay === "string") return node.userData.bay as string;
    node = node.parent;
  }
}

function BayMark({ x, z, active }: { x: number; z: number; active: boolean }) {
  const ring = useRef<MeshStandardMaterial>(null);
  useFrame((state) => {
    if (!ring.current || !active) return;
    ring.current.emissiveIntensity = 0.45 + Math.sin(state.clock.elapsedTime * 5) * 0.35;
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.012, z]} raycast={skipRaycast}>
      <ringGeometry args={[2.15, 2.28, 48]} />
      <meshStandardMaterial
        ref={ring}
        color={active ? "#cfff00" : "#3a3a3a"}
        emissive={active ? "#cfff00" : "#000000"}
        emissiveIntensity={active ? 0.55 : 0}
      />
    </mesh>
  );
}

function HoverAura({ active }: { active: boolean }) {
  const light = useRef<PointLight>(null);
  useFrame((state) => {
    if (!light.current) return;
    const pulse = 0.62 + Math.sin(state.clock.elapsedTime * 5.2) * 0.38;
    light.current.intensity = active ? 2.8 * pulse : 0;
  });
  return <pointLight ref={light} color="#cfff00" position={[0, 1.55, 1.15]} distance={5.5} />;
}

function isConfigureOrb(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest(".scene-orb"));
}

function useStickyPoint(onPoint: (slug?: string) => void) {
  const timer = useRef(0);
  const keep = (slug: string) => {
    window.clearTimeout(timer.current);
    onPoint(slug);
  };
  const release = (related?: EventTarget | null) => {
    if (isConfigureOrb(related ?? null)) return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => onPoint(undefined), 240);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return { keep, release };
}

function CanvasPointerBridge({
  focused,
  onLeave,
  onSelect,
}: {
  focused?: string;
  onLeave: (related: EventTarget | null) => void;
  onSelect: (slug: string) => void;
}) {
  const gl = useThree((state) => state.gl);
  const camera = useThree((state) => state.camera);
  const scene = useThree((state) => state.scene);
  const focusedRef = useRef(focused);
  focusedRef.current = focused;

  useEffect(() => {
    const node = gl.domElement;
    const raycaster = new Raycaster();
    const pointer = new Vector2();

    const leave = (event: PointerEvent) => onLeave(event.relatedTarget);
    const pick = (event: PointerEvent) => {
      if (event.button !== 0) return;
      const rect = node.getBoundingClientRect();
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const slug =
        raycaster
          .intersectObjects(scene.children, true)
          .map((hit) => baySlug(hit.object))
          .find(Boolean) ?? focusedRef.current;
      if (slug) onSelect(slug);
    };

    node.addEventListener("pointerleave", leave);
    node.addEventListener("pointerdown", pick, true);
    return () => {
      node.removeEventListener("pointerleave", leave);
      node.removeEventListener("pointerdown", pick, true);
    };
  }, [camera, gl, onLeave, onSelect, scene]);
  return null;
}

function ConfigureOrb({
  slug,
  onSelect,
  onEnter,
  onLeave,
}: {
  slug: string;
  onSelect: (slug: string) => void;
  onEnter: () => void;
  onLeave: () => void;
}) {
  return (
    <group position={[0, 1.72, 1.85]}>
      <SceneOrb
        label="Configure this car"
        zIndexRange={[80, 40]}
        onPointerEnter={onEnter}
        onPointerLeave={onLeave}
        onClick={() => onSelect(slug)}
      >
        <Wrench className="scene-orb-icon" strokeWidth={2.15} />
        <Pointer className="scene-orb-pointer" strokeWidth={2.2} aria-hidden />
      </SceneOrb>
    </group>
  );
}

function BayHotspot({
  slug,
  onEnter,
  onSelect,
}: {
  slug: string;
  onEnter: () => void;
  onSelect: (slug: string) => void;
}) {
  const [over, setOver] = useState(false);
  useCursor(over);

  return (
    <mesh
      position={[0, 1.05, 0.35]}
      userData={{ bay: slug }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setOver(true);
        onEnter();
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        setOver(false);
      }}
      onPointerDown={(event) => {
        event.stopPropagation();
        onSelect(slug);
      }}
    >
      <boxGeometry args={[3.8, 2.4, 6.2]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

function GarageFloor({ cinematic }: { cinematic: boolean }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.004, 0]} raycast={skipRaycast}>
      <planeGeometry args={[28, 26]} />
      {cinematic ? (
        <MeshReflectorMaterial
          resolution={512}
          blur={[200, 80]}
          mixBlur={0.65}
          mixStrength={28}
          mirror={0.45}
          color="#12141a"
          metalness={0.55}
          roughness={0.35}
        />
      ) : (
        <meshStandardMaterial color="#1a1b1f" metalness={0.32} roughness={0.55} />
      )}
    </mesh>
  );
}

function ParkedCars({
  hovered,
  pointed,
  hover,
  onSelect,
}: {
  hovered?: string;
  pointed?: string;
  hover: { keep: (slug: string) => void; release: (related?: EventTarget | null) => void };
  onSelect: (slug: string) => void;
}) {
  return (
    <>
      {bays.map((bay) => {
        const car = garageCars.find((entry) => entry.slug === bay.slug);
        const build = car ? garageBuilds.get(car.slug) : undefined;
        const active = hovered === bay.slug || pointed === bay.slug;
        return (
          <group key={bay.slug} position={bay.position} rotation={[0, bay.rotation, 0]} userData={{ bay: bay.slug }}>
            <BayMark x={0} z={0} active={active} />
            <HoverAura active={active} />
            {car && build && !bay.empty ? (
              <Select enabled={active}>
                <CarModel car={car} build={build} />
              </Select>
            ) : null}
            {active && car && !bay.empty ? (
              <ConfigureOrb
                slug={bay.slug}
                onSelect={onSelect}
                onEnter={() => hover.keep(bay.slug)}
                onLeave={hover.release}
              />
            ) : null}
            {car && !bay.empty ? (
              <BayHotspot slug={bay.slug} onEnter={() => hover.keep(bay.slug)} onSelect={onSelect} />
            ) : null}
          </group>
        );
      })}
    </>
  );
}

function Scene({
  focused,
  hovered,
  selected,
  onSelect,
}: {
  focused?: string;
  hovered?: string;
  selected?: string;
  onSelect: (slug: string) => void;
}) {
  const [pointed, setPointed] = useState<string>();
  const hover = useStickyPoint(setPointed);
  const highlighted = hovered || pointed;
  const cinematic = Boolean(selected);

  return (
    <Selection>
      <CanvasPointerBridge focused={focused} onLeave={hover.release} onSelect={onSelect} />
      <color attach="background" args={[cinematic ? "#07080c" : "#0b0b0b"]} />
      <fog attach="fog" args={[cinematic ? "#07080c" : "#0b0b0b", 18, 40]} />
      <ambientLight intensity={cinematic ? 0.2 : 0.32} />
      <spotLight
        position={[4, 4.2, 3]}
        angle={0.55}
        penumbra={0.75}
        intensity={cinematic ? 2.2 : 1.8}
        color={cinematic ? "#d5e2ff" : "#ffffff"}
      />
      <spotLight
        position={[-4, 3.8, 1]}
        angle={0.5}
        penumbra={0.8}
        intensity={cinematic ? 1 : 0.9}
        color={cinematic ? "#9fb4d8" : "#cfd6e4"}
      />
      <pointLight position={[0, 3.8, 0]} intensity={4.5} distance={16} color="#f3f6ff" />
      <Suspense fallback={null}>
        <Environment
          preset={cinematic ? "city" : "warehouse"}
          background={false}
          blur={cinematic ? 0.45 : 0.7}
          resolution={128}
        />
        {cinematic ? <GarageFloor cinematic /> : null}
        <GarageRoom cinematic={cinematic} />
        <ParkedCars hovered={hovered} pointed={pointed} hover={hover} onSelect={onSelect} />
      </Suspense>
      {!cinematic ? (
        <ContactShadows frames={1} resolution={256} position={[0, 0.01, 0]} opacity={0.4} scale={18} blur={2} far={5} />
      ) : null}
      <DriftCamera focused={focused} />
      <EffectComposer disableNormalPass multisampling={0} autoClear={false}>
        <Bloom intensity={cinematic ? 0.38 : 0.28} luminanceThreshold={cinematic ? 0.55 : 0.7} mipmapBlur />
        <Outline
          edgeStrength={highlighted ? 5.4 : 0}
          pulseSpeed={highlighted ? 0.7 : 0}
          visibleEdgeColor="#cfff00"
          hiddenEdgeColor="#7a8f00"
          blur
          xRay
        />
        <Vignette darkness={cinematic ? 0.58 : 0.38} offset={0.32} />
      </EffectComposer>
    </Selection>
  );
}

export function GarageCanvas({
  focused,
  hovered,
  selected,
  onSelect,
}: {
  focused?: string;
  hovered?: string;
  selected?: string;
  onSelect: (slug: string) => void;
}) {
  return (
    <div
      className="absolute inset-0"
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        if (!(event.target instanceof HTMLCanvasElement)) return;
        const slug = hovered || focused || selected;
        if (slug) onSelect(slug);
      }}
    >
      <Canvas
        className="h-full w-full touch-none"
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: "high-performance", stencil: false }}
        style={{ touchAction: "none" }}
        events={(store) => ({
          ...events(store),
          filter: (hits) => hits.filter((hit) => Boolean(baySlug(hit.object))),
        })}
      >
        <Scene focused={focused} hovered={hovered} selected={selected} onSelect={onSelect} />
      </Canvas>
    </div>
  );
}
