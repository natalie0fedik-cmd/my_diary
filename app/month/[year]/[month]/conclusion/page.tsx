"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getMonthConclusion, saveMonthConclusion, generateId } from "@/lib/storage";
import { MonthConclusion, KpiItem } from "@/lib/types";

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

interface Props {
  params: Promise<{ year: string; month: string }>;
}

export default function ConclusionPage({ params }: Props) {
  const { year, month } = use(params);
  const monthKey = `${year}-${month}`;
  const monthIdx = parseInt(month) - 1;
  const color = MONTH_COLORS[monthIdx];

  const [data, setData] = useState<MonthConclusion | null>(null);
  const [saving, setSaving] = useState(false);
  const [newKpiName, setNewKpiName] = useState("");

  useEffect(() => {
    setData(getMonthConclusion(monthKey));
  }, [monthKey]);

  const save = useCallback((updated: MonthConclusion) => {
    saveMonthConclusion(updated);
    setSaving(true);
    setTimeout(() => setSaving(false), 900);
  }, []);

  const update = (field: keyof MonthConclusion, value: string) => {
    if (!data) return;
    const updated = { ...data, [field]: value };
    setData(updated);
    save(updated);
  };

  const addKpi = () => {
    if (!data || !newKpiName.trim()) return;
    const kpi: KpiItem = {
      id: generateId(),
      name: newKpiName.trim(),
      target: "",
      actual: "",
      note: "",
    };
    const updated = { ...data, kpis: [...data.kpis, kpi] };
    setData(updated);
    save(updated);
    setNewKpiName("");
  };

  const updateKpi = (id: string, field: keyof KpiItem, value: string) => {
    if (!data) return;
    const kpis = data.kpis.map(k => k.id === id ? { ...k, [field]: value } : k);
    const updated = { ...data, kpis };
    setData(updated);
    save(updated);
  };

  const deleteKpi = (id: string) => {
    if (!data) return;
    const kpis = data.kpis.filter(k => k.id !== id);
    const updated = { ...data, kpis };
    setData(updated);
    save(updated);
  };

  if (!data) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--muted)" }}>Завантаження...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.5rem", fontSize: "0.85rem", color: "var(--muted)" }}>
          <Link href="/" style={{ color: "var(--muted)", textDecoration: "none" }}>Щоденник</Link>
          <span>›</span>
          <Link href={`/month/${year}/${month}`} style={{ color: "var(--muted)", textDecoration: "none" }}>
            {MONTHS_UA[monthIdx]} {year}
          </Link>
          <span>›</span>
          <span style={{ color: "var(--text)" }}>Висновки</span>
        </div>

        {/* Header */}
        <div style={{
          background: "var(--surface)",
          border: `1px solid ${color}`,
          borderRadius: 14,
          padding: "1.5rem",
          marginBottom: "1.5rem",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: color }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 4 }}>
                {month} / {year}
              </div>
              <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: color, margin: 0 }}>
                Висновки — {MONTHS_UA[monthIdx]}
              </h1>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {saving && (
                <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>Збережено</span>
              )}
              <Link
                href={`/month/${year}/${month}`}
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--surface2)",
                  color: "var(--muted)",
                  fontSize: "0.82rem",
                  textDecoration: "none",
                }}
              >
                ← Календар
              </Link>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          {/* Personal conclusion */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: "1.25rem",
          }}>
            <h2 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--muted)", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Особистий висновок
            </h2>
            <p style={{ fontSize: "0.78rem", color: "var(--muted)", margin: "0 0 10px" }}>
              Як пройшов місяць? Що відбувалось у особистому житті?
            </p>
            <textarea
              value={data.personal}
              onChange={e => update("personal", e.target.value)}
              placeholder="Опиши як минув місяць особисто для тебе..."
              style={{
                width: "100%",
                minHeight: 180,
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--surface2)",
                fontSize: "0.88rem",
                color: "var(--text)",
                lineHeight: 1.7,
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />
          </div>

          {/* Wins & improvements */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "1.25rem",
              flex: 1,
            }}>
              <h2 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#4ade80", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Перемоги місяця
              </h2>
              <textarea
                value={data.wins}
                onChange={e => update("wins", e.target.value)}
                placeholder="Що вдалось? Якими досягненнями пишаєшся?..."
                style={{
                  width: "100%",
                  minHeight: 100,
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #4ade8033",
                  background: "#4ade8010",
                  fontSize: "0.88rem",
                  color: "var(--text)",
                  lineHeight: 1.7,
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "1.25rem",
              flex: 1,
            }}>
              <h2 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fb923c", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Що покращити
              </h2>
              <textarea
                value={data.improvements}
                onChange={e => update("improvements", e.target.value)}
                placeholder="Що можна зробити краще наступного місяця?..."
                style={{
                  width: "100%",
                  minHeight: 100,
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #fb923c33",
                  background: "#fb923c10",
                  fontSize: "0.88rem",
                  color: "var(--text)",
                  lineHeight: 1.7,
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
              />
            </div>
          </div>
        </div>

        {/* KPI Section */}
        <div style={{
          background: "var(--surface)",
          border: `1px solid ${color}44`,
          borderRadius: 14,
          padding: "1.25rem",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: "0.85rem", fontWeight: 700, color: color, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                KPI Місяця
              </h2>
              <p style={{ fontSize: "0.75rem", color: "var(--muted)", margin: "4px 0 0" }}>
                Ключові показники ефективності
              </p>
            </div>
          </div>

          {/* KPI table header */}
          {data.kpis.length > 0 && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 2fr auto",
              gap: 8,
              marginBottom: 8,
              padding: "0 8px",
            }}>
              {["Показник", "Ціль", "Факт", "Примітка", ""].map((h, i) => (
                <div key={i} style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 600, textTransform: "uppercase" }}>
                  {h}
                </div>
              ))}
            </div>
          )}

          {/* KPI rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
            {data.kpis.length === 0 && (
              <p style={{ color: "var(--muted)", fontSize: "0.85rem", margin: "0 0 8px" }}>
                Ще немає KPI показників
              </p>
            )}
            {data.kpis.map(kpi => {
              const targetNum = parseFloat(kpi.target);
              const actualNum = parseFloat(kpi.actual);
              const isNum = !isNaN(targetNum) && !isNaN(actualNum) && targetNum !== 0;
              const pct = isNum ? Math.round((actualNum / targetNum) * 100) : null;
              const pctColor = pct === null ? "var(--muted)" : pct >= 100 ? "#4ade80" : pct >= 70 ? "#fbbf24" : "#f87171";

              return (
                <div
                  key={kpi.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 2fr auto",
                    gap: 8,
                    padding: "8px",
                    borderRadius: 8,
                    background: "var(--surface2)",
                    border: "1px solid var(--border)",
                    alignItems: "center",
                  }}
                >
                  {/* Name */}
                  <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--text)" }}>
                    {kpi.name}
                    {pct !== null && (
                      <span style={{
                        marginLeft: 8, fontSize: "0.72rem",
                        color: pctColor, fontWeight: 700,
                      }}>
                        {pct}%
                      </span>
                    )}
                  </div>

                  {/* Target */}
                  <input
                    type="text"
                    value={kpi.target}
                    onChange={e => updateKpi(kpi.id, "target", e.target.value)}
                    placeholder="Ціль"
                    style={{
                      padding: "5px 8px",
                      borderRadius: 6,
                      border: "1px solid var(--border)",
                      background: "var(--surface)",
                      fontSize: "0.85rem",
                      color: "var(--text)",
                      fontFamily: "inherit",
                      width: "100%",
                    }}
                  />

                  {/* Actual */}
                  <input
                    type="text"
                    value={kpi.actual}
                    onChange={e => updateKpi(kpi.id, "actual", e.target.value)}
                    placeholder="Факт"
                    style={{
                      padding: "5px 8px",
                      borderRadius: 6,
                      border: `1px solid ${pctColor === "var(--muted)" ? "var(--border)" : pctColor + "55"}`,
                      background: pctColor === "var(--muted)" ? "var(--surface)" : `${pctColor}12`,
                      fontSize: "0.85rem",
                      color: "var(--text)",
                      fontFamily: "inherit",
                      width: "100%",
                    }}
                  />

                  {/* Note */}
                  <input
                    type="text"
                    value={kpi.note}
                    onChange={e => updateKpi(kpi.id, "note", e.target.value)}
                    placeholder="Коментар..."
                    style={{
                      padding: "5px 8px",
                      borderRadius: 6,
                      border: "1px solid var(--border)",
                      background: "var(--surface)",
                      fontSize: "0.82rem",
                      color: "var(--muted)",
                      fontFamily: "inherit",
                      width: "100%",
                    }}
                  />

                  {/* Delete */}
                  <button
                    onClick={() => deleteKpi(kpi.id)}
                    style={{
                      color: "var(--muted)", background: "none", border: "none",
                      cursor: "pointer", fontSize: "1.1rem", padding: "0 4px",
                    }}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          {/* Add KPI */}
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={newKpiName}
              onChange={e => setNewKpiName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addKpi()}
              placeholder="Назва нового KPI показника..."
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 8,
                border: `1px solid ${color}44`,
                background: "var(--surface2)",
                fontSize: "0.85rem",
                color: "var(--text)",
                fontFamily: "inherit",
              }}
            />
            <button
              onClick={addKpi}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                border: `1px solid ${color}`,
                background: `${color}22`,
                color: color,
                cursor: "pointer",
                fontSize: "0.88rem",
                fontWeight: 600,
                fontFamily: "inherit",
              }}
            >
              + Додати KPI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
