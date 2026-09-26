import { RED_BULL_RB18_MODEL } from "../lib/constants";
import { defineCar } from "../lib/schema";

export const redBullRb18 = defineCar({
  slug: "red-bull-rb18",
  brand: "honda",
  name: "RedBull",
  year: "2022",
  tagline: "Formula 1",
  spec: {
    highlights: [
      { label: "Power unit", value: "1.6 L V6" },
      { label: "Layout", value: "Hybrid" },
      { label: "Drive", value: "Rear-wheel" },
    ],
    summary: [
      { label: "Power unit", value: "1.6 L V6" },
      { label: "Induction", value: "Turbo hybrid" },
      { label: "Drive", value: "Rear-wheel" },
      { label: "Championship", value: "2022 Formula 1" },
    ],
    details: [
      { label: "Power unit", value: "1.6 L V6 turbo hybrid" },
      { label: "Layout", value: "Mid-engine" },
      { label: "Drivetrain", value: "Rear-wheel drive" },
      { label: "Championship", value: "2022 Formula 1" },
    ],
  },
  history: {
    kicker: "2022 · Honda",
    headline: "Both championships",
    body: "RedBull is Honda’s 2022 Formula 1 car. Max Verstappen and Sergio Pérez drove it to the drivers’ and constructors’ championships. Its power unit is a 1.6-litre V6 turbo hybrid, with drive to the rear wheels.",
    facts: [
      { label: "Series", value: "2022 Formula 1" },
      { label: "Line-up", value: "Verstappen · Pérez" },
      { label: "Power unit", value: "1.6 L V6 turbo hybrid" },
    ],
  },
  model: RED_BULL_RB18_MODEL,
  targetLength: 5.5,
  defaultFinish: "gloss",
  rideHeight: false,
  defaultPaints: {
    body: "#10233F",
  },
  paintGroups: [
    {
      id: "body",
      label: "Body",
      object:
        "Body|Spoiler|Wing|Canard|Fender|Holder|Swan_Neck|Grid|Chassis|Mirror|^(?:[1-7])(?:\\.001)?(?:\\s|$)",
      excludeObject: "Mirror Glass",
    },
  ],
  locked: [
    {
      object:
        "Tire|Rim|Bujon|Disk|Control|Switch|Shifter|Seat|Belt|Clip|Cabin|Light|Exhaust|Differential|Small Tube|Big Tube|Mirror Glass",
    },
  ],
  aeroParts: [],
  doors: [
    {
      id: "cockpit",
      side: "right",
      label: "Enter the cockpit",
      position: { x: 0.5, y: 0.62, z: 0.58 },
    },
  ],
  cabin: {
    entry: "direct",
    wheelDetect: "^Control$",
  },
});
