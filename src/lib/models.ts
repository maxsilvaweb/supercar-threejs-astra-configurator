import { useGLTF } from "@react-three/drei";
import { listConfigurableCars } from "../cars";
import { CONFIG_GARAGE_MODEL, RIM_MODEL, STUDIO_GARAGE_MODEL } from "./constants";
import { preloadCarDecals } from "./materials";

export function modelUrls() {
  const urls = listConfigurableCars()
    .map((car) => car.model)
    .filter((url): url is string => Boolean(url));
  urls.push(RIM_MODEL, STUDIO_GARAGE_MODEL, CONFIG_GARAGE_MODEL);
  return urls;
}

export function preloadModels(urls = modelUrls()) {
  preloadCarDecals();
  for (const url of urls) {
    useGLTF.preload(url);
  }
}
