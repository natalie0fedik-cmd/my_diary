export interface DiaryTheme {
  id: string;
  nameUA: string;
  category: "природа" | "аніме" | "фільми" | "мінімал" | "пастель";
  emoji: string;
  vars: Record<string, string>;
  bgPattern?: string;
}

export const THEMES: DiaryTheme[] = [
  // ── ПРИРОДА ──────────────────────────────────────────────────────────────
  {
    id: "forest", nameUA: "Зелений ліс", category: "природа", emoji: "🌿",
    vars: {
      "--bg": "#091408", "--surface": "#0e1c0f", "--surface2": "#132815",
      "--border": "#1c3520", "--accent": "#4ec564", "--accent2": "#86efac",
      "--text": "#c8e8c8", "--muted": "#8ab895", "--spine": "#265430",
      "--important": "#f6c547",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
  },
  {
    id: "sakura", nameUA: "Сакура", category: "природа", emoji: "🌸",
    vars: {
      "--bg": "#160810", "--surface": "#221018", "--surface2": "#2d1522",
      "--border": "#4a1f33", "--accent": "#f9a8d4", "--accent2": "#fce7f3",
      "--text": "#fce7f3", "--muted": "#d8a8c0", "--spine": "#8b3a5e",
      "--important": "#fbbf24",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
    bgPattern: "radial-gradient(circle at 15% 25%, #f9a8d408 0%, transparent 45%), radial-gradient(circle at 85% 75%, #e879f908 0%, transparent 45%)",
  },
  {
    id: "lavender", nameUA: "Лаванда", category: "природа", emoji: "💜",
    vars: {
      "--bg": "#0d0b1a", "--surface": "#16132a", "--surface2": "#1e1a36",
      "--border": "#342d5a", "--accent": "#a78bfa", "--accent2": "#ddd6fe",
      "--text": "#e9e3ff", "--muted": "#a898d8", "--spine": "#4c3899",
      "--important": "#f9a8d4",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
  },
  {
    id: "ocean", nameUA: "Океан", category: "природа", emoji: "🌊",
    vars: {
      "--bg": "#020d18", "--surface": "#071a28", "--surface2": "#0c2336",
      "--border": "#1a3d5c", "--accent": "#22d3ee", "--accent2": "#a5f3fc",
      "--text": "#e0f7ff", "--muted": "#72c0d8", "--spine": "#0e5272",
      "--important": "#f6c547",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
    bgPattern: "radial-gradient(ellipse at 50% 100%, #22d3ee08 0%, transparent 60%)",
  },
  {
    id: "autumn", nameUA: "Золота осінь", category: "природа", emoji: "🍂",
    vars: {
      "--bg": "#120908", "--surface": "#1e1008", "--surface2": "#2a1a0d",
      "--border": "#4a2e16", "--accent": "#fb923c", "--accent2": "#fed7aa",
      "--text": "#fef3c7", "--muted": "#c89060", "--spine": "#7c3d18",
      "--important": "#f6c547",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
  },
  {
    id: "rose", nameUA: "Трояндовий сад", category: "природа", emoji: "🌹",
    vars: {
      "--bg": "#140609", "--surface": "#200c12", "--surface2": "#2c111a",
      "--border": "#501c28", "--accent": "#fb7185", "--accent2": "#fecdd3",
      "--text": "#fff1f2", "--muted": "#d08898", "--spine": "#8b1c30",
      "--important": "#fbbf24",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
  },

  // ── ПАСТЕЛЬ ───────────────────────────────────────────────────────────────
  {
    id: "pastel_milk", nameUA: "Молочний", category: "пастель", emoji: "🥛",
    vars: {
      "--bg": "#faf8f5", "--surface": "#f5f2ed", "--surface2": "#ece8e0",
      "--border": "#d8d0c4", "--accent": "#7aaa8a", "--accent2": "#3d6b50",
      "--text": "#2c2520", "--muted": "#8a7d70", "--spine": "#7aaa8a",
      "--important": "#d4785a",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
  },
  {
    id: "pastel_peach", nameUA: "Персиковий", category: "пастель", emoji: "🍑",
    vars: {
      "--bg": "#fdf5ef", "--surface": "#faeee4", "--surface2": "#f5e4d5",
      "--border": "#e8cdb8", "--accent": "#c4784a", "--accent2": "#8c4e2a",
      "--text": "#2c1f15", "--muted": "#9a7055", "--spine": "#c4784a",
      "--important": "#7050c0",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
  },
  {
    id: "pastel_mint", nameUA: "М'ятний", category: "пастель", emoji: "🌿",
    vars: {
      "--bg": "#f0faf5", "--surface": "#e4f7ed", "--surface2": "#d2f0e0",
      "--border": "#aad8bf", "--accent": "#2a9a60", "--accent2": "#1a6b40",
      "--text": "#162a20", "--muted": "#4a8a65", "--spine": "#2a9a60",
      "--important": "#c04a6a",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
  },
  {
    id: "pastel_lilac", nameUA: "Бузковий", category: "пастель", emoji: "🪻",
    vars: {
      "--bg": "#f8f5ff", "--surface": "#f0eaff", "--surface2": "#e4d8ff",
      "--border": "#c8b8f0", "--accent": "#7040c0", "--accent2": "#4c2a9a",
      "--text": "#1e1530", "--muted": "#7a65a0", "--spine": "#7040c0",
      "--important": "#c4a030",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
  },
  {
    id: "pastel_pink", nameUA: "Рожевий", category: "пастель", emoji: "🩷",
    vars: {
      "--bg": "#fff5f8", "--surface": "#ffedf4", "--surface2": "#ffdde8",
      "--border": "#f5bdd0", "--accent": "#c0507a", "--accent2": "#8c3058",
      "--text": "#2a1520", "--muted": "#9a6070", "--spine": "#c0507a",
      "--important": "#5070c0",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
  },
  {
    id: "pastel_sky", nameUA: "Небесний", category: "пастель", emoji: "☁️",
    vars: {
      "--bg": "#f0f7ff", "--surface": "#e4f0ff", "--surface2": "#d2e5ff",
      "--border": "#aac8f0", "--accent": "#2a70c0", "--accent2": "#1a4e8c",
      "--text": "#151f2e", "--muted": "#4a7aa0", "--spine": "#2a70c0",
      "--important": "#c07a2a",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
  },
  {
    id: "pastel_lemon", nameUA: "Лимонний", category: "пастель", emoji: "🍋",
    vars: {
      "--bg": "#fffdf0", "--surface": "#fdfae8", "--surface2": "#faf5d5",
      "--border": "#e0d898", "--accent": "#b8900a", "--accent2": "#8c6c00",
      "--text": "#2a2510", "--muted": "#8a7840", "--spine": "#b8900a",
      "--important": "#c04060",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
  },

  // ── АНІМЕ ─────────────────────────────────────────────────────────────────
  {
    id: "magical", nameUA: "Магічна дівчинка", category: "аніме", emoji: "✨",
    vars: {
      "--bg": "#0f0618", "--surface": "#180c28", "--surface2": "#21123a",
      "--border": "#3d2060", "--accent": "#e879f9", "--accent2": "#f5d0fe",
      "--text": "#fdf4ff", "--muted": "#c880e8", "--spine": "#7e22ce",
      "--important": "#f9a8d4",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
    bgPattern: "radial-gradient(circle at 20% 30%, #e879f912 0%, transparent 50%), radial-gradient(circle at 80% 70%, #a78bfa12 0%, transparent 50%)",
  },
  {
    id: "animenight", nameUA: "Аніме ніч", category: "аніме", emoji: "🌙",
    vars: {
      "--bg": "#050514", "--surface": "#0c0c24", "--surface2": "#131338",
      "--border": "#2a2a60", "--accent": "#818cf8", "--accent2": "#c7d2fe",
      "--text": "#e0e7ff", "--muted": "#8888d0", "--spine": "#3730a3",
      "--important": "#34d399",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
    bgPattern: "radial-gradient(ellipse at 50% 0%, #1e1b4b28 0%, transparent 60%)",
  },
  {
    id: "ghibli", nameUA: "Студія Ґіблі", category: "аніме", emoji: "🏡",
    vars: {
      "--bg": "#0d1508", "--surface": "#172010", "--surface2": "#1f2d16",
      "--border": "#364e26", "--accent": "#84cc16", "--accent2": "#d9f99d",
      "--text": "#f7fee7", "--muted": "#96b860", "--spine": "#3f6212",
      "--important": "#f6c547",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
  },
  {
    id: "kawaii", nameUA: "Kawaii", category: "аніме", emoji: "🐱",
    vars: {
      "--bg": "#170d14", "--surface": "#231220", "--surface2": "#2e182b",
      "--border": "#53284e", "--accent": "#f472b6", "--accent2": "#fce7f3",
      "--text": "#fdf2f8", "--muted": "#dda0c8", "--spine": "#9d174d",
      "--important": "#fbbf24",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
    bgPattern: "radial-gradient(circle at 90% 10%, #f472b610 0%, transparent 40%), radial-gradient(circle at 10% 90%, #fb923c08 0%, transparent 40%)",
  },

  // ── ФІЛЬМИ / КНИГИ ────────────────────────────────────────────────────────
  {
    id: "hogwarts", nameUA: "Хогвартс", category: "фільми", emoji: "⚡",
    vars: {
      "--bg": "#0a0505", "--surface": "#160c0c", "--surface2": "#1f1010",
      "--border": "#4a2020", "--accent": "#d4a017", "--accent2": "#fde68a",
      "--text": "#f5e6d3", "--muted": "#c8a07a", "--spine": "#8b0000",
      "--important": "#d4a017",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
    bgPattern: "radial-gradient(ellipse at 30% 20%, #d4a01708 0%, transparent 50%)",
  },
  {
    id: "starwars", nameUA: "Зоряні Війни", category: "фільми", emoji: "⭐",
    vars: {
      "--bg": "#020510", "--surface": "#060c1e", "--surface2": "#0c1630",
      "--border": "#1c2d50", "--accent": "#60a5fa", "--accent2": "#bfdbfe",
      "--text": "#e0f0ff", "--muted": "#7aa0d0", "--spine": "#1e3a6e",
      "--important": "#f6c547",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
    bgPattern: "radial-gradient(ellipse at 50% 30%, #1e3a6e20 0%, transparent 60%)",
  },
  {
    id: "matrix", nameUA: "Матриця", category: "фільми", emoji: "💊",
    vars: {
      "--bg": "#000a00", "--surface": "#001200", "--surface2": "#001a00",
      "--border": "#003300", "--accent": "#00cc33", "--accent2": "#66ff77",
      "--text": "#00ff41", "--muted": "#00bb44", "--spine": "#005500",
      "--important": "#00ff41",
      "--font-body": "'Courier New', Courier, monospace",
      "--font-heading": "'Courier New', Courier, monospace",
    },
  },
  {
    id: "lotr", nameUA: "Середзем'я", category: "фільми", emoji: "💍",
    vars: {
      "--bg": "#100c06", "--surface": "#1c1508", "--surface2": "#261d0d",
      "--border": "#4a3820", "--accent": "#c8a94a", "--accent2": "#f0d888",
      "--text": "#f5e6c8", "--muted": "#b89860", "--spine": "#6b4c20",
      "--important": "#c8a94a",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
  },

  // ── МІНІМАЛ ───────────────────────────────────────────────────────────────
  {
    id: "midnight", nameUA: "Опівніч", category: "мінімал", emoji: "🌑",
    vars: {
      "--bg": "#08080f", "--surface": "#10101c", "--surface2": "#18182a",
      "--border": "#26263a", "--accent": "#8b5cf6", "--accent2": "#c4b5fd",
      "--text": "#e2e0ff", "--muted": "#8888b8", "--spine": "#3a2870",
      "--important": "#f6c547",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
  },
  {
    id: "cyberpunk", nameUA: "Кіберпанк", category: "мінімал", emoji: "🤖",
    vars: {
      "--bg": "#050508", "--surface": "#0c0c14", "--surface2": "#121220",
      "--border": "#202038", "--accent": "#06b6d4", "--accent2": "#67e8f9",
      "--text": "#e0f7fa", "--muted": "#58a8b8", "--spine": "#0e5c6e",
      "--important": "#f6c547",
      "--font-body": "system-ui, sans-serif", "--font-heading": "'Caveat', cursive",
    },
    bgPattern: "repeating-linear-gradient(0deg, transparent, transparent 39px, #06b6d408 39px, #06b6d408 40px)",
  },
  {
    id: "paper", nameUA: "Паперовий", category: "мінімал", emoji: "📄",
    vars: {
      "--bg": "#f5f0e8", "--surface": "#ede8df", "--surface2": "#e0dace",
      "--border": "#c8bea8", "--accent": "#5a6e3a", "--accent2": "#3d4f28",
      "--text": "#2d2520", "--muted": "#8a7d6a", "--spine": "#4a5835",
      "--important": "#b5451b",
      "--font-body": "'Lora', Georgia, serif", "--font-heading": "'Caveat', cursive",
    },
  },
];

// ── Custom theme ───────────────────────────────────────────────────────────────

export const CUSTOM_THEME_KEY = "diary_custom_theme";

export const DEFAULT_CUSTOM_VARS: Record<string, string> = {
  "--bg": "#faf8f5", "--surface": "#f5f2ed", "--surface2": "#ece8e0",
  "--border": "#d8d0c4", "--accent": "#7aaa8a", "--accent2": "#3d6b50",
  "--text": "#2c2520", "--muted": "#8a7d70", "--spine": "#7aaa8a",
  "--important": "#d4785a",
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
