"use client";

import { useEffect, useState } from "react";
import { THEMES, DiaryTheme, getStoredTheme, saveTheme } from "@/lib/themes";

const CATEGORIES = ["всі", "природа", "аніме", "фільми", "мінімал"] as const;
type Category = (typeof CATEGORIES)[number];

interface Props {
  onClose: () => void;
}

// Mini preview card for each theme
function ThemeCard({
  theme,
  active,
  onClick,
}: {
  theme: DiaryTheme;
  active: boolean;
  onClick: () => void;
}) {
  const bg      = theme.vars["--bg"];
  const surface = theme.vars["--surface"];
  const accent  = theme.vars["--accent"];
  const text    = theme.vars["--text"];
  const muted   = theme.vars["--muted"];

  return (
    <button
      onClick={onClick}
      title={theme.nameUA}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
      }}
    >
      {/* Preview box */}
      <div style={{
        width: 100,
        height: 72,
        borderRadius: 10,
        overflow: "hidden",
        border: active
          ? `2px solid ${accent}`
          : "2px solid transparent",
        boxShadow: active
          ? `0 0 0 2px ${accent}44, 0 4px 16px ${accent}22`
          : "0 2px 8px rgba(0,0,0,0.4)",
        position: "relative",
        transition: "border-color 0.15s, box-shadow 0.15s",
        background: bg,
        backgroundImage: theme.bgPattern ?? "none",
        backgroundSize: "cover",
      }}>
        {/* Top accent strip */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: 4, background: accent,
        }} />

        {/* Faux spine */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: 6,
          background: `linear-gradient(to right, ${theme.vars["--spine"]}, transparent)`,
        }} />

        {/* Content lines */}
        <div style={{ padding: "10px 10px 8px 14px", display: "flex", flexDirection: "column", gap: 5, marginTop: 4 }}>
          {[0.7, 0.5, 0.6, 0.4].map((opacity, i) => (
            <div key={i} style={{
              height: 3, borderRadius: 2,
              background: i === 0 ? accent : text,
              opacity,
              width: i === 0 ? "60%" : i === 1 ? "80%" : i === 2 ? "70%" : "50%",
            }} />
          ))}
        </div>

        {/* Surface card preview */}
        <div style={{
          position: "absolute", bottom: 6, right: 6,
          width: 28, height: 20, borderRadius: 4,
          background: surface,
          border: `1px solid ${muted}44`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10,
        }}>
          {theme.emoji}
        </div>

        {/* Active checkmark */}
        {active && (
          <div style={{
            position: "absolute", top: 6, right: 6,
            width: 16, height: 16, borderRadius: "50%",
            background: accent, color: bg,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 9, fontWeight: 700,
          }}>✓</div>
        )}
      </div>

      {/* Name */}
      <div style={{
        fontSize: "0.72rem",
        color: active ? accent : "var(--text)",
        fontFamily: "'Lora', Georgia, serif",
        textAlign: "center",
        lineHeight: 1.3,
        maxWidth: 100,
        fontWeight: active ? 600 : 400,
      }}>
        {theme.nameUA}
      </div>
    </button>
  );
}

export default function ThemePicker({ onClose }: Props) {
  const [current, setCurrent] = useState("forest");
  const [category, setCategory] = useState<Category>("всі");

  useEffect(() => {
    setCurrent(getStoredTheme());
    // trap scroll
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const filtered = category === "всі"
    ? THEMES
    : THEMES.filter((t) => t.category === category);

  const handleSelect = (id: string) => {
    saveTheme(id);
    setCurrent(id);
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.72)",
          zIndex: 200,
          backdropFilter: "blur(4px)",
        }}
      />

      {/* Panel */}
      <div style={{
        position: "fixed",
        top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        zIndex: 201,
        width: "min(680px, 95vw)",
        maxHeight: "85vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
      }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "1.25rem 1.5rem 1rem",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{
              fontFamily: "'Caveat', cursive",
              fontSize: "1.8rem", fontWeight: 700,
              color: "var(--accent)", margin: 0, lineHeight: 1,
            }}>
              Оберіть тему
            </h2>
            <p style={{
              fontFamily: "'Lora', Georgia, serif",
              fontStyle: "italic",
              fontSize: "0.78rem", color: "var(--muted)", margin: "4px 0 0",
            }}>
              Зміни відбуваються одразу
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 34, height: 34, borderRadius: "50%",
              border: "1px solid var(--border)",
              background: "var(--surface2)",
              color: "var(--muted)", cursor: "pointer",
              fontSize: "1.1rem", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >×</button>
        </div>

        {/* Category tabs */}
        <div style={{
          display: "flex", gap: 6, padding: "0.85rem 1.5rem",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0, flexWrap: "wrap",
        }}>
          {CATEGORIES.map((cat) => {
            const active = category === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding: "4px 14px", borderRadius: 20,
                  border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                  background: active ? "var(--accent)" : "var(--surface2)",
                  color: active ? "var(--bg)" : "var(--muted)",
                  cursor: "pointer", fontSize: "0.78rem",
                  fontWeight: active ? 700 : 400,
                  fontFamily: "'Lora', Georgia, serif",
                  textTransform: "capitalize",
                  transition: "background 0.12s, border-color 0.12s",
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Theme grid */}
        <div style={{
          overflowY: "auto",
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

        {/* Footer */}
        <div style={{
          borderTop: "1px solid var(--border)",
          padding: "0.75rem 1.5rem",
          display: "flex", justifyContent: "flex-end",
          flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            style={{
              padding: "7px 24px", borderRadius: 9,
              border: "1px solid var(--accent)",
              background: "var(--accent)", color: "var(--bg)",
              cursor: "pointer", fontSize: "0.85rem", fontWeight: 700,
              fontFamily: "'Lora', Georgia, serif",
            }}
          >
            Готово
          </button>
        </div>
      </div>
    </>
  );
}
