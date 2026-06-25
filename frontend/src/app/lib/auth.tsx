import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Role = "donor" | "moderator" | "admin";

export interface User {
  id: string;
  name_bn: string;
  name_en: string;
  role: Role;
  org_bn: string;
  org_en: string;
  scope_bn: string;
  scope_en: string;
  phone: string;
}

// Mock personas — no backend; one per stakeholder role for the demo.
export const PERSONAS: Record<Role, User> = {
  donor: {
    id: "U-donor-1",
    name_bn: "রওশন আরা",
    name_en: "Roushan Ara",
    role: "donor",
    org_bn: "নাগরিক দাতা",
    org_en: "Citizen donor",
    scope_bn: "ঢাকা",
    scope_en: "Dhaka",
    phone: "+8801XXXXXX12",
  },
  moderator: {
    id: "U-mod-1",
    name_bn: "আবুল কালাম",
    name_en: "Abul Kalam",
    role: "moderator",
    org_bn: "উপজেলা মডারেটর",
    org_en: "Upazila moderator",
    scope_bn: "ভোলা জেলা",
    scope_en: "Bhola district",
    phone: "+8801XXXXXX34",
  },
  admin: {
    id: "U-adm-1",
    name_bn: "ড. নুসরাত জাহান",
    name_en: "Dr. Nusrat Jahan",
    role: "admin",
    org_bn: "a2i · দুর্যোগ ব্যবস্থাপনা",
    org_en: "a2i · Disaster Management",
    scope_bn: "জাতীয়",
    scope_en: "National",
    phone: "+8801XXXXXX56",
  },
};

interface AuthState {
  user: User | null;
  login: (role: Role) => void;
  logout: () => void;
}

const Ctx = createContext<AuthState | null>(null);
const KEY = "shohay.auth.role";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    const r = window.localStorage.getItem(KEY) as Role | null;
    if (r && PERSONAS[r]) return PERSONAS[r];
    // Preview/demo: on the public Vercel deployment (no backend), start signed in
    // as admin so visitors land on a dashboard. Login page still lets them switch
    // roles (donor/moderator/admin) — all password-free. Only affects *.vercel.app.
    if (/\.vercel\.app$/i.test(window.location.hostname)) return PERSONAS.admin;
    return null;
  });

  useEffect(() => {
    if (user) window.localStorage.setItem(KEY, user.role);
    else window.localStorage.removeItem(KEY);
  }, [user]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      login: (role) => setUser(PERSONAS[role]),
      logout: () => setUser(null),
    }),
    [user],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export const HOME_FOR: Record<Role, string> = {
  donor: "/account",
  moderator: "/moderator",
  admin: "/admin",
};

export const ROLE_LABEL: Record<Role, { bn: string; en: string }> = {
  donor: { bn: "দাতা", en: "Donor" },
  moderator: { bn: "মডারেটর", en: "Moderator" },
  admin: { bn: "প্রশাসক", en: "Admin" },
};
