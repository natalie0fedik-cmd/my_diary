import {
  DayData, MonthConclusion, HourEntry, Task, KpiItem,
  MonthGoals, Goal, GoalCategory,
  BudgetPlan, BudgetEntry,
  DayFood, FoodItem, MealType,
  DayActivity, ActivityEntry, ActivityType,
} from "./types";
import { markDirty } from "./cloudSync";

// suppress unused import warnings
void (null as unknown as Task | KpiItem | Goal | GoalCategory | BudgetEntry | FoodItem | MealType | ActivityEntry | ActivityType);

function isClient() {
  return typeof window !== "undefined";
}

// Returns a per-user prefix so each Google account has isolated data
function up(): string {
  if (!isClient()) return "";
  const u = localStorage.getItem("diary_current_user");
  return u ? `u:${u}:` : "";
}

// ── Day ──────────────────────────────────────────────────────────────────────

export function getDayData(date: string): DayData {
  if (!isClient()) return makeEmptyDay(date);
  const raw = localStorage.getItem(up() + "diary_day_" + date);
  if (!raw) return makeEmptyDay(date);
  return JSON.parse(raw) as DayData;
}

export function saveDayData(data: DayData): void {
  if (!isClient()) return;
  localStorage.setItem(up() + "diary_day_" + data.date, JSON.stringify(data));
  markDirty("diary_day_" + data.date);
}

function makeEmptyDay(date: string): DayData {
  const schedule: HourEntry[] = Array.from({ length: 24 }, (_, i) => ({ hour: i, text: "" }));
  return { date, schedule, notes: "", tasks: [] };
}

// ── Month conclusion ──────────────────────────────────────────────────────────

export function getMonthConclusion(monthKey: string): MonthConclusion {
  if (!isClient()) return makeEmptyConclusion(monthKey);
  const raw = localStorage.getItem(up() + "diary_month_" + monthKey);
  if (!raw) return makeEmptyConclusion(monthKey);
  return JSON.parse(raw) as MonthConclusion;
}

export function saveMonthConclusion(data: MonthConclusion): void {
  if (!isClient()) return;
  localStorage.setItem(up() + "diary_month_" + data.monthKey, JSON.stringify(data));
  markDirty("diary_month_" + data.monthKey);
}

function makeEmptyConclusion(monthKey: string): MonthConclusion {
  return { monthKey, personal: "", wins: "", improvements: "", kpis: [] };
}

// ── Important dates ───────────────────────────────────────────────────────────

export function getImportantDates(monthKey: string): Set<number> {
  if (!isClient()) return new Set();
  const raw = localStorage.getItem(up() + "diary_important_" + monthKey);
  return new Set<number>(raw ? JSON.parse(raw) : []);
}

export function toggleImportantDate(monthKey: string, day: number): void {
  if (!isClient()) return;
  const dates = getImportantDates(monthKey);
  if (dates.has(day)) dates.delete(day);
  else dates.add(day);
  localStorage.setItem(up() + "diary_important_" + monthKey, JSON.stringify([...dates]));
  markDirty("diary_important_" + monthKey);
}

// ── Goals ─────────────────────────────────────────────────────────────────────

export function getMonthGoals(monthKey: string): MonthGoals {
  if (!isClient()) return { monthKey, goals: [], generalNote: "" };
  const raw = localStorage.getItem(up() + "diary_goals_" + monthKey);
  if (!raw) return { monthKey, goals: [], generalNote: "" };
  return JSON.parse(raw) as MonthGoals;
}

export function saveMonthGoals(data: MonthGoals): void {
  if (!isClient()) return;
  localStorage.setItem(up() + "diary_goals_" + data.monthKey, JSON.stringify(data));
  markDirty("diary_goals_" + data.monthKey);
}

// ── Budget ────────────────────────────────────────────────────────────────────

export function getBudgetPlan(monthKey: string): BudgetPlan {
  if (!isClient()) return { monthKey, entries: [], tipsForNext: "", financialGoal: "" };
  const raw = localStorage.getItem(up() + "diary_budget_" + monthKey);
  if (!raw) return { monthKey, entries: [], tipsForNext: "", financialGoal: "" };
  return JSON.parse(raw) as BudgetPlan;
}

export function saveBudgetPlan(data: BudgetPlan): void {
  if (!isClient()) return;
  localStorage.setItem(up() + "diary_budget_" + data.monthKey, JSON.stringify(data));
  markDirty("diary_budget_" + data.monthKey);
}

// ── Food diary ────────────────────────────────────────────────────────────────

export function getDayFood(date: string): DayFood {
  if (!isClient()) return makeEmptyFood(date);
  const raw = localStorage.getItem(up() + "diary_food_" + date);
  if (!raw) return makeEmptyFood(date);
  return JSON.parse(raw) as DayFood;
}

