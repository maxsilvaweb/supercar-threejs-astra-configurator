import { PORSCHE_GT4_MODEL } from "../lib/constants";
import { defineCar } from "../lib/schema";

export const porscheGt4 = defineCar({
  slug: "porsche-gt4",
  brand: "porsche",
  name: "Cayman GT4",
  year: "2016",
  tagline: "",
  spec: {
    highlights: [
      { label: "Power", value: "385 PS" },
      { label: "0–100", value: "4.4 s" },
      { label: "Layout", value: "Flat-six" },
    ],
    summary: [
      { label: "Power", value: "385 PS" },
      { label: "Torque", value: "420 Nm" },
      { label: "0–100", value: "4.4 s" },
      { label: "Top speed", value: "295 km/h" },
    ],
    details: [
      { label: "Engine", value: "3.8 L flat-six" },
      { label: "Power", value: "385 PS" },
      { label: "Torque", value: "420 Nm" },
      { label: "0–100", value: "4.4 s" },
      { label: "Top speed", value: "295 km/h" },
      { label: "Weight", value: "1,340 kg" },
      { label: "Drivetrain", value: "Mid-engine, rear-wheel drive" },
    ],
  },
  history: {
    kicker: "2015 · Weissach",
    headline: "First Cayman in the GT family",
    body: "Porsche introduced the Cayman GT4 as the first GT sports car based on the Cayman, developed by the Motorsport department in Weissach. It uses a 3.8-litre flat-six from the 911 Carrera S and a six-speed manual only.",
    facts: [
      { label: "Debut", value: "Geneva 2015" },
      { label: "Nordschleife", value: "7:40" },
      { label: "Gearbox", value: "6-speed manual" },
    ],
  },
  model: PORSCHE_GT4_MODEL,
  targetLength: 4.46,
  defaultFinish: "gloss",
  rideHeight: false,
  wheelDetect: "CaymanGT4\\.Wheel\\.",
  defaultPaints: {
    body: "#F4F4F4",
  },
  paintGroups: [{ id: "body", label: "Body", material: "^Paint$" }],
  locked: [
    {
      material:
        "BlackMatt|BlackGloss|Signal|White|Metallic|DRL|Logo|Interior|Gray|Glass|HighBeam|Headlight|Chrome|Brake|Taillight|Reverse|Carbon|Tire|Rust|Caliper",
    },
  ],
  aeroParts: [{ id: "spoiler", label: "Rear wing", object: "Spoiler", defaultVisible: true }],
  doors: [
    { id: "passenger", side: "left", position: { x: 0.13, y: 0.58, z: 0.5 }, detect: "RightDoor" },
    { id: "driver", side: "right", position: { x: 0.87, y: 0.58, z: 0.5 }, detect: "LeftDoor" },
  ],
  cabin: {
    wheelDetect: "Steer",
  },
});
