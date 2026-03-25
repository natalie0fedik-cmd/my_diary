"use client";

import { useEffect, useState } from "react";
import {
  THEMES, DiaryTheme,
  getStoredTheme, saveTheme,
  getCustomVars, saveCustomVars, applyTheme,
  DEFAULT_CUSTOM_VARS,
} from "@/lib/themes";

const CATEGORIES = ["всі", "темна", "світла", "своя"] as const;
type Category = (typeof CATEGORIES)[number];

const FONT_OPTIONS = [
  { value: "'Inter', system-ui, -apple-system, sans-serif",     label: "Inter (рекомендований)" },
  { value: "'Montserrat', system-ui, -apple-system, sans-serif", label: "Montserrat (заголовковий)" },
  { value: "'Poppins', system-ui, sans-serif",                   label: "Poppins (м'який)" },
  { value: "'Playfair Display', Georgia, serif",                 label: "Playfair (елегантний)" },
  { value: "system-ui, sans-serif",                              label: "System" },
];

const COLOR_FIELDS: { key: string; label: string }[] = [
  { key: "--bg",       label: "Фон" },
  { key: "--surface",  label: "Картка" },
  { key: "--surface2", label: "Hover/Фон 2" },
  { key: "--border",   label: "Рамка" },
  { key: "--accent",   label: "Акцент" },
  { key: "--accent2",  label: "Акцент темний" },
  { key: "--text",     label: "Текст" },
  { key: "--muted",    label: "Вторинний" },
  { key: "--spine",    label: "Корінець" },
];

interface Props { onClose: () => void }

// ── Theme preview card ────────────────────────────────────────────────────────

