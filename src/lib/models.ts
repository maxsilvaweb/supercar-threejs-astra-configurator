import { useGLTF } from "@react-three/drei";
import { listConfigurableCars } from "../cars";
import type { CarDefinition } from "./schema";
import { CONFIG_GARAGE_MODEL, FERRARI_ENZO_MODEL, RIM_MODEL, STUDIO_GARAGE_MODEL } from "./constants";
import { preloadCarDecals } from "./materials";

let garageUrls: string[] | undefined;

export function garageModelUrls() {
  if (!garageUrls) {
    garageUrls = listConfigurableCars()
      .map((car) => car.model)
      .filter((url): url is string => Boolean(url));
    garageUrls.push(STUDIO_GARAGE_MODEL);
  }
  return garageUrls;
}

export function configureModelUrls(carModel?: string) {
  return [carModel, CONFIG_GARAGE_MODEL, RIM_MODEL].filter((url): url is string => Boolean(url));
}

export function preloadModels(urls: string[]) {
  if (urls.includes(FERRARI_ENZO_MODEL) || urls.some((url) => url.includes("ferrari-enzo"))) {
    preloadCarDecals();
  }
  for (const url of urls) {
    useGLTF.preload(url);
  }
}

export function prefetchCar(car?: Pick<CarDefinition, "model"> | null) {
  if (!car?.model) return;
  preloadModels([car.model]);
}

export function prefetchConfigure(car?: Pick<CarDefinition, "model"> | null) {
  preloadModels(configureModelUrls(car?.model));
}
