// Nav builders live apart from the (heavy) console screens so App can pass them
// synchronously while the screen modules lazy-load. They take live AppData so
// badge counts stay reactive.
import {
  LayoutDashboard, Receipt, HeartHandshake, MapPinned, Settings, Download,
  ClipboardCheck, Camera, ShieldAlert, Megaphone, Sparkles, Users2,
} from "lucide-react";
import { type NavItem } from "../../components/shohay/DashboardLayout";
import { type AppData } from "../../lib/data";

export const donorNav = (_d: AppData): NavItem[] => [
  { to: "/account", icon: LayoutDashboard, bn: "সারসংক্ষেপ", en: "Overview", end: true },
  { to: "/account/donations", icon: Receipt, bn: "আমার দান", en: "My donations" },
  { to: "/account/impact", icon: HeartHandshake, bn: "আমার প্রভাব", en: "My impact" },
  { to: "/account/adopted", icon: MapPinned, bn: "দত্তক উপজেলা", en: "Adopted upazilas" },
  { to: "/account/receipts", icon: Download, bn: "রসিদ ও যাকাত", en: "Receipts & zakat" },
  { to: "/account/settings", icon: Settings, bn: "সেটিংস", en: "Settings" },
];

export const moderatorNav = (d: AppData): NavItem[] => [
  { to: "/moderator", icon: LayoutDashboard, bn: "সারসংক্ষেপ", en: "Overview", end: true },
  { to: "/moderator/needs", icon: ClipboardCheck, bn: "চাহিদা যাচাই", en: "Verify needs", badge: d.needs.filter((n) => !n.verified).length },
  { to: "/moderator/distributions", icon: Camera, bn: "বিতরণ পর্যালোচনা", en: "Review distributions", badge: d.fieldLogs.filter((f) => f.status === "pending").length },
  { to: "/moderator/anomalies", icon: ShieldAlert, bn: "অসঙ্গতি", en: "Anomalies", badge: d.anomalies.length },
];

export const adminNav = (d: AppData): NavItem[] => [
  { to: "/admin", icon: LayoutDashboard, bn: "সারসংক্ষেপ", en: "Overview", end: true },
  { to: "/admin/campaigns", icon: Megaphone, bn: "অভিযান", en: "Campaigns" },
  { to: "/admin/allocations", icon: Sparkles, bn: "বরাদ্দ অনুমোদন", en: "Allocations", badge: d.proposedAllocations.length },
  { to: "/admin/needs", icon: ClipboardCheck, bn: "চাহিদা যাচাই", en: "Verify needs" },
  { to: "/admin/anomalies", icon: ShieldAlert, bn: "অসঙ্গতি ও জালিয়াতি", en: "Anomalies & fraud", badge: d.anomalies.length },
  { to: "/admin/users", icon: Users2, bn: "ব্যবহারকারী ও ভূমিকা", en: "Users & roles" },
];
