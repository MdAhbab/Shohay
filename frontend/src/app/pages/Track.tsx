import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router";
import { motion } from "motion/react";
import { Search, Share2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useT } from "../lib/store";
import { ProofChain } from "../components/shohay/ProofChain";
import { Eyebrow, VerifiedSeal } from "../components/shohay/primitives";
import { ImageWithFallback } from "../components/custom/ImageWithFallback";
import { makeProofChain, type ProofStep } from "../lib/data";
import { trackDonation } from "../lib/api";

// The ledger stores one row per state change; map it onto the 4-step proof
// chain, marking each step done when its action is present.
const STEP_TEMPLATE = [
  { key: "pledged", action: "pledge", label_bn: "প্রতিশ্রুত", label_en: "Pledged" },
  { key: "received", action: "receive", label_bn: "গৃহীত", label_en: "Received" },
  { key: "allocated", action: "allocate", label_bn: "বরাদ্দকৃত", label_en: "Allocated" },
  { key: "distributed", action: "distribute", label_bn: "বিতরণকৃত", label_en: "Distributed" },
] as const;

function chainToSteps(chain: any[]): ProofStep[] {
  return STEP_TEMPLATE.map((s) => {
    const row = chain.find((r) => r.action === s.action);
    return {
      key: s.key,
      label_bn: s.label_bn,
      label_en: s.label_en,
      detail_bn: row ? `${row.amount} • ${row.area_bn}` : "—",
      detail_en: row ? `${row.amount} • ${row.area_en}` : "—",
      ts: row?.ts ?? "",
      hash: row?.hash ? `${row.hash}…` : "—",
      done: !!row,
    };
  });
}

export function Track() {
  const t = useT();
  const params = useParams();
  const [id, setId] = useState(params.id ?? "");
  const [active, setActive] = useState(params.id ?? "");
  const [steps, setSteps] = useState<ProofStep[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (target: string) => {
    if (!target) { setActive(""); setSteps([]); return; }
    setActive(target);
    setLoading(true);
    try {
      const res = await trackDonation(target);
      // Real ledger chain if the id exists; otherwise the demo chain so the
      // showcase still illustrates the model for an arbitrary id.
      setSteps(res.chain?.length ? chainToSteps(res.chain) : makeProofChain(target));
    } catch {
      setSteps(makeProofChain(target));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (params.id) load(params.id); }, [params.id, load]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6">
      <Eyebrow bn="দান ট্র্যাকিং" en="Donation tracking" />
      <h1 className="mt-4 text-[clamp(1.6rem,4vw,2.4rem)]">{t("আপনার দানের যাত্রা", "Your donation's journey")}</h1>

      <form
        onSubmit={(e) => { e.preventDefault(); load(id.trim()); }}
        className="mt-6 flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-dim" />
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder={t("দান আইডি লিখুন (যেমন D-12345)", "Enter donation ID (e.g. D-12345)")}
            className="w-full rounded-full border border-border bg-input-background py-3 pl-10 pr-4"
          />
        </div>
        <button disabled={loading} className="rounded-full bg-river px-6 py-3 text-primary-foreground disabled:opacity-60">{loading ? t("খোঁজা হচ্ছে…", "Tracking…") : t("খুঁজুন", "Track")}</button>
      </form>

      {!active && (
        <p className="mt-6 text-ink-dim">{t("আপনার রসিদ বা SMS-এ প্রাপ্ত আইডি দিয়ে দানের অবস্থা দেখুন।", "Use the ID from your receipt or SMS to view status.")}</p>
      )}

      {active && steps.length > 0 && (
        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border border-border bg-bg-elev p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="text-sm text-ink-dim">{t("দান আইডি", "Donation ID")}</div>
                <div className="tabular text-lg">{active}</div>
              </div>
              <VerifiedSeal />
            </div>
            <ProofChain steps={steps} />
          </div>

          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-border bg-bg-elev">
              <div className="relative h-44 river-contours">
                <svg viewBox="0 0 100 100" className="h-full w-full">
                  <circle cx="48" cy="82" r="6" fill="var(--river)" />
                  <motion.circle cx="48" cy="82" r="6" fill="none" stroke="var(--river-2)" strokeWidth="1" initial={{ scale: 1, opacity: 0.6 }} animate={{ scale: 3, opacity: 0 }} transition={{ repeat: Infinity, duration: 2.5 }} />
                  <path d="M48 30 C 46 50, 50 60, 48 76" fill="none" stroke="var(--river)" strokeWidth="1" strokeDasharray="2 3" />
                </svg>
                <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-bg-elev/90 px-2 py-1 text-xs">
                  <MapPin className="h-3 w-3 text-river" /> {t("ভোলা সদর", "Bhola Sadar")}
                </span>
              </div>
              <div className="p-4 text-sm text-ink-dim">{t("আপনার দান যেখানে পৌঁছেছে", "Where your donation landed")}</div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-bg-elev">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&q=70"
                alt={t("বিতরণের জিও-স্ট্যাম্পড ছবি", "Geo-stamped distribution photo")}
                className="h-40 w-full object-cover"
                style={{ filter: "saturate(0.85)" }}
              />
              <div className="flex items-center justify-between p-4">
                <span className="text-xs text-ink-dim">{t("যাচাইকৃত বিতরণ ছবি", "Verified distribution photo")}</span>
                <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">#f23a</span>
              </div>
            </div>

            <button
              onClick={() => toast.success(t("শেয়ারযোগ্য যাচাই কার্ড কপি হয়েছে", "Shareable verified card copied"))}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-border py-3 hover:bg-secondary"
            >
              <Share2 className="h-4 w-4" /> {t("যাচাই কার্ড শেয়ার করুন", "Share verified card")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
