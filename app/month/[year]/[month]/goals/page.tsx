"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getMonthGoals, saveMonthGoals, getMonthConclusion, saveMonthConclusion, generateId } from "@/lib/storage";
import { MonthGoals, Goal, GoalCategory, KpiItem } from "@/lib/types";

const KPI_CATEGORIES: { id: string; label: string; color: string; items: string[] }[] = [
  {
    id: "work", label: "💼 Робота", color: "#60a5fa",
    items: ["📈 Нові клієнти","💰 Дохід (грн)","💸 Заощаджено (грн)","📞 Дзвінків / зустрічей","📝 Статей / постів написано","🎯 Задач виконано","⏱ Годин роботи","🤝 Партнерств укладено","📊 Проєктів завершено","💼 Відправлено резюме","🔁 Конверсія (%)","📧 Листів оброблено"],
  },
  {
    id: "health", label: "🏃 Здоров'я", color: "#4ade80",
    items: ["🏋 Тренувань на місяць","🚶 Середній крок/день","💧 Вода щодня (склянок)","😴 Середній сон (год)","🧘 Медитацій","🍎 Днів правильного харчування","🏃 Кілометрів пробіг","🚴 Велопробіг (км)","🩺 Лікарів відвідано","💊 Днів без пропуску вітамінів","🧘 Сеансів йоги","🧖 Масажів"],
  },
  {
    id: "learning", label: "📚 Навчання", color: "#fbbf24",
    items: ["📚 Книг прочитано","🎓 Курсів пройдено","📹 Відео / уроків переглянуто","✍️ Сторінок прочитано","🗣 Занять мовою","🧩 Нових навичок освоєно","📓 Конспектів зроблено","🎙 Подкастів прослухано","📰 Статей опрацьовано","🔬 Годин практики"],
  },
  {
    id: "personal", label: "🌱 Особисте", color: "#a78bfa",
    items: ["🏠 Прибирань","🌍 Нових місць відвідано","🎉 Приємних подій","📸 Фото / спогадів","🤗 Добрих справ","🎵 Концертів / заходів","✅ Звичок виконано (%)","🔋 Середня енергія (1–10)","😊 Днів гарного настрою","🎨 Творчих сесій","🧹 Генеральних прибирань","🌿 Днів без алкоголю"],
  },
  {
    id: "relations", label: "💞 Стосунки", color: "#f472b6",
    items: ["👨‍👩‍👧 Зустрічей з близькими","📞 Дзвінків рідним","💬 Нових знайомств","❤️ Побачень / романтичних вечорів","🤝 Нових корисних контактів","🎁 Подарованих приємних моментів","💌 Листів / повідомлень підтримки","🫂 Годин якісного часу з партнером","👫 Спільних активностей","🙏 Конфліктів вирішено","🌟 Компліментів зроблено","🥂 Святкувань з друзями"],
  },
  {
    id: "mind", label: "🧠 Ментальне", color: "#38bdf8",
    items: ["🧘 Медитацій","📔 Сторінок щоденника","🛁 Годин для себе","😌 Сеансів релаксації","🧠 Сеансів терапії / коучингу","🌅 Ранкових ритуалів","🌙 Вечірніх ритуалів","📵 Днів без соцмереж","🎯 Днів з чітким фокусом","💭 Афірмацій / практик вдячності","🧩 Годин без телефону","🌳 Прогулянок на природі"],
  },
];

const MONTHS_UA = [
  "Січень", "Лютий", "Березень", "Квітень",
  "Травень", "Червень", "Липень", "Серпень",
  "Вересень", "Жовтень", "Листопад", "Грудень",
];

