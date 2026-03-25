export interface DiaryTheme {
  id: string;
  nameUA: string;
  category: "природа" | "аніме" | "фільми" | "мінімал" | "пастель";
  emoji: string;
  vars: Record<string, string>;
  bgPattern?: string;
}

// Contrast targets:
//  --text  vs --bg  ≥ 12:1  (near-white on near-black, or near-black on near-white)
//  --muted vs --bg  ≥ 5:1   (readable secondary text)
//  --accent on --bg ≥ 3:1   (decorative / large headings)

export const THEMES: DiaryTheme[] = [

  // ── ПРИРОДА ──────────────────────────────────────────────────────────────
  {
    id: "forest", nameUA: "Зелений ліс", category: "природа", emoji: "🌿",
    vars: {
      "--bg": "#080f08", "--surface": "#0f1a0f", "--surface2": "#172217",
      "--border": "#2d4d2d", "--accent": "#4ade80", "--accent2": "#a7f3c8",
      "--text": "#d8f0d8", "--muted": "#8ec898", "--spine": "#2d6e38",
      "--important": "#f6c547",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
  },
  {
    id: "sakura", nameUA: "Сакура", category: "природа", emoji: "🌸",
    vars: {
      "--bg": "#0e0608", "--surface": "#1a0d12", "--surface2": "#26121c",
      "--border": "#4d2035", "--accent": "#f472b6", "--accent2": "#fce7f3",
      "--text": "#fde8f5", "--muted": "#d490b8", "--spine": "#8b2252",
      "--important": "#fbbf24",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
    bgPattern: "radial-gradient(circle at 15% 25%, #f472b608 0%, transparent 45%), radial-gradient(circle at 85% 75%, #e879f908 0%, transparent 45%)",
  },
  {
    id: "lavender", nameUA: "Лаванда", category: "природа", emoji: "💜",
    vars: {
      "--bg": "#09081a", "--surface": "#120f28", "--surface2": "#1a1636",
      "--border": "#352c60", "--accent": "#a78bfa", "--accent2": "#ddd6fe",
      "--text": "#eae5ff", "--muted": "#a898d8", "--spine": "#4c3899",
      "--important": "#f9a8d4",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
  },
  {
    id: "ocean", nameUA: "Океан", category: "природа", emoji: "🌊",
    vars: {
      "--bg": "#010c18", "--surface": "#051620", "--surface2": "#0a2030",
      "--border": "#153a58", "--accent": "#38bdf8", "--accent2": "#bae6fd",
      "--text": "#ddf2ff", "--muted": "#7ac4e0", "--spine": "#0e5272",
      "--important": "#f6c547",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
    bgPattern: "radial-gradient(ellipse at 50% 100%, #38bdf808 0%, transparent 60%)",
  },
  {
    id: "autumn", nameUA: "Золота осінь", category: "природа", emoji: "🍂",
    vars: {
      "--bg": "#0e0806", "--surface": "#1c1008", "--surface2": "#281a0c",
      "--border": "#4e3018", "--accent": "#fb923c", "--accent2": "#fed7aa",
      "--text": "#fff2e0", "--muted": "#d09868", "--spine": "#7c3d18",
      "--important": "#f6c547",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
  },
  {
    id: "rose", nameUA: "Трояндовий сад", category: "природа", emoji: "🌹",
    vars: {
      "--bg": "#0e0507", "--surface": "#1c0c10", "--surface2": "#281018",
      "--border": "#522030", "--accent": "#fb7185", "--accent2": "#fecdd3",
      "--text": "#fff0f2", "--muted": "#d89098", "--spine": "#8b1c30",
      "--important": "#fbbf24",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
  },

  // ── ПАСТЕЛЬ (світлі теми) ─────────────────────────────────────────────────
  {
    id: "pastel_milk", nameUA: "Молочний", category: "пастель", emoji: "🥛",
    vars: {
      "--bg": "#faf8f5", "--surface": "#f2efe9", "--surface2": "#e8e4dc",
      "--border": "#c8c0b4", "--accent": "#5a9470", "--accent2": "#2e6045",
      "--text": "#1a1612", "--muted": "#645850", "--spine": "#7aaa8a",
      "--important": "#c05030",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
  },
  {
    id: "pastel_peach", nameUA: "Персиковий", category: "пастель", emoji: "🍑",
    vars: {
      "--bg": "#fdf5ef", "--surface": "#f8ece2", "--surface2": "#f2e0d0",
      "--border": "#dcc4aa", "--accent": "#a85830", "--accent2": "#6c3010",
      "--text": "#1e1208", "--muted": "#7a5038", "--spine": "#c4784a",
      "--important": "#6040b8",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
  },
  {
    id: "pastel_mint", nameUA: "М'ятний", category: "пастель", emoji: "🌿",
    vars: {
      "--bg": "#f0faf5", "--surface": "#e0f4eb", "--surface2": "#cceedc",
      "--border": "#90d0b0", "--accent": "#167848", "--accent2": "#0a5030",
      "--text": "#081a10", "--muted": "#305e42", "--spine": "#2a9a60",
      "--important": "#a83058",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
  },
  {
    id: "pastel_lilac", nameUA: "Бузковий", category: "пастель", emoji: "🪻",
    vars: {
      "--bg": "#f8f5ff", "--surface": "#ede5ff", "--surface2": "#dfd5ff",
      "--border": "#b8a5e8", "--accent": "#5828a8", "--accent2": "#380e7a",
      "--text": "#160e28", "--muted": "#504080", "--spine": "#7040c0",
      "--important": "#b08010",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
  },
  {
    id: "pastel_pink", nameUA: "Рожевий", category: "пастель", emoji: "🩷",
    vars: {
      "--bg": "#fff5f8", "--surface": "#fde8f0", "--surface2": "#fad5e6",
      "--border": "#edb0ca", "--accent": "#a02860", "--accent2": "#6c0c3a",
      "--text": "#1e0a14", "--muted": "#7a3050", "--spine": "#c0507a",
      "--important": "#3850c0",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
  },
  {
    id: "pastel_sky", nameUA: "Небесний", category: "пастель", emoji: "☁️",
    vars: {
      "--bg": "#f0f7ff", "--surface": "#e0eeff", "--surface2": "#cee3ff",
      "--border": "#9ac0e8", "--accent": "#0e50a0", "--accent2": "#083070",
      "--text": "#081428", "--muted": "#2a5888", "--spine": "#2a70c0",
      "--important": "#a86010",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
  },
  {
    id: "pastel_lemon", nameUA: "Лимонний", category: "пастель", emoji: "🍋",
    vars: {
      "--bg": "#fffdf0", "--surface": "#fdf8e0", "--surface2": "#f8f2c8",
      "--border": "#d8cc78", "--accent": "#906800", "--accent2": "#604400",
      "--text": "#1c1808", "--muted": "#6a5820", "--spine": "#b8900a",
      "--important": "#b03050",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
  },

  // ── АНІМЕ ─────────────────────────────────────────────────────────────────
  {
    id: "magical", nameUA: "Магічна дівчинка", category: "аніме", emoji: "✨",
    vars: {
      "--bg": "#0a0418", "--surface": "#140a28", "--surface2": "#1e1038",
      "--border": "#402068", "--accent": "#e879f9", "--accent2": "#f5d0fe",
      "--text": "#faf0ff", "--muted": "#c088e0", "--spine": "#7e22ce",
      "--important": "#f9a8d4",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
    bgPattern: "radial-gradient(circle at 20% 30%, #e879f912 0%, transparent 50%), radial-gradient(circle at 80% 70%, #a78bfa12 0%, transparent 50%)",
  },
  {
    id: "animenight", nameUA: "Аніме ніч", category: "аніме", emoji: "🌙",
    vars: {
      "--bg": "#040412", "--surface": "#0a0a22", "--surface2": "#121236",
      "--border": "#282868", "--accent": "#818cf8", "--accent2": "#c7d2fe",
      "--text": "#eef0ff", "--muted": "#9098d8", "--spine": "#3730a3",
      "--important": "#34d399",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
    bgPattern: "radial-gradient(ellipse at 50% 0%, #1e1b4b28 0%, transparent 60%)",
  },
  {
    id: "ghibli", nameUA: "Студія Ґіблі", category: "аніме", emoji: "🏡",
    vars: {
      "--bg": "#0a1208", "--surface": "#131e10", "--surface2": "#1c2c16",
      "--border": "#304820", "--accent": "#84cc16", "--accent2": "#d9f99d",
      "--text": "#f0fae0", "--muted": "#90b860", "--spine": "#3f6212",
      "--important": "#f6c547",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
  },
  {
    id: "kawaii", nameUA: "Kawaii", category: "аніме", emoji: "🐱",
    vars: {
      "--bg": "#120c10", "--surface": "#1e1420", "--surface2": "#2a1c2c",
      "--border": "#502850", "--accent": "#f472b6", "--accent2": "#fce7f3",
      "--text": "#fff0f8", "--muted": "#d898c0", "--spine": "#9d174d",
      "--important": "#fbbf24",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
    bgPattern: "radial-gradient(circle at 90% 10%, #f472b610 0%, transparent 40%), radial-gradient(circle at 10% 90%, #fb923c08 0%, transparent 40%)",
  },

  // ── ФІЛЬМИ / КНИГИ ────────────────────────────────────────────────────────
  {
    id: "hogwarts", nameUA: "Хогвартс", category: "фільми", emoji: "⚡",
    vars: {
      "--bg": "#090404", "--surface": "#140808", "--surface2": "#1e1010",
      "--border": "#4a2010", "--accent": "#d4a017", "--accent2": "#fde68a",
      "--text": "#fdf0e0", "--muted": "#c8a070", "--spine": "#8b0000",
      "--important": "#d4a017",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
    bgPattern: "radial-gradient(ellipse at 30% 20%, #d4a01708 0%, transparent 50%)",
  },
  {
    id: "starwars", nameUA: "Зоряні Війни", category: "фільми", emoji: "⭐",
    vars: {
      "--bg": "#020408", "--surface": "#06091c", "--surface2": "#0c1030",
      "--border": "#1c2a50", "--accent": "#60a5fa", "--accent2": "#bfdbfe",
      "--text": "#e8f4ff", "--muted": "#7aA8d8", "--spine": "#1e3a6e",
      "--important": "#f6c547",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
    bgPattern: "radial-gradient(ellipse at 50% 30%, #1e3a6e20 0%, transparent 60%)",
  },
  {
    id: "matrix", nameUA: "Матриця", category: "фільми", emoji: "💊",
    vars: {
      "--bg": "#000800", "--surface": "#001200", "--surface2": "#001c00",
      "--border": "#003800", "--accent": "#00dd44", "--accent2": "#88ff99",
      "--text": "#ccffaa", "--muted": "#44bb55", "--spine": "#005500",
      "--important": "#00ff41",
      "--font-body": "'Courier New', Courier, monospace",
      "--font-heading": "'Courier New', Courier, monospace",
    },
  },
  {
    id: "lotr", nameUA: "Середзем'я", category: "фільми", emoji: "💍",
    vars: {
      "--bg": "#0e0a04", "--surface": "#1a1206", "--surface2": "#241c0c",
      "--border": "#4a3818", "--accent": "#c8a94a", "--accent2": "#f0d888",
      "--text": "#fff2d8", "--muted": "#c09860", "--spine": "#6b4c20",
      "--important": "#c8a94a",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
  },

  // ── МІНІМАЛ ───────────────────────────────────────────────────────────────
  {
    id: "midnight", nameUA: "Опівніч", category: "мінімал", emoji: "🌑",
    vars: {
      "--bg": "#06060e", "--surface": "#0e0e1c", "--surface2": "#16162a",
      "--border": "#242438", "--accent": "#8b5cf6", "--accent2": "#c4b5fd",
      "--text": "#eeeeff", "--muted": "#9090c0", "--spine": "#3a2870",
      "--important": "#f6c547",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
  },
  {
    id: "cyberpunk", nameUA: "Кіберпанк", category: "мінімал", emoji: "🤖",
    vars: {
      "--bg": "#040408", "--surface": "#080814", "--surface2": "#101020",
      "--border": "#1e1e38", "--accent": "#06b6d4", "--accent2": "#67e8f9",
      "--text": "#d8f8ff", "--muted": "#68b0c0", "--spine": "#0e5c6e",
      "--important": "#f6c547",
      "--font-body": "system-ui, sans-serif", "--font-heading": "'Caveat', cursive",
    },
    bgPattern: "repeating-linear-gradient(0deg, transparent, transparent 39px, #06b6d408 39px, #06b6d408 40px)",
  },
  {
    id: "paper", nameUA: "Паперовий", category: "мінімал", emoji: "📄",
    vars: {
      "--bg": "#f5f0e8", "--surface": "#ece8de", "--surface2": "#e0d8cc",
      "--border": "#beb4a4", "--accent": "#466028", "--accent2": "#2c4018",
      "--text": "#1c1812", "--muted": "#66604e", "--spine": "#4a5835",
      "--important": "#b5451b",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
  },
];

// ── Custom theme ───────────────────────────────────────────────────────────────

export const CUSTOM_THEME_KEY = "diary_custom_theme";

export const DEFAULT_CUSTOM_VARS: Record<string, string> = {
  "--bg": "#faf8f5", "--surface": "#f2efe9", "--surface2": "#e8e4dc",
  "--border": "#c8c0b4", "--accent": "#5a9470", "--accent2": "#2e6045",
  "--text": "#1a1612", "--muted": "#645850", "--spine": "#7aaa8a",
  "--important": "#c05030",
  "--font-body": "'Lora', Georgia, serif",
  "--font-heading": "'Caveat', cursive",
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
  if (typeof window === "undefined") return "forest";
  return localStorage.getItem(THEME_KEY) || "forest";
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
