import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchInitialData } from "./api";
import { updateData } from "./data";
import FALLBACK_DATA from "./fallback-data";
type Lang = "bn" | "en";
type Theme = "light" | "dark";

interface ShohayState {
  lang: Lang;
  theme: Theme;
  bnNumerals: boolean;
  toggleLang: () => void;
  toggleTheme: () => void;
  toggleNumerals: () => void;
}

const Ctx = createContext<ShohayState | null>(null);

export function ShohayProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("bn");
  const [theme, setTheme] = useState<Theme>("light");
  const [bnNumerals, setBnNumerals] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.setAttribute("lang", lang);
  }, [theme, lang]);

  const value = useMemo<ShohayState>(
    () => ({
      lang,
      theme,
      bnNumerals,
      toggleLang: () => setLang((l) => (l === "bn" ? "en" : "bn")),
      toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light")),
      toggleNumerals: () => setBnNumerals((n) => !n),
    }),
    [lang, theme, bnNumerals],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useShohay() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useShohay must be used within ShohayProvider");
  return ctx;
}

/** Pick the right string for the current language. */
export function useT() {
  const { lang } = useShohay();
  return (bn: string, en: string) => (lang === "bn" ? bn : en);
}

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function toBnDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => BN_DIGITS[+d]);
}

/** Format a number with thousands separators, optionally in Bengali numerals. */
export function useNum() {
  const { bnNumerals, lang } = useShohay();
  return (n: number, opts?: Intl.NumberFormatOptions) => {
    const s = new Intl.NumberFormat("en-IN", opts).format(n);
    return bnNumerals && lang === "bn" ? toBnDigits(s) : s;
  };
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetchInitialData()
      .then((data) => {
        updateData(data);
        setReady(true);
      })
      .catch((err) => {
        // No backend (e.g. the public Vercel demo): fall back to a baked-in
        // snapshot of /api/data so the dashboards still render with real data.
        console.warn("Shohay backend unavailable — using offline demo data.", err);
        updateData(FALLBACK_DATA);
        setReady(true);
      });
  }, []);


  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center p-4 text-center">
        <div className="animate-pulse text-ink-dim">Loading backend data...</div>
      </div>
    );
  }

  return <>{children}</>;
}
