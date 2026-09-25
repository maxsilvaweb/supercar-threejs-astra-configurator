import { CHEVROLET_ZR1_MODEL } from "../lib/constants";
import { defineCar } from "../lib/schema";

export const chevroletZr1 = defineCar({
  slug: "chevrolet-zr1",
  brand: "chevrolet",
  name: "ZR1",
  year: "2018",
  tagline: "",
  spec: {
    highlights: [
      { label: "Power", value: "755 hp" },
      { label: "0–60", value: "2.85 s" },
      { label: "Layout", value: "Supercharged V8" },
    ],
    summary: [
      { label: "Power", value: "755 hp" },
      { label: "Torque", value: "969 Nm" },
      { label: "0–60", value: "2.85 s" },
      { label: "Top speed", value: "212 mph" },
    ],
    details: [
      { label: "Engine", value: "6.2 L LT5 supercharged V8" },
      { label: "Power", value: "755 hp" },
      { label: "Torque", value: "715 lb-ft" },
      { label: "0–60", value: "2.85 s" },
      { label: "Top speed", value: "212 mph" },
      { label: "Weight", value: "3,584 lb" },
      { label: "Drivetrain", value: "Front-engine, rear-wheel drive" },
    ],
  },
  history: {
    kicker: "2019 · Bowling Green",
    headline: "Return of the King",
    body: "Chevrolet introduced the 2019 Corvette ZR1 as the fastest, most powerful production Corvette of its day. The hand-built LT5 supercharged V8 continued the ZR1 King of the Hill line that began with the C6.",
    facts: [
      { label: "Engine", value: "LT5 supercharged V8" },
      { label: "Output", value: "755 hp" },
      { label: "On sale", value: "2018" },
    ],
  },
  model: CHEVROLET_ZR1_MODEL,
  targetLength: 4.57,
  defaultFinish: "matte",
  rideHeight: false,
  wheelDetect: "ZR1\\.Wheel\\.",
  defaultPaints: {
    body: "#050505",
  },
  paintGroups: [{ id: "body", label: "Body", material: "^ZR1\\.Paint$" }],
  locked: [
    {
      material:
        "Window|BlackMatt|Diff|Signal|Badge|Carbon|BlueGloss|Glass|Metallic|Taillight|Chrome|Screwhead|Headlight|Beige|Symbols|Stichs|Gauges|Embossed|Grille|Alcantara|LCD|Screen|Runninglight|Leather|Seatbelt|Brake|Steer|Chassis|Rims|Tire|Caliper|ExtDetails",
    },
  ],
  aeroParts: [{ id: "wing", label: "Rear wing", object: "ZR1\\.?Wing", defaultVisible: true }],
  doors: [
    { id: "passenger", side: "left", position: { x: 0.13, y: 0.5, z: 0.55 }, detect: "ZR1\\.Door\\.R$" },
    { id: "driver", side: "right", position: { x: 0.87, y: 0.5, z: 0.55 }, detect: "ZR1\\.Door\\.L$" },
  ],
  cabin: {
    right: {
      eye: { x: 0.68, y: 0.66, z: 0.35 },
      look: { x: 0.68, y: 0.7, z: 0.74 },
    },
    left: {
      eye: { x: 0.42, y: 0.66, z: 0.35 },
      look: { x: 0.42, y: 0.7, z: 0.74 },
    },
  },
});
