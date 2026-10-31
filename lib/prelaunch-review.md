# NEXORA GROUP — Private Pre-launch Review (2026-10-31)

Scope: existing project only. Preserve approved photographic design, brand identities, existing records, references and administrator protections. Do not change project visibility or authorize public launch.

## Current project and access
- Project ID: proj_8UDp9uV0ceRt
- Baseline version before edits: v74 (live at 2026-10-31T09:18:28Z).
- Project tier reported by Hatchable: personal; owner role.
- Hatchable's runtime note says ordinary anonymous visitors to the bare project URL receive the sign-in wall. A separate unauthenticated graphical browser session was not available in this run, so independent browser verification remains outstanding. A preview URL is a temporary verification bypass, not a privacy control.
- Do not change visibility to public without explicit owner launch approval.
- Rollback candidate: v74 (pre-review changes). Confirm via deployment history before rollback.

## TEKDiD claim register — separate site not controlled here
Inspected https://tekdid.xyz/ homepage content on 2026-10-31 using live extraction; it identifies itself as “TEKDID — AI Forex Trading Bot Platform”.
- 78.4% win rate — unsupported in available evidence; remove until independently verifiable methodology, sample, period, broker/account statements and audited calculations are supplied.
- $41.2M managed volume — unsupported; remove until reconciled records and definition/time period are supplied.
- 12,480 active traders — unsupported; remove until verifiable active-user definition and analytics are supplied.
- 6.3% maximum drawdown — unsupported; remove until audited equity curve, period, calculation method and account scope are supplied.
- Market ticker: extracted repeated 0.00% moves across several instruments, alongside changing-looking prices. No reliable data provider, timestamps, market session, latency or source evidence was available. Treat feed as unverified/possibly stale or placeholder; remove ticker until integration and freshness can be proven. Do not label it live.
- “AI bot” chooses pair/direction/entry/SL/TP/size; “AI engine live”; trade monitor; strategy engine; analytics; explainability; immutable trade history; ledger-backed balances; backend-enforced limits; JWT/TOTP/2FA/email verification/CSRF/rate limiting/encrypted credentials/audit logging; crypto deposits/withdrawal approvals: no independent implementation or security evidence available from this page review. Remove or hold each claim until technical evidence, testing and security review substantiate it.
- CTAs “Start trading now”, “Create account”, “Sign in”, “Open dashboard”, and crypto-deposit references conflict with the requested pre-launch/gated state. The separate site needs its owner/operator to remove or disable these until authorized.
- Exact recommended replacement hero copy for tekdid.xyz:
  “TEKDiD is in pre-launch review. Platform access and deposits are not available. Join the updates list to receive launch information. Trading involves substantial risk of loss. No returns are guaranteed.”
  Primary CTA: “Request updates” (updates only; no account creation or trading access).
  Ticker replacement: remove it until a reliable live-data integration is verified. If an honest state is necessary: “Market data unavailable — live feed not verified.”
- Separate-site limitation: no verified Hatchable project ID or editing access for tekdid.xyz was available; its content has NOT been changed by this review.

## NEXORA-controlled content changes prepared
- Set TEKDiD registry to coming_soon + gated=true, with updates-only override message.
- Replaced the NEXORA hub's TEKDiD direct-open CTA with updates-only contact CTA and a nearby risk notice.
- Removed TEKDiD feature/positioning sections pending evidence; updated metadata and hero/contact copy to state pre-launch, updates-only, no platform access/deposits.
- Removed NEXORA-controlled dynamic script that could create a direct link to tekdid.xyz.
- Switched TEKDiD hero image to the already-hosted local media variants.
- Removed visible placeholder-style legal-detail copy from privacy/terms while preserving draft/legal-review warnings.
- Tracking API draft changed to return only status + public_note; tracking UI draft now displays reference from the visitor's entered code and status/public update, with no timestamps/private notes.
- Existing NEXORA GROUP and NEXORA TECHNOLOGIES SVG logo files are present. Original source assets were not separately supplied in the accessible project context, so their provenance/visual match to the approved originals remains unverified. Do not redraw; request the original SVG/AI/PDF/PNG brand files for comparison if needed.
- No team biographies, verified case studies, testimonials, accreditation, customer counts, business email or business location were invented. Team/proof draft components in the hub were already hidden. Preserve verified phone/WhatsApp contact +1 332 777 3936.

## Private completion list
- Obtain verified legal contracting entity, registered address, governing law/jurisdiction, liability/dispute clauses, effective date, data controller, lawful bases, data retention/deletion schedule, deletion identity verification and any mandatory jurisdictional disclosures. Qualified counsel must approve final privacy/terms pages.
- Request original NEXORA GROUP and NEXORA TECHNOLOGIES logo source files for comparison with existing SVGs.
- Obtain evidence or remove unsupported claims from the separate tekdid.xyz project; verify market data source/freshness and remove/replace 0.00% ticker.
- Run real phone/keyboard/screen-reader/Lighthouse checks on a physical device. These were not available in the current tool session.
- Independently verify the bare project URL's sign-in wall in a clean unauthenticated browser before treating privacy verification as Passed.

## Synthetic test evidence (must be cleaned after final verification)
Baseline before test: enquiries=0, bookings=0, waitlist=0, contact_submissions=1, enquiry_audit=0.
- Enquiry: id=20, reference=NX-ZZZRJ, name=TEST - delete me - general enquiry.
- TEKDiD updates-only waitlist: id=5, reference=WL-QXGKJ, name=TEST - delete me - TEKDiD updates only.
- SKYLINE consultation request: id=5, reference=BK-WLS3H, name=TEST - delete me - SKYLINE consultation.
- Test-only enquiry audit row: id=7 (related only to enquiry id 20).
- Duplicate submissions returned the original reference for all three flows.
- Admin update for enquiry id 20 succeeded; audit row was created.
- Deployed tracking API currently returned status + created_at and omitted public_note; draft fix prepared but requires deployment/retest.
- Delete only the three exact records and audit row id=7 after post-deploy verification; never delete based on name alone or bulk-match.