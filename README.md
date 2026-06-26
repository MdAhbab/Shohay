# Shohay (সহায়) — National Relief & Donation Transparency Platform

> **Built for the Government of Bangladesh, free of charge, as a public good.**
> *"Every taka, every shirt, every sack of rice — see exactly where it went."*
> Citizens and businesses donate **money, food, clothes, and other relief**; the platform
> tracks each donation from **pledge → received → allocated → distributed**, and shows the
> public **what reached which division → district (zila) → upazila → union/ward**, on a live
> map.

**Type:** standalone national civic platform.
**Stack:** FastAPI · SQLite (→ Postgres + PostGIS) · React + Vite · Tailwind · MapLibre GL ·
Motion. **Bengali-first**, low-bandwidth (two-tier rich/lite rendering), SMS/USSD fallback,
accessibility-grade.

---

## 1. Why this exists (the gap)

When disaster strikes Bangladesh — the **2024 floods**, cyclones, riverbank erosion — relief
mobilizes fast but **opaquely**. Money flows through dozens of NGOs, the **Bangladesh Red
Crescent (BDRCS)**, and ad-hoc campaigns; goods pile up unevenly; donors never learn where
their contribution landed; and some upazilas are over-served while others are missed. The
government has strong digital rails — **a2i (Aspire to Innovate)** at the Prime Minister's
Office, the National Data Repository, digital service delivery — but **no single,
government-run platform that ties donations to verified distribution, mapped to every
administrative unit, in public view.**

**Shohay fills exactly that gap.** It is not another donate button. It is a **transparency
ledger + logistics matcher + public dashboard** that makes relief **accountable by design**.

### What makes it trustworthy (and different)
1. **End-to-end ledger:** every donation is an auditable chain — pledged, received,
   allocated to an area/need, distributed with geo-stamped proof. Public, append-only.
2. **Administrative-geography native:** everything is keyed to the official hierarchy
   (Division → Zila → Upazila → Union/Ward), so coverage and gaps are visible at any zoom.
3. **Need ↔ donation matching:** affected areas register needs; donations are matched to the
   nearest unmet, highest-severity need — reducing both shortage and waste.
4. **Reaches everyone:** Bengali-first UI, **SMS/USSD + voice** for low-connectivity rural
   users and field volunteers, works on cheap Android phones and 2G.

### Benchmark

| | NGO/BDRCS donate pages | ReliefWeb / cluster reports | **Shohay** |
|---|---|---|---|
| Take donations (money + goods) | ✅ (money mostly) | ❌ | ✅ money **+ goods + clothes + relief** |
| Tie a donation to **where it was distributed** | rarely | aggregate only | ✅ **per donation, per ward** |
| Public, per-upazila coverage map | ❌ | partial | ✅ **live** |
| Need registry + matching | ❌ | manual | ✅ **agent-assisted** |
| Government-run, single source of truth | ❌ | ❌ | ✅ |
| Low-bandwidth / SMS / Bengali-first | partial | ❌ | ✅ |

---

## 2. Stakeholders & roles

- **Donor** (citizen, diaspora, business): pledges money/goods, schedules drop-off/pickup,
  tracks their donation's journey, gets verified proof.
- **Affected resident / community leader:** reports needs; confirms receipt (optionally).
- **Field volunteer / distributor:** logs distributions with geo-stamped photos + beneficiary
  counts; works offline-first, syncs when online.
- **Upazila / Zila administrator (govt):** verifies needs, approves allocations, oversees
  distribution, signs off.
- **National admin (a2i / Disaster Management):** campaigns, oversight, national dashboard,
  fraud review.
- **Public / press:** read-only transparency dashboard + open data export.

---

## 3. Feature set

### 3.1 Core
- **Donation intake**
  - *Money* via mobile financial services (**bKash, Nagad, Rocket**) + cards/bank (mocked in
    dev). Receipts; optional zakat/sadaqah tagging.
  - *Goods* (clothes, food, medicine, water, shelter, other): donor pledges quantity + type,
    chooses **drop-off point** or **pickup scheduling**; intake staff confirm receipt.
- **Need registry:** affected areas/events register needs by type + quantity + severity, scoped
  to an upazila/union/ward.
