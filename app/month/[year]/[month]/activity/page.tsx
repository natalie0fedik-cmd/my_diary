"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { getDayActivity } from "@/lib/storage";
import { DayActivity, ActivityEntry, ActivityType } from "@/lib/types";

const MONTHS_UA = [
  "Січень","Лютий","Березень","Квітень",
  "Травень","Червень","Липень","Серпень",
  "Вересень","Жовтень","Листопад","Грудень",
];
const DAYS_UA = ["Нд","Пн","Вт","Ср","Чт","Пт","Сб"];
const DAYS_UA_FULL = ["Неділя","Понеділок","Вівторок","Середа","Четвер","П'ятниця","Субота"];

const NAV = [
  { label: "Календар",   href: (y: string, m: string) => `/month/${y}/${m}` },
  { label: "Цілі",       href: (y: string, m: string) => `/month/${y}/${m}/goals` },
  { label: "Бюджет",     href: (y: string, m: string) => `/month/${y}/${m}/budget` },
  { label: "Харчування", href: (y: string, m: string) => `/month/${y}/${m}/food` },
  { label: "Активність", href: (y: string, m: string) => `/month/${y}/${m}/activity` },
  { label: "Підсумки",   href: (y: string, m: string) => `/month/${y}/${m}/conclusion` },
];

interface ActivityDef { key: ActivityType; label: string; icon: string; color: string; unit: string }
const ACTIVITY_DEFS: ActivityDef[] = [
  { key: "steps",      label: "Кроки",    icon: "👣", color: "#4ade80", unit: "кроків"  },
  { key: "massage",    label: "Масаж",    icon: "🤲", color: "#c084fc", unit: ""        },
  { key: "exercise",   label: "Зарядка",  icon: "🌅", color: "#fb923c", unit: "хв"     },
  { key: "stretching", label: "Розтяжка", icon: "🙆", color: "#f472b6", unit: "хв"     },
  { key: "stepper",    label: "Степер",   icon: "🪜", color: "#60a5fa", unit: "хв"     },
  { key: "custom",     label: "Своя",     icon: "✦",  color: "#fbbf24", unit: ""        },
];

function actDef(type: ActivityType): ActivityDef {
  return ACTIVITY_DEFS.find(d => d.key === type) ?? ACTIVITY_DEFS[ACTIVITY_DEFS.length - 1];
}

function entryChipLabel(e: ActivityEntry): string {
  const d = actDef(e.type);
  if (e.type === "custom") return `${e.customName ?? "—"}: ${e.value}`;
  if (d.unit) return `${e.value} ${d.unit}`;
  return e.value;
}

function daysInMonth(year: number, month: number) { return new Date(year, month, 0).getDate(); }

interface DayRow {
  day: number; weekday: number; activity: DayActivity; hasData: boolean;
  totalSteps: number; totalMinutes: number;
}

interface Props { params: Promise<{ year: string; month: string }> }

const STEPS_NORM = 8000;

