-- Dedicated, queryable store of leads that meet a customer's qualification definition.
CREATE TABLE IF NOT EXISTS qualified_leads (
 id TEXT PRIMARY KEY,
 organisation_id TEXT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
 lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
 qualification_run_id TEXT NOT NULL REFERENCES sales_qualification_runs(id) ON DELETE CASCADE,
 fit_score INTEGER NOT NULL CHECK (fit_score BETWEEN 0 AND 100),
 priority TEXT NOT NULL CHECK (priority IN ('low','medium','high')),
 qualification_summary TEXT NOT NULL DEFAULT '',
 qualification_json TEXT NOT NULL DEFAULT '{}',
 qualified_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 UNIQUE (organisation_id, lead_id)
);
CREATE INDEX IF NOT EXISTS idx_qualified_leads_org_score
 ON qualified_leads (organisation_id, fit_score DESC, qualified_at DESC);
