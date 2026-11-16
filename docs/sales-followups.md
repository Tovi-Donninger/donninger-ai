# Sales email lifecycle

New consented outreach enrolls a lead automatically. First follow-up: three business days after initial sending. Then weekly, at most three follow-ups total. Default business week: Sunday–Thursday. Sends run every 15 minutes during 09:00–17:00 Asia/Jerusalem. Holidays are not excluded. Existing contacts are not enrolled by this release.

Any received reply cancels the silent-lead sequence before AI analysis. A clear stop request suppresses the normalized email address across duplicate records, cancels pending follow-ups and sends no acknowledgement. AI-classified opt-outs receive the same suppression. Unsubscribe detection is applied to the cleaned, unquoted message body. The Gmail ingestion monitor must remain active; replies cannot stop sends until they are ingested.

Lead panel controls: pause, resume a manually paused sequence, cancel the sequence permanently, or stop all sales emails for the email address. Suppression is independent of later edits to a lead's permission. Calendar invitations already sent are not recalled. An email already dispatched cannot be recalled.

Each dispatch claims the sequence atomically and uses a stable message ID with the existing Gmail service's duplicate protection. Uncertain failures enter needs_review and are not retried automatically. A worker terminated during dispatch can leave status sending; inspect Gmail before any manual recovery. Automatic follow-ups use factual templates; existing AI analysis handles customer replies. Follow-ups use Re: subjects but the existing outreach sender may create a new Gmail thread.

## Release order

1. Apply schema: `npx wrangler d1 migrations apply donninger-ai-db --remote`.
2. Deploy worker/assets and cron: `npx wrangler deploy`.
3. Confirm Gmail ingestion is running and test using an explicitly supplied test mailbox. Verify opt-out, follow-up controls, business-day due date and scheduled delivery.

Do not deploy code before migration 0009. New schema is not initialized by web requests. Existing DONNINGER_EMAIL_TOKEN and Gmail Apps Script actions are reused; no replacement Apps Script is needed.

Validation: `node --test tests/sales-followups.test.mjs` (Node 24) uses an in-memory SQLite database with every migration applied, mocked dispatch, and real Worker reply routing. It sends no emails.