function ThemeCard({ theme, active, onClick }: { theme: DiaryTheme; active: boolean; onClick: () => void }) {
  const bg      = theme.vars["--bg"];
  const surface = theme.vars["--surface"];
  const accent  = theme.vars["--accent"];
  const text    = theme.vars["--text"];
  const muted   = theme.vars["--muted"];

  return (
    <button onClick={onClick} title={theme.nameUA} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{
        width: 100, height: 72, borderRadius: 10, overflow: "hidden",
        border: active ? `2px solid ${accent}` : "2px solid transparent",
        boxShadow: active ? `0 0 0 2px ${accent}44, 0 4px 16px ${accent}22` : "0 2px 8px rgba(0,0,0,0.25)",
        position: "relative", transition: "border-color 0.15s, box-shadow 0.15s",
        background: bg, backgroundImage: theme.bgPattern ?? "none", backgroundSize: "cover",
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: accent }} />
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 6, background: `linear-gradient(to right, ${theme.vars["--spine"]}, transparent)` }} />
        <div style={{ padding: "10px 10px 8px 14px", display: "flex", flexDirection: "column", gap: 5, marginTop: 4 }}>
          {[0.7, 0.5, 0.6, 0.4].map((opacity, i) => (
            <div key={i} style={{ height: 3, borderRadius: 2, background: i === 0 ? accent : text, opacity, width: i === 0 ? "60%" : i === 1 ? "80%" : i === 2 ? "70%" : "50%" }} />
          ))}
        </div>
        <div style={{ position: "absolute", bottom: 6, right: 6, width: 28, height: 20, borderRadius: 4, background: surface, border: `1px solid ${muted}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>
          {theme.emoji}
        </div>
        {active && (
          <div style={{ position: "absolute", top: 6, right: 6, width: 16, height: 16, borderRadius: "50%", background: accent, color: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700 }}>✓</div>
        )}
      </div>
      <div style={{ fontSize: "0.72rem", color: active ? accent : "var(--text)", fontFamily: "'Lora', Georgia, serif", textAlign: "center", lineHeight: 1.3, maxWidth: 100, fontWeight: active ? 600 : 400 }}>
        {theme.nameUA}
      </div>
    </button>
  );
}

// ── Custom palette editor ─────────────────────────────────────────────────────

function ColorSwatch({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
      <label style={{ position: "relative", cursor: "pointer", display: "block" }}>
        <div style={{
          width: 48, height: 48, borderRadius: 10,
          background: value,
          border: "3px solid rgba(128,128,128,0.2)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(0,0,0,0.05)",
        }} />
        <input
          type="color" value={value} onChange={e => onChange(e.target.value)}
          style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%", padding: 0, border: "none" }}
        />
      </label>
      <span style={{ fontSize: "0.62rem", color: "var(--muted)", textAlign: "center", lineHeight: 1.2, maxWidth: 58, fontFamily: "'Lora', Georgia, serif" }}>
        {label}
      </span>
    </div>
  );
}

function CustomEditor({ currentId, onActivate }: { currentId: string; onActivate: () => void }) {
  const [vars, setVars] = useState<Record<string, string>>({ ...DEFAULT_CUSTOM_VARS });
  const isActive = currentId === "custom";

  useEffect(() => {
    setVars(getCustomVars());
  }, []);

  const updateVar = (key: string, value: string) => {
    const updated = { ...vars, [key]: value };
    setVars(updated);
    saveCustomVars(updated);
    // Apply live immediately
    document.documentElement.style.setProperty(key, value);
    // Activate custom theme
    localStorage.setItem("diary_theme", "custom");
    onActivate();
  };

  const resetToDefault = () => {
    const defaults = { ...DEFAULT_CUSTOM_VARS };
    setVars(defaults);
    saveCustomVars(defaults);
    applyTheme("custom");
    localStorage.setItem("diary_theme", "custom");
    onActivate();
  };

  // Mini preview using current vars
  const prev = vars;

  return (
    <div style={{ padding: "1.25rem 1.5rem" }}>

      {/* Live mini preview */}
      <div style={{
        width: "100%", height: 54, borderRadius: 10, marginBottom: "1.2rem",
        background: prev["--bg"] ?? "#fff",
        border: `2px solid ${prev["--accent"] ?? "#888"}44`,
        position: "relative", overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: prev["--accent"] ?? "#888" }} />
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 8, background: `linear-gradient(to right, ${prev["--spine"] ?? "#888"}, transparent)` }} />
        <div style={{ position: "absolute", top: 10, left: 20, right: 20, display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ height: 6, borderRadius: 3, width: "35%", background: prev["--accent"] ?? "#888", opacity: 0.9 }} />
          <div style={{ height: 4, borderRadius: 2, width: "60%", background: prev["--text"] ?? "#222", opacity: 0.5 }} />
          <div style={{ height: 4, borderRadius: 2, width: "45%", background: prev["--muted"] ?? "#888", opacity: 0.4 }} />
        </div>
        <div style={{
          position: "absolute", bottom: 8, right: 12,
          padding: "2px 10px", borderRadius: 6,
          background: prev["--surface"] ?? "#f5f5f5",
          border: `1px solid ${prev["--border"] ?? "#ddd"}`,
          fontSize: "0.65rem", color: prev["--accent"] ?? "#888",
          fontFamily: prev["--font-heading"] ?? "'Caveat', cursive",
        }}>
          Мій Щоденник
        </div>
        {isActive && (
          <div style={{ position: "absolute", top: 8, right: 10, fontSize: "0.6rem", color: prev["--accent"], fontFamily: "'Lora', serif", background: `${prev["--accent"]}22`, padding: "1px 6px", borderRadius: 4 }}>
            ✓ активна
          </div>
        )}
      </div>

      {/* Color grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px 8px", marginBottom: "1.2rem" }}>
        {COLOR_FIELDS.map(f => (
          <ColorSwatch
            key={f.key}
            label={f.label}
            value={vars[f.key] ?? "#888888"}
            onChange={v => updateVar(f.key, v)}
          />
        ))}
      </div>

      {/* Fonts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: "1rem" }}>
        {([
          { key: "--font-body",    label: "Шрифт тексту" },
          { key: "--font-heading", label: "Шрифт заголовків" },
        ] as const).map(({ key, label }) => (
          <div key={key} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: "0.72rem", color: "var(--muted)", fontFamily: "'Lora', Georgia, serif" }}>
              {label}
            </label>
            <select
              value={vars[key] ?? FONT_OPTIONS[0].value}
              onChange={e => updateVar(key, e.target.value)}
              style={{
                padding: "6px 10px", borderRadius: 8,
                border: "1px solid var(--border)", background: "var(--surface2)",
                color: "var(--text)", fontSize: "0.82rem",
                fontFamily: vars[key] ?? "'Lora', Georgia, serif",
                cursor: "pointer",
              }}
            >
              {FONT_OPTIONS.map(f => (
                <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Reset */}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button onClick={resetToDefault} style={{
          padding: "5px 14px", borderRadius: 8,
          border: "1px solid var(--border)", background: "var(--surface2)",
          color: "var(--muted)", cursor: "pointer",
          fontSize: "0.78rem", fontFamily: "'Lora', Georgia, serif",
        }}>
          Скинути до пастельного
        </button>
      </div>
    </div>
  );
}

// ── Main ThemePicker ──────────────────────────────────────────────────────────

export default function ThemePicker({ onClose }: Props) {
  const [current, setCurrent] = useState("milk");
  const [category, setCategory] = useState<Category>("всі");

  useEffect(() => {
    const stored = getStoredTheme();
    setCurrent(stored);
    if (stored === "custom") setCategory("своя");
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const filtered = category === "всі"
    ? THEMES
    : THEMES.filter((t) => t.category === category as string);

  const handleSelect = (id: string) => {
    saveTheme(id);
    setCurrent(id);
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 200, backdropFilter: "blur(4px)" }} />

      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        zIndex: 201, width: "min(700px, 95vw)", maxHeight: "88vh",
        display: "flex", flexDirection: "column",
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 18, overflow: "hidden",
        boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
      }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem 1rem", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <div>
            <h2 style={{ fontFamily: "'Caveat', cursive", fontSize: "1.8rem", fontWeight: 700, color: "var(--accent)", margin: 0, lineHeight: 1 }}>
              Оберіть тему
            </h2>
            <p style={{ fontFamily: "'Lora', Georgia, serif", fontStyle: "italic", fontSize: "0.78rem", color: "var(--muted)", margin: "4px 0 0" }}>
              Зміни відбуваються одразу
            </p>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: "50%", border: "1px solid var(--border)", background: "var(--surface2)", color: "var(--muted)", cursor: "pointer", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>

        {/* Category tabs */}
        <div style={{ display: "flex", gap: 6, padding: "0.85rem 1.5rem", borderBottom: "1px solid var(--border)", flexShrink: 0, flexWrap: "wrap" }}>
          {CATEGORIES.map((cat) => {
            const active = category === cat;
            const isSvoia = cat === "своя";
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding: "4px 14px", borderRadius: 20,
                  border: `1px solid ${active ? (isSvoia ? "var(--accent2)" : "var(--accent)") : "var(--border)"}`,
                  background: active ? (isSvoia ? "var(--accent2)" : "var(--accent)") : "var(--surface2)",
                  color: active ? "var(--bg)" : "var(--muted)",
                  cursor: "pointer", fontSize: "0.78rem",
                  fontWeight: active ? 700 : 400,
                  fontFamily: "'Lora', Georgia, serif",
                  textTransform: "capitalize",
                  transition: "background 0.12s, border-color 0.12s",
                }}
              >
                {isSvoia ? "✏ своя" : cat}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {category === "своя" ? (
            <CustomEditor
              currentId={current}
              onActivate={() => setCurrent("custom")}
            />
          ) : (
            <div style={{
              padding: "1.25rem 1.5rem 1.5rem",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
              gap: "1.2rem 1rem",
            }}>
              {filtered.map((theme) => (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  active={current === theme.id}
                  onClick={() => handleSelect(theme.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid var(--border)", padding: "0.75rem 1.5rem", display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: "7px 24px", borderRadius: 9, border: "1px solid var(--accent)", background: "var(--accent)", color: "var(--bg)", cursor: "pointer", fontSize: "0.85rem", fontWeight: 700, fontFamily: "'Lora', Georgia, serif" }}>
            Готово
          </button>
        </div>
      </div>
    </>
  );
}
