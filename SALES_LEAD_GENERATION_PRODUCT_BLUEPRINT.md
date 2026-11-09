# Donninger.AI Sales & Lead Generation — Product Blueprint

## Product outcome
Help a real business turn marketing-generated demand into measurable revenue. Sales is the conversion and feedback layer in a connected Marketing → Sales → Customer → Management process.

## End-to-end operating cycle
1. Marketing creates demand through campaigns, website forms, referrals, events or other authorised channels.
2. Marketing hands lead records to Sales through controlled CSV/XLSX import or a later direct form/CRM integration.
3. Sales previews, validates, deduplicates and approves imports before records enter the live lead database.
4. Leads are stored in the organisation's database. Sales manages ownership, pipeline stage and follow-up tasks.
5. AI reads the lead record and customer-defined Ideal Customer Profile (ICP) and qualification criteria from the database. It evaluates fit, expressed need and evidenced purchase intent, and records an explainable qualification result.
6. A salesperson reviews and approves a lead for outreach. The system separately checks contact permission, opt-outs and channel rules.
7. AI prepares individually tailored email, SMS or WhatsApp messages based on the prospect's recorded needs and the business's approved product/service information. An authorised person approves external messages before sending in the initial release.
8. Provider events and inbound replies are recorded against the lead with timestamps. AI can classify replies (for example interested, pricing requested, demo requested, not interested or opt-out), show the evidence and recommend a next action. Human review resolves ambiguity.
9. Sales records proposals, wins/losses and actual revenue. Marketing and Management receive campaign-to-revenue feedback where attribution data is reliable.

## First deliverable: marketing-to-sales lead import
Support CSV and XLSX files with a consistent template. The import wizard should:
- Accept .csv and .xlsx; enforce reasonable file-size and row-count limits.
- Parse the first worksheet (XLSX) or selected CSV delimiter/encoding.
- Let the user map spreadsheet headings to Donninger.AI fields; remember mappings only after explicit confirmation.
- Preview a sample and show total rows before import.
- Normalise whitespace, email casing and phone formatting without inventing values.
- Validate useful identity information (at least email or phone, plus a name or company); flag invalid rows instead of silently dropping them.
- Detect duplicates within the file and against existing leads in the same organisation. Offer review/skip/update options; never silently overwrite a lead.
- Preserve original row number, source, source detail, campaign and import batch.
- Capture customer need/brief, preferred contact channel and contact-permission evidence. Unknown permission remains unknown; importing a record is not permission to contact it.
- Show a final confirmation with valid, invalid and duplicate counts before writing leads.
- Create import history with who imported, when, filename, campaign and outcome.
- Provide a downloadable error file listing rejected rows and reasons.

## AI lead qualification
- Read only the specific lead record, relevant interaction history and the organisation's active ICP/qualification profile from D1; do not send the whole lead database to the AI provider.
- Criteria are configurable per organisation and versioned. A lead may be a good fit for one business and unsuitable for another.
- Assess the prospect's stated need/use case, ICP fit, explicit purchase intent and available evidence about timing, budget and decision authority.
- Never invent budget, authority, timing, purchase intent or deal value. Mark missing information as unknown and suggest questions to ask.
- Return priority (high/medium/low), fit score, confidence, evidence, missing information and a recommended next action.
- Store every run with the lead, criteria/profile version, model and prompt version, timestamp, structured result and any error. Preserve history when a lead or criteria are updated.
- Allow a human to review/correct the result. Re-run only when requested or when relevant source data/criteria change; avoid unnecessary API calls.
- Qualification does not itself authorise contact or send a message.

## AI outreach centre
A dedicated Sales portal workspace will manage approved, personalised outreach:
- Email, SMS and WhatsApp channels, each enabled only after its provider credentials, sender identity and permissions are configured.
- AI drafts messages using the lead's recorded customer need, qualification evidence and the customer's approved product/service facts, tone and offer information.
- Show the source facts used in the draft, recipient, channel and proposed follow-up. Do not fabricate product capabilities, prices, discounts, guarantees or results.
- Initial release: human approval before any external outbound message. Sending is allowed only when the lead has passed the sales approval gate and the channel's contact permission/legal requirements have been checked.
- Store the exact outbound content, channel, recipient, approval, approver, provider, provider message ID, send time, delivery/bounce/failure status and failure reason.
- Receive inbound replies through provider webhooks where supported. Store the exact reply, sender, channel, received timestamp and message/thread relationship.
- AI may classify replies as interested, requested information, requested pricing, requested demo, not interested, opt-out or unknown. Store the analysis, confidence, evidence, suggested next action and human-review state.
- An opt-out must suppress further marketing outreach on the relevant channel and update the lead's contact restrictions.
- Follow-up scheduling must respect contact frequency, local time, channel/provider rules and opt-outs. No repeated or unlimited automated chasing.
- Keep conversation history and all manual contact attempts in the lead timeline.

