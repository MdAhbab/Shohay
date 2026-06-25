import { useState } from "react";
import { motion } from "motion/react";
import { useT, toBnDigits } from "../../lib/store";
import { divisions, upazilasByDivision, type Unit } from "../../lib/data";

type Layer = "need" | "fulfillment" | "received";

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
  return `var(--need-${u.need - 1})`;
}

export function CoverageMap({
  onSelect,
  selected,
  drilldown = true,
  showLayers = true,
  className = "",
}: {
  onSelect?: (u: Unit) => void;
  selected?: Unit | null;
  drilldown?: boolean;
  showLayers?: boolean;
  className?: string;
}) {
  const t = useT();
  const [layer, setLayer] = useState<Layer>("need");
  const [focus, setFocus] = useState<string | null>(null);
  const [hover, setHover] = useState<Unit | null>(null);

  const drilled = focus ? upazilasByDivision[focus] : null;
  const units = drilled ?? divisions;

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
          {focus && (
            <button
              onClick={() => setFocus(null)}
              className="ml-auto rounded-full border border-border px-3 py-1 text-sm text-ink-dim hover:text-ink"
            >
              ← {t("পুরো বাংলাদেশ", "All Bangladesh")}
            </button>
          )}
        </div>
      )}

      <div className="relative overflow-hidden rounded-xl border border-border bg-panel river-contours">
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
                <circle
                  cx={u.x}
                  cy={u.y}
                  r={drilled ? 5.5 : 6.5}
                  fill={colorFor(u, layer)}
                  stroke={isSel ? "var(--gold)" : "var(--bg-elev)"}
                  strokeWidth={isSel ? 1.2 : 0.6}
                />
                <text
                  x={u.x}
                  y={u.y + (drilled ? 9 : 10)}
                  textAnchor="middle"
                  fontSize="2.6"
                  fill="var(--ink-dim)"
                  style={{ fontFamily: "var(--font-bn-sans)" }}
                >
                  {t(u.name_bn, u.name_en)}
                </text>
              </motion.g>
            );
          })}
        </svg>

        {hover && (
          <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-border bg-bg-elev/95 px-3 py-2 text-sm shadow-lg backdrop-blur">
            <div>{t(hover.name_bn, hover.name_en)}</div>
            <div className="text-ink-dim text-xs">
              {t("পূরণ", "Fulfillment")}: <span className="tabular">{toBnDigits(hover.fulfillment)}%</span> ·{" "}
              {t("সুবিধাভোগী", "Beneficiaries")}: <span className="tabular">{toBnDigits(hover.beneficiaries.toLocaleString("en-IN"))}</span>
            </div>
          </div>
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
        {drilldown && !focus && <span className="ml-auto">{t("জেলায় ক্লিক করে ড্রিল-ডাউন", "Click a unit to drill down")}</span>}
      </div>
    </div>
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
