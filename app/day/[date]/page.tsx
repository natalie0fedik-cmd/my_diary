"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getDayData, saveDayData, generateId, getImportantDates, toggleImportantDate, getHabitTracker, saveHabitTracker, HabitTracker, Habit } from "@/lib/storage";
import { DayData, Task } from "@/lib/types";

const MONTHS_UA = [
  "Січня", "Лютого", "Березня", "Квітня",
  "Травня", "Червня", "Липня", "Серпня",
  "Вересня", "Жовтня", "Листопада", "Грудня",
];

const DAYS_UA_FULL = ["Неділя", "Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця", "Субота"];

const HABIT_PALETTE = ["#60a5fa","#4ade80","#fbbf24","#f472b6","#a78bfa","#38bdf8","#fb923c","#f87171"];

const MOOD_LABELS = ["", "Погано", "Нижче норми", "Нормально", "Добре", "Відмінно"];
const MOOD_COLORS = ["", "#f87171", "#fb923c", "#fbbf24", "#4ade80", "#4ec564"];

interface Props {
  params: Promise<{ date: string }>;
}

function formatDateUA(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const weekday = new Date(y, m - 1, d).getDay();
  return `${DAYS_UA_FULL[weekday]}, ${d} ${MONTHS_UA[m - 1]} ${y}`;
}

