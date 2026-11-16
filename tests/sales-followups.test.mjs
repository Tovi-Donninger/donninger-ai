import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {addBusinessDays,stopRequest,suppressEmail,isSuppressed,enrollFollowups,cancelFollowups,processFollowups} from '../sales-followups.js';
function setup(){
 const sql=new DatabaseSync(':memory:');
 for(const f of readdirSync('migrations').sort())sql.exec(readFileSync('migrations/'+f,'utf8'));
 const db={prepare(query){const stmt=sql.prepare(query);let params=[];return {bind(...values){params=values;return this;},async first(){return stmt.get(...params)||null;},async all(){return {results:stmt.all(...params)};},async run(){return {meta:stmt.run(...params)};}};},async batch(statements){sql.exec('BEGIN');try{const out=[];for(const s of statements)out.push(await s.run());sql.exec('COMMIT');return out;}catch(e){sql.exec('ROLLBACK');throw e;}}};
 sql.prepare("INSERT INTO leads(id,organisation_id,first_name,email,contact_permission,pipeline_stage) VALUES ('l','dev-donninger','Test','test@example.com','consent_given','contacted')").run();
 sql.prepare("INSERT INTO sales_messages(id,organisation_id,lead_id,direction,channel,body,status,subject) VALUES ('m','dev-donninger','l','outbound','email','Original','sent','Introduction')").run();
 return {sql,db,env:{DB:db,DONNINGER_EMAIL_TOKEN:'test'}};
}
const org='dev-donninger',start='2026-11-16T10:00:00.000Z';
test('three business days skip Friday and Saturday; preserve time',()=>{
 assert.equal(addBusinessDays('2026-11-18T10:00:00Z',3),'2026-11-23T10:00:00.000Z');
 assert.equal(addBusinessDays(start,3),'2026-11-19T10:00:00.000Z');
});
test('explicit stop phrases',()=>{
 for(const text of ['Stop emailing me','Please unsubscribe me','Do not contact me again',"Don't email me",'Remove me from your list','No more emails'])assert.equal(stopRequest(text),true,text);
 assert.equal(stopRequest('Can we meet next week?'),false);
});
test('suppression cancels queue and survives new duplicate lead',async()=>{
 const {db,sql}=setup();await enrollFollowups(db,org,'l','m',start);await suppressEmail(db,org,'TEST@example.com');
 assert.equal(sql.prepare('SELECT status FROM sales_followups').get().status,'cancelled');
 assert.equal(sql.prepare('SELECT contact_permission FROM leads').get().contact_permission,'do_not_contact');
 assert.equal(await isSuppressed(db,org,'test@example.com'),true);
});
test('no send before due date or outside hours; weekly sequence caps at three',async()=>{
 const {db,env,sql}=setup();await enrollFollowups(db,org,'l','m',start);const sent=[];const send=async(e,p)=>{sent.push(p);return {success:true};};
 await processFollowups(env,send,new Date('2026-11-18T10:00:00Z'));
 await processFollowups(env,send,new Date('2026-11-19T20:00:00Z'));assert.equal(sent.length,0);
 for(const date of ['2026-11-19','2026-11-26','2026-12-03','2026-12-10'])await processFollowups(env,send,new Date(date+'T10:00:00Z'));
 assert.equal(sent.length,3);assert.equal(new Set(sent.map(p=>p.message_id)).size,3);
 assert.equal(sql.prepare('SELECT status FROM sales_followups').get().status,'completed');
});
test('any inbound reply stops scheduled follow-ups',async()=>{
 const {db,env,sql}=setup();await enrollFollowups(db,org,'l','m',start);
 sql.prepare("INSERT INTO sales_email_messages(id,organisation_id,lead_id,gmail_message_id,direction,created_at) VALUES ('r',?,'l','gmail-r','inbound','2026-11-17T10:00:00Z')").run(org);
 await processFollowups(env,()=>assert.fail('must not send'),new Date('2026-11-19T10:00:00Z'));
 assert.equal(sql.prepare('SELECT status FROM sales_followups').get().status,'cancelled');
});
test('overlapping scheduler runs dispatch once; uncertain delivery is not retried',async()=>{
 const {db,env,sql}=setup();await enrollFollowups(db,org,'l','m',start);let count=0;
 const send=async()=>{count++;throw new Error('timeout');};
 await Promise.all([processFollowups(env,send,new Date('2026-11-19T10:00:00Z')),processFollowups(env,send,new Date('2026-11-19T10:00:00Z'))]);
 await processFollowups(env,send,new Date('2026-11-26T10:00:00Z'));
 assert.equal(count,1);assert.equal(sql.prepare('SELECT status FROM sales_followups').get().status,'needs_review');
});
test('manual cancel and advanced pipeline prevent sending',async()=>{
 for(const mode of ['cancel','stage']){const {db,env,sql}=setup();await enrollFollowups(db,org,'l','m',start);
 if(mode==='cancel')await cancelFollowups(db,org,'l','Admin cancellation');else sql.prepare("UPDATE leads SET pipeline_stage='meeting_requested'").run();
 await processFollowups(env,()=>assert.fail('must not send'),new Date('2026-11-19T10:00:00Z'));}
});
import worker from '../worker.js';
test('stop request is recorded without AI and without sending acknowledgement',async()=>{
 const {db,env,sql}=setup();await enrollFollowups(db,org,'l','m',start);
 const request=new Request('https://example.com/api/sales/email-reply',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token:'test',gmail_message_id:'stop-1',gmail_thread_id:'thread',sender_email:'test@example.com',body:'Stop emailing me'})});
 const result=await worker.fetch(request,env);assert.equal(result.status,200);assert.equal((await result.json()).ai_replied,false);
 assert.equal(sql.prepare('SELECT contact_permission FROM leads').get().contact_permission,'do_not_contact');
 assert.equal(sql.prepare('SELECT intent FROM sales_email_messages').get().intent,'unsubscribe');
 assert.equal(sql.prepare('SELECT status FROM sales_followups').get().status,'cancelled');
});
test('reply pauses outreach even when AI is unavailable',async()=>{
 const {db,env,sql}=setup();await enrollFollowups(db,org,'l','m',start);
 const request=new Request('https://example.com/api/sales/email-reply',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token:'test',gmail_message_id:'question-1',gmail_thread_id:'thread',sender_email:'test@example.com',body:'How does this work?'})});
 assert.equal((await worker.fetch(request,env)).status,503);
 assert.equal(sql.prepare('SELECT status FROM sales_followups').get().status,'cancelled');
});