const CATEGORIES: { key: GoalCategory; label: string; color: string }[] = [
  { key: "personal", label: "Особисті", color: "#4ade80" },
  { key: "work",     label: "Робота",   color: "#60a5fa" },
  { key: "health",   label: "Здоров'я", color: "#f87171" },
  { key: "finance",  label: "Фінанси",  color: "#f6c547" },
  { key: "other",    label: "Інше",     color: "#9ca3af" },
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

interface Props { params: Promise<{ year: string; month: string }> }

export default function GoalsPage({ params }: Props) {
  const { year, month } = use(params);
  const monthKey = `${year}-${month}`;
  const monthIdx = parseInt(month) - 1;

  const [data, setData] = useState<MonthGoals | null>(null);
  const [newText, setNewText] = useState("");
  const [newCat, setNewCat] = useState<GoalCategory>("personal");
  const [newTarget, setNewTarget] = useState("");
  const [kpiCat, setKpiCat] = useState("work");

  useEffect(() => { setData(getMonthGoals(monthKey)); }, [monthKey]);

  const save = useCallback((updated: MonthGoals) => saveMonthGoals(updated), []);

  const addGoal = () => {
    if (!data || !newText.trim()) return;
    const goal: Goal = { id: generateId(), text: newText.trim(), done: false, category: newCat };
    const updated = { ...data, goals: [...data.goals, goal] };
    setData(updated); save(updated);

    if (newTarget.trim()) {
      const conclusion = getMonthConclusion(monthKey);
      const kpi: KpiItem = { id: generateId(), name: newText.trim(), target: newTarget.trim(), actual: "", note: "" };
      saveMonthConclusion({ ...conclusion, kpis: [...conclusion.kpis, kpi] });
    }

    setNewText(""); setNewTarget("");
  };

  const toggleGoal = (id: string) => {
    if (!data) return;
    const goals = data.goals.map(g => g.id === id ? { ...g, done: !g.done } : g);
    const updated = { ...data, goals }; setData(updated); save(updated);
  };

  const deleteGoal = (id: string) => {
    if (!data) return;
    const goals = data.goals.filter(g => g.id !== id);
    const updated = { ...data, goals }; setData(updated); save(updated);
  };

  const updateNote = (generalNote: string) => {
    if (!data) return;
    const updated = { ...data, generalNote }; setData(updated); save(updated);
  };

  if (!data) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "var(--muted)" }}>Завантаження...</div>
    </div>
  );

  const done = data.goals.filter(g => g.done).length;
  const total = data.goals.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.25rem", fontSize: "0.82rem", color: "var(--muted)", fontFamily: "var(--font-body)" }}>
          <Link href="/" style={{ color: "var(--muted)", textDecoration: "none" }}>Щоденник</Link>
          <span>›</span>
          <Link href={`/month/${year}/${month}`} style={{ color: "var(--muted)", textDecoration: "none" }}>{MONTHS_UA[monthIdx]} {year}</Link>
          <span>›</span>
          <span style={{ color: "var(--accent2)" }}>Цілі</span>
        </div>

        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg,var(--surface) 0%,var(--surface2) 100%)",
          border: "1px solid color-mix(in srgb, var(--accent) 33%, transparent)", borderRadius: 14, padding: "1.5rem",
          marginBottom: "1rem", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(to right, var(--accent), color-mix(in srgb, var(--accent) 53%, transparent))" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 6, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--muted)", fontFamily: "var(--font-body)", letterSpacing: "0.1em", marginBottom: 4 }}>
                {String(parseInt(month)).padStart(2,"0")} · {year}
              </div>
              <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2.4rem", fontWeight: 700, color: "var(--accent)", margin: 0, lineHeight: 1 }}>
                Цілі місяця
              </h1>
            </div>
            {total > 0 && (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.8rem", fontWeight: 700, color: "var(--accent)" }}>{pct}%</div>
                <div style={{ fontSize: "0.75rem", color: "var(--muted)", fontFamily: "var(--font-body)" }}>{done}/{total} виконано</div>
              </div>
            )}
          </div>
          {total > 0 && (
            <div style={{ marginTop: 12, height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: "var(--accent)", borderRadius: 3, transition: "width 0.3s" }} />
            </div>
          )}
        </div>

        {/* Month nav tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: "1.25rem", flexWrap: "wrap" }}>
          {NAV.map(n => {
            const active = n.label === "Цілі";
            return (
              <Link key={n.label} href={n.href(year, month)} style={{ textDecoration: "none" }}>
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

        {/* Goals by category */}
        {CATEGORIES.map(cat => {
          const catGoals = data.goals.filter(g => g.category === cat.key);
          if (catGoals.length === 0) return null;
          const catDone = catGoals.filter(g => g.done).length;
          return (
            <div key={cat.key} style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 12, padding: "1rem 1.25rem", marginBottom: 10,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: cat.color, flexShrink: 0 }} />
                <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.15rem", fontWeight: 600, color: cat.color, margin: 0 }}>
                  {cat.label}
                </h2>
                <span style={{ fontSize: "0.72rem", color: "var(--muted)", fontFamily: "var(--font-body)" }}>
                  {catDone}/{catGoals.length}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {catGoals.map(goal => (
                  <div key={goal.id} style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    padding: "7px 10px", borderRadius: 8,
                    background: goal.done ? `${cat.color}12` : "var(--surface2)",
                    border: `1px solid ${goal.done ? cat.color+"33" : "transparent"}`,
                  }}>
                    <button onClick={() => toggleGoal(goal.id)} style={{
                      width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                      border: `2px solid ${goal.done ? cat.color : "var(--border)"}`,
                      background: goal.done ? cat.color : "transparent",
                      cursor: "pointer", color: "#051208", fontSize: "0.7rem",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {goal.done ? "✓" : ""}
                    </button>
                    <span style={{
                      flex: 1, fontSize: "0.9rem", lineHeight: 1.5,
                      fontFamily: "var(--font-body)",
                      color: goal.done ? "var(--muted)" : "var(--text)",
                      textDecoration: goal.done ? "line-through" : "none",
                    }}>
                      {goal.text}
                    </span>
                    <button onClick={() => deleteGoal(goal.id)} style={{ color: "var(--muted)", background: "none", border: "none", cursor: "pointer", fontSize: "1rem", padding: 0, flexShrink: 0 }}>×</button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {total === 0 && (
          <div style={{ textAlign: "center", color: "var(--muted)", fontFamily: "var(--font-heading)", fontSize: "1.2rem", padding: "2rem 0" }}>
            Ще немає цілей на цей місяць
          </div>
        )}

        {/* Add goal */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: 10 }}>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "var(--muted)", margin: "0 0 10px" }}>
            Нова ціль
          </h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              type="text" value={newText}
              onChange={e => setNewText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addGoal()}
              placeholder="Опишіть ціль..."
              style={{
                flex: 1, minWidth: 180, padding: "8px 12px", borderRadius: 8,
                border: "1px solid var(--border)", background: "var(--surface2)",
                fontSize: "0.88rem", color: "var(--text)", fontFamily: "var(--font-body)",
              }}
            />
            <input
              type="text" value={newTarget}
              onChange={e => setNewTarget(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addGoal()}
              placeholder="Ціль (число)"
              style={{
                width: 110, padding: "8px 12px", borderRadius: 8,
                border: `1px solid ${newTarget ? "color-mix(in srgb, var(--accent) 50%, transparent)" : "var(--border)"}`,
                background: newTarget ? "color-mix(in srgb, var(--accent) 8%, transparent)" : "var(--surface2)",
                fontSize: "0.88rem", color: "var(--text)", fontFamily: "var(--font-body)",
              }}
            />
            <select value={newCat} onChange={e => setNewCat(e.target.value as GoalCategory)} style={{
              padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)",
              background: "var(--surface2)", color: "var(--text)", fontSize: "0.85rem",
              cursor: "pointer", fontFamily: "var(--font-body)",
            }}>
              {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
            <button onClick={addGoal} style={{
              padding: "8px 18px", borderRadius: 8,
              border: "1px solid color-mix(in srgb, var(--accent) 40%, transparent)", background: "color-mix(in srgb, var(--accent) 13%, transparent)",
              color: "var(--accent)", cursor: "pointer", fontSize: "0.88rem", fontWeight: 600,
              fontFamily: "var(--font-body)",
            }}>
              + Додати
            </button>
          </div>
          {newTarget && (
            <div style={{ marginTop: 7, fontSize: "0.72rem", color: "var(--accent)", opacity: 0.8 }}>
              ✦ Автоматично з&apos;явиться як KPI в Підсумках — залишиться лише вписати факт
            </div>
          )}

          {/* KPI example chips */}
          <div style={{ marginTop: 14, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
            <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginBottom: 8, letterSpacing: "0.04em" }}>
              Приклади цілей — клікни щоб заповнити:
            </div>
            <div style={{ display: "flex", gap: 5, marginBottom: 9, flexWrap: "wrap" }}>
              {KPI_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setKpiCat(cat.id)}
                  style={{
                    padding: "3px 11px", borderRadius: 6,
                    border: `1px solid ${kpiCat === cat.id ? cat.color : "var(--border)"}`,
                    background: kpiCat === cat.id ? `${cat.color}20` : "var(--surface2)",
                    color: kpiCat === cat.id ? cat.color : "var(--muted)",
                    cursor: "pointer", fontSize: "0.75rem", fontFamily: "inherit",
                    fontWeight: kpiCat === cat.id ? 600 : 400,
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {(() => {
                const cat = KPI_CATEGORIES.find(c => c.id === kpiCat) ?? KPI_CATEGORIES[0];
                return cat.items.map(item => (
                  <button
                    key={item}
                    onClick={() => { setNewText(item); }}
                    style={{
                      padding: "3px 10px", borderRadius: 6,
                      border: "1px solid var(--border)", background: "var(--surface2)",
                      color: "var(--muted)", cursor: "pointer", fontSize: "0.75rem",
                      fontFamily: "inherit", transition: "all 0.12s",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = cat.color;
                      (e.currentTarget as HTMLButtonElement).style.color = cat.color;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                      (e.currentTarget as HTMLButtonElement).style.color = "var(--muted)";
                    }}
                  >
                    {item}
                  </button>
                ));
              })()}
            </div>
          </div>
        </div>

        {/* General note */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "1rem 1.25rem" }}>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "var(--muted)", margin: "0 0 10px" }}>
            Загальний намір на місяць
          </h3>
          <textarea
            value={data.generalNote} onChange={e => updateNote(e.target.value)}
            placeholder="Яким хочеш зробити цей місяць?.."
            className="lined-paper"
            style={{
              width: "100%", minHeight: 110, padding: "4px 12px", borderRadius: 8,
              border: "1px solid var(--border)", background: "var(--surface2)",
              fontSize: "0.88rem", color: "var(--text)", fontFamily: "var(--font-body)", resize: "vertical",
            }}
          />
        </div>

      </div>
    </div>
  );
}
