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
  night: "#0f1117", forest: "#0c1410", coffee: "#120e0a", space: "#080810",
  milk: "#fafafa", sky: "#f5f7fa", peach: "#fdf6f0", spring: "#f5fbf7",
  sunset: "#1a0f08", lavender: "#f3f0ff", rose: "#fff4f7", shore: "#f7f4ef",
};

const foucScript = `(function(){try{
  var t=localStorage.getItem('diary_theme')||'night';
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
