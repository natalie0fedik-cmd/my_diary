"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getBudgetPlan, saveBudgetPlan, generateId } from "@/lib/storage";
import { BudgetPlan, BudgetEntry } from "@/lib/types";

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
  { label: "Підсумки",   href: (y: string, m: string) => `/month/${y}/${m}/conclusion` },
];

const EXPENSE_CATS = ["Їжа", "Транспорт", "Розваги", "Здоров'я", "Одяг", "Комунальні", "Освіта", "Краса", "Подорожі", "Інше"];
const INCOME_CATS  = ["Зарплата", "Фріланс", "Подарунок", "Інше"];

interface Props { params: Promise<{ year: string; month: string }> }

export default function BudgetPage({ params }: Props) {
  const { year, month } = use(params);
  const monthKey = `${year}-${month}`;
  const monthIdx = parseInt(month) - 1;

  const [data, setData] = useState<BudgetPlan | null>(null);
  const [newType,   setNewType]   = useState<"income"|"expense">("expense");
  const [newCat,    setNewCat]    = useState(EXPENSE_CATS[0]);
  const [newAmt,    setNewAmt]    = useState("");
  const [newDesc,   setNewDesc]   = useState("");

  useEffect(() => { setData(getBudgetPlan(monthKey)); }, [monthKey]);

  const save = useCallback((updated: BudgetPlan) => saveBudgetPlan(updated), []);

  const addEntry = () => {
    if (!data || !newAmt.trim() || isNaN(parseFloat(newAmt))) return;
    const entry: BudgetEntry = {
      id: generateId(), type: newType,
      category: newCat, amount: parseFloat(newAmt),
      description: newDesc.trim(),
    };
    const updated = { ...data, entries: [...data.entries, entry] };
    setData(updated); save(updated);
    setNewAmt(""); setNewDesc("");
  };

  const deleteEntry = (id: string) => {
    if (!data) return;
    const entries = data.entries.filter(e => e.id !== id);
    const updated = { ...data, entries }; setData(updated); save(updated);
  };

  const updateField = (field: "tipsForNext" | "financialGoal", val: string) => {
    if (!data) return;
    const updated = { ...data, [field]: val }; setData(updated); save(updated);
  };

  if (!data) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "var(--muted)" }}>Завантаження...</div>
    </div>
  );

  const totalIncome  = data.entries.filter(e => e.type === "income").reduce((s, e) => s + e.amount, 0);
  const totalExpense = data.entries.filter(e => e.type === "expense").reduce((s, e) => s + e.amount, 0);
  const balance = totalIncome - totalExpense;

  const incomeEntries  = data.entries.filter(e => e.type === "income");
  const expenseEntries = data.entries.filter(e => e.type === "expense");

  // group expenses by category
  const expByCat: Record<string, number> = {};
  expenseEntries.forEach(e => { expByCat[e.category] = (expByCat[e.category] || 0) + e.amount; });

  const cats = Object.entries(expByCat).sort((a, b) => b[1] - a[1]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.25rem", fontSize: "0.82rem", color: "var(--muted)", fontFamily: "var(--font-body)" }}>
          <Link href="/" style={{ color: "var(--muted)", textDecoration: "none" }}>Щоденник</Link>
          <span>›</span>
          <Link href={`/month/${year}/${month}`} style={{ color: "var(--muted)", textDecoration: "none" }}>{MONTHS_UA[monthIdx]} {year}</Link>
          <span>›</span>
          <span style={{ color: "var(--accent2)" }}>Бюджет</span>
        </div>

        {/* Header + balance */}
        <div style={{
          background: "linear-gradient(135deg,var(--surface) 0%,var(--surface2) 100%)",
          border: "1px solid color-mix(in srgb, var(--accent) 33%, transparent)", borderRadius: 14, padding: "1.5rem",
          marginBottom: "1rem", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(to right, var(--accent), color-mix(in srgb, var(--accent) 53%, transparent))" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 6, flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--muted)", fontFamily: "var(--font-body)", letterSpacing: "0.1em", marginBottom: 4 }}>
                {String(parseInt(month)).padStart(2,"0")} · {year}
              </div>
              <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2.4rem", fontWeight: 700, color: "var(--accent)", margin: 0, lineHeight: 1 }}>
                Бюджет
              </h1>
            </div>

            {/* Summary chips */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.3rem", fontWeight: 700, color: "#4ade80" }}>
                  +{totalIncome.toLocaleString("uk-UA")}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--muted)", fontFamily: "var(--font-body)" }}>доходи</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.3rem", fontWeight: 700, color: "#f87171" }}>
                  -{totalExpense.toLocaleString("uk-UA")}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--muted)", fontFamily: "var(--font-body)" }}>витрати</div>
              </div>
              <div style={{
                padding: "8px 16px", borderRadius: 10,
                background: balance >= 0 ? "#4ade8022" : "#f8717122",
                border: `1px solid ${balance >= 0 ? "#4ade8066" : "#f8717166"}`,
                textAlign: "center",
              }}>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", fontWeight: 700, color: balance >= 0 ? "#4ade80" : "#f87171" }}>
                  {balance >= 0 ? "+" : ""}{balance.toLocaleString("uk-UA")}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--muted)", fontFamily: "var(--font-body)" }}>залишок</div>
              </div>
            </div>
          </div>
        </div>

        {/* Nav tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: "1.25rem", flexWrap: "wrap" }}>
          {NAV.map(n => {
            const active = n.label === "Бюджет";
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

        {/* Add entry */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1rem" }}>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "var(--muted)", margin: "0 0 10px" }}>
            Додати запис
          </h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {/* income / expense toggle */}
            <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)" }}>
              {(["income","expense"] as const).map(t => (
                <button key={t} onClick={() => {
                  setNewType(t);
                  setNewCat(t === "expense" ? EXPENSE_CATS[0] : INCOME_CATS[0]);
                }} style={{
                  padding: "7px 14px", border: "none", cursor: "pointer",
                  background: newType === t ? (t === "income" ? "#4ade8033" : "#f8717133") : "var(--surface2)",
                  color: newType === t ? (t === "income" ? "#4ade80" : "#f87171") : "var(--muted)",
                  fontSize: "0.82rem", fontWeight: newType === t ? 600 : 400,
                  fontFamily: "var(--font-body)",
                }}>
                  {t === "income" ? "Дохід" : "Витрата"}
                </button>
              ))}
            </div>

            <select value={newCat} onChange={e => setNewCat(e.target.value)} style={{
              padding: "7px 10px", borderRadius: 8, border: "1px solid var(--border)",
              background: "var(--surface2)", color: "var(--text)", fontSize: "0.85rem",
              cursor: "pointer", fontFamily: "var(--font-body)",
            }}>
              {(newType === "expense" ? EXPENSE_CATS : INCOME_CATS).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <input type="number" value={newAmt} onChange={e => setNewAmt(e.target.value)}
              placeholder="Сума" style={{
                width: 100, padding: "7px 10px", borderRadius: 8,
                border: "1px solid var(--border)", background: "var(--surface2)",
                fontSize: "0.85rem", color: "var(--text)", fontFamily: "var(--font-body)",
              }}
            />
            <input type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addEntry()}
              placeholder="Опис (необов'язково)" style={{
                flex: 1, minWidth: 140, padding: "7px 10px", borderRadius: 8,
                border: "1px solid var(--border)", background: "var(--surface2)",
                fontSize: "0.85rem", color: "var(--text)", fontFamily: "var(--font-body)",
              }}
            />
            <button onClick={addEntry} style={{
              padding: "7px 18px", borderRadius: 8,
              border: `1px solid ${newType === "income" ? "#4ade80" : "#f87171"}`,
              background: newType === "income" ? "#4ade8022" : "#f8717122",
              color: newType === "income" ? "#4ade80" : "#f87171",
              cursor: "pointer", fontSize: "0.85rem", fontWeight: 600,
              fontFamily: "var(--font-body)",
            }}>
              + Додати
            </button>
          </div>
        </div>

        {/* Income / Expense columns */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1rem" }}>
          {/* Incomes */}
          <div style={{ background: "var(--surface)", border: "1px solid #4ade8033", borderRadius: 12, padding: "1rem 1.25rem" }}>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", color: "#4ade80", margin: "0 0 10px" }}>
              Доходи
            </h3>
            {incomeEntries.length === 0 && (
              <p style={{ color: "var(--muted)", fontSize: "0.82rem", fontFamily: "var(--font-body)", fontStyle: "italic", margin: 0 }}>
                Немає записів
              </p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {incomeEntries.map(e => (
                <div key={e.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "6px 10px", borderRadius: 8,
                  background: "#4ade8012", border: "1px solid #4ade8022",
                }}>
                  <div>
                    <div style={{ fontSize: "0.78rem", color: "#4ade80", fontFamily: "var(--font-body)", fontWeight: 600 }}>{e.category}</div>
                    {e.description && <div style={{ fontSize: "0.72rem", color: "var(--muted)", fontFamily: "var(--font-body)" }}>{e.description}</div>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "#4ade80", fontWeight: 700 }}>
                      +{e.amount.toLocaleString("uk-UA")}
                    </span>
                    <button onClick={() => deleteEntry(e.id)} style={{ color: "var(--muted)", background: "none", border: "none", cursor: "pointer", fontSize: "0.9rem", padding: 0 }}>×</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expenses */}
          <div style={{ background: "var(--surface)", border: "1px solid #f8717133", borderRadius: 12, padding: "1rem 1.25rem" }}>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", color: "#f87171", margin: "0 0 10px" }}>
              Витрати
            </h3>
            {expenseEntries.length === 0 && (
              <p style={{ color: "var(--muted)", fontSize: "0.82rem", fontFamily: "var(--font-body)", fontStyle: "italic", margin: 0 }}>
                Немає записів
              </p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {expenseEntries.map(e => (
                <div key={e.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "6px 10px", borderRadius: 8,
                  background: "#f8717112", border: "1px solid #f8717122",
                }}>
                  <div>
                    <div style={{ fontSize: "0.78rem", color: "#f87171", fontFamily: "var(--font-body)", fontWeight: 600 }}>{e.category}</div>
                    {e.description && <div style={{ fontSize: "0.72rem", color: "var(--muted)", fontFamily: "var(--font-body)" }}>{e.description}</div>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "#f87171", fontWeight: 700 }}>
                      -{e.amount.toLocaleString("uk-UA")}
                    </span>
                    <button onClick={() => deleteEntry(e.id)} style={{ color: "var(--muted)", background: "none", border: "none", cursor: "pointer", fontSize: "0.9rem", padding: 0 }}>×</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Expense breakdown chart */}
        {cats.length > 0 && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1rem" }}>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "var(--muted)", margin: "0 0 12px" }}>
              Розподіл витрат
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {cats.map(([cat, amt]) => {
                const pct = totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0;
                return (
                  <div key={cat}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--text)", fontFamily: "var(--font-body)" }}>{cat}</span>
                      <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontFamily: "var(--font-body)" }}>
                        {amt.toLocaleString("uk-UA")} · {pct}%
                      </span>
                    </div>
                    <div style={{ height: 5, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "#f87171", borderRadius: 3 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tips for next month + financial goal */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ background: "var(--surface)", border: "1px solid color-mix(in srgb, var(--accent) 20%, transparent)", borderRadius: 12, padding: "1rem 1.25rem" }}>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", color: "var(--accent)", margin: "0 0 10px" }}>
              Поради на наступний місяць
            </h3>
            <textarea
              value={data.tipsForNext} onChange={e => updateField("tipsForNext", e.target.value)}
              placeholder="Що варто змінити у витратах? Де можна зекономити?..."
              className="lined-paper"
              style={{
                width: "100%", minHeight: 120, padding: "4px 10px", borderRadius: 8,
                border: "1px solid var(--border)", background: "var(--surface2)",
                fontSize: "0.85rem", color: "var(--text)", fontFamily: "var(--font-body)", resize: "vertical",
              }}
            />
          </div>

          <div style={{ background: "var(--surface)", border: "1px solid #f6c54733", borderRadius: 12, padding: "1rem 1.25rem" }}>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", color: "#f6c547", margin: "0 0 10px" }}>
              Фінансовий план
            </h3>
            <textarea
              value={data.financialGoal} onChange={e => updateField("financialGoal", e.target.value)}
              placeholder="Фінансові цілі на майбутнє: накопичення, великі покупки, інвестиції..."
              className="lined-paper"
              style={{
                width: "100%", minHeight: 120, padding: "4px 10px", borderRadius: 8,
                border: "1px solid var(--border)", background: "var(--surface2)",
                fontSize: "0.85rem", color: "var(--text)", fontFamily: "var(--font-body)", resize: "vertical",
              }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
