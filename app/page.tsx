"use client";

import { useState } from "react";
import Link from "next/link";

const MONTHS_UA = [
  "Січень", "Лютий", "Березень", "Квітень",
  "Травень", "Червень", "Липень", "Серпень",
  "Вересень", "Жовтень", "Листопад", "Грудень",
];

const MONTH_COLORS = [
  "#7c6af7", "#a78bfa", "#60a5fa", "#34d399",
  "#fbbf24", "#f87171", "#fb923c", "#e879f9",
  "#38bdf8", "#4ade80", "#facc15", "#f472b6",
];

export default function Home() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.5rem" }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.5px", margin: 0 }}>
              Мій щоденник
            </h1>
            <p style={{ color: "var(--muted)", marginTop: 4, fontSize: "0.95rem", margin: "4px 0 0" }}>
              Особистий планувальник та щоденник
            </p>
          </div>

          {/* Year switcher */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setYear(y => y - 1)}
              style={{
                width: 36, height: 36, borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--surface)",
                color: "var(--text)", cursor: "pointer",
                fontSize: "1.2rem",
              }}
            >
              ‹
            </button>
            <span style={{ fontSize: "1.4rem", fontWeight: 700, minWidth: 56, textAlign: "center" }}>
              {year}
            </span>
            <button
              onClick={() => setYear(y => y + 1)}
              style={{
                width: 36, height: 36, borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--surface)",
                color: "var(--text)", cursor: "pointer",
                fontSize: "1.2rem",
              }}
            >
              ›
            </button>
          </div>
        </div>

        {/* Months grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
          gap: 14,
        }}>
          {MONTHS_UA.map((name, idx) => {
            const isCurrentMonth = idx === currentMonth && year === currentYear;
            const isPast = year < currentYear || (year === currentYear && idx < currentMonth);
            const color = MONTH_COLORS[idx];
            const monthStr = String(idx + 1).padStart(2, "0");

            return (
              <Link key={idx} href={`/month/${year}/${monthStr}`} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    background: isCurrentMonth ? `${color}22` : "var(--surface)",
                    border: `1px solid ${isCurrentMonth ? color : "var(--border)"}`,
                    borderRadius: 12,
                    padding: "1.2rem",
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.borderColor = color;
                    el.style.background = `${color}18`;
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.borderColor = isCurrentMonth ? color : "var(--border)";
                    el.style.background = isCurrentMonth ? `${color}22` : "var(--surface)";
                  }}
                >
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0,
                    height: 3, background: color,
                    opacity: isCurrentMonth ? 1 : 0.35,
                  }} />

                  <div style={{ marginTop: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginBottom: 4 }}>
                          {monthStr} / {year}
                        </div>
                        <div style={{ fontSize: "1.05rem", fontWeight: 600, color: isCurrentMonth ? color : "var(--text)" }}>
                          {name}
                        </div>
                      </div>
                      {isCurrentMonth && (
                        <span style={{
                          fontSize: "0.62rem", background: color, color: "#fff",
                          borderRadius: 6, padding: "2px 7px", fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}>
                          зараз
                        </span>
                      )}
                      {isPast && !isCurrentMonth && (
                        <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>✓</span>
                      )}
                    </div>

                    <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
                      <span style={{
                        fontSize: "0.68rem", color: "var(--muted)",
                        background: "var(--surface2)", borderRadius: 5,
                        padding: "2px 7px",
                      }}>
                        календар
                      </span>
                      <span style={{
                        fontSize: "0.68rem", color: "var(--muted)",
                        background: "var(--surface2)", borderRadius: 5,
                        padding: "2px 7px",
                      }}>
                        висновки
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div style={{ marginTop: "2rem", textAlign: "center", color: "var(--muted)", fontSize: "0.8rem" }}>
          Оберіть місяць щоб переглянути дні та записи
        </div>
      </div>
    </div>
  );
}
