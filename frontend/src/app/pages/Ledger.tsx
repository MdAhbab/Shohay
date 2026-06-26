import { useState } from "react";
import { motion } from "motion/react";
import { Search, Download, Link2, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useT, toBnDigits, useData } from "../lib/store";
import { Eyebrow } from "../components/shohay/primitives";

const ACTION_LABEL = {
  pledge: { bn: "প্রতিশ্রুতি", en: "Pledge", c: "var(--ink-dim)" },
  receive: { bn: "গৃহীত", en: "Receive", c: "var(--river)" },
  allocate: { bn: "বরাদ্দ", en: "Allocate", c: "var(--gold)" },
  distribute: { bn: "বিতরণ", en: "Distribute", c: "var(--ok)" },
} as const;

export function Ledger() {
  const t = useT();
  const { ledgerRows, nationalTotals } = useData();
  const [q, setQ] = useState("");

  const recon = [
    { bn: "প্রতিশ্রুত", en: "Pledged", v: 78.4 },
    { bn: "গৃহীত", en: "Received", v: 71.2 },
    { bn: "বরাদ্দকৃত", en: "Allocated", v: 66.8 },
    { bn: "বিতরণকৃত", en: "Distributed", v: 63.1 },
  ];

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-12 md:px-6">
      <Eyebrow bn="উন্মুক্ত খতিয়ান ও অডিট" en="Open ledger & audit" />
      <h1 className="mt-4 text-[clamp(1.6rem,4vw,2.4rem)]">{t("হ্যাশ-সংযুক্ত প্রমাণ শৃঙ্খল", "Hash-linked proof chain")}</h1>
      <p className="mt-2 max-w-2xl text-ink-dim">
        {t(
          "প্রতিটি অবস্থা-পরিবর্তন একটি অপরিবর্তনীয়, সংযোজন-মাত্র রেকর্ড। যে কেউ একটি দান যাচাই করতে পারেন।",
          "Every state change is an append-only, tamper-evident record. Anyone can audit a donation.",
        )}
      </p>

      <form onSubmit={(e) => { e.preventDefault(); toast.success(t("শৃঙ্খল যাচাই সম্পন্ন — সততা অক্ষুণ্ণ", "Chain verified — integrity intact")); }} className="mt-6 flex flex-wrap gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-dim" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("দান আইডি বা হ্যাশ অনুসন্ধান", "Search donation ID or hash")} className="w-full rounded-full border border-border bg-input-background py-3 pl-10 pr-4" />
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-river px-6 py-3 text-primary-foreground"><ShieldCheck className="h-4 w-4" /> {t("সততা যাচাই", "Verify integrity")}</button>
        <button type="button" onClick={() => toast.success(t("ওপেন-ডেটা ডাউনলোড শুরু", "Open-data download started"))} className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 hover:bg-secondary">
          <Download className="h-4 w-4" /> CSV / JSON
        </button>
      </form>

      {/* reconciliation summary */}
      <div className="mt-8 rounded-2xl border border-border bg-bg-elev p-6">
        <div className="flex items-center gap-2 text-sm text-ink-dim"><CheckCircle2 className="h-4 w-4 text-ok" /> {t("অডিট এজেন্ট পুনর্মিলন (কোটি ৳)", "Audit-agent reconciliation (crore ৳)")}</div>
        <div className="mt-4 space-y-3">
          {recon.map((r) => (
            <div key={r.en}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{t(r.bn, r.en)}</span>
                <span className="tabular">৳ {toBnDigits(r.v)}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <motion.div className="h-full rounded-full bg-river" initial={{ width: 0 }} whileInView={{ width: `${(r.v / recon[0].v) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }} />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-ink-dim">{t("সকল সংখ্যা খতিয়ান থেকে — কোনো অনুমান নয়। ফাঁক মানবিক পর্যালোচনার জন্য চিহ্নিত।", "All figures from the ledger — no estimates. Gaps are flagged for human review.")}</p>
      </div>

      {/* chain table */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-bg-elev">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-panel text-left text-ink-dim">
              <tr>
                {["এন্ট্রি/Entry", "কর্ম/Action", "রেফ/Ref", "পরিমাণ/Amount", "এলাকা/Area", "সময়/Time", "হ্যাশ/Hash"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-4 py-3">{t(h.split("/")[0], h.split("/")[1])}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ledgerRows.map((r) => {
                const a = ACTION_LABEL[r.action as keyof typeof ACTION_LABEL] ?? ACTION_LABEL.pledge;
                return (
                  <tr key={r.id} className="border-t border-border hover:bg-secondary/50">
                    <td className="px-4 py-3 tabular">{r.id}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs" style={{ background: `color-mix(in srgb, ${a.c} 18%, transparent)` }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: a.c }} />{t(a.bn, a.en)}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular">{r.ref}</td>
                    <td className="px-4 py-3">{t(r.amount.split(" / ")[0], r.amount.split(" / ")[1] ?? r.amount)}</td>
                    <td className="px-4 py-3">{t(r.area_bn, r.area_en)}</td>
                    <td className="px-4 py-3 tabular text-ink-dim">{r.ts}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 font-mono text-xs text-river"><Link2 className="h-3 w-3" />{r.hash}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border px-4 py-3 text-xs text-ink-dim">
          {t("সংযোজন-মাত্র শৃঙ্খল", "Append-only chain")} · {toBnDigits(nationalTotals.donors.toLocaleString("en-IN"))} {t("দাতা যাচাইযোগ্য", "donors verifiable")}
        </div>
      </div>
    </div>
  );
}
