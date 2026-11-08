# Donninger.AI Client Portal — Development Setup

## What is included
- `portal.html`, `portal.css`, `portal.js`: client portal sign-in and administrator dashboard.
- `worker.js`: Cloudflare Worker API for server-verified development administrator login, signed HttpOnly session cookies and logout.
- `wrangler.jsonc`: routes `/api/*` through the Worker and serves the existing website through the static assets binding.

## Development administrator
- Email: `admin@donninger.ai`
- Password: configure as a Cloudflare Worker secret named `DEV_ADMIN_PASSWORD`. Never commit the password to GitHub.
- Session signing key: configure a separate random secret named `SESSION_SECRET`.
- Development access is enabled by the `DEV_ADMIN_ENABLED` variable in `wrangler.jsonc`.

## Required Cloudflare setup
Before the password login can work on the deployed site, add these two Worker secrets in the Cloudflare dashboard for the `donninger-ai` Worker:
1. `DEV_ADMIN_PASSWORD` — the development administrator password.
2. `SESSION_SECRET` — a separate, randomly generated secret used to sign session cookies.

The email is already configured as a non-secret Worker variable. Do not put either secret in source code, GitHub, a frontend file or a public configuration variable.

## Important scope and limitations
- This is a development administrator login only. It does not yet include customer registration, password reset, multi-factor authentication, subscription billing, paid entitlements, organisation/tenant management or customer-specific roles.
- The dashboard currently displays product specifications and development status. It is not yet connected to live automation engines, customer records or third-party integrations.
- The production backend must add a database, tenant isolation, role-based access, billing-provider webhooks and per-customer service entitlements before customer launch.
- Do not enter real customer, employee, payroll, financial or other sensitive data in this development preview.
