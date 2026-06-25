import { motion } from "motion/react";
import { Check, Clock, FileText, PackageCheck, Truck, HandCoins } from "lucide-react";
import { useT } from "../../lib/store";
import { type ProofStep } from "../../lib/data";

const ICONS = {
  pledged: HandCoins,
  received: FileText,
  allocated: PackageCheck,
  distributed: Truck,
} as const;

export function ProofChain({
  steps,
  orientation = "vertical",
}: {
  steps: ProofStep[];
  orientation?: "vertical" | "horizontal";
}) {
  const t = useT();
  const horizontal = orientation === "horizontal";

  return (
    <ol className={horizontal ? "flex flex-col gap-6 md:flex-row md:items-stretch" : "flex flex-col"}>
      {steps.map((s, i) => {
        const Icon = ICONS[s.key];
        const last = i === steps.length - 1;
        return (
          <li key={s.key} className={horizontal ? "relative flex-1" : "relative flex gap-4 pb-8 last:pb-0"}>
            {/* connector line */}
            {!last && (
              <span
                className={
                  horizontal
                    ? "absolute left-1/2 top-6 hidden h-px w-full md:block"
                    : "absolute left-6 top-12 h-[calc(100%-3rem)] w-px"
                }
                style={{ background: "var(--border)" }}
              />
            )}
            {!last && (
              <motion.span
                className={horizontal ? "absolute left-1/2 top-6 hidden h-px md:block" : "absolute left-6 top-12 w-px"}
                style={{ background: "var(--river)" }}
                initial={horizontal ? { width: 0 } : { height: 0 }}
                whileInView={horizontal ? { width: s.done ? "100%" : 0 } : { height: s.done ? "calc(100% - 3rem)" : 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.25, ease: [0.22, 0.61, 0.36, 1] }}
              />
            )}

            <div className={horizontal ? "flex flex-col items-center text-center md:items-start md:text-left" : "flex gap-4"}>
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.25, type: "spring", stiffness: 200, damping: 18 }}
                className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2"
                style={{
                  borderColor: s.done ? "var(--river)" : "var(--border)",
                  background: s.done ? "var(--river)" : "var(--bg-elev)",
                  color: s.done ? "var(--primary-foreground)" : "var(--ink-dim)",
                }}
              >
                {s.done ? <Icon className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
              </motion.div>

              <div className={horizontal ? "mt-3" : "pt-1"}>
                <div className="flex items-center gap-2">
                  <h4>{t(s.label_bn, s.label_en)}</h4>
                  {s.done && <Check className="h-4 w-4 text-ok" />}
                </div>
                <p className="text-sm text-ink-dim">{t(s.detail_bn, s.detail_en)}</p>
                <p className="mt-1 text-xs text-ink-dim">
                  <span className="tabular">{s.ts}</span>
                  {s.done && (
                    <span className="ml-2 rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">
                      #{s.hash}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
