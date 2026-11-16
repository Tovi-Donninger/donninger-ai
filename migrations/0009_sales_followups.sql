CREATE TABLE IF NOT EXISTS sales_email_suppressions (
 organisation_id TEXT NOT NULL REFERENCES organisations(id),
 email TEXT NOT NULL,
 reason TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 PRIMARY KEY(organisation_id,email)
);
CREATE TABLE IF NOT EXISTS sales_followups (
 organisation_id TEXT NOT NULL REFERENCES organisations(id),
 lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
 initial_message_id TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','paused','cancelled','completed','sending','needs_review')),
 sent_count INTEGER NOT NULL DEFAULT 0,
 next_at TEXT NOT NULL,
 started_at TEXT NOT NULL,
 reason TEXT NOT NULL DEFAULT '',
 PRIMARY KEY(organisation_id,lead_id)
);
CREATE INDEX IF NOT EXISTS idx_followups_due ON sales_followups(status,next_at);
-- Preserve pre-existing opt-outs across duplicate imports of the same email.
INSERT OR IGNORE INTO sales_email_suppressions(organisation_id,email,reason)
 SELECT organisation_id,lower(trim(email)),'Existing do-not-contact record' FROM leads WHERE contact_permission='do_not_contact' AND trim(email)<>'';
