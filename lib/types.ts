export interface HourEntry {
  hour: number;
  text: string;
}

export interface Task {
  id: string;
  text: string;
  done: boolean;
}

export interface DayData {
  date: string;
  schedule: HourEntry[];
  notes: string;
  tasks: Task[];
  mood?: number;
}

export interface KpiItem {
  id: string;
  name: string;
  target: string;
  actual: string;
  note: string;
}

export interface MonthConclusion {
  monthKey: string;
  personal: string;
  wins: string;
  improvements: string;
  kpis: KpiItem[];
}

// ── Goals ────────────────────────────────────────────────────────────────────

export type GoalCategory = "personal" | "work" | "health" | "finance" | "other";

export interface Goal {
  id: string;
  text: string;
  done: boolean;
  category: GoalCategory;
}

export interface MonthGoals {
  monthKey: string;
  goals: Goal[];
  generalNote: string;
}

// ── Budget ───────────────────────────────────────────────────────────────────

export interface BudgetEntry {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  description: string;
}

export interface BudgetPlan {
  monthKey: string;
  entries: BudgetEntry[];
  tipsForNext: string;
  financialGoal: string;
}

// ── Activity diary ───────────────────────────────────────────────────────────

export type ActivityType = "steps" | "massage" | "exercise" | "stretching" | "stepper" | "custom";

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  value: string;        // steps count, body part name, minutes, or custom value
  customName?: string;  // only for "custom" type
  note: string;
}

export interface DayActivity {
  date: string;
  entries: ActivityEntry[];
  generalNote: string;
}

// ── Food diary ───────────────────────────────────────────────────────────────

export type MealType = "breakfast" | "lunch" | "dinner" | "snacks";

export interface FoodItem {
  id: string;
  name: string;
  calories?: string;
}

export interface DayFood {
  date: string;
  breakfast: FoodItem[];
  lunch: FoodItem[];
  dinner: FoodItem[];
  snacks: FoodItem[];
  water: number;
  notes: string;
  energy?: number;    // 1–10
  hunger?: boolean;   // true = є, false = немає
  sleep?: number;     // тривалість годин (авто з sleepFrom/sleepTo)
  sleepFrom?: number; // година початку (0–23)
  sleepTo?: number;   // година кінця (0–23)
}
