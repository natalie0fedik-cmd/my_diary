"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { getDayFood } from "@/lib/storage";
import { DayFood, FoodItem } from "@/lib/types";

const MONTHS_UA = [
  "Січень","Лютий","Березень","Квітень",
  "Травень","Червень","Липень","Серпень",
  "Вересень","Жовтень","Листопад","Грудень",
];
const DAYS_UA = ["Нд","Пн","Вт","Ср","Чт","Пт","Сб"];
const DAYS_UA_FULL = ["Неділя","Понеділок","Вівторок","Середа","Четвер","П'ятниця","Субота"];

const NAV = [
  { label: "Календар",    href: (y: string, m: string) => `/month/${y}/${m}` },
  { label: "Цілі",        href: (y: string, m: string) => `/month/${y}/${m}/goals` },
  { label: "Бюджет",      href: (y: string, m: string) => `/month/${y}/${m}/budget` },
  { label: "Харчування",  href: (y: string, m: string) => `/month/${y}/${m}/food` },
  { label: "Активність",  href: (y: string, m: string) => `/month/${y}/${m}/activity` },
  { label: "Трекер",      href: (y: string, m: string) => `/month/${y}/${m}/habits` },
  { label: "Тіло",        href: (y: string, m: string) => `/month/${y}/${m}/body` },
  { label: "Підсумки",    href: (y: string, m: string) => `/month/${y}/${m}/conclusion` },
];

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function joinItems(items: FoodItem[]): string {
  return items.map(i => i.name).join(", ") || "";
}

function dayCalories(food: DayFood): number {
  return (["breakfast","lunch","dinner","snacks"] as const)
    .flatMap(m => food[m] as FoodItem[])
    .reduce((s, i) => s + (parseFloat(i.calories ?? "") || 0), 0);
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

  // ── XLSX export ─────────────────────────────────────────────────────────────
  function downloadXLSX() {
    const headers = ["Дата","День тижня","Сніданок","Обід","Вечеря","Перекуси","Вода (склянки)","Калорії (ккал)","Нотатки"];
    const dataRows = rows.map(r => {
      const cal = dayCalories(r.food);
      return [
        `${String(r.day).padStart(2,"0")}.${monthStr}.${yearStr}`,
        DAYS_UA_FULL[r.weekday],
        joinItems(r.food.breakfast) || "",
        joinItems(r.food.lunch)     || "",
        joinItems(r.food.dinner)    || "",
        joinItems(r.food.snacks)    || "",
        r.food.water,
        cal > 0 ? cal : "",
        r.food.notes.replace(/\n/g, " ") || "",
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);

    // column widths
    ws["!cols"] = [
      { wch: 12 }, { wch: 14 }, { wch: 30 }, { wch: 30 },
      { wch: 30 }, { wch: 30 }, { wch: 14 }, { wch: 14 }, { wch: 40 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${MONTHS_UA[monthIdx]} ${yearStr}`);
    XLSX.writeFile(wb, `харчування-${yearStr}-${monthStr}.xlsx`);
  }

  const filledRows    = rows.filter(r => r.hasData);
  const displayRows   = showAll ? rows : filledRows;
  const totalWater    = rows.reduce((s, r) => s + r.food.water, 0);
  const daysWithData  = filledRows.length;
  const totalCalories = rows.reduce((s, r) => s + dayCalories(r.food), 0);
  const avgCalories   = daysWithData > 0 ? Math.round(totalCalories / daysWithData) : 0;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
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
          border: "1px solid color-mix(in srgb, var(--accent) 33%, transparent)", borderRadius: 14, padding: "1.5rem",
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
            {totalCalories > 0 && (
              <div style={{
                padding: "8px 16px", borderRadius: 10,
                background: "#fb923c12", border: "1px solid #fb923c33",
                textAlign: "center", minWidth: 80,
              }}>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.3rem", fontWeight: 700, color: "#fb923c" }}>{totalCalories}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--muted)", fontFamily: "var(--font-body)" }}>ккал загалом</div>
              </div>
            )}
            {avgCalories > 0 && (
              <div style={{
                padding: "8px 16px", borderRadius: 10,
                background: "#f6c54712", border: "1px solid #f6c54733",
                textAlign: "center", minWidth: 80,
              }}>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.3rem", fontWeight: 700, color: "#f6c547" }}>~{avgCalories}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--muted)", fontFamily: "var(--font-body)" }}>ккал/день</div>
              </div>
            )}
          </div>
        )}

        {/* Table */}
        {displayRows.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--muted)", fontFamily: "var(--font-heading)", fontSize: "1.2rem", padding: "3rem 0" }}>
            Записів про харчування ще немає
          </div>
        ) : (
          <div style={{ overflowX: "auto", borderRadius: 14, border: "1px solid var(--border)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-body)", minWidth: 680 }}>
              <colgroup>
                <col style={{ width: 52 }} />
                <col style={{ width: 34 }} />
                <col style={{ minWidth: 100 }} />
                <col style={{ minWidth: 100 }} />
                <col style={{ minWidth: 100 }} />
                <col style={{ minWidth: 100 }} />
                <col style={{ width: 58 }} />
                <col style={{ width: 70 }} />
              </colgroup>
              <thead>
                <tr style={{ background: "var(--surface2)" }}>
                  {["День","","Сніданок","Обід","Вечеря","Перекуси","Вода","Калорії"].map((h, i) => (
                    <th key={i} style={{
                      padding: i === 0 ? "10px 8px 10px 16px" : "10px 10px",
                      textAlign: i === 6 || i === 7 ? "center" : "left",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: "var(--muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      borderBottom: "1px solid var(--border)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
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
                            overflow: "hidden",
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
                                    wordBreak: "break-word",
                                    minWidth: 0,
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

                      {/* Calories */}
                      {(() => {
                        const cal = dayCalories(row.food);
                        return (
                          <td style={{
                            padding: "9px 10px",
                            borderBottom: "1px solid var(--border)",
                            whiteSpace: "nowrap",
                            textAlign: "center",
                          }}>
                            {cal > 0 ? (
                              <span style={{
                                fontFamily: "var(--font-heading)",
                                fontSize: "0.9rem", color: "#fb923c", fontWeight: 600,
                              }}>
                                {cal}
                              </span>
                            ) : (
                              <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>—</span>
                            )}
                          </td>
                        );
                      })()}
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
                    <td style={{
                      padding: "9px 10px", textAlign: "center",
                      fontFamily: "var(--font-heading)", fontSize: "1rem",
                      fontWeight: 700, color: "#fb923c",
                    }}>
                      {totalCalories > 0 ? totalCalories : "—"}
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
