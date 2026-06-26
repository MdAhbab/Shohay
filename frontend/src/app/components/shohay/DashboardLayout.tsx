import { useState, type ComponentType } from "react";
import { Link, NavLink, Navigate, Outlet, useLocation } from "react-router";
import { Menu, X, LogOut, ExternalLink, ChevronLeft } from "lucide-react";
import { useT, useData } from "../../lib/store";
import { type AppData } from "../../lib/data";
import { useAuth, ROLE_LABEL, HOME_FOR, type Role } from "../../lib/auth";

export interface NavItem {
  to: string;
  icon: ComponentType<{ className?: string }>;
  bn: string;
  en: string;
  badge?: number;
  end?: boolean;
}

export function DashboardLayout({
  role,
  title_bn,
  title_en,
  nav,
}: {
  role: Role;
  title_bn: string;
  title_en: string;
  nav: (d: AppData) => NavItem[];
}) {
  const t = useT();
  const data = useData();
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const navItems = nav(data);

  // Role guard — wrong/no role gets redirected.
  if (!user) return <Navigate to="/login" replace state={{ from: pathname }} />;
  if (user.role !== role) return <Navigate to={HOME_FOR[user.role]} replace />;

  const SidebarInner = (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <div className="text-xs uppercase tracking-[0.18em] text-river">{t(ROLE_LABEL[role].bn, ROLE_LABEL[role].en)}</div>
        <div className="mt-1" style={{ fontFamily: "var(--font-bn-serif)" }}>{t(title_bn, title_en)}</div>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((n) => {
          const Icon = n.icon;
          return (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ease-tide transition-colors ${
                  isActive ? "bg-river text-primary-foreground" : "text-ink-dim hover:bg-secondary hover:text-ink"
                }`
              }
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span className="flex-1">{t(n.bn, n.en)}</span>
              {n.badge ? (
                <span className="rounded-full bg-terracotta/15 px-2 py-0.5 text-xs text-terracotta">{n.badge}</span>
              ) : null}
            </NavLink>
          );
        })}
      </nav>
      <div className="border-t border-border p-3">
        <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-dim hover:bg-secondary">
          <ExternalLink className="h-[18px] w-[18px]" /> {t("সাইটে ফিরুন", "Back to site")}
        </Link>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-dim hover:bg-secondary">
          <LogOut className="h-[18px] w-[18px]" /> {t("সাইন আউট", "Sign out")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="mx-auto flex max-w-[1400px]">
      {/* desktop sidebar */}
      <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-border bg-panel lg:block">
        {SidebarInner}
      </aside>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 border-r border-border bg-panel">
            <button className="absolute right-3 top-3" onClick={() => setOpen(false)} aria-label="Close"><X className="h-5 w-5" /></button>
            {SidebarInner}
          </aside>
        </div>
      )}

      <div className="min-w-0 flex-1">
        {/* topbar */}
        <div className="flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:px-6">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Menu"><Menu className="h-6 w-6" /></button>
          <div className="min-w-0">
            <div className="truncate text-sm text-ink-dim">{t(user.org_bn, user.org_en)}</div>
            <div className="truncate">{t(user.name_bn, user.name_en)}</div>
          </div>
          <span className="ml-auto rounded-full border border-border bg-bg-elev px-3 py-1 text-xs text-ink-dim">
            {t("পরিধি", "Scope")}: {t(user.scope_bn, user.scope_en)}
          </span>
        </div>

        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

/** Section heading used inside dashboards. */
export function PageHead({ bn, en, sub_bn, sub_en, action }: { bn: string; en: string; sub_bn?: string; sub_en?: string; action?: React.ReactNode }) {
  const t = useT();
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[clamp(1.3rem,3vw,1.9rem)]">{t(bn, en)}</h1>
        {sub_bn && <p className="mt-1 text-sm text-ink-dim">{t(sub_bn, sub_en ?? "")}</p>}
      </div>
      {action}
    </div>
  );
}

export { ChevronLeft };