- **Allocation:** admins (agent-assisted) allocate received donations to needs.
- **Distribution logging:** volunteers record what was handed out, to how many beneficiaries,
  with **GPS + timestamp + photo proof** (offline-capable).
- **Transparency ledger:** the public chain pledge→received→allocated→distributed, per item.
- **Public map & dashboard:** Bangladesh map; drill Division→Zila→Upazila→Union/Ward; per-unit
  **need vs received vs distributed**, fulfillment %, and the donations/distributions behind it.
- **Campaigns:** per-disaster/event campaigns with goals and live progress.

### 3.2 ✨ New / signature features

1. **Live national relief heat-map** — a 3D/2D map of Bangladesh where each upazila is shaded
   by **unmet-need intensity** and **fulfillment**; animated **aid-flow lines** stream from
   donation sources to areas as distributions are confirmed. The map is both the public
   centerpiece and an admin tool.

2. **Immutable transparency ledger ("proof chain")** — every state change (pledge, receipt,
   allocation, distribution) is an **append-only, hash-linked** record with attached proof
   (receipt, photo, signer). Publicly verifiable; tamper-evident. Anyone can audit a donation
   by its ID; open-data CSV/JSON export for press and researchers.

3. **Goods logistics matcher ("Adopt an Upazila")** — matches available/surplus donations to
   the nearest **unmet, highest-severity** need (type + proximity + urgency), reducing
   over-supply in some areas and shortage in others. Donors/businesses can **"adopt" a specific
   upazila** and receive QR-verified distribution proof for what they funded.

4. **Reach-everyone access layer** — **Bengali-first** UI with English toggle; **SMS/USSD**
   flows to donate, report a need, or check status without internet; **voice prompts** in
   Bangla for low-literacy users; PWA that works on 2G and offline for field volunteers
   (queue + sync). Fraud/duplicate-beneficiary detection guards integrity.

### 3.3 Integrity & accessibility (non-negotiable for a govt platform)
- **Fraud & duplicate detection** (NID-hash or phone-based dedupe of beneficiaries; anomaly
  flags on distribution patterns).
- **Verification roles & sign-off** at upazila/zila level; nothing marked "distributed" without
  a verified field log.
- **WCAG AA**, Bengali screen-reader support, high-contrast, large-text, low-literacy icons.
- **Data protection:** beneficiary PII minimized/hashed; only aggregates shown publicly.

---

## 4. Administrative geography model

Bangladesh's official hierarchy is first-class:

```
Division (8) → District/Zila (64) → Upazila (~495) → Union/Pourashava Ward
```

Each unit has a stable `geocode` (BBS codes), boundary polygon (GeoJSON), and rolls up needs,
donations, and distributions for the map and dashboards.

## 5. Data model (SQLite dev → Postgres/PostGIS prod)

```
AdminUnit(geocode, level(enum: division|zila|upazila|union_ward), name_bn, name_en,
          parent_geocode, boundary_geojson, centroid)
Campaign(id, title_bn, title_en, disaster_type, start, end, goal_json, status)
Donor(id, name, phone, type(enum: citizen|business|diaspora), nid_hash?, created_at)
Donation(id, donor_id, campaign_id, kind(enum: money|food|clothes|medicine|water|shelter|other),
         amount?, currency?, items_json?, channel(enum: bkash|nagad|rocket|card|dropoff|pickup),
         pledged_at, received_at?, status(enum: pledged|received|allocated|distributed|cancelled),
         target_geocode?)                                  # donor may earmark an area
Need(id, campaign_id, geocode, kind, quantity, severity(1-5), reported_by, verified_by?,
     status(enum: open|partially_met|met), created_at)
Allocation(id, donation_id, need_id, geocode, quantity, approved_by, created_at)
Distribution(id, allocation_id, geocode, beneficiaries, items_json, gps, photo_url,
             logged_by, verified_by?, distributed_at)
Beneficiary(id, distribution_id, nid_hash?, phone_hash?, household_size)   # dedupe, PII-min
LedgerEntry(id, prev_hash, entry_hash, ref_type, ref_id, action, payload_json, actor, ts)
User(id, role(enum: donor|volunteer|upazila_admin|zila_admin|national_admin), geocode_scope)
```

