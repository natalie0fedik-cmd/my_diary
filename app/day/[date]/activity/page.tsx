"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getDayActivity, saveDayActivity, generateId } from "@/lib/storage";
import { DayActivity, ActivityEntry, ActivityType } from "@/lib/types";

const MONTHS_UA = [
  "Січня", "Лютого", "Березня", "Квітня",
  "Травня", "Червня", "Липня", "Серпня",
  "Вересня", "Жовтня", "Листопада", "Грудня",
];
const DAYS_UA_FULL = ["Неділя", "Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця", "Субота"];

const ACTIVITY_TYPES: { key: ActivityType; label: string; emoji: string; color: string }[] = [
  { key: "cardio",   label: "Кардіо",    emoji: "🏃", color: "#f87171" },
  { key: "strength", label: "Силова",    emoji: "💪", color: "#fb923c" },
  { key: "yoga",     label: "Йога",      emoji: "🧘", color: "#c084fc" },
  { key: "walk",     label: "Прогулянка",emoji: "🚶", color: "#4ade80" },
  { key: "sport",    label: "Спорт",     emoji: "⚽", color: "#60a5fa" },
  { key: "other",    label: "Інше",      emoji: "✨", color: "#9ca3af" },
];

function formatDateUA(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const weekday = new Date(y, m - 1, d).getDay();
  return `${DAYS_UA_FULL[weekday]}, ${d} ${MONTHS_UA[m - 1]} ${y}`;
}

function typeInfo(type: ActivityType) {
  return ACTIVITY_TYPES.find(t => t.key === type) ?? ACTIVITY_TYPES[ACTIVITY_TYPES.length - 1];
}

interface Props { params: Promise<{ date: string }> }

