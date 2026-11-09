-- Donninger.AI Sales: AI qualification, outreach and response intelligence.
-- Apply after 0001_sales_lead_generation.sql and 0002_marketing_lead_import.sql.
-- This migration stores every contact attempt and message as an auditable record.
-- It does not send messages; provider integrations and explicit approval gates are separate.

ALTER TABLE leads ADD COLUMN interest_status TEXT NOT NULL DEFAULT 'unknown'
  CHECK (interest_status IN ('unknown','no_response','interested','requested_information','requested_pricing','requested_demo','not_interested','opted_out','converted'));
ALTER TABLE leads ADD COLUMN last_response_at TEXT;
ALTER TABLE leads ADD COLUMN last_response_channel TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS sales_qualification_profiles (
  id TEXT PRIMARY KEY,
  organisation_id TEXT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Default ideal customer profile',
  criteria_json TEXT NOT NULL DEFAULT '{}',
  version INTEGER NOT NULL DEFAULT 1,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0,1)),
  created_by TEXT NOT NULL DEFAULT 'admin',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (organisation_id, version)
);
CREATE INDEX IF NOT EXISTS idx_qualification_profiles_org_active
  ON sales_qualification_profiles (organisation_id, is_active);

CREATE TABLE IF NOT EXISTS sales_qualification_runs (
  id TEXT PRIMARY KEY,
  organisation_id TEXT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  profile_id TEXT REFERENCES sales_qualification_profiles(id) ON DELETE SET NULL,
  profile_version INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed','needs_review')),
  priority TEXT CHECK (priority IN ('low','medium','high')),
  fit_score INTEGER CHECK (fit_score BETWEEN 0 AND 100),
  confidence REAL CHECK (confidence BETWEEN 0 AND 1),
  result_json TEXT NOT NULL DEFAULT '{}',
  evidence_json TEXT NOT NULL DEFAULT '[]',
  model_name TEXT NOT NULL DEFAULT '',
  prompt_version TEXT NOT NULL DEFAULT '',
  error_message TEXT NOT NULL DEFAULT '',
  reviewed_by TEXT NOT NULL DEFAULT '',
  reviewed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  completed_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_qualification_runs_lead
  ON sales_qualification_runs (organisation_id, lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_qualification_runs_priority
  ON sales_qualification_runs (organisation_id, status, priority);

CREATE TABLE IF NOT EXISTS sales_messages (
  id TEXT PRIMARY KEY,
  organisation_id TEXT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('outbound','inbound')),
  channel TEXT NOT NULL CHECK (channel IN ('email','sms','whatsapp')),
  subject TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','pending_approval','approved','queued','sent','delivered','failed','bounced','received','cancelled')),
  approval_status TEXT NOT NULL DEFAULT 'not_required'
    CHECK (approval_status IN ('not_required','pending','approved','rejected')),
  approved_by TEXT NOT NULL DEFAULT '',
  approved_at TEXT,
  recipient TEXT NOT NULL DEFAULT '',
  sender TEXT NOT NULL DEFAULT '',
  provider TEXT NOT NULL DEFAULT '',
  provider_message_id TEXT NOT NULL DEFAULT '',
  reply_to_message_id TEXT REFERENCES sales_messages(id) ON DELETE SET NULL,
  consent_basis_snapshot TEXT NOT NULL DEFAULT 'unknown',
  sent_at TEXT,
  delivered_at TEXT,
  received_at TEXT,
  failure_reason TEXT NOT NULL DEFAULT '',
  ai_generated INTEGER NOT NULL DEFAULT 0 CHECK (ai_generated IN (0,1)),
  ai_prompt_version TEXT NOT NULL DEFAULT '',
  created_by TEXT NOT NULL DEFAULT 'system',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_sales_messages_lead_time
  ON sales_messages (organisation_id, lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_messages_provider
  ON sales_messages (provider, provider_message_id);
CREATE INDEX IF NOT EXISTS idx_sales_messages_pending
  ON sales_messages (organisation_id, status, approval_status, created_at);

CREATE TABLE IF NOT EXISTS sales_contact_events (
  id TEXT PRIMARY KEY,
  organisation_id TEXT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('call_attempt','call_connected','voicemail','meeting_scheduled','meeting_held','manual_email','manual_sms','manual_whatsapp','other')),
  channel TEXT NOT NULL DEFAULT '',
  outcome TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  occurred_at TEXT NOT NULL,
  created_by TEXT NOT NULL DEFAULT 'admin',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_contact_events_lead_time
  ON sales_contact_events (organisation_id, lead_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS sales_response_analyses (
  id TEXT PRIMARY KEY,
  organisation_id TEXT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  message_id TEXT NOT NULL REFERENCES sales_messages(id) ON DELETE CASCADE,
  interest_status TEXT NOT NULL CHECK (interest_status IN ('unknown','interested','requested_information','requested_pricing','requested_demo','not_interested','opted_out')),
  intent_summary TEXT NOT NULL DEFAULT '',
  explicit_requests_json TEXT NOT NULL DEFAULT '[]',
  objections_json TEXT NOT NULL DEFAULT '[]',
  suggested_next_action TEXT NOT NULL DEFAULT '',
  confidence REAL CHECK (confidence BETWEEN 0 AND 1),
  evidence_json TEXT NOT NULL DEFAULT '[]',
  needs_human_review INTEGER NOT NULL DEFAULT 1 CHECK (needs_human_review IN (0,1)),
  model_name TEXT NOT NULL DEFAULT '',
  prompt_version TEXT NOT NULL DEFAULT '',
  reviewed_by TEXT NOT NULL DEFAULT '',
  reviewed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_response_analyses_lead
  ON sales_response_analyses (organisation_id, lead_id, created_at DESC);

CREATE TABLE IF NOT EXISTS sales_outreach_preferences (
  id TEXT PRIMARY KEY,
  organisation_id TEXT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('email','sms','whatsapp')),
  provider TEXT NOT NULL DEFAULT '',
  enabled INTEGER NOT NULL DEFAULT 0 CHECK (enabled IN (0,1)),
  sender_identity TEXT NOT NULL DEFAULT '',
  settings_json TEXT NOT NULL DEFAULT '{}',
  verified_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (organisation_id, channel)
);
CREATE INDEX IF NOT EXISTS idx_outreach_preferences_org
  ON sales_outreach_preferences (organisation_id, enabled);

-- Every inbound/outbound message and manual contact is separately timestamped.
-- A lead's current interest_status is a summary; the underlying history remains immutable/auditable.
