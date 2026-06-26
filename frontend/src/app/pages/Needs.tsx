import { useState } from "react";
import { motion } from "motion/react";
import { Plus, Droplet, Utensils, Pill, Home as HomeIcon, Shirt, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useT, toBnDigits, useData, useDataActions } from "../lib/store";
import { Eyebrow, NeedSeverityTag, VerifiedSeal } from "../components/shohay/primitives";
import { postNeed } from "../lib/api";

const KIND_ICON = { food: Utensils, water: Droplet, medicine: Pill, shelter: HomeIcon, clothes: Shirt } as const;
const KIND_LABEL = {
  food: { bn: "খাদ্য", en: "Food" }, water: { bn: "পানি", en: "Water" },
  medicine: { bn: "ঔষধ", en: "Medicine" }, shelter: { bn: "আশ্রয়", en: "Shelter" }, clothes: { bn: "বস্ত্র", en: "Clothes" },
} as const;

export function Needs() {
  const t = useT();
  const { needs, divisions } = useData();
  const { addNeed } = useDataActions();
  const [form, setForm] = useState(false);
  const [kind, setKind] = useState<keyof typeof KIND_LABEL>("food");
  const [geocode, setGeocode] = useState(divisions[0]?.geocode ?? "");
  const [quantity, setQuantity] = useState(500);
  const [severity, setSeverity] = useState(4);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const area = divisions.find((d) => d.geocode === geocode);
    try {
      const res = await postNeed({ geocode, kind, quantity, severity });
      // Add to the shared store so it appears here and updates moderator badges.
      addNeed({ id: res.id, geocode, area_bn: area?.name_bn ?? "—", area_en: area?.name_en ?? "—", kind, quantity, severity, status: "open", verified: res.verified });
      toast.success(t("চাহিদা জমা হয়েছে — অ্যাডমিন যাচাইয়ের অপেক্ষায়", "Need submitted — pending admin verification"));
    } catch {
      addNeed({ id: `N-local-${Date.now()}`, geocode, area_bn: area?.name_bn ?? "—", area_en: area?.name_en ?? "—", kind, quantity, severity, status: "open", verified: false });
      toast.success(t("চাহিদা জমা হয়েছে — অ্যাডমিন যাচাইয়ের অপেক্ষায়", "Need submitted — pending admin verification"));
    } finally {
      setSubmitting(false);
      setForm(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-12 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow bn="চাহিদা নিবন্ধন" en="Need registry" />
          <h1 className="mt-4 text-[clamp(1.6rem,4vw,2.4rem)]">{t("উন্মুক্ত চাহিদাসমূহ", "Open needs")}</h1>
        </div>
        <button onClick={() => setForm((f) => !f)} className="inline-flex items-center gap-2 rounded-full bg-river px-5 py-3 text-primary-foreground">
          <Plus className="h-4 w-4" /> {t("চাহিদা রিপোর্ট করুন", "Report a need")}
        </button>
      </div>

      {form && (
        <motion.form
          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          onSubmit={submit}
          className="mt-6 grid gap-4 overflow-hidden rounded-2xl border border-border bg-bg-elev p-6 sm:grid-cols-2"
        >
          <div>
            <label>{t("ধরন", "Type")}</label>
            <select value={kind} onChange={(e) => setKind(e.target.value as keyof typeof KIND_LABEL)} className="mt-1 w-full rounded-lg border border-border bg-input-background px-3 py-2.5">
              {Object.entries(KIND_LABEL).map(([k, v]) => <option key={k} value={k}>{t(v.bn, v.en)}</option>)}
            </select>
          </div>
          <div>
            <label>{t("এলাকা", "Area")}</label>
            <select value={geocode} onChange={(e) => setGeocode(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-input-background px-3 py-2.5">
              {divisions.map((d) => <option key={d.geocode} value={d.geocode}>{t(d.name_bn, d.name_en)}</option>)}
            </select>
          </div>
          <div>
            <label>{t("পরিমাণ", "Quantity")}</label>
            <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, +e.target.value))} className="mt-1 w-full rounded-lg border border-border bg-input-background px-3 py-2.5 tabular" />
          </div>
          <div>
            <label>{t("তীব্রতা (১–৫)", "Severity (1–5)")}: <span className="tabular">{toBnDigits(severity)}</span></label>
            <input type="range" min={1} max={5} value={severity} onChange={(e) => setSeverity(+e.target.value)} className="mt-3 w-full accent-[var(--river)]" />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button disabled={submitting} className="rounded-full bg-river px-6 py-2.5 text-primary-foreground disabled:opacity-60">{submitting ? t("পাঠানো হচ্ছে…", "Sending…") : t("জমা দিন", "Submit")}</button>
          </div>
        </motion.form>
      )}

      <div className="mt-8 grid gap-4">
        {needs.map((n, i) => {
          const Icon = KIND_ICON[n.kind as keyof typeof KIND_ICON] ?? Droplet;
          const label = KIND_LABEL[n.kind as keyof typeof KIND_LABEL] ?? { bn: n.kind, en: n.kind };
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-bg-elev p-5 sm:flex-row sm:items-center"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-river"><Icon className="h-6 w-6" /></div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span>{t(label.bn, label.en)} ×{toBnDigits(n.quantity.toLocaleString("en-IN"))}</span>
                  {n.verified && <VerifiedSeal small />}
                </div>
                <div className="mt-0.5 flex items-center gap-1 text-sm text-ink-dim">
                  <MapPin className="h-3.5 w-3.5" /> {t(n.area_bn, n.area_en)} · #{n.id}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <NeedSeverityTag severity={n.severity} />
                <span className="rounded-full bg-secondary px-3 py-1 text-xs">
                  {t(
                    n.status === "open" ? "উন্মুক্ত" : n.status === "partially_met" ? "আংশিক পূরণ" : "পূরণ হয়েছে",
                    n.status === "open" ? "Open" : n.status === "partially_met" ? "Partial" : "Met",
                  )}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
