"use client";
import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

type Language = "en" | "am";

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  // Initialize from localStorage once
  useEffect(() => {
    try {
      const saved = typeof window !== "undefined" ? (localStorage.getItem("lang") as Language | null) : null;
      if (saved === "en" || saved === "am") setLangState(saved);
    } catch {}
  }, []);

  // Persist on change
  useEffect(() => {
    try {
      if (typeof window !== "undefined") localStorage.setItem("lang", lang);
    } catch {}
  }, [lang]);

  const setLang = (l: Language) => setLangState(l);
  const value = useMemo(() => ({ lang, setLang }), [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
