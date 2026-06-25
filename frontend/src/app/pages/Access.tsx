import { motion } from "motion/react";
import { Phone, MessageSquare, Mic, Hash } from "lucide-react";
import { useT } from "../lib/store";
import { Eyebrow } from "../components/shohay/primitives";

export function Access() {
  const t = useT();

  const ussd = [
    { k: "*১২৩#", bn: "প্রধান মেনু", en: "Main menu" },
    { k: "১", bn: "দান করুন (বিকাশ/নগদ/রকেট)", en: "Donate (bKash/Nagad/Rocket)" },
    { k: "২", bn: "চাহিদা রিপোর্ট করুন", en: "Report a need" },
    { k: "৩", bn: "দানের অবস্থা দেখুন", en: "Check donation status" },
    { k: "৪", bn: "ভাষা: বাংলা/English", en: "Language: Bangla/English" },
  ];

  const sms = [
    { from: "user", text: "DONATE 500 BHOLA" },
    { from: "sys", text: t("৳৫০০ ভোলায় নির্ধারিত? ১=হ্যাঁ ২=না", "৳500 earmarked to Bhola? 1=Yes 2=No") },
    { from: "user", text: "1" },
    { from: "sys", text: t("নিশ্চিত ✓ আইডি D-50231। ট্র্যাক: STATUS D-50231", "Confirmed ✓ ID D-50231. Track: STATUS D-50231") },
  ];

  const voice = [
    { bn: "“সহায়-এ স্বাগতম। দান করতে ১ চাপুন।”", en: "“Welcome to Shohay. Press 1 to donate.”" },
    { bn: "“আপনার এলাকার চাহিদা জানতে ২ চাপুন।”", en: "“Press 2 for needs near you.”" },
    { bn: "“দানের অবস্থা জানতে ৩ চাপুন।”", en: "“Press 3 to check a donation.”" },
  ];

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-12 md:px-6">
      <Eyebrow bn="প্রবেশ স্তর · SMS / USSD / ভয়েস" en="Access layer · SMS / USSD / voice" />
      <h1 className="mt-4 text-[clamp(1.6rem,4vw,2.4rem)]">{t("ইন্টারনেট ছাড়াই সবার নাগালে", "Reaching everyone, no internet needed")}</h1>
      <p className="mt-2 max-w-2xl text-ink-dim">
        {t("স্বল্প-সংযোগ এলাকার জন্য সংক্ষিপ্ত, সংখ্যাযুক্ত, নিশ্চিতযোগ্য প্রবাহ — বাংলা-প্রথম।", "Short, numbered, confirmable flows for low-connectivity areas — Bengali-first.")}
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {/* USSD */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl border border-border bg-bg-elev p-6">
          <div className="flex items-center gap-2 text-river"><Hash className="h-5 w-5" /> USSD</div>
          <div className="mt-4 space-y-2">
            {ussd.map((u) => (
              <div key={u.k} className="flex items-center gap-3 rounded-lg bg-panel px-3 py-2.5">
                <span className="tabular w-12 shrink-0 rounded bg-secondary px-2 py-0.5 text-center text-sm">{u.k}</span>
                <span className="text-sm">{t(u.bn, u.en)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* SMS */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }} className="rounded-2xl border border-border bg-bg-elev p-6">
          <div className="flex items-center gap-2 text-river"><MessageSquare className="h-5 w-5" /> SMS</div>
          <div className="mt-4 space-y-2">
            {sms.map((m, i) => (
              <div key={i} className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.from === "user" ? "ml-auto bg-river text-primary-foreground" : "bg-panel"}`}>
                {m.text}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Voice */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.16 }} className="rounded-2xl border border-border bg-bg-elev p-6">
          <div className="flex items-center gap-2 text-river"><Mic className="h-5 w-5" /> {t("ভয়েস (বাংলা)", "Voice (Bangla)")}</div>
          <div className="mt-4 space-y-3">
            {voice.map((v, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg bg-panel px-3 py-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-river" />
                <span className="text-sm">{t(v.bn, v.en)}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-ink-dim">{t("নিম্ন-সাক্ষরতা ব্যবহারকারীর জন্য স্বল্প, সুস্পষ্ট নির্দেশনা।", "Short, clear prompts for low-literacy users.")}</p>
        </motion.div>
      </div>
    </div>
  );
}
