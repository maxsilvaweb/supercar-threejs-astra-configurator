import { FERRARI_ENZO_DOOR_SOUND, FERRARI_ENZO_MODEL } from "../lib/constants";
import { defineCar } from "../lib/schema";

export const ferrariEnzo = defineCar({
  slug: "ferrari-enzo",
  brand: "ferrari",
  name: "Enzo",
  year: "2002",
  tagline: "V12 berlinetta",
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
  ignition: {
    position: { x: 0.485, y: 0.274, z: 0.645 },
    buttonDetect: "botn",
  },
});
