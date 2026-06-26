import { useState, lazy, Suspense } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useT, toBnDigits } from "../../lib/store";
import { divisions, upazilasByDivision, type Unit } from "../../lib/data";

type Layer = "need" | "fulfillment" | "received";

// MapLibre is ~200KB gzip — load it only on the rich tier, on demand.
const MapLibreCoverage = lazy(() => import("./MapLibreCoverage"));

function colorFor(u: Unit, layer: Layer) {
  if (layer === "fulfillment") {
    const f = u.fulfillment;
    if (f >= 75) return "var(--ok)";
    if (f >= 50) return "var(--river-2)";
    if (f >= 30) return "var(--warn)";
    return "var(--terracotta)";
  }
  if (layer === "received") {
    const r = Math.min(1, u.received / 1840);
    return `color-mix(in srgb, var(--river) ${20 + r * 70}%, var(--need-0))`;
  }
  return `var(--need-${Math.min(4, Math.max(0, u.need - 1))})`;
}

export function CoverageMap({
  onSelect,
  selected,
  drilldown = true,
  showLayers = true,
  lite = false,
  className = "",
}: {
  onSelect?: (u: Unit) => void;
  selected?: Unit | null;
  drilldown?: boolean;
  showLayers?: boolean;
  /** Force the lightweight SVG surface (e.g. landing preview / low-bandwidth). */
  lite?: boolean;
  className?: string;
}) {
  const t = useT();
  const reduce = useReducedMotion();
  const [layer, setLayer] = useState<Layer>("need");
  const useSvg = lite || reduce;

  const layers: { id: Layer; bn: string; en: string }[] = [
    { id: "need", bn: "চাহিদার তীব্রতা", en: "Need intensity" },
    { id: "fulfillment", bn: "পূরণ %", en: "Fulfillment %" },
    { id: "received", bn: "গৃহীত", en: "Received" },
  ];

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {showLayers && (
        <div className="flex flex-wrap items-center gap-2">
          {layers.map((l) => (
            <button
              key={l.id}
              onClick={() => setLayer(l.id)}
              className={`rounded-full border px-3 py-1 text-sm ease-tide transition-colors ${
                layer === l.id
                  ? "border-river bg-river text-primary-foreground"
                  : "border-border bg-bg-elev text-ink-dim hover:text-ink"
              }`}
            >
              {t(l.bn, l.en)}
            </button>
          ))}
        </div>
      )}

      <div className="relative h-[320px] overflow-hidden rounded-xl border border-border bg-panel river-contours sm:h-[420px]">
        {useSvg ? (
          <CoverageSVG layer={layer} selected={selected} onSelect={onSelect} drilldown={drilldown} />
        ) : (
          <Suspense fallback={<CoverageSVG layer={layer} selected={selected} onSelect={onSelect} drilldown={drilldown} />}>
            <MapLibreCoverage layer={layer} selected={selected} onSelect={onSelect} />
          </Suspense>
        )}
      </div>

      {/* legend — paired with labels, never colour-only */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-dim">
        {layer === "need" &&
          ["নিম্ন/Low", "মাঝারি/Mod", "উচ্চ/High", "গুরুতর/Severe", "সংকট/Critical"].map((lab, i) => (
            <span key={lab} className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded" style={{ background: `var(--need-${i})` }} />
              {t(lab.split("/")[0], lab.split("/")[1])}
            </span>
          ))}
        {layer === "fulfillment" && (
          <>
            <Legend c="var(--terracotta)" bn="<৩০%" en="<30%" />
            <Legend c="var(--warn)" bn="৩০–৫০%" en="30–50%" />
            <Legend c="var(--river-2)" bn="৫০–৭৫%" en="50–75%" />
            <Legend c="var(--ok)" bn="৭৫%+" en="75%+" />
          </>
        )}
        {layer === "received" && <span>{t("গাঢ় = বেশি গৃহীত", "Darker = more received")}</span>}
        <span className="ml-auto">{t("বিভাগে ক্লিক করে বিস্তারিত", "Click a division for details")}</span>
      </div>
    </div>
  );
}

/** Lite-tier / reduced-motion surface: a stylized division scatter (no WebGL). */
function CoverageSVG({
  layer,
  selected,
  onSelect,
  drilldown,
}: {
  layer: Layer;
  selected?: Unit | null;
  onSelect?: (u: Unit) => void;
  drilldown: boolean;
}) {
  const t = useT();
  const [focus, setFocus] = useState<string | null>(null);
  const [hover, setHover] = useState<Unit | null>(null);
  const drilled = focus ? upazilasByDivision[focus] : null;
  const units = drilled ?? divisions;

  return (
    <>
      <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        {units.map((u, i) => {
          const isSel = selected?.geocode === u.geocode;
          return (
            <motion.g
              key={u.geocode}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
              onMouseEnter={() => setHover(u)}
              onMouseLeave={() => setHover(null)}
              onClick={() => {
                onSelect?.(u);
                if (drilldown && upazilasByDivision[u.geocode] && !drilled) setFocus(u.geocode);
              }}
              style={{ cursor: "pointer" }}
            >
              <circle cx={u.x} cy={u.y} r={drilled ? 5.5 : 6.5} fill={colorFor(u, layer)} stroke={isSel ? "var(--gold)" : "var(--bg-elev)"} strokeWidth={isSel ? 1.2 : 0.6} />
              <text x={u.x} y={u.y + (drilled ? 9 : 10)} textAnchor="middle" fontSize="2.6" fill="var(--ink-dim)" style={{ fontFamily: "var(--font-bn-sans)" }}>
                {t(u.name_bn, u.name_en)}
              </text>
            </motion.g>
          );
        })}
      </svg>

      {focus && (
        <button onClick={() => setFocus(null)} className="absolute right-3 top-3 rounded-full border border-border bg-bg-elev/90 px-3 py-1 text-sm text-ink-dim hover:text-ink">
          ← {t("পুরো বাংলাদেশ", "All Bangladesh")}
        </button>
      )}

      {hover && (
        <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-border bg-bg-elev/95 px-3 py-2 text-sm shadow-lg backdrop-blur">
          <div>{t(hover.name_bn, hover.name_en)}</div>
          <div className="text-ink-dim text-xs">
            {t("পূরণ", "Fulfillment")}: <span className="tabular">{toBnDigits(hover.fulfillment)}%</span> ·{" "}
            {t("সুবিধাভোগী", "Beneficiaries")}: <span className="tabular">{toBnDigits(hover.beneficiaries.toLocaleString("en-IN"))}</span>
          </div>
        </div>
      )}
    </>
  );
}

function Legend({ c, bn, en }: { c: string; bn: string; en: string }) {
  const t = useT();
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-3 w-3 rounded" style={{ background: c }} />
      {t(bn, en)}
    </span>
  );
}
