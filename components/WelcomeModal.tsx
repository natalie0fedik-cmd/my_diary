"use client";

import { markOnboardingSeen } from "@/lib/storage";

const STEPS = [
  {
    icon: "📅",
    title: "Місяць → День",
    desc: "Вибери місяць на головній, потім натисни на будь-який день щоб відкрити його.",
  },
  {
    icon: "✍️",
    title: "Нотатки і задачі",
    desc: "Записуй думки, ставь задачі, планують розклад по годинах.",
  },
  {
    icon: "😊",
    title: "Настрій",
    desc: "Оціни день від 1 до 5 — графік настрою будується автоматично.",
  },
  {
    icon: "🏃",
    title: "Активність і їжа",
    desc: "Кроки, вода, харчування — окремі вкладки в кожному місяці і дні.",
  },
  {
    icon: "💰",
    title: "Бюджет і цілі",
    desc: "Доходи, витрати по категоріях, місячні цілі з прогресом.",
  },
  {
    icon: "✅",
    title: "Трекер звичок",
    desc: "Додай звички у вкладці «Трекер» місяця — і відмічай їх щодня.",
  },
];

export default function WelcomeModal({ onClose }: { onClose: () => void }) {
  function handleClose() {
    markOnboardingSeen();
    onClose();
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}
      onClick={handleClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          border: "1px solid color-mix(in srgb, var(--accent) 35%, transparent)",
          borderRadius: 18,
          padding: "2rem",
          maxWidth: 520,
          width: "100%",
          position: "relative",
          boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
        }}
      >
        {/* Top accent line */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 4,
          background: "linear-gradient(to right, var(--accent), color-mix(in srgb, var(--accent) 40%, transparent))",
          borderRadius: "18px 18px 0 0",
        }} />

        {/* Header */}
        <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📓</div>
          <h2 style={{
            fontFamily: "var(--font-heading)", fontSize: "1.6rem", fontWeight: 700,
            color: "var(--accent)", margin: "0 0 6px",
          }}>
            Ласкаво просимо
          </h2>
          <p style={{ fontSize: 14, color: "var(--muted)", margin: 0 }}>
            Особистий щоденник-трекер. Веди як хочеш — нічого не обов'язково.
          </p>
        </div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: "1.5rem" }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{
              display: "flex", gap: 12, alignItems: "flex-start",
              background: "var(--surface2)", borderRadius: 10, padding: "10px 14px",
            }}>
              <span style={{ fontSize: 20, flexShrink: 0, lineHeight: 1.4 }}>{s.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)", marginBottom: 2 }}>
                  {s.title}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
                  {s.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={handleClose}
          style={{
            width: "100%", padding: "12px", borderRadius: 10,
            border: "none", background: "var(--accent)", color: "#000",
            fontWeight: 700, fontSize: 15, cursor: "pointer",
            fontFamily: "var(--font-body)",
          }}
        >
          Почати вести щоденник →
        </button>

        <p style={{ textAlign: "center", fontSize: 11, color: "var(--muted)", marginTop: 10, marginBottom: 0 }}>
          Це повідомлення більше не з'явиться
        </p>
      </div>
    </div>
  );
}
