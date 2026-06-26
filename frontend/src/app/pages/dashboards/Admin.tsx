import { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip, CartesianGrid } from "recharts";
import {
  Sparkles, ShieldAlert, Users2,
  Check, X, ChevronRight, AlertTriangle, MapPinned, HandCoins, Boxes, UserPlus, Search,
} from "lucide-react";
import { toast } from "sonner";
import { useT, toBnDigits, useData } from "../../lib/store";
import { PageHead } from "../../components/shohay/DashboardLayout";
import { StatCard, NeedSeverityTag } from "../../components/shohay/primitives";


const trend = [
  { d: "১", recv: 8, dist: 4 }, { d: "৫", recv: 22, dist: 12 }, { d: "১০", recv: 38, dist: 26 },
  { d: "১৫", recv: 54, dist: 41 }, { d: "২০", recv: 64, dist: 55 }, { d: "২৫", recv: 71, dist: 63 },
];

export function AdminOverview() {
  const t = useT();
  const { nationalTotals, proposedAllocations, needs, anomalies, managedUsers } = useData();
  return (
    <div>
      <PageHead bn="জাতীয় সারসংক্ষেপ" en="National overview" sub_bn="a2i · দুর্যোগ ব্যবস্থাপনা ও ত্রাণ" sub_en="a2i · Disaster Management & Relief"
        action={<Link to="/dashboard" className="rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary">{t("পাবলিক মানচিত্র", "Public map")}</Link>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={HandCoins} bn="মোট গৃহীত (কোটি)" en="Received (crore)" value={nationalTotals.crore} decimals={1} prefix="৳ " gold />
        <StatCard icon={MapPinned} bn="উপজেলায় পৌঁছেছে" en="Upazilas reached" value={nationalTotals.upazilasReached} suffix={`/${nationalTotals.upazilasTotal}`} />
        <StatCard icon={Boxes} bn="সামগ্রী বিতরণ" en="Items distributed" value={nationalTotals.items} />
        <StatCard icon={Users2} bn="সুবিধাভোগী" en="Beneficiaries" value={nationalTotals.beneficiaries} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-border bg-bg-elev p-5">
          <h3 className="mb-3">{t("গৃহীত বনাম বিতরণ (কোটি ৳)", "Received vs distributed (crore ৳)")}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trend}>
              <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--river)" stopOpacity={0.4} /><stop offset="100%" stopColor="var(--river)" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="d" tick={{ fontSize: 11, fill: "var(--ink-dim)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Area type="monotone" dataKey="recv" stroke="var(--river)" fill="url(#ag)" strokeWidth={2} />
              <Area type="monotone" dataKey="dist" stroke="var(--gold)" fill="transparent" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl border border-border bg-bg-elev p-5">
          <h3 className="mb-3">{t("কর্মসূচির সারি", "Action queue")}</h3>
          <div className="space-y-2 text-sm">
            <QueueRow to="/admin/allocations" bn="বরাদ্দ অনুমোদনের অপেক্ষায়" en="Allocations awaiting approval" n={proposedAllocations.length} />
            <QueueRow to="/admin/needs" bn="চাহিদা যাচাই বাকি" en="Needs to verify" n={needs.filter((x) => !x.verified).length} />
            <QueueRow to="/admin/anomalies" bn="অসঙ্গতি ফ্ল্যাগ" en="Anomaly flags" n={anomalies.length} />
            <QueueRow to="/admin/users" bn="অনুমোদন-অপেক্ষমাণ ব্যবহারকারী" en="Users pending approval" n={managedUsers.filter((u) => u.status === "pending").length} />
          </div>
        </div>
      </div>
    </div>
  );
}

function QueueRow({ to, bn, en, n }: { to: string; bn: string; en: string; n: number }) {
  const t = useT();
  return (
    <Link to={to} className="flex items-center justify-between rounded-xl bg-panel px-3 py-2.5 hover:bg-secondary">
      <span>{t(bn, en)}</span>
      <span className="flex items-center gap-2"><span className="rounded-full bg-terracotta/15 px-2 py-0.5 text-xs text-terracotta tabular">{toBnDigits(n)}</span><ChevronRight className="h-4 w-4 text-ink-dim" /></span>
    </Link>
  );
}

