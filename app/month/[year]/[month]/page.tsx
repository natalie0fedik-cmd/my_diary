"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { hasDayData, getImportantDates, toggleImportantDate } from "@/lib/storage";

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

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayWeekday(year: number, month: number) {
  const d = new Date(year, month - 1, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

interface Props {
  params: Promise<{ year: string; month: string }>;
}

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

  useEffect(() => {
    const filled = new Set<number>();
    for (let d = 1; d <= daysCount; d++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      if (hasDayData(dateStr)) filled.add(d);
    }
    setFilledDays(filled);
    setImportantDays(getImportantDates(monthKey));
  }, [year, month, daysCount, monthKey]);

  const handleToggleImportant = useCallback((e: React.MouseEvent, day: number) => {
    e.preventDefault();
    e.stopPropagation();
    toggleImportantDate(monthKey, day);
    setImportantDays(prev => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  }, [monthKey]);

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysCount }, (_, i) => i + 1),
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingLeft: 28 }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* Breadcrumb */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          marginBottom: "1.5rem", fontSize: "0.82rem",
          color: "var(--muted)", fontFamily: "'Lora', Georgia, serif",
        }}>
          <Link href="/" style={{ color: "var(--muted)", textDecoration: "none" }}>Щоденник</Link>
          <span>›</span>
          <span style={{ color: "var(--accent2)" }}>{MONTHS_UA[monthIdx]} {year}</span>
        </div>

        {/* Month header */}
        <div style={{
          background: "linear-gradient(135deg, var(--surface) 0%, var(--surface2) 100%)",
          border: `1px solid ${color}55`,
          borderRadius: 14,
          padding: "1.5rem",
          marginBottom: "1.25rem",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0,
            height: 4, background: `linear-gradient(to right, ${color}, ${color}88)`,
          }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 6, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{
                fontSize: "0.7rem", color: "var(--muted)",
                fontFamily: "'Lora', Georgia, serif",
                letterSpacing: "0.1em", marginBottom: 4,
              }}>
                {String(month).padStart(2, "0")} · {year}
              </div>
              <h1 style={{
                fontFamily: "'Caveat', cursive",
                fontSize: "2.4rem", fontWeight: 700,
                color: color, margin: 0, lineHeight: 1,
              }}>
                {MONTHS_UA[monthIdx]}
              </h1>
              <p style={{
                fontFamily: "'Lora', Georgia, serif",
                fontStyle: "italic",
                color: "var(--muted)", fontSize: "0.82rem", margin: "6px 0 0",
              }}>
                {daysCount} днів · {importantDays.size > 0 ? `${importantDays.size} важливих` : "немає важливих дат"}
              </p>
            </div>
            <Link
              href={`/month/${year}/${monthStr}/conclusion`}
              style={{
                padding: "8px 16px",
                background: `${color}18`,
                border: `1px solid ${color}66`,
                borderRadius: 8,
                color: color,
                fontSize: "0.82rem",
                fontWeight: 600,
                textDecoration: "none",
                fontFamily: "'Lora', Georgia, serif",
                alignSelf: "flex-start",
              }}
            >
              Підсумки →
            </Link>
          </div>
        </div>

        {/* Legend */}
        <div style={{
          display: "flex", gap: 16, marginBottom: "0.75rem",
          fontSize: "0.72rem", color: "var(--muted)",
          fontFamily: "'Lora', Georgia, serif", fontStyle: "italic",
          paddingLeft: 4,
        }}>
          <span>Клік — відкрити день</span>
          <span style={{ color: "var(--important)" }}>&#9733; — позначити важливу дату</span>
        </div>

        {/* Calendar */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "1.25rem",
          marginBottom: "1.25rem",
        }}>
          {/* Weekday headers */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 4,
            marginBottom: 8,
          }}>
            {DAYS_UA.map((day, i) => (
              <div key={i} style={{
                textAlign: "center",
                fontFamily: "'Lora', Georgia, serif",
                fontSize: "0.72rem",
                fontWeight: 600,
                color: i >= 5 ? "#f87171" : "var(--muted)",
                padding: "4px 0",
                letterSpacing: "0.05em",
              }}>
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 4,
          }}>
            {cells.map((day, i) => {
              if (day === null) {
                return <div key={`e-${i}`} />;
              }
              const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isToday = isCurrentMonth && day === todayDay;
              const isFilled = filledDays.has(day);
              const isImportant = importantDays.has(day);
              const colIdx = (firstWeekday + day - 1) % 7;
              const isWeekend = colIdx >= 5;

              return (
                <div key={day} style={{ position: "relative" }}>
                  <Link href={`/day/${dateStr}`} style={{ textDecoration: "none", display: "block" }}>
                    <div
                      style={{
                        aspectRatio: "1",
                        borderRadius: 8,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        fontWeight: isToday ? 700 : 400,
                        fontFamily: "'Lora', Georgia, serif",
                        background: isImportant
                          ? "#f6c54722"
                          : isToday
                          ? color
                          : isFilled
                          ? `${color}18`
                          : "transparent",
                        color: isToday
                          ? "#051208"
                          : isImportant
                          ? "#f6c547"
                          : isWeekend
                          ? "#f87171"
                          : "var(--text)",
                        border: `1px solid ${
                          isImportant
                            ? "#f6c54766"
                            : isToday
                            ? color
                            : isFilled
                            ? `${color}55`
                            : "transparent"
                        }`,
                        transition: "background 0.12s, border-color 0.12s",
                        position: "relative",
                        paddingTop: isImportant ? 8 : 0,
                      }}
                      onMouseEnter={e => {
                        if (!isToday) {
                          (e.currentTarget as HTMLDivElement).style.background = isImportant ? "#f6c54733" : `${color}28`;
                          (e.currentTarget as HTMLDivElement).style.borderColor = isImportant ? "#f6c547aa" : `${color}88`;
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isToday) {
                          (e.currentTarget as HTMLDivElement).style.background = isImportant ? "#f6c54722" : isFilled ? `${color}18` : "transparent";
                          (e.currentTarget as HTMLDivElement).style.borderColor = isImportant ? "#f6c54766" : isFilled ? `${color}55` : "transparent";
                        }
                      }}
                    >
                      {day}
                      {isFilled && !isToday && !isImportant && (
                        <div style={{
                          position: "absolute", bottom: 4,
                          width: 4, height: 4, borderRadius: "50%",
                          background: color, opacity: 0.8,
                        }} />
                      )}
                    </div>
                  </Link>

                  {/* Star button for important date */}
                  <button
                    onClick={(e) => handleToggleImportant(e, day)}
                    title={isImportant ? "Прибрати позначку" : "Позначити важливу дату"}
                    style={{
                      position: "absolute",
                      top: 2, right: 2,
                      width: 14, height: 14,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      fontSize: "0.6rem",
                      lineHeight: 1,
                      color: isImportant ? "#f6c547" : "transparent",
                      transition: "color 0.1s",
                      zIndex: 2,
                    }}
                    onMouseEnter={e => {
                      if (!isImportant) (e.currentTarget as HTMLButtonElement).style.color = "#f6c54788";
                    }}
                    onMouseLeave={e => {
                      if (!isImportant) (e.currentTarget as HTMLButtonElement).style.color = "transparent";
                    }}
                  >
                    &#9733;
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Important dates summary */}
        {importantDays.size > 0 && (
          <div style={{
            background: "#f6c54710",
            border: "1px solid #f6c54733",
            borderRadius: 12,
            padding: "1rem 1.25rem",
            marginBottom: "1.25rem",
          }}>
            <h3 style={{
              fontFamily: "'Caveat', cursive",
              fontSize: "1.1rem",
              color: "#f6c547",
              margin: "0 0 10px",
            }}>
              Важливі дати
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {[...importantDays].sort((a, b) => a - b).map(day => {
                const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                return (
                  <Link key={day} href={`/day/${dateStr}`} style={{ textDecoration: "none" }}>
                    <span style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      borderRadius: 7,
                      fontSize: "0.8rem",
                      background: "#f6c54720",
                      color: "#f6c547",
                      border: "1px solid #f6c54744",
                      fontFamily: "'Lora', Georgia, serif",
                      cursor: "pointer",
                    }}>
                      &#9733; {day} {MONTHS_UA[monthIdx].toLowerCase()}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick nav */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "1.25rem",
        }}>
          <h2 style={{
            fontFamily: "'Caveat', cursive",
            fontSize: "1.1rem", fontWeight: 600,
            color: "var(--muted)", margin: "0 0 12px",
          }}>
            Швидкий перехід
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {Array.from({ length: daysCount }, (_, i) => i + 1).map(day => {
              const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isToday = isCurrentMonth && day === todayDay;
              const isFilled = filledDays.has(day);
              const isImportant = importantDays.has(day);
              return (
                <Link key={day} href={`/day/${dateStr}`} style={{ textDecoration: "none" }}>
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                    padding: "4px 9px",
                    borderRadius: 7,
                    fontSize: "0.8rem",
                    fontFamily: "'Lora', Georgia, serif",
                    fontWeight: isToday ? 700 : 400,
                    background: isToday ? color : isImportant ? "#f6c54720" : isFilled ? `${color}18` : "var(--surface2)",
                    color: isToday ? "#051208" : isImportant ? "#f6c547" : isFilled ? color : "var(--muted)",
                    border: `1px solid ${isToday ? color : isImportant ? "#f6c54744" : isFilled ? `${color}44` : "transparent"}`,
                    cursor: "pointer",
                  }}>
                    {isImportant && <span style={{ fontSize: "0.55rem" }}>&#9733;</span>}
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
