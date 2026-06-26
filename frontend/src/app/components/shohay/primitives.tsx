import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { motion, useInView, animate } from "motion/react";
import { ShieldCheck } from "lucide-react";
import { useShohay, useT, toBnDigits } from "../../lib/store";

/** Compact KPI card used across stakeholder dashboards. */
export function StatCard({
  icon: Icon,
  bn,
  en,
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  gold = false,
  hint,
}: {
  icon?: ComponentType<{ className?: string }>;
  bn: string;
  en: string;
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  gold?: boolean;
  hint?: ReactNode;
}) {
  const t = useT();
  return (
    <div className="rounded-2xl border border-border bg-bg-elev p-5">
      <div className="flex items-center justify-between text-ink-dim">
        <span className="text-sm">{t(bn, en)}</span>
        {Icon && <Icon className="h-4 w-4 text-river" />}
      </div>
      <div className="mt-2 text-[clamp(1.5rem,3.5vw,2rem)]">
        <NumberCounter value={value} decimals={decimals} prefix={prefix} suffix={suffix} gold={gold} />
      </div>
      {hint && <div className="mt-1 text-xs text-ink-dim">{hint}</div>}
    </div>
  );
}

/** Count-up number with tabular figures + optional gold underline (the only gold motion). */
export function NumberCounter({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  gold = false,
  className = "",
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  gold?: boolean;
  className?: string;
}) {
  const { bnNumerals, lang } = useShohay();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: [0.22, 0.61, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, value]);

  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(display);
  const shown = bnNumerals && lang === "bn" ? toBnDigits(formatted) : formatted;

  return (
    <span ref={ref} className={`relative inline-flex flex-col items-start ${className}`}>
      <span className="tabular">
        {prefix}
        {shown}
        {suffix}
      </span>
      {gold && (
        <motion.span
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1, delay: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
          style={{ originX: 0 }}
          className="mt-1 h-[3px] w-full rounded-full bg-gold"
        />
      )}
    </span>
  );
}

// Severity 1–5 maps onto the 5-step need-intensity scale (need-0 … need-4),
// matching the map legend so colour reads consistently across surfaces.
const SEVERITY = {
  1: { bn: "নিম্ন", en: "Low", v: "--need-0" },
  2: { bn: "মাঝারি", en: "Moderate", v: "--need-1" },
  3: { bn: "উচ্চ", en: "High", v: "--need-2" },
  4: { bn: "গুরুতর", en: "Severe", v: "--need-3" },
  5: { bn: "সংকটাপন্ন", en: "Critical", v: "--need-4" },
} as const;

export function NeedSeverityTag({ severity }: { severity: number }) {
  const t = useT();
  // Clamp to the 1–5 scale so out-of-range data can't index past the map.
  const level = (Math.min(5, Math.max(1, Math.round(severity))) || 1) as 1 | 2 | 3 | 4 | 5;
  const s = SEVERITY[level];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs"
      style={{
        background: `color-mix(in srgb, var(${s.v}) 22%, transparent)`,
        color: "var(--ink)",
      }}
    >
      <span className="h-2 w-2 rounded-full" style={{ background: `var(${s.v})` }} />
      {/* never colour-only: text label always present */}
      {t(s.bn, s.en)} · {toBnDigits(severity)}
    </span>
  );
}

/** Gold verified seal — used sparingly to signal trust. */
export function VerifiedSeal({ small = false }: { small?: boolean }) {
  const t = useT();
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 text-gold ${
        small ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
    >
      <ShieldCheck className={small ? "h-3.5 w-3.5" : "h-4 w-4"} />
      {t("যাচাইকৃত", "Verified")}
    </span>
  );
}

/** Bengali-first eyebrow label. */
export function Eyebrow({ bn, en }: { bn: string; en: string }) {
  const t = useT();
  return (
    <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-river">
      <span className="h-px w-6 bg-river/60" />
      {t(bn, en)}
    </span>
  );
}
