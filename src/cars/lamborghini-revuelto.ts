import { LAMBORGHINI_REVUELTO_MODEL } from "../lib/constants";
import { defineCar } from "../lib/schema";

export const lamborghiniRevuelto = defineCar({
  slug: "lamborghini-revuelto",
  brand: "lamborghini",
  name: "Revuelto",
  year: "2023",
  tagline: "",
  spec: {
    highlights: [
      { label: "Power", value: "1,015 CV" },
      { label: "0–100", value: "2.5 s" },
      { label: "Layout", value: "Hybrid V12" },
    ],
    summary: [
      { label: "Power", value: "1,015 CV" },
      { label: "Torque", value: "725 Nm" },
      { label: "0–100", value: "2.5 s" },
      { label: "Top speed", value: ">350 km/h" },
    ],
    details: [
      { label: "Engine", value: "6.5 L V12 hybrid" },
      { label: "Power", value: "1,015 CV combined" },
      { label: "Torque", value: "725 Nm (V12)" },
      { label: "0–100", value: "2.5 s" },
      { label: "Top speed", value: ">350 km/h" },
      { label: "Weight", value: "1,772 kg dry" },
      { label: "Drivetrain", value: "Mid-engine, all-wheel drive" },
    ],
  },
  model: LAMBORGHINI_REVUELTO_MODEL,
  targetLength: 4.95,
  defaultFinish: "gloss",
  rideHeight: false,
  wheelDetect: "^Wheel_",
  defaultPaints: {
    body: "#c9573d",
  },
  paintGroups: [{ id: "body", label: "Body", material: "M_CarPaint|car_paint" }],
  locked: [
    {
      material:
        "Wheel|Rubber|Steel|Rotor|DarkMetal|PaintedMetal|Detail|GunMetal|Caliper|Screw|Brake|Plastic|Badge|Label|Carbon|Grille|Undercarriage|Black|Chrome|Aluminum|Plate|Mirror|Anodized|Glass|Titanium|Heat|Alcantara|Stitch|Leather|Screen|Carpet|Seatbelt|Emitter|HeadLight|Emission",
    },
  ],
  aeroParts: [
    {
      id: "wing",
      label: "Rear wing",
      object: "^Wing(_|Hinge|Piston|Strut)",
      defaultVisible: true,
    },
  ],
  doors: [
    { id: "passenger", side: "left", position: { x: 0.11, y: 0.43, z: 0.55 }, detect: "DoorRF_" },
    { id: "driver", side: "right", position: { x: 0.89, y: 0.43, z: 0.55 }, detect: "DoorLF_" },
  ],
  cabin: {
    wheelDetect: "SteeringWheel",
  },
});
