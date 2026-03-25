export interface DiaryTheme {
  id: string;
  nameUA: string;
  category: "темна" | "світла" | "кольорова";
  emoji: string;
  vars: Record<string, string>;
  bgPattern?: string;
}

// ── ШРИФТИ ────────────────────────────────────────────────────────────────────
const INTER   = "'Inter', system-ui, sans-serif";
const MONT    = "'Montserrat', system-ui, sans-serif";
const POPPINS = "'Poppins', system-ui, sans-serif";
const PLAYFAIR = "'Playfair Display', Georgia, serif";

// ── ТЕМИ ─────────────────────────────────────────────────────────────────────
// Contrast targets:
//   --text  vs --bg  ≥ 12:1
//   --muted vs --bg  ≥  5:1

export const THEMES: DiaryTheme[] = [

  // ╔══════════════════════════════════════════════════════════════╗
  // ║  ТЕМНІ ТЕМИ                                                  ║
  // ╚══════════════════════════════════════════════════════════════╝

  {
    id: "night",
    nameUA: "Нічне місто",
    category: "темна",
    emoji: "🌃",
    vars: {
      "--bg": "#0f1117",
      "--surface": "#1a1d24",
      "--surface2": "#22262f",
      "--border": "#2e3340",
      "--accent": "#6c8ef7",      // soft blue
      "--accent2": "#4468e8",
      "--text": "#eef0f5",
      "--muted": "#8892a8",
      "--spine": "#4468e8",
      "--important": "#f6a940",
      "--font-body": INTER,
      "--font-heading": MONT,
    },
  },

  {
    id: "forest",
    nameUA: "Ліс",
    category: "темна",
    emoji: "🌲",
    vars: {
      "--bg": "#0c1410",
      "--surface": "#131e18",
      "--surface2": "#1c2a20",
      "--border": "#2a4030",
      "--accent": "#3ecf6a",      // vibrant green
      "--accent2": "#2aaa58",
      "--text": "#e8f5ec",
      "--muted": "#7ab88a",
      "--spine": "#2a7a40",
      "--important": "#f6c547",
      "--font-body": INTER,
      "--font-heading": MONT,
    },
  },

  {
    id: "coffee",
    nameUA: "Кава",
    category: "темна",
    emoji: "☕",
    vars: {
      "--bg": "#120e0a",
      "--surface": "#1e1812",
      "--surface2": "#2a2218",
      "--border": "#3e3020",
      "--accent": "#d4864a",      // warm amber
      "--accent2": "#f0a668",
      "--text": "#f5ede4",
      "--muted": "#b09070",
      "--spine": "#8c5420",
      "--important": "#f6c547",
      "--font-body": INTER,
      "--font-heading": PLAYFAIR,
    },
  },

  {
    id: "space",
    nameUA: "Космос",
    category: "темна",
    emoji: "🔭",
    vars: {
      "--bg": "#080810",
      "--surface": "#101018",
      "--surface2": "#181824",
      "--border": "#262640",
      "--accent": "#9060f0",      // violet
      "--accent2": "#c090ff",
      "--text": "#f0eeff",
      "--muted": "#9090c0",
      "--spine": "#6040c0",
      "--important": "#f6a940",
      "--font-body": INTER,
      "--font-heading": MONT,
    },
    bgPattern: "radial-gradient(ellipse at 50% 0%, #9060f012 0%, transparent 60%)",
  },

  // ╔══════════════════════════════════════════════════════════════╗
  // ║  СВІТЛІ ТЕМИ                                                 ║
  // ╚══════════════════════════════════════════════════════════════╝

  {
    id: "milk",
    nameUA: "Молочний",
    category: "світла",
    emoji: "🥛",
    vars: {
      "--bg": "#fafafa",
      "--surface": "#f4f4f5",
      "--surface2": "#e8e8ea",
      "--border": "#d0d0d4",
      "--accent": "#4a8c60",      // sage green
      "--accent2": "#2e6040",
      "--text": "#18181a",
      "--muted": "#52525a",
      "--spine": "#5a9a70",
      "--important": "#c05030",
      "--font-body": INTER,
      "--font-heading": MONT,
    },
  },

  {
    id: "sky",
    nameUA: "Хмари",
    category: "світла",
    emoji: "☁️",
    vars: {
      "--bg": "#f5f7fa",
      "--surface": "#eef0f5",
      "--surface2": "#e2e5ee",
      "--border": "#c8cdd8",
      "--accent": "#2d5ca8",      // navy blue
      "--accent2": "#1a3d7a",
      "--text": "#1a1e2c",
      "--muted": "#4a5068",
      "--spine": "#3d6ab8",
      "--important": "#c06030",
      "--font-body": INTER,
      "--font-heading": MONT,
    },
  },

  {
    id: "peach",
    nameUA: "Персик",
    category: "світла",
    emoji: "🍑",
    vars: {
      "--bg": "#fdf6f0",
      "--surface": "#f8ede4",
      "--surface2": "#f0e0d0",
      "--border": "#ddc8b4",
      "--accent": "#c06040",      // terracotta
      "--accent2": "#903820",
      "--text": "#1e1410",
      "--muted": "#6a4a38",
      "--spine": "#c87858",
      "--important": "#6040b8",
      "--font-body": INTER,
      "--font-heading": PLAYFAIR,
    },
  },

  {
    id: "spring",
    nameUA: "Весна",
    category: "світла",
    emoji: "🌱",
    vars: {
      "--bg": "#f5fbf7",
      "--surface": "#eaf5ed",
      "--surface2": "#d8eedf",
      "--border": "#b0d8bc",
      "--accent": "#187840",      // forest green
      "--accent2": "#0d5028",
      "--text": "#0e1a12",
      "--muted": "#3a6a4a",
      "--spine": "#28a060",
      "--important": "#a83058",
      "--font-body": POPPINS,
      "--font-heading": MONT,
    },
  },

  // ╔══════════════════════════════════════════════════════════════╗
  // ║  КОЛЬОРОВІ ТЕМИ                                              ║
  // ╚══════════════════════════════════════════════════════════════╝

  {
    id: "sunset",
    nameUA: "Захід сонця",
    category: "кольорова",
    emoji: "🌅",
    vars: {
      "--bg": "#1a0f08",
      "--surface": "#261608",
      "--surface2": "#321c0a",
      "--border": "#4e2e10",
      "--accent": "#e08030",      // sunset orange
      "--accent2": "#f0a850",
      "--text": "#fff2e4",
      "--muted": "#c09060",
      "--spine": "#803c10",
      "--important": "#60a0f0",
      "--font-body": INTER,
      "--font-heading": PLAYFAIR,
    },
  },

  {
    id: "lavender",
    nameUA: "Лаванда",
    category: "кольорова",
    emoji: "💜",
    vars: {
      "--bg": "#f3f0ff",
      "--surface": "#ebe5ff",
      "--surface2": "#dfd8ff",
      "--border": "#c0b0f0",
      "--accent": "#5828a8",      // deep purple
      "--accent2": "#3a1880",
      "--text": "#140c28",
      "--muted": "#504078",
      "--spine": "#7048c0",
      "--important": "#b08010",
      "--font-body": INTER,
      "--font-heading": MONT,
    },
  },

  {
    id: "rose",
    nameUA: "Рожевий",
    category: "кольорова",
    emoji: "🌹",
    vars: {
      "--bg": "#fff4f7",
      "--surface": "#fde8ef",
      "--surface2": "#fad5e6",
      "--border": "#edb0c8",
      "--accent": "#a02860",      // deep rose
      "--accent2": "#6c0c3a",
      "--text": "#1e0a14",
      "--muted": "#7a3050",
      "--spine": "#d04080",
      "--important": "#3850c0",
      "--font-body": INTER,
      "--font-heading": PLAYFAIR,
    },
  },

  {
    id: "shore",
    nameUA: "Берег",
    category: "кольорова",
    emoji: "🏖️",
    vars: {
      "--bg": "#f7f4ef",
      "--surface": "#ede8e0",
      "--surface2": "#e0d8cc",
      "--border": "#c8bca8",
      "--accent": "#2868a8",      // ocean blue
      "--accent2": "#184880",
      "--text": "#141018",
      "--muted": "#4a5868",
      "--spine": "#3878b8",
      "--important": "#c06830",
      "--font-body": INTER,
      "--font-heading": POPPINS,
    },
  },
];

// ── Custom theme ───────────────────────────────────────────────────────────────

export const CUSTOM_THEME_KEY = "diary_custom_theme";

export const DEFAULT_CUSTOM_VARS: Record<string, string> = {
  "--bg": "#fafafa",
  "--surface": "#f4f4f5",
  "--surface2": "#e8e8ea",
  "--border": "#d0d0d4",
  "--accent": "#4a8c60",
  "--accent2": "#2e6040",
  "--text": "#18181a",
  "--muted": "#52525a",
  "--spine": "#5a9a70",
  "--important": "#c05030",
  "--font-body": INTER,
  "--font-heading": MONT,
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
  if (typeof window === "undefined") return "night";
  return localStorage.getItem(THEME_KEY) || "night";
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

// Compact map used in inline FOUC script (only bg per theme)
export const THEME_BG_MAP: Record<string, string> = Object.fromEntries(
  THEMES.map((t) => [t.id, t.vars["--bg"]])
);
