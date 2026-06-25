# Shohay (সহায়) — Front-End Design Brief (for Claude, in Claude Design)

**You are designing the complete front end of Shohay from scratch** — a **national relief &
donation transparency platform for the Government of Bangladesh**. Build **every page** here,
for **desktop and mobile**, in **light and dark themes**, **Bengali-first** (English toggle).
Use **React + Vite + Tailwind + Three.js + GSAP/ScrollTrigger + Lenis + MapLibre**.

This is a **government public-good platform**: it must feel **premium and modern** but above
all **dignified, calm, and trustworthy** — never a flashy startup, never cliché "Bangladesh
flag green-and-red everywhere." It must also be **usable on a cheap Android phone over 2G**.
So design **two tiers**: a **rich tier** (the public/marketing/transparency experience on
capable devices, with the full Three.js + scroll motion) and a **lite tier** (a fast, almost
motion-free, data-first experience for low-end devices and field users). Both share the same
design tokens and information design.

Read fully, then build in the **step order** at the end.

---

## 0. North Star — "the delta carries aid to every corner"

Bangladesh is a **river delta**. Shohay's signature metaphor is **water finding its level**:
relief should flow like the rivers until **every upazila is reached**. The hero and key
sections render a **stylized delta / river network of Bangladesh**, and as the user scrolls,
**streams of aid flow along the rivers from donors outward to districts**, and the map
**fills in upazila by upazila** as coverage grows. It is calm, hopeful, and *legible* — the
motion always communicates real data (coverage, flow, fulfillment), never decoration for its
own sake.

Tone: **honest, humane, official-but-warm.** Think national broadcaster / public-trust
institution with contemporary craft — not a charity guilt-trip, not a SaaS dashboard.

Avoid AI/template tells: no purple gradients, no three-card grids, no stock "helping hands"
photography clichés, no flag bunting. Prefer real data viz, dignified photography (with
consent), Bengali typographic craft, and restrained, meaningful motion.

---

## 1. Art direction

**Mood words:** trust · clarity · dignity · water · resilience · transparency · calm.

**Dual theme:**
- **Light = "Daylight / paper"** (default for civic trust + readability + low-power):
  warm ivory paper, deep river-green ink, terracotta accent.
- **Dark = "Night river"**: deep midnight teal-green with luminous water and gold — used for
  the transparency dashboard and evening reading; reduces glare and power on OLED.

Theme toggle drawn as a **sun ↔ moon over a river line**.

### Color tokens (CSS variables, both themes)

**Light ("Daylight")**
- `--bg`: `#F6F2E9` (ivory paper) · `--bg-elev`: `#FFFFFF` · `--panel`: `#FBF8F1`
- `--ink`: `#13241E` (deep river-green near-black) · `--ink-dim`: `#4F635B`
- `--river`: `#0E7C66` (primary — river green) · `--river-2`: `#1FA68A`
- `--gold`: `#C9962B` (trust/seal accent, used sparingly) · `--terracotta`: `#C75B39` (alerts/need)
- `--ok`: `#2E8B57` (fulfilled) · `--warn`: `#D9883B` · `--danger`: `#C0392B`
- Need-intensity scale (for the map): ivory → amber → terracotta → deep red.

**Dark ("Night river")**
- `--bg`: `#081A17` · `--bg-elev`: `#0E2521` · `--panel`: `#11302A`
- `--ink`: `#EAF3EE` · `--ink-dim`: `#9CB6AD`
- `--river`: `#22C29E` · `--river-2`: `#3DE0BB` (luminous water) · `--gold`: `#E5B450`
- `--terracotta`: `#E1714A` · `--ok`: `#3DD37F` · `--warn`: `#E6A24B` · `--danger`: `#E5564B`
- Fulfillment fills glow softly; need-intensity scale brightens on the dark map.

> Use **gold extremely sparingly** — only for official seals, verified badges, and the
> national-total figure. It signals trust; overuse cheapens it.

### Typography — **Bengali is the primary script**
- **Bengali (headlines + body):** a high-quality Bangla face — **Li Ador Noirrit**,
  **Noto Serif Bengali** (headlines, dignified), paired with **Hind Siliguri** or **Noto Sans
  Bengali** (UI/body, highly legible at small sizes on cheap screens). Test real Bangla
  conjuncts and matra rendering.
- **Latin (English toggle + numerals):** pair with **Source Serif 4** (headlines) and **Inter**
  (UI). 
- **Numerals / amounts / counts:** tabular figures (Inter tabular or **IBM Plex Mono**) so
  taka totals and beneficiary counts don't jitter. Support **Bengali numerals (০-৯)** as a
  display option.
- Keep line-length comfortable for Bangla (which runs wider); generous line-height (matra
  needs vertical room).

