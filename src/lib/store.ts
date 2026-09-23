import { create } from "zustand";
import { getCar } from "../cars";
import { GARAGE_STORAGE_KEY, IMPACT_DRILL, IMPACT_DRILL_VOLUME, QUICK_WOOSH, QUICK_WOOSH_VOLUME, SPRAY_PAINT, SPRAY_PAINT_VOLUME } from "./constants";
import { playOneShotSound } from "./play-one-shot-sound";
import { createDefaultBuild, type CameraPreset, type CarBuild, type CarDefinition } from "./schema";

export interface SavedBuild {
  id: string;
  name: string;
  createdAt: string;
  thumbnail?: string;
  build: CarBuild;
}

export type CabinSide = "left" | "right";

interface ConfigStore extends CarBuild {
  car?: CarDefinition;
  cameraPreset: CameraPreset;
  cabinSide: CabinSide | null;
  applying: boolean;
  applyStatus: string;
  applyToken: number;
  saved: SavedBuild[];
  loadCar: (slug: string) => void;
  loadBuild: (id: string) => boolean;
  beginApply: (status: string) => void;
  endApply: (token?: number) => void;
  setPaint: (id: string, color: string) => void;
  setFinish: (finish: CarBuild["finish"]) => void;
  setWheel: (wheel: CarBuild["wheel"]) => void;
  setRimColor: (color: string) => void;
  setAero: (id: string, visible: boolean) => void;
  setEnvironment: (environment: CarBuild["environment"]) => void;
  setRideHeight: (value: number) => void;
  setAutoRotate: (value: boolean) => void;
  setCameraPreset: (preset: CameraPreset) => void;
  enterCabin: (side: CabinSide) => void;
  saveBuild: (thumbnail?: string) => void;
  deleteBuild: (id: string) => void;
}

function readSaved(): SavedBuild[] {
  if (typeof localStorage === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(GARAGE_STORAGE_KEY) || "[]") as SavedBuild[];
  } catch {
    return [];
  }
}

function writeSaved(saved: SavedBuild[]) {
  localStorage.setItem(GARAGE_STORAGE_KEY, JSON.stringify(saved));
}

export const useConfig = create<ConfigStore>((set, get) => ({
  ...createDefaultBuild({
    slug: "ferrari-sf25",
    brand: "ferrari",
    name: "SF-25",
    year: "2025",
    tagline: "",
    model: "",
    targetLength: 5,
    paintGroups: [],
    aeroParts: [],
    rideHeight: false,
    defaultPaints: {},
    defaultFinish: "gloss",
  }),
  cameraPreset: "threeQuarter",
  cabinSide: null,
  applying: false,
  applyStatus: "",
  applyToken: 0,
  saved: readSaved(),
  beginApply: (applyStatus) =>
    set((state) => ({ applying: true, applyStatus, applyToken: state.applyToken + 1 })),
  endApply: (token) =>
    set((state) => {
      if (token !== undefined && token !== state.applyToken) return state;
      return { applying: false, applyStatus: "" };
    }),
  loadCar: (slug) => {
    const car = getCar(slug);
    if (!car || car.comingSoon) return;
    set({
      car,
      ...createDefaultBuild(car),
      cameraPreset: "threeQuarter",
      cabinSide: null,
      applying: false,
      applyStatus: "",
    });
  },
  loadBuild: (id) => {
    const entry = get().saved.find((saved) => saved.id === id);
    if (!entry) return false;
    const car = getCar(entry.build.slug);
    if (!car || car.comingSoon) return false;
    set({
      car,
      ...createDefaultBuild(car),
      ...entry.build,
      rideHeight: 0,
      cameraPreset: "threeQuarter",
      cabinSide: null,
      applying: false,
      applyStatus: "",
    });
    return true;
  },
  setPaint: (id, color) => {
    const state = get();
    if (state.paints[id]?.toLowerCase() === color.toLowerCase()) return;
    state.beginApply("Applying paint");
    set((current) => {
      const paints = { ...current.paints, [id]: color };
      if (id === "body") {
        for (const zone of ["left", "top", "right"]) {
          if (zone in paints) paints[zone] = color;
        }
      }
      return { paints };
    });
    void playOneShotSound(SPRAY_PAINT, SPRAY_PAINT_VOLUME);
  },
  setFinish: (finish) => {
    if (get().finish === finish) return;
    get().beginApply("Applying finish");
    set({ finish });
    void playOneShotSound(SPRAY_PAINT, SPRAY_PAINT_VOLUME);
  },
  setWheel: (wheel) => {
    if (get().wheel === wheel) return;
    get().beginApply("Applying wheels");
    set({ wheel });
    void playOneShotSound(IMPACT_DRILL, IMPACT_DRILL_VOLUME);
  },
  setRimColor: (rimColor) => {
    if (get().rimColor === rimColor) return;
    get().beginApply("Applying wheels");
    set({ rimColor });
  },
  setAero: (id, visible) => {
    if (get().aero[id] === visible) return;
    get().beginApply("Applying options");
    set((state) => ({ aero: { ...state.aero, [id]: visible } }));
    void playOneShotSound(IMPACT_DRILL, IMPACT_DRILL_VOLUME);
  },
  setEnvironment: (environment) => set({ environment }),
  setRideHeight: (rideHeight) => set({ rideHeight }),
  setAutoRotate: (autoRotate) => set({ autoRotate }),
  setCameraPreset: (cameraPreset) =>
    set({
      cameraPreset,
      cabinSide: cameraPreset === "interior" ? get().cabinSide ?? "left" : null,
      autoRotate: cameraPreset === "interior" ? false : get().autoRotate,
    }),
  enterCabin: (side) => {
    set({ cameraPreset: "interior", cabinSide: side, autoRotate: false });
    void playOneShotSound(QUICK_WOOSH, QUICK_WOOSH_VOLUME);
  },
  saveBuild: (thumbnail) => {
    const state = get();
    if (!state.car) return;
    const entry: SavedBuild = {
      id: crypto.randomUUID(),
      name: `${state.car.name} ${new Date().toLocaleTimeString()}`,
      createdAt: new Date().toISOString(),
      thumbnail,
      build: {
        slug: state.slug,
        paints: state.paints,
        finish: state.finish,
        wheel: state.wheel,
        rimColor: state.rimColor,
        aero: state.aero,
        environment: state.environment,
        rideHeight: state.rideHeight,
        autoRotate: state.autoRotate,
      },
    };
    const saved = [entry, ...state.saved].slice(0, 18);
    writeSaved(saved);
    set({ saved });
  },
  deleteBuild: (id) => {
    const saved = get().saved.filter((entry) => entry.id !== id);
    writeSaved(saved);
    set({ saved });
  },
}));

export function snapshotBuild(state: CarBuild): CarBuild {
  return {
    slug: state.slug,
    paints: state.paints,
    finish: state.finish,
    wheel: state.wheel,
    rimColor: state.rimColor,
    aero: state.aero,
    environment: state.environment,
    rideHeight: state.rideHeight,
    autoRotate: state.autoRotate,
  };
}
