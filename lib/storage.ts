import { DayData, MonthConclusion, HourEntry, Task, KpiItem } from "./types";

const DAY_PREFIX = "diary_day_";
const MONTH_PREFIX = "diary_month_";

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
