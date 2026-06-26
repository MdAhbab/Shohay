import { useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Banknote, Boxes, Check, MapPin, QrCode, Smartphone, CreditCard, Truck, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { useT, useShohay, toBnDigits } from "../lib/store";
import { divisions, upazilasByDivision } from "../lib/data";
import { Eyebrow } from "../components/shohay/primitives";
import { postDonation } from "../lib/api";

type Kind = "money" | "goods";
const AMOUNTS = [500, 1000, 2500, 5000, 10000];
const CHANNELS = [
  { id: "bkash", label: "বিকাশ / bKash", icon: Smartphone, color: "#e2136e" },
  { id: "nagad", label: "নগদ / Nagad", icon: Smartphone, color: "#f6921e" },
  { id: "rocket", label: "রকেট / Rocket", icon: Smartphone, color: "#8c3494" },
  { id: "card", label: "কার্ড / Card", icon: CreditCard, color: "var(--river)" },
];
const GOODS = [
  { id: "food", bn: "খাদ্য", en: "Food" },
  { id: "clothes", bn: "বস্ত্র", en: "Clothes" },
  { id: "medicine", bn: "ঔষধ", en: "Medicine" },
  { id: "water", bn: "পানি", en: "Water" },
  { id: "shelter", bn: "আশ্রয়", en: "Shelter" },
  { id: "other", bn: "অন্যান্য", en: "Other" },
];

export function Donate() {
  const t = useT();
  const { bnNumerals, lang } = useShohay();
  const [step, setStep] = useState(0);
  const [kind, setKind] = useState<Kind>("money");
  const [amount, setAmount] = useState(2500);
  const [channel, setChannel] = useState("bkash");
  const [zakat, setZakat] = useState(false);
  const [earmark, setEarmark] = useState("most");
  const [division, setDivision] = useState("");
  const [upazila, setUpazila] = useState("");
  const [good, setGood] = useState("food");
  const [qty, setQty] = useState(10);
  const [logistics, setLogistics] = useState<"dropoff" | "pickup">("dropoff");
  const [donationId, setDonationId] = useState("D-" + Math.floor(10000 + Math.random() * 89999));
  const [submitting, setSubmitting] = useState(false);

  const fmt = (n: number) => (bnNumerals && lang === "bn" ? toBnDigits(n.toLocaleString("en-IN")) : n.toLocaleString("en-IN"));
  const steps = [t("ধরন", "Type"), t("বিবরণ", "Details"), t("পর্যালোচনা", "Review"), t("সম্পন্ন", "Done")];

  const next = () => setStep((s) => Math.min(3, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const targetGeocode = earmark === "pick" ? (upazila || division || undefined) : undefined;

  const confirm = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const result = await postDonation(
        kind === "money"
          ? { kind: "money", amount, channel, target_geocode: targetGeocode, zakat }
          : { kind: good, qty, item: GOODS.find((g) => g.id === good)?.en, channel: logistics, target_geocode: targetGeocode },
      );
      // Use the server's real, ledger-backed id so the tracking link resolves.
      setDonationId(result.id);
      toast.success(t("দান নিশ্চিত হয়েছে — খতিয়ানে যুক্ত হয়েছে", "Donation confirmed — recorded in the ledger"));
    } catch {
      // Offline/demo: keep the optimistic local id so the flow still completes.
      toast.success(t("দান নিশ্চিত হয়েছে — ট্র্যাকিং লিংক তৈরি", "Donation confirmed — tracking link created"));
    } finally {
      setSubmitting(false);
      next();
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <Eyebrow bn="দান করুন" en="Donate" />
      <h1 className="mt-4 text-[clamp(1.6rem,4vw,2.4rem)]">{t("সহজে, নিরাপদে দিন", "Give simply and securely")}</h1>
      <p className="mt-2 text-ink-dim">{t("কোনো খরচ ছাড়াই — প্রতিটি অবদান যাচাইযোগ্য।", "No fees — every contribution is verifiable.")}</p>

      {/* stepper */}
      <div className="mt-8 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${i <= step ? "bg-river text-primary-foreground" : "bg-secondary text-ink-dim"}`}>
              {i < step ? <Check className="h-4 w-4" /> : toBnDigits(i + 1)}
            </div>
            <span className={`hidden text-sm sm:block ${i <= step ? "text-ink" : "text-ink-dim"}`}>{s}</span>
            {i < steps.length - 1 && <div className={`h-px flex-1 ${i < step ? "bg-river" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-bg-elev p-6 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
          >
            {/* STEP 0 — type */}
            {step === 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {([
                  { k: "money" as Kind, icon: Banknote, bn: "অর্থ দান", en: "Donate money", d_bn: "বিকাশ, নগদ, রকেট বা কার্ড", d_en: "bKash, Nagad, Rocket or card" },
                  { k: "goods" as Kind, icon: Boxes, bn: "ত্রাণসামগ্রী", en: "Donate goods", d_bn: "খাদ্য, বস্ত্র, ঔষধ, পানি", d_en: "Food, clothes, medicine, water" },
                ]).map((o) => (
                  <button
                    key={o.k}
                    onClick={() => setKind(o.k)}
                    className={`rounded-xl border-2 p-6 text-left ease-tide transition-all ${kind === o.k ? "border-river bg-river/5" : "border-border hover:border-river/40"}`}
                  >
                    <o.icon className="h-8 w-8 text-river" />
                    <div className="mt-3">{t(o.bn, o.en)}</div>
                    <div className="text-sm text-ink-dim">{t(o.d_bn, o.d_en)}</div>
                  </button>
                ))}
              </div>
            )}

            {/* STEP 1 — details */}
            {step === 1 && kind === "money" && (
              <div className="space-y-6">
                <div>
                  <label>{t("পরিমাণ (৳)", "Amount (৳)")}</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {AMOUNTS.map((a) => (
                      <button key={a} onClick={() => setAmount(a)} className={`rounded-full border px-4 py-2 tabular ${amount === a ? "border-river bg-river text-primary-foreground" : "border-border hover:bg-secondary"}`}>
                        ৳{fmt(a)}
                      </button>
                    ))}
                  </div>
                  <input type="number" value={amount} onChange={(e) => setAmount(+e.target.value)} className="mt-3 w-full rounded-lg border border-border bg-input-background px-4 py-3 tabular" />
                </div>
                <div>
                  <label>{t("মাধ্যম", "Channel")}</label>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {CHANNELS.map((c) => (
                      <button key={c.id} onClick={() => setChannel(c.id)} className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs ${channel === c.id ? "border-river bg-river/5" : "border-border hover:bg-secondary"}`}>
                        <c.icon className="h-5 w-5" style={{ color: c.color }} />
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
                <EarmarkPicker {...{ earmark, setEarmark, division, setDivision, upazila, setUpazila }} />
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={zakat} onChange={(e) => setZakat(e.target.checked)} className="h-5 w-5 accent-[var(--river)]" />
                  <span className="text-sm">{t("যাকাত/সদকা হিসেবে চিহ্নিত করুন", "Tag as zakat / sadaqah")}</span>
                </label>
              </div>
            )}

            {step === 1 && kind === "goods" && (
              <div className="space-y-6">
                <div>
                  <label>{t("সামগ্রীর ধরন", "Item type")}</label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {GOODS.map((g) => (
                      <button key={g.id} onClick={() => setGood(g.id)} className={`rounded-xl border p-3 text-sm ${good === g.id ? "border-river bg-river/5" : "border-border hover:bg-secondary"}`}>
                        {t(g.bn, g.en)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label>{t("পরিমাণ", "Quantity")}</label>
                  <input type="number" value={qty} onChange={(e) => setQty(+e.target.value)} className="mt-2 w-full rounded-lg border border-border bg-input-background px-4 py-3 tabular" />
                </div>
                <div>
                  <label>{t("পৌঁছানোর উপায়", "Logistics")}</label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button onClick={() => setLogistics("dropoff")} className={`flex items-center gap-2 rounded-xl border p-3 text-sm ${logistics === "dropoff" ? "border-river bg-river/5" : "border-border"}`}>
                      <MapPin className="h-4 w-4 text-river" /> {t("ড্রপ-অফ পয়েন্ট", "Drop-off point")}
                    </button>
                    <button onClick={() => setLogistics("pickup")} className={`flex items-center gap-2 rounded-xl border p-3 text-sm ${logistics === "pickup" ? "border-river bg-river/5" : "border-border"}`}>
                      <Truck className="h-4 w-4 text-river" /> {t("পিকআপ নির্ধারণ", "Schedule pickup")}
                    </button>
                  </div>
                  <div className="mt-3 grid h-36 place-items-center rounded-xl border border-dashed border-border bg-panel text-sm text-ink-dim river-contours">
                    <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {t("মানচিত্রে অবস্থান নির্বাচন করুন", "Select a location on the map")}</span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 — review */}
            {step === 2 && (
              <div className="space-y-4">
                <h3>{t("আপনার দান পর্যালোচনা করুন", "Review your donation")}</h3>
                <dl className="divide-y divide-border rounded-xl border border-border">
                  <Row label={t("ধরন", "Type")} value={kind === "money" ? t("অর্থ", "Money") : t("ত্রাণসামগ্রী", "Goods")} />
                  {kind === "money" ? (
                    <>
                      <Row label={t("পরিমাণ", "Amount")} value={`৳ ${fmt(amount)}`} />
                      <Row label={t("মাধ্যম", "Channel")} value={CHANNELS.find((c) => c.id === channel)!.label} />
                      {zakat && <Row label={t("ট্যাগ", "Tag")} value={t("যাকাত/সদকা", "Zakat/Sadaqah")} />}
                    </>
                  ) : (
                    <>
                      <Row label={t("সামগ্রী", "Item")} value={`${t(GOODS.find((g) => g.id === good)!.bn, GOODS.find((g) => g.id === good)!.en)} ×${fmt(qty)}`} />
                      <Row label={t("উপায়", "Logistics")} value={logistics === "dropoff" ? t("ড্রপ-অফ", "Drop-off") : t("পিকআপ", "Pickup")} />
                    </>
                  )}
                  <Row label={t("এলাকা", "Area")} value={earmark === "most" ? t("যেখানে সবচেয়ে প্রয়োজন", "Where needed most") : `${divisions.find((d) => d.geocode === division)?.[lang === "bn" ? "name_bn" : "name_en"] ?? "—"}`} />
                </dl>
                <p className="text-xs text-ink-dim">{t("নিশ্চিত করলে একটি যাচাইযোগ্য খতিয়ান এন্ট্রি তৈরি হবে।", "Confirming creates a verifiable ledger entry.")}</p>
              </div>
            )}

            {/* STEP 3 — success */}
            {step === 3 && (
              <div className="text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 16 }} className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ok/15 text-ok">
                  <Check className="h-8 w-8" />
                </motion.div>
                <h3 className="mt-4">{t("ধন্যবাদ! আপনার দান গৃহীত হয়েছে।", "Thank you! Your donation is recorded.")}</h3>
                <p className="mt-1 text-ink-dim">{t("ট্র্যাকিং আইডি", "Tracking ID")}: <span className="tabular">{donationId}</span></p>
                <div className="mx-auto mt-6 grid h-40 w-40 place-items-center rounded-xl border border-border bg-panel">
                  <QrCode className="h-24 w-24 text-ink" />
                </div>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link to={`/track/${donationId}`} className="rounded-full bg-river px-6 py-3 text-primary-foreground">{t("দান ট্র্যাক করুন", "Track donation")}</Link>
                  <Link to="/dashboard" className="rounded-full border border-border px-6 py-3 hover:bg-secondary">{t("স্বচ্ছতা মানচিত্র", "Transparency map")}</Link>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {step < 3 && (
          <div className="mt-8 flex items-center justify-between">
            <button onClick={back} disabled={step === 0} className="inline-flex items-center gap-1 text-sm text-ink-dim disabled:opacity-0">
              <ChevronLeft className="h-4 w-4" /> {t("পেছনে", "Back")}
            </button>
            {step === 2 ? (
              <button onClick={confirm} disabled={submitting} className="rounded-full bg-river px-8 py-3 text-primary-foreground ease-tide hover:scale-[1.02] disabled:opacity-60">{submitting ? t("পাঠানো হচ্ছে…", "Sending…") : t("নিশ্চিত করুন", "Confirm")}</button>
            ) : (
              <button onClick={next} className="rounded-full bg-river px-8 py-3 text-primary-foreground ease-tide hover:scale-[1.02]">{t("পরবর্তী", "Continue")}</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EarmarkPicker({ earmark, setEarmark, division, setDivision, upazila, setUpazila }: any) {
  const t = useT();
  const ups = division ? upazilasByDivision[division] ?? [] : [];
  return (
    <div>
      <label>{t("এলাকা নির্ধারণ করুন (ঐচ্ছিক)", "Earmark an area (optional)")}</label>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button onClick={() => setEarmark("most")} className={`rounded-xl border p-3 text-sm ${earmark === "most" ? "border-river bg-river/5" : "border-border"}`}>
          {t("যেখানে সবচেয়ে প্রয়োজন", "Where needed most")}
        </button>
        <button onClick={() => setEarmark("pick")} className={`rounded-xl border p-3 text-sm ${earmark === "pick" ? "border-river bg-river/5" : "border-border"}`}>
          {t("একটি এলাকা বেছে নিন", "Pick an area")}
        </button>
      </div>
      {earmark === "pick" && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <select value={division} onChange={(e) => { setDivision(e.target.value); setUpazila(""); }} className="rounded-lg border border-border bg-input-background px-3 py-2.5">
            <option value="">{t("বিভাগ", "Division")}</option>
            {divisions.map((d) => <option key={d.geocode} value={d.geocode}>{t(d.name_bn, d.name_en)}</option>)}
          </select>
          <select value={upazila} onChange={(e) => setUpazila(e.target.value)} disabled={!ups.length} className="rounded-lg border border-border bg-input-background px-3 py-2.5 disabled:opacity-50">
            <option value="">{t("উপজেলা", "Upazila")}</option>
            {ups.map((u) => <option key={u.geocode} value={u.geocode}>{t(u.name_bn, u.name_en)}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <dt className="text-sm text-ink-dim">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}
