"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", alignItems: "center", justifyContent: "center",
      paddingLeft: 14,
    }}>
      {/* Decorative lines background */}
      <div style={{
        position: "fixed", inset: 0, opacity: 0.03,
        backgroundImage: "repeating-linear-gradient(0deg, var(--text) 0px, var(--text) 1px, transparent 1px, transparent 28px)",
        pointerEvents: "none",
      }} />

      <div style={{
        background: "linear-gradient(135deg, var(--surface) 0%, var(--surface2) 100%)",
        border: "1px solid var(--border)",
        borderRadius: 20, padding: "3rem 2.5rem",
        width: "min(400px, 92vw)",
        position: "relative", overflow: "hidden",
        boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
      }}>
        {/* Top accent bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 4,
          background: "linear-gradient(to right, var(--accent), var(--accent2))",
        }} />
        {/* Spine */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 8,
          background: "linear-gradient(to right, var(--spine), transparent)",
        }} />
        {/* Corner decoration */}
        <div style={{
          position: "absolute", top: 12, left: 12, right: 12, bottom: 12,
          border: "1px solid var(--border)", borderRadius: 14, pointerEvents: "none",
        }} />

        <div style={{ textAlign: "center", position: "relative" }}>
          <div style={{
            fontFamily: "var(--font-body)", fontStyle: "italic",
            fontSize: "0.72rem", color: "var(--muted)",
            letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8,
          }}>
            Особистий щоденник
          </div>
          <h1 style={{
            fontFamily: "var(--font-heading)", fontSize: "2.8rem",
            fontWeight: 700, color: "var(--accent2)", margin: "0 0 6px",
            lineHeight: 1,
          }}>
            Мій Щоденник
          </h1>
          <p style={{
            fontFamily: "var(--font-body)", fontStyle: "italic",
            fontSize: "0.85rem", color: "var(--muted)", margin: "0 0 2.5rem",
          }}>
            Увійдіть, щоб продовжити
          </p>

          <button
            onClick={() => signIn("google", { callbackUrl })}
            style={{
              width: "100%", padding: "14px 20px",
              borderRadius: 12, cursor: "pointer",
              border: "1px solid var(--border)",
              background: "var(--surface2)",
              color: "var(--text)",
              fontSize: "0.95rem", fontFamily: "var(--font-body)",
              fontWeight: 600,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
              transition: "border-color 0.15s, background 0.15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
              (e.currentTarget as HTMLButtonElement).style.background = "var(--surface)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
              (e.currentTarget as HTMLButtonElement).style.background = "var(--surface2)";
            }}
          >
            {/* Google icon */}
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Увійти через Google
          </button>

          <p style={{
            fontFamily: "var(--font-body)", fontSize: "0.72rem",
            color: "var(--muted)", marginTop: "1.5rem", lineHeight: 1.5,
          }}>
            Ваші записи зберігаються лише у цьому браузері
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
