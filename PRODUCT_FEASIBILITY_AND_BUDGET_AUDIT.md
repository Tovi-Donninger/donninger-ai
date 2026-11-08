# Donninger.AI — Product Feasibility & Budget Audit

**Audit date:** 8 November 2026  
**Purpose:** Internal delivery and product-scope review. This is not customer-facing marketing copy.

## Executive decision

Donninger.AI can be built as a lean, modular automation service without exceeding the founder's target of **less than US$30/month in fixed platform costs during the initial build and early validation stage**. That is only realistic if we:

1. Build the core application directly on Cloudflare Workers, D1 and R2 rather than paying for a hosted automation platform as the foundation.
2. Use customer-owned accounts and subscriptions for email, calendars, CRM, accounting, payroll, inventory and messaging wherever possible.
3. Treat AI model usage, WhatsApp/SMS, paid connectors, storage growth and other variable usage as separately metered costs, ideally charged to the customer or covered by explicit usage allowances.
4. Launch a small number of repeatable workflows first, then add integrations one at a time.
5. Never promise a third-party integration until its API access, permissions, plan requirements and data mapping have been tested.

**Important:** The website currently describes product designs and intended workflows. The assessment logic is browser-side and rules-based; the portal is a development login and dashboard preview. The live automation engines, customer database, multi-tenant access controls, billing entitlements and third-party integrations have not yet been built. Do not sell the current site as an operational automation platform.

## What exists today

| Area | Current state | What is still missing |
|---|---|---|
| Public website and eight function pages | Built as a website/product explanation | No live customer automation behind the pages |
| Business Automation Assessment | Browser-side, rules-based assessment/report | AI analysis, saved submissions, customer accounts, verified ROI baselines |
| Entrepreneurship Assessment | Browser-side, rules-based assessment/report | Saved founder profiles, AI-generated validated plans, integrations |
| Administrator portal | Development login and dashboard preview | Customer registration, database, tenants, roles, subscription entitlements and live records |
| Worker | Static asset serving and development authentication foundation | Protected application APIs, D1/R2 bindings, queues/schedules, integration services |
| HR requirements | Product requirements documented | HR database, permissions, candidate/employee files, audit, payroll integrations and compliance controls |
| Automation engines | Not built | All live workflow execution, retries, monitoring, approvals and customer integrations |

## Budget architecture

### Recommended low-fixed-cost foundation

- **Cloudflare Workers:** host application APIs and execute workflow logic. Free tier currently includes 100,000 requests/day; the paid Workers plan starts at US$5/month if/when higher limits are needed.
- **Cloudflare D1:** relational database for organisations, users, workflow records, leads, cases, approvals and reporting. Free tier currently includes 5 GB total storage, 5 million rows read/day and 100,000 rows written/day.
- **Cloudflare R2:** document/object storage for uploaded files and generated documents. Free tier currently includes 10 GB-month storage, 1 million Class A operations and 10 million Class B operations per month.
- **Cloudflare Queues / scheduled triggers:** add only when asynchronous jobs, retries and scheduled tasks are needed; monitor the relevant plan limits.
- **AI API:** call a low-cost model only for tasks that genuinely need language understanding or generation. Meter usage per customer/workflow and set hard usage limits. A ChatGPT subscription does not include API usage.
- **Email/calendar:** connect each customer's own Google Workspace or Microsoft 365 account using OAuth and supported APIs. Their mailbox and calendar subscription remain their responsibility.
- **Payments:** add a billing provider after the service and entitlement model are ready; transaction fees are variable costs, not a reason to build a large billing system now.

### Cost guardrails

| Item | Initial approach | Budget treatment |
|---|---|---|
| Hosting and API runtime | Cloudflare free tier | Target US$0 while within limits |
| Database | Cloudflare D1 free tier | Target US$0 while within limits |
| File storage | Cloudflare R2 free tier | Target US$0 while within limits |
| AI usage | Low-cost API model, called only when needed | Variable; customer usage allowance or pass-through |
| Email and calendar | Customer's own provider account | Customer pays provider |
| CRM/accounting/payroll/inventory | Customer's existing subscription | Customer pays provider; integration scoped separately |
| WhatsApp/SMS | Not in the base package | Separate provider and per-message charges |
| Automation platform subscription | Do not use as the central production dependency | Avoid recurring fixed cost |
| Domain | Existing registration / renewal | Annual cost outside monthly platform budget |

