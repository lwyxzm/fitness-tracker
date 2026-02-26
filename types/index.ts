// types/index.ts

export interface Exercise {
  id: string;
  name: string;
  category: 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'other';
  createdAt: number;
}

export interface WorkoutSet {
  reps: number;
  weight: number;
}

export interface Workout {
  id: string;
  exerciseId: string;
  date: string; // YYYY-MM-DD
  sets: WorkoutSet[];
  notes?: string;
  createdAt: number;
}

export interface Settings {
  defaultUnit: 'kg' | 'lbs';
}

export type Unit = 'kg' | 'lbs';

export const KG_TO_LBS = 2.20462;
export const LBS_TO_KG = 0.453592;

export function convertWeight(weight: number, from: Unit, to: Unit): number {
  if (from === to) return weight;
  if (from === 'kg' && to === 'lbs') return Math.round(weight * KG_TO_LBS * 10) / 10;
  return Math.round(weight * LBS_TO_KG * 10) / 10;
}

export const EXERCISE_CATEGORIES = {
  chest: '胸部',
  back: '背部',
  legs: '腿部',
  shoulders: '肩部',
  arms: '手臂',
  core: '核心',
  other: '其他',
} as const;
