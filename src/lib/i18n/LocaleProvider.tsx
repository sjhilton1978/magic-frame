"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { EN } from "./en";

export type Locale = "de" | "en";

type LocaleCtx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  /** Translates — key is the German source text. Missing translation → returns key (German). */
  t: (de: string) => string;
};

const Ctx = createContext<LocaleCtx>({
  locale: "en",
  setLocale: () => {},
  // Even without a provider, render English when a translation exists.
  // If a key is missing in EN, we fall through to the original German text.
  t: (de) => EN[de] ?? de,
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  // Default to English for the global audience. On first mount we either
  // honour a saved choice (returning visitor) or fall back to the browser
  // language — a German browser will get German, everyone else gets English.
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("mf-lang");
    if (saved === "en" || saved === "de") {
      setLocaleState(saved);
      return;
    }
    // First visit — auto-detect from browser
    if (typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("de")) {
      setLocaleState("de");
    }
    // else: stay on the "en" default
  }, []);

  // Auch <html lang> aktualisieren (a11y / Browser-Hints)
  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem("mf-lang", l);
    } catch {}
  };

  const t = (de: string) => (locale === "en" ? EN[de] ?? de : de);

  return <Ctx.Provider value={{ locale, setLocale, t }}>{children}</Ctx.Provider>;
}

export const useLocale = () => useContext(Ctx);
/** Just the translation function. Outside a provider it falls back to the EN dict. */
export const useT = () => useContext(Ctx).t;
