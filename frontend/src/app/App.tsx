import { BrowserRouter, Routes, Route, useLocation } from "react-router";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { ShohayProvider, AppDataProvider } from "./lib/store";
import { AuthProvider, RequireRole } from "./lib/auth";
import { ErrorBoundary } from "./components/shohay/ErrorBoundary";
import { Header } from "./components/shohay/Header";
import { Footer } from "./components/shohay/Footer";
import { DashboardLayout } from "./components/shohay/DashboardLayout";
import { Home } from "./pages/Home";
import { Donate } from "./pages/Donate";
import { Track } from "./pages/Track";
import { Dashboard } from "./pages/Dashboard";
import { Ledger } from "./pages/Ledger";
import { Needs } from "./pages/Needs";
import { Field } from "./pages/Field";
import { Adopt } from "./pages/Adopt";
import { Access } from "./pages/Access";
import { Login } from "./pages/Login";
import { NotFound } from "./pages/NotFound";
import {
  donorNav, DonorOverview, DonorDonations, DonorImpact, DonorAdopted, DonorReceipts, DonorSettings,
} from "./pages/dashboards/Donor";
import {
  moderatorNav, ModeratorOverview, ModeratorNeeds, ModeratorDistributions, ModeratorAnomalies,
} from "./pages/dashboards/Moderator";
import {
  adminNav, AdminOverview, AdminCampaigns, AdminAllocations, AdminNeeds, AdminAnomalies, AdminUsers,
} from "./pages/dashboards/Admin";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

/** Public site chrome (header + footer). Dashboards render their own shell. */
function SiteLayout({ children }: { children: React.ReactNode }) {
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
            <Toaster position="top-center" richColors />
          </BrowserRouter>
        </AuthProvider>
      </ShohayProvider>
    </AppDataProvider>
    </ErrorBoundary>
  );
}
