"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getMonthGoals, saveMonthGoals, generateId } from "@/lib/storage";
import { MonthGoals, Goal, GoalCategory } from "@/lib/types";

const MONTHS_UA = [
  "Січень", "Лютий", "Березень", "Квітень",
  "Травень", "Червень", "Липень", "Серпень",
  "Вересень", "Жовтень", "Листопад", "Грудень",
];

const MONTH_COLORS = [
  "#4ade80", "#22c55e", "#86efac", "#34d399",
  "#10b981", "#059669", "#4ec564", "#84cc16",
  "#a3e635", "#52c46a", "#16a34a", "#34d399",
];

const CATEGORIES: { key: GoalCategory; label: string; color: string }[] = [
  { key: "personal", label: "Особисті", color: "#4ade80" },
  { key: "work",     label: "Робота",   color: "#60a5fa" },
  { key: "health",   label: "Здоров'я", color: "#f87171" },
  { key: "finance",  label: "Фінанси",  color: "#f6c547" },
  { key: "other",    label: "Інше",     color: "#9ca3af" },
];

const NAV = [
  { label: "Календар",   href: (y: string, m: string) => `/month/${y}/${m}` },
  { label: "Цілі",       href: (y: string, m: string) => `/month/${y}/${m}/goals` },
  { label: "Бюджет",     href: (y: string, m: string) => `/month/${y}/${m}/budget` },
  { label: "Харчування", href: (y: string, m: string) => `/month/${y}/${m}/food` },
  { label: "Активність", href: (y: string, m: string) => `/month/${y}/${m}/activity` },
  { label: "Підсумки",   href: (y: string, m: string) => `/month/${y}/${m}/conclusion` },
];

interface Props { params: Promise<{ year: string; month: string }> }

