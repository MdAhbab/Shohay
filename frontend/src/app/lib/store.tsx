import { createContext, useContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchInitialData } from "./api";
import { EMPTY_DATA, normalizeData, type AppData, type Need, type FieldLog, type MyDonation } from "./data";
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

// ---------------------------------------------------------------------------
// Reactive domain-data store. Data lives in React state (no module-level lets),
// so adding a need / field log / donation re-renders every consumer.
// ---------------------------------------------------------------------------

interface DataState {
  data: AppData;
  addNeed: (n: Need) => void;
  addFieldLog: (f: FieldLog) => void;
  addDonation: (d: MyDonation) => void;
}

const DataCtx = createContext<DataState | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(EMPTY_DATA);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchInitialData()
      .then((payload) => alive && setData(normalizeData(payload)))
      .catch((err) => {
        // No backend (e.g. a static demo): fall back to a baked-in snapshot of
        // /api/data so the dashboards still render with real-shaped data.
        console.warn("Shohay backend unavailable — using offline demo data.", err);
        if (alive) setData(normalizeData(FALLBACK_DATA));
      })
      .finally(() => alive && setReady(true));
    return () => { alive = false; };
  }, []);

  const addNeed = useCallback((n: Need) => setData((d) => ({ ...d, needs: [n, ...d.needs] })), []);
  const addFieldLog = useCallback((f: FieldLog) => setData((d) => ({ ...d, fieldLogs: [f, ...d.fieldLogs] })), []);
  const addDonation = useCallback((don: MyDonation) => setData((d) => ({ ...d, myDonations: [don, ...d.myDonations] })), []);

  const value = useMemo<DataState>(() => ({ data, addNeed, addFieldLog, addDonation }), [data, addNeed, addFieldLog, addDonation]);

  if (!ready) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 p-4 text-center">
        <span className="h-8 w-8 animate-pulse rounded-full border-2 border-river/40 border-t-river" aria-hidden />
        <div className="text-ink-dim">তথ্য লোড হচ্ছে · Loading…</div>
      </div>
    );
  }

  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>;
}

/** Live domain data — re-renders the caller whenever the store changes. */
export function useData(): AppData {
  const ctx = useContext(DataCtx);
  if (!ctx) throw new Error("useData must be used within AppDataProvider");
  return ctx.data;
}

/** Store mutators (add a need / field log / donation). */
export function useDataActions(): Omit<DataState, "data"> {
  const ctx = useContext(DataCtx);
  if (!ctx) throw new Error("useDataActions must be used within AppDataProvider");
  const { addNeed, addFieldLog, addDonation } = ctx;
  return { addNeed, addFieldLog, addDonation };
}
