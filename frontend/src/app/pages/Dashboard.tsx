import { useState } from "react";
import { Link } from "react-router";
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip, CartesianGrid } from "recharts";
import { Play, FileText } from "lucide-react";
import { LogIn } from "lucide-react";
import { useT, useShohay, toBnDigits } from "../lib/store";
import { useAuth, HOME_FOR } from "../lib/auth";
import { CoverageMap } from "../components/shohay/CoverageMap";
import { Eyebrow, NumberCounter } from "../components/shohay/primitives";
import { divisions, nationalTotals, type Unit } from "../lib/data";

const trend = [
  { d: "১", recv: 8, dist: 4 },
  { d: "৫", recv: 22, dist: 12 },
  { d: "১০", recv: 38, dist: 26 },
  { d: "১৫", recv: 54, dist: 41 },
  { d: "২০", recv: 64, dist: 55 },
  { d: "২৫", recv: 71, dist: 63 },
];

export function Dashboard() {
  const t = useT();
  const { lang } = useShohay();
  const { user } = useAuth();
  const [sel, setSel] = useState<Unit | null>(divisions[1]);
  const [time, setTime] = useState(100);

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-12 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow bn="জাতীয় স্বচ্ছতা ড্যাশবোর্ড · উন্মুক্ত" en="National transparency dashboard · Public" />
          <h1 className="mt-4 text-[clamp(1.6rem,4vw,2.4rem)]">{t("সরাসরি কভারেজ মানচিত্র", "Live coverage map")}</h1>
        </div>
        <Link to="/ledger" className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary">
          <FileText className="h-4 w-4" /> {t("উন্মুক্ত খতিয়ান", "Open ledger")}
        </Link>
      </div>

      {/* guest / role-aware CTA */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-panel p-4 river-contours">
        <p className="text-sm text-ink-dim">
          {user
            ? t("আপনার ব্যক্তিগত কনসোলে আরও বিস্তারিত দেখুন।", "See more detail in your personal console.")
            : t("যে কেউ এই পাবলিক মানচিত্র দেখতে পারেন — সাইন ইন করে আপনার ভূমিকা-নির্দিষ্ট ড্যাশবোর্ড পান।", "Anyone can view this public map — sign in for your role-specific dashboard.")}
        </p>
        <Link to={user ? HOME_FOR[user.role] : "/login"} className="inline-flex items-center gap-2 rounded-full bg-river px-5 py-2 text-sm text-primary-foreground">
          <LogIn className="h-4 w-4" /> {user ? t("আমার ড্যাশবোর্ড", "My dashboard") : t("সাইন ইন", "Sign in")}
        </Link>
      </div>

      {/* top stat strip */}
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { v: nationalTotals.crore, dec: 1, pre: "৳ ", suf: "", bn: "কোটি গৃহীত", en: "crore received", gold: true },
          { v: nationalTotals.upazilasReached, dec: 0, pre: "", suf: `/${nationalTotals.upazilasTotal}`, bn: "উপজেলায় পৌঁছেছে", en: "upazilas reached" },
          { v: nationalTotals.items, dec: 0, pre: "", suf: "", bn: "সামগ্রী বিতরণ", en: "items distributed" },
          { v: nationalTotals.beneficiaries, dec: 0, pre: "", suf: "", bn: "সুবিধাভোগী", en: "beneficiaries" },
        ].map((s) => (
          <div key={s.en} className="rounded-xl border border-border bg-bg-elev p-4">
            <div className="text-xl"><NumberCounter value={s.v} decimals={s.dec} prefix={s.pre} suffix={s.suf} gold={s.gold} /></div>
            <div className="text-xs text-ink-dim">{t(s.bn, s.en)}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <CoverageMap onSelect={setSel} selected={sel} className="aspect-[4/3] w-full" />
          {/* time scrubber */}
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-bg-elev p-4">
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-river text-primary-foreground"><Play className="h-4 w-4" /></button>
            <div className="flex-1">
              <div className="mb-1 flex justify-between text-xs text-ink-dim">
                <span>{t("অভিযান পুনঃপ্রদর্শন", "Replay campaign")}</span>
                <span className="tabular">{t("দিন", "Day")} {toBnDigits(Math.round(time / 4))}</span>
              </div>
              <input type="range" min={0} max={100} value={time} onChange={(e) => setTime(+e.target.value)} className="w-full accent-[var(--river)]" />
            </div>
          </div>
        </div>

        {/* side panel */}
        <aside className="rounded-2xl border border-border bg-bg-elev p-6">
          {sel ? (
            <>
              <div className="text-sm text-ink-dim">{t("নির্বাচিত একক", "Selected unit")}</div>
              <h2 className="mt-1">{lang === "bn" ? sel.name_bn : sel.name_en}</h2>
              <div className="mt-5 space-y-4">
                <Bar label={t("পূরণ", "Fulfillment")} value={sel.fulfillment} color="var(--ok)" />
                <Bar label={t("চাহিদার তীব্রতা", "Need intensity")} value={sel.need * 20} color={`var(--need-${sel.need - 1})`} />
              </div>
              <dl className="mt-6 space-y-2 text-sm">
                <PRow label={t("গৃহীত (লক্ষ)", "Received (lakh)")} value={`৳ ${toBnDigits(sel.received)}`} />
                <PRow label={t("সুবিধাভোগী", "Beneficiaries")} value={toBnDigits(sel.beneficiaries.toLocaleString("en-IN"))} />
                <PRow label={t("জিওকোড", "Geocode")} value={sel.geocode} />
              </dl>
              <Link to="/ledger" className="mt-6 inline-block text-sm text-river hover:underline">
                {t("এই এককের খতিয়ান এন্ট্রি →", "View ledger entries for this unit →")}
              </Link>
            </>
          ) : (
            <p className="text-ink-dim">{t("বিস্তারিত দেখতে মানচিত্রে একটি একক নির্বাচন করুন।", "Select a unit on the map to see details.")}</p>
          )}

          <div className="mt-8">
            <div className="mb-2 text-sm text-ink-dim">{t("গৃহীত বনাম বিতরণ (কোটি)", "Received vs distributed (crore)")}</div>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--river)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--river)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="d" tick={{ fontSize: 11, fill: "var(--ink-dim)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="recv" stroke="var(--river)" fill="url(#g1)" strokeWidth={2} />
                <Area type="monotone" dataKey="dist" stroke="var(--gold)" fill="transparent" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-ink-dim">{label}</span>
        <span className="tabular">{toBnDigits(Math.round(value))}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

function PRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border pb-2">
      <dt className="text-ink-dim">{label}</dt>
      <dd className="tabular">{value}</dd>
    </div>
  );
}
