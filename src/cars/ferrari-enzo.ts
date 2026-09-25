import { FERRARI_ENZO_DOOR_SOUND, FERRARI_ENZO_MODEL } from "../lib/constants";
import { defineCar } from "../lib/schema";

export const ferrariEnzo = defineCar({
  slug: "ferrari-enzo",
  brand: "ferrari",
  name: "Enzo",
  year: "2002",
  tagline: "V12 berlinetta",
  spec: {
    highlights: [
      { label: "Power", value: "660 PS" },
      { label: "0–100", value: "3.65 s" },
      { label: "Layout", value: "V12" },
    ],
    summary: [
      { label: "Power", value: "660 PS" },
      { label: "Torque", value: "657 Nm" },
      { label: "0–100", value: "3.65 s" },
      { label: "Top speed", value: ">350 km/h" },
    ],
    details: [
      { label: "Engine", value: "6.0 L V12" },
      { label: "Power", value: "660 PS" },
      { label: "Torque", value: "657 Nm" },
      { label: "0–100", value: "3.65 s" },
      { label: "Top speed", value: ">350 km/h" },
      { label: "Weight", value: "1,255 kg dry" },
      { label: "Drivetrain", value: "Mid-engine, rear-wheel drive" },
    ],
  },
  history: {
    kicker: "2002 · Maranello",
    headline: "Named for the founder",
    body: "Ferrari launched the Enzo in 2002 as a tribute to Enzo Ferrari, in the year Scuderia Ferrari dominated Formula 1. It followed the 288 GTO, F40 and F50 as a limited road car carrying F1-derived technology.",
    facts: [
      { label: "Run", value: "399 road cars" },
      { label: "Line", value: "After the F50" },
      { label: "Design", value: "Pininfarina" },
    ],
  },
  model: FERRARI_ENZO_MODEL,
  targetLength: 4.7,
  yaw: Math.PI / 2,
  defaultFinish: "satin",
  rideHeight: false,
  wheelDetect: "rueddad|rueda|tire",
  hideWhenAftermarket: { material: "Llanta" },
  defaultPaints: {
    body: "#0D0D0D",
    engine: "#0D0D0D",
  },
  paintGroups: [
    { id: "body", label: "Body", material: "Pintura" },
    { id: "engine", label: "Engine cover", material: "tapa motor" },
  ],
  locked: [
    {
      material:
        "cristal|luces|cuero|interior|Fibra|cromo|Llanta|rueda|disco|Logo|espejo|escape|Hierro|plastic|hueco|foco|volante|botn|Default|default|borrar|Marco|Material|base focos",
    },
  ],
  aeroParts: [],
  doors: [
    { id: "passenger", side: "left", position: { x: 0.02, y: 0.33, z: 0.6 } },
    { id: "driver", side: "right", position: { x: 0.98, y: 0.33, z: 0.6 } },
  ],
  doorSound: FERRARI_ENZO_DOOR_SOUND,
  cabin: {
    wheelDetect: "volante",
    left: { eye: { x: 0.32, y: 0.42, z: 0.5 }, look: { x: 0.32, y: 0.36, z: 0.72 } },
    right: { eye: { x: 0.68, y: 0.42, z: 0.5 }, look: { x: 0.68, y: 0.36, z: 0.68 } },
  },
});
