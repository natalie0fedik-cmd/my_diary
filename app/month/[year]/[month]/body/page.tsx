"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getMonthBodySnapshot, saveMonthBodySnapshot, getBodyProfile } from "@/lib/storage";
import { MonthBodySnapshot } from "@/lib/types";

const MONTHS_UA = [
  "Січень", "Лютий", "Березень", "Квітень",
  "Травень", "Червень", "Липень", "Серпень",
  "Вересень", "Жовтень", "Листопад", "Грудень",
];

const NAV = [
  { label: "Календар",   href: (y: string, m: string) => `/month/${y}/${m}` },
  { label: "Цілі",       href: (y: string, m: string) => `/month/${y}/${m}/goals` },
  { label: "Бюджет",     href: (y: string, m: string) => `/month/${y}/${m}/budget` },
  { label: "Харчування", href: (y: string, m: string) => `/month/${y}/${m}/food` },
  { label: "Активність", href: (y: string, m: string) => `/month/${y}/${m}/activity` },
  { label: "Трекер",     href: (y: string, m: string) => `/month/${y}/${m}/habits` },
  { label: "Тіло",       href: (y: string, m: string) => `/month/${y}/${m}/body` },
  { label: "Підсумки",   href: (y: string, m: string) => `/month/${y}/${m}/conclusion` },
];

const MEASUREMENTS: { key: keyof Omit<MonthBodySnapshot, "monthKey" | "note">; label: string; unit: string }[] = [
  { key: "weight",    label: "Вага",         unit: "кг" },
  { key: "chest",     label: "Груди",        unit: "см" },
  { key: "underBust", label: "Підгруддя",    unit: "см" },
  { key: "waist",     label: "Талія",        unit: "см" },
  { key: "belly",     label: "Живіт",        unit: "см" },
  { key: "hips",      label: "Стегна",       unit: "см" },
  { key: "thigh",     label: "Обхват ноги",  unit: "см" },
];

function prevMonthKey(year: number, month: number): string {
  if (month === 1) return `${year - 1}-12`;
  return `${year}-${String(month - 1).padStart(2, "0")}`;
}

function delta(cur?: number, prev?: number): number | null {
  if (cur == null || prev == null || cur === 0 || prev === 0) return null;
  return Math.round((cur - prev) * 10) / 10;
}

const FIELD_STYLE: React.CSSProperties = {
  width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)",
  background: "var(--surface2)", color: "var(--text)", fontFamily: "inherit", fontSize: "0.9rem",
  boxSizing: "border-box",
};

const SECTION_STYLE: React.CSSProperties = {
  background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.25rem",
};

interface Props { params: Promise<{ year: string; month: string }> }

