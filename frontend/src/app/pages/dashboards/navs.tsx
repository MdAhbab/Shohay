// Nav definitions live apart from the (heavy) console screens so App can import
// them synchronously while the screen modules themselves are lazy-loaded.
import {
  LayoutDashboard, Receipt, HeartHandshake, MapPinned, Settings, Download,
  ClipboardCheck, Camera, ShieldAlert, Megaphone, Sparkles, Users2,
} from "lucide-react";
import { type NavItem } from "../../components/shohay/DashboardLayout";
import { needs, fieldLogs, anomalies, proposedAllocations } from "../../lib/data";

export const donorNav: NavItem[] = [
  { to: "/account", icon: LayoutDashboard, bn: "সারসংক্ষেপ", en: "Overview", end: true },
  { to: "/account/donations", icon: Receipt, bn: "আমার দান", en: "My donations" },
  { to: "/account/impact", icon: HeartHandshake, bn: "আমার প্রভাব", en: "My impact" },
  { to: "/account/adopted", icon: MapPinned, bn: "দত্তক উপজেলা", en: "Adopted upazilas" },
  { to: "/account/receipts", icon: Download, bn: "রসিদ ও যাকাত", en: "Receipts & zakat" },
  { to: "/account/settings", icon: Settings, bn: "সেটিংস", en: "Settings" },
];

export const moderatorNav: NavItem[] = [
  { to: "/moderator", icon: LayoutDashboard, bn: "সারসংক্ষেপ", en: "Overview", end: true },
  { to: "/moderator/needs", icon: ClipboardCheck, bn: "চাহিদা যাচাই", en: "Verify needs", badge: needs.filter((n) => !n.verified).length },
  { to: "/moderator/distributions", icon: Camera, bn: "বিতরণ পর্যালোচনা", en: "Review distributions", badge: fieldLogs.filter((f) => f.status === "pending").length },
  { to: "/moderator/anomalies", icon: ShieldAlert, bn: "অসঙ্গতি", en: "Anomalies", badge: anomalies.length },
];

export const adminNav: NavItem[] = [
  { to: "/admin", icon: LayoutDashboard, bn: "সারসংক্ষেপ", en: "Overview", end: true },
  { to: "/admin/campaigns", icon: Megaphone, bn: "অভিযান", en: "Campaigns" },
  { to: "/admin/allocations", icon: Sparkles, bn: "বরাদ্দ অনুমোদন", en: "Allocations", badge: proposedAllocations.length },
  { to: "/admin/needs", icon: ClipboardCheck, bn: "চাহিদা যাচাই", en: "Verify needs" },
  { to: "/admin/anomalies", icon: ShieldAlert, bn: "অসঙ্গতি ও জালিয়াতি", en: "Anomalies & fraud", badge: anomalies.length },
  { to: "/admin/users", icon: Users2, bn: "ব্যবহারকারী ও ভূমিকা", en: "Users & roles" },
];
