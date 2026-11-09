-- Marketing-to-Sales handover and safe lead import staging.
-- Apply after 0001_sales_lead_generation.sql.
CREATE TABLE IF NOT EXISTS marketing_campaigns (
 id TEXT PRIMARY KEY, organisation_id TEXT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
 name TEXT NOT NULL, channel TEXT NOT NULL DEFAULT 'other', campaign_code TEXT NOT NULL DEFAULT '',
 objective TEXT NOT NULL DEFAULT '', landing_page TEXT NOT NULL DEFAULT '', start_date TEXT, end_date TEXT,
 spend_amount REAL, spend_currency TEXT NOT NULL DEFAULT 'USD',
 status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','paused','completed')),
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_campaigns_org_status ON marketing_campaigns (organisation_id, status);
CREATE TABLE IF NOT EXISTS lead_import_batches (
 id TEXT PRIMARY KEY, organisation_id TEXT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
 campaign_id TEXT REFERENCES marketing_campaigns(id) ON DELETE SET NULL, file_name TEXT NOT NULL,
 file_type TEXT NOT NULL CHECK (file_type IN ('csv','xlsx')), source_channel TEXT NOT NULL DEFAULT 'unknown',
 status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded','previewed','ready','imported','partially_imported','cancelled','failed')),
 total_rows INTEGER NOT NULL DEFAULT 0, valid_rows INTEGER NOT NULL DEFAULT 0, invalid_rows INTEGER NOT NULL DEFAULT 0,
 duplicate_rows INTEGER NOT NULL DEFAULT 0, imported_rows INTEGER NOT NULL DEFAULT 0, skipped_rows INTEGER NOT NULL DEFAULT 0,
 created_by TEXT NOT NULL DEFAULT 'admin', created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')), completed_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_import_batches_org_created ON lead_import_batches (organisation_id, created_at DESC);
CREATE TABLE IF NOT EXISTS lead_import_rows (
 id TEXT PRIMARY KEY, batch_id TEXT NOT NULL REFERENCES lead_import_batches(id) ON DELETE CASCADE, row_number INTEGER NOT NULL,
 raw_data_json TEXT NOT NULL DEFAULT '{}', normalized_data_json TEXT NOT NULL DEFAULT '{}',
 validation_errors_json TEXT NOT NULL DEFAULT '[]', duplicate_lead_id TEXT REFERENCES leads(id) ON DELETE SET NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','valid','invalid','duplicate','imported','skipped')),
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')), UNIQUE (batch_id, row_number)
);
CREATE INDEX IF NOT EXISTS idx_import_rows_batch_status ON lead_import_rows (batch_id, status);
ALTER TABLE leads ADD COLUMN customer_need TEXT NOT NULL DEFAULT '';
ALTER TABLE leads ADD COLUMN contact_channel TEXT NOT NULL DEFAULT '';
ALTER TABLE leads ADD COLUMN contact_permission TEXT NOT NULL DEFAULT 'unknown' CHECK (contact_permission IN ('unknown','consent_given','existing_customer_basis','legitimate_interest_reviewed','do_not_contact'));
ALTER TABLE leads ADD COLUMN consent_recorded_at TEXT;
ALTER TABLE leads ADD COLUMN campaign_id TEXT REFERENCES marketing_campaigns(id) ON DELETE SET NULL;
ALTER TABLE leads ADD COLUMN import_batch_id TEXT REFERENCES lead_import_batches(id) ON DELETE SET NULL;
ALTER TABLE leads ADD COLUMN import_row_number INTEGER;
ALTER TABLE leads ADD COLUMN external_reference TEXT NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS idx_leads_org_campaign ON leads (organisation_id, campaign_id);
CREATE INDEX IF NOT EXISTS idx_leads_org_contact_permission ON leads (organisation_id, contact_permission);