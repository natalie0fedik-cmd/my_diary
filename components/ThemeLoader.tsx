"use client";

import { useEffect } from "react";
import { getStoredTheme, applyTheme } from "@/lib/themes";

export default function ThemeLoader() {
  useEffect(() => {
    applyTheme(getStoredTheme());
  }, []);
  return null;
}
