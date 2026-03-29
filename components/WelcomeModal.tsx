"use client";

import { markOnboardingSeen } from "@/lib/storage";

const STEPS = [
  {
    icon: "📅",
    title: "Вибір місяця і дня",
    desc: "Натисни на місяць, потім на будь-який день в календарі.",
    path: ["Головна", "Місяць", "День"],
  },
  {
    icon: "✍️",
    title: "Нотатки, задачі, розклад",
    desc: "Записуй думки, ставь галочки задачам, плануй по годинах.",
    path: ["День", "вкладка Нотатки"],
  },
  {
    icon: "😊",
    title: "Настрій",
    desc: "Оціни день від 1 до 5 — графік будується автоматично в підсумках місяця.",
    path: ["День", "блок Настрій"],
  },
  {
    icon: "🏃",
    title: "Активність і харчування",
    desc: "Кроки, вода, їжа — в окремих вкладках дня і місяця.",
    path: ["День", "вкладки Активність / Їжа"],
  },
  {
    icon: "💰",
    title: "Бюджет і цілі",
    desc: "Доходи, витрати по категоріях, місячні цілі з прогрес-баром.",
    path: ["Місяць", "вкладки Бюджет / Цілі"],
  },
  {
    icon: "✅",
    title: "Трекер звичок",
    desc: "Додай звички — і відмічай їх щодня прямо в картці дня.",
    path: ["Місяць", "вкладка Трекер"],
  },
];

function PathBreadcrumb({ steps }: { steps: string[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 3, marginTop: 5 }}>
      {steps.map((step, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <span style={{
            fontSize: 11,
            color: "var(--accent)",
            background: "color-mix(in srgb, var(--accent) 12%, transparent)",
            border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
            borderRadius: 5,
            padding: "1px 7px",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}>
            {step}
          </span>
          {i < steps.length - 1 && (
            <span style={{ fontSize: 10, color: "var(--muted)", opacity: 0.7 }}>›</span>
          )}
        </span>
      ))}
    </div>
  );
}

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
          maxWidth: 540,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
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
            Ось де знаходяться основні функції щоденника:
          </p>
        </div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: "1.5rem" }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{
              display: "flex", gap: 12, alignItems: "flex-start",
              background: "var(--surface2)", borderRadius: 10, padding: "12px 14px",
            }}>
              <span style={{ fontSize: 20, flexShrink: 0, lineHeight: 1.4, marginTop: 1 }}>{s.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)", marginBottom: 2 }}>
                  {s.title}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5, marginBottom: 4 }}>
                  {s.desc}
                </div>
                <PathBreadcrumb steps={s.path} />
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