A hosted n8n Starter plan is listed at €20/month billed annually, already consuming most or exceeding the founder's monthly fixed-cost ceiling once other costs are added. Make's Free plan includes 1,000 credits/month and a 15-minute minimum interval; its listed Core plan is US$12/month for 10,000 credits. These can be useful for a limited prototype, but neither should be the foundation for a multi-customer product at this budget. The preferred route is our own Cloudflare workflow service, with customer-owned third-party systems.

**The US$30 target is a founder platform-cost ceiling, not a promise that every customer's AI, messaging, CRM, payroll or software usage can be absorbed for free.** Customer-specific external fees must be disclosed and excluded from our margin calculations unless explicitly included in a priced allowance.

## Function-by-function feasibility

Status meanings:
- **MVP-ready to build:** feasible with our proposed stack and common APIs, subject to customer authorisation and testing.
- **Conditional:** feasible only for named providers, supported API access and clear customer data.
- **Later / specialist:** technically possible but too broad, sensitive or integration-heavy for the first release.

### 1. Sales & Lead Generation — MVP-ready to build

**Deliver first**
- Capture enquiries from Donninger.AI forms and customer-approved website forms.
- Create lead records, detect likely duplicates and assign owners using customer-defined rules.
- Send acknowledgement emails from the customer's connected mailbox.
- Create follow-up tasks and reminders; schedule meetings using a connected calendar.
- Prepare AI-assisted lead summaries, qualification notes and message drafts.
- Show lead status, owner, source, next action and simple pipeline metrics.

**Requires later/provider-specific work**
- Two-way sync with each CRM (HubSpot, Salesforce, Pipedrive, etc.).
- Telephony, call recording/transcription and messaging channels.
- Automated prospect enrichment from third-party data providers.

**Do not promise initially**
- Unlimited automated cold outreach, guaranteed lead generation, guaranteed conversions or universal CRM integrations.

**Human control:** sales staff approve external outreach, pricing, proposals, negotiations and commercial commitments.

### 2. Marketing — Conditional MVP

**Deliver first**
- Brand profile, campaign brief and content calendar.
- AI drafts for social posts, email copy, landing-page text and campaign variants.
- Approval workflow, scheduled task list and campaign asset library.
- UTM/source tracking and simple reporting from data the customer supplies or connects.

**Requires provider-specific work**
- Actual publishing/scheduling to each social platform.
- Email campaign sending through the customer's email marketing provider.
- Analytics and ad-platform reporting.

**Do not promise initially**
- Automatic publishing to every social network or autonomous ad buying/optimisation. Platform permissions, account types, API scopes and review requirements differ.

**Human control:** customer approves brand claims, public content, targeting and advertising budgets.

### 3. Customer Service — MVP-ready to build in a limited channel scope

**Deliver first**
- Website contact form and connected support inbox intake.
- Ticket/case creation, categorisation, assignment, status and SLA reminders.
- Approved knowledge base for common questions.
- AI-drafted replies grounded in approved company information, with human review.
- Escalation of complaints, sensitive cases and low-confidence answers.
- Basic response-time, case-volume and resolution reporting.

**Requires provider-specific work**
- Live chat, WhatsApp Business, Instagram messaging, voice and helpdesk platform sync.
- Order/account lookups require authorised customer-system APIs.

**Do not promise initially**
- A fully autonomous call centre, guaranteed resolution, or unapproved WhatsApp/Instagram access. WhatsApp messages are charged according to market and message category.

**Human control:** people handle refunds, compensation, complaints, identity-sensitive requests and policy exceptions.

### 4. HR & Recruitment — Later / specialist module; deliver a carefully limited MVP

