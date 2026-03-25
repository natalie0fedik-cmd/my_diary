export interface DiaryTheme {
  id: string;
  nameUA: string;
  category: "темна" | "світла";
  emoji: string;
  vars: Record<string, string>;
  bgPattern?: string;
}

const INTER = "'Inter', system-ui, -apple-system, sans-serif";
const MONT  = "'Montserrat', system-ui, -apple-system, sans-serif";

export const THEMES: DiaryTheme[] = [

  // ══════════════════════════════════════════════════════════
  //  ТЕМНІ ТЕМИ
  // ══════════════════════════════════════════════════════════

  {
    id: "ocean",
    nameUA: "Океан",
    category: "темна",
    emoji: "🌊",
    vars: {
      "--bg":           "#06141B",
      "--surface":      "#0B2A36",
      "--surface2":     "#123F4F",
      "--border":       "#1A5568",
      "--accent":       "#3BC9DB",
      "--accent2":      "#22B8CF",
      "--accent-hover": "#22B8CF",
      "--accent-glow":  "rgba(59, 201, 219, 0.22)",
      "--text":         "#E6F7FF",
      "--muted":        "#9CC7D8",
      "--spine":        "#22B8CF",
      "--important":    "#F6A940",
      "--font-body":    INTER,
      "--font-heading": MONT,
    },
  },

  {
    id: "anime",
    nameUA: "Аніме ніч",
    category: "темна",
    emoji: "🌌",
    vars: {
      "--bg":           "#0A0A1A",
      "--surface":      "#141432",
      "--surface2":     "#1E1E48",
      "--border":       "#2E2E62",
      "--accent":       "#9D4EDD",
      "--accent2":      "#7B2CBF",
      "--accent-hover": "#7B2CBF",
      "--accent-glow":  "rgba(157, 78, 221, 0.22)",
      "--text":         "#F1F1FF",
      "--muted":        "#A8A8D8",
      "--spine":        "#7B2CBF",
      "--important":    "#4CC9F0",
      "--font-body":    INTER,
      "--font-heading": MONT,
    },
    bgPattern: "radial-gradient(ellipse at 50% -10%, rgba(157,78,221,0.12) 0%, transparent 55%)",
  },

  // ══════════════════════════════════════════════════════════
  //  СВІТЛІ ТЕМИ
  // ══════════════════════════════════════════════════════════

  {
    id: "milk",
    nameUA: "Молочний",
    category: "світла",
    emoji: "🥛",
    vars: {
      "--bg":           "#F8F9FB",
      "--surface":      "#FFFFFF",
      "--surface2":     "#EEF0F4",
      "--border":       "#E3E6EA",
      "--accent":       "#4C6FFF",
      "--accent2":      "#3B5BDB",
      "--accent-hover": "#3B5BDB",
      "--accent-glow":  "rgba(76, 111, 255, 0.15)",
      "--text":         "#1F2933",
      "--muted":        "#6B7280",
      "--spine":        "#4C6FFF",
      "--important":    "#E8507A",
      "--font-body":    INTER,
      "--font-heading": MONT,
    },
  },

  {
    id: "sakura",
    nameUA: "Сакура",
    category: "світла",
    emoji: "🌸",
    vars: {
      "--bg":           "#FFF5F7",
      "--surface":      "#FFFFFF",
      "--surface2":     "#FDE8EF",
      "--border":       "#F1D5DB",
      "--accent":       "#F06595",
      "--accent2":      "#D6336C",
      "--accent-hover": "#D6336C",
      "--accent-glow":  "rgba(240, 101, 149, 0.18)",
      "--text":         "#2D1E2F",
      "--muted":        "#8E6C88",
      "--spine":        "#D6336C",
      "--important":    "#4C6FFF",
      "--font-body":    INTER,
      "--font-heading": MONT,
    },
  },
];

// ── Custom theme ───────────────────────────────────────────────────────────────

export const CUSTOM_THEME_KEY = "diary_custom_theme";

export const DEFAULT_CUSTOM_VARS: Record<string, string> = {
  "--bg": "#F8F9FB", "--surface": "#FFFFFF", "--surface2": "#EEF0F4",
  "--border": "#E3E6EA",
  "--accent": "#4C6FFF", "--accent2": "#3B5BDB",
  "--accent-hover": "#3B5BDB", "--accent-glow": "rgba(76,111,255,0.15)",
  "--text": "#1F2933", "--muted": "#6B7280",
  "--spine": "#4C6FFF", "--important": "#E8507A",
  "--font-body": INTER, "--font-heading": MONT,
};

export function getCustomVars(): Record<string, string> {
  if (typeof window === "undefined") return DEFAULT_CUSTOM_VARS;
  const raw = localStorage.getItem(CUSTOM_THEME_KEY);
  return raw ? (JSON.parse(raw) as Record<string, string>) : { ...DEFAULT_CUSTOM_VARS };
}

export function saveCustomVars(vars: Record<string, string>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CUSTOM_THEME_KEY, JSON.stringify(vars));
}

// ── Utilities ─────────────────────────────────────────────────────────────────

export const THEME_KEY = "diary_theme";

export function getStoredTheme(): string {
  if (typeof window === "undefined") return "milk";
  return localStorage.getItem(THEME_KEY) || "milk";
}

export function applyTheme(themeId: string): void {
  const root = document.documentElement;
  if (themeId === "custom") {
    const vars = getCustomVars();
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    document.body.style.backgroundImage = "none";
    return;
  }
  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  document.body.style.backgroundImage = theme.bgPattern ?? "none";
}

export function saveTheme(themeId: string): void {
  localStorage.setItem(THEME_KEY, themeId);
  applyTheme(themeId);
}

export const THEME_BG_MAP: Record<string, string> = Object.fromEntries(
  THEMES.map((t) => [t.id, t.vars["--bg"]])
);