### Texture, imagery, motifs
- Subtle **paper/handmade texture** in light mode; faint **river-contour topographic lines**
  as a recurring motif (like a survey map of the delta).
- **Dignified, consented documentary photography** of communities and volunteers — never
  exploitative imagery of suffering. Duotone-treated to the palette for cohesion.
- A small **official wordmark + national emblem lockup** in the header to signal government
  authenticity (placeholder until provided).

---

## 2. Signature scroll & map system (rich tier)

Wire **Lenis → GSAP ScrollTrigger**; MapLibre for the real map, Three.js for the hero delta
and the aid-flow layer. **Every motion encodes real data.** Build these specific behaviors:

1. **The delta fills with aid (hero).** A stylized **river network of Bangladesh** (Three.js
   line/particle network). As the user scrolls, **luminous particles flow along the rivers
   from donation sources outward**, and **upazila regions light up one-by-one** as coverage
   accumulates — ending on a live national figure ("**৳— crore + — items delivered to — of 495
   upazilas**"). Scrubbed to scroll; deterministic. (Lite tier: a static filled map + the
   number.)

2. **Pledge → received → allocated → distributed (pinned).** Pin a section while a single
   donation's **proof chain draws itself** as four linked nodes along a flowing line, each
   stamping a proof (receipt, photo, signer seal). Communicates the integrity model viscerally.

3. **Coverage choropleth reveal.** As the map section enters, the country **fills upazila by
   upazila** with the need-intensity / fulfillment color, like water spreading — not a fade.
   Hovering/tapping a unit raises its real numbers.

4. **Counter that earns trust.** National totals **count up** on enter with tabular numerals,
   and a thin **gold underline draws** beneath the verified figure (the only gold motion).

5. **River parallax.** Topographic contour lines and the river layer move at gentle parallax
   depths beneath content — slow, calm, water-like easing (no bouncy/playful eases here).

6. **Calm by default.** Eases are gentle (`power2`/custom "tide" ease), durations a touch
   slower than a consumer app — this is a place of trust, not hype.

> **Lite tier** replaces every scrubbed scene with an **instant final state** (filled map,
> shown totals, static proof-chain diagram). `prefers-reduced-motion` and a low-bandwidth
> flag both force lite tier. The data and meaning are identical; only the motion differs.

---

## 3. Pages to design (every one; desktop + mobile; light + dark; Bn primary / En toggle)

### 3.1 Public home / transparency landing
- **Hero:** the delta-fills-with-aid scene + the live national figure + a calm dual CTA
  ("দান করুন / Donate" and "স্বচ্ছতা দেখুন / See where it goes").
- **Sections:** (a) proof-chain pinned reveal; (b) live coverage map preview; (c) "active
  campaigns" (current disasters) with progress; (d) impact in human terms (families reached,
  meals, blankets) with documentary photography; (e) "how transparency works" (the ledger);
  (f) trust/footer with government lockup, open-data link, audit access.

### 3.2 Donate flow (money + goods) — must be effortless on a cheap phone
- Choose **money** or **goods**. 
  - *Money:* amount (with quick chips), channel (**bKash / Nagad / Rocket / card**), optional
    **earmark an area** (pick division→zila→upazila) or "where it's needed most," zakat tag,
    receipt.
  - *Goods:* type (clothes / food / medicine / water / shelter / other), quantity, then
    **drop-off point on a map** or **schedule a pickup**.
- Big tap targets, minimal steps, Bengali microcopy, clear cost-free assurance, instant
  tracking link/QR. Mobile-first; works in lite tier.

### 3.3 Donation tracking (the donor's proof)
- A personal **proof-chain timeline**: pledged → received → allocated to [upazila/need] →
  distributed (with the geo-stamped photo + verifier). A mini-map showing where it landed.
  Shareable verified card.

### 3.4 National transparency dashboard (the centerpiece)
- Full **MapLibre choropleth** of Bangladesh, drill Division→Zila→Upazila→Union/Ward. Toggle
  layers: **need intensity / received / distributed / fulfillment %**. Animated **aid-flow
  lines** on the rich tier. Side panel: selected unit's real numbers, the donations and
  distributions behind them, and links into the ledger. Time scrubber to replay a campaign.

### 3.5 Open ledger / audit
- Search a donation by ID → its **hash-linked proof chain**; verify integrity; download
  CSV/JSON open data; per-campaign reconciliation summary (from the Audit agent), in plain
  Bangla/English.

### 3.6 Need registry (community + admin)
- Report a need (type, quantity, severity, location) — simple for community leaders; richer for
  admins. List/map of open needs with severity color.

