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

interface ActivityDef {
  key: ActivityType;
  label: string;
  icon: string;
  color: string;
  inputType: "steps" | "minutes" | "text" | "custom";
  placeholder: string;
  unit: string;
}

const ACTIVITY_DEFS: ActivityDef[] = [
  { key: "steps",      label: "Кроки",      icon: "👣", color: "#4ade80", inputType: "steps",   placeholder: "Кількість кроків",    unit: "кроків"   },
  { key: "massage",    label: "Масаж",      icon: "🤲", color: "#c084fc", inputType: "text",    placeholder: "Ділянка тіла (напр. спина, шия)", unit: "" },
  { key: "exercise",   label: "Зарядка",    icon: "🌅", color: "#fb923c", inputType: "minutes", placeholder: "Скільки хвилин",       unit: "хв"       },
  { key: "stretching", label: "Розтяжка",   icon: "🙆", color: "#f472b6", inputType: "minutes", placeholder: "Скільки хвилин",       unit: "хв"       },
  { key: "stepper",    label: "Степер",     icon: "🪜", color: "#60a5fa", inputType: "minutes", placeholder: "Скільки хвилин",       unit: "хв"       },
  { key: "custom",     label: "+ Своя",     icon: "✦",  color: "#fbbf24", inputType: "custom",  placeholder: "Опис / значення",      unit: ""         },
];

function formatDateUA(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const weekday = new Date(y, m - 1, d).getDay();
  return `${DAYS_UA_FULL[weekday]}, ${d} ${MONTHS_UA[m - 1]} ${y}`;
}

function def(type: ActivityType): ActivityDef {
  return ACTIVITY_DEFS.find(d => d.key === type) ?? ACTIVITY_DEFS[ACTIVITY_DEFS.length - 1];
}

function entryLabel(entry: ActivityEntry): string {
  const d = def(entry.type);
  if (entry.type === "custom") return `${entry.customName ?? "Активність"}: ${entry.value}`;
  if (d.unit) return `${entry.value} ${d.unit}`;
  return entry.value;
}

interface SectionProps {
  def: ActivityDef;
  entries: ActivityEntry[];
  onAdd: (type: ActivityType, value: string, customName: string, note: string) => void;
  onDelete: (id: string) => void;
}

function ActivitySection({ def: d, entries, onAdd, onDelete }: SectionProps) {
  const [value, setValue] = useState("");
  const [customName, setCustomName] = useState("");
  const [note, setNote] = useState("");

  const submit = () => {
    if (!value.trim() && d.inputType !== "custom") return;
    if (d.inputType === "custom" && !customName.trim()) return;
    onAdd(d.key, value.trim(), customName.trim(), note.trim());
    setValue(""); setCustomName(""); setNote("");
  };

  return (
    <div style={{
      background: "var(--surface)", borderRadius: 12,
      border: `1px solid ${d.color}33`, overflow: "hidden",
    }}>
      {/* Section header */}
      <div style={{
        padding: "10px 14px",
        background: `${d.color}12`,
        borderBottom: entries.length > 0 || true ? `1px solid ${d.color}22` : "none",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ fontSize: "1.1rem" }}>{d.icon}</span>
        <span style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700, color: d.color }}>
          {d.label}
        </span>
        {entries.length > 0 && (
          <span style={{
            marginLeft: "auto", fontSize: "0.72rem", color: d.color,
            background: `${d.color}20`, border: `1px solid ${d.color}33`,
            borderRadius: 12, padding: "1px 8px", fontFamily: "var(--font-body)",
          }}>
            {entries.length}×
          </span>
        )}
      </div>

      <div style={{ padding: "10px 14px" }}>
        {/* Existing entries */}
        {entries.map(e => (
          <div key={e.id} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "5px 8px", borderRadius: 8, marginBottom: 4,
            background: `${d.color}0d`,
          }}>
            <span style={{ flex: 1, fontSize: "0.88rem", color: "var(--text)", fontFamily: "var(--font-body)", fontWeight: 600 }}>
              {entryLabel(e)}
            </span>
            {e.note && (
              <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontFamily: "var(--font-body)", fontStyle: "italic" }}>
                {e.note}
              </span>
            )}
            <button onClick={() => onDelete(e.id)} style={{
              color: "var(--muted)", background: "none", border: "none",
              cursor: "pointer", fontSize: "1rem", padding: 0, flexShrink: 0,
            }}>×</button>
          </div>
        ))}

        {/* Add form */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: entries.length > 0 ? 6 : 0 }}>
          {d.inputType === "custom" && (
            <input
              type="text" value={customName}
              onChange={e => setCustomName(e.target.value)}
              placeholder="Назва активності"
              style={{
                flex: 2, minWidth: 120, padding: "6px 10px", borderRadius: 7,
                border: `1px solid ${d.color}44`, background: "var(--surface2)",
                fontSize: "0.82rem", color: "var(--text)", fontFamily: "var(--font-body)",
              }}
            />
          )}
          <input
            type={d.inputType === "minutes" || d.inputType === "steps" ? "number" : "text"}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            placeholder={d.placeholder}
            min={1}
            style={{
              flex: d.inputType === "text" || d.inputType === "custom" ? 2 : 1,
              minWidth: d.inputType === "steps" ? 110 : d.inputType === "minutes" ? 90 : 140,
              padding: "6px 10px", borderRadius: 7,
              border: `1px solid ${d.color}44`, background: "var(--surface2)",
              fontSize: "0.82rem", color: "var(--text)", fontFamily: "var(--font-body)",
            }}
          />
          <input
            type="text" value={note}
            onChange={e => setNote(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            placeholder="Нотатка"
            style={{
              flex: 1, minWidth: 80, padding: "6px 10px", borderRadius: 7,
              border: "1px solid var(--border)", background: "var(--surface2)",
              fontSize: "0.82rem", color: "var(--text)", fontFamily: "var(--font-body)",
            }}
          />
          <button onClick={submit} style={{
            padding: "6px 14px", borderRadius: 7, cursor: "pointer",
            border: `1px solid ${d.color}`, background: `${d.color}22`,
            color: d.color, fontSize: "0.82rem", fontWeight: 700, fontFamily: "var(--font-body)",
            whiteSpace: "nowrap",
          }}>
            + Додати
          </button>
        </div>
      </div>
    </div>
  );
}

