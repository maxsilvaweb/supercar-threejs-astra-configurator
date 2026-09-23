import { Html } from "@react-three/drei";
import { useState } from "react";
import type { Group } from "three";
import type { CarDefinition } from "../../lib/schema";
import { useConfig } from "../../lib/store";
import { useHotspotPortal } from "../overlay/HotspotLayer";
import { CarHotspot } from "./CarHotspot";

export function IgnitionHotspot({
  car,
  carRef,
}: {
  car: CarDefinition;
  carRef: React.RefObject<Group | null>;
}) {
  const ignition = car.ignition;
  const interior = useConfig((state) => state.cameraPreset === "interior");
  if (!ignition) return null;

  return (
    <CarHotspot
      carRef={carRef}
      point={ignition.position}
      detect={ignition.buttonDetect}
      visible={interior}
    >
      <IgnitionButton />
    </CarHotspot>
  );
}

function IgnitionButton() {
  const [firing, setFiring] = useState(false);
  const portal = useHotspotPortal();

  return (
    <Html
      center
      sprite
      occlude={false}
      portal={portal}
      zIndexRange={[80, 40]}
      style={{ pointerEvents: "auto" }}
    >
      <button
        type="button"
        aria-label="Start engine"
        title="START"
        className={`garage-ignition-start${firing ? " is-firing" : ""}`}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          setFiring(true);
          window.setTimeout(() => setFiring(false), 420);
        }}
      />
    </Html>
  );
}
