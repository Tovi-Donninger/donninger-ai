# Donninger.AI Sales & Lead Generation — Product Blueprint

## Product outcome
Help a real business turn marketing-generated demand into measurable revenue. Sales is not a standalone contact list: it is the conversion and feedback layer in a connected Marketing → Sales → Customer → Management process.

## End-to-end operating cycle
1. Marketing creates demand through campaigns, website forms, referrals, events or other approved channels.
2. Marketing hands lead records to Sales through a controlled CSV/XLSX import or a later direct form/CRM integration.
3. Sales previews, validates, deduplicates and approves the import before any records enter the live lead database.
4. Sales prioritises leads, assigns ownership, records contact attempts and schedules next actions.
5. AI assists with summaries, qualification against customer-defined criteria and draft communications. A person approves external messages and commercial commitments.
6. Sales records outcomes: qualified, proposal, won, lost, revenue/value and reason.
7. Marketing and Management receive campaign-level feedback: spend, leads, qualified leads, opportunities, wins and revenue where reliable data is available.

## First deliverable: marketing-to-sales lead import
Support CSV and XLSX files with a consistent template. The import wizard should:
- Accept .csv and .xlsx; enforce a reasonable file-size and row-count limit.
- Parse the first worksheet (XLSX) or selected CSV delimiter/encoding.
- Let the user map spreadsheet headings to Donninger.AI fields; remember mappings only after explicit confirmation.
- Preview a sample and show total rows before import.
- Normalise whitespace, email casing and phone formatting without inventing missing values.
- Validate required identity information (at least email or phone, plus a name or company); flag invalid rows instead of silently dropping them.
- Detect likely duplicates within the file and against existing leads in the same organisation. Offer review/skip/update options; never silently overwrite a lead.
- Preserve original row number, source, source detail, campaign and import batch.
- Capture customer need/brief, contact channel and contact-permission evidence. Unknown permission must remain unknown; importing a record is not permission to contact it.
- Show a final confirmation with valid, invalid and duplicate counts before writing leads.
- Create an import history record with who imported, when, filename, campaign and outcome.
- Provide a downloadable error file listing rejected rows and reasons.

## Import template fields
Required for a useful lead record: first_name or company, and at least one of email or phone.
Recommended columns: first_name, last_name, email, phone, company, job_title, source, source_detail, campaign_code, customer_need, contact_permission, consent_recorded_at, contact_channel, estimated_value, currency, owner, notes.

Accepted contact_permission values: consent_given, existing_customer_basis, legitimate_interest_reviewed, do_not_contact, unknown. Unknown is the safe default. Do not use imported records for outbound campaigns until the business has confirmed a valid contact basis and applicable local rules.

## Lead lifecycle
new → contacted → qualified → proposal → won/lost
- Status changes are logged in the sales activity history.
- lost requires/encourages a reason.
- won records closed date and actual revenue, not just speculative pipeline value.
- Reopening or changing an outcome is auditable.
- Follow-up tasks require an owner and due date where applicable; overdue tasks appear prominently.

## Core records
- Organisation: tenant boundary for all records.
- Marketing campaign: channel, objective, campaign code, dates, spend and status.
- Import batch: file metadata, campaign/source attribution, importer, totals and outcome.
- Staged import row: raw row, normalized candidate data, validation errors, duplicate link and decision.
- Lead: contact, company, source/campaign, need, permission state, owner, status and commercial values.
- Sales task: follow-up, meeting preparation, due date, owner and completion.
- Sales activity: timeline of imports, changes, contact attempts, notes and outcomes.

## Revenue and campaign reporting
- New leads by source/campaign and date.
- Valid, invalid and duplicate import counts.
- Contacted and qualified lead counts.
- Opportunities/proposals and wins/losses.
- Actual recorded revenue from won deals.
- Campaign spend and cost per lead / qualified lead / acquisition only when spend and outcome data are supplied and attributable.
- Conversion rates must display their numerator and denominator. Do not imply causation from incomplete attribution.

## Guardrails
- Importing a lead does not grant permission to email, call, text or add the person to a marketing list.
- No bulk outreach, scraping or automatic messaging in the first release.
- Human approval for outreach, pricing, proposals, negotiation and customer commitments.
- Keep records scoped to an organisation. Development workspace must not be presented as production multi-tenant security.
- AI suggestions must show their source data and uncertainty; AI must not invent a prospect's needs or claim that a lead is qualified without defined criteria.
- CSV/XLSX parsing and previews should not expose uploaded data in public logs or third-party services.
- Measure customer outcomes before making ROI or profit claims.

## Implementation sequence
1. Create D1 and apply migrations 0001 and 0002.
2. Add a lead-import API with authenticated admin access, row/size limits, validation, deduplication and explicit commit.
3. Add a portal import wizard supporting CSV and XLSX, mapping, preview, errors and confirmation.
4. Add lead list, filters, detail view, activity timeline and manual status updates.
5. Add tasks and follow-up queue.
6. Add AI assistance only after the deterministic workflow is reliable; require human approval for generated communications.
7. Connect Marketing campaign records and later direct form/CRM sources.
8. Add campaign-to-revenue reporting.

## Current implementation status
- Migration 0001: initial organisations, leads, sales tasks and activity tables.
- Migration 0002: marketing campaigns, import batches, staged import rows, lead need/permission/attribution fields.
- Import interface, API, D1 binding and live deployment: not yet implemented.
- Existing portal login is development-admin-only. Do not enter real customer data until production tenant isolation, privacy controls and access roles are implemented.