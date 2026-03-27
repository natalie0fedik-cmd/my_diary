"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { hasDayData, getImportantDates, toggleImportantDate, getMonthGoals, getBudgetPlan, getDayData } from "@/lib/storage";

const MONTHS_UA = [
  "Січень", "Лютий", "Березень", "Квітень",
  "Травень", "Червень", "Липень", "Серпень",
  "Вересень", "Жовтень", "Листопад", "Грудень",
];

const DAYS_UA = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

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

const MOOD_COLORS = ["", "#f87171", "#fb923c", "#fbbf24", "#4ade80", "#22c55e"];
const MOOD_LABELS = ["", "Погано", "Нижче норми", "Нормально", "Добре", "Відмінно"];

function MoodChart({ moodData, daysCount }: { moodData: Record<number, number>; daysCount: number }) {
  const days = Array.from({ length: daysCount }, (_, i) => i + 1);
  const filled = days.filter(d => moodData[d]);
  if (filled.length < 2) return null;
  const W = 520, H = 70, PAD = 12;
  const slotW = W / daysCount;
  // Line chart points
  const pts = days.map(d => ({
    d, mood: moodData[d] ?? null,
    x: (d - 1) * slotW + slotW / 2,
    y: moodData[d] ? PAD + (H - PAD) * (1 - (moodData[d] - 1) / 4) : null,
  })).filter(p => p.y !== null) as { d: number; mood: number; x: number; y: number }[];
  const polyline = pts.map(p => `${p.x},${p.y}`).join(" ");
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "var(--muted)", margin: 0 }}>Настрій місяця</h3>
        <div style={{ display: "flex", gap: 6 }}>
          {[1,2,3,4,5].map(v => (
            <span key={v} style={{ fontSize: "0.65rem", color: MOOD_COLORS[v], fontFamily: "var(--font-body)" }}>{v}–{MOOD_LABELS[v].split(" ")[0]}</span>
          ))}
        </div>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H + PAD}`} style={{ display: "block", overflow: "visible" }}>
        {/* Grid lines */}
        {[1,2,3,4,5].map(v => {
          const y = PAD + (H - PAD) * (1 - (v - 1) / 4);
          return <line key={v} x1={0} y1={y} x2={W} y2={y} stroke="var(--border)" strokeWidth={0.5} strokeDasharray={v === 3 ? "none" : "3 3"} />;
        })}
        {/* Line */}
        <polyline points={polyline} fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {/* Dots */}
        {pts.map(p => (
          <circle key={p.d} cx={p.x} cy={p.y} r={3.5} fill={MOOD_COLORS[p.mood]} stroke="var(--surface)" strokeWidth={1.5} />
        ))}
        {/* Week separators */}
        {Array.from({ length: Math.ceil(daysCount / 7) }, (_, i) => (i + 1) * 7).filter(d => d < daysCount).map(d => (
          <line key={d} x1={d * slotW} y1={PAD} x2={d * slotW} y2={H} stroke="var(--border)" strokeWidth={0.5} />
        ))}
        {/* Day labels every 7 days */}
        {[1, 8, 15, 22, 29].filter(d => d <= daysCount).map(d => (
          <text key={d} x={(d - 1) * slotW + slotW / 2} y={H + PAD} textAnchor="middle" fontSize={8} fill="var(--muted)" fontFamily="inherit">{d}</text>
        ))}
      </svg>
    </div>
  );
}

interface Props { params: Promise<{ year: string; month: string }> }

export default function MonthPage({ params }: Props) {
  const { year: yearStr, month: monthStr } = use(params);
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);
  const monthIdx = month - 1;
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
  const [moodData, setMoodData] = useState<Record<number, number>>({});

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
    // mood
    const mood: Record<number, number> = {};
    for (let d = 1; d <= daysCount; d++) {
      const dateStr = `${year}-${String(month).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
      const dayData = getDayData(dateStr);
      if (dayData.mood) mood[d] = dayData.mood;
    }
    setMoodData(mood);
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
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.25rem", fontSize: "0.82rem", color: "var(--muted)", fontFamily: "var(--font-body)" }}>
          <Link href="/" style={{ color: "var(--muted)", textDecoration: "none" }}>Щоденник</Link>
          <span>›</span>
          <span style={{ color: "var(--accent2)" }}>{MONTHS_UA[monthIdx]} {year}</span>
        </div>

        {/* Month header */}
        <div style={{
          background: "linear-gradient(135deg,var(--surface) 0%,var(--surface2) 100%)",
          border: "1px solid color-mix(in srgb, var(--accent) 33%, transparent)", borderRadius: 14, padding: "1.5rem",
          marginBottom: "1rem", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(to right, var(--accent), color-mix(in srgb, var(--accent) 53%, transparent))" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 6, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--muted)", fontFamily: "var(--font-body)", letterSpacing: "0.1em", marginBottom: 4 }}>
                {String(month).padStart(2,"0")} · {year}
              </div>
              <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2.4rem", fontWeight: 700, color: "var(--accent)", margin: 0, lineHeight: 1 }}>
                {MONTHS_UA[monthIdx]}
              </h1>
              <p style={{ fontFamily: "var(--font-body)", fontStyle: "italic", color: "var(--muted)", fontSize: "0.82rem", margin: "6px 0 0" }}>
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
                    padding: "6px 12px", borderRadius: 8, background: "color-mix(in srgb, var(--accent) 10%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--accent) 33%, transparent)", cursor: "pointer",
                  }}>
                    <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", fontWeight: 700, color: "var(--accent)" }}>{goalsPct}%</div>
                    <div style={{ fontSize: "0.65rem", color: "var(--muted)", fontFamily: "var(--font-body)" }}>цілі</div>
                  </div>
                </Link>
              )}
              {hasBudget && (
                <Link href={`/month/${yearStr}/${monthStr}/budget`} style={{ textDecoration: "none" }}>
                  <div style={{
                    padding: "6px 12px", borderRadius: 8, background: "color-mix(in srgb, var(--accent) 10%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--accent) 33%, transparent)", cursor: "pointer",
                  }}>
                    <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", fontWeight: 700, color: "var(--accent)" }}>грн</div>
                    <div style={{ fontSize: "0.65rem", color: "var(--muted)", fontFamily: "var(--font-body)" }}>бюджет</div>
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
                  fontSize: "0.8rem", fontFamily: "var(--font-body)",
                  background: active ? "color-mix(in srgb, var(--accent) 13%, transparent)" : "var(--surface)",
                  color: active ? "var(--accent)" : "var(--muted)",
                  border: `1px solid ${active ? "color-mix(in srgb, var(--accent) 40%, transparent)" : "var(--border)"}`,
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
          <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontFamily: "var(--font-body)", fontStyle: "italic", marginRight: 4 }}>
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
                fontFamily: "var(--font-body)",
              }}>
                {label}
              </button>
            );
          })}
          {markMode && (
            <span style={{ fontSize: "0.72rem", color: "var(--muted)", fontFamily: "var(--font-body)", fontStyle: "italic" }}>
              — клікніть на день у календарі
            </span>
          )}
          {markMode && (
            <button onClick={() => setMarkMode(null)} style={{
              marginLeft: "auto", padding: "3px 8px", borderRadius: 6,
              border: "1px solid var(--border)", background: "none",
              color: "var(--muted)", cursor: "pointer", fontSize: "0.72rem",
              fontFamily: "var(--font-body)",
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
                textAlign: "center", fontFamily: "var(--font-body)",
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

              if (isToday)      { cellBg = "var(--accent)"; cellColor = "var(--bg)"; cellBorder = "var(--accent)"; }
              else if (isSpecial)  { cellBg = "#f472b622"; cellColor = "#f472b6"; cellBorder = "#f472b666"; }
              else if (isImportant){ cellBg = "#f6c54722"; cellColor = "#f6c547"; cellBorder = "#f6c54766"; }
              else if (isFilled)   { cellBg = "color-mix(in srgb, var(--accent) 10%, transparent)"; cellBorder = "color-mix(in srgb, var(--accent) 33%, transparent)"; }

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
                        fontFamily: "var(--font-body)",
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
                          fontFamily: "var(--font-body)",
                          background: cellBg, color: cellColor,
                          border: `1px solid ${cellBorder}`,
                          transition: "background 0.1s, border-color 0.1s",
                        }}
                        onMouseEnter={e => {
                          if (!isToday) {
                            (e.currentTarget as HTMLDivElement).style.background = "color-mix(in srgb, var(--accent) 17%, transparent)";
                            (e.currentTarget as HTMLDivElement).style.borderColor = "color-mix(in srgb, var(--accent) 53%, transparent)";
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
                          <div style={{ position: "absolute", bottom: 4, width: 4, height: 4, borderRadius: "50%", background: "var(--accent)", opacity: 0.8 }} />
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

        {/* Mood chart */}
        <MoodChart moodData={moodData} daysCount={daysCount} />

        {/* Marked days summary */}
        {(importantDays.size > 0 || specialDays.size > 0) && (
          <div style={{ display: "grid", gridTemplateColumns: specialDays.size > 0 && importantDays.size > 0 ? "1fr 1fr" : "1fr", gap: 10, marginBottom: "1rem" }}>
            {importantDays.size > 0 && (
              <div style={{ background: "#f6c54710", border: "1px solid #f6c54733", borderRadius: 12, padding: "0.9rem 1.1rem" }}>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "#f6c547", margin: "0 0 8px" }}>Важливі дати ★</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {[...importantDays].sort((a,b)=>a-b).map(day => {
                    const ds = `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                    return (
                      <Link key={day} href={`/day/${ds}`} style={{ textDecoration: "none" }}>
                        <span style={{ display:"inline-block", padding:"3px 8px", borderRadius:6, fontSize:"0.78rem", background:"#f6c54720", color:"#f6c547", border:"1px solid #f6c54744", fontFamily:"var(--font-body)", cursor:"pointer" }}>
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
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "#f472b6", margin: "0 0 8px" }}>Особливі дні ♥</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {[...specialDays].sort((a,b)=>a-b).map(day => {
                    const ds = `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                    return (
                      <Link key={day} href={`/day/${ds}`} style={{ textDecoration: "none" }}>
                        <span style={{ display:"inline-block", padding:"3px 8px", borderRadius:6, fontSize:"0.78rem", background:"#f472b620", color:"#f472b6", border:"1px solid #f472b644", fontFamily:"var(--font-body)", cursor:"pointer" }}>
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
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", fontWeight: 600, color: "var(--muted)", margin: "0 0 10px" }}>
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
                    fontFamily: "var(--font-body)", fontWeight: isToday ? 700 : 400,
                    background: isToday ? "var(--accent)" : isSpecial ? "#f472b620" : isImportant ? "#f6c54720" : isFilled ? "color-mix(in srgb, var(--accent) 10%, transparent)" : "var(--surface2)",
                    color: isToday ? "var(--bg)" : isSpecial ? "#f472b6" : isImportant ? "#f6c547" : isFilled ? "var(--accent)" : "var(--muted)",
                    border: `1px solid ${isToday ? "var(--accent)" : isSpecial ? "#f472b644" : isImportant ? "#f6c54744" : isFilled ? "color-mix(in srgb, var(--accent) 27%, transparent)" : "transparent"}`,
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
