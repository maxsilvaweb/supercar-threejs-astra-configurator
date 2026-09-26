import { LAMBORGHINI_TEMERARIO_MODEL } from "../lib/constants";
import { defineCar } from "../lib/schema";

export const lamborghiniTemerario = defineCar({
  slug: "lamborghini-temerario",
  brand: "lamborghini",
  name: "Temerario",
  year: "2024",
  tagline: "Hybrid V8",
  spec: {
    highlights: [
      { label: "Power", value: "920 CV" },
      { label: "0–100", value: "2.7 s" },
      { label: "Layout", value: "Hybrid V8" },
    ],
    summary: [
      { label: "Power", value: "920 CV" },
      { label: "Torque", value: "730 Nm" },
      { label: "0–100", value: "2.7 s" },
      { label: "Top speed", value: "343 km/h" },
    ],
    details: [
      { label: "Engine", value: "4.0 L twin-turbo V8 hybrid" },
      { label: "Power", value: "920 CV combined" },
      { label: "Torque", value: "730 Nm" },
      { label: "0–100", value: "2.7 s" },
      { label: "Top speed", value: "343 km/h" },
      { label: "Weight", value: "1,690 kg dry" },
      { label: "Drivetrain", value: "Mid-engine, all-wheel drive" },
    ],
  },
  history: {
    kicker: "2024 · Monterey",
    headline: "Successor to the Huracán",
    body: "Lamborghini unveiled the Temerario at Monterey Car Week in 2024. It is the second HPEV after the Revuelto, with a new twin-turbo V8 and three electric motors, and it replaces the Huracán.",
    facts: [
      { label: "Debut", value: "Monterey 2024" },
      { label: "Replaced", value: "Huracán" },
      { label: "Powertrain", value: "V8 + 3 motors" },
    ],
  },
  model: LAMBORGHINI_TEMERARIO_MODEL,
  targetLength: 4.71,
  yaw: Math.PI / 2,
  groundLift: 0.028,
  defaultFinish: "gloss",
  finishes: ["gloss", "satin", "matte", "metallic"],
  rideHeight: false,
  wheelDetect: "WHL_.*_Tire",
  defaultPaints: {
    body: "#F5D300",
  },
  paintGroups: [{ id: "body", label: "Body", material: "Carpaint|car_metallic_paint" }],
  locked: [
    {
      material:
        "Wheel|Glass|Leather|Plastic|Carbon|Belt|Floor|Display|Badge|Rubber|Black|Aluminum|Corsa|Light|Disc|Hub|Primer|Mirror|Logo|Icon|Silver|Ceramic|Alcantara|Grid|Grille",
    },
  ],
  aeroParts: [],
  doors: [
    { id: "passenger", side: "left", position: { x: 0.1, y: 0.48, z: 0.52 }, detect: "DOOR_R_" },
    { id: "driver", side: "right", position: { x: 0.9, y: 0.48, z: 0.52 }, detect: "DOOR_L_" },
  ],
  cabin: {
    left: { eye: { x: 0.331, y: 0.67, z: 0.48 }, look: { x: 0.331, y: 0.652, z: 0.601 } },
    right: { eye: { x: 0.662, y: 0.67, z: 0.48 }, look: { x: 0.662, y: 0.661, z: 0.567 } },
  },
});
