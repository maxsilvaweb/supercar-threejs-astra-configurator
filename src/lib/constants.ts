/** Shared paths, storage keys, and scene layout. */

export const STUDIO_GARAGE_ENTRY = "/sounds/studio-garage-entry.mp3";
export const STUDIO_GARAGE_ENTRY_VOLUME = 0.85;

export const IMPACT_DRILL = "/sounds/impact-drill.wav";
export const IMPACT_DRILL_VOLUME = 0.7;

export const SPRAY_PAINT = "/sounds/spray-paint-sound.wav";
export const SPRAY_PAINT_VOLUME = 0.7;

export const MENU_CLICK = "/sounds/menu-click.wav";
export const MENU_CLICK_VOLUME = 0.85;

export const QUICK_WOOSH = "/sounds/quick-woosh.mp3";
export const QUICK_WOOSH_VOLUME = 0.8;

export const GARAGE_VENT_URL = "/sounds/garage-vent-background.mp3?v=1";
export const GARAGE_VENT_VOLUME = 0.4;

export const LOW_ENGINE_NOISE = "/sounds/low-engine-noise.wav";
export const LOW_ENGINE_VOLUME = 0.55;

export const FERRARI_ENZO_DOOR_SOUND = "/sounds/opening-door.wav";

/** Short clips the interface plays on click. These stay ahead of the car downloads. */
export const INTERFACE_SOUNDS = [MENU_CLICK, QUICK_WOOSH, STUDIO_GARAGE_ENTRY];

/** Longer beds. Loaded after the interface clips so they do not occupy the connection. */
export const STUDIO_SOUNDS = [
  ...INTERFACE_SOUNDS,
  SPRAY_PAINT,
  IMPACT_DRILL,
  GARAGE_VENT_URL,
  FERRARI_ENZO_DOOR_SOUND,
  LOW_ENGINE_NOISE,
];

const previewVersion: Record<string, number> = {
  "porsche-gt4": 2,
  "lamborghini-revuelto": 2,
  "aston-martin-valhalla": 2,
  "toyota-supra-mk5": 2,
  "bugatti-chiron": 2,
  "studio-garage": 1,
};

export function carPreviewUrl(slug: string) {
  return `/ui/previews/${slug}.jpg?v=${previewVersion[slug] ?? 1}`;
}

const backdropVersion: Record<string, number> = {
  "lamborghini-revuelto": 2,
  "bugatti-chiron": 3,
};

export function carBackdropUrl(slug: string) {
  return `/ui/backdrops/${slug}.jpg?v=${backdropVersion[slug] ?? 1}`;
}

export const GARAGE_STORAGE_KEY = "car-modeler-garage";
export const MUTE_STORAGE_KEY = "car-modeler-muted";
export const VOLUME_STORAGE_KEY = "car-modeler-volume";
export const GARAGE_AMBIENCE_STORAGE_KEY = "car-modeler-garage-ambience";
export const INTERFACE_SFX_STORAGE_KEY = "car-modeler-interface-sfx";
export const ENGINE_SFX_STORAGE_KEY = "car-modeler-engine-sfx";
export const STUDIO_INFO_STORAGE_KEY = "car-modeler-studio-info";
export const STUDIO_ACCENT_STORAGE_KEY = "car-modeler-studio-accent";
export const WAREHOUSE_LIGHTS_STORAGE_KEY = "car-modeler-warehouse-lights";

export const FERRARI_SF25_MODEL = "/models/ferrari-sf25/ferrari-sf25.glb?v=2";
export const CHEVROLET_ZR1_MODEL = "/models/chevrolet-zr1/chevrolet-zr1.glb?v=2";
export const ASTON_MARTIN_VALHALLA_MODEL = "/models/aston-martin-valhalla/aston-martin-valhalla.glb?v=2";
export const TOYOTA_SUPRA_MK5_MODEL = "/models/toyota-supra-mk5/toyota-supra-mk5.glb?v=2";
export const BUGATTI_CHIRON_MODEL = "/models/bugatti-chiron/bugatti-chiron.glb?v=1";
export const FERRARI_ENZO_MODEL = "/models/ferrari-enzo/ferrari-enzo.glb?v=3";
export const PORSCHE_GT4_MODEL = "/models/porsche-gt4/porsche-gt4.glb?v=2";
export const LAMBORGHINI_REVUELTO_MODEL = "/models/lamborghini-revuelto/lamborghini-revuelto.glb?v=2";
export const LAMBORGHINI_REVUELTO_CLUSTER = "/ui/dials/lamborghini-revuelto.jpg";
export const PORSCHE_GT4_CLUSTER = "/ui/dials/porsche-gt4.jpg?v=3";
export const PORSCHE_GT4_BADGE = "/ui/brands/porsche-crest.png";
export const RIM_MODEL = "/models/rim/rim.glb?v=1";
export const STUDIO_GARAGE_MODEL = "/models/studio-garage/studio-garage.glb?v=1";
export const CONFIG_GARAGE_MODEL = "/models/config-garage/config-garage.glb?v=1";

export const ENZO_SIDE_DECAL = "/models/ferrari-enzo/caballo-lateral.png";
export const ENZO_SIDE_DECAL_ALPHA = "/models/ferrari-enzo/caballo-lateral-alpha.png";

export const STUDIO_GARAGE_MIN_HEIGHT = 5.5;
export const CONFIG_GARAGE_MIN_HEIGHT = 6.2;

export const GARAGE_BAY_SPACING = 5.4;
export const GARAGE_LINE = { x: 1.9, z: 1.8 };
export const GARAGE_BAY_FACE = 0;
export const GARAGE_HOME_LOOK = { x: 0.85, y: 0.62, z: GARAGE_LINE.z };
export const GARAGE_HOME_POSITION = { x: 2.85, y: 1.58, z: 9.6 };
export const GARAGE_FOCUS_DURATION = 0.4;

export const CONFIG_BAY = { x: 3.2, z: 1.4 };
export const CONFIG_CAR_SCALE = 1.9;
export const CONFIG_ROOM = {
  minX: -11.1,
  maxX: 11.1,
  minZ: -8.65,
  maxZ: 8.65,
  floor: 0.12,
  ceiling: 5.42,
};
export const CABIN_LOOK_AHEAD = 0.14;
export const CONFIG_CAMERA_MIN_DISTANCE = 2.5;
export const CONFIG_CAMERA_MAX_DISTANCE = 7.6;
