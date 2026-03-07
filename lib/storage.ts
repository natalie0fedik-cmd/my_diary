import { DayData, MonthConclusion, HourEntry, Task, KpiItem } from "./types";

const DAY_PREFIX = "diary_day_";
const MONTH_PREFIX = "diary_month_";
const IMPORTANT_PREFIX = "diary_important_";

function isClient() {
  return typeof window !== "undefined";
}

// ── Day ──────────────────────────────────────────────────────────────────────

export function getDayData(date: string): DayData {
  if (!isClient()) return makeEmptyDay(date);
  const raw = localStorage.getItem(DAY_PREFIX + date);
  if (!raw) return makeEmptyDay(date);
  return JSON.parse(raw) as DayData;
}

export function saveDayData(data: DayData): void {
  if (!isClient()) return;
  localStorage.setItem(DAY_PREFIX + data.date, JSON.stringify(data));
}

function makeEmptyDay(date: string): DayData {
  const schedule: HourEntry[] = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    text: "",
  }));
  return { date, schedule, notes: "", tasks: [] };
}

// ── Month conclusion ─────────────────────────────────────────────────────────

export function getMonthConclusion(monthKey: string): MonthConclusion {
  if (!isClient()) return makeEmptyConclusion(monthKey);
  const raw = localStorage.getItem(MONTH_PREFIX + monthKey);
  if (!raw) return makeEmptyConclusion(monthKey);
  return JSON.parse(raw) as MonthConclusion;
}

export function saveMonthConclusion(data: MonthConclusion): void {
  if (!isClient()) return;
  localStorage.setItem(MONTH_PREFIX + data.monthKey, JSON.stringify(data));
}

function makeEmptyConclusion(monthKey: string): MonthConclusion {
  return {
    monthKey,
    personal: "",
    wins: "",
    improvements: "",
    kpis: [],
  };
}

// ── Important dates ───────────────────────────────────────────────────────────

export function getImportantDates(monthKey: string): Set<number> {
  if (!isClient()) return new Set();
  const raw = localStorage.getItem(IMPORTANT_PREFIX + monthKey);
  return new Set<number>(raw ? JSON.parse(raw) : []);
}

export function toggleImportantDate(monthKey: string, day: number): void {
  if (!isClient()) return;
  const dates = getImportantDates(monthKey);
  if (dates.has(day)) dates.delete(day);
  else dates.add(day);
  localStorage.setItem(IMPORTANT_PREFIX + monthKey, JSON.stringify([...dates]));
}

// ── Export / Import ──────────────────────────────────────────────────────────

export function exportAllData(): string {
  if (!isClient()) return "{}";
  const result: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("diary_")) {
      try {
        result[key] = JSON.parse(localStorage.getItem(key)!);
      } catch {
        result[key] = localStorage.getItem(key);
      }
    }
  }
  return JSON.stringify(result, null, 2);
}

export function importAllData(json: string): void {
  if (!isClient()) return;
  const data = JSON.parse(json) as Record<string, unknown>;
  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith("diary_")) {
      localStorage.setItem(
        key,
        typeof value === "string" ? value : JSON.stringify(value)
      );
    }
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function hasDayData(date: string): boolean {
  if (!isClient()) return false;
  const raw = localStorage.getItem(DAY_PREFIX + date);
  if (!raw) return false;
  const data = JSON.parse(raw) as DayData;
  return (
    data.tasks.length > 0 ||
    data.notes.trim() !== "" ||
    data.schedule.some((h) => h.text.trim() !== "")
  );
}
