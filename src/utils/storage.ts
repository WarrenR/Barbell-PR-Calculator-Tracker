import { ALL_PLATES_MAP } from '../constants';
import { GymUserData, LiftType, PlateCountState, PRRecord } from '../types';
import { getOrCreateDeviceId } from './deviceIdentity';

const STORAGE_KEY = 'barbell_tracker_data_v1';

const INITIAL_DATA: GymUserData = {
  deviceId: '',
  bodyWeightKg: null,
  barWeightKg: 20,
  platesPerSide: {},
  prs: {},
  history: [],
};

export function loadUserData(): GymUserData {
  const deviceId = getOrCreateDeviceId();
  if (typeof window === 'undefined') {
    return { ...INITIAL_DATA, deviceId };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...INITIAL_DATA, deviceId };
    }
    const parsed = JSON.parse(raw) as GymUserData;
    return {
      deviceId,
      bodyWeightKg: typeof parsed.bodyWeightKg === 'number' ? parsed.bodyWeightKg : null,
      barWeightKg: parsed.barWeightKg || 20,
      platesPerSide: parsed.platesPerSide || {},
      prs: parsed.prs || {},
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch (e) {
    console.error('Failed to parse user data from localStorage', e);
    return { ...INITIAL_DATA, deviceId };
  }
}

export function saveUserData(data: GymUserData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save user data to localStorage', e);
  }
}

/**
 * Calculates total weight from bar weight and plates on both sides.
 * Total Load = Bar Weight + 2 * sum(plateWeight * countPerSide)
 * Guaranteed to be positive since barWeight >= 15kg and counts >= 0.
 */
export function calculateTotalWeight(
  barWeight: number,
  platesPerSide: PlateCountState
): number {
  let platesSum = 0;
  for (const [id, count] of Object.entries(platesPerSide)) {
    if (count > 0) {
      const plate = ALL_PLATES_MAP.get(id);
      if (plate) {
        platesSum += plate.weight * count;
      }
    }
  }
  // Total load includes plates on both sides (x2)
  const total = barWeight + platesSum * 2;
  // Round to 2 decimal places to avoid JS floating point issues (e.g. 1.75 * 2)
  return Math.round(total * 100) / 100;
}

/**
 * Calculates weight per single side
 */
export function calculateWeightPerSide(platesPerSide: PlateCountState): number {
  let platesSum = 0;
  for (const [id, count] of Object.entries(platesPerSide)) {
    if (count > 0) {
      const plate = ALL_PLATES_MAP.get(id);
      if (plate) {
        platesSum += plate.weight * count;
      }
    }
  }
  return Math.round(platesSum * 100) / 100;
}

/**
 * Calculates percentage of bodyweight (e.g. 150kg lift / 75kg bw = 200%)
 */
export function calculateBodyweightRatio(
  liftWeight: number,
  bodyWeightKg: number | null
): { percentage: string; multiplier: string } | null {
  if (!bodyWeightKg || bodyWeightKg <= 0) return null;
  const ratio = (liftWeight / bodyWeightKg) * 100;
  const mult = liftWeight / bodyWeightKg;
  return {
    percentage: `${ratio.toFixed(1)}%`,
    multiplier: `${mult.toFixed(2)}x`,
  };
}

/**
 * Haptic trigger for tactile mobile feedback
 */
export function triggerHaptic(type: 'light' | 'medium' | 'success' = 'light') {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      if (type === 'light') navigator.vibrate(12);
      else if (type === 'medium') navigator.vibrate(25);
      else if (type === 'success') navigator.vibrate([20, 40, 30]);
    } catch {
      // Ignore vibration errors if not permitted
    }
  }
}