function StepsChart({ rows }: { rows: DayRow[] }) {
  const hasSteps = rows.some(r => r.totalSteps > 0);
  if (!hasSteps) return null;
  const maxSteps = Math.max(...rows.map(r => r.totalSteps), STEPS_NORM * 1.1);
  const maxDay = rows.reduce((best, r) => r.totalSteps > best.totalSteps ? r : best, rows[0]);
  const W = 520, H = 90, PAD = 18;
  const slotW = W / rows.length;
  const barW = Math.max(4, slotW - 3);
  const normY = PAD + (H - PAD) * (1 - STEPS_NORM / maxSteps);
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "var(--muted)", margin: 0 }}>Кроки по днях</h3>
        <span style={{ fontSize: "0.72rem", color: "var(--muted)", fontFamily: "var(--font-body)" }}>норма {STEPS_NORM.toLocaleString()}/день</span>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H + PAD}`} style={{ display: "block", overflow: "visible" }}>
        {/* Norm line */}
        <line x1={0} y1={normY} x2={W} y2={normY} stroke="var(--border)" strokeWidth={1} strokeDasharray="5 3" />
        <text x={W - 2} y={normY - 3} textAnchor="end" fontSize={8} fill="var(--muted)" fontFamily="inherit">8k</text>
        {/* Bars */}
        {rows.map((row, i) => {
          if (!row.totalSteps) return null;
          const barH = ((row.totalSteps / maxSteps) * (H - PAD));
          const x = i * slotW + (slotW - barW) / 2;
          const y = PAD + (H - PAD) - barH;
          const isRecord = row.totalSteps === maxDay.totalSteps && row.totalSteps > 0;
          const metNorm = row.totalSteps >= STEPS_NORM;
          return (
            <g key={row.day}>
              <rect x={x} y={y} width={barW} height={barH}
                fill={isRecord ? "var(--important)" : metNorm ? "var(--accent)" : "color-mix(in srgb, var(--accent) 45%, transparent)"}
                rx={2} />
              {isRecord && (
                <text x={x + barW / 2} y={y - 3} textAnchor="middle" fontSize={8} fill="var(--important)" fontFamily="inherit">★</text>
              )}
            </g>
          );
        })}
        {/* Day labels every 7 days */}
        {rows.filter((_, i) => i % 7 === 0 || i === rows.length - 1).map(row => {
          const i = row.day - 1;
          return (
            <text key={row.day} x={i * slotW + slotW / 2} y={H + PAD} textAnchor="middle" fontSize={8} fill="var(--muted)" fontFamily="inherit">
              {row.day}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

export default function MonthActivityPage({ params }: Props) {
  const { year: yearStr, month: monthStr } = use(params);
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);
  const monthIdx = month - 1;
  const days = daysInMonth(year, month);

  const [rows, setRows] = useState<DayRow[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const built: DayRow[] = [];
    for (let d = 1; d <= days; d++) {
      const dateStr = `${yearStr}-${monthStr}-${String(d).padStart(2, "0")}`;
      const activity = getDayActivity(dateStr);
      const hasData = activity.entries.length > 0;
      const totalSteps = activity.entries
        .filter(e => e.type === "steps")
        .reduce((s, e) => s + (parseInt(e.value) || 0), 0);
      const totalMinutes = activity.entries
        .filter(e => e.type === "exercise" || e.type === "stretching" || e.type === "stepper")
        .reduce((s, e) => s + (parseInt(e.value) || 0), 0);
      built.push({ day: d, weekday: new Date(year, month - 1, d).getDay(), activity, hasData, totalSteps, totalMinutes });
    }
    setRows(built);
  }, [year, month, days, yearStr, monthStr]);

  // ── XLSX export ─────────────────────────────────────────────────────────────
  function downloadXLSX() {
    const headers = [
      "Дата", "День тижня",
      "Кроки", "Зарядка (хв)", "Розтяжка (хв)", "Степер (хв)",
      "Масаж (ділянки)", "Своя активність", "Нотатки",
    ];
    const dataRows = rows.map(r => {
      const byType = (type: ActivityType) => r.activity.entries.filter(e => e.type === type);
      const minutesOf = (type: ActivityType) =>
        byType(type).reduce((s, e) => s + (parseInt(e.value) || 0), 0);
      const totalSteps = byType("steps").reduce((s, e) => s + (parseInt(e.value) || 0), 0);
      const massageParts = byType("massage").map(e => e.value).join(", ");
      const custom = byType("custom").map(e => `${e.customName ?? "?"}: ${e.value}`).join("; ");
      return [
        `${String(r.day).padStart(2,"0")}.${monthStr}.${yearStr}`,
        DAYS_UA_FULL[r.weekday],
        totalSteps > 0 ? totalSteps : "",
        minutesOf("exercise") || "",
        minutesOf("stretching") || "",
        minutesOf("stepper") || "",
        massageParts || "",
        custom || "",
        r.activity.generalNote.replace(/\n/g, " ") || "",
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
    ws["!cols"] = [
      { wch: 12 }, { wch: 14 }, { wch: 10 }, { wch: 14 },
      { wch: 14 }, { wch: 12 }, { wch: 28 }, { wch: 30 }, { wch: 40 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${MONTHS_UA[monthIdx]} ${yearStr}`);
    XLSX.writeFile(wb, `активність-${yearStr}-${monthStr}.xlsx`);
  }

  const filledRows    = rows.filter(r => r.hasData);
  const displayRows   = showAll ? rows : filledRows;
  const daysWithData  = filledRows.length;
  const grandSteps    = rows.reduce((s, r) => s + r.totalSteps, 0);
  const grandMinutes  = rows.reduce((s, r) => s + r.totalMinutes, 0);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1.5rem" }}>

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
          border: "1px solid color-mix(in srgb, var(--accent) 33%, transparent)", borderRadius: 14, padding: "1.5rem",
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
                {daysWithData} {daysWithData < 5 ? "активних дні" : "активних днів"}
                {grandSteps > 0 && ` · ${grandSteps.toLocaleString()} кроків`}
                {grandMinutes > 0 && ` · ${grandMinutes} хв`}
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
                onClick={downloadXLSX}
                style={{
                  padding: "7px 18px", borderRadius: 8,
                  border: "1px solid color-mix(in srgb, var(--accent) 40%, transparent)", background: "color-mix(in srgb, var(--accent) 13%, transparent)",
                  color: "var(--accent)", cursor: "pointer", fontSize: "0.85rem",
                  fontWeight: 700, fontFamily: "var(--font-body)",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                &#8659; Завантажити XLSX
              </button>
            </div>
          </div>
        </div>

        {/* Nav */}
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

        {/* Steps chart */}
        <StepsChart rows={rows} />

        {/* Stats cards */}
        {daysWithData > 0 && (
          <div style={{ display: "flex", gap: 10, marginBottom: "1.25rem", flexWrap: "wrap" }}>
            {[
              { label: "Кроків за місяць", value: grandSteps > 0 ? grandSteps.toLocaleString() : "—", color: "#4ade80" },
              { label: "Хвилин активності", value: grandMinutes > 0 ? String(grandMinutes) : "—", color: "#60a5fa" },
              ...ACTIVITY_DEFS.map(d => ({
                label: d.label,
                value: String(rows.reduce((s, r) => s + r.activity.entries.filter(e => e.type === d.key).length, 0)),
                color: d.color,
                skip: rows.every(r => r.activity.entries.filter(e => e.type === d.key).length === 0),
              })),
            ].filter(c => !("skip" in c && c.skip)).map(c => (
              <div key={c.label} style={{
                padding: "8px 16px", borderRadius: 10,
                background: `${c.color}12`, border: `1px solid ${c.color}33`,
                textAlign: "center", minWidth: 80,
              }}>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", fontWeight: 700, color: c.color }}>{c.value}</div>
                <div style={{ fontSize: "0.65rem", color: "var(--muted)", fontFamily: "var(--font-body)" }}>{c.label}</div>
              </div>
            ))}
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
                  {["День","","👣 Кроки","🌅 Зарядка","🙆 Розтяжка","🪜 Степер","🤲 Масаж","Інша активність"].map((h, i) => (
                    <th key={i} style={{
                      padding: i === 0 ? "10px 8px 10px 16px" : "10px 10px",
                      textAlign: i <= 1 ? "left" : "center",
                      fontSize: "0.7rem", fontWeight: 700,
                      color: "var(--muted)", textTransform: "uppercase",
                      letterSpacing: "0.05em",
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

                  const byType = (type: ActivityType) => row.activity.entries.filter(e => e.type === type);
                  const minutesOf = (type: ActivityType) =>
                    byType(type).reduce((s, e) => s + (parseInt(e.value) || 0), 0);

                  const steps = row.totalSteps;
                  const exerciseMins = minutesOf("exercise");
                  const stretchMins = minutesOf("stretching");
                  const stepperMins = minutesOf("stepper");
                  const massParts = byType("massage").map(e => e.value).join(", ");
                  const customEntries = byType("custom");

                  return (
                    <tr key={row.day} style={{
                      background: !row.hasData ? "transparent" : isEven ? "var(--surface)" : "var(--surface2)",
                      opacity: row.hasData ? 1 : 0.35,
                    }}>
                      {/* Day */}
                      <td style={{ padding: "8px 8px 8px 16px", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>
                        <Link href={`/day/${yearStr}-${monthStr}-${String(row.day).padStart(2,"0")}/activity`} style={{ textDecoration: "none" }}>
                          <span style={{ fontFamily: "var(--font-heading)", fontSize: "1.05rem", fontWeight: 700, color: isWeekend ? "#f87171" : "var(--accent2)" }}>
                            {String(row.day).padStart(2,"0")}
                          </span>
                        </Link>
                      </td>
                      {/* Weekday */}
                      <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", fontSize: "0.72rem", color: isWeekend ? "#f87171" : "var(--muted)", whiteSpace: "nowrap" }}>
                        {DAYS_UA[row.weekday]}
                      </td>
                      {/* Steps */}
                      <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", textAlign: "center" }}>
                        {steps > 0 ? (
                          <span style={{ fontFamily: "var(--font-heading)", fontSize: "0.95rem", color: "#4ade80", fontWeight: 700 }}>
                            {steps.toLocaleString()}
                          </span>
                        ) : <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>—</span>}
                      </td>
                      {/* Exercise */}
                      <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", textAlign: "center" }}>
                        {exerciseMins > 0 ? (
                          <span style={{ fontFamily: "var(--font-heading)", fontSize: "0.95rem", color: "#fb923c", fontWeight: 700 }}>
                            {exerciseMins} хв
                          </span>
                        ) : <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>—</span>}
                      </td>
                      {/* Stretching */}
                      <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", textAlign: "center" }}>
                        {stretchMins > 0 ? (
                          <span style={{ fontFamily: "var(--font-heading)", fontSize: "0.95rem", color: "#f472b6", fontWeight: 700 }}>
                            {stretchMins} хв
                          </span>
                        ) : <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>—</span>}
                      </td>
                      {/* Stepper */}
                      <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", textAlign: "center" }}>
                        {stepperMins > 0 ? (
                          <span style={{ fontFamily: "var(--font-heading)", fontSize: "0.95rem", color: "#60a5fa", fontWeight: 700 }}>
                            {stepperMins} хв
                          </span>
                        ) : <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>—</span>}
                      </td>
                      {/* Massage */}
                      <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", maxWidth: 130 }}>
                        {massParts ? (
                          <span style={{ fontSize: "0.78rem", color: "#c084fc" }}>{massParts}</span>
                        ) : <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>—</span>}
                      </td>
                      {/* Custom */}
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)", maxWidth: 180 }}>
                        {customEntries.length > 0 ? (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                            {customEntries.map(e => (
                              <span key={e.id} style={{
                                display: "inline-block", padding: "1px 7px", borderRadius: 4,
                                fontSize: "0.72rem", background: "#fbbf2415",
                                color: "#fbbf24", border: "1px solid #fbbf2433",
                                whiteSpace: "nowrap",
                              }}>
                                {e.customName}: {e.value}
                              </span>
                            ))}
                          </div>
                        ) : <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>—</span>}
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
                      fontSize: "0.7rem", fontWeight: 700, color: "var(--muted)",
                      letterSpacing: "0.06em", textTransform: "uppercase",
                    }}>
                      Всього
                    </td>
                    <td style={{ padding: "9px 10px", textAlign: "center", fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700, color: "#4ade80" }}>
                      {grandSteps > 0 ? grandSteps.toLocaleString() : "—"}
                    </td>
                    {(["exercise","stretching","stepper"] as ActivityType[]).map(type => {
                      const total = rows.reduce((s, r) => s + r.activity.entries.filter(e => e.type === type).reduce((a, e) => a + (parseInt(e.value) || 0), 0), 0);
                      const c = actDef(type).color;
                      return (
                        <td key={type} style={{ padding: "9px 10px", textAlign: "center", fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700, color: c }}>
                          {total > 0 ? `${total} хв` : "—"}
                        </td>
                      );
                    })}
                    <td colSpan={2} style={{ padding: "9px 10px", fontSize: "0.78rem", color: "var(--muted)" }}>
                      {daysWithData} {daysWithData < 5 ? "дні" : "днів"}
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
