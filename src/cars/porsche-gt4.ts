import { PORSCHE_GT4_MODEL } from "../lib/constants";
import { defineCar } from "../lib/schema";

export const porscheGt4 = defineCar({
  slug: "porsche-gt4",
  brand: "porsche",
  name: "Cayman GT4",
  year: "2016",
  tagline: "",
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
