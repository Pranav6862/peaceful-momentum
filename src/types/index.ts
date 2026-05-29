export type Priority = 'low' | 'medium' | 'high';

export type EnergyTag =
  | '⚡ High Energy'
  | '🌙 Low Energy'
  | '🧠 Deep Focus'
  | '⏱ Quick Task'
  | '🎨 Creative'
  | '📦 Admin';

export type TaskLifespan = '1day' | '3days' | '1week' | 'custom' | 'none';

export type TaskStatus = 'active' | 'completed' | 'archived' | 'forgotten';

export interface Task {
  id: string;
  text: string;
  priority: Priority;
  energyTag: EnergyTag | null;
  status: TaskStatus;
  createdAt: string; // ISO string
  completedAt: string | null;
  lifespan: TaskLifespan;
  customLifespanDays?: number;
  expiresAt: string | null; // ISO string
  carryForwardCount: number; // how many times it's been carried forward
  notes?: string;
}

export interface AppSettings {
  darkMode: boolean;
  dailyResetTime: string; // "HH:MM" format
  lastResetDate: string | null; // ISO date string "YYYY-MM-DD"
  momentumDays: number; // total days with at least one completion
  lastActivityDate: string | null;
  treeStage: number; // 0-3 (bare, blossoms, fuller, petals)
}

export interface ResetCandidate {
  task: Task;
  action: 'keep' | 'delay' | 'archive' | 'letgo' | null;
}
