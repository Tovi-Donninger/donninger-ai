# Donninger.AI assessment report email setup

The assessment report email form uses the Cloudflare Worker endpoint `POST /api/reports/email` and Resend to deliver a branded HTML report to the address supplied by the visitor.

## Required setup

1. Create a Resend account and verify a domain you control.
2. In Cloudflare, open the `donninger-ai` Worker and add these Worker secrets/variables:
   - `RESEND_API_KEY` — secret containing the Resend API key.
   - `REPORT_FROM_EMAIL` — sender address on the verified domain, for example `Donninger.AI Reports <reports@your-verified-domain.com>`. Replace this example with an address you control.
3. Optional: set `REPORT_ADMIN_EMAIL` to an address where you want a blind copy of each requested report. This provides an email record of report requests; it is not a searchable customer database.
4. Deploy the Worker and submit a test assessment using an email address you control.

## What the email contains

- Executive summary, top recommendation and priorities.
- Customer-requested and recommended business functions, where applicable.
- Proposed setup, monthly and first-year pricing for business assessments.
- Published per-function and complete-bundle pricing for founder assessments.
- Optional 25%, 50% and 75% time-release scenarios when the visitor supplies both weekly hours spent on repetitive work and hourly staff cost.

Savings scenarios are illustrative values of staff capacity potentially released. They are not guaranteed cash savings, payroll reductions or promises of business results. Without both baseline inputs, the report explains how a measured savings estimate should be developed instead of inventing a figure.

## Important limitations

- Email delivery is not active until the required Resend settings are configured and the sender domain is verified.
- The endpoint sends the report to the visitor. It does not yet create a persistent customer record in a database or the client portal.
- An optional `REPORT_ADMIN_EMAIL` blind copy can provide an inbox record, but it is not a CRM.
- Third-party software, messaging and usage-based AI/API costs remain separate.
- The assessment itself remains rules-based; the email formatting does not make the assessment an AI-generated audit or a binding quote.
