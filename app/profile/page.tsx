"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getBodyProfile, saveBodyProfile } from "@/lib/storage";
import { BodyProfile, Gender, ActivityLevel } from "@/lib/types";

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary:  "Мінімальна (сидячий спосіб життя)",
  light:      "Легка (1-2 тренування/тиж)",
  moderate:   "Помірна (3-5 тренувань/тиж)",
  active:     "Висока (6-7 тренувань/тиж)",
  veryActive: "Дуже висока (щодня + важка праця)",
};

const ACTIVITY_MULT: Record<ActivityLevel, number> = {
  sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, veryActive: 1.9,
};

function calcBMR(p: BodyProfile): number {
  if (!p.weight || !p.height || !p.age) return 0;
  const base = 10 * p.weight + 6.25 * p.height - 5 * p.age;
  return Math.round(p.gender === "female" ? base - 161 : base + 5);
}

function calcTDEE(p: BodyProfile): number {
  const bmr = calcBMR(p);
  return bmr ? Math.round(bmr * ACTIVITY_MULT[p.activityLevel]) : 0;
}


const FIELD_STYLE = {
  padding: "8px 12px", borderRadius: 8,
  border: "1px solid var(--border)", background: "var(--surface2)",
  fontSize: "0.9rem", color: "var(--text)", fontFamily: "inherit",
  width: "100%", boxSizing: "border-box" as const,
};

const SECTION_STYLE = {
  background: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: 14, padding: "1.25rem", marginBottom: 14,
};

const LABEL_STYLE = {
  fontSize: "0.72rem", color: "var(--muted)", fontWeight: 600,
  textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 5, display: "block",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span style={LABEL_STYLE}>{label}</span>
      {children}
    </div>
  );
}

