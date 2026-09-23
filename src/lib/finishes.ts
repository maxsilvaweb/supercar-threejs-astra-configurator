import type { FinishId } from "./schema";

export const finishes: Record<
  FinishId,
  {
    label: string;
    roughness: number;
    metalness: number;
    clearcoat: number;
    clearcoatRoughness: number;
  }
> = {
  gloss: {
    label: "Gloss",
    roughness: 0.16,
    metalness: 0.08,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
  },
  satin: {
    label: "Satin",
    roughness: 0.38,
    metalness: 0.1,
    clearcoat: 0.4,
    clearcoatRoughness: 0.22,
  },
  matte: {
    label: "Matte",
    roughness: 0.74,
    metalness: 0.04,
    clearcoat: 0,
    clearcoatRoughness: 1,
  },
  metallic: {
    label: "Metallic",
    roughness: 0.26,
    metalness: 0.68,
    clearcoat: 0.85,
    clearcoatRoughness: 0.1,
  },
  carbon: {
    label: "Carbon",
    roughness: 0.32,
    metalness: 0.72,
    clearcoat: 0.85,
    clearcoatRoughness: 0.12,
  },
};

export const finishOrder: FinishId[] = ["gloss", "satin", "matte", "metallic", "carbon"];
