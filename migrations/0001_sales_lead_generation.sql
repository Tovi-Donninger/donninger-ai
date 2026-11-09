-- Donninger.AI Sales & Lead Generation — initial D1 schema
-- Development foundation. All business records are scoped to an organisation.
-- Apply with: wrangler d1 migrations apply donninger-ai-db --remote

CREATE TABLE IF NOT EXISTS organisations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

INSERT OR IGNORE INTO organisations (id, name)
VALUES ('dev-donninger', 'Donninger.AI Development Workspace');

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  organisation_id TEXT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  company TEXT NOT NULL DEFAULT '',
  job_title TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'manual',
  source_detail TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','contacted','qualified','proposal','won','lost')),
  priority TEXT NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low','normal','high')),
  estimated_value REAL,
  currency TEXT NOT NULL DEFAULT 'USD',
  owner TEXT NOT NULL DEFAULT '',
  last_contacted_at TEXT,
  next_follow_up_at TEXT,
  consent_status TEXT NOT NULL DEFAULT 'unknown'
    CHECK (consent_status IN ('unknown','given','withdrawn','not_required')),
  tags_json TEXT NOT NULL DEFAULT '[]',
  notes TEXT NOT NULL DEFAULT '',
  lost_reason TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_leads_org_created
  ON leads (organisation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_org_status
  ON leads (organisation_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_org_followup
  ON leads (organisation_id, next_follow_up_at);
CREATE INDEX IF NOT EXISTS idx_leads_org_email
  ON leads (organisation_id, email);

CREATE TABLE IF NOT EXISTS sales_tasks (
  id TEXT PRIMARY KEY,
  organisation_id TEXT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  lead_id TEXT REFERENCES leads(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  due_at TEXT,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','in_progress','completed','cancelled')),
  priority TEXT NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low','normal','high')),
  assigned_to TEXT NOT NULL DEFAULT '',
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_sales_tasks_org_due
  ON sales_tasks (organisation_id, status, due_at);
CREATE INDEX IF NOT EXISTS idx_sales_tasks_lead
  ON sales_tasks (lead_id);

CREATE TABLE IF NOT EXISTS sales_activity (
  id TEXT PRIMARY KEY,
  organisation_id TEXT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  lead_id TEXT REFERENCES leads(id) ON DELETE SET NULL,
  task_id TEXT REFERENCES sales_tasks(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL,
  details_json TEXT NOT NULL DEFAULT '{}',
  actor TEXT NOT NULL DEFAULT 'system',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_sales_activity_org_created
  ON sales_activity (organisation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_activity_lead
  ON sales_activity (lead_id, created_at DESC);
