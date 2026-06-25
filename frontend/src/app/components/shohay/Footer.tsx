import { Link } from "react-router";
import { Download, ExternalLink } from "lucide-react";
import { useT } from "../../lib/store";

export function Footer() {
  const t = useT();
  const cols = [
    {
      head_bn: "প্ল্যাটফর্ম", head_en: "Platform",
      links: [
        { to: "/donate", bn: "দান করুন", en: "Donate" },
        { to: "/track", bn: "দান ট্র্যাক করুন", en: "Track a donation" },
        { to: "/dashboard", bn: "স্বচ্ছতা মানচিত্র", en: "Transparency map" },
        { to: "/needs", bn: "চাহিদা নিবন্ধন", en: "Need registry" },
      ],
    },
    {
      head_bn: "জবাবদিহি", head_en: "Accountability",
      links: [
        { to: "/ledger", bn: "উন্মুক্ত খতিয়ান", en: "Open ledger" },
        { to: "/adopt", bn: "উপজেলা দত্তক", en: "Adopt an Upazila" },
        { to: "/access", bn: "SMS/USSD প্রবেশ", en: "SMS/USSD access" },
        { to: "/field", bn: "মাঠকর্মী অ্যাপ", en: "Field volunteer app" },
      ],
    },
  ];

  return (
    <footer className="mt-24 border-t border-border bg-panel">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-14 md:grid-cols-4 md:px-6">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <svg viewBox="0 0 40 40" className="h-8 w-8" aria-hidden>
              <circle cx="20" cy="20" r="19" fill="none" stroke="var(--river)" strokeWidth="1.5" />
              <path d="M6 22 C 12 16, 16 28, 22 22 C 28 16, 32 28, 34 22" fill="none" stroke="var(--river-2)" strokeWidth="2" strokeLinecap="round" />
              <circle cx="20" cy="11" r="2" fill="var(--gold)" />
            </svg>
            <span style={{ fontFamily: "var(--font-bn-serif)" }}>{t("সহায়", "Shohay")}</span>
          </div>
          <p className="mt-4 max-w-md text-sm text-ink-dim">
            {t(
              "গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের একটি জনকল্যাণমূলক প্ল্যাটফর্ম — প্রতিটি দান প্রতিশ্রুতি থেকে বিতরণ পর্যন্ত যাচাইযোগ্য।",
              "A public-good platform by the Government of Bangladesh — every donation verifiable from pledge to distribution.",
            )}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm hover:bg-secondary" href="#">
              <Download className="h-4 w-4" /> {t("ওপেন-ডেটা (CSV/JSON)", "Open data (CSV/JSON)")}
            </a>
            <a className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm hover:bg-secondary" href="https://a2i.gov.bd/" target="_blank" rel="noreferrer">
              a2i <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.head_en}>
            <h4 className="mb-3 text-ink-dim">{t(c.head_bn, c.head_en)}</h4>
            <ul className="space-y-2 text-sm">
              {c.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-ink-dim hover:text-river">{t(l.bn, l.en)}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-2 px-4 py-5 text-xs text-ink-dim md:flex-row md:items-center md:justify-between md:px-6">
          <span>© {new Date().getFullYear()} {t("দুর্যোগ ব্যবস্থাপনা ও ত্রাণ মন্ত্রণালয় · a2i", "Ministry of Disaster Management & Relief · a2i")}</span>
          <span>{t("গোপনীয়তা · ব্যবহারের শর্ত · WCAG AA", "Privacy · Terms · WCAG AA")}</span>
        </div>
      </div>
    </footer>
  );
}
