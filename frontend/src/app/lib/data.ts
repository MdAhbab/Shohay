// Data structs and mutable stores for Shohay.
// Initially empty; populated by AppDataProvider on load.

export interface Unit {
  geocode: string;
  name_bn: string;
  name_en: string;
  level: "division" | "zila" | "upazila";
  x: number;
  y: number;
  need: number;
  fulfillment: number;
  received: number;
  beneficiaries: number;
}

export let divisions: Unit[] = [];
export let upazilasByDivision: Record<string, Unit[]> = {};

export interface Campaign {
  id: string;
  title_bn: string;
  title_en: string;
  type_bn: string;
  type_en: string;
  goal: number;
  raised: number;
  upazilas_total: number;
  upazilas_reached: number;
  status: "active" | "monitoring";
  image: string;
}

export let campaigns: Campaign[] = [];

export let nationalTotals = {
  crore: 0,
  items: 0,
  upazilasReached: 0,
  upazilasTotal: 0,
  beneficiaries: 0,
  donors: 0,
};

export interface ProofStep {
  key: "pledged" | "received" | "allocated" | "distributed";
  label_bn: string;
  label_en: string;
  detail_bn: string;
  detail_en: string;
  ts: string;
  hash: string;
  done: boolean;
}

export function makeProofChain(id: string): ProofStep[] {
  return [
    {
      key: "pledged", label_bn: "প্রতিশ্রুত", label_en: "Pledged",
      detail_bn: "৳ ৫,০০০ • বিকাশ", detail_en: "৳ 5,000 • bKash",
      ts: "২৫ জুন, ১০:১২", hash: "a91f…", done: true,
    },
    {
      key: "received", label_bn: "গৃহীত", label_en: "Received",
      detail_bn: "তহবিলে জমা • রসিদ #BK-7741", detail_en: "Settled to fund • Receipt #BK-7741",
      ts: "২৫ জুন, ১০:১৩", hash: "c4d2…", done: true,
    },
    {
      key: "allocated", label_bn: "বরাদ্দকৃত", label_en: "Allocated",
      detail_bn: "ভোলা সদর • খাদ্য প্যাকেজ ×২০", detail_en: "Bhola Sadar • Food packs ×20",
      ts: "২৬ জুন, ০৯:৪০", hash: "7be0…", done: true,
    },
    {
      key: "distributed", label_bn: "বিতরণকৃত", label_en: "Distributed",
      detail_bn: "১৮টি পরিবার • জিও-স্ট্যাম্পড ছবি যাচাইকৃত", detail_en: "18 households • Geo-stamped photo verified",
      ts: "২৭ জুন, ১৬:২৫", hash: "f23a…", done: id.length % 2 === 0,
    },
  ];
}

export interface Need {
  id: string;
  geocode: string;
  area_bn: string;
  area_en: string;
  kind: "food" | "water" | "medicine" | "shelter" | "clothes" | string;
  quantity: number;
  severity: 1 | 2 | 3 | 4 | 5 | number;
  status: "open" | "partially_met" | "met" | string;
  verified: boolean;
}

export let needs: Need[] = [];

export interface LedgerRow {
  id: string;
  action: "pledge" | "receive" | "allocate" | "distribute" | string;
  ref: string;
  amount: string;
  area_bn: string;
  area_en: string;
  ts: string;
  hash: string;
  prev: string;
}

export let ledgerRows: LedgerRow[] = [];

export interface Allocation {
  id: string;
  donation_bn: string;
  donation_en: string;
  need_bn: string;
  need_en: string;
  area_bn: string;
  area_en: string;
  qty: number;
  distance: number;
  rationale_bn: string;
  rationale_en: string;
  confidence: number;
}

export let proposedAllocations: Allocation[] = [];

export interface Anomaly {
  id: string;
  type_bn: string;
  type_en: string;
  ref: string;
  severity: "low" | "med" | "high" | string;
  explanation_bn: string;
  explanation_en: string;
}

export let anomalies: Anomaly[] = [];

export interface MyDonation {
  id: string;
  date: string;
  kind: "money" | "food" | "water" | "medicine" | "clothes" | string;
  summary_bn: string;
  summary_en: string;
  area_bn: string;
  area_en: string;
  campaign_bn: string;
  campaign_en: string;
  status: "pledged" | "received" | "allocated" | "distributed" | string;
  zakat: boolean;
}

export let myDonations: MyDonation[] = [];

export let myImpact = {
  totalTaka: 0,
  donations: 0,
  families: 0,
  meals: 0,
  upazilas: 0,
  zakatTaka: 0,
};

export interface FieldLog {
  id: string;
  area_bn: string;
  area_en: string;
  volunteer_bn: string;
  volunteer_en: string;
  households: number;
  items_bn: string;
  items_en: string;
  ts: string;
  photo: string;
  geo: boolean;
  status: "pending" | "verified" | "flagged" | string;
}

export let fieldLogs: FieldLog[] = [];

export interface ManagedUser {
  id: string;
  name_bn: string;
  name_en: string;
  role: "donor" | "volunteer" | "moderator" | "admin" | string;
  scope_bn: string;
  scope_en: string;
  status: "active" | "pending" | "suspended" | string;
}

export let managedUsers: ManagedUser[] = [];

export interface ManagedCampaign extends Campaign {
  needsOpen: number;
  distributions: number;
}

export let managedCampaigns: ManagedCampaign[] = [];

export function updateData(payload: any) {
  divisions = payload.divisions || [];
  upazilasByDivision = payload.upazilasByDivision || {};
  campaigns = payload.campaigns || [];
  if (payload.nationalTotals) nationalTotals = payload.nationalTotals;
  needs = payload.needs || [];
  ledgerRows = payload.ledgerRows || [];
  proposedAllocations = payload.proposedAllocations || [];
  anomalies = payload.anomalies || [];
  myDonations = payload.myDonations || [];
  if (payload.myImpact) myImpact = payload.myImpact;
  fieldLogs = payload.fieldLogs || [];
  managedUsers = payload.managedUsers || [];
  managedCampaigns = payload.managedCampaigns || [];
}
