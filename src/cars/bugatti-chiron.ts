import { BUGATTI_CHIRON_MODEL } from "../lib/constants";
import { defineCar } from "../lib/schema";

export const bugattiChiron = defineCar({
  slug: "bugatti-chiron",
  brand: "bugatti",
  name: "Chiron Super Sport 300",
  year: "2021",
  tagline: "",
  spec: {
    highlights: [
      { label: "Power", value: "1,600 PS" },
      { label: "0–100", value: "2.4 s" },
      { label: "Layout", value: "W16" },
    ],
    summary: [
      { label: "Power", value: "1,600 PS" },
      { label: "Torque", value: "1,600 Nm" },
      { label: "0–100", value: "2.4 s" },
      { label: "Top speed", value: "440 km/h" },
    ],
    details: [
      { label: "Engine", value: "8.0 L quad-turbo W16" },
      { label: "Power", value: "1,600 PS" },
      { label: "Torque", value: "1,600 Nm" },
      { label: "0–100", value: "2.4 s" },
      { label: "Top speed", value: "440 km/h" },
      { label: "Drivetrain", value: "Mid-engine, all-wheel drive" },
    ],
  },
  history: {
    kicker: "2021 · Molsheim",
    headline: "The long-tail Chiron",
    body: "Bugatti presented the Chiron Super Sport 300 in 2021 as the high-speed development of the Chiron. A longer tail and revised aero support a 440 km/h top speed from the 8.0-litre quad-turbo W16.",
    facts: [
      { label: "Built", value: "Molsheim" },
      { label: "Engine", value: "Quad-turbo W16" },
      { label: "Top speed", value: "440 km/h" },
    ],
  },
  model: BUGATTI_CHIRON_MODEL,
  targetLength: 4.54,
  groundLift: 0.059,
  defaultFinish: "gloss",
  rideHeight: false,
  wheelDetect: "Tire",
  defaultPaints: {
    body: "#0D0D0D",
    stripes: "#FF6A00",
  },
  paintGroups: [
    {
      id: "body",
      label: "Body",
      material: "^CSR2_Carbon1$",
      excludeObject: "SteeringWheel|Spoiler",
    },
    {
      id: "stripes",
      label: "Stripes",
      material: "^CSR2_CarPaint$",
      excludeObject: "Spoiler",
    },
  ],
  locked: [
    {
      material: "Badge|Base|Calliper|Carbon|Coloured|Grille|Interior|Light|Wheel|Glass|Window|Mirror|brake|headlight|Park",
      excludeObject: "^Carbon1 |DoorLF_Carbon1|DoorRF_Carbon1|Trunk_Carbon1",
    },
  ],
  aeroParts: [],
  doors: [
    { id: "driver", side: "right", position: { x: 1.04, y: 0.5, z: 0.52 }, detect: "DoorLF" },
    { id: "passenger", side: "left", position: { x: -0.04, y: 0.5, z: 0.52 }, detect: "DoorRF" },
  ],
  cabin: {
    right: {
      eye: { x: 0.68, y: 0.66, z: 0.57 },
      look: { x: 0.68, y: 0.58, z: 0.74 },
    },
    left: {
      eye: { x: 0.3, y: 0.66, z: 0.57 },
      look: { x: 0.3, y: 0.58, z: 0.78 },
    },
  },
});
