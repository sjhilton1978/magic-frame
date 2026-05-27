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
  // English is the primary language and the default for every new visitor.
  // German is only used if the user explicitly opts in via the locale switcher
  // (persisted in localStorage). No automatic navigator-language detection —
  // we want a single canonical first-impression UX, not a browser-dependent one.
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("mf-lang");
    if (saved === "en" || saved === "de") {
      setLocaleState(saved);
    }
    // else: stay on the "en" default — no auto-switch to German for DE browsers.
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
