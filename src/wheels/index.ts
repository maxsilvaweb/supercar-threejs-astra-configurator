import { RIM_MODEL } from "../lib/constants";
import { defineWheel, type WheelDefinition } from "../lib/schema";

export const wheels: WheelDefinition[] = [
  defineWheel({ id: "stock", label: "Factory" }),
  defineWheel({
    id: "aftermarket",
    label: "Forged rim",
    model: RIM_MODEL,
  }),
];

export function getWheel(id: string) {
  return wheels.find((wheel) => wheel.id === id);
}
