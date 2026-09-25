import { ASTON_MARTIN_VALHALLA_MODEL } from '../lib/constants';
import { defineCar } from '../lib/schema';

export const astonMartinValhalla = defineCar({
  slug: 'aston-martin-valhalla',
  brand: 'aston-martin',
  name: 'Valhalla',
  year: '2025',
  tagline: '',
  spec: {
    highlights: [
      { label: 'Power', value: '1,079 PS' },
      { label: '0–62', value: '2.5 s' },
      { label: 'Layout', value: 'Hybrid V8' },
    ],
    summary: [
      { label: 'Power', value: '1,079 PS' },
      { label: 'Torque', value: '1,100 Nm' },
      { label: '0–62', value: '2.5 s' },
      { label: 'Top speed', value: '217 mph' },
    ],
    details: [
      { label: 'Engine', value: '4.0 L twin-turbo V8 hybrid' },
      { label: 'Power', value: '1,079 PS' },
      { label: 'Torque', value: '1,100 Nm' },
      { label: '0–62', value: '2.5 s' },
      { label: 'Top speed', value: '217 mph' },
      { label: 'Drivetrain', value: 'Mid-engine, all-wheel drive' },
    ],
  },
  history: {
    kicker: "2025",
    headline: "First series mid-engine Aston",
    body: "Valhalla began as the AM-RB 003 and takes its name from Norse myth, following Valkyrie. Aston Martin calls it the marque’s first series-production mid-engined supercar and first plug-in hybrid.",
    facts: [
      { label: "Run", value: "999 cars" },
      { label: "Deliveries", value: "H2 2025" },
      { label: "Origin", value: "AM-RB 003" },
    ],
  },
  model: ASTON_MARTIN_VALHALLA_MODEL,
  targetLength: 4.73,
  defaultFinish: 'gloss',
  rideHeight: false,
  wheelDetect: 'Wheel_',
  defaultPaints: {
    body: '#0E6B3C',
  },
  paintGroups: [{ id: 'body', label: 'Body', material: '^Paint$' }],
  locked: [
    {
      material:
        'Badge|Base|Carbon|Coloured|Glass|Grille|Interior|Light|Textured|Wheel|Caliper|Engine|Manufacturer',
    },
  ],
  aeroParts: [],
  doors: [
    {
      id: 'passenger',
      side: 'left',
      position: { x: 0.13, y: 0.58, z: 0.55 },
      detect: 'Right_Door',
    },
    {
      id: 'driver',
      side: 'right',
      position: { x: 0.87, y: 0.58, z: 0.55 },
      detect: 'Left_Door',
    },
  ],
  cabin: {
    wheelDetect: "^Object_368$",
    seatLift: 0.22,
    right: {
      eye: { x: 0.68, y: 0.34, z: 0.46 },
      look: { x: 0.68, y: 0.32, z: 0.72 },
    },
    left: {
      eye: { x: 0.38, y: 0.33, z: 0.5 },
      look: { x: 0.5, y: 0.32, z: 0.74 },
    },
  },
});
