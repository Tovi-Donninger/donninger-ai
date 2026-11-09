-- Dual approval for sales meetings.
-- Apply after 0006: npx wrangler d1 migrations apply donninger-ai-db --remote

ALTER TABLE sales_appointments ADD COLUMN admin_declined_at TEXT;
ALTER TABLE sales_appointments ADD COLUMN client_declined_at TEXT;
ALTER TABLE sales_appointments ADD COLUMN confirmation_email_sent_at TEXT;

CREATE TABLE IF NOT EXISTS sales_appointment_tokens (
  id TEXT PRIMARY KEY,
  organisation_id TEXT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  appointment_id TEXT NOT NULL REFERENCES sales_appointments(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  purpose TEXT NOT NULL CHECK (purpose IN ('client_accept','client_decline')),
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_sales_appointment_tokens_appointment
ON sales_appointment_tokens (appointment_id, purpose, expires_at);
