import { AUDI_R8_LMS_MODEL } from "../lib/constants";
import { defineCar } from "../lib/schema";

export const audiR8Lms = defineCar({
  slug: "audi-r8-lms",
  brand: "audi",
  name: "R8 LMS",
  year: "2022",
  tagline: "GT3",
  spec: {
    highlights: [
      { label: "Power", value: "Up to 585 hp" },
      { label: "Layout", value: "Mid-engine V10" },
      { label: "Drive", value: "Rear-wheel" },
    ],
    summary: [
      { label: "Power", value: "Up to 585 hp" },
      { label: "Torque", value: "Over 550 Nm" },
      { label: "Engine", value: "5.2 L V10" },
      { label: "Drive", value: "Rear-wheel" },
    ],
    details: [
      { label: "Engine", value: "5.2 L V10" },
      { label: "Power", value: "Up to 585 hp" },
      { label: "Torque", value: "Over 550 Nm" },
      { label: "Gearbox", value: "6-speed sequential" },
      { label: "Drivetrain", value: "Mid-engine, rear-wheel drive" },
      { label: "Weight", value: "1,235 kg dry" },
      { label: "Class", value: "FIA GT3" },
    ],
  },
  history: {
    kicker: "2022 · Audi Sport",
    headline: "Customer GT3",
    body: "The R8 LMS is Audi Sport’s customer car for FIA GT3. Its 5.2-litre V10 is built on the same line as the road car and, with restrictors, produces up to 585 hp and over 550 Nm. Drive is to the rear wheels through a six-speed sequential gearbox.",
    facts: [
      { label: "Class", value: "FIA GT3" },
      { label: "Power", value: "Up to 585 hp" },
      { label: "Weight", value: "1,235 kg dry" },
    ],
  },
  model: AUDI_R8_LMS_MODEL,
  targetLength: 4.6,
  defaultFinish: "gloss",
  rideHeight: false,
  defaultPaints: {},
  paintGroups: [],
  aeroParts: [],
  doors: [
    { id: "passenger", side: "left", position: { x: 0.12, y: 0.48, z: 0.55 } },
    { id: "driver", side: "right", position: { x: 0.88, y: 0.48, z: 0.55 } },
  ],
  cabin: {
    wheelDetect: "r8gts_sw",
    seatBack: 0.55,
    left: {
      eye: { x: 0.32, y: 0.5, z: 0.5 },
      look: { x: 0.32, y: 0.46, z: 0.72 },
    },
    right: {
      eye: { x: 0.68, y: 0.5, z: 0.5 },
      look: { x: 0.68, y: 0.43, z: 0.62 },
    },
  },
});
