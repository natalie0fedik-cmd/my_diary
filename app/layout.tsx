import type { Metadata } from "next";
import "./globals.css";
import ThemeLoader from "@/components/ThemeLoader";
import AuthProvider from "@/components/AuthProvider";
import UserSync from "@/components/UserSync";

export const metadata: Metadata = {
  title: "Мій щоденник",
  description: "Особистий щоденник з планувальником",
};

// Compact bg map for FOUC prevention — injected as inline script
const BG_MAP: Record<string, string> = {
  forest: "#080f08", sakura: "#0e0608", lavender: "#09081a",
  ocean: "#010c18", autumn: "#0e0806", rose: "#0e0507",
  magical: "#0a0418", animenight: "#040412", ghibli: "#0a1208",
  kawaii: "#120c10", hogwarts: "#090404", starwars: "#020408",
  matrix: "#000800", lotr: "#0e0a04", midnight: "#06060e",
  cyberpunk: "#040408", paper: "#f5f0e8",
  pastel_milk: "#faf8f5", pastel_peach: "#fdf5ef", pastel_mint: "#f0faf5",
  pastel_lilac: "#f8f5ff", pastel_pink: "#fff5f8",
  pastel_sky: "#f0f7ff", pastel_lemon: "#fffdf0",
};

const foucScript = `(function(){try{
  var t=localStorage.getItem('diary_theme')||'forest';
  if(t==='custom'){
    var c=JSON.parse(localStorage.getItem('diary_custom_theme')||'{}');
    if(c['--bg'])document.documentElement.style.setProperty('--bg',c['--bg']);
  } else {
    var m=${JSON.stringify(BG_MAP)};
    if(m[t])document.documentElement.style.setProperty('--bg',m[t]);
  }
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
        <AuthProvider>
          <UserSync />
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
        </AuthProvider>
      </body>
    </html>
  );
}
