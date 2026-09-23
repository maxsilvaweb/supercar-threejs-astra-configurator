export type LookAt = {
  position: [number, number, number];
  target: [number, number, number];
};

export interface GarageRoom {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  floor: number;
  ceiling: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function clampInsideGarage(position: [number, number, number], room: GarageRoom, margin = 0.55): [number, number, number] {
  return [
    clamp(position[0], room.minX + margin, room.maxX - margin),
    clamp(position[1], room.floor + 0.85, room.ceiling - 0.4),
    clamp(position[2], room.minZ + margin, room.maxZ - margin),
  ];
}

/** Front, then right-hand door — one short pan inside the garage. */
export function rightHandDoorApproach(bay: { x: number; z: number }, room: GarageRoom): { front: LookAt; right: LookAt } {
  const gaze: [number, number, number] = [bay.x, 0.48, bay.z];
  return {
    front: {
      position: clampInsideGarage([bay.x, 1.7, bay.z + 5.8], room),
      target: gaze,
    },
    right: {
      position: clampInsideGarage([bay.x + 3.7, 1.48, bay.z + 0.2], room),
      target: [bay.x, 0.5, bay.z],
    },
  };
}
