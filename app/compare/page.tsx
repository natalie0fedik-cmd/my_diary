"use client";
import { useState } from "react";
import Link from "next/link";
import { getMonthStats, MonthStats } from "@/lib/storage";

const MONTHS_UA = ["Січень","Лютий","Березень","Квітень","Травень","Червень","Липень","Серпень","Вересень","Жовтень","Листопад","Грудень"];

function MonthPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const now = new Date();
  const options: { value: string; label: string }[] = [];
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    options.push({ value: `${y}-${String(m + 1).padStart(2, "0")}`, label: `${MONTHS_UA[m]} ${y}` });
  }
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--accent)",
        borderRadius: 8,
        padding: "8px 12px",
        color: "var(--text)",
        fontSize: 15,
        cursor: "pointer",
      }}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function StatRow({ label, a, b, unit = "", higherIsBetter = true }: {
  label: string;
  a: number | null;
  b: number | null;
  unit?: string;
  higherIsBetter?: boolean;
}) {
  const aVal = a ?? 0;
  const bVal = b ?? 0;
  const aWins = higherIsBetter ? aVal > bVal : aVal < bVal;
  const bWins = higherIsBetter ? bVal > aVal : bVal < aVal;
  const tie = aVal === bVal;

  const fmt = (v: number | null) =>
    v === null ? "—" : Number.isInteger(v) ? v.toLocaleString("uk-UA") : v.toFixed(1);

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr auto 1fr",
      gap: 8,
      alignItems: "center",
      padding: "10px 0",
      borderBottom: "1px solid color-mix(in srgb, var(--text) 12%, transparent)",
    }}>
      <div style={{
        textAlign: "right",
        fontWeight: !tie && aWins ? 700 : 400,
        color: !tie && aWins ? "var(--accent)" : "var(--text)",
        fontSize: 15,
      }}>
        {fmt(a)}{a !== null ? unit : ""}
        {!tie && aWins && " ★"}
      </div>
      <div style={{
        textAlign: "center",
        fontSize: 12,
        color: "color-mix(in srgb, var(--text) 55%, transparent)",
        minWidth: 110,
        padding: "0 6px",
      }}>
        {label}
      </div>
      <div style={{
        textAlign: "left",
        fontWeight: !tie && bWins ? 700 : 400,
        color: !tie && bWins ? "var(--accent)" : "var(--text)",
        fontSize: 15,
      }}>
        {!tie && bWins && "★ "}
        {fmt(b)}{b !== null ? unit : ""}
      </div>
    </div>
  );
}

function monthLabel(key: string) {
  const [y, m] = key.split("-");
  return `${MONTHS_UA[parseInt(m) - 1]} ${y}`;
}

export default function ComparePage() {
  const now = new Date();
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [keyA, setKeyA] = useState(`${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`);
  const [keyB, setKeyB] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
  const [stats, setStats] = useState<{ a: MonthStats | null; b: MonthStats | null }>({ a: null, b: null });
  const [loaded, setLoaded] = useState(false);

  function compare() {
    const [ay, am] = keyA.split("-").map(Number);
    const [by, bm] = keyB.split("-").map(Number);
    setStats({ a: getMonthStats(ay, am), b: getMonthStats(by, bm) });
    setLoaded(true);
  }

  return (
    <div className="page-inner">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
        <Link href="/" style={{ color: "var(--accent)", textDecoration: "none", fontSize: 22 }}>←</Link>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--accent)" }}>Порівняння місяців</h1>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <MonthPicker value={keyA} onChange={setKeyA} />
        <span style={{ color: "color-mix(in srgb, var(--text) 55%, transparent)" }}>vs</span>
        <MonthPicker value={keyB} onChange={setKeyB} />
        <button
          onClick={compare}
          style={{
            background: "var(--accent)",
            color: "#000",
            border: "none",
            borderRadius: 8,
            padding: "9px 20px",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Порівняти
        </button>
      </div>

      {loaded && stats.a && stats.b && (
        <div style={{ background: "var(--surface)", borderRadius: 12, padding: "1rem 1.25rem" }}>
          {/* Header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: 8,
            marginBottom: 8,
          }}>
            <div style={{ textAlign: "right", fontWeight: 700, color: "var(--accent)", fontSize: 14 }}>
              {monthLabel(keyA)}
            </div>
            <div style={{ minWidth: 110 }} />
            <div style={{ textAlign: "left", fontWeight: 700, color: "var(--accent)", fontSize: 14 }}>
              {monthLabel(keyB)}
            </div>
          </div>

          <StatRow
            label="Днів заповнено"
            a={stats.a.daysFilled}
            b={stats.b.daysFilled}
          />
          <StatRow
            label="Середній настрій"
            a={stats.a.avgMood}
            b={stats.b.avgMood}
            unit="/5"
          />
          <StatRow
            label="Всього кроків"
            a={stats.a.totalSteps}
            b={stats.b.totalSteps}
          />
          <StatRow
            label="Вода (склянок)"
            a={stats.a.totalWater}
            b={stats.b.totalWater}
          />
          <StatRow
            label="Цілі виконано %"
            a={stats.a.goalsPct}
            b={stats.b.goalsPct}
            unit="%"
          />
          <StatRow
            label="Доходи"
            a={stats.a.totalIncome}
            b={stats.b.totalIncome}
            unit=" ₴"
          />
          <StatRow
            label="Витрати"
            a={stats.a.totalExpense}
            b={stats.b.totalExpense}
            higherIsBetter={false}
            unit=" ₴"
          />

          {/* Quick links */}
          <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            {[keyA, keyB].map(k => {
              const [y, m] = k.split("-");
              return (
                <Link key={k} href={`/month/${y}/${m}`} style={{
                  fontSize: 13,
                  color: "var(--accent)",
                  textDecoration: "none",
                  border: "1px solid color-mix(in srgb, var(--accent) 40%, transparent)",
                  borderRadius: 6,
                  padding: "4px 10px",
                }}>
                  → {monthLabel(k)}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {!loaded && (
        <div style={{ textAlign: "center", color: "color-mix(in srgb, var(--text) 45%, transparent)", marginTop: 60, fontSize: 15 }}>
          Оберіть два місяці і натисніть «Порівняти»
        </div>
      )}
    </div>
  );
}
