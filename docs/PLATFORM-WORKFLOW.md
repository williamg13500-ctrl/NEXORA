# NEXORA dual-platform workflow

## Platform roles

- **Hatchable** is the production environment. Current verified baseline: project `proj_8UDp9uV0ceRt`, deployed version 88.
- **Lovable** is the development and preview environment. Project `e27b5076-2805-4f77-8d26-484b22bb9c51` is currently a starter scaffold, not a migrated copy of the production site.
- **GitHub** repository `williamg13500-ctrl/NEXORA` is the controlled exchange point. Work must move through feature branches and reviewed pull requests.

## Production safety rules

1. Do not replace or independently redeploy the Hatchable production site from Lovable.
2. Do not point Lovable at Hatchable production databases or copy production secrets.
3. Do not commit credentials, tokens, private customer data, or production database exports.
4. Keep TEKDiD as an external linked platform; do not modify its systems.
5. Validate changes in a separate development/test environment before proposing a Hatchable production release.
6. Merge only reviewed, tested changes. Production deployment remains a deliberate Hatchable release step.

## Verified Hatchable v88 inventory

The Hatchable project currently contains 104 files:
- 15 API route source files under `api/`
- 2 shared library files under `lib/`
- 11 SQL migration files under `migrations/`
- Static website pages, stylesheets, scripts, service worker, manifest, sitemap, robots file, brand logos and media under `public/`
- Admin page source under `pages/`

The deployed function registry reports 17 functions, including 15 active API functions and 2 active scheduled functions. Both scheduled functions reported zero errors over the preceding 7 days at the time of verification.

## Current integration status

- The GitHub repository exists and is public; default branch is `main`.
- A dedicated baseline branch, `nexora/hatchable-v88-baseline`, has been created from `main`.
- The repository has not yet been proven to be an exact mirror of Hatchable v88. Selected source files differed during spot checks; perform a complete content and secret review before treating this repository as canonical.
- The Lovable project is published but still contains the initial starter scaffold. It has not yet been migrated to the NEXORA application.
- Automatic two-way synchronization between Hatchable and Lovable has not been verified.

## Required next steps

1. Export or retrieve the complete Hatchable v88 source and reconcile it against this repository on a dedicated baseline branch.
2. Review repository visibility and scan for accidental secrets before using it as a shared source.
3. Build the NEXORA frontend and isolated backend/test data layer in Lovable without touching production data.
4. Add automated route, form, access-control, and regression tests.
5. Submit Lovable changes as feature-branch pull requests for review.
6. After approval, port or apply the verified changes to Hatchable, run a dry-run and smoke tests, then deploy deliberately.

This document records the workflow and verification state; it does not assert that synchronization or migration is complete.