The **LedgerEntry** chain is the public proof-of-integrity backbone (hash-linked, append-only).

## 6. API surface (selected)

```
# Public / transparency
GET  /api/geo/units?level=&parent=                  -> admin units + boundaries
GET  /api/map/coverage?campaign=                     -> per-unit need/received/distributed %
GET  /api/ledger/{donation_id}                       -> full proof chain
GET  /api/open-data/distributions.csv                -> open export
# Donor
POST /api/donations          { kind, amount|items, channel, target_geocode? }
GET  /api/donations/{id}/track                        -> pledge→received→allocated→distributed
# Field & admin
POST /api/needs              { geocode, kind, quantity, severity }
POST /api/allocations        { donation_id, need_id, quantity }   (admin)
POST /api/distributions      { allocation_id, beneficiaries, items, gps, photo }  (offline-sync)
POST /api/verify/{entity}/{id}                        (admin sign-off)
# Access layer
POST /api/sms/inbound        (USSD/SMS gateway webhook)
# Agentic
POST /api/agents/needs-assess        { reports|weather|news } -> drafted needs per upazila
POST /api/agents/allocate            { campaign } -> proposed allocation plan
POST /api/agents/audit               { campaign } -> reconciliation + anomaly report
POST /api/agents/assistant           { question_bn|en } -> grounded answer + status
```

OpenAPI docs at `/docs`; all endpoints return Bengali + English labels where user-facing.

## 7. Agentic layer (Gemma) — summary

Full spec in [`AGENTS.md`](AGENTS.md). Four+ agents:

1. **Needs-Assessment Agent** — ingests field reports / weather / news, drafts per-upazila need
   registries with severity scores (admin verifies).
2. **Allocation-Optimizer Agent** — proposes distribution plans matching donations to unmet,
   high-severity needs by type + proximity + urgency.
3. **Transparency / Audit Agent** — reconciles pledged vs received vs distributed, flags
   leakage/anomalies, generates plain-language public reports (Bn/En).
4. **Bilingual Citizen-Support Agent** — Bangla/English Q&A grounded in the ledger: where to
   give, what's needed near you, and the status of your donation. (Plus a fraud/duplicate
   detection helper.)

## 8. Milestones
- **M0** Specs & design (this repo) + stakeholder/govt review.
- **M1** Admin geography (units + boundaries) + auth/roles.
- **M2** Donation intake (money mock + goods) + need registry.
- **M3** Allocation + **offline-capable distribution logging** + verification sign-off.
- **M4** **Transparency ledger** (hash chain) + public **coverage map & dashboard** + open data.
- **M5** Gemma agents (needs, allocation, audit, assistant) + fraud/dedupe.
- **M6** **Access layer**: Bengali polish, SMS/USSD, voice, PWA offline, "Adopt an Upazila."
- **M7** Security & privacy review, load test, pilot in 1–2 districts, national rollout.

## 9. Run
```bash
# One command (creates the venv, installs deps, starts both servers):
python run.py

# …or run the two tiers manually:
cd backend && python -m venv venv && venv/Scripts/pip install fastapi uvicorn sqlalchemy pydantic
venv/Scripts/python -m uvicorn app.main:app --reload     # http://localhost:8000/docs
cd frontend && npm install && npm run dev                # http://localhost:5173
```
The API creates its SQLite tables and seeds demo data on first boot, so there is no
separate migration/seed step. `npm run typecheck` runs the TypeScript checker; `npm run
build` produces the production bundle.

See [`DESIGN-INSTRUCTIONS.md`](DESIGN-INSTRUCTIONS.md) and [`AGENTS.md`](AGENTS.md).

---

### Sources (context & benchmark)
- a2i (Aspire to Innovate), Prime Minister's Office — digital service rails: https://a2i.gov.bd/ and https://www.undp.org/bangladesh/projects/aspire-innovate-a2i
- Bangladesh Red Crescent Society — online donations: https://donate.bdrcs.org/donate-online/
- Bangladesh Floods 2024 response (ReliefWeb): https://reliefweb.int/disaster/fl-2024-000088-bgd