export default function MonthBodyPage({ params }: Props) {
  const { year: yearStr, month: monthStr } = use(params);
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);
  const monthKey = `${yearStr}-${monthStr.padStart(2, "0")}`;

  const [snap, setSnap] = useState<MonthBodySnapshot | null>(null);
  const [prev, setPrev] = useState<MonthBodySnapshot | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const current = getMonthBodySnapshot(monthKey);
    setSnap(current);

    // Previous = last month's snapshot, fallback to global body profile
    const prevKey = prevMonthKey(year, month);
    const prevSnap = getMonthBodySnapshot(prevKey);
    const hasAnyPrevData = MEASUREMENTS.some(m => (prevSnap as unknown as Record<string, unknown>)[m.key] != null);
    if (hasAnyPrevData) {
      setPrev(prevSnap);
    } else {
      // Fall back to global profile values
      const profile = getBodyProfile();
      setPrev({
        monthKey: prevKey,
        weight: profile.weight || undefined,
        chest: profile.chest || undefined,
        underBust: profile.underBust || undefined,
        waist: profile.waist || undefined,
        belly: profile.belly || undefined,
        hips: profile.hips || undefined,
        thigh: profile.thigh || undefined,
      });
    }
  }, [monthKey, year, month]);

  const upd = (key: keyof MonthBodySnapshot, val: unknown) => {
    if (!snap) return;
    const updated = { ...snap, [key]: val };
    setSnap(updated);
    saveMonthBodySnapshot(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  if (!snap) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "var(--muted)" }}>Завантаження...</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.25rem", fontSize: "0.82rem", color: "var(--muted)" }}>
          <Link href="/" style={{ color: "var(--muted)", textDecoration: "none" }}>Щоденник</Link>
          <span>›</span>
          <Link href={`/month/${yearStr}/${monthStr}`} style={{ color: "var(--muted)", textDecoration: "none" }}>
            {MONTHS_UA[month - 1]} {year}
          </Link>
          <span>›</span>
          <span style={{ color: "var(--accent)" }}>Тіло</span>
        </div>

        {/* Header */}
        <div style={{
          background: "var(--surface)", borderRadius: 14, padding: "1.25rem 1.5rem",
          border: "1px solid color-mix(in srgb, var(--accent) 33%, transparent)",
          marginBottom: 14, position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "var(--accent)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
            <div>
              <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--accent)", margin: 0 }}>
                Тіло — {MONTHS_UA[month - 1]} {year}
              </h1>
              <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 4 }}>
                Вимірювання за місяць та порівняння з попереднім
              </div>
            </div>
            {saved && <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>Збережено ✓</span>}
          </div>
        </div>

        {/* Nav */}
        <div style={{ display: "flex", gap: 6, marginBottom: "1rem", flexWrap: "wrap" }}>
          {NAV.map(n => {
            const active = n.label === "Тіло";
            return (
              <Link key={n.label} href={n.href(yearStr, monthStr)} style={{ textDecoration: "none" }}>
                <span style={{
                  display: "inline-block", padding: "5px 14px", borderRadius: 8,
                  fontSize: "0.8rem",
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

        {/* Comparison table */}
        <div style={{ ...SECTION_STYLE, marginBottom: 14 }}>
          <h2 style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--muted)", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Порівняння
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "6px 8px", color: "var(--muted)", fontWeight: 600, fontSize: "0.75rem", borderBottom: "1px solid var(--border)" }}>
                    Параметр
                  </th>
                  <th style={{ textAlign: "center", padding: "6px 8px", color: "var(--muted)", fontWeight: 600, fontSize: "0.75rem", borderBottom: "1px solid var(--border)" }}>
                    Було
                  </th>
                  <th style={{ textAlign: "center", padding: "6px 8px", color: "var(--muted)", fontWeight: 600, fontSize: "0.75rem", borderBottom: "1px solid var(--border)" }}>
                    Стало
                  </th>
                  <th style={{ textAlign: "center", padding: "6px 8px", color: "var(--muted)", fontWeight: 600, fontSize: "0.75rem", borderBottom: "1px solid var(--border)" }}>
                    Різниця
                  </th>
                </tr>
              </thead>
              <tbody>
                {MEASUREMENTS.map(({ key, label, unit }) => {
                  const prevVal = prev ? (prev as unknown as Record<string, number | undefined>)[key] : undefined;
                  const curVal = (snap as unknown as Record<string, number | undefined>)[key];
                  const d = delta(curVal, prevVal);
                  // For weight: negative is good (losing weight); for measurements: negative is good (shrinking)
                  const isGood = d !== null && d < 0;
                  const isBad  = d !== null && d > 0;
                  const deltaColor = isGood ? "#4ade80" : isBad ? "#f87171" : "var(--muted)";

                  return (
                    <tr key={key} style={{ borderBottom: "1px solid color-mix(in srgb, var(--border) 60%, transparent)" }}>
                      <td style={{ padding: "10px 8px", color: "var(--text)", fontWeight: 500 }}>{label}</td>
                      <td style={{ padding: "10px 8px", textAlign: "center", color: prevVal ? "var(--muted)" : "var(--border)" }}>
                        {prevVal ? `${prevVal} ${unit}` : "—"}
                      </td>
                      <td style={{ padding: "10px 8px", textAlign: "center" }}>
                        <input
                          type="number"
                          value={curVal || ""}
                          onChange={e => upd(key, e.target.value ? +e.target.value : undefined)}
                          placeholder="—"
                          style={{
                            width: 80, padding: "5px 8px", borderRadius: 7, border: "1px solid var(--border)",
                            background: "var(--surface2)", color: "var(--text)", fontFamily: "inherit",
                            fontSize: "0.88rem", textAlign: "center",
                          }}
                        />
                        <span style={{ marginLeft: 4, fontSize: "0.75rem", color: "var(--muted)" }}>{unit}</span>
                      </td>
                      <td style={{ padding: "10px 8px", textAlign: "center", fontWeight: 700, color: deltaColor }}>
                        {d !== null ? (d > 0 ? `+${d}` : `${d}`) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {prev && (
            <div style={{ marginTop: 10, fontSize: "0.72rem", color: "var(--muted)", fontStyle: "italic" }}>
              * «Було» — дані за {MONTHS_UA[month === 1 ? 11 : month - 2]} {month === 1 ? year - 1 : year}
              {!getMonthBodySnapshot(prevMonthKey(year, month)).weight && " (з базового профілю)"}
            </div>
          )}
        </div>

        {/* Note */}
        <div style={SECTION_STYLE}>
          <h2 style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--muted)", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Нотатка
          </h2>
          <textarea
            value={snap.note || ""}
            onChange={e => upd("note", e.target.value)}
            placeholder="Як почувалась цього місяця? Що помітила?"
            rows={3}
            style={{ ...FIELD_STYLE, resize: "vertical", lineHeight: 1.5 }}
          />
        </div>

        {/* Link to global profile */}
        <div style={{ marginTop: 12, textAlign: "center" }}>
          <Link href="/profile" style={{ fontSize: "0.8rem", color: "var(--muted)", textDecoration: "none" }}>
            Редагувати базовий профіль (вік, зріст, активність) →
          </Link>
        </div>

      </div>
    </div>
  );
}
