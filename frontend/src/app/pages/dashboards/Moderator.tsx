import { useState } from "react";
import { motion } from "motion/react";
import {
  ClipboardCheck, Camera, ShieldAlert, MapPin, Check, X,
  AlertTriangle, ListChecks, Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useT, toBnDigits } from "../../lib/store";
import { PageHead } from "../../components/shohay/DashboardLayout";
import { StatCard, NeedSeverityTag } from "../../components/shohay/primitives";
import { ImageWithFallback } from "../../components/custom/ImageWithFallback";
import { needs, fieldLogs, anomalies, type FieldLog } from "../../lib/data";

export function ModeratorOverview() {
  const t = useT();
  const pendingNeeds = needs.filter((n) => !n.verified).length;
  const pendingLogs = fieldLogs.filter((f) => f.status === "pending").length;
  return (
    <div>
      <PageHead bn="মডারেটর সারসংক্ষেপ" en="Moderator overview" sub_bn="ভোলা জেলা · যাচাই সারি" sub_en="Bhola district · verification queue" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ClipboardCheck} bn="যাচাই-অপেক্ষমাণ চাহিদা" en="Needs to verify" value={pendingNeeds} />
        <StatCard icon={Camera} bn="পর্যালোচনা-অপেক্ষমাণ বিতরণ" en="Distributions to review" value={pendingLogs} />
        <StatCard icon={ShieldAlert} bn="অসঙ্গতি ফ্ল্যাগ" en="Anomaly flags" value={anomalies.length} />
        <StatCard icon={ListChecks} bn="এই সপ্তাহে যাচাইকৃত" en="Verified this week" value={38} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-bg-elev p-5">
          <h3 className="mb-3">{t("অগ্রাধিকার সারি", "Priority queue")}</h3>
          <div className="space-y-3">
            {needs.filter((n) => !n.verified).map((n) => (
              <div key={n.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0"><div className="truncate">{t(n.area_bn, n.area_en)}</div><div className="text-xs text-ink-dim">#{n.id} · ×{toBnDigits(n.quantity.toLocaleString("en-IN"))}</div></div>
                <NeedSeverityTag severity={n.severity} />
              </div>
            ))}
            {fieldLogs.filter((f) => f.status === "pending").map((f) => (
              <div key={f.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0"><div className="truncate">{t(f.items_bn, f.items_en)}</div><div className="text-xs text-ink-dim">#{f.id} · {t(f.area_bn, f.area_en)}</div></div>
                <span className="flex items-center gap-1 text-xs text-warn"><Clock className="h-3.5 w-3.5" /> {t("অপেক্ষমাণ", "Pending")}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-warn/30 bg-warn/5 p-5">
          <div className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-warn" /><h3>{t("নীতিগত মনে রাখুন", "Keep in mind")}</h3></div>
          <ul className="mt-3 space-y-2 text-sm text-ink-dim">
            <li>• {t("ফ্ল্যাগ পরামর্শমূলক — কখনো স্বয়ংক্রিয়ভাবে সহায়তা বন্ধ নয়।", "Flags are advisory — never auto-deny aid.")}</li>
            <li>• {t("সকল যাচাই অডিট-লগে সংরক্ষিত হয়।", "Every verification is logged to the audit trail.")}</li>
            <li>• {t("ব্যক্তিগত তথ্য কখনো প্রকাশ করবেন না।", "Never expose beneficiary PII.")}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function ModeratorNeeds() {
  const t = useT();
  const [list, setList] = useState(needs);
  const act = (id: string, verified: boolean) => {
    setList((l) => l.map((n) => (n.id === id ? { ...n, verified } : n)));
    toast.success(verified ? t("চাহিদা যাচাইকৃত", "Need verified") : t("চাহিদা প্রত্যাখ্যাত", "Need rejected"));
  };
  return (
    <div>
      <PageHead bn="চাহিদা যাচাই" en="Verify needs" sub_bn="সম্প্রদায় ও এজেন্টের খসড়া চাহিদা পর্যালোচনা" sub_en="Review community & agent-drafted needs" />
      <div className="space-y-3">
        {list.map((n) => (
          <div key={n.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-bg-elev p-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-river" />
              <div>
                <div>{t(n.area_bn, n.area_en)} <span className="text-sm text-ink-dim">#{n.id}</span></div>
                <div className="text-sm text-ink-dim">×{toBnDigits(n.quantity.toLocaleString("en-IN"))}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NeedSeverityTag severity={n.severity} />
              {n.verified ? (
                <span className="inline-flex items-center gap-1 text-sm text-ok"><Check className="h-4 w-4" /> {t("যাচাইকৃত", "Verified")}</span>
              ) : (
                <>
                  <button onClick={() => act(n.id, true)} className="inline-flex items-center gap-1.5 rounded-full bg-river px-4 py-2 text-sm text-primary-foreground"><Check className="h-4 w-4" /> {t("যাচাই", "Verify")}</button>
                  <button onClick={() => act(n.id, false)} className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary"><X className="h-4 w-4" /> {t("বাতিল", "Reject")}</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ModeratorDistributions() {
  const t = useT();
  const [logs, setLogs] = useState(fieldLogs);
  const act = (id: string, status: FieldLog["status"]) => {
    setLogs((l) => l.map((f) => (f.id === id ? { ...f, status } : f)));
    toast.success(status === "verified" ? t("বিতরণ যাচাইকৃত ও খতিয়ানে স্বাক্ষরিত", "Distribution verified & signed to ledger") : t("পর্যালোচনার জন্য ফ্ল্যাগ করা হয়েছে", "Flagged for review"));
  };
  return (
    <div>
      <PageHead bn="বিতরণ পর্যালোচনা" en="Review distributions" sub_bn="মাঠকর্মীর জিও-স্ট্যাম্পড লগ যাচাই" sub_en="Verify field volunteers' geo-stamped logs" />
      <div className="grid gap-4 md:grid-cols-2">
        {logs.map((f) => (
          <motion.div key={f.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-2xl border border-border bg-bg-elev">
            <div className="relative h-40">
              <ImageWithFallback src={f.photo} alt={t(f.items_bn, f.items_en)} className="h-full w-full object-cover" style={{ filter: "saturate(0.9)" }} />
              <span className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${f.geo ? "bg-ok/90 text-white" : "bg-warn/90 text-white"}`}>
                <MapPin className="h-3 w-3" /> {f.geo ? t("জিও-ট্যাগড", "Geo-tagged") : t("জিও-ট্যাগ নেই", "No geo-tag")}
              </span>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="tabular">{f.id}</div>
                <div className="text-xs text-ink-dim">{f.ts}</div>
              </div>
              <div className="mt-1">{t(f.items_bn, f.items_en)}</div>
              <div className="text-sm text-ink-dim">{t(f.area_bn, f.area_en)} · {toBnDigits(f.households)} {t("পরিবার", "households")} · {t(f.volunteer_bn, f.volunteer_en)}</div>
              {f.status === "pending" ? (
                <div className="mt-3 flex gap-2">
                  <button onClick={() => act(f.id, "verified")} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-river py-2 text-sm text-primary-foreground"><Check className="h-4 w-4" /> {t("যাচাই", "Verify")}</button>
                  <button onClick={() => act(f.id, "flagged")} className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary"><AlertTriangle className="h-4 w-4" /> {t("ফ্ল্যাগ", "Flag")}</button>
                </div>
              ) : (
                <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm ${f.status === "verified" ? "bg-ok/15 text-ok" : "bg-terracotta/15 text-terracotta"}`}>
                  {f.status === "verified" ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  {f.status === "verified" ? t("যাচাইকৃত", "Verified") : t("ফ্ল্যাগড", "Flagged")}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function ModeratorAnomalies() {
  const t = useT();
  return (
    <div>
      <PageHead bn="অসঙ্গতি সারি" en="Anomaly queue" sub_bn="পরামর্শমূলক ফ্ল্যাগ — মানবিক পর্যালোচনার জন্য" sub_en="Advisory flags — for human review" />
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-warn/30 bg-warn/5 p-4 text-sm">
        <ShieldAlert className="h-5 w-5 text-warn" /> {t("ফ্ল্যাগ কখনো স্বয়ংক্রিয়ভাবে সহায়তা বন্ধ করে না।", "Flags never auto-deny aid to anyone.")}
      </div>
      <div className="space-y-3">
        {anomalies.map((a) => (
          <div key={a.id} className="rounded-2xl border border-border bg-bg-elev p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className={`mt-0.5 h-5 w-5 ${a.severity === "high" ? "text-danger" : a.severity === "med" ? "text-warn" : "text-ink-dim"}`} />
                <div>
                  <div>{t(a.type_bn, a.type_en)}</div>
                  <div className="text-sm text-ink-dim">{t(a.explanation_bn, a.explanation_en)} · <span className="tabular">{a.ref}</span></div>
                </div>
              </div>
              <button onClick={() => toast.success(t("কেসওয়ার্কারকে এসকেলেট করা হয়েছে", "Escalated to caseworker"))} className="shrink-0 rounded-full border border-border px-3 py-1.5 text-sm hover:bg-secondary">{t("এসকেলেট", "Escalate")}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
