"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getDayActivity } from "@/lib/storage";
import { DayActivity, ActivityType } from "@/lib/types";

const MONTHS_UA = [
  "Січень","Лютий","Березень","Квітень",
  "Травень","Червень","Липень","Серпень",
  "Вересень","Жовтень","Листопад","Грудень",
];
const DAYS_UA = ["Нд","Пн","Вт","Ср","Чт","Пт","Сб"];
const DAYS_UA_FULL = ["Неділя","Понеділок","Вівторок","Середа","Четвер","П'ятниця","Субота"];

const MONTH_COLORS = [
  "#4ade80","#22c55e","#86efac","#34d399",
  "#10b981","#059669","#4ec564","#84cc16",
  "#a3e635","#52c46a","#16a34a","#34d399",
];

const NAV = [
  { label: "Календар",   href: (y: string, m: string) => `/month/${y}/${m}` },
  { label: "Цілі",       href: (y: string, m: string) => `/month/${y}/${m}/goals` },
  { label: "Бюджет",     href: (y: string, m: string) => `/month/${y}/${m}/budget` },
  { label: "Харчування", href: (y: string, m: string) => `/month/${y}/${m}/food` },
  { label: "Активність", href: (y: string, m: string) => `/month/${y}/${m}/activity` },
  { label: "Підсумки",   href: (y: string, m: string) => `/month/${y}/${m}/conclusion` },
];

const ACTIVITY_TYPES: { key: ActivityType; label: string; emoji: string; color: string }[] = [
  { key: "cardio",   label: "Кардіо",    emoji: "🏃", color: "#f87171" },
  { key: "strength", label: "Силова",    emoji: "💪", color: "#fb923c" },
  { key: "yoga",     label: "Йога",      emoji: "🧘", color: "#c084fc" },
  { key: "walk",     label: "Прогулянка",emoji: "🚶", color: "#4ade80" },
  { key: "sport",    label: "Спорт",     emoji: "⚽", color: "#60a5fa" },
  { key: "other",    label: "Інше",      emoji: "✨", color: "#9ca3af" },
];

