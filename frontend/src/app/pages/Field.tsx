import { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { Camera, MapPin, Check, PenLine, Minus, Plus, Mic, ChevronLeft, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { useT, toBnDigits, useData, useDataActions } from "../lib/store";
import { postDistribution } from "../lib/api";

// Allocation context this volunteer is logging against (demo).
const ALLOCATION = { ref: "A-3310", geocode: "5002", area_bn: "মনপুরা", area_en: "Monpura", items_bn: "খাদ্য প্যাকেজ", items_en: "Food packs" };

export function Field() {
  const t = useT();
  const { fieldLogs } = useData();
  const { addFieldLog } = useDataActions();
  const [people, setPeople] = useState(18);
  const [photo, setPhoto] = useState(false);
  const [gps, setGps] = useState(false);
  const [signed, setSigned] = useState(false);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (saving) return;
    setSaving(true);
    const localId = "D-" + Math.floor(5530 + Math.random() * 400);
    try {
      const res = await postDistribution({ households: people, items: ALLOCATION.items_en, geocode: ALLOCATION.geocode, geo: gps });
      addFieldLog({
        id: res.id, area_bn: ALLOCATION.area_bn, area_en: ALLOCATION.area_en,
        volunteer_bn: "মাঠকর্মী", volunteer_en: "Field volunteer",
        households: people, items_bn: `${ALLOCATION.items_bn} ×${people}`, items_en: `${ALLOCATION.items_en} ×${people}`,
        ts: res.ts, photo: "", geo: gps, status: "pending",
      });
      toast.success(t("বিতরণ সংরক্ষিত — খতিয়ানে যুক্ত", "Saved — recorded in the ledger"));
    } catch {
      addFieldLog({
        id: localId, area_bn: ALLOCATION.area_bn, area_en: ALLOCATION.area_en,
        volunteer_bn: "মাঠকর্মী", volunteer_en: "Field volunteer",
        households: people, items_bn: `${ALLOCATION.items_bn} ×${people}`, items_en: `${ALLOCATION.items_en} ×${people}`,
        ts: t("এইমাত্র", "just now"), photo: "", geo: gps, status: "pending",
      });
      toast.success(t("বিতরণ সংরক্ষিত", "Distribution saved"));
    } finally {
      setPhoto(false); setGps(false); setSigned(false); setPeople(18);
      setSaving(false);
    }
  };

  // Utilitarian high-contrast field skin (dark, big targets, glove-friendly).
  return (
    <div className="min-h-screen bg-[#0b1512] text-[#f2fff9]">
      <div className="mx-auto max-w-md px-4 py-6">
        <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-[#9cb6ad] hover:text-[#f2fff9]">
          <ChevronLeft className="h-4 w-4" /> {t("সাইটে ফিরুন", "Back to site")}
        </Link>

        <h1 className="text-2xl">{t("বিতরণ লগ", "Log distribution")}</h1>
        <p className="mt-1 text-sm text-[#9cb6ad]">
          {t(`বরাদ্দ ${ALLOCATION.ref} · ${ALLOCATION.area_bn} · ${ALLOCATION.items_bn}`, `Allocation ${ALLOCATION.ref} · ${ALLOCATION.area_en} · ${ALLOCATION.items_en}`)}
        </p>

        {/* beneficiary stepper — big targets */}
        <div className="mt-6 rounded-2xl bg-[#11302a] p-5">
          <div className="text-sm text-[#9cb6ad]">{t("সুবিধাভোগী পরিবার", "Beneficiary households")}</div>
          <div className="mt-3 flex items-center justify-between">
            <button onClick={() => setPeople((p) => Math.max(0, p - 1))} aria-label={t("কমান", "Decrease")} className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1a4339]"><Minus className="h-7 w-7" /></button>
            <span className="tabular text-5xl">{toBnDigits(people)}</span>
            <button onClick={() => setPeople((p) => p + 1)} aria-label={t("বাড়ান", "Increase")} className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#22c29e] text-[#06140f]"><Plus className="h-7 w-7" /></button>
          </div>
        </div>

        {/* capture buttons */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <CaptureBtn done={gps} onClick={() => setGps(true)} icon={MapPin} label={t("GPS ধরুন", "Capture GPS")} sub="22.32°N, 90.95°E" />
          <CaptureBtn done={photo} onClick={() => setPhoto(true)} icon={Camera} label={t("ছবি তুলুন", "Take photo")} sub={t("জিও-স্ট্যাম্পড", "Geo-stamped")} />
        </div>

        <button onClick={() => setSigned((s) => !s)} className={`mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-5 text-lg ${signed ? "bg-[#13402f]" : "bg-[#11302a]"}`}>
          {signed ? <Check className="h-6 w-6 text-[#3dd37f]" /> : <PenLine className="h-6 w-6" />}
          {signed ? t("স্বাক্ষরিত", "Signed") : t("স্বাক্ষর করুন", "Sign off")}
        </button>

        <button
          disabled={!(photo && gps && signed) || saving}
          onClick={submit}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#22c29e] py-6 text-xl text-[#06140f] disabled:opacity-40"
        >
          <Check className="h-7 w-7" /> {saving ? t("সংরক্ষণ হচ্ছে…", "Saving…") : t("বিতরণ সংরক্ষণ করুন", "Save distribution")}
        </button>

        <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#1a4339] py-4 text-[#9cb6ad]">
          <Mic className="h-5 w-5" /> {t("বাংলা ভয়েস নির্দেশনা", "Bangla voice prompt")}
        </button>

        {/* recent logs */}
        <div className="mt-8">
          <div className="mb-2 flex items-center gap-2 text-sm text-[#9cb6ad]"><ClipboardList className="h-4 w-4" /> {t("সাম্প্রতিক লগ", "Recent logs")}</div>
          <div className="space-y-2">
            {fieldLogs.map((i) => (
              <motion.div key={i.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between rounded-xl bg-[#11302a] px-4 py-3">
                <span className="tabular">{i.id} · {t(i.area_bn, i.area_en)} · {toBnDigits(i.households)} {t("পরিবার", "hh")}</span>
                <span className={`flex items-center gap-1 text-xs ${i.status === "verified" ? "text-[#3dd37f]" : i.status === "flagged" ? "text-[#e5564b]" : "text-[#e6a24b]"}`}>
                  {i.status === "verified" ? <><Check className="h-3.5 w-3.5" /> {t("যাচাইকৃত", "Verified")}</> : i.status === "flagged" ? t("ফ্ল্যাগড", "Flagged") : t("যাচাই বাকি", "Pending review")}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CaptureBtn({ done, onClick, icon: Icon, label, sub }: any) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 rounded-2xl py-5 ${done ? "bg-[#13402f]" : "bg-[#11302a]"}`}>
      {done ? <Check className="h-7 w-7 text-[#3dd37f]" /> : <Icon className="h-7 w-7" />}
      <span>{label}</span>
      <span className="tabular text-xs text-[#9cb6ad]">{sub}</span>
    </button>
  );
}
