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
      position: { x: 0.13, y: 0.16, z: 0.55 },
      detect: 'Right_Door',
    },
    {
      id: 'driver',
      side: 'right',
      position: { x: 0.87, y: 0.16, z: 0.55 },
      detect: 'Left_Door',
    },
  ],
  cabin: {
    right: {
      eye: { x: 0.64, y: 0.32, z: 0.46 },
      look: { x: 0.65, y: 0.29, z: 0.58 },
    },
    left: {
      eye: { x: 0.4, y: 0.33, z: 0.5 },
      look: { x: 0.52, y: 0.32, z: 0.74 },
    },
  },
});
