"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getDayFood } from "@/lib/storage";
import { DayFood, FoodItem } from "@/lib/types";

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
  { label: "Календар",    href: (y: string, m: string) => `/month/${y}/${m}` },
  { label: "Цілі",        href: (y: string, m: string) => `/month/${y}/${m}/goals` },
  { label: "Бюджет",      href: (y: string, m: string) => `/month/${y}/${m}/budget` },
  { label: "Харчування",  href: (y: string, m: string) => `/month/${y}/${m}/food` },
  { label: "Активність",  href: (y: string, m: string) => `/month/${y}/${m}/activity` },
  { label: "Підсумки",    href: (y: string, m: string) => `/month/${y}/${m}/conclusion` },
];

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function joinItems(items: FoodItem[]): string {
  return items.map(i => i.name).join(", ") || "";
}

interface DayRow {
  day: number;
  weekday: number;
  food: DayFood;
  hasData: boolean;
}

interface Props { params: Promise<{ year: string; month: string }> }

export default function MonthFoodPage({ params }: Props) {
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
      const food = getDayFood(dateStr);
      const hasData =
        food.breakfast.length > 0 || food.lunch.length > 0 ||
        food.dinner.length > 0   || food.snacks.length > 0 || food.water > 0;
      built.push({ day: d, weekday: new Date(year, month - 1, d).getDay(), food, hasData });
    }
    setRows(built);
  }, [year, month, days, yearStr, monthStr]);

  // ── CSV export ──────────────────────────────────────────────────────────────
  function downloadCSV() {
    const headers = [
      "Дата", "День тижня",
      "Сніданок", "Обід", "Вечеря", "Перекуси",
      "Вода (склянки)", "Нотатки",
    ];
    const data = rows.map(r => [
      `${String(r.day).padStart(2,"0")}.${monthStr}.${yearStr}`,
      DAYS_UA_FULL[r.weekday],
      joinItems(r.food.breakfast) || "—",
      joinItems(r.food.lunch)     || "—",
      joinItems(r.food.dinner)    || "—",
      joinItems(r.food.snacks)    || "—",
      String(r.food.water),
      r.food.notes.replace(/\n/g, " ") || "",
    ]);

    const csv = [headers, ...data]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    // UTF-8 BOM so Excel opens it correctly
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `харчування-${yearStr}-${monthStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filledRows   = rows.filter(r => r.hasData);
  const displayRows  = showAll ? rows : filledRows;
  const totalWater   = rows.reduce((s, r) => s + r.food.water, 0);
  const daysWithData = filledRows.length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingLeft: 28 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.25rem", fontSize: "0.82rem", color: "var(--muted)", fontFamily: "var(--font-body)" }}>
          <Link href="/" style={{ color: "var(--muted)", textDecoration: "none" }}>Щоденник</Link>
          <span>›</span>
          <Link href={`/month/${yearStr}/${monthStr}`} style={{ color: "var(--muted)", textDecoration: "none" }}>{MONTHS_UA[monthIdx]} {yearStr}</Link>
          <span>›</span>
          <span style={{ color: "var(--accent2)" }}>Харчування</span>
        </div>

        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg,var(--surface) 0%,var(--surface2) 100%)",
          border: `1px solid ${color}55`, borderRadius: 14, padding: "1.5rem",
          marginBottom: "1rem", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(to right,#f6c547,#fb923c)` }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 6, flexWrap: "wrap", gap: 14 }}>
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--muted)", fontFamily: "var(--font-body)", letterSpacing: "0.1em", marginBottom: 4 }}>
                {monthStr} · {yearStr}
              </div>
              <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2.4rem", fontWeight: 700, color: "#f6c547", margin: 0, lineHeight: 1 }}>
                Харчування місяця
              </h1>
              <p style={{ fontFamily: "var(--font-body)", fontStyle: "italic", color: "var(--muted)", fontSize: "0.82rem", margin: "6px 0 0" }}>
                {daysWithData} {daysWithData === 1 ? "день" : daysWithData < 5 ? "дні" : "днів"} із записами
                {totalWater > 0 && ` · ${totalWater} склянок води`}
              </p>
            </div>

            {/* Actions */}
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
                  border: "1px solid #4ade80", background: "#4ade8022",
                  color: "#4ade80", cursor: "pointer", fontSize: "0.85rem",
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
            const active = n.label === "Харчування";
            return (
              <Link key={n.label} href={n.href(yearStr, monthStr)} style={{ textDecoration: "none" }}>
                <span style={{
                  display: "inline-block", padding: "5px 14px", borderRadius: 8,
                  fontSize: "0.8rem", fontFamily: "var(--font-body)",
                  background: active ? "#f6c54722" : "var(--surface)",
                  color: active ? "#f6c547" : "var(--muted)",
                  border: `1px solid ${active ? "#f6c54766" : "var(--border)"}`,
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
            {[
              { label: "Сніданків",  count: rows.filter(r => r.food.breakfast.length > 0).length, color: "#f6c547" },
              { label: "Обідів",     count: rows.filter(r => r.food.lunch.length > 0).length,     color: "#4ade80" },
              { label: "Вечерь",     count: rows.filter(r => r.food.dinner.length > 0).length,    color: "#60a5fa" },
              { label: "Перекусів",  count: rows.filter(r => r.food.snacks.length > 0).length,    color: "#fb923c" },
            ].map(({ label, count, color: c }) => (
              <div key={label} style={{
                padding: "8px 16px", borderRadius: 10,
                background: `${c}12`, border: `1px solid ${c}33`,
                textAlign: "center", minWidth: 80,
              }}>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.3rem", fontWeight: 700, color: c }}>{count}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--muted)", fontFamily: "var(--font-body)" }}>{label}</div>
              </div>
            ))}
            <div style={{
              padding: "8px 16px", borderRadius: 10,
              background: "#60a5fa12", border: "1px solid #60a5fa33",
              textAlign: "center", minWidth: 80,
            }}>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.3rem", fontWeight: 700, color: "#60a5fa" }}>{totalWater}</div>
              <div style={{ fontSize: "0.68rem", color: "var(--muted)", fontFamily: "var(--font-body)" }}>склянок</div>
            </div>
          </div>
        )}

        {/* Table */}
        {displayRows.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--muted)", fontFamily: "var(--font-heading)", fontSize: "1.2rem", padding: "3rem 0" }}>
            Записів про харчування ще немає
          </div>
        ) : (
          <div style={{ overflowX: "auto", borderRadius: 14, border: "1px solid var(--border)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-body)" }}>
              <thead>
                <tr style={{ background: "var(--surface2)" }}>
                  {["День","","Сніданок","Обід","Вечеря","Перекуси","Вода"].map((h, i) => (
                    <th key={i} style={{
                      padding: i === 0 ? "10px 8px 10px 16px" : "10px 10px",
                      textAlign: "left",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: "var(--muted)",
                      textTransform: "uppercase",
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
                    <tr
                      key={row.day}
                      style={{
                        background: !row.hasData
                          ? "transparent"
                          : isEven ? "var(--surface)" : "var(--surface2)",
                        opacity: row.hasData ? 1 : 0.4,
                      }}
                    >
                      {/* Day number */}
                      <td style={{
                        padding: "9px 8px 9px 16px",
                        borderBottom: "1px solid var(--border)",
                        whiteSpace: "nowrap",
                      }}>
                        <Link
                          href={`/day/${yearStr}-${monthStr}-${String(row.day).padStart(2,"0")}/food`}
                          style={{ textDecoration: "none" }}
                        >
                          <span style={{
                            fontFamily: "var(--font-heading)",
                            fontSize: "1.05rem", fontWeight: 700,
                            color: isWeekend ? "#f87171" : "var(--accent2)",
                          }}>
                            {String(row.day).padStart(2,"0")}
                          </span>
                        </Link>
                      </td>

                      {/* Weekday */}
                      <td style={{
                        padding: "9px 10px",
                        borderBottom: "1px solid var(--border)",
                        fontSize: "0.72rem",
                        color: isWeekend ? "#f87171" : "var(--muted)",
                        whiteSpace: "nowrap",
                      }}>
                        {DAYS_UA[row.weekday]}
                      </td>

                      {/* Meals */}
                      {(["breakfast","lunch","dinner","snacks"] as const).map((meal) => {
                        const items = row.food[meal] as FoodItem[];
                        const mealColors: Record<string, string> = {
                          breakfast: "#f6c547", lunch: "#4ade80",
                          dinner: "#60a5fa", snacks: "#fb923c",
                        };
                        return (
                          <td key={meal} style={{
                            padding: "9px 10px",
                            borderBottom: "1px solid var(--border)",
                            fontSize: "0.8rem",
                            color: items.length > 0 ? "var(--text)" : "var(--muted)",
                            fontStyle: items.length === 0 ? "italic" : "normal",
                            maxWidth: 180,
                          }}>
                            {items.length > 0 ? (
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                                {items.map(item => (
                                  <span key={item.id} style={{
                                    display: "inline-block",
                                    padding: "1px 6px",
                                    borderRadius: 4,
                                    fontSize: "0.73rem",
                                    background: `${mealColors[meal]}15`,
                                    color: mealColors[meal],
                                    border: `1px solid ${mealColors[meal]}33`,
                                    whiteSpace: "nowrap",
                                  }}>
                                    {item.name}
                                  </span>
                                ))}
                              </div>
                            ) : "—"}
                          </td>
                        );
                      })}

                      {/* Water */}
                      <td style={{
                        padding: "9px 12px",
                        borderBottom: "1px solid var(--border)",
                        whiteSpace: "nowrap",
                        textAlign: "center",
                      }}>
                        {row.food.water > 0 ? (
                          <span style={{
                            fontFamily: "var(--font-heading)",
                            fontSize: "1rem", color: "#60a5fa", fontWeight: 600,
                          }}>
                            {row.food.water}
                          </span>
                        ) : (
                          <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Totals row */}
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
                    {(["breakfast","lunch","dinner","snacks"] as const).map(meal => {
                      const count = rows.reduce((s,r) => s + (r.food[meal] as FoodItem[]).length, 0);
                      const mealColors: Record<string, string> = {
                        breakfast: "#f6c547", lunch: "#4ade80",
                        dinner: "#60a5fa", snacks: "#fb923c",
                      };
                      return (
                        <td key={meal} style={{
                          padding: "9px 10px",
                          fontSize: "0.8rem", color: mealColors[meal],
                          fontWeight: 600, fontFamily: "var(--font-heading)",
                        }}>
                          {count} позицій
                        </td>
                      );
                    })}
                    <td style={{
                      padding: "9px 12px", textAlign: "center",
                      fontFamily: "var(--font-heading)", fontSize: "1rem",
                      fontWeight: 700, color: "#60a5fa",
                    }}>
                      {totalWater}
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
