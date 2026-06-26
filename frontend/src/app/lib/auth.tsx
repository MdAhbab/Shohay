import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Navigate } from "react-router";
import { requestOtp as apiRequestOtp, verifyOtp as apiVerifyOtp, fetchMe, type AuthUser } from "./api";

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

// Demo personas + their seeded phone numbers. Used to prefill the login form
// and as an offline fallback when no backend is reachable (static demo).
export const PERSONAS: Record<Role, User> = {
  donor: {
    id: "U-donor-1", name_bn: "রওশন আরা", name_en: "Roushan Ara", role: "donor",
    org_bn: "নাগরিক দাতা", org_en: "Citizen donor", scope_bn: "ঢাকা", scope_en: "Dhaka", phone: "01700000001",
  },
  moderator: {
    id: "U-mod-1", name_bn: "আবুল কালাম", name_en: "Abul Kalam", role: "moderator",
    org_bn: "উপজেলা মডারেটর", org_en: "Upazila moderator", scope_bn: "ভোলা জেলা", scope_en: "Bhola district", phone: "01700000002",
  },
  admin: {
    id: "U-adm-1", name_bn: "ড. নুসরাত জাহান", name_en: "Dr. Nusrat Jahan", role: "admin",
    org_bn: "a2i · দুর্যোগ ব্যবস্থাপনা", org_en: "a2i · Disaster Management", scope_bn: "জাতীয়", scope_en: "National", phone: "01700000003",
  },
};

export const DEMO_PHONE: Record<Role, string> = {
  donor: PERSONAS.donor.phone,
  moderator: PERSONAS.moderator.phone,
  admin: PERSONAS.admin.phone,
};

function asUser(u: AuthUser): User {
  const role: Role = u.role === "admin" || u.role === "moderator" ? u.role : "donor";
  return { ...u, role };
}

interface AuthState {
  user: User | null;
  /** Ask for an OTP. Returns the dev code if the backend exposes it, else null. */
  requestOtp: (phone: string) => Promise<string | null>;
  /** Verify an OTP; falls back to the demo persona for `role` if offline. */
  verifyOtp: (phone: string, code: string, role: Role) => Promise<User>;
  /** Immediate persona sign-in (quick demo / offline). */
  loginDemo: (role: Role) => void;
  logout: () => void;
}

const Ctx = createContext<AuthState | null>(null);
const TOKEN_KEY = "shohay.auth.token";
const USER_KEY = "shohay.auth.user";

function readStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser);

  const persist = (u: User | null, token?: string) => {
    setUser(u);
    if (typeof window === "undefined") return;
    if (u) window.localStorage.setItem(USER_KEY, JSON.stringify(u));
    else window.localStorage.removeItem(USER_KEY);
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    if (!u) window.localStorage.removeItem(TOKEN_KEY);
  };

  // Revalidate a real (non-demo) token against the backend on load.
  useEffect(() => {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token || token.startsWith("demo-")) return;
    fetchMe(token)
      .then((u) => persist(asUser(u), token))
      .catch(() => persist(null));
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      requestOtp: async (phone) => {
        try {
          const res = await apiRequestOtp(phone);
          return res.dev_otp ?? null;
        } catch {
          return null; // offline — caller proceeds with the demo fallback
        }
      },
      verifyOtp: async (phone, code, role) => {
        try {
          const res = await apiVerifyOtp(phone, code);
          const u = asUser(res.user);
          persist(u, res.token);
          return u;
        } catch {
          // Offline/static demo: sign in as the chosen persona.
          const u = PERSONAS[role];
          persist(u, `demo-${role}`);
          return u;
        }
      },
      loginDemo: (role) => persist(PERSONAS[role], `demo-${role}`),
      logout: () => persist(null),
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

/** Gate a dashboard subtree to a role: redirect to login when unauthenticated,
 *  or to the user's own home when their role doesn't match the area. */
export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={HOME_FOR[user.role]} replace />;
  return <>{children}</>;
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
