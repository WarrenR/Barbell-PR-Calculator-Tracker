export type LiftType = 'Squat' | 'Deadlift' | 'Bench Press';

export type PlateCategory = 'standard' | 'partial';

export interface PlateDefinition {
  id: string;
  weight: number;
  label: string;
  colorName: string;
  category: PlateCategory;
  // UI colors
  hex: string;
  textHex: string;
  borderHex?: string;
  diameterRatio: number; // For visual bar scaling (1.0 for 25kg, down to ~0.4 for 0.5kg)
  widthPx: number; // Plate thickness representation
}

export interface PlateCountState {
  [plateId: string]: number; // count PER SIDE
}

export interface PRRecord {
  id: string;
  lift: LiftType;
  weight: number; // total load in kg
  barWeight: number;
  platesPerSide: PlateCountState;
  bodyWeight?: number;
  percentageOfBW?: number;
  date: string; // ISO string
  notes?: string;
}

export interface GymUserData {
  deviceId: string;
  bodyWeightKg: number | null;
  barWeightKg: number;
  platesPerSide: PlateCountState;
  prs: {
    Squat?: PRRecord;
    'Bench Press'?: PRRecord;
    Deadlift?: PRRecord;
  };
  history: PRRecord[];
}
