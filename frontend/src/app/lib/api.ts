// Single source for backend calls. Base URL is overridable at build time
// (VITE_API_BASE) so the same bundle can point at a deployed API.
const API_BASE =
  (import.meta as any).env?.VITE_API_BASE?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`API ${res.status} on ${path}${detail ? `: ${detail}` : ""}`);
  }
  return res.json() as Promise<T>;
}

export function fetchInitialData() {
  return request<any>("/data");
}

export interface DonationPayload {
  kind: string;
  amount?: number;
  qty?: number;
  item?: string;
  channel?: string;
  target_geocode?: string;
  zakat?: boolean;
}

export interface DonationResult {
  id: string;
  status: string;
  ts: string;
  hash: string;
  tracking_url: string;
}

export function postDonation(payload: DonationPayload) {
  return request<DonationResult>("/donations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface NeedPayload {
  geocode: string;
  kind: string;
  quantity: number;
  severity: number;
}

export function postNeed(payload: NeedPayload) {
  return request<{ status: string; id: string; verified: boolean }>("/needs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function trackDonation(id: string) {
  return request<{ id: string; status: string; chain: any[] }>(
    `/donations/${id}/track`,
  );
}
