-- Persist all prospect-proposed meeting options and the calendar pre-check result.
-- Apply after 0007: npx wrangler d1 migrations apply donninger-ai-db --remote

ALTER TABLE sales_appointments ADD COLUMN meeting_options_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE sales_appointments ADD COLUMN availability_status TEXT NOT NULL DEFAULT 'not_checked';
