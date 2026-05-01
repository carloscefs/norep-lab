export type Sex = "masculino" | "feminino";
export type GymType = "raiz" | "moderna";

export type MuscleGroup =
  | "peito"
  | "costas"
  | "ombro"
  | "biceps"
  | "triceps"
  | "quadriceps"
  | "posterior"
  | "gluteo"
  | "panturrilha"
  | "core"
  | "antebraco"
  | "trapezio";

export type Technique =
  | "rest-pause"
  | "isometria"
  | "parciais"
  | "excentrica-lenta"
  | "drop-set";

export type Level = "iniciante" | "intermediario" | "avancado";

export type Goal =
  | "hipertrofia"
  | "perda-peso"
  | "recomposicao"
  | "condicionamento";

export type TrainingDays = 3 | 4 | 5 | 6;
export type SessionDuration = 45 | 60 | 90 | 120;

export interface UserProfile {
  sex: Sex;
  age: number;
  weight: number;
  height: number;
  days: TrainingDays;
  duration: SessionDuration;
  level: Level;
  goal: Goal;
  cardio: boolean;
  gymType: GymType;
}

export interface Exercise {
  id: string;
  name: string;
  group: MuscleGroup;
  isCompound: boolean;
  isDumbbell: boolean;
  description: string;
  defaultTechnique?: Technique;
  youtubeUrl?: string;
  gymType: "raiz" | "moderna" | "ambos";
  source?: string;
}

export interface WarmupItem {
  title: string;
  description: string;
  duration: string;
}

export interface WorkoutExercise {
  exerciseId: string;
  effectiveSets: 1 | 2;
  technique?: Technique;
  guidance: string;
}

export type WorkoutStatus = "nao-iniciado" | "em-andamento" | "concluido";

export interface CardioBlock {
  type: "HIIT" | "continuo";
  minutes: number;
}

export interface WorkoutDay {
  id: string;
  name: string;
  estimatedMinutes: number;
  warmup: WarmupItem[];
  exercises: WorkoutExercise[];
  cardio?: CardioBlock;
  status: WorkoutStatus;
}

export interface ActiveSession {
  dayId: string;
  startedAt: number | null; // null até o user clicar "Iniciar"
  completedExerciseIds: string[];
  weightOverrides: Record<string, number>;
}

export interface WeightEntry {
  date: string;
  weight: number;
}

export interface ExerciseHistory {
  entries: WeightEntry[];
}
