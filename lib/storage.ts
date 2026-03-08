import {
  DayData, MonthConclusion, HourEntry, Task, KpiItem,
  MonthGoals, Goal, GoalCategory,
  BudgetPlan, BudgetEntry,
  DayFood, FoodItem, MealType,
  DayActivity, ActivityEntry, ActivityType,
} from "./types";

// suppress unused import warnings
void (null as unknown as Task | KpiItem | Goal | GoalCategory | BudgetEntry | FoodItem | MealType | ActivityEntry | ActivityType);

function isClient() {
  return typeof window !== "undefined";
}

// ── Day ──────────────────────────────────────────────────────────────────────

export function getDayData(date: string): DayData {
  if (!isClient()) return makeEmptyDay(date);
  const raw = localStorage.getItem("diary_day_" + date);
  if (!raw) return makeEmptyDay(date);
  return JSON.parse(raw) as DayData;
}

export function saveDayData(data: DayData): void {
  if (!isClient()) return;
  localStorage.setItem("diary_day_" + data.date, JSON.stringify(data));
}

function makeEmptyDay(date: string): DayData {
  const schedule: HourEntry[] = Array.from({ length: 24 }, (_, i) => ({ hour: i, text: "" }));
  return { date, schedule, notes: "", tasks: [] };
}

// ── Month conclusion ──────────────────────────────────────────────────────────

export function getMonthConclusion(monthKey: string): MonthConclusion {
  if (!isClient()) return makeEmptyConclusion(monthKey);
  const raw = localStorage.getItem("diary_month_" + monthKey);
  if (!raw) return makeEmptyConclusion(monthKey);
  return JSON.parse(raw) as MonthConclusion;
}

export function saveMonthConclusion(data: MonthConclusion): void {
  if (!isClient()) return;
  localStorage.setItem("diary_month_" + data.monthKey, JSON.stringify(data));
}

function makeEmptyConclusion(monthKey: string): MonthConclusion {
  return { monthKey, personal: "", wins: "", improvements: "", kpis: [] };
}

// ── Important dates ───────────────────────────────────────────────────────────

export function getImportantDates(monthKey: string): Set<number> {
  if (!isClient()) return new Set();
  const raw = localStorage.getItem("diary_important_" + monthKey);
  return new Set<number>(raw ? JSON.parse(raw) : []);
}

export function toggleImportantDate(monthKey: string, day: number): void {
  if (!isClient()) return;
  const dates = getImportantDates(monthKey);
  if (dates.has(day)) dates.delete(day);
  else dates.add(day);
  localStorage.setItem("diary_important_" + monthKey, JSON.stringify([...dates]));
}

// ── Goals ─────────────────────────────────────────────────────────────────────

export function getMonthGoals(monthKey: string): MonthGoals {
  if (!isClient()) return { monthKey, goals: [], generalNote: "" };
  const raw = localStorage.getItem("diary_goals_" + monthKey);
  if (!raw) return { monthKey, goals: [], generalNote: "" };
  return JSON.parse(raw) as MonthGoals;
}

export function saveMonthGoals(data: MonthGoals): void {
  if (!isClient()) return;
  localStorage.setItem("diary_goals_" + data.monthKey, JSON.stringify(data));
}

// ── Budget ────────────────────────────────────────────────────────────────────

export function getBudgetPlan(monthKey: string): BudgetPlan {
  if (!isClient()) return { monthKey, entries: [], tipsForNext: "", financialGoal: "" };
  const raw = localStorage.getItem("diary_budget_" + monthKey);
  if (!raw) return { monthKey, entries: [], tipsForNext: "", financialGoal: "" };
  return JSON.parse(raw) as BudgetPlan;
}

export function saveBudgetPlan(data: BudgetPlan): void {
  if (!isClient()) return;
  localStorage.setItem("diary_budget_" + data.monthKey, JSON.stringify(data));
}

// ── Food diary ────────────────────────────────────────────────────────────────

export function getDayFood(date: string): DayFood {
  if (!isClient()) return makeEmptyFood(date);
  const raw = localStorage.getItem("diary_food_" + date);
  if (!raw) return makeEmptyFood(date);
  return JSON.parse(raw) as DayFood;
}

export function saveDayFood(data: DayFood): void {
  if (!isClient()) return;
  localStorage.setItem("diary_food_" + data.date, JSON.stringify(data));
}

function makeEmptyFood(date: string): DayFood {
  return { date, breakfast: [], lunch: [], dinner: [], snacks: [], water: 0, notes: "" };
}

// ── Activity diary ────────────────────────────────────────────────────────────

export function getDayActivity(date: string): DayActivity {
  if (!isClient()) return makeEmptyActivity(date);
  const raw = localStorage.getItem("diary_activity_" + date);
  if (!raw) return makeEmptyActivity(date);
  return JSON.parse(raw) as DayActivity;
}

export function saveDayActivity(data: DayActivity): void {
  if (!isClient()) return;
  localStorage.setItem("diary_activity_" + data.date, JSON.stringify(data));
}

function makeEmptyActivity(date: string): DayActivity {
  return { date, entries: [], generalNote: "" };
}

// ── Export / Import ──────────────────────────────────────────────────────────

export function exportAllData(): string {
  if (!isClient()) return "{}";
  const result: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("diary_")) {
      try { result[key] = JSON.parse(localStorage.getItem(key)!); }
      catch { result[key] = localStorage.getItem(key); }
    }
  }
  return JSON.stringify(result, null, 2);
}

export function importAllData(json: string): void {
  if (!isClient()) return;
  const data = JSON.parse(json) as Record<string, unknown>;
  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith("diary_")) {
      localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
    }
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function hasDayData(date: string): boolean {
  if (!isClient()) return false;
  const raw = localStorage.getItem("diary_day_" + date);
  if (!raw) return false;
  const data = JSON.parse(raw) as DayData;
  return (
    data.tasks.length > 0 ||
    data.notes.trim() !== "" ||
    data.schedule.some((h) => h.text.trim() !== "")
  );
}