export function saveDayFood(data: DayFood): void {
  if (!isClient()) return;
  localStorage.setItem(up() + "diary_food_" + data.date, JSON.stringify(data));
  markDirty("diary_food_" + data.date);
}

function makeEmptyFood(date: string): DayFood {
  return { date, breakfast: [], lunch: [], dinner: [], snacks: [], water: 0, notes: "" };
}

// ── Activity diary ────────────────────────────────────────────────────────────

export function getDayActivity(date: string): DayActivity {
  if (!isClient()) return makeEmptyActivity(date);
  const raw = localStorage.getItem(up() + "diary_activity_" + date);
  if (!raw) return makeEmptyActivity(date);
  return JSON.parse(raw) as DayActivity;
}

export function saveDayActivity(data: DayActivity): void {
  if (!isClient()) return;
  localStorage.setItem(up() + "diary_activity_" + data.date, JSON.stringify(data));
  markDirty("diary_activity_" + data.date);
}

function makeEmptyActivity(date: string): DayActivity {
  return { date, entries: [], generalNote: "" };
}

// ── Export / Import ──────────────────────────────────────────────────────────

export function exportAllData(): string {
  if (!isClient()) return "{}";
  const prefix = up();
  const result: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix + "diary_")) {
      const shortKey = prefix ? key.slice(prefix.length) : key;
      try { result[shortKey] = JSON.parse(localStorage.getItem(key)!); }
      catch { result[shortKey] = localStorage.getItem(key); }
    }
  }
  return JSON.stringify(result, null, 2);
}

export function importAllData(json: string): void {
  if (!isClient()) return;
  const prefix = up();
  const data = JSON.parse(json) as Record<string, unknown>;
  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith("diary_")) {
      localStorage.setItem(prefix + key, typeof value === "string" ? value : JSON.stringify(value));
    }
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function hasDayData(date: string): boolean {
  if (!isClient()) return false;
  const raw = localStorage.getItem(up() + "diary_day_" + date);
  if (!raw) return false;
  const data = JSON.parse(raw) as DayData;
  return (
    data.tasks.length > 0 ||
    data.notes.trim() !== "" ||
    data.schedule.some((h) => h.text.trim() !== "")
  );
}

// ── Habit Tracker ─────────────────────────────────────────────────────────────

export interface Habit {
  id: string;
  name: string;
  color: string;
}

export interface HabitTracker {
  habits: Habit[];
  checks: Record<string, Record<number, boolean>>; // habitId → day → checked
}

const DEFAULT_HABITS: Habit[] = [
  { id: "water",     name: "💧 Вода 8 склянок", color: "#60a5fa" },
  { id: "sport",     name: "🏃 Спорт",          color: "#4ade80" },
  { id: "reading",   name: "📚 Читання",         color: "#fbbf24" },
  { id: "vitamins",  name: "💊 Вітаміни",        color: "#f472b6" },
  { id: "skincare",  name: "✨ Догляд за собою", color: "#a78bfa" },
  { id: "sleep",     name: "😴 Сон до 23:00",    color: "#38bdf8" },
];

export function getHabitTracker(monthKey: string): HabitTracker {
  if (!isClient()) return { habits: DEFAULT_HABITS, checks: {} };
  const raw = localStorage.getItem(up() + "diary_habits_" + monthKey);
  if (!raw) return { habits: [...DEFAULT_HABITS], checks: {} };
  return JSON.parse(raw) as HabitTracker;
}

export function saveHabitTracker(monthKey: string, data: HabitTracker): void {
  if (!isClient()) return;
  localStorage.setItem(up() + "diary_habits_" + monthKey, JSON.stringify(data));
}

// ── Templates ─────────────────────────────────────────────────────────────────

export interface DayTemplate {
  id: string;
  name: string;
  scheduleSlots: { hour: number; text: string }[];
  tasks: { text: string }[];
}

export function getTemplates(): DayTemplate[] {
  if (!isClient()) return [];
  const raw = localStorage.getItem(up() + "diary_templates");
  return raw ? JSON.parse(raw) : [];
}

export function saveTemplate(t: DayTemplate): void {
  if (!isClient()) return;
  const list = getTemplates().filter(x => x.id !== t.id);
  localStorage.setItem(up() + "diary_templates", JSON.stringify([...list, t]));
}

export function deleteTemplate(id: string): void {
  if (!isClient()) return;
  const list = getTemplates().filter(x => x.id !== id);
  localStorage.setItem(up() + "diary_templates", JSON.stringify(list));
}

