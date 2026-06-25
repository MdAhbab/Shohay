# Shohay (সহায়) — Agentic Layer (Gemma)

Shohay ships **four Gemma-powered agents** (plus a fraud/dedupe helper). Because this is a
**government platform handling money, aid, and citizen data**, the agents operate under
**strict human-in-the-loop control**: they **draft, propose, reconcile, and explain — they
never disburse funds, never mark aid "distributed," and never publish without a verified
human sign-off.** Every output is grounded in the ledger/database (no fabricated figures) and
every run is auditable.

**Runtime:** system prompt + tool registry + I/O schema per agent; FastAPI workers in dev.
All runs logged to `AgentRun(id, agent, input, tool_calls, output, confidence, ts)` and, for
actions that touch the ledger, linked to the human approver.

**Language:** all citizen-facing output is **Bengali-first with English**; agents must produce
both and must be accurate over fluent (no hallucinated specifics).

---

## Shared tool registry

| Tool | Signature | Notes |
|------|-----------|-------|
| `db.units` | `(level?, parent?) -> AdminUnit[]` | Official Division→Ward geography. |
| `db.needs` | `(campaign?, geocode?, status?) -> Need[]` | Registered needs. |
| `db.donations` | `(campaign?, status?, geocode?) -> Donation[]` | Available/received donations. |
| `db.distributions` | `(geocode?, campaign?) -> Distribution[]` | Verified field logs. |
| `geo.distance` | `(geocode_a, geocode_b) -> km` | Proximity for matching. |
| `feeds.ingest` | `(sources[]) -> reports[]` | Weather, news, field SMS reports (read-only). |
| `vision.verify_proof` | `(photo, expected) -> {plausible, flags}` | Sanity-check distribution photos. |
| `ledger.read` | `(ref) -> chain` | Read the hash-linked proof chain. |
| `report.render` | `(data, lang) -> bn/en text + tables` | Plain-language public reporting. |
| `dedupe.match` | `(beneficiary) -> {possible_duplicates, score}` | NID/phone-hash matching. |

Write tools are intentionally **absent** from agents — agents return **proposals** that admins
enact through normal, audited endpoints.

---

## Agent 1 — Needs-Assessment Agent
**Job:** turn messy signals (field SMS reports, weather alerts, news) into a **structured,
per-upazila draft need registry** with severity scores, for admin verification.

- **Trigger:** on new disaster signals or admin request, per campaign.
- **Tools:** `feeds.ingest`, `db.units`, `db.needs`, `db.distributions`.
- **Output:** `{ drafted_needs[]{geocode, kind, est_quantity, severity(1-5), evidence[],
  confidence} }` — **draft only**, each with its source evidence.
- **Guardrails:** never marks a need official — an upazila/zila admin must verify; severity is
  explainable and cites evidence; uncertain areas flagged "needs ground-truthing," not guessed.
- **UI surface:** the need registry as reviewable suggestions an admin accepts/edits/rejects.

## Agent 2 — Allocation-Optimizer Agent
**Job:** propose **distribution plans** that match received donations to **unmet, highest-
severity** needs by type, proximity, and urgency — reducing both shortage and over-supply.

- **Trigger:** admin opens allocation for a campaign; re-run as donations/needs change.
- **Tools:** `db.donations`, `db.needs`, `db.units`, `geo.distance`, `db.distributions`.
- **Output:** `{ proposed_allocations[]{donation_id, need_id, geocode, quantity, rationale},
  coverage_delta, leftover, unmet_after }` — a plan, not an action.
- **Guardrails:** respects donor **earmarks** (target_geocode) and item-type constraints;
  never allocates more than received; flags conflicts; **admin approves** before anything is
  allocated. Fairness check: surfaces if any upazila would remain at 0% so it isn't quietly
  skipped.
- **UI surface:** proposed plan overlaid on the map + table in the admin console, accept/modify.

## Agent 3 — Transparency / Audit Agent
**Job:** continuously **reconcile pledged vs received vs allocated vs distributed**, flag
leakage/anomalies, and generate **plain-language public reports** in Bangla + English.

- **Trigger:** scheduled per campaign + on demand for the public ledger page.
- **Tools:** `db.donations`, `db.distributions`, `ledger.read`, `vision.verify_proof`,
  `report.render`, `dedupe.match`.
- **Output:** `{ reconciliation{by_unit, gaps, mismatches}, anomalies[]{type, ref, severity,
  explanation}, public_report_bn, public_report_en }`.
- **Guardrails:** read-only; numbers come **only** from the ledger (no estimates presented as
  fact); anomalies are *flags for human review*, not accusations; reports avoid PII and use
  aggregates. Photo verification is advisory (plausibility), never sole grounds for action.
- **UI surface:** the open-ledger/audit page summary + admin anomaly queue.

## Agent 4 — Bilingual Citizen-Support Agent
**Job:** answer citizens' questions, **grounded in the ledger**, in Bangla or English: where to
donate, what's most needed near me, how to give goods, and **the status of my donation**.

- **Trigger:** the assistant widget (web) and the SMS/USSD/voice access layer.
- **Tools:** `db.needs`, `db.donations`, `ledger.read`, `db.units`, `geo.distance`.
- **Output:** a grounded bilingual answer + deep links / SMS-friendly summaries; for a donation
  ID, the live proof-chain status.
- **Guardrails:** answers **only** from tool results — if it doesn't know, it says so and routes
  to a human/helpline; never invents donation status, amounts, or needs; no collection of
  unnecessary PII; clear that it's an assistant, not an official ruling.
- **UI surface:** web chat widget + the USSD/SMS/voice flows (short, numbered, confirmable).

## Helper — Fraud & Duplicate-Beneficiary Detection
- **Job:** flag likely duplicate beneficiaries and suspicious distribution patterns.
- **Tools:** `dedupe.match`, `db.distributions`, `vision.verify_proof`.
- **Output:** ranked flags with evidence for **human caseworker review** — never auto-denies aid
  to anyone (false positives must not block a real person in need).

---

## Cross-cutting guardrails (government-grade)
- **No autonomous money or aid movement.** Agents propose; verified humans (role-scoped) enact.
- **Grounded only:** every figure traces to the ledger/DB; no fabricated specifics; "unknown" is
  an allowed, expected answer.
- **Privacy by design:** beneficiary PII is hashed/minimized; public outputs are aggregate;
  agents never expose individual records.
- **Fairness & do-no-harm:** fraud/dedupe flags are advisory and reviewed by people; the system
  errs toward *not* blocking a genuine beneficiary.
- **Bilingual accuracy:** Bangla + English outputs must match in meaning; accuracy over fluency.
- **Full auditability:** every run, tool call, and the human approver are logged; the public can
  audit outcomes via the open ledger.
