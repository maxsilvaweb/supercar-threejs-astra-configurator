import { DoorOpen, Pointer } from "lucide-react";
import { useEffect } from "react";
import type { Group } from "three";
import { doorHotspotPoint } from "../../../lib/hotspot";
import { QUICK_WOOSH } from "../../../lib/constants";
import { playOneShotSound, preloadSound } from "../../../lib/play-one-shot-sound";
import type { CarDoor, CarDefinition } from "../../../lib/schema";
import { useConfig } from "../../../lib/store";
import { CarHotspot } from "../CarHotspot";
import { SceneOrb } from "../SceneOrb";

export function DoorHotspots({
  car,
  carRef,
}: {
  car: CarDefinition;
  carRef: React.RefObject<Group | null>;
}) {
  const doors = car.doors;
  if (!doors?.length) return null;

  return (
    <>
      {doors.map((door) => (
        <DoorMarker key={`${car.slug}-${door.id}`} door={door} sound={car.doorSound} carRef={carRef} />
      ))}
    </>
  );
}

function DoorMarker({
  door,
  sound,
  carRef,
}: {
  door: CarDoor;
  sound?: string;
  carRef: React.RefObject<Group | null>;
}) {
  const interior = useConfig((state) => state.cameraPreset === "interior");
  const sideLabel = door.side === "right" ? "right-hand" : "left-hand";
  const label = door.label ?? `Open ${sideLabel} door and sit inside`;

  useEffect(() => {
    preloadSound(QUICK_WOOSH);
    if (sound) preloadSound(sound);
  }, [sound]);

  if (interior) return null;

  return (
    <CarHotspot carRef={carRef} point={doorHotspotPoint(door)} detect={door.detect}>
      <SceneOrb
        className={door.side === "right" && !door.label ? "is-right" : undefined}
        label={label}
        onClick={() => {
          if (sound) void playOneShotSound(sound);
          useConfig.getState().enterCabin(door.side);
        }}
      >
        <DoorOpen className="scene-orb-icon" strokeWidth={2.15} />
        <Pointer className="scene-orb-pointer" strokeWidth={2.2} aria-hidden />
      </SceneOrb>
    </CarHotspot>
  );
}
