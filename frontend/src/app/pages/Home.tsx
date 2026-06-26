import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, HandCoins, Map as MapIcon, ShieldCheck, Waves } from "lucide-react";
import { useT } from "../lib/store";
import { DeltaScene } from "../components/shohay/DeltaScene";
import { CoverageMap } from "../components/shohay/CoverageMap";
import { ProofChain } from "../components/shohay/ProofChain";
import { NumberCounter, Eyebrow, NeedSeverityTag } from "../components/shohay/primitives";
import { ImageWithFallback } from "../components/custom/ImageWithFallback";
import { campaigns, nationalTotals, makeProofChain } from "../lib/data";

const rise = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-12%" },
  transition: { duration: 0.7, ease: [0.22, 0.61, 0.36, 1] as const },
};

export function Home() {
  const t = useT();

  return (
    <div>
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden river-contours">
        {/* delta animation: full-bleed on desktop, top accent on mobile */}
        <div className="absolute inset-0 opacity-60 md:opacity-90">
          <DeltaScene />
        </div>
        {/* legibility wash so headline stays readable over the animation */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/40 to-background/85 md:bg-gradient-to-r md:from-background/90 md:via-background/40 md:to-transparent" />
        <div className="relative mx-auto grid max-w-[1240px] items-center gap-10 px-4 py-16 sm:py-20 md:grid-cols-2 md:px-6 md:py-28">
          <motion.div {...rise}>
            <Eyebrow bn="জাতীয় ত্রাণ ও স্বচ্ছতা প্ল্যাটফর্ম" en="National relief & transparency platform" />
            <h1 className="mt-5 max-w-xl text-[clamp(2rem,5vw,3.4rem)] leading-[1.2]">
              {t(
                "প্রতিটি টাকা, প্রতিটি বস্ত্র, প্রতিটি বস্তা চাল — কোথায় গেল, দেখুন।",
                "Every taka, every shirt, every sack of rice — see exactly where it went.",
              )}
            </h1>
            <p className="mt-5 max-w-lg text-ink-dim">
              {t(
                "নদীমাতৃক বাংলাদেশের প্রতিটি কোণে ত্রাণ পৌঁছাক — পানি যেমন তার স্তর খুঁজে নেয়। প্রতিশ্রুতি থেকে বিতরণ পর্যন্ত প্রতিটি দান যাচাইযোগ্য।",
                "Relief should reach every corner of our delta — the way water finds its level. Every donation is verifiable from pledge to distribution.",
              )}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/donate" className="inline-flex items-center gap-2 rounded-full bg-river px-6 py-3 text-primary-foreground shadow-sm ease-tide transition-transform hover:scale-[1.02]">
                <HandCoins className="h-5 w-5" /> {t("দান করুন", "Donate")}
              </Link>
              <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-elev px-6 py-3 hover:bg-secondary">
                <MapIcon className="h-5 w-5" /> {t("কোথায় যাচ্ছে দেখুন", "See where it goes")}
              </Link>
            </div>
          </motion.div>

          {/* live national figure card */}
          <motion.div {...rise} className="self-center">
            <div className="rounded-2xl border border-border bg-bg-elev/90 p-7 shadow-lg backdrop-blur">
              <div className="flex items-center gap-2 text-sm text-ink-dim">
                <Waves className="h-4 w-4 text-river" />
                {t("জাতীয় সরাসরি হিসাব", "Live national total")}
              </div>
              <div className="mt-4 flex items-end gap-2">
                <NumberCounter value={nationalTotals.crore} decimals={1} prefix="৳ " className="text-[clamp(2.4rem,6vw,3.6rem)]" gold />
                <span className="mb-2 text-ink-dim">{t("কোটি", "crore")}</span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-5">
                <Stat value={nationalTotals.items} bn="ত্রাণসামগ্রী বিতরণ" en="items delivered" />
                <Stat value={nationalTotals.beneficiaries} bn="সুবিধাভোগী" en="beneficiaries" />
                <Stat value={nationalTotals.upazilasReached} suffix={`/${nationalTotals.upazilasTotal}`} bn="উপজেলায় পৌঁছেছে" en="upazilas reached" />
                <Stat value={nationalTotals.donors} bn="দাতা" en="donors" />
              </div>
              <p className="mt-5 text-xs text-ink-dim">
                {t("সকল সংখ্যা উন্মুক্ত খতিয়ান থেকে — যাচাইযোগ্য।", "All figures from the open ledger — verifiable.")}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------- PROOF CHAIN ---------- */}
      <section className="mx-auto max-w-[1240px] px-4 py-20 md:px-6">
        <motion.div {...rise} className="max-w-2xl">
          <Eyebrow bn="সততার মডেল" en="The integrity model" />
          <h2 className="mt-4 text-[clamp(1.5rem,3.5vw,2.2rem)]">
            {t("প্রতিশ্রুতি → গৃহীত → বরাদ্দ → বিতরণ", "Pledged → received → allocated → distributed")}
          </h2>
          <p className="mt-3 text-ink-dim">
            {t(
              "প্রতিটি দান একটি যাচাইযোগ্য, হ্যাশ-সংযুক্ত শৃঙ্খল। প্রতিটি ধাপে প্রমাণ — রসিদ, ছবি, স্বাক্ষরকারীর সিল।",
              "Every donation is an auditable, hash-linked chain. Each step stamps a proof — receipt, photo, signer seal.",
            )}
          </p>
        </motion.div>
        <div className="mt-10 rounded-2xl border border-border bg-panel p-6 md:p-10">
          <ProofChain steps={makeProofChain("demo")} orientation="horizontal" />
        </div>
      </section>

      {/* ---------- COVERAGE MAP PREVIEW ---------- */}
      <section className="mx-auto grid max-w-[1240px] items-center gap-10 px-4 py-12 md:grid-cols-[1.1fr_0.9fr] md:px-6">
        <motion.div {...rise}>
          <CoverageMap drilldown={false} lite className="aspect-square w-full" />
        </motion.div>
        <motion.div {...rise}>
          <Eyebrow bn="সরাসরি কভারেজ" en="Live coverage" />
          <h2 className="mt-4 text-[clamp(1.5rem,3.5vw,2.2rem)]">
            {t("বিভাগ → জেলা → উপজেলা পর্যন্ত স্বচ্ছতা", "Transparency down to every upazila")}
          </h2>
          <p className="mt-3 text-ink-dim">
            {t(
              "মানচিত্র জলের মতো ভরে ওঠে — যেখানে চাহিদা বেশি, যেখানে এখনো পৌঁছায়নি, সব দৃশ্যমান। কোনো উপজেলা যেন বাদ না পড়ে।",
              "The map fills like water — where need is highest, where aid hasn't reached yet, all visible. So no upazila is quietly skipped.",
            )}
          </p>
          <Link to="/dashboard" className="mt-6 inline-flex items-center gap-2 text-river hover:gap-3 ease-tide transition-all">
            {t("পূর্ণ স্বচ্ছতা ড্যাশবোর্ড", "Open the full dashboard")} <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>

      {/* ---------- ACTIVE CAMPAIGNS ---------- */}
      <section className="mx-auto max-w-[1240px] px-4 py-20 md:px-6">
        <motion.div {...rise} className="flex items-end justify-between gap-4">
          <div>
            <Eyebrow bn="চলমান দুর্যোগ" en="Active campaigns" />
            <h2 className="mt-4 text-[clamp(1.5rem,3.5vw,2.2rem)]">{t("এখন যেখানে সহায়তা প্রয়োজন", "Where help is needed now")}</h2>
          </div>
        </motion.div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {campaigns.map((c, i) => {
            const pct = Math.round((c.raised / c.goal) * 100);
            return (
              <motion.article
                key={c.id}
                {...rise}
                transition={{ ...rise.transition, delay: i * 0.08 }}
                className="group overflow-hidden rounded-2xl border border-border bg-bg-elev"
              >
                <div className="relative h-44 overflow-hidden">
                  <ImageWithFallback src={c.image} alt={t(c.title_bn, c.title_en)} className="h-full w-full object-cover ease-tide transition-transform duration-700 group-hover:scale-105" style={{ filter: "saturate(0.85)" }} />
                  <span className="absolute left-3 top-3 rounded-full bg-bg-elev/90 px-2.5 py-1 text-xs">
                    {t(c.type_bn, c.type_en)}
                  </span>
                </div>
                <div className="p-5">
                  <h3>{t(c.title_bn, c.title_en)}</h3>
                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <motion.div
                      className="h-full rounded-full bg-river"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: [0.22, 0.61, 0.36, 1] }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-sm text-ink-dim">
                    <span><NumberCounter value={c.raised} decimals={1} prefix="৳ " suffix={t(" কোটি", " cr")} /></span>
                    <span className="tabular">{t("লক্ষ্য", "goal")} ৳{c.goal} {t("কোটি", "cr")}</span>
                  </div>
                  <div className="mt-1 text-xs text-ink-dim">
                    {t("পৌঁছেছে", "Reached")} <span className="tabular">{c.upazilas_reached}/{c.upazilas_total}</span> {t("উপজেলা", "upazilas")}
                  </div>
                  <Link to="/donate" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-secondary py-2.5 text-sm hover:bg-river hover:text-primary-foreground ease-tide transition-colors">
                    {t("এই অভিযানে দিন", "Give to this campaign")}
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      {/* ---------- IMPACT / HOW IT WORKS ---------- */}
      <section className="border-y border-border bg-panel river-contours">
        <div className="mx-auto grid max-w-[1240px] gap-12 px-4 py-20 md:grid-cols-2 md:px-6">
          <motion.div {...rise}>
            <Eyebrow bn="মানবিক ফলাফল" en="Impact in human terms" />
            <h2 className="mt-4 text-[clamp(1.5rem,3.5vw,2.2rem)]">{t("সংখ্যার পেছনে মানুষ", "People behind the numbers")}</h2>
            <div className="mt-8 grid grid-cols-2 gap-6">
              <Impact value={526000} bn="পরিবারে পৌঁছেছে" en="families reached" />
              <Impact value={1240000} bn="খাবার পরিবেশিত" en="meals served" />
              <Impact value={184500} bn="কম্বল ও বস্ত্র" en="blankets & clothes" />
              <Impact value={62000} bn="বিশুদ্ধ পানি (লি)" en="litres clean water" />
            </div>
            <div className="mt-8 flex items-start gap-3 rounded-xl border border-gold/30 bg-gold/5 p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <p className="text-sm text-ink-dim">
                {t(
                  "ব্যক্তিগত তথ্য কখনো প্রকাশ করা হয় না — শুধু সমষ্টিগত পরিসংখ্যান। স্বচ্ছতার জন্যই নকশা।",
                  "Beneficiary PII is never shown publicly — only aggregates. Designed for scrutiny.",
                )}
              </p>
            </div>
          </motion.div>
          <motion.div {...rise} className="grid gap-4">
            {[
              { n: "1042", area_bn: "মনপুরা, ভোলা", area_en: "Monpura, Bhola", sev: 5 as const, bn: "বিশুদ্ধ পানি — তীব্র সংকট", en: "Clean water — acute shortage" },
              { n: "1043", area_bn: "সন্দ্বীপ, চট্টগ্রাম", area_en: "Sandwip, Chattogram", sev: 5 as const, bn: "খাদ্য প্যাকেজ", en: "Food packages" },
              { n: "1045", area_bn: "কক্সবাজার সদর", area_en: "Cox's Bazar Sadar", sev: 4 as const, bn: "অস্থায়ী আশ্রয়", en: "Temporary shelter" },
            ].map((r) => (
              <div key={r.n} className="flex items-center justify-between rounded-xl border border-border bg-bg-elev p-4">
                <div>
                  <div className="text-sm">{t(r.bn, r.en)}</div>
                  <div className="text-xs text-ink-dim">{t(r.area_bn, r.area_en)} · #{r.n}</div>
                </div>
                <NeedSeverityTag severity={r.sev} />
              </div>
            ))}
            <Link to="/needs" className="inline-flex items-center gap-2 text-river hover:gap-3 ease-tide transition-all">
              {t("সকল উন্মুক্ত চাহিদা দেখুন", "View all open needs")} <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, bn, en, suffix }: { value: number; bn: string; en: string; suffix?: string }) {
  const t = useT();
  return (
    <div>
      <div className="text-xl"><NumberCounter value={value} suffix={suffix} /></div>
      <div className="text-xs text-ink-dim">{t(bn, en)}</div>
    </div>
  );
}

function Impact({ value, bn, en }: { value: number; bn: string; en: string }) {
  const t = useT();
  return (
    <div className="rounded-xl border border-border bg-bg-elev p-4">
      <div className="text-[clamp(1.4rem,3vw,2rem)]"><NumberCounter value={value} /></div>
      <div className="text-sm text-ink-dim">{t(bn, en)}</div>
    </div>
  );
}
