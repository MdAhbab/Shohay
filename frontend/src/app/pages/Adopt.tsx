import { useState } from "react";
import { motion } from "motion/react";
import { QrCode, Building2, Globe2, Heart, Check } from "lucide-react";
import { toast } from "sonner";
import { useT, toBnDigits } from "../lib/store";
import { Eyebrow, NumberCounter, VerifiedSeal } from "../components/shohay/primitives";
import { upazilasByDivision } from "../lib/data";

export function Adopt() {
  const t = useT();
  const allUpazilas = Object.values(upazilasByDivision).flat();
  const [picked, setPicked] = useState(allUpazilas[0]);

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-12 md:px-6">
      <Eyebrow bn="উপজেলা দত্তক" en="Adopt an Upazila" />
      <h1 className="mt-4 text-[clamp(1.6rem,4vw,2.4rem)]">{t("একটি উপজেলার পাশে দাঁড়ান", "Stand beside one upazila")}</h1>
      <p className="mt-2 max-w-2xl text-ink-dim">
        {t(
          "ব্যবসা ও প্রবাসীরা একটি নির্দিষ্ট উপজেলায় তহবিল দিতে পারেন এবং তাদের অর্থায়িত বিতরণের QR-যাচাইকৃত প্রমাণ পান।",
          "Businesses and diaspora can fund a specific upazila and receive QR-verified proof of the distributions they funded.",
        )}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-3 sm:grid-cols-2">
          {allUpazilas.map((u, i) => (
            <motion.button
              key={u.geocode}
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setPicked(u)}
              className={`rounded-2xl border-2 p-5 text-left ease-tide transition-all ${picked.geocode === u.geocode ? "border-river bg-river/5" : "border-border hover:border-river/40"}`}
            >
              <div className="flex items-center justify-between">
                <span>{t(u.name_bn, u.name_en)}</span>
                {picked.geocode === u.geocode && <Check className="h-5 w-5 text-river" />}
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-river" style={{ width: `${u.fulfillment}%` }} />
              </div>
              <div className="mt-1.5 flex justify-between text-xs text-ink-dim">
                <span>{t("পূরণ", "Fulfilled")} {toBnDigits(u.fulfillment)}%</span>
                <span className="tabular">{toBnDigits(u.beneficiaries.toLocaleString("en-IN"))} {t("সুবিধাভোগী", "people")}</span>
              </div>
            </motion.button>
          ))}
        </div>

        <aside className="h-fit rounded-2xl border border-border bg-bg-elev p-6">
          <div className="flex items-center gap-2 text-sm text-ink-dim"><Globe2 className="h-4 w-4 text-river" /> {t("আপনার দত্তক ড্যাশবোর্ড", "Your adoption dashboard")}</div>
          <h2 className="mt-1">{t(picked.name_bn, picked.name_en)}</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-secondary p-3">
              <div className="text-lg"><NumberCounter value={picked.beneficiaries} /></div>
              <div className="text-xs text-ink-dim">{t("সুবিধাভোগী", "beneficiaries")}</div>
            </div>
            <div className="rounded-xl bg-secondary p-3">
              <div className="text-lg"><NumberCounter value={picked.fulfillment} suffix="%" /></div>
              <div className="text-xs text-ink-dim">{t("পূরণ", "fulfilled")}</div>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 text-sm"><QrCode className="h-10 w-10" /> {t("QR-যাচাইকৃত বিতরণ প্রমাণ", "QR-verified distribution proof")}</div>
            <VerifiedSeal small />
          </div>
          <div className="mt-5 flex gap-2">
            <button onClick={() => toast.success(t("দত্তক নিশ্চিত — ধন্যবাদ!", "Adoption confirmed — thank you!"))} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-river py-3 text-primary-foreground">
              <Building2 className="h-4 w-4" /> {t("দত্তক নিন", "Adopt")}
            </button>
            <button onClick={() => toast(t("শেয়ার লিংক কপি হয়েছে", "Share link copied"))} className="rounded-full border border-border px-4 hover:bg-secondary"><Heart className="h-4 w-4" /></button>
          </div>
        </aside>
      </div>
    </div>
  );
}
