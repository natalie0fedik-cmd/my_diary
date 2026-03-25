"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getDayFood, saveDayFood, generateId } from "@/lib/storage";
import { DayFood, FoodItem, MealType } from "@/lib/types";

const MONTHS_UA_GEN = [
  "Січня","Лютого","Березня","Квітня",
  "Травня","Червня","Липня","Серпня",
  "Вересня","Жовтня","Листопада","Грудня",
];

const MEALS: { key: MealType; label: string; time: string; color: string }[] = [
  { key: "breakfast", label: "Сніданок",  time: "07–10", color: "#f6c547" },
  { key: "lunch",     label: "Обід",      time: "12–14", color: "#4ade80" },
  { key: "dinner",    label: "Вечеря",    time: "18–20", color: "#60a5fa" },
  { key: "snacks",    label: "Перекуси",  time: "будь-коли", color: "#fb923c" },
];

interface Props { params: Promise<{ date: string }> }

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${d} ${MONTHS_UA_GEN[m-1]} ${y}`;
}

function mealCalories(items: FoodItem[]): number {
  return items.reduce((s, i) => s + (parseFloat(i.calories ?? "") || 0), 0);
}

export default function FoodPage({ params }: Props) {
  const { date } = use(params);
  const [year, monthStr] = date.split("-");

  const [data, setData] = useState<DayFood | null>(null);
  const [nameInputs, setNameInputs] = useState<Record<MealType, string>>({
    breakfast: "", lunch: "", dinner: "", snacks: "",
  });
  const [calInputs, setCalInputs] = useState<Record<MealType, string>>({
    breakfast: "", lunch: "", dinner: "", snacks: "",
  });

  useEffect(() => { setData(getDayFood(date)); }, [date]);

  const save = useCallback((updated: DayFood) => saveDayFood(updated), []);

  const addItem = (meal: MealType) => {
    if (!data || !nameInputs[meal].trim()) return;
    const item: FoodItem = {
      id: generateId(),
      name: nameInputs[meal].trim(),
      calories: calInputs[meal].trim() || undefined,
    };
    const updated = { ...data, [meal]: [...data[meal], item] };
    setData(updated); save(updated);
    setNameInputs(p => ({ ...p, [meal]: "" }));
    setCalInputs(p => ({ ...p, [meal]: "" }));
  };

  const deleteItem = (meal: MealType, id: string) => {
    if (!data) return;
    const updated = { ...data, [meal]: data[meal].filter((i: FoodItem) => i.id !== id) };
    setData(updated); save(updated);
  };

  const setWater = (n: number) => {
    if (!data) return;
    const updated = { ...data, water: Math.max(0, Math.min(12, n)) };
    setData(updated); save(updated);
  };

  const updateNotes = (notes: string) => {
    if (!data) return;
    const updated = { ...data, notes }; setData(updated); save(updated);
  };

  if (!data) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "var(--muted)" }}>Завантаження...</div>
    </div>
  );

  const totalItems = MEALS.reduce((s, m) => s + data[m.key].length, 0);
  const totalCal = MEALS.reduce((s, m) => s + mealCalories(data[m.key]), 0);
  const hasCal = MEALS.some(m => data[m.key].some(i => i.calories));

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingLeft: 28 }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.25rem", fontSize: "0.82rem", color: "var(--muted)", fontFamily: "var(--font-body)" }}>
          <Link href="/" style={{ color: "var(--muted)", textDecoration: "none" }}>Щоденник</Link>
          <span>›</span>
          <Link href={`/month/${year}/${monthStr}`} style={{ color: "var(--muted)", textDecoration: "none" }}>{monthStr}/{year}</Link>
          <span>›</span>
          <Link href={`/day/${date}`} style={{ color: "var(--muted)", textDecoration: "none" }}>{formatDate(date)}</Link>
          <span>›</span>
          <span style={{ color: "var(--accent2)" }}>Харчування</span>
        </div>

        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg,var(--surface) 0%,var(--surface2) 100%)",
          border: "1px solid #f6c54755", borderRadius: 14, padding: "1.5rem",
          marginBottom: "1.25rem", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(to right,#f6c547,#fb923c)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 6, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--muted)", fontFamily: "var(--font-body)", letterSpacing: "0.1em", marginBottom: 4 }}>
                {formatDate(date)}
              </div>
              <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2.4rem", fontWeight: 700, color: "#f6c547", margin: 0, lineHeight: 1 }}>
                Харчування
              </h1>
              <div style={{ display: "flex", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
                {totalItems > 0 && (
                  <span style={{ fontFamily: "var(--font-body)", fontStyle: "italic", color: "var(--muted)", fontSize: "0.82rem" }}>
                    {totalItems} страв
                  </span>
                )}
                {hasCal && totalCal > 0 && (
                  <span style={{
                    fontFamily: "var(--font-heading)", fontSize: "1.1rem", fontWeight: 700,
                    color: "#fb923c",
                    background: "#fb923c15", border: "1px solid #fb923c33",
                    padding: "0 10px", borderRadius: 8,
                  }}>
                    {totalCal} ккал
                  </span>
                )}
              </div>
            </div>

            {/* Water tracker */}
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.7rem", color: "var(--muted)", fontFamily: "var(--font-body)", marginBottom: 6 }}>
                Вода (склянки)
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button onClick={() => setWater(data.water - 1)} style={{
                  width: 28, height: 28, borderRadius: 7, border: "1px solid var(--border)",
                  background: "var(--surface2)", color: "var(--muted)", cursor: "pointer", fontSize: "1rem",
                }}>−</button>
                <div style={{ display: "flex", gap: 3 }}>
                  {Array.from({ length: 8 }, (_, i) => (
                    <div key={i} onClick={() => setWater(i + 1)} style={{
                      width: 14, height: 20, borderRadius: 3, cursor: "pointer",
                      background: i < data.water ? "#60a5fa" : "var(--border)",
                      transition: "background 0.1s",
                    }} />
                  ))}
                </div>
                <button onClick={() => setWater(data.water + 1)} style={{
                  width: 28, height: 28, borderRadius: 7, border: "1px solid var(--border)",
                  background: "var(--surface2)", color: "var(--muted)", cursor: "pointer", fontSize: "1rem",
                }}>+</button>
                <span style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", color: "#60a5fa", minWidth: 24 }}>
                  {data.water}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Meal sections */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1rem" }}>
          {MEALS.map(({ key, label, time, color }) => {
            const mealCal = mealCalories(data[key]);
            return (
              <div key={key} style={{
                background: "var(--surface)", border: `1px solid ${color}33`,
                borderRadius: 12, padding: "1rem 1.25rem",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.15rem", fontWeight: 700, color, margin: 0 }}>
                      {label}
                    </h3>
                    {mealCal > 0 && (
                      <span style={{ fontSize: "0.72rem", color, opacity: 0.8, fontFamily: "var(--font-body)" }}>
                        {mealCal} ккал
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: "0.68rem", color: "var(--muted)", fontFamily: "var(--font-body)" }}>{time}</span>
                </div>

                {/* Items */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
                  {data[key].map((item: FoodItem) => (
                    <div key={item.id} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "5px 8px", borderRadius: 7,
                      background: `${color}10`, border: `1px solid ${color}22`,
                    }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: "0.85rem", color: "var(--text)", fontFamily: "var(--font-body)" }}>
                        {item.name}
                      </span>
                      {item.calories && (
                        <span style={{
                          fontSize: "0.72rem", color,
                          background: `${color}18`, border: `1px solid ${color}33`,
                          padding: "1px 6px", borderRadius: 5,
                          fontFamily: "var(--font-body)", flexShrink: 0,
                        }}>
                          {item.calories} ккал
                        </span>
                      )}
                      <button onClick={() => deleteItem(key, item.id)} style={{
                        color: "var(--muted)", background: "none", border: "none",
                        cursor: "pointer", fontSize: "0.9rem", padding: 0, flexShrink: 0,
                      }}>×</button>
                    </div>
                  ))}
                  {data[key].length === 0 && (
                    <p style={{ color: "var(--muted)", fontSize: "0.78rem", fontFamily: "var(--font-body)", fontStyle: "italic", margin: "0 0 2px" }}>
                      Нічого не додано
                    </p>
                  )}
                </div>

                {/* Add item — name + calories */}
                <div style={{ display: "flex", gap: 5 }}>
                  <input
                    type="text" value={nameInputs[key]}
                    onChange={e => setNameInputs(p => ({ ...p, [key]: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && addItem(key)}
                    placeholder="Страва..."
                    style={{
                      flex: 1, padding: "5px 9px", borderRadius: 7,
                      border: `1px solid ${color}44`, background: "var(--surface2)",
                      fontSize: "0.8rem", color: "var(--text)", fontFamily: "var(--font-body)",
                      minWidth: 0,
                    }}
                  />
                  <input
                    type="number" value={calInputs[key]}
                    onChange={e => setCalInputs(p => ({ ...p, [key]: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && addItem(key)}
                    placeholder="ккал"
                    min={0}
                    style={{
                      width: 62, padding: "5px 7px", borderRadius: 7,
                      border: `1px solid ${color}44`, background: "var(--surface2)",
                      fontSize: "0.8rem", color: "var(--text)", fontFamily: "var(--font-body)",
                    }}
                  />
                  <button onClick={() => addItem(key)} style={{
                    padding: "5px 10px", borderRadius: 7,
                    border: `1px solid ${color}88`, background: `${color}22`,
                    color, cursor: "pointer", fontSize: "0.8rem", fontWeight: 600,
                    fontFamily: "var(--font-body)",
                  }}>+</button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Notes */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1rem" }}>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "var(--muted)", margin: "0 0 10px" }}>
            Нотатки про харчування
          </h3>
          <textarea
            value={data.notes} onChange={e => updateNotes(e.target.value)}
            placeholder="Як почувалась після їжі? Що хочеш спробувати?.."
            className="lined-paper"
            style={{
              width: "100%", minHeight: 80, padding: "4px 12px", borderRadius: 8,
              border: "1px solid var(--border)", background: "var(--surface2)",
              fontSize: "0.85rem", color: "var(--text)", fontFamily: "var(--font-body)", resize: "vertical",
            }}
          />
        </div>

        {/* Back */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Link href={`/day/${date}`} style={{
            padding: "8px 20px", borderRadius: 8, border: "1px solid var(--border)",
            background: "var(--surface)", color: "var(--muted)",
            fontSize: "0.85rem", textDecoration: "none", fontFamily: "var(--font-body)",
          }}>
            ← Назад до дня
          </Link>
        </div>

      </div>
    </div>
  );
}
