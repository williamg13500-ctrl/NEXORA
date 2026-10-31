# NEXORA GROUP — Private Pre-launch Review (2026-10-31)

Scope: existing project only. Preserve approved photographic design, brand identities, existing records, references and administrator protections. Do not change project visibility or authorize public launch.

## Current project and access
- Project ID: proj_8UDp9uV0ceRt
- Current version: v79 (final private pre-launch review record, deployed 2026-10-31); baseline before review edits was v74 (live at 2026-10-31T09:18:28Z).
- Project tier reported by Hatchable: personal; owner role.
- Privacy verification: PASSED in a clean managed-Chromium session with no cookies on 2026-10-31. The bare project URL displayed “Sign in to continue to NEXORA GROUP Website” and “This site is private”; no site content was served. Hatchable also reports visibility=personal and sign-in wall on every path, including /api/*. A preview URL is a temporary verification bypass, not a privacy control.
- Do not change visibility to public without explicit owner launch approval.
- Rollback path: Hatchable console → History/Deployments → v78 (previous gated deployment with the final TEKDiD updates-only card renderer). Do not roll back to v74 without a reviewed reason; it predates the TEKDiD gate and tracking privacy repair.

## TEKDiD claim register — separate site not controlled here
Inspected https://tekdid.xyz/ homepage content on 2026-10-31 using live extraction; it identifies itself as “TEKDID — AI Forex Trading Bot Platform”.
- 78.4% win rate — unsupported in available evidence; remove until independently verifiable methodology, sample, period, broker/account statements and audited calculations are supplied.
- $41.2M managed volume — unsupported; remove until reconciled records and definition/time period are supplied.
- 12,480 active traders — unsupported; remove until verifiable active-user definition and analytics are supplied.
- 6.3% maximum drawdown — unsupported; remove until audited equity curve, period, calculation method and account scope are supplied.
- Market ticker investigation: the live browser showed EUR/USD, GBP/USD and USD/JPY with non-zero changes, while XAU/USD, XAG/USD and multiple crypto symbols displayed 0.00%. The separate site's `MarketTicker` bundle uses `quote.changePct ?? 0` and `quote.price ?? fallbackPrice`, so missing quote data is explicitly rendered as a zero-percent change and a hard-coded fallback price. The main bundle opens a Binance Spot WebSocket for configured crypto symbols and also polls a `quote-snapshot` query every 30 seconds; fallback values are visibly hard-coded (for example XAU/USD 2418.55, XAG/USD 29.418, BTC/USD 63074.04). This is a mixed feed with fallback/zero defaults, not a verified all-instruments live ticker. Forex/metal source and freshness could not be established from the visible code. Remove the ticker or display an honest unavailable state until each instrument has a verified source, timestamp and freshness state.
- “AI bot” chooses pair/direction/entry/SL/TP/size; “AI engine live”; trade monitor; strategy engine; analytics; explainability; immutable trade history; ledger-backed balances; backend-enforced limits; JWT/TOTP/2FA/email verification/CSRF/rate limiting/encrypted credentials/audit logging; crypto deposits/withdrawal approvals: no independent implementation or security evidence available from this page review. Remove or hold each claim until technical evidence, testing and security review substantiate it.
- CTAs “Start trading now”, “Create account”, “Sign in”, “Open dashboard”, and crypto-deposit references conflict with the requested pre-launch/gated state. The separate site needs its owner/operator to remove or disable these until authorized.
- Exact recommended replacement hero copy for tekdid.xyz:
  “TEKDiD is in pre-launch review. Platform access and deposits are not available. Join the updates list to receive launch information. Trading involves substantial risk of loss. No returns are guaranteed.”
  Primary CTA: “Request updates” (updates only; no account creation or trading access).
  Ticker replacement: remove it until a reliable live-data integration is verified. If an honest state is necessary: “Market data unavailable — live feed not verified.”
- Separate-site limitation: no verified Hatchable project ID or editing access for tekdid.xyz was available; its content has NOT been changed by this review.

## NEXORA-controlled content changes implemented (v75–v78)
- Set TEKDiD registry to coming_soon + gated=true, with updates-only override message.
- Replaced the NEXORA hub's TEKDiD direct-open CTA with updates-only contact CTA and a nearby risk notice.
- Removed TEKDiD feature/positioning sections pending evidence; updated metadata and hero/contact copy to state pre-launch, updates-only, no platform access/deposits.
- Removed NEXORA-controlled dynamic script that could create a direct link to tekdid.xyz.
- Switched TEKDiD hero image to the already-hosted local media variants.
- Removed visible placeholder-style legal-detail copy from privacy/terms while preserving draft/legal-review warnings.
- Deployed in v76/v77: tracking API returns only status + public_note; tracking UI displays the reference from the entered code and status/public update, with no timestamps/private notes. Post-deploy tests confirmed private_notes, phone, email, name and created_at are not returned.
- Existing NEXORA GROUP and NEXORA TECHNOLOGIES SVG logo files are present. Original source assets were not separately supplied in the accessible project context, so their provenance/visual match to the approved originals remains unverified. Do not redraw; request the original SVG/AI/PDF/PNG brand files for comparison if needed.
- No team biographies, verified case studies, testimonials, accreditation, customer counts, business email or business location were invented. Team/proof draft components in the hub were already hidden. Preserve verified phone/WhatsApp contact +1 332 777 3936.

## Browser, mobile and accessibility evidence
- Managed Chromium mobile emulation at 390×844: document width 390px; no horizontal overflow. TEKDiD updates details opened from the CTA; brand preselected as TEKDiD; zero visible direct links to tekdid.xyz; adjacent risk notice visible.
- Managed Chromium desktop emulation at 1440×1000: document width 1440px; no horizontal overflow. Platforms page displayed TEKDiD as GATED, no direct tekdid.xyz anchor, and a “Request updates only” CTA to the waitlist.
- Single mobile navigation timing sample: responseStart 99 ms, DOMContentLoaded 364 ms, load 396 ms, first-contentful-paint 288 ms, transferSize 8,531 bytes. Desktop sample: responseStart 22 ms, DOMContentLoaded 387 ms, load 536 ms, transferSize 8,531 bytes. These are single managed-browser samples, not Lighthouse scores or field metrics.
- Automated DOM checks: required waitlist controls detected, TEKDiD preselection passed, invalid non-international phone produced the expected validation message without a reference code, all form controls had associated labels, zero images lacked alt attributes, and a skip link was present. Navigation opened/closed with a click and a synthetic Escape event; real keyboard key input could not be tested because the browser proxy's documented `page.press` method failed. Screen-reader and physical-phone testing remain Not tested.
- Screenshot objects saved in project storage under `prelaunch/v76-mobile-home.png`, `prelaunch/v76-tekdid-mobile.png`, and `prelaunch/v78-platforms-desktop.png` (signed preview URLs expire after one hour).

## Private completion list
- Obtain verified legal contracting entity, registered address, governing law/jurisdiction, liability/dispute clauses, effective date, data controller, lawful bases, data retention/deletion schedule, deletion identity verification and any mandatory jurisdictional disclosures. Qualified counsel must approve final privacy/terms pages.
- Request original NEXORA GROUP and NEXORA TECHNOLOGIES logo source files for comparison with existing SVGs.
- Obtain evidence or remove unsupported claims from the separate tekdid.xyz project; verify market data source/freshness and remove/replace 0.00% ticker.
- Real physical-phone, actual keyboard key input, screen-reader, and Lighthouse checks remain outstanding. Managed Chromium emulation was run at 390×844 and 1440×1000; the browser proxy did not support its documented `page.press` method, so Escape was tested only via a synthetic key event, not real keyboard input.
- Original NEXORA GROUP and NEXORA TECHNOLOGIES logo provenance remains unverified until source originals are supplied for comparison.

## Synthetic test evidence and exact cleanup (complete)
Baseline before the first test round: enquiries=0, bookings=0, waitlist=0, contact_submissions=1, enquiry_audit=0.
First test round:
- Enquiry id=20, reference=NX-ZZZRJ, name=TEST - delete me - general enquiry.
- TEKDiD updates-only waitlist id=5, reference=WL-QXGKJ, name=TEST - delete me - TEKDiD updates only.
- SKYLINE consultation id=5, reference=BK-WLS3H, name=TEST - delete me - SKYLINE consultation.
- Admin update for enquiry id 20 succeeded (status=contacted, public note and private note stored); audit id=7 created. Admin inbox returned the row.
- Duplicate submissions were tested before cleanup and each returned the original reference with duplicate=true; no second row was created in that first round.
- Post-v76 tracking tests returned only {status, public_note}; no private notes, timestamps, or contact fields were returned.
- First cleanup deleted only enquiry id=20/ref NX-ZZZRJ, waitlist id=5/ref WL-QXGKJ, booking id=5/ref BK-WLS3H, audit id=7 where enquiry_id=20, and rate-limit rows ids 19–25 created by tracking tests.
- Process note: after the first cleanup, a later smoke call was mistakenly repeated with the same payloads after the rows had already been deleted; this created a second trio instead of testing duplicates. It was immediately removed by exact identifiers: enquiry id=21/ref NX-YQZES, waitlist id=6/ref WL-CFDDS, booking id=6/ref BK-NDSDH. No audit row was created for that second trio.
- Final verification: both sets of test references and their exact rows are absent; test audit row and rate-limit rows ids 19–25 are absent. Counts returned to baseline: enquiries=0, bookings=0, waitlist=0, contact_submissions=1, enquiry_audit=0. Existing contact_submissions row id=2 remains present with its original 2026-10-27 timestamp.
- Final current row counts are verified. Do not repeat POST tests after cleanup unless a new explicitly approved test window is established.