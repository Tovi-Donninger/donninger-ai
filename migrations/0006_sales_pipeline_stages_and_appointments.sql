-- Sales pipeline stages beyond qualification.
-- Apply after 0005: npx wrangler d1 migrations apply donninger-ai-db --remote

ALTER TABLE leads ADD COLUMN pipeline_stage TEXT NOT NULL DEFAULT 'new';

UPDATE leads
SET pipeline_stage = CASE
  WHEN EXISTS (SELECT 1 FROM unqualified_leads u WHERE u.organisation_id=leads.organisation_id AND u.lead_id=leads.id) THEN 'unqualified'
  WHEN EXISTS (SELECT 1 FROM qualified_leads q WHERE q.organisation_id=leads.organisation_id AND q.lead_id=leads.id) THEN 'qualified'
  WHEN status='contacted' THEN 'contacted'
  WHEN status='proposal' THEN 'meeting_requested'
  WHEN status='won' THEN 'converted'
  WHEN status='lost' THEN 'lost'
  ELSE 'new'
END;

CREATE INDEX IF NOT EXISTS idx_leads_org_pipeline_stage
ON leads (organisation_id, pipeline_stage, updated_at DESC);

CREATE TABLE IF NOT EXISTS sales_appointments (
  id TEXT PRIMARY KEY,
  organisation_id TEXT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested','confirmed','cancelled','completed')),
  requested_start_at TEXT,
  confirmed_start_at TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  timezone TEXT NOT NULL DEFAULT 'Asia/Jerusalem',
  prospect_timezone TEXT NOT NULL DEFAULT '',
  meeting_provider TEXT NOT NULL DEFAULT 'zoom',
  zoom_meeting_id TEXT NOT NULL DEFAULT '',
  zoom_join_url TEXT NOT NULL DEFAULT '',
  calendar_event_id TEXT NOT NULL DEFAULT '',
  discussion_summary TEXT NOT NULL DEFAULT '',
  customer_questions_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_sales_appointments_org_start
ON sales_appointments (organisation_id, confirmed_start_at);
