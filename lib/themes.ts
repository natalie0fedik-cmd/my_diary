export interface DiaryTheme {
  id: string;
  nameUA: string;
  category: "природа" | "аніме" | "фільми" | "мінімал";
  emoji: string;
  vars: Record<string, string>;
  bgPattern?: string; // extra CSS background-image
}

export const THEMES: DiaryTheme[] = [
  // ── ПРИРОДА ──────────────────────────────────────────────────────────────
  {
    id: "forest",
    nameUA: "Зелений ліс",
    category: "природа",
    emoji: "🌿",
    vars: {
      "--bg": "#091408", "--surface": "#0e1c0f", "--surface2": "#132815",
      "--border": "#1c3520", "--accent": "#4ec564", "--accent2": "#86efac",
      "--text": "#b8d9b8", "--muted": "#5f8566", "--spine": "#265430",
      "--important": "#f6c547",
      "--font-body": "'Lora', Georgia, serif",
      "--font-heading": "'Caveat', cursive",
    },
  },
  {
    id: "sakura",
    nameUA: "Сакура",
    category: "природа",
    emoji: "🌸",
    vars: {
      "--bg": "#160810", "--surface": "#221018", "--surface2": "#2d1522",
      "--border": "#4a1f33", "--accent": "#f9a8d4", "--accent2": "#fce7f3",
      "--text": "#fce7f3", "--muted": "#c084a0", "--spine": "#8b3a5e",
      "--important": "#fbbf24",
      "--font-body": "'Lora', Georgia, serif",
      "--font-heading": "'Caveat', cursive",
    },
    bgPattern: "radial-gradient(circle at 15% 25%, #f9a8d408 0%, transparent 45%), radial-gradient(circle at 85% 75%, #e879f908 0%, transparent 45%)",
  },
  {
    id: "lavender",
    nameUA: "Лаванда",
    category: "природа",
    emoji: "💜",
    vars: {
      "--bg": "#0d0b1a", "--surface": "#16132a", "--surface2": "#1e1a36",
      "--border": "#342d5a", "--accent": "#a78bfa", "--accent2": "#ddd6fe",
      "--text": "#e9e3ff", "--muted": "#7c6faa", "--spine": "#4c3899",
      "--important": "#f9a8d4",
      "--font-body": "'Lora', Georgia, serif",
      "--font-heading": "'Caveat', cursive",
    },
  },
  {
    id: "ocean",
    nameUA: "Океан",
    category: "природа",
    emoji: "🌊",
    vars: {
      "--bg": "#020d18", "--surface": "#071a28", "--surface2": "#0c2336",
      "--border": "#1a3d5c", "--accent": "#22d3ee", "--accent2": "#a5f3fc",
      "--text": "#e0f7ff", "--muted": "#4a9ab5", "--spine": "#0e5272",
      "--important": "#f6c547",
      "--font-body": "'Lora', Georgia, serif",
      "--font-heading": "'Caveat', cursive",
    },
    bgPattern: "radial-gradient(ellipse at 50% 100%, #22d3ee08 0%, transparent 60%)",
  },
  {
    id: "autumn",
    nameUA: "Золота осінь",
    category: "природа",
    emoji: "🍂",
    vars: {
      "--bg": "#120908", "--surface": "#1e1008", "--surface2": "#2a1a0d",
      "--border": "#4a2e16", "--accent": "#fb923c", "--accent2": "#fed7aa",
      "--text": "#fef3c7", "--muted": "#9a6840", "--spine": "#7c3d18",
      "--important": "#f6c547",
      "--font-body": "'Lora', Georgia, serif",
      "--font-heading": "'Caveat', cursive",
    },
  },
  {
    id: "rose",
    nameUA: "Трояндовий сад",
    category: "природа",
    emoji: "🌹",
    vars: {
      "--bg": "#140609", "--surface": "#200c12", "--surface2": "#2c111a",
      "--border": "#501c28", "--accent": "#fb7185", "--accent2": "#fecdd3",
      "--text": "#fff1f2", "--muted": "#a8606e", "--spine": "#8b1c30",
      "--important": "#fbbf24",
      "--font-body": "'Lora', Georgia, serif",
      "--font-heading": "'Caveat', cursive",
    },
  },

  // ── АНІМЕ ─────────────────────────────────────────────────────────────────
  {
    id: "magical",
    nameUA: "Магічна дівчинка",
    category: "аніме",
    emoji: "✨",
    vars: {
      "--bg": "#0f0618", "--surface": "#180c28", "--surface2": "#21123a",
      "--border": "#3d2060", "--accent": "#e879f9", "--accent2": "#f5d0fe",
      "--text": "#fdf4ff", "--muted": "#a855c8", "--spine": "#7e22ce",
      "--important": "#f9a8d4",
      "--font-body": "'Lora', Georgia, serif",
      "--font-heading": "'Caveat', cursive",
    },
    bgPattern: "radial-gradient(circle at 20% 30%, #e879f912 0%, transparent 50%), radial-gradient(circle at 80% 70%, #a78bfa12 0%, transparent 50%)",
  },
  {
    id: "animenight",
    nameUA: "Аніме ніч",
    category: "аніме",
    emoji: "🌙",
    vars: {
      "--bg": "#050514", "--surface": "#0c0c24", "--surface2": "#131338",
      "--border": "#2a2a60", "--accent": "#818cf8", "--accent2": "#c7d2fe",
      "--text": "#e0e7ff", "--muted": "#5b5fa8", "--spine": "#3730a3",
      "--important": "#34d399",
      "--font-body": "'Lora', Georgia, serif",
      "--font-heading": "'Caveat', cursive",
    },
    bgPattern: "radial-gradient(ellipse at 50% 0%, #1e1b4b28 0%, transparent 60%)",
  },
  {
    id: "ghibli",
    nameUA: "Студія Ґіблі",
    category: "аніме",
    emoji: "🏡",
    vars: {
      "--bg": "#0d1508", "--surface": "#172010", "--surface2": "#1f2d16",
      "--border": "#364e26", "--accent": "#84cc16", "--accent2": "#d9f99d",
      "--text": "#f7fee7", "--muted": "#6a8f40", "--spine": "#3f6212",
      "--important": "#f6c547",
      "--font-body": "'Lora', Georgia, serif",
      "--font-heading": "'Caveat', cursive",
    },
  },
  {
    id: "kawaii",
    nameUA: "Kawaii",
    category: "аніме",
    emoji: "🐱",
    vars: {
      "--bg": "#170d14", "--surface": "#231220", "--surface2": "#2e182b",
      "--border": "#53284e", "--accent": "#f472b6", "--accent2": "#fce7f3",
      "--text": "#fdf2f8", "--muted": "#c47da8", "--spine": "#9d174d",
      "--important": "#fbbf24",
      "--font-body": "'Lora', Georgia, serif",
      "--font-heading": "'Caveat', cursive",
    },
    bgPattern: "radial-gradient(circle at 90% 10%, #f472b610 0%, transparent 40%), radial-gradient(circle at 10% 90%, #fb923c08 0%, transparent 40%)",
  },

  // ── ФІЛЬМИ / КНИГИ ────────────────────────────────────────────────────────
  {
    id: "hogwarts",
    nameUA: "Хогвартс",
    category: "фільми",
    emoji: "⚡",
    vars: {
      "--bg": "#0a0505", "--surface": "#160c0c", "--surface2": "#1f1010",
      "--border": "#4a2020", "--accent": "#d4a017", "--accent2": "#fde68a",
      "--text": "#f5e6d3", "--muted": "#9a7a5a", "--spine": "#8b0000",
      "--important": "#d4a017",
      "--font-body": "'Lora', Georgia, serif",
      "--font-heading": "'Caveat', cursive",
    },
    bgPattern: "radial-gradient(ellipse at 30% 20%, #d4a01708 0%, transparent 50%)",
  },
  {
    id: "starwars",
    nameUA: "Зоряні Війни",
    category: "фільми",
    emoji: "⭐",
    vars: {
      "--bg": "#020510", "--surface": "#060c1e", "--surface2": "#0c1630",
      "--border": "#1c2d50", "--accent": "#60a5fa", "--accent2": "#bfdbfe",
      "--text": "#e0f0ff", "--muted": "#4872a8", "--spine": "#1e3a6e",
      "--important": "#f6c547",
      "--font-body": "'Lora', Georgia, serif",
      "--font-heading": "'Caveat', cursive",
    },
    bgPattern: "radial-gradient(ellipse at 50% 30%, #1e3a6e20 0%, transparent 60%)",
  },
  {
    id: "matrix",
    nameUA: "Матриця",
    category: "фільми",
    emoji: "💊",
    vars: {
      "--bg": "#000a00", "--surface": "#001200", "--surface2": "#001a00",
      "--border": "#003300", "--accent": "#00cc33", "--accent2": "#66ff77",
      "--text": "#00ff41", "--muted": "#007722", "--spine": "#005500",
      "--important": "#00ff41",
      "--font-body": "'Courier New', Courier, monospace",
      "--font-heading": "'Courier New', Courier, monospace",
    },
  },
  {
    id: "lotr",
    nameUA: "Середзем'я",
    category: "фільми",
    emoji: "💍",
    vars: {
      "--bg": "#100c06", "--surface": "#1c1508", "--surface2": "#261d0d",
      "--border": "#4a3820", "--accent": "#c8a94a", "--accent2": "#f0d888",
      "--text": "#f5e6c8", "--muted": "#8c7040", "--spine": "#6b4c20",
      "--important": "#c8a94a",
      "--font-body": "'Lora', Georgia, serif",
      "--font-heading": "'Caveat', cursive",
    },
  },

  // ── МІНІМАЛ ───────────────────────────────────────────────────────────────
  {
    id: "midnight",
    nameUA: "Опівніч",
    category: "мінімал",
    emoji: "🌑",
    vars: {
      "--bg": "#08080f", "--surface": "#10101c", "--surface2": "#18182a",
      "--border": "#26263a", "--accent": "#8b5cf6", "--accent2": "#c4b5fd",
      "--text": "#e2e0ff", "--muted": "#585880", "--spine": "#3a2870",
      "--important": "#f6c547",
      "--font-body": "'Lora', Georgia, serif",
      "--font-heading": "'Caveat', cursive",
    },
  },
  {
    id: "cyberpunk",
    nameUA: "Кіберпанк",
    category: "мінімал",
    emoji: "🤖",
    vars: {
      "--bg": "#050508", "--surface": "#0c0c14", "--surface2": "#121220",
      "--border": "#202038", "--accent": "#06b6d4", "--accent2": "#67e8f9",
      "--text": "#e0f7fa", "--muted": "#2d7a8a", "--spine": "#0e5c6e",
      "--important": "#f6c547",
      "--font-body": "system-ui, sans-serif",
      "--font-heading": "'Caveat', cursive",
    },
    bgPattern: "repeating-linear-gradient(0deg, transparent, transparent 39px, #06b6d408 39px, #06b6d408 40px)",
  },
  {
    id: "paper",
    nameUA: "Паперовий",
    category: "мінімал",
    emoji: "📄",
    vars: {
      "--bg": "#f5f0e8", "--surface": "#ede8df", "--surface2": "#e0dace",
      "--border": "#c8bea8", "--accent": "#5a6e3a", "--accent2": "#3d4f28",
      "--text": "#2d2520", "--muted": "#8a7d6a", "--spine": "#4a5835",
      "--important": "#b5451b",
      "--font-body": "'Lora', Georgia, serif",
      "--font-heading": "'Caveat', cursive",
    },
  },
];

// ── Utilities ─────────────────────────────────────────────────────────────────

export const THEME_KEY = "diary_theme";

export function getStoredTheme(): string {
  if (typeof window === "undefined") return "forest";
  return localStorage.getItem(THEME_KEY) || "forest";
}

export function applyTheme(themeId: string): void {
  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  document.body.style.backgroundImage = theme.bgPattern ?? "none";
}

export function saveTheme(themeId: string): void {
  localStorage.setItem(THEME_KEY, themeId);
  applyTheme(themeId);
}

// Compact map used in inline FOUC script (only bg + text per theme)
export const THEME_BG_MAP: Record<string, { bg: string; text: string }> = Object.fromEntries(
  THEMES.map((t) => [t.id, { bg: t.vars["--bg"], text: t.vars["--text"] }])
);
