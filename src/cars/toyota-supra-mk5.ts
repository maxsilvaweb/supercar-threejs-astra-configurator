import { TOYOTA_SUPRA_MK5_MODEL } from "../lib/constants";
import { defineCar } from "../lib/schema";

export const toyotaSupraMk5 = defineCar({
  slug: "toyota-supra-mk5",
  brand: "toyota",
  name: "Supra MK5",
  year: "2019",
  tagline: "",
  spec: {
    highlights: [
      { label: "Power", value: "382 hp" },
      { label: "0–60", value: "3.9 s" },
      { label: "Layout", value: "Inline-six" },
    ],
    summary: [
      { label: "Power", value: "382 hp" },
      { label: "Torque", value: "368 lb-ft" },
      { label: "0–60", value: "3.9 s" },
      { label: "Top speed", value: "155 mph" },
    ],
    details: [
      { label: "Engine", value: "3.0 L turbo inline-six" },
      { label: "Power", value: "382 hp" },
      { label: "Torque", value: "368 lb-ft" },
      { label: "0–60", value: "3.9 s" },
      { label: "Top speed", value: "155 mph" },
      { label: "Drivetrain", value: "Front-engine, rear-wheel drive" },
    ],
  },
  history: {
    kicker: "2019 · A90",
    headline: "Back after 17 years",
    body: "Toyota premiered the fifth-generation Supra in Detroit in 2019, ending a 17-year gap. It is the first global GR model and was developed with BMW, keeping the front-engine, rear-drive inline-six layout used since 1978.",
    facts: [
      { label: "Built", value: "Magna Steyr, Graz" },
      { label: "Series", value: "TOYOTA GAZOO Racing" },
      { label: "Layout", value: "Front-engine RWD" },
    ],
  },
  model: TOYOTA_SUPRA_MK5_MODEL,
  targetLength: 4.05,
  defaultFinish: "gloss",
  rideHeight: false,
  wheelDetect: "tire",
  defaultPaints: {
    body: "#FFFFFF",
  },
  paintGroups: [{ id: "body", label: "Body", material: "^carpaint$" }],
  locked: [
    {
      material:
        "lambert|Gloss|metal|carbon|button|leather|brake|glass|reflec|plate|tire|mirror|light|screen|seat|taillight",
    },
  ],
  aeroParts: [],
  doors: [
    { id: "passenger", side: "left", position: { x: -0.04, y: 0.5, z: 0.52 } },
    { id: "driver", side: "right", position: { x: 1.04, y: 0.5, z: 0.52 } },
  ],
  cabin: {
    right: {
      eye: { x: 0.58, y: 0.46, z: 0.46 },
      look: { x: 0.58, y: 0.48, z: 0.78 },
    },
    left: {
      eye: { x: 0.42, y: 0.46, z: 0.46 },
      look: { x: 0.42, y: 0.48, z: 0.78 },
    },
  },
});
