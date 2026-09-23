export type Brand = "ferrari" | "porsche";

export type FinishId = "gloss" | "satin" | "matte" | "metallic" | "carbon";

export type EnvironmentId = "studio" | "showroom" | "night" | "carbon";

export type WheelId = "stock" | "aftermarket";

export type CameraPreset = "front" | "threeQuarter" | "side" | "rear" | "detail" | "interior";

export interface CarDoor {
  id: string;
  side: "left" | "right";
  /** Optional AABB fractions (0–1). Defaults from `side` so any car can reuse the same orb. */
  position?: { x?: number; y?: number; z?: number };
  /** Overrides the default “Open left/right-hand door” label. */
  label?: string;
  /** Snap the orb to this mesh or material (e.g. `SteeringWheel`). */
  detect?: string;
}

/** Occupant eye / look as AABB fractions (0–1). Used when a wheel mesh is not found. */
export interface CabinSeat {
  eye: { x: number; y: number; z: number };
  look?: { x: number; y: number; z: number };
}

/** In-car seats. Driver look is aimed at the steering wheel when `wheelDetect` matches. */
export interface CarCabin {
  left?: CabinSeat;
  right?: CabinSeat;
  /** Material or object name for the steering wheel (e.g. `volante`). */
  wheelDetect?: string;
  /** `direct` skips the right-hand door pan (open-cockpit cars). */
  entry?: "door" | "direct";
}

/** Screen-space ignition control aligned to the cabin START button (interior view). */
export interface CarIgnitionHotspot {
  /** Position within the car axis-aligned bounds (0–1 from min on each axis). */
  position: { x: number; y: number; z: number };
  /** Material name for the START control (e.g. `botn`). Used to sit the glow on the button. */
  buttonDetect?: string;
  sound?: string;
}

export interface NameMatch {
  object?: string;
  material?: string;
  excludeObject?: string;
  excludeMaterial?: string;
}

export interface PaintGroup extends NameMatch {
  id: string;
  label: string;
}

export interface AeroPart extends NameMatch {
  id: string;
  label: string;
  defaultVisible: boolean;
}

export interface CarDefinition {
  slug: string;
  brand: Brand;
  name: string;
  year: string;
  tagline: string;
  model: string;
  comingSoon?: boolean;
  hidden?: boolean;
  targetLength: number;
  yaw?: number;
  paintGroups: PaintGroup[];
  locked?: NameMatch[];
  aeroParts: AeroPart[];
  wheelDetect?: string;
  hideWhenAftermarket?: NameMatch;
  rideHeight: boolean;
  defaultPaints: Record<string, string>;
  defaultFinish: FinishId;
  doors?: CarDoor[];
  /** Played when either door orb is clicked to enter the cabin. */
  doorSound?: string;
  cabin?: CarCabin;
  ignition?: CarIgnitionHotspot;
}

export interface WheelDefinition {
  id: WheelId;
  label: string;
  model?: string;
}

export interface CarBuild {
  slug: string;
  paints: Record<string, string>;
  finish: FinishId;
  wheel: WheelId;
  rimColor: string;
  aero: Record<string, boolean>;
  environment: EnvironmentId;
  rideHeight: number;
  autoRotate: boolean;
}

export function defineCar(car: CarDefinition): CarDefinition {
  return car;
}

export function defineWheel(wheel: WheelDefinition): WheelDefinition {
  return wheel;
}

export function createDefaultBuild(car: CarDefinition): CarBuild {
  return {
    slug: car.slug,
    paints: { ...car.defaultPaints },
    finish: car.defaultFinish,
    wheel: "stock",
    rimColor: "#c0c4c8",
    aero: Object.fromEntries(car.aeroParts.map((part) => [part.id, part.defaultVisible])),
    environment: "studio",
    rideHeight: 0,
    autoRotate: false,
  };
}
