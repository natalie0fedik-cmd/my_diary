"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getHabitTracker, saveHabitTracker, generateId, HabitTracker, Habit } from "@/lib/storage";

const MONTHS_UA = ["Січень","Лютий","Березень","Квітень","Травень","Червень","Липень","Серпень","Вересень","Жовтень","Листопад","Грудень"];
const NAV = [
  { label: "Календар",   href: (y: string, m: string) => `/month/${y}/${m}` },
  { label: "Цілі",       href: (y: string, m: string) => `/month/${y}/${m}/goals` },
  { label: "Бюджет",     href: (y: string, m: string) => `/month/${y}/${m}/budget` },
  { label: "Харчування", href: (y: string, m: string) => `/month/${y}/${m}/food` },
  { label: "Активність", href: (y: string, m: string) => `/month/${y}/${m}/activity` },
  { label: "Трекер",     href: (y: string, m: string) => `/month/${y}/${m}/habits` },
  { label: "Тіло",       href: (y: string, m: string) => `/month/${y}/${m}/body` },
  { label: "Підсумки",   href: (y: string, m: string) => `/month/${y}/${m}/conclusion` },
];

const PALETTE = [
  "#60a5fa","#4ade80","#fbbf24","#f472b6","#a78bfa",
  "#38bdf8","#fb923c","#34d399","#f87171","#e879f9",
];

interface Props { params: Promise<{ year: string; month: string }> }

