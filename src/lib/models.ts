import { useGLTF } from "@react-three/drei";
import { listConfigurableCars } from "../cars";
import type { CarDefinition } from "./schema";
import { carBackdropUrl, CONFIG_GARAGE_MODEL, FERRARI_ENZO_MODEL, RIM_MODEL, STUDIO_GARAGE_MODEL } from "./constants";
import { preloadCarDecals, preloadPorscheCluster, preloadRevueltoCluster } from "./materials";

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
  if (urls.some((url) => url.includes("lamborghini-revuelto"))) {
    preloadRevueltoCluster();
  }
  if (urls.some((url) => url.includes("porsche-gt4"))) {
    preloadPorscheCluster();
  }
  for (const url of urls) {
    useGLTF.preload(url);
  }
}

export function prefetchCar(car?: Pick<CarDefinition, "model"> | null) {
  if (!car?.model) return;
  preloadModels([car.model]);
}

function preloadBackdrop(slug: string) {
  const image = new Image();
  image.src = carBackdropUrl(slug);
}

export function prefetchConfigure(car?: Pick<CarDefinition, "model" | "slug"> | null) {
  preloadModels(configureModelUrls(car?.model));
  if (car?.slug) preloadBackdrop(car.slug);
}
