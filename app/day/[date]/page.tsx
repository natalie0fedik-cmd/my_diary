"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getDayData, saveDayData, generateId } from "@/lib/storage";
import { DayData, Task } from "@/lib/types";

const MONTHS_UA = [
  "Січня", "Лютого", "Березня", "Квітня",
  "Травня", "Червня", "Липня", "Серпня",
  "Вересня", "Жовтня", "Листопада", "Грудня",
];

const DAYS_UA_FULL = ["Неділя", "Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця", "Субота"];

const MOOD_LABELS = ["", "Погано", "Нижче норми", "Нормально", "Добре", "Відмінно"];
const MOOD_COLORS = ["", "#f87171", "#fb923c", "#fbbf24", "#4ade80", "#7c6af7"];

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

  const [data, setData] = useState<DayData | null>(null);
  const [newTask, setNewTask] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setData(getDayData(date));
  }, [date]);

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
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "2rem 1.5rem" }}>
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
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>
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
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {saving && (
              <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>Збережено</span>
            )}
            {totalTasks > 0 && (
              <div style={{
                padding: "6px 14px",
                borderRadius: 8,
                background: doneTasks === totalTasks ? "#4ade8022" : "var(--surface2)",
                border: `1px solid ${doneTasks === totalTasks ? "#4ade80" : "var(--border)"}`,
                color: doneTasks === totalTasks ? "#4ade80" : "var(--muted)",
                fontSize: "0.82rem",
                fontWeight: 600,
              }}>
                {doneTasks}/{totalTasks} задач
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {/* Left column: Schedule */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "1.25rem",
              flex: 1,
            }}>
              <h2 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--muted)", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Розклад по годинах
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {data.schedule.map(entry => (
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
                      color: entry.text.trim() ? "#7c6af7" : "var(--muted)",
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
                  </div>
                ))}
              </div>
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
                    border: "1px solid #7c6af7",
                    background: "#7c6af722",
                    color: "#7c6af7",
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
                style={{
                  width: "100%",
                  minHeight: 220,
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--surface2)",
                  fontSize: "0.88rem",
                  color: "var(--text)",
                  lineHeight: 1.7,
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
              />
            </div>
          </div>
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
  );
}
