import { FERRARI_SF25_MODEL } from "../lib/constants";
import { defineCar } from "../lib/schema";

export const ferrariSf25 = defineCar({
  slug: "ferrari-sf25",
  brand: "ferrari",
  name: "SF-25",
  year: "2025",
  tagline: "Formula 1 challenger",
  model: FERRARI_SF25_MODEL,
  targetLength: 5.4,
  yaw: Math.PI,
  defaultFinish: "gloss",
  rideHeight: false,
  wheelDetect: "Tire_",
  hideWhenAftermarket: { material: "FER_SF25_TIRE" },
  defaultPaints: {
    frontWing: "#FF2800",
    nose: "#FF2800",
    rearWing: "#FF2800",
    rearFlap: "#FF2800",
    left: "#FF2800",
    top: "#FF2800",
    right: "#FF2800",
    body: "#FF2800",
  },
  paintGroups: [
    { id: "frontWing", label: "Front wing", object: "FrontWing" },
    { id: "nose", label: "Nose", object: "^Nose" },
    { id: "rearWing", label: "Rear wing", object: "RearWing" },
    { id: "rearFlap", label: "DRS flap", object: "RearFlap|DRS" },
    { id: "left", label: "Left livery", material: "LEFT" },
    { id: "top", label: "Top livery", material: "TOP", excludeMaterial: "SW" },
    { id: "right", label: "Right livery", material: "RIGHT" },
    { id: "body", label: "Body", object: "BODY" },
  ],
  locked: [
    { material: "Mirror|_CF|TIRE|DRY|SW_" },
    { object: "Steering|Brake|Suspension" },
  ],
  aeroParts: [
    { id: "frontWing", label: "Front wing", object: "FrontWing", defaultVisible: true },
    { id: "rearWing", label: "Rear wing", object: "RearWing", defaultVisible: true },
    { id: "drs", label: "DRS / rear flap", object: "RearFlap|DRS", defaultVisible: true },
    { id: "nose", label: "Nose", object: "^Nose", defaultVisible: true },
  ],
  doors: [
    {
      id: "cockpit",
      side: "right",
      label: "Enter the cockpit",
      position: { x: 0.5, y: 0.7, z: 0.6 },
    },
  ],
  cabin: {
    entry: "direct",
    wheelDetect: "SteeringWheel",
    right: {
      eye: { x: 0.5, y: 0.56, z: 0.52 },
      look: { x: 0.5, y: 0.5, z: 0.7 },
    },
  },
});
