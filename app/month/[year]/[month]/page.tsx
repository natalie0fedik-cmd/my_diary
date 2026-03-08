"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { hasDayData, getImportantDates, toggleImportantDate, getMonthGoals, getBudgetPlan } from "@/lib/storage";

const MONTHS_UA = [
  "Січень", "Лютий", "Березень", "Квітень",
  "Травень", "Червень", "Липень", "Серпень",
  "Вересень", "Жовтень", "Листопад", "Грудень",
];

const DAYS_UA = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

const MONTH_COLORS = [
  "#4ade80", "#22c55e", "#86efac", "#34d399",
  "#10b981", "#059669", "#4ec564", "#84cc16",
  "#a3e635", "#52c46a", "#16a34a", "#34d399",
];

const NAV = [
  { label: "Календар",   href: (y: string, m: string) => `/month/${y}/${m}` },
  { label: "Цілі",       href: (y: string, m: string) => `/month/${y}/${m}/goals` },
  { label: "Бюджет",     href: (y: string, m: string) => `/month/${y}/${m}/budget` },
  { label: "Харчування", href: (y: string, m: string) => `/month/${y}/${m}/food` },
  { label: "Активність", href: (y: string, m: string) => `/month/${y}/${m}/activity` },
  { label: "Підсумки",   href: (y: string, m: string) => `/month/${y}/${m}/conclusion` },
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}
function getFirstDayWeekday(year: number, month: number) {
  const d = new Date(year, month - 1, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

// Day type picker state — per-day marker type
type DayMark = "important" | "special" | null;

interface Props { params: Promise<{ year: string; month: string }> }

export default function MonthPage({ params }: Props) {
  const { year: yearStr, month: monthStr } = use(params);
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);
  const monthIdx = month - 1;
  const color = MONTH_COLORS[monthIdx];
  const monthKey = `${yearStr}-${monthStr}`;

  const daysCount = getDaysInMonth(year, month);
  const firstWeekday = getFirstDayWeekday(year, month);

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === monthIdx;
  const todayDay = today.getDate();

  const [filledDays, setFilledDays] = useState<Set<number>>(new Set());
  const [importantDays, setImportantDays] = useState<Set<number>>(new Set());
  // special days: stored separately with a prefix "s_" key
  const [specialDays, setSpecialDays] = useState<Set<number>>(new Set());
  const [goalsPct, setGoalsPct] = useState<number | null>(null);
  const [hasBudget, setHasBudget] = useState(false);

  // which mark mode is active for marking
  const [markMode, setMarkMode] = useState<"important" | "special" | null>(null);

  useEffect(() => {
    const filled = new Set<number>();
    for (let d = 1; d <= daysCount; d++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      if (hasDayData(dateStr)) filled.add(d);
    }
    setFilledDays(filled);
    setImportantDays(getImportantDates(monthKey));

    // load special days
    const rawSpecial = localStorage.getItem("diary_special_" + monthKey);
    setSpecialDays(new Set<number>(rawSpecial ? JSON.parse(rawSpecial) : []));

    // goals progress
    const goals = getMonthGoals(monthKey);
    if (goals.goals.length > 0) {
      setGoalsPct(Math.round((goals.goals.filter(g => g.done).length / goals.goals.length) * 100));
    }
    // budget
    const budget = getBudgetPlan(monthKey);
    setHasBudget(budget.entries.length > 0);
  }, [year, month, daysCount, monthKey]);

  const handleToggleImportant = useCallback((e: React.MouseEvent, day: number) => {
    e.preventDefault(); e.stopPropagation();
    toggleImportantDate(monthKey, day);
    setImportantDays(prev => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day); else next.add(day);
      return next;
    });
  }, [monthKey]);

  const handleToggleSpecial = useCallback((e: React.MouseEvent, day: number) => {
    e.preventDefault(); e.stopPropagation();
    setSpecialDays(prev => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day); else next.add(day);
      localStorage.setItem("diary_special_" + monthKey, JSON.stringify([...next]));
      return next;
    });
  }, [monthKey]);

  const handleDayClick = useCallback((e: React.MouseEvent, day: number) => {
    if (markMode === "important") { handleToggleImportant(e, day); return; }
    if (markMode === "special")   { handleToggleSpecial(e, day);   return; }
  }, [markMode, handleToggleImportant, handleToggleSpecial]);

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysCount }, (_, i) => i + 1),
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingLeft: 28 }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.25rem", fontSize: "0.82rem", color: "var(--muted)", fontFamily: "'Lora',Georgia,serif" }}>
          <Link href="/" style={{ color: "var(--muted)", textDecoration: "none" }}>Щоденник</Link>
          <span>›</span>
          <span style={{ color: "var(--accent2)" }}>{MONTHS_UA[monthIdx]} {year}</span>
        </div>

        {/* Month header */}
        <div style={{
          background: "linear-gradient(135deg,var(--surface) 0%,var(--surface2) 100%)",
          border: `1px solid ${color}55`, borderRadius: 14, padding: "1.5rem",
          marginBottom: "1rem", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(to right,${color},${color}88)` }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 6, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--muted)", fontFamily: "'Lora',Georgia,serif", letterSpacing: "0.1em", marginBottom: 4 }}>
                {String(month).padStart(2,"0")} · {year}
              </div>
              <h1 style={{ fontFamily: "'Caveat',cursive", fontSize: "2.4rem", fontWeight: 700, color, margin: 0, lineHeight: 1 }}>
                {MONTHS_UA[monthIdx]}
              </h1>
              <p style={{ fontFamily: "'Lora',Georgia,serif", fontStyle: "italic", color: "var(--muted)", fontSize: "0.82rem", margin: "6px 0 0" }}>
                {daysCount} днів
                {importantDays.size > 0 && ` · ${importantDays.size} важл.`}
                {specialDays.size > 0  && ` · ${specialDays.size} особл.`}
              </p>
            </div>

            {/* Quick stats */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {goalsPct !== null && (
                <Link href={`/month/${yearStr}/${monthStr}/goals`} style={{ textDecoration: "none" }}>
                  <div style={{
                    padding: "6px 12px", borderRadius: 8, background: `${color}18`,
                    border: `1px solid ${color}55`, cursor: "pointer",
                  }}>
                    <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1.1rem", fontWeight: 700, color }}>{goalsPct}%</div>
                    <div style={{ fontSize: "0.65rem", color: "var(--muted)", fontFamily: "'Lora',Georgia,serif" }}>цілі</div>
                  </div>
                </Link>
              )}
              {hasBudget && (
                <Link href={`/month/${yearStr}/${monthStr}/budget`} style={{ textDecoration: "none" }}>
                  <div style={{
                    padding: "6px 12px", borderRadius: 8, background: "#4ade8018",
                    border: "1px solid #4ade8055", cursor: "pointer",
                  }}>
                    <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1.1rem", fontWeight: 700, color: "#4ade80" }}>грн</div>
                    <div style={{ fontSize: "0.65rem", color: "var(--muted)", fontFamily: "'Lora',Georgia,serif" }}>бюджет</div>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Nav tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: "1rem", flexWrap: "wrap" }}>
          {NAV.map(n => {
            const active = n.label === "Календар";
            return (
              <Link key={n.label} href={n.href(yearStr, monthStr)} style={{ textDecoration: "none" }}>
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

        {/* Mark mode toolbar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
          marginBottom: "0.75rem", padding: "8px 12px",
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10,
        }}>
          <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontFamily: "'Lora',Georgia,serif", fontStyle: "italic", marginRight: 4 }}>
            Позначити день:
          </span>
          {[
            { mode: "important" as const, label: "Важливий ★", activeColor: "#f6c547", activeBg: "#f6c54722", activeBorder: "#f6c54766" },
            { mode: "special"   as const, label: "Особливий ♥", activeColor: "#f472b6", activeBg: "#f472b622", activeBorder: "#f472b666" },
          ].map(({ mode, label, activeColor, activeBg, activeBorder }) => {
            const on = markMode === mode;
            return (
              <button key={mode} onClick={() => setMarkMode(on ? null : mode)} style={{
                padding: "4px 12px", borderRadius: 7,
                border: `1px solid ${on ? activeBorder : "var(--border)"}`,
                background: on ? activeBg : "var(--surface2)",
                color: on ? activeColor : "var(--muted)",
                cursor: "pointer", fontSize: "0.78rem", fontWeight: on ? 600 : 400,
                fontFamily: "'Lora',Georgia,serif",
              }}>
                {label}
              </button>
            );
          })}
          {markMode && (
            <span style={{ fontSize: "0.72rem", color: "var(--muted)", fontFamily: "'Lora',Georgia,serif", fontStyle: "italic" }}>
              — клікніть на день у календарі
            </span>
          )}
          {markMode && (
            <button onClick={() => setMarkMode(null)} style={{
              marginLeft: "auto", padding: "3px 8px", borderRadius: 6,
              border: "1px solid var(--border)", background: "none",
              color: "var(--muted)", cursor: "pointer", fontSize: "0.72rem",
              fontFamily: "'Lora',Georgia,serif",
            }}>
              Скасувати
            </button>
          )}
        </div>

        {/* Calendar */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.25rem", marginBottom: "1rem" }}>
          {/* Weekday headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 8 }}>
            {DAYS_UA.map((d, i) => (
              <div key={i} style={{
                textAlign: "center", fontFamily: "'Lora',Georgia,serif",
                fontSize: "0.72rem", fontWeight: 600,
                color: i >= 5 ? "#f87171" : "var(--muted)",
                padding: "4px 0", letterSpacing: "0.05em",
              }}>{d}</div>
            ))}
          </div>

          {/* Days */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
            {cells.map((day, i) => {
              if (day === null) return <div key={`e-${i}`} />;

              const dateStr = `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
              const isToday    = isCurrentMonth && day === todayDay;
              const isFilled   = filledDays.has(day);
              const isImportant = importantDays.has(day);
              const isSpecial  = specialDays.has(day);
              const colIdx = (firstWeekday + day - 1) % 7;
              const isWeekend = colIdx >= 5;

              let cellBg    = "transparent";
              let cellColor = isWeekend ? "#f87171" : "var(--text)";
              let cellBorder= "transparent";

              if (isToday)      { cellBg = color; cellColor = "#051208"; cellBorder = color; }
              else if (isSpecial)  { cellBg = "#f472b622"; cellColor = "#f472b6"; cellBorder = "#f472b666"; }
              else if (isImportant){ cellBg = "#f6c54722"; cellColor = "#f6c547"; cellBorder = "#f6c54766"; }
              else if (isFilled)   { cellBg = `${color}18`; cellBorder = `${color}55`; }

              const clickable = markMode !== null;

              return (
                <div key={day} style={{ position: "relative" }}>
                  {clickable ? (
                    <div
                      onClick={(e) => handleDayClick(e, day)}
                      style={{
                        aspectRatio: "1", borderRadius: 8,
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        cursor: "pointer",
                        fontSize: "0.9rem", fontWeight: isToday ? 700 : 400,
                        fontFamily: "'Lora',Georgia,serif",
                        background: cellBg, color: cellColor,
                        border: `1px solid ${cellBorder}`,
                        outline: `2px solid ${markMode === "important" ? "#f6c54788" : "#f472b688"}`,
                        outlineOffset: -1,
                      }}
                    >
                      {day}
                    </div>
                  ) : (
                    <Link href={`/day/${dateStr}`} style={{ textDecoration: "none", display: "block" }}>
                      <div
                        style={{
                          aspectRatio: "1", borderRadius: 8,
                          display: "flex", flexDirection: "column",
                          alignItems: "center", justifyContent: "center",
                          cursor: "pointer",
                          fontSize: "0.9rem", fontWeight: isToday ? 700 : 400,
                          fontFamily: "'Lora',Georgia,serif",
                          background: cellBg, color: cellColor,
                          border: `1px solid ${cellBorder}`,
                          transition: "background 0.1s, border-color 0.1s",
                        }}
                        onMouseEnter={e => {
                          if (!isToday) {
                            (e.currentTarget as HTMLDivElement).style.background = `${color}28`;
                            (e.currentTarget as HTMLDivElement).style.borderColor = `${color}88`;
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isToday) {
                            (e.currentTarget as HTMLDivElement).style.background = cellBg;
                            (e.currentTarget as HTMLDivElement).style.borderColor = cellBorder;
                          }
                        }}
                      >
                        {day}
                        {isFilled && !isToday && !isImportant && !isSpecial && (
                          <div style={{ position: "absolute", bottom: 4, width: 4, height: 4, borderRadius: "50%", background: color, opacity: 0.8 }} />
                        )}
                      </div>
                    </Link>
                  )}

                  {/* Markers overlay */}
                  {(isImportant || isSpecial) && !isToday && (
                    <div style={{ position: "absolute", top: 2, right: 3, fontSize: "0.55rem", lineHeight: 1, pointerEvents: "none" }}>
                      {isImportant && <span style={{ color: "#f6c547" }}>★</span>}
                      {isSpecial   && <span style={{ color: "#f472b6" }}>♥</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Marked days summary */}
        {(importantDays.size > 0 || specialDays.size > 0) && (
          <div style={{ display: "grid", gridTemplateColumns: specialDays.size > 0 && importantDays.size > 0 ? "1fr 1fr" : "1fr", gap: 10, marginBottom: "1rem" }}>
            {importantDays.size > 0 && (
              <div style={{ background: "#f6c54710", border: "1px solid #f6c54733", borderRadius: 12, padding: "0.9rem 1.1rem" }}>
                <h3 style={{ fontFamily: "'Caveat',cursive", fontSize: "1rem", color: "#f6c547", margin: "0 0 8px" }}>Важливі дати ★</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {[...importantDays].sort((a,b)=>a-b).map(day => {
                    const ds = `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                    return (
                      <Link key={day} href={`/day/${ds}`} style={{ textDecoration: "none" }}>
                        <span style={{ display:"inline-block", padding:"3px 8px", borderRadius:6, fontSize:"0.78rem", background:"#f6c54720", color:"#f6c547", border:"1px solid #f6c54744", fontFamily:"'Lora',Georgia,serif", cursor:"pointer" }}>
                          {day}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
            {specialDays.size > 0 && (
              <div style={{ background: "#f472b610", border: "1px solid #f472b633", borderRadius: 12, padding: "0.9rem 1.1rem" }}>
                <h3 style={{ fontFamily: "'Caveat',cursive", fontSize: "1rem", color: "#f472b6", margin: "0 0 8px" }}>Особливі дні ♥</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {[...specialDays].sort((a,b)=>a-b).map(day => {
                    const ds = `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                    return (
                      <Link key={day} href={`/day/${ds}`} style={{ textDecoration: "none" }}>
                        <span style={{ display:"inline-block", padding:"3px 8px", borderRadius:6, fontSize:"0.78rem", background:"#f472b620", color:"#f472b6", border:"1px solid #f472b644", fontFamily:"'Lora',Georgia,serif", cursor:"pointer" }}>
                          {day}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick nav */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.1rem 1.25rem" }}>
          <h2 style={{ fontFamily: "'Caveat',cursive", fontSize: "1.1rem", fontWeight: 600, color: "var(--muted)", margin: "0 0 10px" }}>
            Швидкий перехід
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {Array.from({ length: daysCount }, (_, i) => i + 1).map(day => {
              const dateStr = `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
              const isToday    = isCurrentMonth && day === todayDay;
              const isFilled   = filledDays.has(day);
              const isImportant = importantDays.has(day);
              const isSpecial  = specialDays.has(day);
              return (
                <Link key={day} href={`/day/${dateStr}`} style={{ textDecoration: "none" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 2,
                    padding: "4px 9px", borderRadius: 7, fontSize: "0.8rem",
                    fontFamily: "'Lora',Georgia,serif", fontWeight: isToday ? 700 : 400,
                    background: isToday ? color : isSpecial ? "#f472b620" : isImportant ? "#f6c54720" : isFilled ? `${color}18` : "var(--surface2)",
                    color: isToday ? "#051208" : isSpecial ? "#f472b6" : isImportant ? "#f6c547" : isFilled ? color : "var(--muted)",
                    border: `1px solid ${isToday ? color : isSpecial ? "#f472b644" : isImportant ? "#f6c54744" : isFilled ? `${color}44` : "transparent"}`,
                    cursor: "pointer",
                  }}>
                    {isImportant && <span style={{ fontSize: "0.5rem" }}>★</span>}
                    {isSpecial   && <span style={{ fontSize: "0.5rem" }}>♥</span>}
                    {day}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
