import type { CarDefinition } from "../lib/schema";
import { astonMartinValhalla } from "./aston-martin-valhalla";
import { chevroletZr1 } from "./chevrolet-zr1";
import { ferrariEnzo } from "./ferrari-enzo";
import { ferrariSf25 } from "./ferrari-sf25";
import { lamborghiniRevuelto } from "./lamborghini-revuelto";
import { lamborghiniTemerario } from "./lamborghini-temerario";
import { mclaren765lt } from "./mclaren-765lt";
import { porscheGt4 } from "./porsche-gt4";
import { toyotaSupraMk5 } from "./toyota-supra-mk5";
import { bugattiChiron } from "./bugatti-chiron";

const cars: CarDefinition[] = [ferrariSf25, bugattiChiron, porscheGt4, lamborghiniRevuelto, chevroletZr1, astonMartinValhalla, toyotaSupraMk5, ferrariEnzo, lamborghiniTemerario, mclaren765lt];

export function listCars() {
  return cars.filter((car) => !car.hidden);
}

export function listConfigurableCars() {
  return listCars().filter((car) => !car.comingSoon);
}

export function getCar(slug: string) {
  return cars.find((car) => car.slug === slug);
}

export function registerCar(car: CarDefinition) {
  const index = cars.findIndex((entry) => entry.slug === car.slug);
  if (index >= 0) {
    cars[index] = car;
    return;
  }
  cars.push(car);
}