export default function ProfilePage() {
  const [data, setData] = useState<BodyProfile | null>(null);
  const [saved, setSaved] = useState(false);
  const [autoCalc, setAutoCalc] = useState(true);

  useEffect(() => {
    const p = getBodyProfile();
    setData(p);
    if (p.caloriesMaintenance > 0) setAutoCalc(false);
  }, []);

  const save = (updated: BodyProfile) => {
    saveBodyProfile(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  const upd = (field: keyof BodyProfile, value: string | number) => {
    if (!data) return;
    const updated = { ...data, [field]: value };
    if (autoCalc) {
      const tdee = calcTDEE(updated);
      if (tdee) {
        updated.caloriesMaintenance = tdee;
        updated.caloriesDeficit = Math.round(tdee * 0.8);
        updated.caloriesSurplus = Math.round(tdee * 1.15);
      }
    }
    setData(updated);
    save(updated);
  };

  const toggleAutoCalc = () => {
    if (!data) return;
    const next = !autoCalc;
    setAutoCalc(next);
    if (next) {
      const tdee = calcTDEE(data);
      if (tdee) {
        const updated = {
          ...data,
          caloriesMaintenance: tdee,
          caloriesDeficit: Math.round(tdee * 0.8),
          caloriesSurplus: Math.round(tdee * 1.15),
        };
        setData(updated);
        save(updated);
      }
    }
  };

  if (!data) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "var(--muted)" }}>Завантаження...</div>
    </div>
  );

  const bmr  = calcBMR(data);
  const tdee = calcTDEE(data);
  const proteinNorm = data.weight ? Math.round(data.weight * 1.8) : 0;
  const toGoal = data.weight && data.goalWeight ? Math.round((data.weight - data.goalWeight) * 10) / 10 : null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.25rem", fontSize: "0.82rem", color: "var(--muted)" }}>
          <Link href="/" style={{ color: "var(--muted)", textDecoration: "none" }}>Щоденник</Link>
          <span>›</span>
          <span style={{ color: "var(--accent)" }}>Моє тіло</span>
        </div>

        {/* Header */}
        <div style={{
          background: "var(--surface)", borderRadius: 14, padding: "1.5rem",
          border: "1px solid color-mix(in srgb, var(--accent) 33%, transparent)",
          marginBottom: 14, position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "var(--accent)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
            <div>
              <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--accent)", margin: 0 }}>
                {data.name || "Моє тіло"} 🌸
              </h1>
              {data.height > 0 && data.weight > 0 && (
                <div style={{ fontSize: "0.82rem", color: "var(--muted)", marginTop: 4 }}>
                  {data.height} см · {data.weight} кг{data.age ? ` · ${data.age} р` : ""}
                </div>
              )}
            </div>
            {saved && <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>Збережено ✓</span>}
          </div>
        </div>

        {/* Auto-calculated stats */}
        {bmr > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10, marginBottom: 14 }}>
            {bmr > 0 && (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "0.9rem", textAlign: "center" }}>
                <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--accent)" }}>{bmr}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--accent)", fontWeight: 600 }}>BMR</div>
                <div style={{ fontSize: "0.65rem", color: "var(--muted)", marginTop: 2 }}>базовий обмін</div>
              </div>
            )}
            {tdee > 0 && (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "0.9rem", textAlign: "center" }}>
                <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#4ade80" }}>{tdee}</div>
                <div style={{ fontSize: "0.68rem", color: "#4ade80", fontWeight: 600 }}>TDEE</div>
                <div style={{ fontSize: "0.65rem", color: "var(--muted)", marginTop: 2 }}>підтримка ваги</div>
              </div>
            )}
            {proteinNorm > 0 && (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "0.9rem", textAlign: "center" }}>
                <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#fbbf24" }}>{proteinNorm}</div>
                <div style={{ fontSize: "0.68rem", color: "#fbbf24", fontWeight: 600 }}>г/день</div>
                <div style={{ fontSize: "0.65rem", color: "var(--muted)", marginTop: 2 }}>норма білка</div>
              </div>
            )}
            {toGoal !== null && (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "0.9rem", textAlign: "center" }}>
                <div style={{ fontSize: "1.4rem", fontWeight: 700, color: toGoal > 0 ? "#f87171" : "#4ade80" }}>
                  {toGoal > 0 ? `−${toGoal}` : `+${Math.abs(toGoal)}`}
                </div>
                <div style={{ fontSize: "0.68rem", color: "var(--muted)", fontWeight: 600 }}>кг до цілі</div>
                <div style={{ fontSize: "0.65rem", color: "var(--muted)", marginTop: 2 }}>ціль: {data.goalWeight} кг</div>
              </div>
            )}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {/* Personal */}
          <div style={SECTION_STYLE}>
            <h2 style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--muted)", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Особисте
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Field label="Ім'я">
                <input value={data.name} onChange={e => upd("name", e.target.value)} placeholder="Твоє ім'я..." style={FIELD_STYLE} />
              </Field>
              <Field label="Стать">
                <div style={{ display: "flex", gap: 6 }}>
                  {(["female", "male"] as Gender[]).map(g => (
                    <button key={g} onClick={() => upd("gender", g)} style={{
                      flex: 1, padding: "7px 0", borderRadius: 8, cursor: "pointer",
                      fontFamily: "inherit", fontSize: "0.85rem",
                      border: `1px solid ${data.gender === g ? "var(--accent)" : "var(--border)"}`,
                      background: data.gender === g ? "color-mix(in srgb, var(--accent) 15%, transparent)" : "var(--surface2)",
                      color: data.gender === g ? "var(--accent)" : "var(--muted)",
                      fontWeight: data.gender === g ? 600 : 400,
                    }}>
                      {g === "female" ? "Жінка" : "Чоловік"}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Вік (років)">
                <input type="number" value={data.age || ""} onChange={e => upd("age", +e.target.value)} placeholder="25" style={FIELD_STYLE} />
              </Field>
            </div>
          </div>

          {/* Body params */}
          <div style={SECTION_STYLE}>
            <h2 style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--muted)", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Параметри тіла
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Field label="Зріст (см)">
                <input type="number" value={data.height || ""} onChange={e => upd("height", +e.target.value)} placeholder="165" style={FIELD_STYLE} />
              </Field>
              <Field label="Поточна вага (кг)">
                <input type="number" value={data.weight || ""} onChange={e => upd("weight", +e.target.value)} placeholder="60" style={FIELD_STYLE} />
              </Field>
              <Field label="Бажана вага (кг)">
                <input type="number" value={data.goalWeight || ""} onChange={e => upd("goalWeight", +e.target.value)} placeholder="55" style={FIELD_STYLE} />
              </Field>
              <Field label="Рівень активності">
                <select value={data.activityLevel} onChange={e => upd("activityLevel", e.target.value as ActivityLevel)} style={{ ...FIELD_STYLE, cursor: "pointer" }}>
                  {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map(k => (
                    <option key={k} value={k}>{ACTIVITY_LABELS[k]}</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          {/* Calories */}
          <div style={SECTION_STYLE}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h2 style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Калорії
              </h2>
              <button onClick={toggleAutoCalc} style={{
                fontSize: "0.68rem", padding: "3px 9px", borderRadius: 6, cursor: "pointer",
                border: `1px solid ${autoCalc ? "var(--accent)" : "var(--border)"}`,
                background: autoCalc ? "color-mix(in srgb, var(--accent) 13%, transparent)" : "var(--surface2)",
                color: autoCalc ? "var(--accent)" : "var(--muted)", fontFamily: "inherit",
              }}>
                {autoCalc ? "✦ авто" : "ручний"}
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Field label="Підтримка ваги (ккал)">
                <input type="number" value={data.caloriesMaintenance || ""} readOnly={autoCalc}
                  onChange={e => upd("caloriesMaintenance", +e.target.value)}
                  placeholder={tdee ? String(tdee) : "2000"}
                  style={{ ...FIELD_STYLE, opacity: autoCalc ? 0.65 : 1 }} />
              </Field>
              <Field label="Дефіцит — схуднення (ккал)">
                <input type="number" value={data.caloriesDeficit || ""} readOnly={autoCalc}
                  onChange={e => upd("caloriesDeficit", +e.target.value)}
                  placeholder={tdee ? String(Math.round(tdee * 0.8)) : "1600"}
                  style={{ ...FIELD_STYLE, opacity: autoCalc ? 0.65 : 1,
                    borderColor: data.caloriesDeficit ? "#f87171aa" : "var(--border)",
                    background: data.caloriesDeficit ? "#f8717110" : "var(--surface2)" }} />
              </Field>
              <Field label="Профіцит — набір маси (ккал)">
                <input type="number" value={data.caloriesSurplus || ""} readOnly={autoCalc}
                  onChange={e => upd("caloriesSurplus", +e.target.value)}
                  placeholder={tdee ? String(Math.round(tdee * 1.15)) : "2300"}
                  style={{ ...FIELD_STYLE, opacity: autoCalc ? 0.65 : 1,
                    borderColor: data.caloriesSurplus ? "#4ade80aa" : "var(--border)",
                    background: data.caloriesSurplus ? "#4ade8010" : "var(--surface2)" }} />
              </Field>
            </div>
            {autoCalc && tdee > 0 && (
              <div style={{ marginTop: 8, fontSize: "0.7rem", color: "var(--muted)" }}>
                Розраховано за формулою Міффліна-Сан Жеора з коефіцієнтом активності
              </div>
            )}
          </div>

          {/* Body measurements */}
          <div style={SECTION_STYLE}>
            <h2 style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--muted)", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Об&apos;єми тіла (см)
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Груди"><input type="number" value={data.chest || ""} onChange={e => upd("chest", +e.target.value)} placeholder="90" style={FIELD_STYLE} /></Field>
              <Field label="Підгруддя"><input type="number" value={data.underBust || ""} onChange={e => upd("underBust", +e.target.value)} placeholder="75" style={FIELD_STYLE} /></Field>
              <Field label="Талія"><input type="number" value={data.waist || ""} onChange={e => upd("waist", +e.target.value)} placeholder="70" style={FIELD_STYLE} /></Field>
              <Field label="Живіт"><input type="number" value={data.belly || ""} onChange={e => upd("belly", +e.target.value)} placeholder="80" style={FIELD_STYLE} /></Field>
              <Field label="Стегна"><input type="number" value={data.hips || ""} onChange={e => upd("hips", +e.target.value)} placeholder="95" style={FIELD_STYLE} /></Field>
              <Field label="Обхват ноги"><input type="number" value={data.thigh || ""} onChange={e => upd("thigh", +e.target.value)} placeholder="55" style={FIELD_STYLE} /></Field>
            </div>
          </div>
        </div>

        {/* Norms override */}
        <div style={SECTION_STYLE}>
          <h2 style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--muted)", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Персональні норми (необов&apos;язково)
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label={`Норма білка (г/день)${proteinNorm ? ` · авто: ${proteinNorm}` : ""}`}>
              <input type="number" value={data.proteinGoal || ""} onChange={e => upd("proteinGoal", +e.target.value)}
                placeholder={proteinNorm ? String(proteinNorm) : "100"} style={FIELD_STYLE} />
            </Field>
            <Field label="Норма води (мл/день)">
              <input type="number" value={data.waterGoal || ""} onChange={e => upd("waterGoal", +e.target.value)}
                placeholder="2000" style={FIELD_STYLE} />
            </Field>
          </div>
        </div>

      </div>
    </div>
  );
}
