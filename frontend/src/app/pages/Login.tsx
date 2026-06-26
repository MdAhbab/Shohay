import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router";
import { motion } from "motion/react";
import { HandCoins, ShieldCheck, Building2, ArrowRight, Phone, Check } from "lucide-react";
import { toast } from "sonner";
import { useT, toBnDigits } from "../lib/store";
import { useAuth, HOME_FOR, DEMO_PHONE, type Role } from "../lib/auth";
import { Eyebrow } from "../components/shohay/primitives";

const ROLE_CARDS: { role: Role; icon: any; bn: string; en: string; d_bn: string; d_en: string }[] = [
  { role: "donor", icon: HandCoins, bn: "দাতা হিসেবে", en: "As a donor", d_bn: "আপনার দান, প্রমাণ ও প্রভাব দেখুন", d_en: "See your donations, proof & impact" },
  { role: "moderator", icon: ShieldCheck, bn: "মডারেটর হিসেবে", en: "As a moderator", d_bn: "চাহিদা ও বিতরণ যাচাই করুন", d_en: "Verify needs & distributions" },
  { role: "admin", icon: Building2, bn: "প্রশাসক হিসেবে", en: "As an admin", d_bn: "অভিযান, বরাদ্দ ও তদারকি", d_en: "Campaigns, allocations & oversight" },
];

export function Login() {
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const { requestOtp, verifyOtp, loginDemo } = useAuth();
  const [role, setRole] = useState<Role>("donor");
  const [phone, setPhone] = useState(DEMO_PHONE.donor);
  const [stage, setStage] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);

  const from = (location.state as { from?: string } | null)?.from;
  const go = (target: string) => navigate(from && from !== "/login" ? from : target, { replace: true });

  const pickRole = (r: Role) => {
    setRole(r);
    // Prefill the matching demo number for one-tap sign-in.
    if (!phone || Object.values(DEMO_PHONE).includes(phone)) setPhone(DEMO_PHONE[r]);
  };

  const sendOtp = async () => {
    if (busy) return;
    setBusy(true);
    const code = await requestOtp(phone.trim());
    if (code) {
      setOtp(code); // dev convenience: prefill the returned code
      toast(t(`OTP পাঠানো হয়েছে (ডেমো: ${code})`, `OTP sent (demo: ${code})`));
    } else {
      toast(t("OTP পাঠানো হয়েছে — যেকোনো কোড দিন (ডেমো)", "OTP sent — any code works (demo)"));
    }
    setStage("otp");
    setBusy(false);
  };

  const verify = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const u = await verifyOtp(phone.trim(), otp.trim(), role);
      toast.success(t("সফলভাবে সাইন ইন হয়েছে", "Signed in successfully"));
      go(HOME_FOR[u.role]);
    } catch {
      toast.error(t("OTP যাচাই ব্যর্থ", "OTP verification failed"));
    } finally {
      setBusy(false);
    }
  };

  const quickDemo = () => {
    loginDemo(role);
    toast.success(t("ডেমো প্রবেশ", "Demo sign-in"));
    go(HOME_FOR[role]);
  };

  return (
    <div className="relative overflow-hidden river-contours">
      <div className="mx-auto grid max-w-[1100px] gap-10 px-4 py-12 md:grid-cols-2 md:px-6 md:py-20">
        {/* left — context */}
        <div className="self-center">
          <Eyebrow bn="সাইন ইন" en="Sign in" />
          <h1 className="mt-4 text-[clamp(1.6rem,4vw,2.4rem)]">{t("আপনার ভূমিকা অনুযায়ী ড্যাশবোর্ড", "A dashboard for your role")}</h1>
          <p className="mt-3 max-w-md text-ink-dim">
            {t(
              "ফোন OTP দিয়ে নিরাপদে প্রবেশ করুন। প্রতিটি ভূমিকার নিজস্ব, পরিধি-নির্ধারিত কনসোল আছে।",
              "Enter securely with a phone OTP. Each role has its own scope-limited console.",
            )}
          </p>
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/5 p-4 text-sm text-ink-dim">
            <ShieldCheck className="h-5 w-5 shrink-0 text-gold" />
            {t("ডেমো: যেকোনো নম্বর ও OTP দিন — সরকারি পরিবেশে প্রকৃত যাচাইকরণ হবে।", "Demo: any number & OTP works — real verification in production.")}
          </div>
          <p className="mt-6 text-sm text-ink-dim">
            {t("শুধু ব্রাউজ করতে চান?", "Just browsing?")}{" "}
            <Link to="/dashboard" className="text-river hover:underline">{t("পাবলিক স্বচ্ছতা মানচিত্র", "Public transparency map")}</Link>
          </p>
        </div>

        {/* right — form card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-bg-elev p-6 shadow-lg md:p-8">
          <div className="space-y-2">
            <label>{t("আপনি কোন ভূমিকায় প্রবেশ করছেন?", "Which role are you signing in as?")}</label>
            {ROLE_CARDS.map((r) => (
              <button
                key={r.role}
                onClick={() => pickRole(r.role)}
                className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left ease-tide transition-all ${role === r.role ? "border-river bg-river/5" : "border-border hover:border-river/40"}`}
              >
                <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${role === r.role ? "bg-river text-primary-foreground" : "bg-secondary text-river"}`}>
                  <r.icon className="h-5 w-5" />
                </span>
                <span className="flex-1">
                  <span className="block">{t(r.bn, r.en)}</span>
                  <span className="block text-xs text-ink-dim">{t(r.d_bn, r.d_en)}</span>
                </span>
                {role === r.role && <Check className="h-5 w-5 text-river" />}
              </button>
            ))}
          </div>

          <div className="my-5 h-px bg-border" />

          {stage === "phone" ? (
            <form onSubmit={(e) => { e.preventDefault(); sendOtp(); }}>
              <label>{t("মোবাইল নম্বর", "Mobile number")}</label>
              <div className="relative mt-2">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-dim" />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" inputMode="tel" className="w-full rounded-lg border border-border bg-input-background py-3 pl-10 pr-4 tabular" />
              </div>
              <button disabled={busy} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-river py-3 text-primary-foreground disabled:opacity-60">
                {busy ? t("পাঠানো হচ্ছে…", "Sending…") : t("OTP পাঠান", "Send OTP")} <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); verify(); }}>
              <label>{t("OTP লিখুন", "Enter OTP")}</label>
              <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder={toBnDigits("------")} inputMode="numeric" className="mt-2 w-full rounded-lg border border-border bg-input-background px-4 py-3 text-center tracking-[0.5em] tabular" />
              <button disabled={busy} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-river py-3 text-primary-foreground disabled:opacity-60">
                <Check className="h-4 w-4" /> {busy ? t("যাচাই হচ্ছে…", "Verifying…") : t("যাচাই ও প্রবেশ", "Verify & enter")}
              </button>
              <button type="button" onClick={() => setStage("phone")} className="mt-3 w-full text-sm text-ink-dim hover:text-ink">
                {t("নম্বর পরিবর্তন করুন", "Change number")}
              </button>
            </form>
          )}

          {/* quick demo bypass */}
          <button onClick={quickDemo} className="mt-4 w-full rounded-full border border-border py-2.5 text-sm text-ink-dim hover:bg-secondary">
            {t("দ্রুত ডেমো প্রবেশ", "Quick demo sign-in")} →
          </button>
        </motion.div>
      </div>
    </div>
  );
}