export default function ActivityPage({ params }: Props) {
  const { date } = use(params);
  const [year, monthStr] = date.split("-");

  const [data, setData] = useState<DayActivity | null>(null);
  const [newType, setNewType] = useState<ActivityType>("cardio");
  const [newName, setNewName] = useState("");
  const [newDuration, setNewDuration] = useState("");
  const [newNote, setNewNote] = useState("");

  useEffect(() => { setData(getDayActivity(date)); }, [date]);

  const save = useCallback((updated: DayActivity) => saveDayActivity(updated), []);

  const addEntry = () => {
    if (!data || !newName.trim()) return;
    const entry: ActivityEntry = {
      id: generateId(),
      type: newType,
      name: newName.trim(),
      duration: parseInt(newDuration) || 0,
      note: newNote.trim(),
    };
    const updated = { ...data, entries: [...data.entries, entry] };
    setData(updated); save(updated);
    setNewName(""); setNewDuration(""); setNewNote("");
  };

  const deleteEntry = (id: string) => {
    if (!data) return;
    const updated = { ...data, entries: data.entries.filter(e => e.id !== id) };
    setData(updated); save(updated);
  };

  const updateNote = (generalNote: string) => {
    if (!data) return;
    const updated = { ...data, generalNote };
    setData(updated); save(updated);
  };

  if (!data) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "var(--muted)" }}>Завантаження...</div>
    </div>
  );

  const totalMinutes = data.entries.reduce((s, e) => s + e.duration, 0);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingLeft: 28 }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.25rem", fontSize: "0.82rem", color: "var(--muted)", fontFamily: "var(--font-body)" }}>
          <Link href="/" style={{ color: "var(--muted)", textDecoration: "none" }}>Щоденник</Link>
          <span>›</span>
          <Link href={`/month/${year}/${monthStr}`} style={{ color: "var(--muted)", textDecoration: "none" }}>Місяць</Link>
          <span>›</span>
          <Link href={`/day/${date}`} style={{ color: "var(--muted)", textDecoration: "none" }}>{formatDateUA(date)}</Link>
          <span>›</span>
          <span style={{ color: "#60a5fa" }}>Активність</span>
        </div>

        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg,var(--surface) 0%,var(--surface2) 100%)",
          border: "1px solid #60a5fa44", borderRadius: 14, padding: "1.5rem",
          marginBottom: "1.25rem", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(to right,#60a5fa,#818cf8)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 6, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--muted)", fontFamily: "var(--font-body)", letterSpacing: "0.1em", marginBottom: 4 }}>
                {date}
              </div>
              <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2.2rem", fontWeight: 700, color: "#60a5fa", margin: 0, lineHeight: 1 }}>
                Фізична активність
              </h1>
            </div>
            {data.entries.length > 0 && (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.8rem", fontWeight: 700, color: "#60a5fa" }}>
                  {totalMinutes} хв
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--muted)", fontFamily: "var(--font-body)" }}>
                  {data.entries.length} {data.entries.length === 1 ? "тренування" : data.entries.length < 5 ? "тренування" : "тренувань"}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Activity type legend */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: "1.25rem" }}>
          {ACTIVITY_TYPES.map(t => (
            <span key={t.key} style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "3px 10px", borderRadius: 20, fontSize: "0.75rem",
              background: `${t.color}15`, border: `1px solid ${t.color}33`, color: t.color,
              fontFamily: "var(--font-body)",
            }}>
              {t.emoji} {t.label}
            </span>
          ))}
        </div>

        {/* Entries list */}
        {data.entries.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--muted)", fontFamily: "var(--font-heading)", fontSize: "1.2rem", padding: "2rem 0" }}>
            Ще немає записів про активність
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: "1.25rem" }}>
            {data.entries.map(entry => {
              const info = typeInfo(entry.type);
              return (
                <div key={entry.id} style={{
                  background: "var(--surface)", border: `1px solid ${info.color}33`,
                  borderRadius: 12, padding: "0.9rem 1.1rem",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: `${info.color}20`, border: `1px solid ${info.color}44`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.1rem",
                  }}>
                    {info.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "var(--font-heading)", fontSize: "1.05rem", fontWeight: 600, color: info.color }}>
                        {entry.name}
                      </span>
                      <span style={{ fontSize: "0.72rem", color: "var(--muted)", fontFamily: "var(--font-body)" }}>
                        {info.label}
                      </span>
                    </div>
                    {entry.duration > 0 && (
                      <div style={{ fontSize: "0.8rem", color: "var(--muted)", fontFamily: "var(--font-body)", marginTop: 2 }}>
                        {entry.duration} хвилин
                      </div>
                    )}
                    {entry.note && (
                      <div style={{ fontSize: "0.8rem", color: "var(--text)", fontFamily: "var(--font-body)", marginTop: 4, fontStyle: "italic" }}>
                        {entry.note}
                      </div>
                    )}
                  </div>
                  <button onClick={() => deleteEntry(entry.id)} style={{
                    color: "var(--muted)", background: "none", border: "none",
                    cursor: "pointer", fontSize: "1.1rem", padding: 0, flexShrink: 0,
                  }}>×</button>
                </div>
              );
            })}
          </div>
        )}

        {/* Add entry */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1rem" }}>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "var(--muted)", margin: "0 0 10px" }}>
            Додати активність
          </h3>

          {/* Type selector */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {ACTIVITY_TYPES.map(t => (
              <button
                key={t.key}
                onClick={() => setNewType(t.key)}
                style={{
                  padding: "4px 12px", borderRadius: 8, cursor: "pointer",
                  border: `1px solid ${newType === t.key ? t.color : "var(--border)"}`,
                  background: newType === t.key ? `${t.color}22` : "var(--surface2)",
                  color: newType === t.key ? t.color : "var(--muted)",
                  fontSize: "0.8rem", fontFamily: "var(--font-body)",
                }}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              type="text" value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addEntry()}
              placeholder="Назва (наприклад, Біг у парку)"
              style={{
                flex: 2, minWidth: 160, padding: "8px 12px", borderRadius: 8,
                border: "1px solid var(--border)", background: "var(--surface2)",
                fontSize: "0.88rem", color: "var(--text)", fontFamily: "var(--font-body)",
              }}
            />
            <input
              type="number" value={newDuration}
              onChange={e => setNewDuration(e.target.value)}
              placeholder="Хвилин"
              min={1}
              style={{
                width: 90, padding: "8px 12px", borderRadius: 8,
                border: "1px solid var(--border)", background: "var(--surface2)",
                fontSize: "0.88rem", color: "var(--text)", fontFamily: "var(--font-body)",
              }}
            />
            <input
              type="text" value={newNote}
              onChange={e => setNewNote(e.target.value)}
              placeholder="Нотатка (необов'язково)"
              style={{
                flex: 2, minWidth: 140, padding: "8px 12px", borderRadius: 8,
                border: "1px solid var(--border)", background: "var(--surface2)",
                fontSize: "0.88rem", color: "var(--text)", fontFamily: "var(--font-body)",
              }}
            />
            <button onClick={addEntry} style={{
              padding: "8px 18px", borderRadius: 8,
              border: "1px solid #60a5fa", background: "#60a5fa22",
              color: "#60a5fa", cursor: "pointer", fontSize: "0.88rem",
              fontWeight: 600, fontFamily: "var(--font-body)",
            }}>
              + Додати
            </button>
          </div>
        </div>

        {/* General note */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.25rem" }}>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "var(--muted)", margin: "0 0 10px" }}>
            Нотатки про самопочуття
          </h3>
          <textarea
            value={data.generalNote} onChange={e => updateNote(e.target.value)}
            placeholder="Як відчуваєш себе після тренування?..."
            className="lined-paper"
            style={{
              width: "100%", minHeight: 90, padding: "4px 12px", borderRadius: 8,
              border: "1px solid var(--border)", background: "var(--surface2)",
              fontSize: "0.88rem", color: "var(--text)", fontFamily: "var(--font-body)", resize: "vertical",
            }}
          />
        </div>

        {/* Back links */}
        <div style={{ display: "flex", gap: 8 }}>
          <Link href={`/day/${date}`} style={{
            padding: "8px 18px", borderRadius: 8,
            border: "1px solid var(--border)", background: "var(--surface)",
            color: "var(--muted)", fontSize: "0.85rem", textDecoration: "none",
          }}>
            ← До дня
          </Link>
          <Link href={`/month/${year}/${monthStr}/activity`} style={{
            padding: "8px 18px", borderRadius: 8,
            border: "1px solid #60a5fa44", background: "#60a5fa12",
            color: "#60a5fa", fontSize: "0.85rem", textDecoration: "none",
          }}>
            Місячний звіт →
          </Link>
        </div>

      </div>
    </div>
  );
}