**Feasible first release**
- Vacancy intake and job advert drafting.
- Customer-hosted application form or dedicated recruitment inbox.
- CV/document upload, text extraction and candidate profile creation.
- Candidate pipeline, interview scheduling and structured notes.
- Evidence-based shortlist assistance tied to job-related criteria; recruiter makes every progression/rejection/hiring decision.
- Onboarding checklist and controlled document collection.
- Basic employee directory and employee-file document storage only after appropriate access controls and privacy processes are implemented.

**Later, after security and data architecture**
- Central employee database, document versioning, training records and employment-change history.
- Role-specific KPI templates, review schedules, actual results, manager/employee feedback and development plans.
- Payroll/finance synchronisation for a specifically selected provider, with approvals and reconciliation logs.
- Offboarding workflows and retention/deletion policies.

**Important restrictions**
- LinkedIn's Job Posting API is restricted to approved partners; LinkedIn's current documentation says it is not accepting new Job Posting API partnerships and directs applicants to Apply Connect. Therefore we must not promise direct LinkedIn job publishing. Offer advert preparation and a guided/manual posting workflow unless access is formally granted.
- Do not claim universal payroll integration. Each payroll product has its own API, permissions, field mappings and plan requirements.
- Candidate and employee records contain sensitive personal data. Tenant isolation, role-based permissions, encryption, audit logs, retention/deletion and jurisdiction-specific privacy review are prerequisites before real customer data is stored.
- AI must not autonomously reject, rank by protected characteristics, hire, discipline, promote or terminate employees.

### 5. Finance & Accounting — Conditional, limited MVP only

**Deliver first**
- Finance inbox/document intake.
- Receipt/invoice file storage and extraction of supplier, invoice number, dates, totals and tax fields into draft records.
- Duplicate/missing-field checks and exception flags.
- Approval routing, due-date reminders and draft payment follow-ups.
- Simple summaries based on imported/connected accounting data.

**Later/provider-specific work**
- Two-way accounting integration, transaction matching and reconciliation assistance.
- Multi-currency, tax-specific rules and more complex accounts-payable workflows.

**Do not promise initially**
- Autonomous bookkeeping, tax advice, statutory filing, guaranteed reconciliation, bank-feed access for every bank or automatic payment execution.

**Human control:** qualified/authorised staff approve accounting treatment, reconciliations, bank-detail changes, payments and statutory submissions.

### 6. Operations & Administration — Best first core module

**MVP-ready to build**
- Configurable forms and internal requests.
- Workflow templates with steps, owners, due dates, statuses and approval checkpoints.
- Task assignment, reminders, escalation and exception queues.
- Document/checklist generation and filing.
- Email/calendar notifications through customer-owned accounts.
- Activity history and simple operational dashboards.

This should become the reusable workflow engine underneath the other departments. Build it once, then configure it for different business processes rather than creating eight unrelated systems.

**Do not promise initially:** automatic integration with every business application or autonomous handling of safety, legal, financial or employee-sensitive exceptions.

### 7. Stock, Suppliers & Logistics — Conditional on one supported inventory source

**Deliver first**
- Import stock and order data from CSV or one selected provider integration.
- Threshold-based low-stock alerts.
- Draft replenishment requests and purchase orders.
- Supplier follow-up drafts and delivery reminders.
- Order milestone tracking, discrepancy flags and stock reports.

**Later**
- Two-way inventory/ERP integrations, barcode/scanner workflows, multi-warehouse operations and supplier portals.

**Do not promise initially**
- Real-time universal stock visibility, automatic purchasing, physical stock verification or accurate demand forecasting without reliable history and a tested source system.

**Human control:** staff verify physical stock and approve purchase commitments, supplier selection and stock adjustments.

### 8. Management & Reporting — Conditional on reliable connected data

**Deliver first**
- KPI definitions, owners, targets and reporting periods.
- CSV/manual data import and one or two supported integrations.
- Dashboard, scheduled report packs and threshold alerts.
- AI-written commentary that cites the underlying figures and flags missing data.
- Action list with owners and due dates.

**Later**
- Multi-source connectors, consolidated financial/HR/operations reporting, scenario modelling and forecasting.

**Do not promise initially**
- A live, all-company dashboard that automatically understands every accounting, CRM, HR and inventory system. Data definitions and access permissions must be agreed and tested first.

