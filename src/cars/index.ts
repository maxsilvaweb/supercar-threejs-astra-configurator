import type { CarDefinition } from "../lib/schema";
import { ferrariEnzo } from "./ferrari-enzo";
import { ferrariSf25 } from "./ferrari-sf25";
import { lamborghiniAventador } from "./lamborghini-aventador";

const cars: CarDefinition[] = [ferrariSf25, ferrariEnzo, lamborghiniAventador];

export function listCars() {
  return cars;
}

export function listConfigurableCars() {
  return cars.filter((car) => !car.comingSoon);
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