## Contact and response tracking
Every contact attempt and message is a separate timestamped record; never overwrite the history with only a latest-contact field.
Track:
- Who contacted the prospect, when, via which channel, and for what purpose.
- Exact message sent or received, with thread/reply relationship.
- Approval state and approver for outbound messages.
- Provider status: queued, sent, delivered, failed, bounced or received, where supported.
- Whether and when the prospect replied, plus the reply content.
- AI's interpretation of the reply, expressed interest, explicit requests, objections, evidence and confidence.
- Whether the prospect asked for product information, pricing, a demonstration or a purchase.
- Next action, owner and due date; and final sales outcome.
The lead's current contact/interest status is a summary only. The complete interaction and analysis history remains available for audit and reporting.

## Lead lifecycle
new → contacted → qualified → proposal → won/lost
Interest tracking is separate from pipeline stage and may include: unknown, no response, interested, requested information, requested pricing, requested demo, not interested, opted out and converted.
- Log status changes in the activity history.
- Lost requires/encourages a reason.
- Won records closed date and actual revenue, not just speculative estimated value.
- Reopening or changing an outcome is auditable.
- Follow-up tasks have an owner and due date where applicable; overdue tasks appear prominently.

## Core records
- Organisation: tenant boundary for all records.
- Marketing campaign: channel, objective, campaign code, dates, spend and status.
- Import batch and staged import rows: file metadata, campaign/source attribution, importer, totals, validation and duplicate decisions.
- Lead: contact, company, source/campaign, need, contact permission, current interest summary, owner, pipeline stage and commercial values.
- Qualification profile and runs: tenant-specific ICP criteria, versions, results, evidence, model/prompt versions and review history.
- Messages: inbound/outbound email, SMS and WhatsApp content, approvals, provider IDs, timestamps and delivery status.
- Contact events: calls, meetings and manually logged contact attempts.
- Response analyses: reply classification, evidence, confidence, requested information and suggested action.
- Sales tasks and activity: follow-ups, meetings, status changes, notes and audit events.
- Outreach preferences: enabled channel, provider, sender identity and securely managed configuration.

## Reporting
- Leads by source/campaign and date; import valid/invalid/duplicate counts.
- Contact attempts and unique leads contacted, by channel.
- Sent, delivered, failed and bounced messages where provider data exists.
- Response rate with numerator and denominator; interested replies and explicit requests for information, pricing or demos.
- Qualified leads, proposals, wins/losses and actual recorded revenue.
- Campaign spend and cost per lead / qualified lead / acquisition only when spend and attribution data are supplied.
- Conversion rates must display numerator and denominator. Do not imply causation from incomplete attribution.

## Safety, privacy and operational guardrails
- Importing a lead or approving its sales qualification does not automatically grant permission to email, text or WhatsApp the person.
- Enforce the organisation's documented lawful contact basis, channel-specific consent/permission, opt-outs and applicable jurisdictions' rules before sending. Unknown permission blocks outbound marketing until resolved.
- Do not send to records marked do_not_contact or opted out. Maintain suppression records.
- No scraping, purchased lists or bulk outreach in the first release.
- Human approval for outbound messages in the initial release, and always for pricing, proposals, negotiation and customer commitments.
- Keep provider API keys server-side in Worker secrets. Never expose credentials in browser code or GitHub.
- Use the minimum necessary lead data for AI. Free-tier AI provider terms may permit submitted data to be used to improve services; use synthetic/test data until privacy and contractual suitability are assessed.
- External messaging providers may charge per message/conversation and impose templates, opt-in and throughput rules. Do not promise unlimited free SMS or WhatsApp.
- Keep all records scoped to an organisation. Development workspace is not production multi-tenant security; do not enter real customer data until tenant isolation, production authentication, permissions, privacy and retention controls are implemented.
- AI must show evidence and uncertainty, never fabricate prospect needs, product capabilities or commercial facts.
- Measure actual customer outcomes before making ROI or profit claims.

## Implementation sequence
1. Create Cloudflare D1 database and configure the `DB` binding.
2. Apply migrations 0001–0003 to create the lead, import, qualification, outreach and response-history schema.
3. Build authenticated D1 APIs for lead import, deduplication, lead listing/details, tasks and interaction history.
4. Build the CSV/XLSX import wizard and lead management workspace.
5. Build tenant-specific ICP configuration and database-backed AI qualification, including run history and human review.
6. Build the AI Outreach Centre: message drafting, approval queue, send adapters and message history.
7. Add one channel at a time, starting with email; then evaluate SMS and WhatsApp providers, pricing and compliance.
8. Add inbound reply webhooks, response classification, opt-out suppression and follow-up scheduling.
9. Add campaign-to-revenue and outreach performance reporting.
10. Harden production authentication, tenant isolation, role permissions, audit, privacy and retention before real client data or customer self-service.

## Current implementation status
- Migration 0001: organisations, leads, sales tasks and activity tables (committed; not yet applied to D1).
- Migration 0002: campaigns, import batches, staged rows and marketing handover fields (committed; not yet applied to D1).
- Migration 0003: tenant ICP profiles, AI qualification run history, outbound/inbound message records, contact events, reply analyses and channel preferences (committed; not yet applied to D1).
- CSV/XLSX import UI/API, live qualification calls, messaging provider connections, reply webhooks and live portal workflows are not yet implemented.
- Portal authentication remains development-admin-only. Do not enter real customer or sensitive business data.
