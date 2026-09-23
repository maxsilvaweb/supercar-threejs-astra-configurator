/** Shared paths, storage keys, and scene layout. */

export const STUDIO_GARAGE_ENTRY = "/sounds/studio-garage-entry.mp3";
export const STUDIO_GARAGE_ENTRY_VOLUME = 0.85;

export const IMPACT_DRILL = "/sounds/impact-drill.wav";
export const IMPACT_DRILL_VOLUME = 0.7;

export const MENU_CLICK = "/sounds/menu-click.wav";
export const MENU_CLICK_VOLUME = 0.85;

export const GARAGE_VENT_URL = "/sounds/garage-vent-background.flac";
export const GARAGE_VENT_VOLUME = 0.4;

export const FERRARI_ENZO_DOOR_SOUND = "/sounds/ferrari-enzo/opening-door.wav";

export function carSoundUrl(slug: string, clip = `${slug}.mp3`) {
  const file = clip.includes(".") ? clip : `${clip}.mp3`;
  return `/sounds/${slug}/${file}`;
}

export function carPreviewUrl(slug: string) {
  return `/ui/previews/${slug}.jpg`;
}

export const GARAGE_STORAGE_KEY = "car-modeler-garage";
export const MUTE_STORAGE_KEY = "car-modeler-muted";

export const FERRARI_SF25_MODEL = "/models/ferrari-sf25/ferrari-sf25.glb?v=2";
export const FERRARI_ENZO_MODEL = "/models/ferrari-enzo/ferrari-enzo.glb?v=3";
export const LAMBORGHINI_AVENTADOR_MODEL = "/models/lamborghini-aventador/lamborghini-aventador.glb?v=fbx1";
export const RIM_MODEL = "/models/rim/rim.glb";
export const STUDIO_GARAGE_MODEL = "/models/studio-garage/studio-garage.glb";
export const CONFIG_GARAGE_MODEL = "/models/config-garage/config-garage.glb";

export const ENZO_SIDE_DECAL = "/models/ferrari-enzo/caballo-lateral.png";
export const ENZO_SIDE_DECAL_ALPHA = "/models/ferrari-enzo/caballo-lateral-alpha.png";

export const STUDIO_GARAGE_MIN_HEIGHT = 5.5;
export const CONFIG_GARAGE_MIN_HEIGHT = 6.2;

export const GARAGE_BAY_SPACING = 5.4;
export const GARAGE_LINE = { x: 3.4, z: 1.8 };
export const GARAGE_BAY_FACE = 0;
export const GARAGE_HOME_LOOK = { x: 1.6, y: 0.62, z: GARAGE_LINE.z };
export const GARAGE_HOME_POSITION = { x: 3.6, y: 1.58, z: 9.6 };
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
