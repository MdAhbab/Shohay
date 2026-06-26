import { Link } from "react-router";
import { motion } from "motion/react";
import {
  Receipt, HeartHandshake, MapPinned, HandCoins,
  Users, Utensils, Droplet, ArrowRight, Download, Building2,
} from "lucide-react";
import { toast } from "sonner";
import { useT, useShohay, toBnDigits } from "../../lib/store";
import { PageHead } from "../../components/shohay/DashboardLayout";
import { StatCard, NumberCounter, VerifiedSeal } from "../../components/shohay/primitives";
import { ProofChain } from "../../components/shohay/ProofChain";
import { myDonations, myImpact, makeProofChain, upazilasByDivision, type MyDonation } from "../../lib/data";

const STATUS = {
  pledged: { bn: "প্রতিশ্রুত", en: "Pledged", c: "var(--ink-dim)" },
  received: { bn: "গৃহীত", en: "Received", c: "var(--river)" },
  allocated: { bn: "বরাদ্দকৃত", en: "Allocated", c: "var(--gold)" },
  distributed: { bn: "বিতরণকৃত", en: "Distributed", c: "var(--ok)" },
} as const;

function StatusPill({ s }: { s: MyDonation["status"] }) {
  const t = useT();
  const x = STATUS[s as keyof typeof STATUS] ?? STATUS.pledged;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs" style={{ background: `color-mix(in srgb, ${x.c} 18%, transparent)` }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: x.c }} />{t(x.bn, x.en)}
    </span>
  );
}

