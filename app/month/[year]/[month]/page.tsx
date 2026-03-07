"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { hasDayData } from "@/lib/storage";

const MONTHS_UA = [
  "Січень", "Лютий", "Березень", "Квітень",
  "Травень", "Червень", "Липень", "Серпень",
  "Вересень", "Жовтень", "Листопад", "Грудень",
];

const DAYS_UA = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

const MONTH_COLORS = [
  "#7c6af7", "#a78bfa", "#60a5fa", "#34d399",
  "#fbbf24", "#f87171", "#fb923c", "#e879f9",
  "#38bdf8", "#4ade80", "#facc15", "#f472b6",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

// Returns weekday index 0=Mon..6=Sun for day 1 of the month
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

  const daysCount = getDaysInMonth(year, month);
  const firstWeekday = getFirstDayWeekday(year, month);

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === monthIdx;
  const todayDay = today.getDate();

  const [filledDays, setFilledDays] = useState<Set<number>>(new Set());

  useEffect(() => {
    const filled = new Set<number>();
    for (let d = 1; d <= daysCount; d++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      if (hasDayData(dateStr)) filled.add(d);
    }
    setFilledDays(filled);
  }, [year, month, daysCount]);

  // Build calendar cells (null = empty slot before first day)
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysCount }, (_, i) => i + 1),
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.5rem", fontSize: "0.85rem", color: "var(--muted)" }}>
          <Link href="/" style={{ color: "var(--muted)", textDecoration: "none" }}>Щоденник</Link>
          <span>›</span>
          <span style={{ color: "var(--text)" }}>{MONTHS_UA[monthIdx]} {year}</span>
        </div>

        {/* Month header */}
        <div style={{
          background: "var(--surface)",
          border: `1px solid ${color}`,
          borderRadius: 14,
          padding: "1.5rem",
          marginBottom: "1.5rem",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0,
            height: 4, background: color,
          }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 4 }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 4 }}>
                {String(month).padStart(2, "0")} / {year}
              </div>
              <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: color, margin: 0 }}>
                {MONTHS_UA[monthIdx]}
              </h1>
              <p style={{ color: "var(--muted)", fontSize: "0.85rem", margin: "6px 0 0" }}>
                {daysCount} днів
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Link
                href={`/month/${year}/${monthStr}/conclusion`}
                style={{
                  padding: "8px 16px",
                  background: `${color}22`,
                  border: `1px solid ${color}`,
                  borderRadius: 8,
                  color: color,
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Висновки місяця →
              </Link>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "1.25rem",
          marginBottom: "1.5rem",
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
                fontSize: "0.75rem",
                fontWeight: 600,
                color: i >= 5 ? "#f472b6" : "var(--muted)",
                padding: "4px 0",
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
              const colIdx = (firstWeekday + day - 1) % 7;
              const isWeekend = colIdx >= 5;

              return (
                <Link key={day} href={`/day/${dateStr}`} style={{ textDecoration: "none" }}>
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
                      background: isToday ? color : isFilled ? `${color}18` : "transparent",
                      color: isToday ? "#fff" : isWeekend ? "#f472b6" : "var(--text)",
                      border: `1px solid ${isToday ? color : isFilled ? `${color}55` : "transparent"}`,
                      transition: "background 0.12s, border-color 0.12s",
                      position: "relative",
                    }}
                    onMouseEnter={e => {
                      if (!isToday) {
                        (e.currentTarget as HTMLDivElement).style.background = `${color}28`;
                        (e.currentTarget as HTMLDivElement).style.borderColor = `${color}88`;
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isToday) {
                        (e.currentTarget as HTMLDivElement).style.background = isFilled ? `${color}18` : "transparent";
                        (e.currentTarget as HTMLDivElement).style.borderColor = isFilled ? `${color}55` : "transparent";
                      }
                    }}
                  >
                    {day}
                    {isFilled && !isToday && (
                      <div style={{
                        position: "absolute",
                        bottom: 4,
                        width: 4, height: 4,
                        borderRadius: "50%",
                        background: color,
                        opacity: 0.8,
                      }} />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick nav */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "1.25rem",
        }}>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--muted)", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Швидкий перехід
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {Array.from({ length: daysCount }, (_, i) => i + 1).map(day => {
              const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isToday = isCurrentMonth && day === todayDay;
              const isFilled = filledDays.has(day);
              return (
                <Link key={day} href={`/day/${dateStr}`} style={{ textDecoration: "none" }}>
                  <span style={{
                    display: "inline-block",
                    padding: "4px 10px",
                    borderRadius: 7,
                    fontSize: "0.82rem",
                    fontWeight: isToday ? 700 : 400,
                    background: isToday ? color : isFilled ? `${color}18` : "var(--surface2)",
                    color: isToday ? "#fff" : isFilled ? color : "var(--muted)",
                    border: `1px solid ${isToday ? color : isFilled ? `${color}44` : "transparent"}`,
                    cursor: "pointer",
                  }}>
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