export function AdminCampaigns() {
  const t = useT();
  const { managedCampaigns } = useData();
  return (
    <div>
      <PageHead bn="অভিযান ব্যবস্থাপনা" en="Campaign management" sub_bn="চলমান দুর্যোগ অভিযান" sub_en="Active disaster campaigns"
        action={<button onClick={() => toast.success(t("নতুন অভিযান খসড়া তৈরি", "New campaign draft created"))} className="rounded-full bg-river px-5 py-2.5 text-sm text-primary-foreground">{t("নতুন অভিযান", "New campaign")}</button>} />
      <div className="space-y-4">
        {managedCampaigns.map((c) => {
          const pct = Math.round((c.raised / c.goal) * 100);
          return (
            <div key={c.id} className="rounded-2xl border border-border bg-bg-elev p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3>{t(c.title_bn, c.title_en)}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${c.status === "active" ? "bg-ok/15 text-ok" : "bg-warn/15 text-warn"}`}>{t(c.status === "active" ? "সক্রিয়" : "পর্যবেক্ষণ", c.status === "active" ? "Active" : "Monitoring")}</span>
                  </div>
                  <div className="mt-0.5 text-sm text-ink-dim">{t(c.type_bn, c.type_en)}</div>
                </div>
                <button onClick={() => toast(t("অভিযান সম্পাদনা", "Edit campaign"))} className="rounded-full border border-border px-4 py-1.5 text-sm hover:bg-secondary">{t("পরিচালনা", "Manage")}</button>
              </div>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <motion.div className="h-full rounded-full bg-river" initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }} transition={{ duration: 0.9 }} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <Mini bn="সংগৃহীত" en="Raised" v={`৳ ${toBnDigits(c.raised)} ${t("কোটি", "cr")}`} />
                <Mini bn="পৌঁছেছে" en="Reached" v={`${toBnDigits(c.upazilas_reached)}/${toBnDigits(c.upazilas_total)}`} />
                <Mini bn="উন্মুক্ত চাহিদা" en="Open needs" v={toBnDigits(c.needsOpen)} />
                <Mini bn="বিতরণ" en="Distributions" v={toBnDigits(c.distributions)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Mini({ bn, en, v }: { bn: string; en: string; v: string }) {
  const t = useT();
  return <div className="rounded-xl bg-panel p-3"><div className="text-ink-dim text-xs">{t(bn, en)}</div><div className="tabular">{v}</div></div>;
}

export function AdminAllocations() {
  const t = useT();
  const { proposedAllocations } = useData();
  return (
    <div>
      <PageHead bn="বরাদ্দ অনুমোদন" en="Allocations" sub_bn="বরাদ্দ-অপ্টিমাইজার এজেন্টের প্রস্তাব" sub_en="Allocation-Optimizer agent proposals" />
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-river/30 bg-river/5 p-4 text-sm">
        <Sparkles className="h-5 w-5 text-river" /> {t("এজেন্ট প্রস্তাব দেয় — আপনি অনুমোদন করেন। কোনো স্বয়ংক্রিয় তহবিল চলাচল নয়।", "Agent proposes — you enact. No autonomous money movement.")}
      </div>
      <div className="space-y-4">
        {proposedAllocations.map((a) => (
          <div key={a.id} className="rounded-2xl border border-border bg-bg-elev p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span>{t(a.donation_bn, a.donation_en)}</span>
                  <ChevronRight className="h-4 w-4 text-ink-dim" />
                  <span className="text-river">{t(a.need_bn, a.need_en)}</span>
                </div>
                <div className="mt-1 text-sm text-ink-dim">{t(a.area_bn, a.area_en)} · {toBnDigits(a.distance)} km · {t(a.rationale_bn, a.rationale_en)}</div>
              </div>
              <span className={`shrink-0 rounded-full px-3 py-1 text-xs ${a.confidence < 0.7 ? "bg-warn/15 text-warn" : "bg-ok/15 text-ok"}`}>{t("আস্থা", "Confidence")} {toBnDigits(Math.round(a.confidence * 100))}%</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => toast.success(t("বরাদ্দ অনুমোদিত ও খতিয়ানে স্বাক্ষরিত", "Approved & signed to ledger"))} className="inline-flex items-center gap-1.5 rounded-full bg-river px-4 py-2 text-sm text-primary-foreground"><Check className="h-4 w-4" /> {t("অনুমোদন", "Approve")}</button>
              <button onClick={() => toast(t("সম্পাদনার জন্য খোলা", "Opened for editing"))} className="rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary">{t("সম্পাদনা", "Modify")}</button>
              <button onClick={() => toast(t("প্রস্তাব বাতিল", "Dismissed"))} className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm text-ink-dim hover:bg-secondary"><X className="h-4 w-4" /> {t("বাতিল", "Reject")}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminNeeds() {
  const t = useT();
  const { needs } = useData();
  const [list, setList] = useState(needs);
  return (
    <div>
      <PageHead bn="চাহিদা যাচাই" en="Verify needs" sub_bn="সকল অঞ্চলের চাহিদা" sub_en="Needs across all regions" />
      <div className="space-y-3">
        {list.map((n) => (
          <div key={n.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-bg-elev p-4">
            <div><div>{t(n.area_bn, n.area_en)} <span className="text-sm text-ink-dim">#{n.id}</span></div><div className="text-sm text-ink-dim">×{toBnDigits(n.quantity.toLocaleString("en-IN"))}</div></div>
            <div className="flex items-center gap-3">
              <NeedSeverityTag severity={n.severity} />
              {n.verified ? <span className="inline-flex items-center gap-1 text-sm text-ok"><Check className="h-4 w-4" /> {t("যাচাইকৃত", "Verified")}</span>
                : <button onClick={() => { setList((l) => l.map((x) => x.id === n.id ? { ...x, verified: true } : x)); toast.success(t("চাহিদা যাচাইকৃত", "Need verified")); }} className="rounded-full bg-river px-4 py-2 text-sm text-primary-foreground">{t("যাচাই করুন", "Verify")}</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminAnomalies() {
  const t = useT();
  const { anomalies } = useData();
  return (
    <div>
      <PageHead bn="অসঙ্গতি ও জালিয়াতি" en="Anomalies & fraud" sub_bn="ট্রান্সপারেন্সি এজেন্টের ফ্ল্যাগ" sub_en="Transparency-agent flags" />
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-warn/30 bg-warn/5 p-4 text-sm">
        <ShieldAlert className="h-5 w-5 text-warn" /> {t("ফ্ল্যাগ পরামর্শমূলক — মানুষ সিদ্ধান্ত নেয়; প্রকৃত সুবিধাভোগী যেন বাদ না পড়ে।", "Flags are advisory — humans decide; never block a genuine beneficiary.")}
      </div>
      <div className="space-y-3">
        {anomalies.map((a) => (
          <div key={a.id} className="rounded-2xl border border-border bg-bg-elev p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className={`mt-0.5 h-5 w-5 ${a.severity === "high" ? "text-danger" : a.severity === "med" ? "text-warn" : "text-ink-dim"}`} />
                <div><div>{t(a.type_bn, a.type_en)}</div><div className="text-sm text-ink-dim">{t(a.explanation_bn, a.explanation_en)} · <span className="tabular">{a.ref}</span></div></div>
              </div>
              <button onClick={() => toast.success(t("কেসওয়ার্কারকে পাঠানো হয়েছে", "Sent to caseworker"))} className="shrink-0 rounded-full border border-border px-3 py-1.5 text-sm hover:bg-secondary">{t("পর্যালোচনা", "Review")}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const ROLE_BADGE = {
  donor: { bn: "দাতা", en: "Donor", c: "var(--river)" },
  volunteer: { bn: "স্বেচ্ছাসেবক", en: "Volunteer", c: "var(--river-2)" },
  moderator: { bn: "মডারেটর", en: "Moderator", c: "var(--gold)" },
  admin: { bn: "প্রশাসক", en: "Admin", c: "var(--terracotta)" },
} as const;

export function AdminUsers() {
  const t = useT();
  const { managedUsers } = useData();
  const [users, setUsers] = useState(managedUsers);
  const [q, setQ] = useState("");
  const filtered = users.filter((u) => (t(u.name_bn, u.name_en) + u.id).toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <PageHead bn="ব্যবহারকারী ও ভূমিকা" en="Users & roles" sub_bn="ভূমিকা বরাদ্দ ও অনুমোদন" sub_en="Assign roles & approvals"
        action={<button onClick={() => toast.success(t("আমন্ত্রণ পাঠানো হয়েছে", "Invite sent"))} className="inline-flex items-center gap-2 rounded-full bg-river px-5 py-2.5 text-sm text-primary-foreground"><UserPlus className="h-4 w-4" /> {t("আমন্ত্রণ", "Invite")}</button>} />
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-dim" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("নাম বা আইডি অনুসন্ধান", "Search name or ID")} className="w-full rounded-full border border-border bg-input-background py-2.5 pl-10 pr-4" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-bg-elev">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-panel text-left text-ink-dim"><tr>{["আইডি/ID", "নাম/Name", "ভূমিকা/Role", "পরিধি/Scope", "অবস্থা/Status", ""].map((h, i) => <th key={i} className="whitespace-nowrap px-4 py-3">{h ? t(h.split("/")[0], h.split("/")[1]) : ""}</th>)}</tr></thead>
            <tbody>
              {filtered.map((u) => {
                const rb = ROLE_BADGE[u.role as keyof typeof ROLE_BADGE] ?? ROLE_BADGE.donor;
                return (
                  <tr key={u.id} className="border-t border-border hover:bg-secondary/50">
                    <td className="px-4 py-3 tabular">{u.id}</td>
                    <td className="px-4 py-3">{t(u.name_bn, u.name_en)}</td>
                    <td className="px-4 py-3"><span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs" style={{ background: `color-mix(in srgb, ${rb.c} 16%, transparent)` }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: rb.c }} />{t(rb.bn, rb.en)}</span></td>
                    <td className="px-4 py-3">{t(u.scope_bn, u.scope_en)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${u.status === "active" ? "bg-ok/15 text-ok" : u.status === "pending" ? "bg-warn/15 text-warn" : "bg-danger/15 text-danger"}`}>
                        {t(u.status === "active" ? "সক্রিয়" : u.status === "pending" ? "অপেক্ষমাণ" : "স্থগিত", u.status === "active" ? "Active" : u.status === "pending" ? "Pending" : "Suspended")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.status === "pending"
                        ? <button onClick={() => { setUsers((l) => l.map((x) => x.id === u.id ? { ...x, status: "active" } : x)); toast.success(t("ব্যবহারকারী অনুমোদিত", "User approved")); }} className="rounded-full bg-river px-3 py-1.5 text-xs text-primary-foreground">{t("অনুমোদন", "Approve")}</button>
                        : <button onClick={() => toast(t("ভূমিকা সম্পাদনা", "Edit role"))} className="rounded-full border border-border px-3 py-1.5 text-xs hover:bg-secondary">{t("সম্পাদনা", "Edit")}</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
