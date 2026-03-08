import type { Metadata } from "next";
import "./globals.css";
import ThemeLoader from "@/components/ThemeLoader";

export const metadata: Metadata = {
  title: "Мій щоденник",
  description: "Особистий щоденник з планувальником",
};

// Compact bg map for FOUC prevention — injected as inline script
const BG_MAP: Record<string, string> = {
  forest: "#091408", sakura: "#160810", lavender: "#0d0b1a",
  ocean: "#020d18", autumn: "#120908", rose: "#140609",
  magical: "#0f0618", animenight: "#050514", ghibli: "#0d1508",
  kawaii: "#170d14", hogwarts: "#0a0505", starwars: "#020510",
  matrix: "#000a00", lotr: "#100c06", midnight: "#08080f",
  cyberpunk: "#050508", paper: "#f5f0e8",
};

const foucScript = `(function(){try{
  var t=localStorage.getItem('diary_theme')||'forest';
  var m=${JSON.stringify(BG_MAP)};
  if(m[t]){document.documentElement.style.setProperty('--bg',m[t]);}
}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk">
      <head>
        {/* Prevent flash of wrong background */}
        <script dangerouslySetInnerHTML={{ __html: foucScript }} />
      </head>
      <body>
        {/* Apply full theme on client */}
        <ThemeLoader />
        {/* Diary spine decoration — colour driven by CSS var */}
        <div
          style={{
            position: "fixed",
            left: 0, top: 0, bottom: 0,
            width: 14,
            background: "linear-gradient(to right, var(--spine) 0%, color-mix(in srgb, var(--spine) 60%, transparent) 50%, transparent 100%)",
            zIndex: 50,
            pointerEvents: "none",
          }}
        />
        {children}
      </body>
    </html>
  );
}