function typeInfo(key: ActivityType) {
  return ACTIVITY_TYPES.find(t => t.key === key) ?? ACTIVITY_TYPES[ACTIVITY_TYPES.length - 1];
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

interface DayRow {
  day: number;
  weekday: number;
  activity: DayActivity;
  hasData: boolean;
  totalMinutes: number;
}

interface Props { params: Promise<{ year: string; month: string }> }

export default function MonthActivityPage({ params }: Props) {
  const { year: yearStr, month: monthStr } = use(params);
  const year  = parseInt(yearStr);
  const month = parseInt(monthStr);
  const monthIdx = month - 1;
  const color = MONTH_COLORS[monthIdx];
  const days  = daysInMonth(year, month);

  const [rows, setRows]   = useState<DayRow[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const built: DayRow[] = [];
    for (let d = 1; d <= days; d++) {
      const dateStr = `${yearStr}-${monthStr}-${String(d).padStart(2, "0")}`;
      const activity = getDayActivity(dateStr);
      const hasData = activity.entries.length > 0;
      const totalMinutes = activity.entries.reduce((s, e) => s + e.duration, 0);
      built.push({ day: d, weekday: new Date(year, month - 1, d).getDay(), activity, hasData, totalMinutes });
    }
    setRows(built);
  }, [year, month, days, yearStr, monthStr]);

  // ── CSV export ──────────────────────────────────────────────────────────────
  function downloadCSV() {
    const headers = [
      "Дата", "День тижня",
      "Тренувань", "Всього хвилин",
      "Кардіо", "Силова", "Йога", "Прогулянка", "Спорт", "Інше",
      "Деталі", "Нотатки",
    ];

    const data = rows.map(r => {
      const countByType = (type: ActivityType) =>
        r.activity.entries.filter(e => e.type === type).length;
      const details = r.activity.entries
        .map(e => `${typeInfo(e.type).emoji}${e.name}${e.duration ? ` (${e.duration}хв)` : ""}`)
        .join("; ");
      return [
        `${String(r.day).padStart(2,"0")}.${monthStr}.${yearStr}`,
        DAYS_UA_FULL[r.weekday],
        String(r.activity.entries.length),
        String(r.totalMinutes),
        String(countByType("cardio")),
        String(countByType("strength")),
        String(countByType("yoga")),
        String(countByType("walk")),
        String(countByType("sport")),
        String(countByType("other")),
        details || "—",
        r.activity.generalNote.replace(/\n/g, " ") || "",
      ];
    });

    const csv = [headers, ...data]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `активність-${yearStr}-${monthStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filledRows     = rows.filter(r => r.hasData);
  const displayRows    = showAll ? rows : filledRows;
  const totalMinutes   = rows.reduce((s, r) => s + r.totalMinutes, 0);
  const totalSessions  = rows.reduce((s, r) => s + r.activity.entries.length, 0);
  const daysWithData   = filledRows.length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingLeft: 28 }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.25rem", fontSize: "0.82rem", color: "var(--muted)", fontFamily: "var(--font-body)" }}>
          <Link href="/" style={{ color: "var(--muted)", textDecoration: "none" }}>Щоденник</Link>
          <span>›</span>
          <Link href={`/month/${yearStr}/${monthStr}`} style={{ color: "var(--muted)", textDecoration: "none" }}>{MONTHS_UA[monthIdx]} {yearStr}</Link>
          <span>›</span>
          <span style={{ color: "#60a5fa" }}>Активність</span>
        </div>

        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg,var(--surface) 0%,var(--surface2) 100%)",
          border: `1px solid ${color}55`, borderRadius: 14, padding: "1.5rem",
          marginBottom: "1rem", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(to right,#60a5fa,#818cf8)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 6, flexWrap: "wrap", gap: 14 }}>
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--muted)", fontFamily: "var(--font-body)", letterSpacing: "0.1em", marginBottom: 4 }}>
                {monthStr} · {yearStr}
              </div>
              <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2.4rem", fontWeight: 700, color: "#60a5fa", margin: 0, lineHeight: 1 }}>
                Фізична активність
              </h1>
              <p style={{ fontFamily: "var(--font-body)", fontStyle: "italic", color: "var(--muted)", fontSize: "0.82rem", margin: "6px 0 0" }}>
                {daysWithData} {daysWithData === 1 ? "активний день" : daysWithData < 5 ? "активних дні" : "активних днів"}
                {totalMinutes > 0 && ` · ${totalMinutes} хвилин загалом`}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => setShowAll(v => !v)}
                style={{
                  padding: "7px 14px", borderRadius: 8,
                  border: "1px solid var(--border)", background: "var(--surface2)",
                  color: "var(--muted)", cursor: "pointer", fontSize: "0.8rem",
                  fontFamily: "var(--font-body)",
                }}
              >
                {showAll ? "Лише із записами" : "Всі дні"}
              </button>
              <button
                onClick={downloadCSV}
                style={{
                  padding: "7px 18px", borderRadius: 8,
                  border: "1px solid #60a5fa", background: "#60a5fa22",
                  color: "#60a5fa", cursor: "pointer", fontSize: "0.85rem",
                  fontWeight: 700, fontFamily: "var(--font-body)",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                &#8659; Завантажити CSV
              </button>
            </div>
          </div>
        </div>

        {/* Nav tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: "1.25rem", flexWrap: "wrap" }}>
          {NAV.map(n => {
            const active = n.label === "Активність";
            return (
              <Link key={n.label} href={n.href(yearStr, monthStr)} style={{ textDecoration: "none" }}>
                <span style={{
                  display: "inline-block", padding: "5px 14px", borderRadius: 8,
                  fontSize: "0.8rem", fontFamily: "var(--font-body)",
                  background: active ? "#60a5fa22" : "var(--surface)",
                  color: active ? "#60a5fa" : "var(--muted)",
                  border: `1px solid ${active ? "#60a5fa66" : "var(--border)"}`,
                  fontWeight: active ? 600 : 400,
                }}>
                  {n.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Stats cards */}
        {daysWithData > 0 && (
          <div style={{ display: "flex", gap: 10, marginBottom: "1.25rem", flexWrap: "wrap" }}>
            <div style={{ padding: "8px 16px", borderRadius: 10, background: "#60a5fa12", border: "1px solid #60a5fa33", textAlign: "center", minWidth: 80 }}>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.3rem", fontWeight: 700, color: "#60a5fa" }}>{totalSessions}</div>
              <div style={{ fontSize: "0.68rem", color: "var(--muted)", fontFamily: "var(--font-body)" }}>тренувань</div>
            </div>
            <div style={{ padding: "8px 16px", borderRadius: 10, background: "#818cf812", border: "1px solid #818cf833", textAlign: "center", minWidth: 80 }}>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.3rem", fontWeight: 700, color: "#818cf8" }}>{totalMinutes}</div>
              <div style={{ fontSize: "0.68rem", color: "var(--muted)", fontFamily: "var(--font-body)" }}>хвилин</div>
            </div>
            {ACTIVITY_TYPES.map(t => {
              const count = rows.reduce((s, r) => s + r.activity.entries.filter(e => e.type === t.key).length, 0);
              if (count === 0) return null;
              return (
                <div key={t.key} style={{ padding: "8px 16px", borderRadius: 10, background: `${t.color}12`, border: `1px solid ${t.color}33`, textAlign: "center", minWidth: 80 }}>
                  <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.3rem", fontWeight: 700, color: t.color }}>{count}</div>
                  <div style={{ fontSize: "0.68rem", color: "var(--muted)", fontFamily: "var(--font-body)" }}>{t.emoji} {t.label.toLowerCase()}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Table */}
        {displayRows.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--muted)", fontFamily: "var(--font-heading)", fontSize: "1.2rem", padding: "3rem 0" }}>
            Записів про активність ще немає
          </div>
        ) : (
          <div style={{ overflowX: "auto", borderRadius: 14, border: "1px solid var(--border)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-body)" }}>
              <thead>
                <tr style={{ background: "var(--surface2)" }}>
                  {["День","","Тренувань","Хвилин","Активності","Нотатки"].map((h, i) => (
                    <th key={i} style={{
                      padding: i === 0 ? "10px 8px 10px 16px" : "10px 10px",
                      textAlign: "left",
                      fontSize: "0.72rem", fontWeight: 700,
                      color: "var(--muted)", textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      borderBottom: "1px solid var(--border)",
                      whiteSpace: "nowrap",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayRows.map((row, idx) => {
                  const isWeekend = row.weekday === 0 || row.weekday === 6;
                  const isEven = idx % 2 === 0;
                  return (
                    <tr key={row.day} style={{
                      background: !row.hasData
                        ? "transparent"
                        : isEven ? "var(--surface)" : "var(--surface2)",
                      opacity: row.hasData ? 1 : 0.4,
                    }}>
                      {/* Day */}
                      <td style={{ padding: "9px 8px 9px 16px", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>
                        <Link href={`/day/${yearStr}-${monthStr}-${String(row.day).padStart(2,"0")}/activity`} style={{ textDecoration: "none" }}>
                          <span style={{ fontFamily: "var(--font-heading)", fontSize: "1.05rem", fontWeight: 700, color: isWeekend ? "#f87171" : "var(--accent2)" }}>
                            {String(row.day).padStart(2,"0")}
                          </span>
                        </Link>
                      </td>
                      {/* Weekday */}
                      <td style={{ padding: "9px 10px", borderBottom: "1px solid var(--border)", fontSize: "0.72rem", color: isWeekend ? "#f87171" : "var(--muted)", whiteSpace: "nowrap" }}>
                        {DAYS_UA[row.weekday]}
                      </td>
                      {/* Count */}
                      <td style={{ padding: "9px 10px", borderBottom: "1px solid var(--border)", textAlign: "center" }}>
                        {row.activity.entries.length > 0 ? (
                          <span style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "#60a5fa", fontWeight: 600 }}>
                            {row.activity.entries.length}
                          </span>
                        ) : <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>—</span>}
                      </td>
                      {/* Minutes */}
                      <td style={{ padding: "9px 10px", borderBottom: "1px solid var(--border)", textAlign: "center" }}>
                        {row.totalMinutes > 0 ? (
                          <span style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "#818cf8", fontWeight: 600 }}>
                            {row.totalMinutes}
                          </span>
                        ) : <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>—</span>}
                      </td>
                      {/* Entries chips */}
                      <td style={{ padding: "9px 10px", borderBottom: "1px solid var(--border)", maxWidth: 280 }}>
                        {row.activity.entries.length > 0 ? (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                            {row.activity.entries.map(e => {
                              const info = typeInfo(e.type);
                              return (
                                <span key={e.id} style={{
                                  display: "inline-block", padding: "1px 7px", borderRadius: 4,
                                  fontSize: "0.73rem",
                                  background: `${info.color}15`,
                                  color: info.color,
                                  border: `1px solid ${info.color}33`,
                                  whiteSpace: "nowrap",
                                }}>
                                  {info.emoji} {e.name}{e.duration ? ` · ${e.duration}хв` : ""}
                                </span>
                              );
                            })}
                          </div>
                        ) : "—"}
                      </td>
                      {/* Notes */}
                      <td style={{ padding: "9px 12px", borderBottom: "1px solid var(--border)", fontSize: "0.78rem", color: "var(--muted)", maxWidth: 200 }}>
                        {row.activity.generalNote ? (
                          <span style={{ fontStyle: "italic" }}>
                            {row.activity.generalNote.slice(0, 80)}{row.activity.generalNote.length > 80 ? "…" : ""}
                          </span>
                        ) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {daysWithData > 0 && (
                <tfoot>
                  <tr style={{ background: "var(--surface2)" }}>
                    <td colSpan={2} style={{
                      padding: "9px 10px 9px 16px",
                      fontSize: "0.72rem", fontWeight: 700,
                      color: "var(--muted)", letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}>
                      Всього за місяць
                    </td>
                    <td style={{ padding: "9px 10px", textAlign: "center", fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700, color: "#60a5fa" }}>
                      {totalSessions}
                    </td>
                    <td style={{ padding: "9px 10px", textAlign: "center", fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700, color: "#818cf8" }}>
                      {totalMinutes}
                    </td>
                    <td colSpan={2} style={{ padding: "9px 10px", fontSize: "0.78rem", color: "var(--muted)" }}>
                      {daysWithData} {daysWithData < 5 ? "активних дні" : "активних днів"}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
