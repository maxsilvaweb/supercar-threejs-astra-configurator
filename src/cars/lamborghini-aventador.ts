import { LAMBORGHINI_AVENTADOR_MODEL } from "../lib/constants";
import { defineCar } from "../lib/schema";

export const lamborghiniAventador = defineCar({
  slug: "lamborghini-aventador",
  brand: "lamborghini",
  name: "Aventador SVJ",
  year: "2018",
  tagline: "V12 flagship",
  hidden: true,
  model: LAMBORGHINI_AVENTADOR_MODEL,
  targetLength: 4.94,
  yaw: Math.PI / 2,
  defaultFinish: "gloss",
  rideHeight: false,
  wheelDetect: "AventadorTire",
  hideWhenAftermarket: { object: "AventadorRim" },
  defaultPaints: {
    body: "#FFFFFF",
  },
  paintGroups: [{ id: "body", label: "Body", material: "AventadorBody" }],
  locked: [
    { material: "AventadorGlass" },
    { material: "AventadorTire" },
    { material: "AventadorRim" },
    { material: "AventadorTrim" },
  ],
  aeroParts: [],
});
