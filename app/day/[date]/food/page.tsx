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

export default function FoodPage({ params }: Props) {
  const { date } = use(params);
  const [year, monthStr] = date.split("-");

  const [data, setData] = useState<DayFood | null>(null);
  const [inputs, setInputs] = useState<Record<MealType, string>>({
    breakfast: "", lunch: "", dinner: "", snacks: "",
  });

  useEffect(() => { setData(getDayFood(date)); }, [date]);

  const save = useCallback((updated: DayFood) => saveDayFood(updated), []);

  const addItem = (meal: MealType) => {
    if (!data || !inputs[meal].trim()) return;
    const item: FoodItem = { id: generateId(), name: inputs[meal].trim() };
    const updated = { ...data, [meal]: [...data[meal], item] };
    setData(updated); save(updated);
    setInputs(p => ({ ...p, [meal]: "" }));
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

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingLeft: 28 }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.25rem", fontSize: "0.82rem", color: "var(--muted)", fontFamily: "'Lora',Georgia,serif" }}>
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
              <div style={{ fontSize: "0.7rem", color: "var(--muted)", fontFamily: "'Lora',Georgia,serif", letterSpacing: "0.1em", marginBottom: 4 }}>
                {formatDate(date)}
              </div>
              <h1 style={{ fontFamily: "'Caveat',cursive", fontSize: "2.4rem", fontWeight: 700, color: "#f6c547", margin: 0, lineHeight: 1 }}>
                Харчування
              </h1>
              {totalItems > 0 && (
                <p style={{ fontFamily: "'Lora',Georgia,serif", fontStyle: "italic", color: "var(--muted)", fontSize: "0.82rem", margin: "6px 0 0" }}>
                  {totalItems} записів за день
                </p>
              )}
            </div>

            {/* Water tracker */}
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.7rem", color: "var(--muted)", fontFamily: "'Lora',Georgia,serif", marginBottom: 6 }}>
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
                <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1.2rem", color: "#60a5fa", minWidth: 24 }}>
                  {data.water}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Meal sections */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1rem" }}>
          {MEALS.map(({ key, label, time, color }) => (
            <div key={key} style={{
              background: "var(--surface)", border: `1px solid ${color}33`,
              borderRadius: 12, padding: "1rem 1.25rem",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <h3 style={{ fontFamily: "'Caveat',cursive", fontSize: "1.15rem", fontWeight: 700, color, margin: 0 }}>
                  {label}
                </h3>
                <span style={{ fontSize: "0.68rem", color: "var(--muted)", fontFamily: "'Lora',Georgia,serif" }}>{time}</span>
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
                    <span style={{ flex: 1, fontSize: "0.85rem", color: "var(--text)", fontFamily: "'Lora',Georgia,serif" }}>
                      {item.name}
                    </span>
                    <button onClick={() => deleteItem(key, item.id)} style={{
                      color: "var(--muted)", background: "none", border: "none",
                      cursor: "pointer", fontSize: "0.9rem", padding: 0, flexShrink: 0,
                    }}>×</button>
                  </div>
                ))}
                {data[key].length === 0 && (
                  <p style={{ color: "var(--muted)", fontSize: "0.78rem", fontFamily: "'Lora',Georgia,serif", fontStyle: "italic", margin: "0 0 2px" }}>
                    Нічого не додано
                  </p>
                )}
              </div>

              {/* Add item */}
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  type="text" value={inputs[key]}
                  onChange={e => setInputs(p => ({ ...p, [key]: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && addItem(key)}
                  placeholder="Додати страву..."
                  style={{
                    flex: 1, padding: "5px 9px", borderRadius: 7,
                    border: `1px solid ${color}44`, background: "var(--surface2)",
                    fontSize: "0.8rem", color: "var(--text)", fontFamily: "'Lora',Georgia,serif",
                  }}
                />
                <button onClick={() => addItem(key)} style={{
                  padding: "5px 10px", borderRadius: 7,
                  border: `1px solid ${color}88`, background: `${color}22`,
                  color, cursor: "pointer", fontSize: "0.8rem", fontWeight: 600,
                  fontFamily: "'Lora',Georgia,serif",
                }}>+</button>
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1rem" }}>
          <h3 style={{ fontFamily: "'Caveat',cursive", fontSize: "1rem", color: "var(--muted)", margin: "0 0 10px" }}>
            Нотатки про харчування
          </h3>
          <textarea
            value={data.notes} onChange={e => updateNotes(e.target.value)}
            placeholder="Як почувалась після їжі? Що хочеш спробувати?.."
            className="lined-paper"
            style={{
              width: "100%", minHeight: 80, padding: "4px 12px", borderRadius: 8,
              border: "1px solid var(--border)", background: "var(--surface2)",
              fontSize: "0.85rem", color: "var(--text)", fontFamily: "'Lora',Georgia,serif", resize: "vertical",
            }}
          />
        </div>

        {/* Back */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Link href={`/day/${date}`} style={{
            padding: "8px 20px", borderRadius: 8, border: "1px solid var(--border)",
            background: "var(--surface)", color: "var(--muted)",
            fontSize: "0.85rem", textDecoration: "none", fontFamily: "'Lora',Georgia,serif",
          }}>
            ← Назад до дня
          </Link>
        </div>

      </div>
    </div>
  );
}
