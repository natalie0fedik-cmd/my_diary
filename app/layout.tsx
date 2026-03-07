import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Мій щоденник",
  description: "Особистий щоденник з планувальником",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk">
      <body>
        {/* Diary spine decoration */}
        <div
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
            width: 14,
            background:
              "linear-gradient(to right, #1a3a20 0%, #265430 40%, #1c3a22 70%, transparent 100%)",
            zIndex: 50,
            pointerEvents: "none",
          }}
        />
        {children}
      </body>
    </html>
  );
}
