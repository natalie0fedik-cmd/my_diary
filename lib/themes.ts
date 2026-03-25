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

  // ── ТЕМНІ ТЕМИ (додаткові) ────────────────────────────────────────────────

  {
    id: "dark_forest",
    nameUA: "Темний ліс",
    category: "темна",
    emoji: "🌲",
    vars: {
      "--bg":           "#0B1A13",
      "--surface":      "#13261D",
      "--surface2":     "#1A3327",
      "--border":       "#1F3D2E",
      "--accent":       "#4CAF50",
      "--accent2":      "#3E9442",
      "--accent-hover": "#3E9442",
      "--accent-glow":  "rgba(76, 175, 80, 0.2)",
      "--text":         "#E6F4EA",
      "--muted":        "#9DC5AE",
      "--spine":        "#3E9442",
      "--important":    "#FFD43B",
      "--font-body":    INTER,
      "--font-heading": MONT,
    },
  },

  {
    id: "coal",
    nameUA: "Вугілля",
    category: "темна",
    emoji: "🔥",
    vars: {
      "--bg":           "#121212",
      "--surface":      "#1E1E1E",
      "--surface2":     "#2A2A2A",
      "--border":       "#2C2C2C",
      "--accent":       "#FF6B3D",
      "--accent2":      "#E85A2C",
      "--accent-hover": "#E85A2C",
      "--accent-glow":  "rgba(255, 107, 61, 0.2)",
      "--text":         "#F5F5F5",
      "--muted":        "#B0B0B0",
      "--spine":        "#E85A2C",
      "--important":    "#FFD43B",
      "--font-body":    INTER,
      "--font-heading": MONT,
    },
  },

  {
    id: "space",
    nameUA: "Космос",
    category: "темна",
    emoji: "🌌",
    vars: {
      "--bg":           "#05070D",
      "--surface":      "#0D1321",
      "--surface2":     "#152035",
      "--border":       "#1D2A44",
      "--accent":       "#5C7CFA",
      "--accent2":      "#4263EB",
      "--accent-hover": "#4263EB",
      "--accent-glow":  "rgba(92, 124, 250, 0.2)",
      "--text":         "#EAF1FF",
      "--muted":        "#9FB3D1",
      "--spine":        "#4263EB",
      "--important":    "#F6A940",
      "--font-body":    INTER,
      "--font-heading": MONT,
    },
    bgPattern: "radial-gradient(ellipse at 50% 0%, rgba(92,124,250,0.1) 0%, transparent 60%)",
  },

  {
    id: "cold",
    nameUA: "Холодний мінімал",
    category: "темна",
    emoji: "🧊",
    vars: {
      "--bg":           "#0F172A",
      "--surface":      "#1E293B",
      "--surface2":     "#293548",
      "--border":       "#334155",
      "--accent":       "#38BDF8",
      "--accent2":      "#0EA5E9",
      "--accent-hover": "#0EA5E9",
      "--accent-glow":  "rgba(56, 189, 248, 0.18)",
      "--text":         "#E2E8F0",
      "--muted":        "#94A3B8",
      "--spine":        "#0EA5E9",
      "--important":    "#F6A940",
      "--font-body":    INTER,
      "--font-heading": MONT,
    },
  },

  {
    id: "bordeaux",
    nameUA: "Бордо ніч",
    category: "темна",
    emoji: "🍷",
    vars: {
      "--bg":           "#1A0F14",
      "--surface":      "#2A1720",
      "--surface2":     "#36202C",
      "--border":       "#3D2230",
      "--accent":       "#E64980",
      "--accent2":      "#C2255C",
      "--accent-hover": "#C2255C",
      "--accent-glow":  "rgba(230, 73, 128, 0.2)",
      "--text":         "#FBEFF3",
      "--muted":        "#D4A5B5",
      "--spine":        "#C2255C",
      "--important":    "#FFD43B",
      "--font-body":    INTER,
      "--font-heading": MONT,
    },
  },

  // ── СВІТЛІ ТЕМИ (додаткові) ───────────────────────────────────────────────

  {
    id: "mint",
    nameUA: "М'ята свіжа",
    category: "світла",
    emoji: "🌿",
    vars: {
      "--bg":           "#F1FBF7",
      "--surface":      "#FFFFFF",
      "--surface2":     "#E0F5EC",
      "--border":       "#D2F1E4",
      "--accent":       "#2EC4B6",
      "--accent2":      "#20AFA3",
      "--accent-hover": "#20AFA3",
      "--accent-glow":  "rgba(46, 196, 182, 0.15)",
      "--text":         "#1B4332",
      "--muted":        "#52796F",
      "--spine":        "#20AFA3",
      "--important":    "#E64980",
      "--font-body":    INTER,
      "--font-heading": MONT,
    },
  },

  {
    id: "cloudy",
    nameUA: "Хмарний",
    category: "світла",
    emoji: "☁️",
    vars: {
      "--bg":           "#F4F6F8",
      "--surface":      "#FFFFFF",
      "--surface2":     "#EAECEF",
      "--border":       "#E1E5EA",
      "--accent":       "#748FFC",
      "--accent2":      "#5C7CFA",
      "--accent-hover": "#5C7CFA",
      "--accent-glow":  "rgba(116, 143, 252, 0.15)",
      "--text":         "#2F3E46",
      "--muted":        "#6C757D",
      "--spine":        "#5C7CFA",
      "--important":    "#E64980",
      "--font-body":    INTER,
      "--font-heading": MONT,
    },
  },

  {
    id: "peach",
    nameUA: "Персиковий",
    category: "світла",
    emoji: "🍑",
    vars: {
      "--bg":           "#FFF4F0",
      "--surface":      "#FFFFFF",
      "--surface2":     "#FFEBE3",
      "--border":       "#FFD8CC",
      "--accent":       "#FF8A65",
      "--accent2":      "#F46A4E",
      "--accent-hover": "#F46A4E",
      "--accent-glow":  "rgba(255, 138, 101, 0.18)",
      "--text":         "#3A2E2A",
      "--muted":        "#8D6E63",
      "--spine":        "#F46A4E",
      "--important":    "#5C7CFA",
      "--font-body":    INTER,
      "--font-heading": MONT,
    },
  },

  {
    id: "lemon",
    nameUA: "Лимонний крем",
    category: "світла",
    emoji: "🌼",
    vars: {
      "--bg":           "#FFFBEA",
      "--surface":      "#FFFFFF",
      "--surface2":     "#FFF5C8",
      "--border":       "#FFF1B8",
      "--accent":       "#F59F00",
      "--accent2":      "#E67700",
      "--accent-hover": "#E67700",
      "--accent-glow":  "rgba(245, 159, 0, 0.18)",
      "--text":         "#3B3B2E",
      "--muted":        "#8C8C5A",
      "--spine":        "#E67700",
      "--important":    "#E64980",
      "--font-body":    INTER,
      "--font-heading": MONT,
    },
  },

  {
    id: "teal",
    nameUA: "Бірюзовий",
    category: "світла",
    emoji: "💎",
    vars: {
      "--bg":           "#F0FDFA",
      "--surface":      "#FFFFFF",
      "--surface2":     "#CCFBF1",
      "--border":       "#CCFBF1",
      "--accent":       "#14B8A6",
      "--accent2":      "#0D9488",
      "--accent-hover": "#0D9488",
      "--accent-glow":  "rgba(20, 184, 166, 0.15)",
      "--text":         "#134E4A",
      "--muted":        "#4B7F7A",
      "--spine":        "#0D9488",
      "--important":    "#E64980",
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