// ── Streak ────────────────────────────────────────────────────────────────────

export function computeDiaryStreak(): number {
  if (!isClient()) return 0;
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const startOffset = hasDayData(todayStr) ? 0 : 1;
  let streak = 0;
  for (let i = startOffset; i <= 400; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split("T")[0];
    if (hasDayData(ds)) streak++;
    else break;
  }
  return streak;
}

// ── Search ────────────────────────────────────────────────────────────────────

export interface SearchResult {
  date: string;
  snippets: string[];
}

export function searchDiary(query: string): SearchResult[] {
  if (!isClient() || !query.trim()) return [];
  const q = query.toLowerCase().trim();
  const prefix = up();
  const results: SearchResult[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    let date = "";
    let snippets: string[] = [];
    if (key.startsWith(prefix + "diary_day_")) {
      date = key.slice((prefix + "diary_day_").length);
      try {
        const d = JSON.parse(localStorage.getItem(key)!) as DayData;
        if (d.notes?.toLowerCase().includes(q)) snippets.push(d.notes.slice(0, 100));
        d.tasks?.forEach(t => { if (t.text.toLowerCase().includes(q)) snippets.push("✓ " + t.text); });
        d.schedule?.forEach(h => { if (h.text.toLowerCase().includes(q)) snippets.push(`${String(h.hour).padStart(2,"0")}:00 — ${h.text}`); });
        if (d.mood && String(d.mood).includes(q)) snippets.push(`Настрій: ${d.mood}`);
      } catch {}
    } else if (key.startsWith(prefix + "diary_food_")) {
      date = key.slice((prefix + "diary_food_").length);
      try {
        const f = JSON.parse(localStorage.getItem(key)!) as DayFood;
        const meals = ["breakfast","lunch","dinner","snacks"] as const;
        meals.forEach(m => {
          f[m]?.forEach((item: FoodItem) => {
            if (item.name.toLowerCase().includes(q)) snippets.push("🍽 " + item.name);
          });
        });
        if (f.notes?.toLowerCase().includes(q)) snippets.push(f.notes.slice(0, 80));
      } catch {}
    }
    if (date && snippets.length > 0) {
      const existing = results.find(r => r.date === date);
      if (existing) existing.snippets.push(...snippets);
      else results.push({ date, snippets });
    }
  }
  return results.sort((a, b) => b.date.localeCompare(a.date));
}

// ── Month stats (for comparison) ──────────────────────────────────────────────

export interface MonthStats {
  monthKey: string;
  daysCount: number;
  daysFilled: number;
  avgMood: number | null;
  totalSteps: number;
  totalExpense: number;
  totalIncome: number;
  goalsPct: number | null;
  totalWater: number;
}

export function getMonthStats(year: number, month: number): MonthStats {
  const monthKey = `${year}-${String(month).padStart(2,"0")}`;
  const daysCount = new Date(year, month, 0).getDate();
  let daysFilled = 0, moodSum = 0, moodCount = 0, totalSteps = 0, totalWater = 0;
  for (let d = 1; d <= daysCount; d++) {
    const ds = `${year}-${String(month).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    if (hasDayData(ds)) daysFilled++;
    if (!isClient()) continue;
    const dayRaw = localStorage.getItem(up() + "diary_day_" + ds);
    if (dayRaw) {
      const day = JSON.parse(dayRaw) as DayData;
      if (day.mood) { moodSum += day.mood; moodCount++; }
    }
    const actRaw = localStorage.getItem(up() + "diary_activity_" + ds);
    if (actRaw) {
      const act = JSON.parse(actRaw) as DayActivity;
      totalSteps += act.entries.filter(e => e.type === "steps").reduce((s, e) => s + (parseInt(e.value) || 0), 0);
    }
    const foodRaw = localStorage.getItem(up() + "diary_food_" + ds);
    if (foodRaw) {
      const food = JSON.parse(foodRaw) as DayFood;
      totalWater += food.water || 0;
    }
  }
  const budget = getBudgetPlan(monthKey);
  const totalExpense = budget.entries.filter(e => e.type === "expense").reduce((s, e) => s + e.amount, 0);
  const totalIncome  = budget.entries.filter(e => e.type === "income").reduce((s, e) => s + e.amount, 0);
  const goals = getMonthGoals(monthKey);
  const goalsPct = goals.goals.length > 0 ? Math.round(goals.goals.filter(g => g.done).length / goals.goals.length * 100) : null;
  return {
    monthKey, daysCount, daysFilled,
    avgMood: moodCount > 0 ? Math.round(moodSum / moodCount * 10) / 10 : null,
    totalSteps, totalExpense, totalIncome, goalsPct, totalWater,
  };
}