interface Props { params: Promise<{ date: string }> }

export default function ActivityPage({ params }: Props) {
  const { date } = use(params);
  const [year, monthStr] = date.split("-");

  const [data, setData] = useState<DayActivity | null>(null);

  useEffect(() => { setData(getDayActivity(date)); }, [date]);

  const save = useCallback((updated: DayActivity) => saveDayActivity(updated), []);

  const addEntry = (type: ActivityType, value: string, customName: string, note: string) => {
    if (!data) return;
    const entry: ActivityEntry = { id: generateId(), type, value, customName: customName || undefined, note };
    const updated = { ...data, entries: [...data.entries, entry] };
    setData(updated); save(updated);
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

  // summary stats
  const totalMinutes = data.entries
    .filter(e => e.type === "exercise" || e.type === "stretching" || e.type === "stepper")
    .reduce((s, e) => s + (parseInt(e.value) || 0), 0);
  const totalSteps = data.entries
    .filter(e => e.type === "steps")
    .reduce((s, e) => s + (parseInt(e.value) || 0), 0);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingLeft: 28 }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "2rem 1.5rem" }}>

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
              <div style={{ fontSize: "0.7rem", color: "var(--muted)", fontFamily: "var(--font-body)", letterSpacing: "0.1em", marginBottom: 4 }}>{date}</div>
              <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2.2rem", fontWeight: 700, color: "#60a5fa", margin: 0, lineHeight: 1 }}>
                Фізична активність
              </h1>
            </div>
            {data.entries.length > 0 && (
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {totalSteps > 0 && (
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.6rem", fontWeight: 700, color: "#4ade80" }}>{totalSteps.toLocaleString()}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--muted)", fontFamily: "var(--font-body)" }}>кроків</div>
                  </div>
                )}
                {totalMinutes > 0 && (
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.6rem", fontWeight: 700, color: "#60a5fa" }}>{totalMinutes}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--muted)", fontFamily: "var(--font-body)" }}>хвилин</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Activity sections grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: "1rem" }}>
          {ACTIVITY_DEFS.slice(0, 4).map(d => (
            <ActivitySection
              key={d.key}
              def={d}
              entries={data.entries.filter(e => e.type === d.key)}
              onAdd={addEntry}
              onDelete={deleteEntry}
            />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: "1rem" }}>
          {ACTIVITY_DEFS.slice(4).map(d => (
            <ActivitySection
              key={d.key}
              def={d}
              entries={data.entries.filter(e => e.type === d.key)}
              onAdd={addEntry}
              onDelete={deleteEntry}
            />
          ))}
        </div>

        {/* General note */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.25rem" }}>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "var(--muted)", margin: "0 0 10px" }}>
            Нотатки про самопочуття
          </h3>
          <textarea
            value={data.generalNote} onChange={e => updateNote(e.target.value)}
            placeholder="Як відчуваєш себе?..."
            className="lined-paper"
            style={{
              width: "100%", minHeight: 80, padding: "4px 12px", borderRadius: 8,
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