export default function GoalsPage({ params }: Props) {
  const { year, month } = use(params);
  const monthKey = `${year}-${month}`;
  const monthIdx = parseInt(month) - 1;
  const color = MONTH_COLORS[monthIdx];

  const [data, setData] = useState<MonthGoals | null>(null);
  const [newText, setNewText] = useState("");
  const [newCat, setNewCat] = useState<GoalCategory>("personal");

  useEffect(() => { setData(getMonthGoals(monthKey)); }, [monthKey]);

  const save = useCallback((updated: MonthGoals) => saveMonthGoals(updated), []);

  const addGoal = () => {
    if (!data || !newText.trim()) return;
    const goal: Goal = { id: generateId(), text: newText.trim(), done: false, category: newCat };
    const updated = { ...data, goals: [...data.goals, goal] };
    setData(updated); save(updated); setNewText("");
  };

  const toggleGoal = (id: string) => {
    if (!data) return;
    const goals = data.goals.map(g => g.id === id ? { ...g, done: !g.done } : g);
    const updated = { ...data, goals }; setData(updated); save(updated);
  };

  const deleteGoal = (id: string) => {
    if (!data) return;
    const goals = data.goals.filter(g => g.id !== id);
    const updated = { ...data, goals }; setData(updated); save(updated);
  };

  const updateNote = (generalNote: string) => {
    if (!data) return;
    const updated = { ...data, generalNote }; setData(updated); save(updated);
  };

  if (!data) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "var(--muted)" }}>Завантаження...</div>
    </div>
  );

  const done = data.goals.filter(g => g.done).length;
  const total = data.goals.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingLeft: 28 }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.25rem", fontSize: "0.82rem", color: "var(--muted)", fontFamily: "'Lora',Georgia,serif" }}>
          <Link href="/" style={{ color: "var(--muted)", textDecoration: "none" }}>Щоденник</Link>
          <span>›</span>
          <Link href={`/month/${year}/${month}`} style={{ color: "var(--muted)", textDecoration: "none" }}>{MONTHS_UA[monthIdx]} {year}</Link>
          <span>›</span>
          <span style={{ color: "var(--accent2)" }}>Цілі</span>
        </div>

        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg,var(--surface) 0%,var(--surface2) 100%)",
          border: `1px solid ${color}55`, borderRadius: 14, padding: "1.5rem",
          marginBottom: "1rem", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(to right,${color},${color}88)` }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 6, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--muted)", fontFamily: "'Lora',Georgia,serif", letterSpacing: "0.1em", marginBottom: 4 }}>
                {String(parseInt(month)).padStart(2,"0")} · {year}
              </div>
              <h1 style={{ fontFamily: "'Caveat',cursive", fontSize: "2.4rem", fontWeight: 700, color, margin: 0, lineHeight: 1 }}>
                Цілі місяця
              </h1>
            </div>
            {total > 0 && (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1.8rem", fontWeight: 700, color }}>{pct}%</div>
                <div style={{ fontSize: "0.75rem", color: "var(--muted)", fontFamily: "'Lora',Georgia,serif" }}>{done}/{total} виконано</div>
              </div>
            )}
          </div>
          {total > 0 && (
            <div style={{ marginTop: 12, height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.3s" }} />
            </div>
          )}
        </div>

        {/* Month nav tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: "1.25rem", flexWrap: "wrap" }}>
          {NAV.map(n => {
            const active = n.label === "Цілі";
            return (
              <Link key={n.label} href={n.href(year, month)} style={{ textDecoration: "none" }}>
                <span style={{
                  display: "inline-block", padding: "5px 14px", borderRadius: 8,
                  fontSize: "0.8rem", fontFamily: "'Lora',Georgia,serif",
                  background: active ? `${color}22` : "var(--surface)",
                  color: active ? color : "var(--muted)",
                  border: `1px solid ${active ? color+"66" : "var(--border)"}`,
                  fontWeight: active ? 600 : 400,
                }}>
                  {n.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Goals by category */}
        {CATEGORIES.map(cat => {
          const catGoals = data.goals.filter(g => g.category === cat.key);
          if (catGoals.length === 0) return null;
          const catDone = catGoals.filter(g => g.done).length;
          return (
            <div key={cat.key} style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 12, padding: "1rem 1.25rem", marginBottom: 10,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: cat.color, flexShrink: 0 }} />
                <h2 style={{ fontFamily: "'Caveat',cursive", fontSize: "1.15rem", fontWeight: 600, color: cat.color, margin: 0 }}>
                  {cat.label}
                </h2>
                <span style={{ fontSize: "0.72rem", color: "var(--muted)", fontFamily: "'Lora',Georgia,serif" }}>
                  {catDone}/{catGoals.length}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {catGoals.map(goal => (
                  <div key={goal.id} style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    padding: "7px 10px", borderRadius: 8,
                    background: goal.done ? `${cat.color}12` : "var(--surface2)",
                    border: `1px solid ${goal.done ? cat.color+"33" : "transparent"}`,
                  }}>
                    <button onClick={() => toggleGoal(goal.id)} style={{
                      width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                      border: `2px solid ${goal.done ? cat.color : "var(--border)"}`,
                      background: goal.done ? cat.color : "transparent",
                      cursor: "pointer", color: "#051208", fontSize: "0.7rem",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {goal.done ? "✓" : ""}
                    </button>
                    <span style={{
                      flex: 1, fontSize: "0.9rem", lineHeight: 1.5,
                      fontFamily: "'Lora',Georgia,serif",
                      color: goal.done ? "var(--muted)" : "var(--text)",
                      textDecoration: goal.done ? "line-through" : "none",
                    }}>
                      {goal.text}
                    </span>
                    <button onClick={() => deleteGoal(goal.id)} style={{ color: "var(--muted)", background: "none", border: "none", cursor: "pointer", fontSize: "1rem", padding: 0, flexShrink: 0 }}>×</button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {total === 0 && (
          <div style={{ textAlign: "center", color: "var(--muted)", fontFamily: "'Caveat',cursive", fontSize: "1.2rem", padding: "2rem 0" }}>
            Ще немає цілей на цей місяць
          </div>
        )}

        {/* Add goal */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: 10 }}>
          <h3 style={{ fontFamily: "'Caveat',cursive", fontSize: "1rem", color: "var(--muted)", margin: "0 0 10px" }}>
            Нова ціль
          </h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              type="text" value={newText}
              onChange={e => setNewText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addGoal()}
              placeholder="Опишіть ціль..."
              style={{
                flex: 1, minWidth: 180, padding: "8px 12px", borderRadius: 8,
                border: "1px solid var(--border)", background: "var(--surface2)",
                fontSize: "0.88rem", color: "var(--text)", fontFamily: "'Lora',Georgia,serif",
              }}
            />
            <select value={newCat} onChange={e => setNewCat(e.target.value as GoalCategory)} style={{
              padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)",
              background: "var(--surface2)", color: "var(--text)", fontSize: "0.85rem",
              cursor: "pointer", fontFamily: "'Lora',Georgia,serif",
            }}>
              {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
            <button onClick={addGoal} style={{
              padding: "8px 18px", borderRadius: 8,
              border: `1px solid ${color}`, background: `${color}22`,
              color, cursor: "pointer", fontSize: "0.88rem", fontWeight: 600,
              fontFamily: "'Lora',Georgia,serif",
            }}>
              + Додати
            </button>
          </div>
        </div>

        {/* General note */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "1rem 1.25rem" }}>
          <h3 style={{ fontFamily: "'Caveat',cursive", fontSize: "1rem", color: "var(--muted)", margin: "0 0 10px" }}>
            Загальний намір на місяць
          </h3>
          <textarea
            value={data.generalNote} onChange={e => updateNote(e.target.value)}
            placeholder="Яким хочеш зробити цей місяць?.."
            className="lined-paper"
            style={{
              width: "100%", minHeight: 110, padding: "4px 12px", borderRadius: 8,
              border: "1px solid var(--border)", background: "var(--surface2)",
              fontSize: "0.88rem", color: "var(--text)", fontFamily: "'Lora',Georgia,serif", resize: "vertical",
            }}
          />
        </div>

      </div>
    </div>
  );
}