## Recommended build order

1. **Core foundation:** customer organisations, users, roles, D1 database, secure file storage, audit trail, integration credentials and tenant isolation.
2. **Workflow engine:** configurable triggers, steps, conditions, task ownership, approvals, retries, execution logs and customer-visible status.
3. **Operations & Administration:** use it to prove the reusable workflow engine.
4. **Sales & Lead Generation:** forms, lead database, email acknowledgement, follow-up tasks and pipeline.
5. **Customer Service:** inbox/form-to-ticket, knowledge base, draft response and human escalation.
6. **Management & Reporting:** initially report on data from the first three modules.
7. **Marketing:** content preparation, approvals and one tested publishing/email integration.
8. **HR, Finance and Stock:** build each as a separately scoped specialist module with provider-specific integration and stronger privacy/approval controls.

## Required product and marketing rules

- Label mock dashboards, sample charts and diagrams as **illustrative** until they display live customer data.
- Never use invented savings percentages as if they are measured results.
- The current assessment code uses fixed estimated automation rates of 20–30% by department. These are not based on customer-specific time studies or measured implementation outcomes. Remove these fixed percentages or clearly label them as hypothetical scenarios; the preferred report should show customer-entered baseline hours and calculate scenarios only from an explicitly stated, editable assumption.
- Do not call the assessment AI-powered until it actually calls an AI service. Today it is a rules-based assessment.
- Do not say an integration is available until the provider connection is built, tested and authorised.
- Distinguish **automated**, **AI-assisted**, **human-approved** and **planned** features in every module.
- Quote each customer after discovery. Separate setup, recurring support, AI usage allowance, third-party subscription costs and out-of-scope integration work.
- The portal must enforce entitlements server-side. Hiding a page in the browser is not payment protection.

## Commercial delivery model

Use a repeatable implementation model:

1. Free assessment identifies potential workflows; it does not promise quantified savings.
2. Discovery confirms the customer's systems, permissions, volumes, exceptions and desired outcomes.
3. Fixed-scope setup covers only agreed workflows and named integrations.
4. Monthly support covers monitoring, small adjustments and agreed usage/support limits.
5. Additional AI, messaging, storage or third-party costs are passed through or separately priced.
6. Measure the customer's baseline and actual post-launch results before making quantified ROI claims.

Do not sell a low-priced all-departments bundle that implies every integration and specialist workflow is included. Start with one workflow, prove it, then expand.

## Go / no-go conclusion

**GO:** Build a lean Cloudflare-based platform and sell scoped workflow implementations. The target of less than US$30/month in founder fixed platform costs is plausible for development and early low-volume use if we stay on free tiers and make customers own/pay for their external services.

**NO-GO for now:** Do not market Donninger.AI as a fully operational AI business operating system with eight live, fully integrated departments. We do not have that product yet, and several advertised capabilities depend on restricted or vendor-specific APIs.

**First sellable product target:** a working Operations workflow engine plus Sales lead capture/follow-up, then Customer Service inbox-to-ticket. These give us reusable foundations and avoid the most sensitive and integration-heavy areas while we prove customer value.

## Primary source references checked

- Cloudflare Workers pricing: https://developers.cloudflare.com/workers/platform/pricing/
- Cloudflare D1 pricing: https://developers.cloudflare.com/d1/platform/pricing/
- Cloudflare D1 limits and free-tier behaviour: https://developers.cloudflare.com/d1/reference/faq/
- Cloudflare R2 pricing: https://developers.cloudflare.com/r2/pricing/
- Make plans and pricing: https://www.make.com/en/pricing
- n8n plans and pricing: https://n8n.io/pricing/
- OpenAI API pricing: https://developers.openai.com/api/docs/pricing
- LinkedIn Job Posting API access: https://learn.microsoft.com/en-us/linkedin/talent/job-postings/api/overview
- WhatsApp Business Platform pricing: https://whatsappbusiness.com/products/platform-pricing/
- Gmail API usage limits and pricing: https://developers.google.com/workspace/gmail/api/reference/quota
- Google Calendar API quotas and pricing: https://developers.google.com/workspace/calendar/api/guides/quota
