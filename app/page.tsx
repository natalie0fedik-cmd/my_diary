"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { exportAllData, importAllData } from "@/lib/storage";
import { uploadAllToCloud, forceDownloadFromCloud } from "@/lib/cloudSync";
import dynamic from "next/dynamic";

const ThemePicker = dynamic(() => import("@/components/ThemePicker"), { ssr: false });

const MONTHS_UA = [
  "Січень", "Лютий", "Березень", "Квітень",
  "Травень", "Червень", "Липень", "Серпень",
  "Вересень", "Жовтень", "Листопад", "Грудень",
];

const MONTH_COLORS = [
  "#4ade80", "#22c55e", "#86efac", "#34d399",
  "#10b981", "#059669", "#4ec564", "#84cc16",
  "#a3e635", "#52c46a", "#16a34a", "#34d399",
];

export default function Home() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  function handleExport() {
    const json = exportAllData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `diary-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleUploadToCloud() {
    setUploading(true);
    const count = await uploadAllToCloud();
    setUploading(false);
    alert(count > 0 ? `Завантажено ${count} записів у хмару ✓` : "Немає даних для завантаження");
  }

  async function handleDownloadFromCloud() {
    setDownloading(true);
    const count = await forceDownloadFromCloud();
    setDownloading(false);
    if (count > 0) {
      alert(`Отримано ${count} записів з хмари ✓`);
      window.location.reload();
    } else {
      alert("Хмара порожня або помилка");
    }
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        importAllData(ev.target?.result as string);
        window.location.reload();
      } catch {
        alert("Помилка читання файлу");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingLeft: 28 }}>
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "2.5rem 1.5rem" }}>

        {/* Diary Cover Header */}
        <div style={{
          background: "linear-gradient(135deg, var(--surface) 0%, var(--surface2) 50%, var(--surface) 100%)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "2rem 2rem 1.5rem",
          marginBottom: "2rem",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* decorative corner lines */}
          <div style={{
            position: "absolute", top: 12, left: 12, right: 12, bottom: 12,
            border: "1px solid var(--border)",
            borderRadius: 10,
            pointerEvents: "none",
          }} />

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{
                fontFamily: "'Lora', Georgia, serif",
                fontSize: "0.72rem",
                color: "var(--text)",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                marginBottom: 6,
                opacity: 0.7,
              }}>
                Особистий щоденник
              </div>
              <h1 style={{
                fontFamily: "'Caveat', cursive",
                fontSize: "3rem",
                fontWeight: 700,
                color: "var(--accent2)",
                margin: 0,
                lineHeight: 1,
                letterSpacing: "-1px",
              }}>
                Мій Щоденник
              </h1>
              <div style={{
                fontFamily: "'Lora', Georgia, serif",
                fontStyle: "italic",
                fontSize: "0.85rem",
                color: "var(--text)",
                marginTop: 8,
                opacity: 0.75,
              }}>
                Планувальник · Розклад · Нотатки · KPI
              </div>
              {session?.user && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                  {session.user.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={session.user.image} alt="" style={{ width: 22, height: 22, borderRadius: "50%", border: "1px solid var(--border)" }} />
                  )}
                  <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontFamily: "'Lora', Georgia, serif" }}>
                    {session.user.email}
                  </span>
                  <button
                    onClick={() => { localStorage.removeItem("diary_current_user"); signOut({ callbackUrl: "/login" }); }}
                    style={{
                      padding: "2px 10px", borderRadius: 6,
                      border: "1px solid var(--border)", background: "var(--surface2)",
                      color: "var(--muted)", cursor: "pointer",
                      fontSize: "0.72rem", fontFamily: "'Lora', Georgia, serif",
                    }}
                  >
                    Вийти
                  </button>
                </div>
              )}
            </div>

            {/* Controls */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
              {/* Year switcher */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  onClick={() => setYear(y => y - 1)}
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--surface2)",
                    color: "var(--text)", cursor: "pointer",
                    fontSize: "1.1rem", fontFamily: "'Caveat', cursive",
                  }}
                >‹</button>
                <span style={{
                  fontFamily: "'Caveat', cursive",
                  fontSize: "1.6rem", fontWeight: 700,
                  minWidth: 54, textAlign: "center", color: "var(--accent2)",
                }}>
                  {year}
                </span>
                <button
                  onClick={() => setYear(y => y + 1)}
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--surface2)",
                    color: "var(--text)", cursor: "pointer",
                    fontSize: "1.1rem", fontFamily: "'Caveat', cursive",
                  }}
                >›</button>
              </div>

              {/* Save / Load / Theme */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <button
                  onClick={handleExport}
                  title="Зберегти всі дані як JSON файл"
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--surface2)",
                    color: "var(--muted)",
                    cursor: "pointer",
                    fontSize: "0.78rem",
                    fontFamily: "'Lora', Georgia, serif",
                    display: "flex", alignItems: "center", gap: 5,
                  }}
                >
                  <span>&#8595;</span> Зберегти
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Завантажити резервну копію"
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--surface2)",
                    color: "var(--muted)",
                    cursor: "pointer",
                    fontSize: "0.78rem",
                    fontFamily: "'Lora', Georgia, serif",
                    display: "flex", alignItems: "center", gap: 5,
                  }}
                >
                  <span>&#8593;</span> Завантажити
                </button>
                <button
                  onClick={handleUploadToCloud}
                  disabled={uploading}
                  title="Завантажити всі дані з цього пристрою в хмару"
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--surface2)",
                    color: "var(--muted)",
                    cursor: uploading ? "default" : "pointer",
                    fontSize: "0.78rem",
                    fontFamily: "'Lora', Georgia, serif",
                    display: "flex", alignItems: "center", gap: 5,
                    opacity: uploading ? 0.6 : 1,
                  }}
                >
                  ☁ {uploading ? "..." : "Синх"}
                </button>
                <button
                  onClick={handleDownloadFromCloud}
                  disabled={downloading}
                  title="Завантажити дані з хмари на цей пристрій"
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--surface2)",
                    color: "var(--muted)",
                    cursor: downloading ? "default" : "pointer",
                    fontSize: "0.78rem",
                    fontFamily: "'Lora', Georgia, serif",
                    display: "flex", alignItems: "center", gap: 5,
                    opacity: downloading ? 0.6 : 1,
                  }}
                >
                  ☁ {downloading ? "..." : "↓ Хмара"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  style={{ display: "none" }}
                />
                <button
                  onClick={() => setShowThemePicker(true)}
                  title="Змінити тему щоденника"
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: "1px solid var(--accent)",
                    background: "var(--accent)",
                    color: "var(--bg)",
                    cursor: "pointer",
                    fontSize: "0.78rem",
                    fontFamily: "var(--font-body)",
                    fontWeight: 700,
                    display: "flex", alignItems: "center", gap: 5,
                  }}
                >
                  Тема
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Months grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 12,
        }}>
          {MONTHS_UA.map((name, idx) => {
            const isCurrentMonth = idx === currentMonth && year === currentYear;
            const isPast = year < currentYear || (year === currentYear && idx < currentMonth);
            const color = MONTH_COLORS[idx];
            const monthStr = String(idx + 1).padStart(2, "0");

            return (
              <Link key={idx} href={`/month/${year}/${monthStr}`} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    background: isCurrentMonth ? `${color}15` : "var(--surface)",
                    border: `1px solid ${isCurrentMonth ? color : "var(--border)"}`,
                    borderRadius: 12,
                    padding: "1.1rem 1.1rem 1rem",
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                    transition: "border-color 0.15s, background 0.15s, transform 0.12s",
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.borderColor = color;
                    el.style.background = `${color}18`;
                    el.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.borderColor = isCurrentMonth ? color : "var(--border)";
                    el.style.background = isCurrentMonth ? `${color}15` : "var(--surface)";
                    el.style.transform = "translateY(0)";
                  }}
                >
                  {/* Top color strip */}
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0,
                    height: 3, background: color,
                    opacity: isCurrentMonth ? 1 : 0.4,
                  }} />

                  <div style={{ marginTop: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{
                          fontSize: "0.68rem", color: "var(--muted)",
                          marginBottom: 4, letterSpacing: "0.05em",
                          fontFamily: "'Lora', Georgia, serif",
                        }}>
                          {monthStr} · {year}
                        </div>
                        <div style={{
                          fontFamily: "'Caveat', cursive",
                          fontSize: "1.4rem", fontWeight: 700,
                          color: isCurrentMonth ? color : "var(--accent2)",
                          lineHeight: 1,
                        }}>
                          {name}
                        </div>
                      </div>
                      {isCurrentMonth && (
                        <span style={{
                          fontSize: "0.6rem", background: color, color: "#051208",
                          borderRadius: 5, padding: "2px 6px", fontWeight: 700,
                          whiteSpace: "nowrap", marginTop: 2,
                          fontFamily: "'Lora', Georgia, serif",
                        }}>
                          зараз
                        </span>
                      )}
                      {isPast && !isCurrentMonth && (
                        <span style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 2 }}>&#10003;</span>
                      )}
                    </div>

                    <div style={{ marginTop: 10, display: "flex", gap: 5 }}>
                      {["календар", "висновки"].map(label => (
                        <span key={label} style={{
                          fontSize: "0.62rem",
                          color: "var(--muted)",
                          background: "var(--surface2)",
                          borderRadius: 4,
                          padding: "2px 6px",
                          fontFamily: "'Lora', Georgia, serif",
                        }}>
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div style={{
          marginTop: "1.5rem", textAlign: "center",
          fontFamily: "var(--font-heading)",
          color: "var(--muted)", fontSize: "1rem",
          letterSpacing: "0.03em",
        }}>
          Оберіть місяць, щоб переглянути записи
        </div>
      </div>

      {showThemePicker && (
        <ThemePicker onClose={() => setShowThemePicker(false)} />
      )}
    </div>
  );
}
