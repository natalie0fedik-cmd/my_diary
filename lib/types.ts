export interface HourEntry {
  hour: number; // 0-23
  text: string;
}

export interface Task {
  id: string;
  text: string;
  done: boolean;
}

export interface DayData {
  date: string; // "YYYY-MM-DD"
  schedule: HourEntry[];
  notes: string;
  tasks: Task[];
  mood?: number; // 1-5
}

export interface KpiItem {
  id: string;
  name: string;
  target: string;
  actual: string;
  note: string;
}

export interface MonthConclusion {
  monthKey: string; // "YYYY-MM"
  personal: string;
  wins: string;
  improvements: string;
  kpis: KpiItem[];
}
