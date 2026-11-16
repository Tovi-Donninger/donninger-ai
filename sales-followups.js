// Outreach lifecycle rules are deterministic; AI never overrides a stop request.
export function addBusinessDays(value, days, weekend = [5, 6]) {
  const date = new Date(value);
  for (let added = 0; added < days;) {
    date.setUTCDate(date.getUTCDate() + 1);
    if (!weekend.includes(date.getUTCDay())) added++;
  }
  return date.toISOString();
}
export function stopRequest(text) {
  return /\b(unsubscribe|opt[ -]?out|remove me|do not (?:email|contact|message)|don't (?:email|contact|message)|stop (?:emailing|contacting|messaging|sending)|no (?:more|further) (?:emails|messages|contact))\b/i.test(text);
}
export async function suppressEmail(db, org, email, reason = 'unsubscribe') {
  email = email.trim().toLowerCase();
  await db.batch([
    db.prepare("INSERT OR IGNORE INTO sales_email_suppressions (organisation_id,email,reason) VALUES (?,?,?)").bind(org,email,reason),
    db.prepare("UPDATE leads SET contact_permission='do_not_contact',interest_status='opted_out' WHERE organisation_id=? AND lower(trim(email))=?").bind(org,email),
    db.prepare("UPDATE sales_followups SET status='cancelled',reason=? WHERE organisation_id=? AND lead_id IN (SELECT id FROM leads WHERE organisation_id=? AND lower(trim(email))=?) AND status IN ('active','paused','sending')").bind(reason,org,org,email)
  ]);
}
export async function isSuppressed(db, org, email) {
  return Boolean(await db.prepare("SELECT email FROM sales_email_suppressions WHERE organisation_id=? AND email=?").bind(org,email.trim().toLowerCase()).first());
}
export async function cancelFollowups(db, org, leadId, reason) {
  await db.prepare("UPDATE sales_followups SET status='cancelled',reason=? WHERE organisation_id=? AND lead_id=? AND status IN ('active','paused','sending')").bind(reason,org,leadId).run();
}
export async function enrollFollowups(db, org, leadId, messageId, now = new Date().toISOString()) {
  // New outreach only. Historical contacts are never enrolled by a migration.
  await db.prepare("INSERT OR IGNORE INTO sales_followups (organisation_id,lead_id,initial_message_id,next_at,started_at) VALUES (?,?,?,?,?)").bind(org,leadId,messageId,addBusinessDays(now,3),now).run();
}
export async function processFollowups(env, send, now = new Date()) {
  if (!env.DB || !env.DONNINGER_EMAIL_TOKEN) return;
  const db = env.DB;
  // Working hours in the configured business timezone; Israel defaults to Sun–Thu.
  const zone = env.SALES_TIMEZONE || 'Asia/Jerusalem';
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:zone,weekday:'short',hour:'numeric',hourCycle:'h23'}).formatToParts(now).map(p=>[p.type,p.value]));
  const weekends = (env.SALES_WEEKEND || 'Fri,Sat').split(',');
  if (weekends.includes(parts.weekday) || Number(parts.hour)<9 || Number(parts.hour)>=17) return;
  const rows = await db.prepare("SELECT * FROM sales_followups WHERE status='active' AND next_at<=? ORDER BY next_at LIMIT 10").bind(now.toISOString()).all();
  for (const row of rows.results || []) {
    const org=row.organisation_id, id=row.lead_id;
    const claim=await db.prepare("UPDATE sales_followups SET status='sending' WHERE organisation_id=? AND lead_id=? AND status='active' AND sent_count=?").bind(org,id,row.sent_count).run();
    if (!claim.meta?.changes) continue;
    try {
      const lead=await db.prepare("SELECT * FROM leads WHERE organisation_id=? AND id=?").bind(org,id).first();
      const inbound=await db.prepare("SELECT id FROM sales_email_messages WHERE organisation_id=? AND lead_id=? AND direction='inbound' AND created_at>=? LIMIT 1").bind(org,id,row.started_at).first();
      if (!lead || lead.contact_permission!=='consent_given' || lead.pipeline_stage!=='contacted' || inbound || await isSuppressed(db,org,lead.email)) {
        await cancelFollowups(db,org,id,'Reply received, permission withdrawn or pipeline advanced'); continue;
      }
      const original=await db.prepare("SELECT subject FROM sales_messages WHERE id=? AND organisation_id=? AND lead_id=? AND status='sent'").bind(row.initial_message_id,org,id).first();
      if (!original) {await cancelFollowups(db,org,id,'Initial sent email missing');continue;}
      const count=row.sent_count+1, messageId='followup-'+row.initial_message_id+'-'+count;
      const body='Hi '+(lead.first_name||'there')+',\n\n'+(count===3?'This is my final follow-up on my earlier email. If the timing is not right, I will leave it here.':'I wanted to follow up on my earlier email. Would you like to continue the conversation or arrange a short meeting?')+'\n\nIf you would prefer no further sales emails, reply “stop emailing me”.\n\nKind regards,\nTovi Donninger\nFounder, Donninger.AI';
      // A final DB check narrows the window between cancellation and dispatch.
      const active=await db.prepare("SELECT lead_id FROM sales_followups WHERE organisation_id=? AND lead_id=? AND status='sending'").bind(org,id).first();
      if (!active || await isSuppressed(db,org,lead.email)) continue;
      await send(env,{action:'send_sales_outreach_email',email:lead.email,lead_name:lead.first_name,message_id:messageId,subject:'Re: '+original.subject.replace(/^Re:\s*/i,''),body});
      await db.batch([
        db.prepare("INSERT OR IGNORE INTO sales_messages (id,organisation_id,lead_id,direction,channel,subject,body,status,recipient,provider,sent_at,created_by) VALUES (?,?,?,'outbound','email',?,?,'sent',?,'gmail',?,'Follow-up scheduler')").bind(messageId,org,id,'Re: '+original.subject.replace(/^Re:\s*/i,''),body,lead.email,now.toISOString()),
        db.prepare("INSERT INTO sales_activity (id,organisation_id,lead_id,activity_type,details_json,actor) VALUES (?,?,?,'sales_followup_sent',?,'Follow-up scheduler')").bind(crypto.randomUUID(),org,id,JSON.stringify({message_id:messageId,number:count})),
        db.prepare("UPDATE sales_followups SET sent_count=?,status=?,next_at=?,reason=? WHERE organisation_id=? AND lead_id=? AND status='sending'").bind(count,count>=3?'completed':'active',new Date(now.getTime()+7*86400000).toISOString(),count>=3?'Maximum three follow-ups reached':'',org,id)
      ]);
    } catch(error) {
      // Delivery may have succeeded: require inspection, never blindly retry.
      await db.prepare("UPDATE sales_followups SET status='needs_review',reason=? WHERE organisation_id=? AND lead_id=? AND status='sending'").bind(String(error.message||error).slice(0,300),org,id).run();
      console.error('Follow-up needs review',id,String(error.message||error));
    }
  }
}
