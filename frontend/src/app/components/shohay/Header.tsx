import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Menu, X, User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { useShohay, useT } from "../../lib/store";
import { useAuth, HOME_FOR, ROLE_LABEL } from "../../lib/auth";

function WaterLogo() {
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden>
      <circle cx="20" cy="20" r="19" fill="none" stroke="var(--river)" strokeWidth="1.5" />
      <path d="M6 22 C 12 16, 16 28, 22 22 C 28 16, 32 28, 34 22" fill="none" stroke="var(--river-2)" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 27 C 14 22, 18 31, 24 27 C 29 23, 32 30, 33 27" fill="none" stroke="var(--river)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <circle cx="20" cy="11" r="2" fill="var(--gold)" />
    </svg>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useShohay();
  const t = useT();
  return (
    <button
      onClick={toggleTheme}
      aria-label={t("থিম পরিবর্তন", "Toggle theme")}
      className="relative h-8 w-14 rounded-full border border-border bg-panel"
    >
      {/* sun <-> moon over a river line */}
      <span className="pointer-events-none absolute inset-x-2 top-1/2 h-px -translate-y-1/2 bg-river/40" />
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="absolute top-1 h-6 w-6 rounded-full bg-bg-elev shadow"
        style={{ left: theme === "light" ? 4 : 28 }}
      >
        <span className="flex h-full w-full items-center justify-center text-xs">
          {theme === "light" ? "☀" : "☾"}
        </span>
      </motion.span>
    </button>
  );
}

const NAV = [
  { to: "/", bn: "হোম", en: "Home" },
  { to: "/donate", bn: "দান করুন", en: "Donate" },
  { to: "/dashboard", bn: "স্বচ্ছতা মানচিত্র", en: "Transparency" },
  { to: "/ledger", bn: "খতিয়ান", en: "Ledger" },
  { to: "/needs", bn: "চাহিদা", en: "Needs" },
  { to: "/adopt", bn: "উপজেলা দত্তক", en: "Adopt" },
];

function AccountMenu() {
  const t = useT();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menu, setMenu] = useState(false);

  if (!user) {
    return (
      <Link to="/login" className="hidden items-center gap-1.5 rounded-full bg-river px-4 py-1.5 text-sm text-primary-foreground sm:inline-flex">
        <User className="h-4 w-4" /> {t("সাইন ইন", "Sign in")}
      </Link>
    );
  }

  return (
    <div className="relative hidden sm:block">
      <button onClick={() => setMenu((m) => !m)} className="flex items-center gap-2 rounded-full border border-border bg-bg-elev py-1 pl-1 pr-2.5 hover:bg-secondary">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-river text-xs text-primary-foreground">
          {t(user.name_bn, user.name_en).charAt(0)}
        </span>
        <span className="hidden text-sm md:inline">{t(ROLE_LABEL[user.role].bn, ROLE_LABEL[user.role].en)}</span>
        <ChevronDown className="h-3.5 w-3.5 text-ink-dim" />
      </button>
      {menu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenu(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-bg-elev shadow-lg">
            <div className="border-b border-border px-4 py-3">
              <div className="truncate">{t(user.name_bn, user.name_en)}</div>
              <div className="truncate text-xs text-ink-dim">{t(user.org_bn, user.org_en)}</div>
            </div>
            <button onClick={() => { setMenu(false); navigate(HOME_FOR[user.role]); }} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-secondary">
              <LayoutDashboard className="h-4 w-4" /> {t("আমার ড্যাশবোর্ড", "My dashboard")}
            </button>
            <button onClick={() => { setMenu(false); logout(); navigate("/"); }} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-ink-dim hover:bg-secondary">
              <LogOut className="h-4 w-4" /> {t("সাইন আউট", "Sign out")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function Header() {
  const t = useT();
  const { lang, toggleLang } = useShohay();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-4 px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <WaterLogo />
          <span className="flex flex-col leading-none">
            <span className="text-[15px]" style={{ fontFamily: "var(--font-bn-serif)" }}>
              {t("সহায়", "Shohay")}
            </span>
            <span className="hidden text-[10px] uppercase tracking-wider text-ink-dim min-[400px]:block">
              {t("গণপ্রজাতন্ত্রী বাংলাদেশ সরকার", "Govt. of Bangladesh")}
            </span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV.map((n) => {
            const active = pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`rounded-full px-3 py-1.5 text-sm ease-tide transition-colors ${
                  active ? "bg-secondary text-ink" : "text-ink-dim hover:text-ink"
                }`}
              >
                {t(n.bn, n.en)}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={toggleLang}
            className="rounded-full border border-border px-3 py-1 text-sm text-ink hover:bg-secondary"
          >
            {lang === "bn" ? "English" : "বাংলা"}
          </button>
          <ThemeToggle />
          <AccountMenu />
          <button className="lg:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-background px-4 py-3 lg:hidden">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className={`block rounded-lg px-3 py-2.5 ${pathname === n.to ? "bg-secondary" : "text-ink-dim"}`}
            >
              {t(n.bn, n.en)}
            </Link>
          ))}
          <Link to="/field" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-ink-dim">
            {t("মাঠকর্মী অ্যাপ", "Field app")}
          </Link>

          <div className="my-2 h-px bg-border" />
          {user ? (
            <>
              <Link to={HOME_FOR[user.role]} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5">
                <LayoutDashboard className="h-4 w-4 text-river" /> {t("আমার ড্যাশবোর্ড", "My dashboard")} · {t(ROLE_LABEL[user.role].bn, ROLE_LABEL[user.role].en)}
              </Link>
              <button onClick={() => { setOpen(false); logout(); navigate("/"); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-ink-dim">
                <LogOut className="h-4 w-4" /> {t("সাইন আউট", "Sign out")}
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg bg-river px-3 py-2.5 text-primary-foreground">
              <User className="h-4 w-4" /> {t("সাইন ইন", "Sign in")}
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
