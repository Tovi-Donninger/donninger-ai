CREATE TABLE IF NOT EXISTS unqualified_leads (
 id TEXT PRIMARY KEY, organisation_id TEXT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
 lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
 qualification_run_id TEXT NOT NULL REFERENCES sales_qualification_runs(id) ON DELETE CASCADE,
 fit_score INTEGER NOT NULL CHECK (fit_score BETWEEN 0 AND 100),
 qualification_summary TEXT NOT NULL DEFAULT '', qualification_json TEXT NOT NULL DEFAULT '{}',
 assessed_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 UNIQUE (organisation_id, lead_id)
);
CREATE INDEX IF NOT EXISTS idx_unqualified_leads_org_assessed ON unqualified_leads (organisation_id, assessed_at DESC);
UPDATE leads SET status='qualified',updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now')
WHERE EXISTS (SELECT 1 FROM qualified_leads q WHERE q.organisation_id=leads.organisation_id AND q.lead_id=leads.id);
INSERT OR IGNORE INTO unqualified_leads
(id,organisation_id,lead_id,qualification_run_id,fit_score,qualification_summary,qualification_json)
SELECT lower(hex(randomblob(16))),r.organisation_id,r.lead_id,r.id,r.fit_score,
 COALESCE(json_extract(r.result_json,'$.summary'),''),COALESCE(r.result_json,'{}')
FROM sales_qualification_runs r JOIN leads l ON l.id=r.lead_id AND l.organisation_id=r.organisation_id
WHERE json_valid(r.result_json) AND json_extract(r.result_json,'$.qualified')=0
AND NOT EXISTS (SELECT 1 FROM sales_qualification_runs newer WHERE newer.organisation_id=r.organisation_id AND newer.lead_id=r.lead_id AND newer.completed_at>r.completed_at)
AND NOT EXISTS (SELECT 1 FROM qualified_leads q WHERE q.organisation_id=r.organisation_id AND q.lead_id=r.lead_id);
UPDATE leads SET status='lost',updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now')
WHERE status='new' AND EXISTS (SELECT 1 FROM unqualified_leads u WHERE u.organisation_id=leads.organisation_id AND u.lead_id=leads.id);
