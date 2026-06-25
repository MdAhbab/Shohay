import { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { WifiOff, Camera, MapPin, Check, CloudUpload, PenLine, Minus, Plus, Mic, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { useT, toBnDigits } from "../lib/store";

interface QueueItem { id: string; area: string; people: number; synced: boolean }

export function Field() {
  const t = useT();
  const [people, setPeople] = useState(18);
  const [photo, setPhoto] = useState(false);
  const [gps, setGps] = useState(false);
  const [signed, setSigned] = useState(false);
  const [online, setOnline] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([
    { id: "D-5521", area: "মনপুরা", people: 80, synced: true },
    { id: "D-5524", area: "চরফ্যাশন", people: 42, synced: false },
  ]);

  const submit = () => {
    const item = { id: "D-" + Math.floor(5530 + Math.random() * 40), area: "ভোলা সদর", people, synced: false };
    setQueue((q) => [item, ...q]);
    setPhoto(false); setGps(false); setSigned(false); setPeople(18);
    toast.success(t("সারিতে যুক্ত — অনলাইনে সিঙ্ক হবে", "Queued — will sync when online"));
  };

  const sync = () => {
    setOnline(true);
    setQueue((q) => q.map((i) => ({ ...i, synced: true })));
    toast.success(t("সব রেকর্ড সিঙ্ক সম্পন্ন", "All records synced"));
  };

  // Utilitarian high-contrast field skin (dark, big targets, glove-friendly)
  return (
    <div className="min-h-screen bg-[#0b1512] text-[#f2fff9]">
      <div className="mx-auto max-w-md px-4 py-6">
        <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-[#9cb6ad] hover:text-[#f2fff9]">
          <ChevronLeft className="h-4 w-4" /> {t("সাইটে ফিরুন", "Back to site")}
        </Link>
        {/* offline banner */}
        <div className={`mb-4 flex items-center justify-between rounded-xl px-4 py-3 text-sm ${online ? "bg-[#13402f]" : "bg-[#5a3417]"}`}>
          <span className="flex items-center gap-2">
            {online ? <Check className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            {online ? t("অনলাইন — সিঙ্ক সক্রিয়", "Online — sync active") : t("অফলাইন মোড — স্থানীয়ভাবে সংরক্ষিত", "Offline — saved locally")}
          </span>
          {!online && <button onClick={sync} className="rounded-full bg-[#22c29e] px-3 py-1 text-[#06140f]">{t("সিঙ্ক", "Sync")}</button>}
        </div>

        <h1 className="text-2xl">{t("বিতরণ লগ", "Log distribution")}</h1>
        <p className="mt-1 text-sm text-[#9cb6ad]">{t("বরাদ্দ A-3310 · মনপুরা · খাদ্য প্যাকেজ", "Allocation A-3310 · Monpura · Food packs")}</p>

        {/* beneficiary stepper — big targets */}
        <div className="mt-6 rounded-2xl bg-[#11302a] p-5">
          <div className="text-sm text-[#9cb6ad]">{t("সুবিধাভোগী পরিবার", "Beneficiary households")}</div>
          <div className="mt-3 flex items-center justify-between">
            <button onClick={() => setPeople((p) => Math.max(0, p - 1))} className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1a4339]"><Minus className="h-7 w-7" /></button>
            <span className="tabular text-5xl">{toBnDigits(people)}</span>
            <button onClick={() => setPeople((p) => p + 1)} className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#22c29e] text-[#06140f]"><Plus className="h-7 w-7" /></button>
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
          disabled={!(photo && gps && signed)}
          onClick={submit}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#22c29e] py-6 text-xl text-[#06140f] disabled:opacity-40"
        >
          <Check className="h-7 w-7" /> {t("বিতরণ সংরক্ষণ করুন", "Save distribution")}
        </button>

        <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#1a4339] py-4 text-[#9cb6ad]">
          <Mic className="h-5 w-5" /> {t("বাংলা ভয়েস নির্দেশনা", "Bangla voice prompt")}
        </button>

        {/* sync queue */}
        <div className="mt-8">
          <div className="mb-2 flex items-center gap-2 text-sm text-[#9cb6ad]"><CloudUpload className="h-4 w-4" /> {t("সিঙ্ক সারি", "Sync queue")}</div>
          <div className="space-y-2">
            {queue.map((i) => (
              <motion.div key={i.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between rounded-xl bg-[#11302a] px-4 py-3">
                <span className="tabular">{i.id} · {i.area} · {toBnDigits(i.people)} {t("পরিবার", "hh")}</span>
                <span className={`flex items-center gap-1 text-xs ${i.synced ? "text-[#3dd37f]" : "text-[#e6a24b]"}`}>
                  {i.synced ? <><Check className="h-3.5 w-3.5" /> {t("সিঙ্কড", "Synced")}</> : t("অপেক্ষমাণ", "Pending")}
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
