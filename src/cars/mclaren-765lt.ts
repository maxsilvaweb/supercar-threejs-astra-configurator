import { MCLAREN_765LT_MODEL } from "../lib/constants";
import { defineCar } from "../lib/schema";

export const mclaren765lt = defineCar({
  slug: "mclaren-765lt",
  brand: "mclaren",
  name: "765LT",
  year: "2021",
  tagline: "Longtail V8",
  spec: {
    highlights: [
      { label: "Power", value: "765 PS" },
      { label: "0–100", value: "2.8 s" },
      { label: "Layout", value: "Mid-engine V8" },
    ],
    summary: [
      { label: "Power", value: "765 PS" },
      { label: "Torque", value: "800 Nm" },
      { label: "0–100", value: "2.8 s" },
      { label: "Top speed", value: "330 km/h" },
    ],
    details: [
      { label: "Engine", value: "4.0 L twin-turbo V8" },
      { label: "Power", value: "765 PS" },
      { label: "Torque", value: "800 Nm" },
      { label: "0–100", value: "2.8 s" },
      { label: "Top speed", value: "330 km/h" },
      { label: "Weight", value: "1,229 kg dry" },
      { label: "Drivetrain", value: "Mid-engine, rear-wheel drive" },
    ],
  },
  history: {
    kicker: "2020 · Woking",
    headline: "Longtail of the 720S",
    body: "McLaren revealed the 765LT in 2020 as the longtail development of the 720S. Its 4.0-litre twin-turbo V8 produces 765 PS and 800 Nm, with a 2.8-second 0–100 km/h time and a 330 km/h top speed.",
    facts: [
      { label: "Debut", value: "2020" },
      { label: "Based on", value: "720S" },
      { label: "Power", value: "765 PS" },
    ],
  },
  model: MCLAREN_765LT_MODEL,
  targetLength: 4.6,
  groundLift: 0.02,
  defaultFinish: "gloss",
  finishes: ["gloss", "satin", "matte", "metallic"],
  rideHeight: false,
  wheelDetect: "WHL_",
  defaultPaints: {
    body: "#FF6A00",
  },
  paintGroups: [{ id: "body", label: "Body", material: "Carpaint Simple Onyx" }],
  locked: [
    {
      material:
        "Carbon|Glass|Leather|Tyre|Rubber|Metal|Iron|Brake|Headlight|DRL|Acrylic|Placa|Aluminium|Mirror|Grille|SeatBelt|Interior|Window|Light|Neblina",
    },
  ],
  aeroParts: [],
  doors: [
    { id: "passenger", side: "left", position: { x: 0.12, y: 0.48, z: 0.52 } },
    { id: "driver", side: "right", position: { x: 0.88, y: 0.48, z: 0.52 } },
  ],
  cabin: {
    left: { eye: { x: 0.395, y: 0.64, z: 0.47 }, look: { x: 0.395, y: 0.58, z: 0.62 } },
    right: { eye: { x: 0.605, y: 0.64, z: 0.47 }, look: { x: 0.605, y: 0.57, z: 0.62 } },
  },
});
