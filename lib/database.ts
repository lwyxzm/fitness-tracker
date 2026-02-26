// lib/database.ts
import * as SQLite from 'expo-sqlite';
import { Exercise, Workout, WorkoutSet } from '@/types';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  
  db = await SQLite.openDatabaseAsync('fitness_tracker.db');
  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS workouts (
      id TEXT PRIMARY KEY,
      exercise_id TEXT NOT NULL,
      date TEXT NOT NULL,
      sets TEXT NOT NULL,
      notes TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (exercise_id) REFERENCES exercises(id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date);
    CREATE INDEX IF NOT EXISTS idx_workouts_exercise ON workouts(exercise_id);
  `);
  
  return db;
}

export async function addExercise(exercise: Exercise): Promise<void> {
  const database = await initDatabase();
  await database.runAsync(
    'INSERT INTO exercises (id, name, category, created_at) VALUES (?, ?, ?, ?)',
    [exercise.id, exercise.name, exercise.category, exercise.createdAt]
  );
}

export async function getExercises(): Promise<Exercise[]> {
  const database = await initDatabase();
  const rows = await database.getAllAsync<{
    id: string;
    name: string;
    category: string;
    created_at: number;
  }>('SELECT * FROM exercises ORDER BY name');
  
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    category: row.category as Exercise['category'],
    createdAt: row.created_at,
  }));
}

export async function getExerciseById(id: string): Promise<Exercise | null> {
  const database = await initDatabase();
  const row = await database.getFirstAsync<{
    id: string;
    name: string;
    category: string;
    created_at: number;
  }>('SELECT * FROM exercises WHERE id = ?', [id]);
  
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    category: row.category as Exercise['category'],
    createdAt: row.created_at,
  };
}

export async function deleteExercise(id: string): Promise<void> {
  const database = await initDatabase();
  await database.runAsync('DELETE FROM workouts WHERE exercise_id = ?', [id]);
  await database.runAsync('DELETE FROM exercises WHERE id = ?', [id]);
}

export async function addWorkout(workout: Workout): Promise<void> {
  const database = await initDatabase();
  await database.runAsync(
    'INSERT INTO workouts (id, exercise_id, date, sets, notes, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [workout.id, workout.exerciseId, workout.date, JSON.stringify(workout.sets), workout.notes || null, workout.createdAt]
  );
}

export async function getWorkouts(): Promise<Workout[]> {
  const database = await initDatabase();
  const rows = await database.getAllAsync<{
    id: string;
    exercise_id: string;
    date: string;
    sets: string;
    notes: string | null;
    created_at: number;
  }>('SELECT * FROM workouts ORDER BY date DESC, created_at DESC');
  
  return rows.map(row => ({
    id: row.id,
    exerciseId: row.exercise_id,
    date: row.date,
    sets: JSON.parse(row.sets) as WorkoutSet[],
    notes: row.notes || undefined,
    createdAt: row.created_at,
  }));
}

export async function getWorkoutsByExercise(exerciseId: string): Promise<Workout[]> {
  const database = await initDatabase();
  const rows = await database.getAllAsync<{
    id: string;
    exercise_id: string;
    date: string;
    sets: string;
    notes: string | null;
    created_at: number;
  }>('SELECT * FROM workouts WHERE exercise_id = ? ORDER BY date ASC', [exerciseId]);
  
  return rows.map(row => ({
    id: row.id,
    exerciseId: row.exercise_id,
    date: row.date,
    sets: JSON.parse(row.sets) as WorkoutSet[],
    notes: row.notes || undefined,
    createdAt: row.created_at,
  }));
}

export async function getWorkoutsByDate(date: string): Promise<Workout[]> {
  const database = await initDatabase();
  const rows = await database.getAllAsync<{
    id: string;
    exercise_id: string;
    date: string;
    sets: string;
    notes: string | null;
    created_at: number;
  }>('SELECT * FROM workouts WHERE date = ? ORDER BY created_at DESC', [date]);
  
  return rows.map(row => ({
    id: row.id,
    exerciseId: row.exercise_id,
    date: row.date,
    sets: JSON.parse(row.sets) as WorkoutSet[],
    notes: row.notes || undefined,
    createdAt: row.created_at,
  }));
}

export async function deleteWorkout(id: string): Promise<void> {
  const database = await initDatabase();
  await database.runAsync('DELETE FROM workouts WHERE id = ?', [id]);
}
