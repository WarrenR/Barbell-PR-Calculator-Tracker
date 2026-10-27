import { PlateDefinition } from './types';

export const BAR_WEIGHT_OPTIONS = [12.5, 15, 20, 23, 24, 25] as const;
export type BarWeightOption = (typeof BAR_WEIGHT_OPTIONS)[number];

export interface BarOption {
  weight: BarWeightOption;
  label: string;
}

export const BAR_OPTIONS: BarOption[] = [
  { weight: 12.5, label: '12.5kg - Short bar' },
  { weight: 15, label: "15kg - Women's/Technique barbell" },
  { weight: 20, label: '20kg - Standard Olympic Barbell' },
  { weight: 23, label: '23kg - Black Deadlift Frame' },
  { weight: 24, label: '24kg - Safety Squat Barbell' },
  { weight: 25, label: '25kg - Silver Deadlift Frame' },
];

export const STANDARD_PLATES: PlateDefinition[] = [
  {
    id: 'red-25',
    weight: 25,
    label: '25 kg',
    colorName: 'Red',
    category: 'standard',
    hex: '#DC2626', // Vibrant Red
    textHex: '#FFFFFF',
    diameterRatio: 1.0, // Standard 450mm Olympic diameter
    widthPx: 26,
  },
  {
    id: 'blue-20',
    weight: 20,
    label: '20 kg',
    colorName: 'Blue',
    category: 'standard',
    hex: '#2563EB', // Olympic Blue
    textHex: '#FFFFFF',
    diameterRatio: 1.0, // 450mm
    widthPx: 23,
  },
  {
    id: 'yellow-15',
    weight: 15,
    label: '15 kg',
    colorName: 'Yellow',
    category: 'standard',
    hex: '#EAB308', // Olympic Yellow
    textHex: '#000000',
    diameterRatio: 0.95, // ~400-450mm
    widthPx: 20,
  },
  {
    id: 'green-10',
    weight: 10,
    label: '10 kg',
    colorName: 'Green',
    category: 'standard',
    hex: '#16A34A', // Olympic Green
    textHex: '#FFFFFF',
    diameterRatio: 0.82,
    widthPx: 17,
  },
  {
    id: 'grey-5',
    weight: 5,
    label: '5 kg',
    colorName: 'Grey',
    category: 'standard',
    hex: '#6B7280', // Grey
    textHex: '#FFFFFF',
    diameterRatio: 0.65,
    widthPx: 14,
  },
];

export const PARTIAL_PLATES: PlateDefinition[] = [
  {
    id: 'red-2-5',
    weight: 2.5,
    label: '2.5 kg',
    colorName: 'Red',
    category: 'partial',
    hex: '#EF4444',
    textHex: '#FFFFFF',
    diameterRatio: 0.52,
    widthPx: 13,
  },
  {
    id: 'blue-2-0',
    weight: 2.0,
    label: '2.0 kg',
    colorName: 'Blue',
    category: 'partial',
    hex: '#3B82F6',
    textHex: '#FFFFFF',
    diameterRatio: 0.48,
    widthPx: 12,
  },
  {
    id: 'black-1-75',
    weight: 1.75,
    label: '1.75 kg',
    colorName: 'Black',
    category: 'partial',
    hex: '#18181B',
    textHex: '#F4F4F5',
    borderHex: '#3F3F46',
    diameterRatio: 0.45,
    widthPx: 11,
  },
  {
    id: 'yellow-1-5',
    weight: 1.5,
    label: '1.5 kg',
    colorName: 'Yellow',
    category: 'partial',
    hex: '#FACC15',
    textHex: '#000000',
    diameterRatio: 0.42,
    widthPx: 10,
  },
  {
    id: 'green-1-0',
    weight: 1.0,
    label: '1.0 kg',
    colorName: 'Green',
    category: 'partial',
    hex: '#22C55E',
    textHex: '#FFFFFF',
    diameterRatio: 0.38,
    widthPx: 9,
  },
  {
    id: 'white-0-5',
    weight: 0.5,
    label: '0.5 kg',
    colorName: 'White',
    category: 'partial',
    hex: '#F8FAFC',
    textHex: '#0F172A',
    borderHex: '#CBD5E1',
    diameterRatio: 0.35,
    widthPx: 8,
  },
];

export const ALL_PLATES: PlateDefinition[] = [
  ...STANDARD_PLATES,
  ...PARTIAL_PLATES,
];

export const ALL_PLATES_MAP = new Map<string, PlateDefinition>(
  ALL_PLATES.map((p) => [p.id, p])
);

export const SUPPORTED_LIFTS = ['Squat', 'Bench Press', 'Deadlift'] as const;