export function DonorOverview() {
  const t = useT();
  return (
    <div>
      <PageHead bn="স্বাগতম, রওশন আরা" en="Welcome, Roushan Ara" sub_bn="আপনার দান ও তার প্রভাবের সারসংক্ষেপ" sub_en="A summary of your giving and its impact" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={HandCoins} bn="মোট দান" en="Total donated" value={myImpact.totalTaka} prefix="৳ " gold />
        <StatCard icon={Receipt} bn="দানের সংখ্যা" en="Donations" value={myImpact.donations} />
        <StatCard icon={Users} bn="পরিবারে পৌঁছেছে" en="Families reached" value={myImpact.families} />
        <StatCard icon={MapPinned} bn="উপজেলা" en="Upazilas" value={myImpact.upazilas} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-border bg-bg-elev p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3>{t("সাম্প্রতিক দান", "Recent donations")}</h3>
            <Link to="/account/donations" className="text-sm text-river hover:underline">{t("সব দেখুন", "View all")}</Link>
          </div>
          <div className="space-y-3">
            {myDonations.slice(0, 3).map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="min-w-0">
                  <div className="truncate">{t(d.summary_bn, d.summary_en)} · <span className="text-ink-dim">{t(d.area_bn, d.area_en)}</span></div>
                  <div className="text-xs text-ink-dim tabular">{d.id} · {d.date}</div>
                </div>
                <StatusPill s={d.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-bg-elev p-5">
          <h3 className="mb-3">{t("সর্বশেষ দানের যাত্রা", "Latest donation journey")}</h3>
          <div className="flex items-center gap-2 text-sm text-ink-dim"><span className="tabular">{myDonations[0].id}</span> <VerifiedSeal small /></div>
          <div className="mt-4"><ProofChain steps={makeProofChain(myDonations[0].id)} /></div>
        </div>
      </div>
    </div>
  );
}

export function DonorDonations() {
  const t = useT();
  return (
    <div>
      <PageHead bn="আমার দান" en="My donations" sub_bn="প্রতিটি দানের যাচাইযোগ্য অবস্থা" sub_en="Verifiable status of every donation"
        action={<Link to="/donate" className="rounded-full bg-river px-5 py-2.5 text-sm text-primary-foreground">{t("নতুন দান", "New donation")}</Link>} />
      <div className="overflow-hidden rounded-2xl border border-border bg-bg-elev">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-panel text-left text-ink-dim">
              <tr>{["আইডি/ID", "তারিখ/Date", "দান/Donation", "এলাকা/Area", "অভিযান/Campaign", "অবস্থা/Status", ""].map((h, i) => <th key={i} className="whitespace-nowrap px-4 py-3">{h ? t(h.split("/")[0], h.split("/")[1]) : ""}</th>)}</tr>
            </thead>
            <tbody>
              {myDonations.map((d) => (
                <tr key={d.id} className="border-t border-border hover:bg-secondary/50">
                  <td className="px-4 py-3 tabular">{d.id}</td>
                  <td className="px-4 py-3 tabular text-ink-dim">{d.date}</td>
                  <td className="px-4 py-3">{t(d.summary_bn, d.summary_en)}{d.zakat && <span className="ml-2 rounded bg-gold/15 px-1.5 py-0.5 text-xs text-gold">{t("যাকাত", "Zakat")}</span>}</td>
                  <td className="px-4 py-3">{t(d.area_bn, d.area_en)}</td>
                  <td className="px-4 py-3 text-ink-dim">{t(d.campaign_bn, d.campaign_en)}</td>
                  <td className="px-4 py-3"><StatusPill s={d.status} /></td>
                  <td className="px-4 py-3"><Link to={`/track/${d.id}`} className="inline-flex items-center gap-1 text-river hover:underline">{t("ট্র্যাক", "Track")} <ArrowRight className="h-3 w-3" /></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function DonorImpact() {
  const t = useT();
  return (
    <div>
      <PageHead bn="আমার প্রভাব" en="My impact" sub_bn="আপনার অবদান কোথায় পৌঁছেছে" sub_en="Where your contribution landed" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} bn="পরিবার" en="Families" value={myImpact.families} />
        <StatCard icon={Utensils} bn="খাবার পরিবেশিত" en="Meals served" value={myImpact.meals} />
        <StatCard icon={Droplet} bn="বিশুদ্ধ পানি (লি)" en="Clean water (L)" value={1800} />
        <StatCard icon={MapPinned} bn="উপজেলায় পৌঁছেছে" en="Upazilas reached" value={myImpact.upazilas} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-bg-elev p-5">
          <h3 className="mb-4">{t("এলাকাভিত্তিক বিতরণ", "Distribution by area")}</h3>
          {[
            { bn: "ভোলা সদর", en: "Bhola Sadar", pct: 42 },
            { bn: "মনপুরা", en: "Monpura", pct: 28 },
            { bn: "সিরাজগঞ্জ", en: "Sirajganj", pct: 18 },
            { bn: "নোয়াখালী", en: "Noakhali", pct: 12 },
          ].map((r) => (
            <div key={r.en} className="mb-3">
              <div className="mb-1 flex justify-between text-sm"><span>{t(r.bn, r.en)}</span><span className="tabular">{toBnDigits(r.pct)}%</span></div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <motion.div className="h-full rounded-full bg-river" initial={{ width: 0 }} whileInView={{ width: `${r.pct}%` }} viewport={{ once: true }} transition={{ duration: 0.8 }} />
              </div>
            </div>
          ))}
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-bg-elev">
          <div className="relative h-44 river-contours">
            <svg viewBox="0 0 100 100" className="h-full w-full">
              {[[48, 82], [50, 72], [36, 50]].map(([x, y], i) => (
                <g key={i}>
                  <circle cx={x} cy={y} r={3} fill="var(--river)" />
                  <motion.circle cx={x} cy={y} r={3} fill="none" stroke="var(--river-2)" strokeWidth="0.6" initial={{ scale: 1, opacity: 0.6 }} animate={{ scale: 3, opacity: 0 }} transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.5 }} />
                </g>
              ))}
            </svg>
          </div>
          <div className="p-4 text-sm text-ink-dim">{t("আপনার দান যেসব উপজেলায় পৌঁছেছে", "Upazilas your donations reached")}</div>
        </div>
      </div>
    </div>
  );
}

export function DonorAdopted() {
  const t = useT();
  const adopted = upazilasByDivision["50"];
  return (
    <div>
      <PageHead bn="দত্তক উপজেলা" en="Adopted upazilas" sub_bn="আপনি যেসব উপজেলার পাশে দাঁড়িয়েছেন" sub_en="Upazilas you stand beside"
        action={<Link to="/adopt" className="rounded-full border border-border px-5 py-2.5 text-sm hover:bg-secondary">{t("আরও দত্তক নিন", "Adopt more")}</Link>} />
      <div className="grid gap-4 sm:grid-cols-2">
        {adopted.map((u) => (
          <div key={u.geocode} className="rounded-2xl border border-border bg-bg-elev p-5">
            <div className="flex items-center justify-between">
              <h3>{t(u.name_bn, u.name_en)}</h3>
              <Building2 className="h-5 w-5 text-river" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-secondary p-3"><div className="text-lg"><NumberCounter value={u.beneficiaries} /></div><div className="text-xs text-ink-dim">{t("সুবিধাভোগী", "people")}</div></div>
              <div className="rounded-xl bg-secondary p-3"><div className="text-lg"><NumberCounter value={u.fulfillment} suffix="%" /></div><div className="text-xs text-ink-dim">{t("পূরণ", "fulfilled")}</div></div>
            </div>
            <button onClick={() => toast.success(t("QR-যাচাই প্রতিবেদন ডাউনলোড", "QR-verified report downloaded"))} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-border py-2.5 text-sm hover:bg-secondary">
              <Download className="h-4 w-4" /> {t("যাচাই প্রতিবেদন", "Verified report")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DonorReceipts() {
  const t = useT();
  return (
    <div>
      <PageHead bn="রসিদ ও যাকাত" en="Receipts & zakat" sub_bn="ডাউনলোডযোগ্য রসিদ ও যাকাত সারসংক্ষেপ" sub_en="Downloadable receipts & zakat summary" />
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <StatCard icon={HandCoins} bn="এই বছরের মোট দান" en="Total this year" value={myImpact.totalTaka} prefix="৳ " />
        <StatCard icon={HeartHandshake} bn="যাকাত হিসেবে" en="Tagged as zakat" value={myImpact.zakatTaka} prefix="৳ " gold />
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-bg-elev">
        {myDonations.map((d) => (
          <div key={d.id} className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-0">
            <div><div className="tabular">{d.id} · {t(d.summary_bn, d.summary_en)}</div><div className="text-xs text-ink-dim">{d.date}{d.zakat && t(" · যাকাত", " · zakat")}</div></div>
            <button onClick={() => toast.success(t("রসিদ ডাউনলোড হয়েছে", "Receipt downloaded"))} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm hover:bg-secondary">
              <Download className="h-3.5 w-3.5" /> PDF
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DonorSettings() {
  const t = useT();
  const { bnNumerals, toggleNumerals } = useShohay();
  return (
    <div>
      <PageHead bn="সেটিংস" en="Settings" sub_bn="প্রোফাইল ও পছন্দসমূহ" sub_en="Profile & preferences" />
      <div className="max-w-xl space-y-4">
        <div className="rounded-2xl border border-border bg-bg-elev p-5">
          <h3 className="mb-4">{t("প্রোফাইল", "Profile")}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("নাম", "Name")} value="রওশন আরা / Roushan Ara" />
            <Field label={t("ফোন", "Phone")} value="+8801XXXXXX12" />
            <Field label={t("দাতার ধরন", "Donor type")} value={t("নাগরিক", "Citizen")} />
            <Field label={t("এলাকা", "Area")} value={t("ঢাকা", "Dhaka")} />
          </div>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-border bg-bg-elev p-5">
          <div><div>{t("বাংলা সংখ্যা (০-৯)", "Bengali numerals (০-৯)")}</div><div className="text-sm text-ink-dim">{t("পরিমাণ ও গণনায় ব্যবহার করুন", "Use in amounts & counts")}</div></div>
          <button onClick={toggleNumerals} className={`h-7 w-12 rounded-full p-0.5 ease-tide transition-colors ${bnNumerals ? "bg-river" : "bg-switch-background"}`}>
            <span className={`block h-6 w-6 rounded-full bg-white transition-transform ${bnNumerals ? "translate-x-5" : ""}`} />
          </button>
        </div>
        <button onClick={() => toast.success(t("পরিবর্তন সংরক্ষিত", "Changes saved"))} className="rounded-full bg-river px-6 py-2.5 text-sm text-primary-foreground">{t("সংরক্ষণ করুন", "Save")}</button>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-ink-dim">{label}</label>
      <div className="mt-1 rounded-lg border border-border bg-input-background px-3 py-2.5 text-sm">{value}</div>
    </div>
  );
}