### 3.7 Field volunteer app (offline-first PWA)
- **Distinct, utilitarian, high-contrast, glove-friendly** skin. Log a distribution:
  allocation, beneficiary count, items, **capture GPS + photo**, sign. Works **offline**, shows
  a sync queue + status. Big buttons, minimal typing, Bangla voice prompts. This is the most
  important *functional* surface — design it for speed in the field, in sunlight.

### 3.8 Admin consoles (upazila / zila / national)
- Verify needs, approve allocations (with the **Allocation agent's** proposed plan shown as
  acceptable suggestions), sign off distributions, review **fraud/anomaly flags**, manage
  campaigns. Dense, table + map, role-scoped. Same tokens, more data.

### 3.9 "Adopt an Upazila"
- A sponsor (business/diaspora) picks an upazila, funds it, and gets a dashboard of
  QR-verified distributions for what they funded. Dignified, accountable, shareable.

### 3.10 Access layer (SMS/USSD + voice) — design the *content & flows*
- Document and design the **menu trees** for USSD/SMS donate / report-need / check-status, and
  the **Bangla voice prompt** scripts. Even though these aren't web pages, design their copy,
  numbering, and confirmations to match the platform's clarity.

### 3.11 System / states
- Empty (no campaigns active → calm "all clear, rivers are quiet"), loading (a gentle ripple),
  errors, auth (phone OTP), 404, **offline banner** (for the PWA), low-bandwidth/lite-tier
  notice.

---

## 4. Components library
- `DeltaScene` (Three.js river network + aid-flow particles, rich tier; static fallback).
- `CoverageMap` (MapLibre choropleth, drilldown, layer toggles, time scrubber).
- `ProofChain` (the 4-node pledge→distributed timeline, animated or static).
- `AmountInput` (Bn numerals, quick chips, MFS channel picker).
- `UnitPicker` (Division→Zila→Upazila→Union/Ward cascading select).
- `NeedSeverityTag`, `VerifiedSeal` (gold, sparing), `BilingualText` (Bn/En switch).
- `FieldLogForm` (offline, GPS+photo capture), `SyncQueue`.
- `NumberCounter` (tabular, Bn/En numerals), `ThemeToggle`, `RiverContourBg`.

Tailwind extension `shohay`: tokens via CSS vars (both themes), Bangla type scale + line-height,
need-intensity color scale, calm "tide" eases, lite-tier utility that disables heavy motion.

---

## 5. Responsive, low-bandwidth & mobile (critical)
- **Mobile-first** for donate, track, and field flows — most users are on phones, many low-end.
- **Two tiers** everywhere: rich (capable + good network) vs lite (low-end / 2G / reduced-motion
  / data-saver). Detect via perf probe, `navigator.connection`, and `prefers-reduced-motion`;
  let users force lite. Lite tier: no Three.js, simplified map (or static SVG), system-ish
  motion only, aggressively small payloads, lazy images, Bengali web-font subsetting.
- Offline-first PWA for field volunteers (service worker, background sync).

## 6. Accessibility, trust & privacy
- **WCAG AA+** in both themes; Bengali screen-reader labels; large-text mode; never color-only
  meaning (pair the need-intensity scale with labels/patterns).
- Show **proof and provenance** prominently; verified seals; open-data links — design *for*
  scrutiny. Never display beneficiary PII publicly (aggregates only); blur faces unless
  consented.
- Government authenticity cues (emblem lockup, official footer) without nationalist kitsch.

## 7. Build order
1. **Tokens & theming** (both themes), **Bengali + Latin type system**, need-intensity scale,
   lite-tier switch, `ThemeToggle`, `BilingualText`.
2. **Motion/map foundation:** Lenis ↔ ScrollTrigger; `DeltaScene` (rich) + static fallback;
   `CoverageMap` base.
3. **Public home** with all rich-tier scroll scenes (delta-fills, proof-chain pin, coverage
   reveal, trust counter) + their lite-tier static states.
4. **Donate flow** (money + goods) and **Donation tracking / proof chain** — mobile-first.
5. **National transparency dashboard** (choropleth, drilldown, layers, aid-flow, time scrubber).
6. **Open ledger / audit** + open-data export UI.
7. **Need registry** + **Field volunteer PWA** (offline, GPS+photo, sync queue).
8. **Admin consoles** (upazila/zila/national) + fraud flags + "Adopt an Upazila."
9. **Access-layer flows** (USSD/SMS/voice menu + script design).
10. **States** (offline, lite-notice, empty/loading/error/auth/404) + accessibility + privacy +
    low-bandwidth pass.

Deliver each page in **both themes**, **both breakpoints**, and **both tiers** (rich + lite),
Bengali-primary with English toggle, scroll/map behaviors wired and annotated for engineers.
