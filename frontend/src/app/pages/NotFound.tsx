import { Link } from "react-router";
import { useT } from "../lib/store";

export function NotFound() {
  const t = useT();
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-28 text-center">
      <svg viewBox="0 0 100 40" className="w-48">
        <path d="M2 20 C 14 8, 22 32, 34 20 C 46 8, 54 32, 66 20 C 78 8, 86 32, 98 20" fill="none" stroke="var(--river)" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <h1 className="mt-6 text-4xl tabular">৪০৪</h1>
      <p className="mt-3 text-ink-dim">
        {t("এই পৃষ্ঠাটি খুঁজে পাওয়া যায়নি — নদী অন্য পথে বয়ে গেছে।", "This page couldn't be found — the river took another course.")}
      </p>
      <Link to="/" className="mt-7 rounded-full bg-river px-6 py-3 text-primary-foreground">{t("হোমে ফিরুন", "Back home")}</Link>
    </div>
  );
}