export default function DayPage({ params }: Props) {
  const { date } = use(params);
  const [year, monthStr, dayStr] = date.split("-");
  const monthNum = parseInt(monthStr);
  const monthIdx = monthNum - 1;

  const monthKey = `${year}-${monthStr}`;
  const dayNum = parseInt(dayStr);

  const [data, setData] = useState<DayData | null>(null);
  const [newTask, setNewTask] = useState("");
  const [saving, setSaving] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  const [showAllHours, setShowAllHours] = useState(false);
  const [habitTracker, setHabitTracker] = useState<HabitTracker>({ habits: [], checks: {} });
  const [addingHabit, setAddingHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitColor, setNewHabitColor] = useState(HABIT_PALETTE[0]);

  useEffect(() => {
    setData(getDayData(date));
    setIsImportant(getImportantDates(monthKey).has(dayNum));
    setHabitTracker(getHabitTracker(monthKey));
  }, [date, monthKey, dayNum]);

  const saveHabits = (updated: HabitTracker) => {
    setHabitTracker(updated);
    saveHabitTracker(monthKey, updated);
  };

  const toggleHabit = (habitId: string) => {
    const checks = { ...habitTracker.checks };
    if (!checks[habitId]) checks[habitId] = {};
    checks[habitId] = { ...checks[habitId], [dayNum]: !checks[habitId][dayNum] };
    saveHabits({ ...habitTracker, checks });
  };

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    const habit: Habit = { id: generateId(), name: newHabitName.trim(), color: newHabitColor };
    saveHabits({ ...habitTracker, habits: [...habitTracker.habits, habit] });
    setNewHabitName("");
    setNewHabitColor(HABIT_PALETTE[0]);
    setAddingHabit(false);
  };

  const deleteHabit = (id: string) => {
    const habits = habitTracker.habits.filter(h => h.id !== id);
    const checks = { ...habitTracker.checks };
    delete checks[id];
    saveHabits({ ...habitTracker, habits, checks });
  };

  const save = useCallback((updated: DayData) => {
    saveDayData(updated);
    setSaving(true);
    setTimeout(() => setSaving(false), 800);
  }, []);

  const updateSchedule = (hour: number, text: string) => {
    if (!data) return;
    const schedule = data.schedule.map(h => h.hour === hour ? { ...h, text } : h);
    const updated = { ...data, schedule };
    setData(updated);
    save(updated);
  };

  const updateNotes = (notes: string) => {
    if (!data) return;
    const updated = { ...data, notes };
    setData(updated);
    save(updated);
  };

  const addTask = () => {
    if (!data || !newTask.trim()) return;
    const task: Task = { id: generateId(), text: newTask.trim(), done: false };
    const updated = { ...data, tasks: [...data.tasks, task] };
    setData(updated);
    save(updated);
    setNewTask("");
  };

  const toggleTask = (id: string) => {
    if (!data) return;
    const tasks = data.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    const updated = { ...data, tasks };
    setData(updated);
    save(updated);
  };

  const deleteTask = (id: string) => {
    if (!data) return;
    const tasks = data.tasks.filter(t => t.id !== id);
    const updated = { ...data, tasks };
    setData(updated);
    save(updated);
  };

  const setMood = (mood: number) => {
    if (!data) return;
    const updated = { ...data, mood };
    setData(updated);
    save(updated);
  };

  const toggleImportant = () => {
    toggleImportantDate(monthKey, dayNum);
    setIsImportant(v => !v);
  };

  const openInGoogleCalendar = (hour: number, text: string) => {
    const [y, m, d] = date.split("-");
    const pad = (n: number) => String(n).padStart(2, "0");
    const start = `${y}${m}${d}T${pad(hour)}0000`;
    const endHour = hour + 1 >= 24 ? 23 : hour + 1;
    const endMin = hour + 1 >= 24 ? "5959" : "0000";
    const end = `${y}${m}${d}T${pad(endHour)}${endMin}`;
    const url = `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(text)}&dates=${start}/${end}`;
    window.open(url, "_blank");
  };

  const exportDayToICS = () => {
    if (!data) return;
    const filled = data.schedule.filter(e => e.text.trim());
    if (!filled.length) return;
    const [y, m, d] = date.split("-");
    const pad = (n: number) => String(n).padStart(2, "0");
    const events = filled.map(e => {
      const endHour = e.hour + 1 >= 24 ? 23 : e.hour + 1;
      const endMin = e.hour + 1 >= 24 ? "5959" : "0000";
      return [
        "BEGIN:VEVENT",
        `DTSTART:${y}${m}${d}T${pad(e.hour)}0000`,
        `DTEND:${y}${m}${d}T${pad(endHour)}${endMin}`,
        `SUMMARY:${e.text.trim().replace(/\n/g, " ")}`,
        "END:VEVENT",
      ].join("\r\n");
    });
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//My Diary//EN", ...events, "END:VCALENDAR"].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `diary-${date}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!data) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--muted)" }}>Завантаження...</div>
      </div>
    );
  }

  const doneTasks = data.tasks.filter(t => t.done).length;
  const totalTasks = data.tasks.length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.5rem", fontSize: "0.85rem", color: "var(--muted)" }}>
          <Link href="/" style={{ color: "var(--muted)", textDecoration: "none" }}>Щоденник</Link>
          <span>›</span>
          <Link href={`/month/${year}/${monthStr}`} style={{ color: "var(--muted)", textDecoration: "none" }}>
            {MONTHS_UA[monthIdx].replace("ня", "ень").replace("ого", "ень").replace("ня", "ень")} {year}
          </Link>
          <span>›</span>
          <span style={{ color: "var(--text)" }}>{dayStr}</span>
        </div>

        {/* Date header */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "1.5rem",
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.8rem", fontWeight: 700, color: "var(--accent2)", margin: 0 }}>
              {formatDateUA(date)}
            </h1>
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Настрій:</span>
              <div style={{ display: "flex", gap: 6 }}>
                {[1, 2, 3, 4, 5].map(v => (
                  <button
                    key={v}
                    onClick={() => setMood(v)}
                    title={MOOD_LABELS[v]}
                    style={{
                      width: 28, height: 28, borderRadius: 7,
                      border: `1px solid ${data.mood === v ? MOOD_COLORS[v] : "var(--border)"}`,
                      background: data.mood === v ? `${MOOD_COLORS[v]}33` : "var(--surface2)",
                      color: MOOD_COLORS[v],
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
              {data.mood && (
                <span style={{ fontSize: "0.8rem", color: MOOD_COLORS[data.mood] }}>
                  {MOOD_LABELS[data.mood]}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {saving && (
              <span style={{ fontSize: "0.78rem", color: "var(--muted)", fontFamily: "var(--font-body)" }}>Збережено</span>
            )}
            {totalTasks > 0 && (
              <div style={{
                padding: "5px 12px", borderRadius: 8,
                background: doneTasks === totalTasks ? "#4ade8022" : "var(--surface2)",
                border: `1px solid ${doneTasks === totalTasks ? "#4ade80" : "var(--border)"}`,
                color: doneTasks === totalTasks ? "#4ade80" : "var(--muted)",
                fontSize: "0.8rem", fontWeight: 600, fontFamily: "var(--font-body)",
              }}>
                {doneTasks}/{totalTasks} задач
              </div>
            )}
            {/* Mark as important */}
            <button
              onClick={toggleImportant}
              title={isImportant ? "Прибрати позначку важливого" : "Позначити день як важливий"}
              style={{
                padding: "5px 12px", borderRadius: 8, cursor: "pointer",
                border: `1px solid ${isImportant ? "#f6c54766" : "var(--border)"}`,
                background: isImportant ? "#f6c54722" : "var(--surface2)",
                color: isImportant ? "#f6c547" : "var(--muted)",
                fontSize: "0.8rem", fontWeight: isImportant ? 600 : 400,
                fontFamily: "var(--font-body)",
              }}
            >
              ★ {isImportant ? "Важливий" : "Позначити"}
            </button>
            {/* Food link */}
            <Link href={`/day/${date}/food`} style={{ textDecoration: "none" }}>
              <span style={{
                display: "inline-block", padding: "5px 12px", borderRadius: 8,
                border: "1px solid #f6c54744", background: "#f6c54712",
                color: "#f6c547", fontSize: "0.8rem", fontFamily: "var(--font-body)",
                cursor: "pointer",
              }}>
                Харчування
              </span>
            </Link>
            {/* Activity link */}
            <Link href={`/day/${date}/activity`} style={{ textDecoration: "none" }}>
              <span style={{
                display: "inline-block", padding: "5px 12px", borderRadius: 8,
                border: "1px solid #60a5fa44", background: "#60a5fa12",
                color: "#60a5fa", fontSize: "0.8rem", fontFamily: "var(--font-body)",
                cursor: "pointer",
              }}>
                Активність
              </span>
            </Link>
          </div>
        </div>

        <div className="day-grid">
          {/* Left column: Schedule */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "1.25rem",
              flex: 1,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h2 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Розклад по годинах
                </h2>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <button onClick={() => setShowAllHours(v => !v)} style={{
                    fontSize: "0.72rem", color: "var(--muted)", background: "none", border: "1px solid var(--border)",
                    borderRadius: 6, padding: "2px 8px", cursor: "pointer", fontFamily: "var(--font-body)",
                  }}>
                    {showAllHours ? "06–22" : "00–23"}
                  </button>
                  <button
                    onClick={exportDayToICS}
                    title="Завантажити всі події дня як .ics і відкрити в Google Calendar"
                    disabled={!data.schedule.some(e => e.text.trim())}
                    style={{
                      fontSize: "0.72rem", fontWeight: 600,
                      background: data.schedule.some(e => e.text.trim()) ? "#4285f4" : "var(--surface2)",
                      color: data.schedule.some(e => e.text.trim()) ? "#fff" : "var(--muted)",
                      border: "none", borderRadius: 6, padding: "2px 10px", cursor: data.schedule.some(e => e.text.trim()) ? "pointer" : "default",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    📅 у GCal
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {data.schedule.filter(e => showAllHours || (e.hour >= 6 && e.hour <= 22) || e.text.trim()).map(entry => (
                  <div
                    key={entry.hour}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      borderRadius: 7,
                      padding: "5px 8px",
                      background: entry.text.trim() ? "var(--surface2)" : "transparent",
                      transition: "background 0.1s",
                    }}
                  >
                    <span style={{
                      fontSize: "0.78rem",
                      color: entry.text.trim() ? "var(--accent)" : "var(--muted)",
                      minWidth: 36,
                      fontWeight: 600,
                      paddingTop: 2,
                    }}>
                      {String(entry.hour).padStart(2, "0")}:00
                    </span>
                    <textarea
                      value={entry.text}
                      onChange={e => updateSchedule(entry.hour, e.target.value)}
                      placeholder="Порожньо"
                      rows={1}
                      style={{
                        flex: 1,
                        fontSize: "0.85rem",
                        color: "var(--text)",
                        border: "none",
                        background: "transparent",
                        lineHeight: 1.5,
                        padding: 0,
                        resize: "none",
                        fontFamily: "inherit",
                        overflowY: "hidden",
                      }}
                      onInput={e => {
                        const el = e.target as HTMLTextAreaElement;
                        el.style.height = "auto";
                        el.style.height = el.scrollHeight + "px";
                      }}
                    />
                    <button
                      onClick={() => entry.text.trim() && openInGoogleCalendar(entry.hour, entry.text.trim())}
                      title={entry.text.trim() ? "Додати в Google Calendar" : "Введіть текст щоб додати в GCal"}
                      style={{
                        flexShrink: 0,
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        border: `1px solid ${entry.text.trim() ? "#4285f4" : "var(--border)"}`,
                        background: entry.text.trim() ? "#4285f4" : "transparent",
                        color: entry.text.trim() ? "#fff" : "var(--border)",
                        cursor: entry.text.trim() ? "pointer" : "default",
                        fontSize: "1rem",
                        lineHeight: 1,
                        padding: 0,
                      }}
                    >
                      +
                    </button>
                  </div>
                ))}
              </div>

              {/* Google Calendar export per entry */}
              {data.schedule.some(e => e.text.trim()) && (
                <div style={{ marginTop: 14, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Додати в Google Calendar
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {data.schedule.filter(e => e.text.trim()).map(e => (
                      <div key={e.hour} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: "0.78rem", color: "var(--accent)", fontWeight: 600, minWidth: 40 }}>
                          {String(e.hour).padStart(2, "0")}:00
                        </span>
                        <span style={{ fontSize: "0.82rem", color: "var(--text)", flex: 1 }}>
                          {e.text.trim()}
                        </span>
                        <button
                          onClick={() => openInGoogleCalendar(e.hour, e.text.trim())}
                          style={{
                            flexShrink: 0,
                            padding: "3px 10px",
                            borderRadius: 6,
                            border: "1px solid #4285f4",
                            background: "#4285f4",
                            color: "#fff",
                            cursor: "pointer",
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                          }}
                        >
                          📅 Додати
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right column: Tasks + Notes */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Main tasks */}
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "1.25rem",
            }}>
              <h2 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--muted)", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Головні задачі дня
              </h2>

              {data.tasks.length === 0 && (
                <p style={{ color: "var(--muted)", fontSize: "0.85rem", margin: "0 0 12px" }}>
                  Ще немає задач
                </p>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                {data.tasks.map(task => (
                  <div
                    key={task.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      padding: "8px 10px",
                      borderRadius: 8,
                      background: task.done ? "#4ade8012" : "var(--surface2)",
                      border: `1px solid ${task.done ? "#4ade8033" : "transparent"}`,
                    }}
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
                      style={{
                        width: 20, height: 20, borderRadius: 5,
                        border: `2px solid ${task.done ? "#4ade80" : "var(--border)"}`,
                        background: task.done ? "#4ade80" : "transparent",
                        cursor: "pointer",
                        flexShrink: 0,
                        marginTop: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: "0.7rem",
                      }}
                    >
                      {task.done ? "✓" : ""}
                    </button>
                    <span style={{
                      flex: 1,
                      fontSize: "0.88rem",
                      color: task.done ? "var(--muted)" : "var(--text)",
                      textDecoration: task.done ? "line-through" : "none",
                      lineHeight: 1.5,
                    }}>
                      {task.text}
                    </span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      style={{
                        color: "var(--muted)", background: "none", border: "none",
                        cursor: "pointer", fontSize: "1rem", padding: 0, lineHeight: 1,
                        flexShrink: 0,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* Add task */}
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={newTask}
                  onChange={e => setNewTask(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addTask()}
                  placeholder="Нова задача..."
                  style={{
                    flex: 1,
                    padding: "7px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--surface2)",
                    fontSize: "0.85rem",
                    color: "var(--text)",
                    fontFamily: "inherit",
                  }}
                />
                <button
                  onClick={addTask}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 8,
                    border: "1px solid var(--accent)",
                    background: "var(--surface2)",
                    color: "var(--accent)",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    fontFamily: "inherit",
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Notes */}
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "1.25rem",
              flex: 1,
            }}>
              <h2 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--muted)", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Нотатки
              </h2>
              <textarea
                value={data.notes}
                onChange={e => updateNotes(e.target.value)}
                placeholder="Вільні нотатки за день..."
                className="lined-paper"
                style={{
                  width: "100%",
                  minHeight: 220,
                  padding: "4px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--surface2)",
                  fontSize: "0.88rem",
                  color: "var(--text)",
                  fontFamily: "var(--font-body)",
                  resize: "vertical",
                }}
              />
            </div>
          </div>
        </div>

        {/* Habits */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 14, padding: "1.25rem", marginTop: 14,
        }}>
          <h2 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--muted)", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Звички дня
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: habitTracker.habits.length > 0 ? 10 : 0 }}>
            {habitTracker.habits.map(habit => {
              const checked = habitTracker.checks[habit.id]?.[dayNum] ?? false;
              return (
                <div key={habit.id} style={{ display: "flex", alignItems: "center", gap: 0 }}>
                  <button
                    onClick={() => toggleHabit(habit.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "7px 10px 7px 14px", borderRadius: "10px 0 0 10px", cursor: "pointer",
                      border: `1px solid ${checked ? habit.color : "var(--border)"}`,
                      borderRight: "none",
                      background: checked ? habit.color + "22" : "var(--surface2)",
                      color: checked ? habit.color : "var(--muted)",
                      fontSize: "0.88rem", fontFamily: "inherit",
                      fontWeight: checked ? 600 : 400,
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{
                      width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                      border: `2px solid ${checked ? habit.color : "var(--border)"}`,
                      background: checked ? habit.color : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {checked && (
                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                          <path d="M1 4.5L3.5 7L8 1.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    {habit.name}
                  </button>
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    title="Видалити звичку"
                    style={{
                      padding: "7px 8px", borderRadius: "0 10px 10px 0", cursor: "pointer",
                      border: `1px solid ${checked ? habit.color : "var(--border)"}`,
                      borderLeft: `1px solid ${checked ? habit.color + "44" : "var(--border)"}`,
                      background: checked ? habit.color + "22" : "var(--surface2)",
                      color: "var(--muted)", fontSize: "0.85rem", lineHeight: 1,
                      transition: "all 0.15s",
                    }}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          {/* Add habit form */}
          {addingHabit ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 8 }}>
              <input
                autoFocus
                value={newHabitName}
                onChange={e => setNewHabitName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addHabit()}
                placeholder="Назва звички..."
                style={{
                  flex: 1, minWidth: 150, padding: "6px 12px", borderRadius: 8,
                  border: "1px solid var(--border)", background: "var(--surface2)",
                  color: "var(--text)", fontSize: "0.85rem", fontFamily: "inherit",
                }}
              />
              <div style={{ display: "flex", gap: 4 }}>
                {HABIT_PALETTE.map(c => (
                  <div
                    key={c}
                    onClick={() => setNewHabitColor(c)}
                    style={{
                      width: 20, height: 20, borderRadius: 4, background: c, cursor: "pointer",
                      outline: newHabitColor === c ? "2px solid var(--text)" : "none",
                      outlineOffset: 2,
                    }}
                  />
                ))}
              </div>
              <button onClick={addHabit} style={{
                padding: "6px 14px", borderRadius: 8, cursor: "pointer",
                border: "none", background: "var(--accent)", color: "#000",
                fontWeight: 700, fontSize: "0.85rem",
              }}>
                Додати
              </button>
              <button onClick={() => { setAddingHabit(false); setNewHabitName(""); }} style={{
                padding: "6px 10px", borderRadius: 8, cursor: "pointer",
                border: "1px solid var(--border)", background: "transparent",
                color: "var(--muted)", fontSize: "0.85rem",
              }}>
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAddingHabit(true)}
              style={{
                padding: "6px 14px", borderRadius: 8, cursor: "pointer",
                border: "1px dashed color-mix(in srgb, var(--accent) 50%, transparent)",
                background: "transparent", color: "var(--accent)",
                fontSize: "0.82rem", fontFamily: "inherit",
              }}
            >
              + Додати звичку
            </button>
          )}
        </div>

        {/* Navigation */}
        <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}>
          <Link
            href={`/month/${year}/${monthStr}`}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--muted)",
              fontSize: "0.85rem",
              textDecoration: "none",
            }}
          >
            ← Назад до місяця
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
}