export default function HabitsPage({ params }: Props) {
  const { year: yearStr, month: monthStr } = use(params);
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);
  const monthKey = `${yearStr}-${monthStr}`;
  const daysCount = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysCount }, (_, i) => i + 1);

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month - 1;
  const todayDay = today.getDate();

  const [tracker, setTracker] = useState<HabitTracker>({ habits: [], checks: {} });
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PALETTE[0]);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setTracker(getHabitTracker(monthKey));
  }, [monthKey]);

  function save(updated: HabitTracker) {
    setTracker(updated);
    saveHabitTracker(monthKey, updated);
  }

  function cycleDay(habitId: string, day: number) {
    const checks = { ...tracker.checks };
    const crosses = { ...(tracker.crosses ?? {}) };
    if (!checks[habitId]) checks[habitId] = {};
    if (!crosses[habitId]) crosses[habitId] = {};

    const isDone    = !!checks[habitId][day];
    const isCrossed = !!crosses[habitId][day];

    if (!isDone && !isCrossed) {
      // empty → done
      checks[habitId] = { ...checks[habitId], [day]: true };
    } else if (isDone) {
      // done → crossed
      checks[habitId] = { ...checks[habitId], [day]: false };
      crosses[habitId] = { ...crosses[habitId], [day]: true };
    } else {
      // crossed → empty
      crosses[habitId] = { ...crosses[habitId], [day]: false };
    }
    save({ ...tracker, checks, crosses });
  }

  function addHabit() {
    if (!newName.trim()) return;
    const habit: Habit = { id: generateId(), name: newName.trim(), color: newColor };
    save({ ...tracker, habits: [...tracker.habits, habit] });
    setNewName("");
    setNewColor(PALETTE[0]);
    setAdding(false);
  }

  function deleteHabit(id: string) {
    const habits = tracker.habits.filter(h => h.id !== id);
    const checks = { ...tracker.checks };
    delete checks[id];
    save({ ...tracker, habits, checks });
  }

  function renameHabit(id: string, name: string) {
    const habits = tracker.habits.map(h => h.id === id ? { ...h, name } : h);
    save({ ...tracker, habits });
  }

  function changeColor(id: string, color: string) {
    const habits = tracker.habits.map(h => h.id === id ? { ...h, color } : h);
    save({ ...tracker, habits });
  }

  function countDone(habitId: string) {
    const c = tracker.checks[habitId] ?? {};
    return Object.values(c).filter(Boolean).length;
  }

  function countCrossed(habitId: string) {
    const c = (tracker.crosses ?? {})[habitId] ?? {};
    return Object.values(c).filter(Boolean).length;
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.25rem" }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: "0.82rem", color: "var(--muted)", marginBottom: "1.25rem" }}>
          <Link href="/" style={{ color: "var(--muted)", textDecoration: "none" }}>Щоденник</Link>
          {" › "}
          <Link href={`/month/${yearStr}/${monthStr}`} style={{ color: "var(--muted)", textDecoration: "none" }}>
            {MONTHS_UA[month - 1]} {year}
          </Link>
          {" › "}
          <span style={{ color: "var(--accent)" }}>Трекер звичок</span>
        </div>

        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg,var(--surface) 0%,var(--surface2) 100%)",
          border: "1px solid color-mix(in srgb, var(--accent) 33%, transparent)",
          borderRadius: 14, padding: "1.25rem 1.5rem", marginBottom: "1rem", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(to right, var(--accent), color-mix(in srgb, var(--accent) 50%, transparent))" }} />
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", fontWeight: 700, color: "var(--accent)", margin: "4px 0 2px" }}>
            {MONTHS_UA[month - 1]} {year}
          </h1>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Трекер звичок · {daysCount} днів</div>
        </div>

        {/* Nav */}
        <div style={{ display: "flex", gap: 6, marginBottom: "1rem", flexWrap: "wrap" }}>
          {NAV.map(n => {
            const active = n.label === "Трекер";
            return (
              <Link key={n.label} href={n.href(yearStr, monthStr)} style={{ textDecoration: "none" }}>
                <span style={{
                  display: "inline-block", padding: "5px 14px", borderRadius: 8,
                  fontSize: "0.8rem", fontFamily: "var(--font-body)",
                  background: active ? "color-mix(in srgb, var(--accent) 13%, transparent)" : "var(--surface)",
                  color: active ? "var(--accent)" : "var(--muted)",
                  border: `1px solid ${active ? "color-mix(in srgb, var(--accent) 40%, transparent)" : "var(--border)"}`,
                  fontWeight: active ? 600 : 400,
                }}>
                  {n.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Tracker grid */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          overflow: "hidden",
          marginBottom: "1rem",
        }}>
          {/* Days header */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
              <thead>
                <tr>
                  <th style={{
                    padding: "10px 14px", textAlign: "left", fontSize: 11,
                    color: "var(--muted)", fontWeight: 600, letterSpacing: "0.06em",
                    textTransform: "uppercase", minWidth: 160,
                    borderBottom: "1px solid var(--border)",
                    background: "var(--surface)",
                    position: "sticky", left: 0, zIndex: 2,
                  }}>
                    Звичка
                  </th>
                  {days.map(d => (
                    <th key={d} style={{
                      width: 28, minWidth: 28, padding: "6px 2px", textAlign: "center",
                      fontSize: 11, color: isCurrentMonth && d === todayDay ? "var(--accent)" : "var(--muted)",
                      fontWeight: isCurrentMonth && d === todayDay ? 700 : 500,
                      borderBottom: "1px solid var(--border)",
                      borderLeft: d === 1 ? "none" : "1px solid color-mix(in srgb, var(--border) 50%, transparent)",
                    }}>
                      {d}
                    </th>
                  ))}
                  <th style={{
                    padding: "6px 10px", fontSize: 11, color: "var(--muted)",
                    fontWeight: 600, borderBottom: "1px solid var(--border)",
                    borderLeft: "1px solid var(--border)", minWidth: 50, textAlign: "center",
                  }}>✓</th>
                </tr>
              </thead>
              <tbody>
                {tracker.habits.map((habit, hi) => {
                  const done    = countDone(habit.id);
                  const crossed = countCrossed(habit.id);
                  const pct = Math.round(done / daysCount * 100);
                  return (
                    <tr key={habit.id} style={{ background: hi % 2 === 0 ? "transparent" : "color-mix(in srgb, var(--surface2) 50%, transparent)" }}>
                      {/* Habit name cell */}
                      <td style={{
                        padding: "4px 14px", borderBottom: "1px solid color-mix(in srgb, var(--border) 60%, transparent)",
                        background: hi % 2 === 0 ? "var(--surface)" : "color-mix(in srgb, var(--surface2) 70%, var(--surface))",
                        position: "sticky", left: 0, zIndex: 1,
                      }}>
                        {editingId === habit.id ? (
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <input
                              autoFocus
                              value={habit.name}
                              onChange={e => renameHabit(habit.id, e.target.value)}
                              onBlur={() => setEditingId(null)}
                              onKeyDown={e => e.key === "Enter" && setEditingId(null)}
                              style={{
                                flex: 1, fontSize: 13, background: "var(--surface2)",
                                border: "1px solid var(--accent)", borderRadius: 5,
                                padding: "3px 8px", color: "var(--text)", fontFamily: "inherit",
                              }}
                            />
                            <div style={{ display: "flex", gap: 3, flexWrap: "wrap", maxWidth: 120 }}>
                              {PALETTE.map(c => (
                                <div
                                  key={c}
                                  onClick={() => changeColor(habit.id, c)}
                                  style={{
                                    width: 14, height: 14, borderRadius: 3,
                                    background: c, cursor: "pointer",
                                    outline: habit.color === c ? "2px solid var(--text)" : "none",
                                    outlineOffset: 1,
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 10, height: 10, borderRadius: 2, background: habit.color, flexShrink: 0 }} />
                            <span
                              onClick={() => setEditingId(habit.id)}
                              style={{ flex: 1, fontSize: 13, color: "var(--text)", cursor: "pointer", userSelect: "none" }}
                            >
                              {habit.name}
                            </span>
                            <button
                              onClick={() => deleteHabit(habit.id)}
                              title="Видалити"
                              style={{
                                background: "none", border: "none", cursor: "pointer",
                                color: "#f87171", fontSize: 15, lineHeight: 1,
                                padding: "0 2px", opacity: 0.7, flexShrink: 0,
                              }}
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Day cells */}
                      {days.map(d => {
                        const isDone    = !!tracker.checks[habit.id]?.[d];
                        const isCrossed = !!(tracker.crosses ?? {})[habit.id]?.[d];
                        const isToday   = isCurrentMonth && d === todayDay;
                        const bg = isDone ? habit.color : isCrossed ? "#f8717122" : "var(--surface2)";
                        const borderColor = isDone ? habit.color : isCrossed ? "#f87171" : isToday ? "var(--accent)" : "color-mix(in srgb, var(--border) 80%, transparent)";
                        return (
                          <td key={d} style={{
                            textAlign: "center", padding: "3px 2px",
                            borderBottom: "1px solid color-mix(in srgb, var(--border) 60%, transparent)",
                            borderLeft: "1px solid color-mix(in srgb, var(--border) 40%, transparent)",
                          }}>
                            <div
                              onClick={() => cycleDay(habit.id, d)}
                              title="Клік: виконано → не виконано → порожньо"
                              style={{
                                width: 22, height: 22, borderRadius: 4, margin: "0 auto",
                                background: bg,
                                border: `1px solid ${borderColor}`,
                                cursor: "pointer",
                                transition: "background 0.1s",
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}
                              onMouseEnter={e => { if (!isDone && !isCrossed) (e.currentTarget as HTMLDivElement).style.background = habit.color + "44"; }}
                              onMouseLeave={e => { if (!isDone && !isCrossed) (e.currentTarget as HTMLDivElement).style.background = "var(--surface2)"; }}
                            >
                              {isDone && (
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                  <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                              {isCrossed && (
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                  <path d="M2 2L8 8M8 2L2 8" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round"/>
                                </svg>
                              )}
                            </div>
                          </td>
                        );
                      })}

                      {/* Count */}
                      <td style={{
                        textAlign: "center", padding: "3px 10px",
                        borderBottom: "1px solid color-mix(in srgb, var(--border) 60%, transparent)",
                        borderLeft: "1px solid var(--border)",
                      }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: habit.color }}>{done}</div>
                        {crossed > 0 && <div style={{ fontSize: 10, color: "#f87171" }}>✗{crossed}</div>}
                        <div style={{ fontSize: 10, color: "var(--muted)" }}>{pct}%</div>
                      </td>

                    </tr>
                  );
                })}

                {/* Empty state */}
                {tracker.habits.length === 0 && (
                  <tr>
                    <td colSpan={daysCount + 3} style={{ textAlign: "center", padding: "2rem", color: "var(--muted)", fontSize: 14 }}>
                      Додай першу звичку ↓
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add habit */}
        {adding ? (
          <div style={{
            background: "var(--surface)", border: "1px solid color-mix(in srgb, var(--accent) 35%, transparent)",
            borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1rem",
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", marginBottom: 10 }}>Нова звичка</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <input
                autoFocus
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addHabit()}
                placeholder="Наприклад: 🧘 Медитація"
                style={{
                  flex: 1, minWidth: 180, padding: "8px 12px", borderRadius: 8,
                  border: "1px solid var(--border)", background: "var(--surface2)",
                  color: "var(--text)", fontSize: 14, fontFamily: "inherit",
                }}
              />
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {PALETTE.map(c => (
                  <div
                    key={c}
                    onClick={() => setNewColor(c)}
                    style={{
                      width: 22, height: 22, borderRadius: 5, background: c, cursor: "pointer",
                      outline: newColor === c ? "2px solid var(--text)" : "none",
                      outlineOffset: 2,
                    }}
                  />
                ))}
              </div>
              <button onClick={addHabit} style={{
                padding: "8px 18px", borderRadius: 8, cursor: "pointer",
                border: "none", background: "var(--accent)", color: "#000",
                fontWeight: 700, fontSize: 14,
              }}>
                Додати
              </button>
              <button onClick={() => setAdding(false)} style={{
                padding: "8px 14px", borderRadius: 8, cursor: "pointer",
                border: "1px solid var(--border)", background: "var(--surface2)",
                color: "var(--muted)", fontSize: 14,
              }}>
                Скасувати
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            style={{
              padding: "9px 20px", borderRadius: 10, cursor: "pointer",
              border: "1px dashed color-mix(in srgb, var(--accent) 50%, transparent)",
              background: "color-mix(in srgb, var(--accent) 6%, transparent)",
              color: "var(--accent)", fontSize: 14, fontFamily: "var(--font-body)",
              width: "100%",
            }}
          >
            + Додати звичку
          </button>
        )}

        {/* Hint */}
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8, textAlign: "center" }}>
          Натисни на клітинку: 1 клік — виконала ✓, 2 кліки — не виконала ✗, 3 кліки — очистити
        </div>

      </div>
    </div>
  );
}
