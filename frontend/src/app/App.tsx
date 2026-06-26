import { BrowserRouter, Routes, Route, useLocation } from "react-router";
import { useEffect, lazy, Suspense, type ReactNode } from "react";
import { Toaster } from "sonner";
import { ShohayProvider, AppDataProvider } from "./lib/store";
import { AuthProvider, RequireRole } from "./lib/auth";
import { ErrorBoundary } from "./components/shohay/ErrorBoundary";
import { Header } from "./components/shohay/Header";
import { Footer } from "./components/shohay/Footer";
import { DashboardLayout } from "./components/shohay/DashboardLayout";
import { donorNav, moderatorNav, adminNav } from "./pages/dashboards/navs";

// Routes are split into per-page chunks so the initial load stays small; the
// landing page and its lazy MapLibre/charts are fetched only when reached.
const named = <M, K extends keyof M>(loader: () => Promise<M>, key: K) =>
  lazy(() => loader().then((m) => ({ default: m[key] as any })));

const Home = named(() => import("./pages/Home"), "Home");
const Donate = named(() => import("./pages/Donate"), "Donate");
const Track = named(() => import("./pages/Track"), "Track");
const Dashboard = named(() => import("./pages/Dashboard"), "Dashboard");
const Ledger = named(() => import("./pages/Ledger"), "Ledger");
const Needs = named(() => import("./pages/Needs"), "Needs");
const Field = named(() => import("./pages/Field"), "Field");
const Adopt = named(() => import("./pages/Adopt"), "Adopt");
const Access = named(() => import("./pages/Access"), "Access");
const Login = named(() => import("./pages/Login"), "Login");
const NotFound = named(() => import("./pages/NotFound"), "NotFound");

const DonorOverview = named(() => import("./pages/dashboards/Donor"), "DonorOverview");
const DonorDonations = named(() => import("./pages/dashboards/Donor"), "DonorDonations");
const DonorImpact = named(() => import("./pages/dashboards/Donor"), "DonorImpact");
const DonorAdopted = named(() => import("./pages/dashboards/Donor"), "DonorAdopted");
const DonorReceipts = named(() => import("./pages/dashboards/Donor"), "DonorReceipts");
const DonorSettings = named(() => import("./pages/dashboards/Donor"), "DonorSettings");

const ModeratorOverview = named(() => import("./pages/dashboards/Moderator"), "ModeratorOverview");
const ModeratorNeeds = named(() => import("./pages/dashboards/Moderator"), "ModeratorNeeds");
const ModeratorDistributions = named(() => import("./pages/dashboards/Moderator"), "ModeratorDistributions");
const ModeratorAnomalies = named(() => import("./pages/dashboards/Moderator"), "ModeratorAnomalies");

const AdminOverview = named(() => import("./pages/dashboards/Admin"), "AdminOverview");
const AdminCampaigns = named(() => import("./pages/dashboards/Admin"), "AdminCampaigns");
const AdminAllocations = named(() => import("./pages/dashboards/Admin"), "AdminAllocations");
const AdminNeeds = named(() => import("./pages/dashboards/Admin"), "AdminNeeds");
const AdminAnomalies = named(() => import("./pages/dashboards/Admin"), "AdminAnomalies");
const AdminUsers = named(() => import("./pages/dashboards/Admin"), "AdminUsers");

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8 text-sm text-ink-dim">
      <span className="animate-pulse">লোড হচ্ছে · Loading…</span>
    </div>
  );
}

/** Public site chrome (header + footer). Dashboards render their own shell. */
function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppDataProvider>
        <ShohayProvider>
          <AuthProvider>
            <BrowserRouter>
              <ScrollToTop />
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  {/* ---------- Public site ---------- */}
                  <Route path="/" element={<SiteLayout><Home /></SiteLayout>} />
                  <Route path="/donate" element={<SiteLayout><Donate /></SiteLayout>} />
                  <Route path="/track" element={<SiteLayout><Track /></SiteLayout>} />
                  <Route path="/track/:id" element={<SiteLayout><Track /></SiteLayout>} />
                  <Route path="/dashboard" element={<SiteLayout><Dashboard /></SiteLayout>} />
                  <Route path="/ledger" element={<SiteLayout><Ledger /></SiteLayout>} />
                  <Route path="/needs" element={<SiteLayout><Needs /></SiteLayout>} />
                  <Route path="/adopt" element={<SiteLayout><Adopt /></SiteLayout>} />
                  <Route path="/access" element={<SiteLayout><Access /></SiteLayout>} />
                  <Route path="/field" element={<Field />} />
                  <Route path="/login" element={<SiteLayout><Login /></SiteLayout>} />

                  {/* ---------- Donor dashboard ---------- */}
                  <Route element={<RequireRole role="donor"><SiteLayout><DashboardLayout role="donor" title_bn="দাতা কনসোল" title_en="Donor console" nav={donorNav} /></SiteLayout></RequireRole>}>
                    <Route path="/account" element={<DonorOverview />} />
                    <Route path="/account/donations" element={<DonorDonations />} />
                    <Route path="/account/impact" element={<DonorImpact />} />
                    <Route path="/account/adopted" element={<DonorAdopted />} />
                    <Route path="/account/receipts" element={<DonorReceipts />} />
                    <Route path="/account/settings" element={<DonorSettings />} />
                  </Route>

                  {/* ---------- Moderator dashboard ---------- */}
                  <Route element={<RequireRole role="moderator"><SiteLayout><DashboardLayout role="moderator" title_bn="মডারেটর কনসোল" title_en="Moderator console" nav={moderatorNav} /></SiteLayout></RequireRole>}>
                    <Route path="/moderator" element={<ModeratorOverview />} />
                    <Route path="/moderator/needs" element={<ModeratorNeeds />} />
                    <Route path="/moderator/distributions" element={<ModeratorDistributions />} />
                    <Route path="/moderator/anomalies" element={<ModeratorAnomalies />} />
                  </Route>

                  {/* ---------- Admin dashboard ---------- */}
                  <Route element={<RequireRole role="admin"><SiteLayout><DashboardLayout role="admin" title_bn="প্রশাসক কনসোল" title_en="Admin console" nav={adminNav} /></SiteLayout></RequireRole>}>
                    <Route path="/admin" element={<AdminOverview />} />
                    <Route path="/admin/campaigns" element={<AdminCampaigns />} />
                    <Route path="/admin/allocations" element={<AdminAllocations />} />
                    <Route path="/admin/needs" element={<AdminNeeds />} />
                    <Route path="/admin/anomalies" element={<AdminAnomalies />} />
                    <Route path="/admin/users" element={<AdminUsers />} />
                  </Route>

                  <Route path="*" element={<SiteLayout><NotFound /></SiteLayout>} />
                </Routes>
              </Suspense>
              <Toaster position="top-center" richColors />
            </BrowserRouter>
          </AuthProvider>
        </ShohayProvider>
      </AppDataProvider>
    </ErrorBoundary>
  );
}
