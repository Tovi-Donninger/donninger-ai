// Development administrator portal. Authentication is verified by the Cloudflare Worker.
const modules = [
 {id:"sales",icon:"↗",name:"Sales & Lead Generation",desc:"Capture enquiries, qualify prospects, coordinate follow-ups and manage the sales pipeline.",workflow:["Capture leads from connected forms and inboxes","Create prospect records and assign ownership","Prepare qualification summaries and follow-up tasks","Coordinate meetings, proposals and pipeline reporting"],automate:["Lead capture and CRM record creation","Acknowledgements, routing and reminders","Meeting scheduling and pipeline updates"],assist:["Prospect research and qualification summaries","Outreach drafts, call notes and proposal preparation"],integrations:["Email and calendars","CRM platforms","Website forms and telephony"],stage:"Workflow specification drafted"},
 {id:"marketing",icon:"✳",name:"Marketing",desc:"Plan campaigns, prepare content, coordinate publishing and measure marketing performance.",workflow:["Define campaign goals, audience and timeframe","Prepare briefs, content and draft campaign assets","Route material for review and approval","Schedule approved content and report results"],automate:["Content calendars and campaign scheduling","Consent-based email sequences","Lead routing and campaign reporting"],assist:["Campaign concepts and content drafts","SEO briefs, audience research and performance analysis"],integrations:["Social platforms","Email marketing tools","Analytics and content management"],stage:"Workflow specification drafted"},
 {id:"customer-service",icon:"◌",name:"Customer Service",desc:"Manage customer enquiries, routine answers, support cases and escalation.",workflow:["Receive customer requests through connected channels","Categorise cases and collect required information","Answer approved routine questions or route to staff","Track resolution and prepare service reports"],automate:["Ticket creation and case routing","Approved FAQ responses and status updates","Reminders and escalation alerts"],assist:["Conversation summaries and response drafts","Complaint trends and knowledge-base suggestions"],integrations:["Shared inboxes and chat","Helpdesk platforms","Order and booking systems"],stage:"Workflow specification drafted"},
 {id:"hr-recruitment",icon:"♙",name:"HR & Recruitment",desc:"Manage recruitment, onboarding, employee records, payroll coordination and performance management throughout the employee lifecycle.",workflow:["Create vacancy briefs, adverts and candidate application channels","Organise CVs, candidate profiles and human-reviewed shortlist recommendations","Coordinate interviews and controlled onboarding","Create an individual employee file and central employee database","Synchronise approved employee and payroll changes with finance","Set role-specific KPIs, assessment criteria and review schedules","Record performance results, feedback, evidence and development plans"],automate:["Vacancy and advert preparation; application intake and CV extraction","Candidate tracking, interview scheduling and onboarding checklists","Employee file creation, document and training records","Approved payroll-field synchronisation and change reminders","KPI review schedules, assessment forms and performance record filing"],assist:["Evidence-based candidate summaries and shortlist preparation","Role-specific KPI and assessment-criteria suggestions","Performance review summaries and development-plan drafts"],integrations:["Recruitment platforms and email inboxes","Employee document storage and HR systems","Finance and payroll platforms"],stage:"Extended employee lifecycle specification drafted",note:"Employee records, payroll information and performance data are sensitive. Payroll changes and employment decisions require authorised human approval. Integration availability depends on the selected provider and its API."},
 {id:"finance",icon:"₪",name:"Finance & Accounting",desc:"Organise invoices, expenses, approvals, payment follow-ups and management finance information.",workflow:["Collect invoices, receipts and finance documents","Extract fields and validate required information","Route records for approval and accounting review","Track due dates, exceptions and financial summaries"],automate:["Document intake and invoice data extraction","Approval routing and payment reminders","Expense summaries and reporting preparation"],assist:["Expense-category suggestions and variance summaries","Cash-flow forecast drafts and month-end commentary"],integrations:["Accounting software","Bank feeds where supported","Document storage and finance inboxes"],stage:"Workflow specification drafted"},
 {id:"operations",icon:"⌘",name:"Operations & Administration",desc:"Coordinate internal requests, tasks, documents, reminders and repeatable business processes.",workflow:["Receive a request or form submission","Validate information and create a task or case","Assign owner, due date and approval steps","Track completion, exceptions and process performance"],automate:["Task creation and routing","Document generation and filing","Deadline reminders and recurring workflows"],assist:["SOP drafts and handover summaries","Bottleneck identification and process improvement suggestions"],integrations:["Email and calendars","Document storage","Business management applications"],stage:"Workflow specification drafted"},
 {id:"stock-logistics",icon:"▤",name:"Stock, Suppliers & Logistics",desc:"Monitor inventory, supplier communications, purchase preparation and delivery progress.",workflow:["Read inventory and order data from agreed systems","Monitor stock thresholds and supplier milestones","Prepare replenishment requests and supplier follow-ups","Track deliveries, discrepancies and stock reports"],automate:["Low-stock alerts and draft purchase orders","Supplier updates and delivery reminders","Verified stock record updates and reporting"],assist:["Demand forecasts and reorder suggestions","Supplier comparisons and discrepancy analysis"],integrations:["Inventory and warehouse systems","Supplier communication","Shipping and purchasing tools"],stage:"Workflow specification drafted"},
 {id:"management",icon:"▥",name:"Management & Reporting",desc:"Bring business information together, monitor KPIs and prepare management reports.",workflow:["Collect approved data from connected departments","Validate KPI definitions and highlight missing information","Refresh dashboards and recurring reports","Prepare summaries and action lists for management review"],automate:["Scheduled KPI collection and dashboard refresh","Recurring report packs and action reminders","Exception alerts and task tracking"],assist:["Performance summaries and variance explanations","Scenario drafts and management questions"],integrations:["CRM and sales systems","Finance and HR data","Operations and analytics platforms"],stage:"Workflow specification drafted"}
];
const loginScreen=document.getElementById("loginScreen"),dashboardScreen=document.getElementById("dashboardScreen");
const loginForm=document.getElementById("loginForm"),loginError=document.getElementById("loginError");
function showDashboard(){loginScreen.hidden=true;dashboardScreen.hidden=false;renderCards();showView("overview");}
function showLogin(){dashboardScreen.hidden=true;loginScreen.hidden=false;}
async function signOut(){try{await fetch("/api/auth/logout",{method:"POST",headers:{"content-type":"application/json"}});}finally{showLogin();}}
loginForm.addEventListener("submit",async e=>{e.preventDefault();const button=loginForm.querySelector('button[type="submit"]');button.disabled=true;button.textContent="Signing in…";loginError.textContent="";try{const response=await fetch("/api/auth/login",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email:document.getElementById("loginEmail").value,password:document.getElementById("loginPassword").value})});const result=await response.json();if(!response.ok)throw new Error(result.error||"Unable to sign in.");loginForm.reset();showDashboard();}catch(error){loginError.textContent=error.message;}finally{button.disabled=false;button.innerHTML='Sign in <span>→</span>';}});
function renderCards(){const makeCard=m=>{const b=document.createElement("button");b.className="function-card";b.type="button";b.innerHTML='<div class="function-card-top"><span class="module-icon">'+m.icon+'</span><span class="module-status">IN DEVELOPMENT</span></div><h3>'+m.name+'</h3><p>'+m.desc+'</p><div class="function-card-bottom"><span>Open workspace →</span><small>Admin access</small></div>';b.addEventListener("click",()=>showFunction(m.id));return b;};document.getElementById("overviewFunctionGrid").replaceChildren(...modules.map(makeCard));document.getElementById("allFunctionGrid").replaceChildren(...modules.map(makeCard));}
function showView(view){document.querySelectorAll(".view-section").forEach(el=>el.hidden=true);const target=document.getElementById("view-"+view);if(target)target.hidden=false;document.querySelectorAll(".side-link").forEach(b=>b.classList.toggle("active",b.dataset.view===view));const names={overview:"Overview",functions:"Automation functions",assessments:"Assessments & reports",clients:"Clients",integrations:"Integrations",activity:"Activity & tasks",settings:"Settings",detail:"Function workspace"};document.getElementById("currentSection").textContent=names[view]||"Overview";document.getElementById("sidebar").classList.remove("open");}
function list(items){return '<ul class="detail-list">'+items.map(x=>'<li>'+x+'</li>').join("")+'</ul>';}
function showFunction(id){const m=modules.find(x=>x.id===id);if(!m)return;if(id==="sales"){showSalesWorkspace();return;}document.getElementById("functionDetailContent").innerHTML='<div class="detail-hero"><div class="dash-eyebrow">BUSINESS FUNCTION / ADMIN WORKSPACE</div><h1>'+m.name+'</h1><p>'+m.desc+'</p></div><div class="detail-grid"><article class="dash-card"><div class="dash-eyebrow">PRACTICAL WORKFLOW</div><h3>How the system will work</h3>'+list(m.workflow)+'</article><article class="dash-card"><div class="dash-eyebrow">AUTOMATABLE ACTIVITIES</div><h3>Tasks the platform will handle</h3>'+list(m.automate)+'</article><article class="dash-card"><div class="dash-eyebrow">AI-ASSISTED ACTIVITIES</div><h3>Prepared for human review</h3>'+list(m.assist)+'</article><article class="dash-card"><div class="dash-eyebrow">CONNECTED SYSTEMS</div><h3>Planned integrations</h3>'+list(m.integrations)+'<div class="detail-note">'+(m.note||"Connections will be selected and configured based on the customer’s existing tools, API availability and permissions.")+'</div></article></div><div class="detail-note"><strong>Current development status:</strong> '+m.stage+'. The module is a product specification and dashboard preview; its live automation engine and integrations have not yet been built.</div>';showView("detail");}
document.querySelectorAll(".side-link").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
document.querySelectorAll("[data-goto]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.goto)));
document.getElementById("backToFunctions").addEventListener("click",()=>showView("functions"));
document.getElementById("logoutButton").addEventListener("click",signOut);
document.getElementById("mobileMenu").addEventListener("click",()=>document.getElementById("sidebar").classList.toggle("open"));
fetch("/api/auth/session",{credentials:"same-origin"}).then(r=>r.ok?r.json():{authenticated:false}).then(s=>s.authenticated?showDashboard():showLogin()).catch(showLogin);

function escapeHtml(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
async function showSalesWorkspace(){
 const host=document.getElementById("functionDetailContent");
 host.innerHTML='<div class="detail-hero"><div class="dash-eyebrow">SALES / LEAD GENERATION</div><h1>Sales & Lead Generation</h1><p>Capture prospects, record what they need, review lead quality and manage the sales pipeline. Outbound contact is not enabled yet.</p></div><section class="dash-card sales-pipeline-card"><div class="sales-leads-heading"><div><div class="dash-eyebrow">LIVE SALES JOURNEY</div><h3>Sales Pipeline</h3></div><button class="text-action" id="refreshSalesPipeline" type="button">Refresh ↻</button></div><p id="salesPipelineCount" class="sales-lead-count">Loading pipeline…</p><div id="salesPipelineBoard" class="sales-pipeline-board"></div></section><section class="dash-card sales-import-card"><div class="dash-eyebrow">BULK IMPORT</div><h3>Import leads from CSV</h3><p>Drop a CSV file here or choose one from your computer. Review the recognised rows before importing. This demo file contains fictional contacts only.</p><div class="sales-dropzone" id="salesDropzone"><span class="sales-drop-icon">⇧</span><strong>Drag and drop your CSV file here</strong><small>Use the Import leads button to browse for a file · CSV only</small><input id="salesCsvFile" type="file" accept=".csv,text/csv" hidden></div><div class="sales-import-actions"><a href="/test-data/sales-leads-demo.csv" download>Download sample test data ↓</a><button class="portal-button portal-button-primary" id="importSalesCsv" type="button">Import leads <span>＋</span></button></div><p id="salesImportMessage" class="sales-form-message" role="status">No file selected.</p><div id="salesImportPreview" class="sales-import-preview"></div></section><div class="sales-workspace-grid"><section class="dash-card"><div class="dash-eyebrow">ADD A PROSPECT</div><h3>Create lead record</h3><form id="salesLeadForm" class="sales-lead-form"><label>First name <input name="first_name" required maxlength="100"></label><label>Last name <input name="last_name" maxlength="100"></label><label>Company <input name="company" maxlength="160"></label><label>Email <input name="email" type="email" maxlength="254"></label><label>Phone <input name="phone" maxlength="40"></label><label>Job title <input name="job_title" maxlength="120"></label><label class="sales-wide">What does this prospect need? <textarea name="customer_need" rows="3" maxlength="2000" placeholder="Briefly describe the product or service they are interested in…"></textarea></label><label>Contact permission <select name="contact_permission"><option value="unknown">Unknown — do not contact</option><option value="consent_given">Consent recorded</option><option value="existing_customer_basis">Existing customer basis</option><option value="legitimate_interest_reviewed">Legitimate interest reviewed</option><option value="do_not_contact">Do not contact</option></select></label><button class="portal-button portal-button-primary" type="submit">Save lead <span>＋</span></button><p id="salesLeadFormMessage" class="sales-form-message" role="status"></p></form></section><section class="dash-card sales-outreach-card"><div class="dash-eyebrow">AI OUTREACH CENTRE</div><h3>Personalised prospect engagement</h3><p>Once qualification and channel integrations are built, this workspace will prepare tailored emails, SMS and WhatsApp messages using each prospect’s recorded needs.</p><ul class="detail-list"><li>AI qualification against the customer&#39;s ideal customer profile</li><li>Human review and approval before first outbound contact</li><li>Timestamped messages, delivery status and reply history</li><li>Response intent, pricing/demo requests and follow-up tracking</li></ul><span class="status-tag">DATABASE READY · AI & MESSAGING NOT CONNECTED</span></section></div><section class="dash-card bulk-qualification-card"><div class="dash-eyebrow">AI SALES INTELLIGENCE</div><h3>Qualify leads</h3><p>Describe in your own words what makes a prospect a qualified lead for this business. The AI will turn your description into clear criteria, assess every imported lead and save the matches to a separate Qualified Leads database.</p><label class="qualified-description-label" for="qualifiedLeadDefinition">What does a qualified lead look like?</label><textarea id="qualifiedLeadDefinition" rows="5" placeholder="Example: A qualified lead is a business with 10–100 employees that needs help generating more sales leads, has an active sales team and is looking to improve its lead conversion process. The person should be involved in sales or business decisions."></textarea><div class="bulk-qualify-actions"><button class="portal-button portal-button-primary" id="qualifyAllLeads" type="button">Qualify Leads <span>✦</span></button><span id="bulkQualificationStatus" role="status">Processed leads move to Qualified Leads or Unqualified Leads after their results are saved.</span></div><div id="extractedQualificationRules" class="extracted-qualification-rules"></div><div id="bulkQualificationSummary" class="bulk-qualification-summary"></div></section><section class="dash-card qualified-leads-card"><div class="sales-leads-heading"><div><div class="dash-eyebrow">MATCHED PROSPECTS</div><h3>Qualified Leads</h3></div><div class="bulk-qualify-actions"><button class="portal-button portal-button-primary" id="contactQualifiedLeads" type="button">Contact Leads <span>✉</span></button><button class="text-action" id="refreshQualifiedLeads" type="button">Refresh ↻</button></div></div><p id="qualifiedLeadCount" class="sales-lead-count">Loading qualified leads…</p><div id="qualifiedLeadTable" class="sales-table-wrap"></div><div id="salesOutreachComposer" class="sales-outreach-composer" hidden><p class="sales-form-message" id="salesOutreachStatus" role="status">Personalised emails are prepared and sent to selected qualified leads with recorded email consent.</p><div id="salesOutreachDraftList"></div></div></section><section class="dash-card needs-review-leads-card"><div class="sales-leads-heading"><div><div class="dash-eyebrow">HUMAN REVIEW REQUIRED</div><h3>Needs Review</h3></div><button class="text-action" id="refreshReviewLeads" type="button">Refresh ↻</button></div><p id="reviewLeadCount" class="sales-lead-count">Loading leads for review…</p><div id="reviewLeadTable" class="sales-table-wrap"></div></section><section class="dash-card unqualified-leads-card"><div class="sales-leads-heading"><div><div class="dash-eyebrow">ASSESSED PROSPECTS</div><h3>Unqualified Leads</h3></div><button class="text-action" id="refreshUnqualifiedLeads" type="button">Refresh ↻</button></div><p id="unqualifiedLeadCount" class="sales-lead-count">Loading unqualified leads…</p><div id="unqualifiedLeadTable" class="sales-table-wrap"></div></section><section class="dash-card sales-leads-card"><div class="sales-leads-heading"><div><div class="dash-eyebrow">DATABASE</div><h3>New Leads</h3></div><button class="text-action" id="refreshSalesLeads" type="button">Refresh ↻</button></div><p id="salesLeadCount" class="sales-lead-count">Loading leads…</p><div id="salesLeadTable" class="sales-table-wrap"></div><div class="bulk-qualify-actions new-leads-qualify-action"><button class="portal-button portal-button-primary" id="qualifyNewLeads" type="button">Qualify These Leads <span>✦</span></button><span>Uses the qualification criteria entered in AI Sales Intelligence.</span></div></section>';
 const csvInput=document.getElementById("salesCsvFile"),dropzone=document.getElementById("salesDropzone"),importButton=document.getElementById("importSalesCsv"),importMessage=document.getElementById("salesImportMessage"),preview=document.getElementById("salesImportPreview");
 let pendingCsvRows=[];
 function parseCsv(text){
  const rows=[];let row=[],cell="",quoted=false;
  for(let i=0;i<text.length;i++){const ch=text[i];if(quoted){if(ch==='"'&&text[i+1]==='"'){cell+='"';i++;}else if(ch==='"')quoted=false;else cell+=ch;}else if(ch==='"')quoted=true;else if(ch===","){row.push(cell.trim());cell="";}else if(ch==="\n"||ch==="\r"){if(ch==="\r"&&text[i+1]==="\n")i++;row.push(cell.trim());if(row.some(v=>v!==""))rows.push(row);row=[];cell="";}else cell+=ch;}
  row.push(cell.trim());if(row.some(v=>v!==""))rows.push(row);if(!rows.length)return [];
  const headers=rows.shift().map(h=>h.replace(/^\uFEFF/,"").trim().toLowerCase());
  return rows.map(values=>Object.fromEntries(headers.map((h,i)=>[h,values[i]||""]))).filter(r=>r.first_name);
 }
 function previewCsv(file){
  if(!file)return; if(!file.name.toLowerCase().endsWith(".csv")){importMessage.textContent="Please choose a .csv file.";return;}
  const reader=new FileReader();reader.onload=()=>{try{pendingCsvRows=parseCsv(String(reader.result||""));if(!pendingCsvRows.length)throw new Error("No lead rows found. Check the CSV headers and contents.");const required=["first_name","last_name","company","email","phone","job_title","customer_need","contact_permission","source"];const missing=required.filter(h=>!(Object.keys(pendingCsvRows[0]||{}).includes(h)));if(missing.length)throw new Error("Missing CSV columns: "+missing.join(", "));importButton.disabled=false;importButton.innerHTML="Import "+pendingCsvRows.length+" leads <span>＋</span>";importMessage.textContent=pendingCsvRows.length+" lead rows ready to import.";preview.innerHTML="<strong>Preview: "+pendingCsvRows.length+" prospects</strong><ul>"+pendingCsvRows.slice(0,5).map(r=>"<li>"+escapeHtml((r.first_name+" "+r.last_name).trim())+" · "+escapeHtml(r.company||"No company")+" · "+escapeHtml(r.contact_permission||"unknown").replaceAll("_"," ")+"</li>").join("")+"</ul>";}catch(error){pendingCsvRows=[];importButton.disabled=true;importMessage.textContent=error.message;preview.innerHTML="";}};reader.onerror=()=>{importMessage.textContent="Could not read that file.";};reader.readAsText(file);
 }
 csvInput.addEventListener("change",()=>previewCsv(csvInput.files[0]));
 importButton.addEventListener("click",()=>{if(pendingCsvRows.length)return;csvInput.click();});
 dropzone.addEventListener("click",()=>{if(!pendingCsvRows.length)csvInput.click();});
 ["dragenter","dragover"].forEach(type=>dropzone.addEventListener(type,event=>{event.preventDefault();dropzone.classList.add("is-dragging");}));
 ["dragleave","drop"].forEach(type=>dropzone.addEventListener(type,event=>{event.preventDefault();dropzone.classList.remove("is-dragging");}));
 dropzone.addEventListener("drop",event=>{const file=event.dataTransfer.files[0];if(file){try{csvInput.files=event.dataTransfer.files;}catch{}previewCsv(file);}});
 importButton.addEventListener("click",async()=>{if(!pendingCsvRows.length)return;importButton.disabled=true;importMessage.textContent="Importing "+pendingCsvRows.length+" leads…";try{const response=await fetch("/api/sales/leads/import",{method:"POST",headers:{"content-type":"application/json"},credentials:"same-origin",body:JSON.stringify({leads:pendingCsvRows})});const result=await response.json();if(!response.ok)throw new Error(result.error||"Import failed.");importMessage.textContent="Import complete: "+result.imported+" imported, "+result.failed+" failed.";if(result.errors?.length)importMessage.textContent+=" "+result.errors.slice(0,3).join(" ");pendingCsvRows=[];csvInput.value="";preview.innerHTML="";importButton.disabled=false;importButton.innerHTML="Import leads <span>＋</span>";await loadSalesLeads();}catch(error){importMessage.textContent=error.message;importButton.disabled=false;importButton.innerHTML="Import leads <span>＋</span>";}});
 const form=document.getElementById("salesLeadForm");
 form.addEventListener("submit",async event=>{
  event.preventDefault();const button=form.querySelector('button[type="submit"]');const msg=document.getElementById("salesLeadFormMessage");button.disabled=true;msg.textContent="Saving…";
  const data=Object.fromEntries(new FormData(form).entries());
  try{const response=await fetch("/api/sales/leads",{method:"POST",headers:{"content-type":"application/json"},credentials:"same-origin",body:JSON.stringify(data)});const result=await response.json();if(!response.ok)throw new Error(result.error||"Could not save lead.");form.reset();msg.textContent="Lead saved successfully.";await loadSalesLeads();}
  catch(error){msg.textContent=error.message;}finally{button.disabled=false;}
 });
 host.insertAdjacentHTML("beforeend", `<section class="dash-card sales-appointments-card"><div class="sales-leads-heading"><div><div class="dash-eyebrow">MEETING MANAGEMENT</div><h3>Meeting Requests</h3></div><button class="text-action" id="refreshSalesAppointments" type="button">Refresh ↻</button></div><p id="salesAppointmentsCount" class="sales-lead-count">Loading meeting requests…</p><div id="salesAppointmentsBoard" class="sales-pipeline-board"></div></section>`);
 document.getElementById("refreshSalesLeads").addEventListener("click",loadSalesLeads);
 document.getElementById("qualifyNewLeads").addEventListener("click",()=>{const definition=document.getElementById("qualifiedLeadDefinition"),qualify=document.getElementById("qualifyAllLeads");document.getElementById("bulk-qualification-card")?.scrollIntoView({behavior:"smooth",block:"center"});definition?.scrollIntoView({behavior:"smooth",block:"center"});if(!definition?.value.trim()){definition?.focus();document.getElementById("bulkQualificationStatus").textContent="First describe what makes a lead qualified. Then click Qualify Leads to assess the new leads.";return;}qualify?.click();});
 document.getElementById("refreshSalesAppointments")?.addEventListener("click",loadSalesAppointments);
   await loadSalesAppointments();
 showView("detail");
 await loadSalesLeads();
 await loadQualifiedLeads();
 await loadReviewLeads();
 await loadUnqualifiedLeads();
 await loadSalesPipeline();
}
function addLeadTableSearch(host,placeholder){
 if(!host)return;
 const table=host.querySelector("table");
 if(!table)return;
 const search=document.createElement("input");
 search.type="search";
 search.className="sales-table-search";
 search.placeholder=placeholder||"Search leads…";
 search.setAttribute("aria-label",search.placeholder);
 search.addEventListener("input",()=>{
  const term=search.value.trim().toLowerCase();
  table.querySelectorAll("tbody tr").forEach(row=>{
   row.hidden=term!==""&&!row.textContent.toLowerCase().includes(term);
  });
 });
 host.insertBefore(search,host.firstChild);
}

async function loadSalesLeads(){
 const count=document.getElementById("salesLeadCount"),table=document.getElementById("salesLeadTable");if(!count||!table)return;
 count.textContent="Loading leads…";table.innerHTML="";
 try{const response=await fetch("/api/sales/leads",{credentials:"same-origin"});const result=await response.json();if(!response.ok)throw new Error(result.error||"Could not load leads.");
 const leads=result.leads||[];count.textContent=leads.length+" new lead"+(leads.length===1?"":"s")+" awaiting qualification";
 if(!leads.length){table.innerHTML='<div class="sales-empty">No leads yet. Add your first prospect using the form above.</div>';return;}
 table.innerHTML='<table class="sales-lead-table"><thead><tr><th>Prospect</th><th>Company</th><th>Contact</th><th>Need</th><th>Stage</th><th>Permission</th></tr></thead><tbody>'+leads.map(l=>'<tr><td><strong>'+escapeHtml((l.first_name+" "+(l.last_name||"")).trim())+'</strong><small>'+escapeHtml(l.job_title||"")+'</small></td><td>'+escapeHtml(l.company||"—")+'</td><td>'+escapeHtml(l.email||l.phone||"—")+'</td><td>'+escapeHtml(l.customer_need||"Not recorded")+'</td><td><span class="sales-stage">'+escapeHtml(l.status)+'</span></td><td>'+escapeHtml((l.contact_permission||"unknown").replaceAll("_"," "))+'<button type="button" class="text-action edit-lead-button" data-lead-id="'+escapeHtml(l.id)+'">Edit</button></td></tr>').join("")+'</tbody></table>';
  addLeadTableSearch(table,"Search new leads by name, company or email…");
 }catch(error){count.textContent="Unable to load leads";table.innerHTML='<div class="sales-empty">'+escapeHtml(error.message)+'</div>';}
}

async function loadSalesPipeline(){
 const count=document.getElementById('salesPipelineCount'),host=document.getElementById('salesPipelineBoard');if(!host)return;count.textContent='Loading sales pipeline…';
 try{const r=await fetch('/api/sales/pipeline',{credentials:'same-origin',cache:'no-store'}),d=await r.json();if(!r.ok)throw new Error(d.error||'Could not load sales pipeline.');const rows=d.pipeline_leads||[];count.textContent=rows.length+' leads currently in active sales stages';
 const stages=[['contacted','Contacted Leads'],['meeting_requested','Meeting Requested'],['meeting_confirmed','Meeting Confirmed'],['meeting_completed','Meeting Completed'],['converted','Converted'],['lost','Lost']];
 host.innerHTML=stages.map(([stage,label])=>{const items=rows.filter(v=>v.pipeline_stage===stage);const options=stages.filter(([value])=>value!==stage).map(([value,label])=>'<option value="'+value+'">'+label+'</option>').join('');return '<section class="sales-pipeline-column"><header><strong>'+label+'</strong><span>'+items.length+'</span></header>'+(items.length?items.map(v=>'<article class="sales-pipeline-lead"><strong>'+escapeHtml((v.first_name+' '+(v.last_name||'')).trim())+'</strong><small>'+escapeHtml(v.company||'')+' · '+escapeHtml(v.email||'')+'</small><p>'+escapeHtml(v.customer_need||'No customer need recorded')+'</p>'+(v.pipeline_stage==="meeting_requested"&&v.appointment_id?(()=>{let opts=[];try{opts=JSON.parse(v.meeting_options_json||"[]");if(!Array.isArray(opts))opts=[];}catch{}const tz=v.prospect_timezone||v.appointment_timezone||"Timezone not specified";const availability=v.availability_status==="available"?"Earliest available option checked":v.availability_status==="no_available_options"?"All proposed options conflict":v.availability_status==="needs_clarification"?"More date/time details required":"Calendar availability not checked yet";return '<div class="meeting-pipeline-details"><p><strong>Meeting request:</strong> '+escapeHtml(v.discussion_summary||"Prospect requested a meeting")+'</p><p><strong>Availability:</strong> '+escapeHtml(availability)+'</p><p><strong>Proposed time:</strong> '+escapeHtml(v.requested_start_at?new Date(v.requested_start_at).toLocaleString():"Not yet selected")+'</p><p><strong>Timezone:</strong> '+escapeHtml(tz)+'</p>'+(opts.length?'<p><strong>Other proposed options:</strong></p><ul>'+opts.map(o=>'<li>'+escapeHtml(o.start_iso?new Date(o.start_iso).toLocaleString(undefined,{timeZone:o.timezone||tz}):o.original_text||"")+' · '+escapeHtml(o.timezone||tz)+'</li>').join('')+'</ul>':"")+'</div>'})():"")+'<label>Update stage<select class="pipeline-stage-select" data-lead-id="'+escapeHtml(v.lead_id)+'"><option value="'+stage+'" selected>'+label+'</option>'+options+'</select></label><button type="button" class="sales-email-history-button" data-lead-id="'+escapeHtml(v.lead_id)+'">View email history</button><div class="sales-email-history" hidden></div></article>').join(''):'<div class="sales-empty-state">No leads in this stage.</div>')+'</section>';}).join('');
 }catch(e){count.textContent='Unable to load pipeline';host.textContent=e.message;}
}

async function loadSalesAppointments(){
 const count=document.getElementById("salesAppointmentsCount");
 const host=document.getElementById("salesAppointmentsBoard");
 if(!host||!count)return;

 count.textContent="Loading meeting requests…";
 host.innerHTML="";

 try{
  const r=await fetch("/api/sales/appointments",{credentials:"same-origin",cache:"no-store"});
  const d=await r.json();
  if(!r.ok)throw new Error(d.error||"Could not load meeting requests.");

  const rows=d.appointments||[];
  count.textContent=rows.length+" active or confirmed meeting"+(rows.length===1?"":"s");

  const groups=[
   ["Pending admin review",rows.filter(v=>v.status==="requested"&&!v.admin_accepted_at)],
   ["Awaiting client confirmation",rows.filter(v=>v.status==="requested"&&v.admin_accepted_at)],
   ["Confirmed meetings",rows.filter(v=>v.status==="confirmed")]
  ];

  host.innerHTML=groups.map(([label,items])=>
   '<section class="sales-pipeline-column">'+
    '<header><strong>'+label+'</strong><span>'+items.length+'</span></header>'+
    (items.length?items.map(v=>{
     const name=(v.first_name+" "+(v.last_name||"")).trim();
     const date=v.requested_start_at?new Date(v.requested_start_at).toLocaleString():"Time not yet proposed";
     const timezone=v.prospect_timezone||v.timezone||"Timezone not specified";
     let options=[];try{options=JSON.parse(v.meeting_options_json||"[]");if(!Array.isArray(options))options=[];}catch{options=[];}
     const optionsHtml=options.length?'<p><strong>All proposed options (earliest first):</strong></p><ul>'+options.map(o=>'<li>'+escapeHtml(new Date(o.start_iso).toLocaleString(undefined,{timeZone:o.timezone||timezone}))+' · '+escapeHtml(o.timezone||timezone)+'</li>').join('')+'</ul>':'';
     const availabilityLabel=v.availability_status==="available"?"Earliest available option checked":v.availability_status==="no_available_options"?"All proposed options conflict":v.availability_status==="needs_clarification"?"More date/time details required":"Calendar availability not checked yet";
     const email=v.latest_email_body?'<p>'+escapeHtml(v.latest_email_body.slice(0,500))+'</p>':"";
     return '<article class="sales-pipeline-lead">'+
      '<strong>'+escapeHtml(name)+'</strong>'+
      '<small>'+escapeHtml(v.company||"")+' · '+escapeHtml(v.email||"")+'</small>'+
      '<p><strong>Proposed time:</strong> '+escapeHtml(date)+'</p>'+
      (v.discussion_summary?'<p><strong>Client proposal:</strong> '+escapeHtml(v.discussion_summary)+'</p>':"")+
      '<small>Timezone: '+escapeHtml(timezone)+'</small>'+
      '<small>'+escapeHtml(availabilityLabel)+'</small>'+
      optionsHtml+
      (v.availability_status==="no_available_options"?'<p><strong>Action required:</strong> Request new meeting times; all current options conflict with the calendar.</p>':"")+
      '<p><strong>Latest email:</strong> '+escapeHtml(v.latest_email_subject||"No email subject")+'</p>'+
      email+
      '<small>Admin approval: '+(v.admin_accepted_at?"Recorded":"Not yet recorded")+
      ' · Client acceptance: '+(v.prospect_accepted_at?"Recorded":"Not yet recorded")+'</small>'+
      (v.status==="requested"&&!v.admin_accepted_at&&v.availability_status==="available"&&Boolean(v.requested_start_at)?'<div class="meeting-approval-actions"><button type="button" class="portal-button portal-button-primary meeting-decision-button" data-appointment-id="'+escapeHtml(v.appointment_id)+'" data-decision="accept">Approve &amp; email client</button><button type="button" class="portal-button portal-button-secondary meeting-decision-button" data-appointment-id="'+escapeHtml(v.appointment_id)+'" data-decision="decline">Decline</button></div>':"")+
      (v.status==="requested"&&v.admin_accepted_at?'<p class="sales-stage">Waiting for the client to confirm'+(v.confirmation_email_sent_at?'':' · confirmation email needs attention')+'</p>':"")+
     '</article>';
    }).join(""):'<div class="sales-empty-state">No meetings in this group.</div>')+
   '</section>'
  ).join("");

 }catch(e){
  count.textContent="Unable to load meeting requests";
  host.textContent=e.message;
 }
}

async function loadUnqualifiedLeads(){
 const count=document.getElementById("unqualifiedLeadCount"),host=document.getElementById("unqualifiedLeadTable");if(!host)return;count.textContent="Loading unqualified leads…";
 try{const r=await fetch("/api/sales/unqualified-leads",{credentials:"same-origin",cache:"no-store"}),d=await r.json();if(!r.ok)throw new Error(d.error||"Could not load unqualified leads.");const rows=d.unqualified_leads||[];count.textContent=rows.length+" unqualified lead"+(rows.length===1?"":"s");
 host.innerHTML=rows.length?'<table class="sales-lead-table"><thead><tr><th>Prospect</th><th>Company</th><th>Contact</th><th>Fit score</th><th>Assessment</th><th>Action</th></tr></thead><tbody>'+rows.map(v=>'<tr><td><strong>'+escapeHtml(v.first_name+" "+(v.last_name||""))+'</strong><small>'+escapeHtml(v.job_title||"")+'</small></td><td>'+escapeHtml(v.company||"—")+'</td><td>'+escapeHtml(v.email||v.phone||"—") +'</td><td>'+Number(v.fit_score||0)+'/100</td><td>'+escapeHtml(v.qualification_summary||"—")+'</td><td><button type="button" class="text-action edit-lead-button" data-lead-id="'+escapeHtml(v.lead_id)+'">Edit</button><button class="text-action move-to-review-button" type="button" data-lead-id="'+escapeHtml(v.lead_id)+'">Move to review</button></td></tr>').join("")+'</tbody></table>':'<div class="sales-empty-state">No unqualified leads yet. Leads will appear here after assessment.</div>';
  addLeadTableSearch(host,"Search unqualified leads by name, company or email…");
 }catch(e){count.textContent="Unable to load unqualified leads";host.textContent=e.message;}
}
async function loadReviewLeads(){
 const count=document.getElementById("reviewLeadCount"),host=document.getElementById("reviewLeadTable");if(!host)return;count.textContent="Loading leads for review…";
 try{const r=await fetch("/api/sales/review-leads",{credentials:"same-origin",cache:"no-store"}),d=await r.json();if(!r.ok)throw new Error(d.error||"Could not load leads for review.");const rows=d.review_leads||[];count.textContent=rows.length+" lead"+(rows.length===1?"":"s")+" need human review";
  host.innerHTML=rows.length?'<table class="sales-lead-table"><thead><tr><th>Prospect</th><th>Company</th><th>Contact</th><th>Fit score</th><th>Why review?</th><th>Next step</th><th>Decision</th></tr></thead><tbody>'+rows.map(v=>'<tr><td><strong>'+escapeHtml(v.first_name+" "+(v.last_name||""))+'</strong><small>'+escapeHtml(v.job_title||"")+'</small></td><td>'+escapeHtml(v.company||"—")+'</td><td>'+escapeHtml(v.email||v.phone||"—")+'</td><td>'+Number(v.fit_score||0)+'/100</td><td>'+escapeHtml(v.qualification_summary||"More information is needed")+(v.customer_need?'<small>Need: '+escapeHtml(v.customer_need)+'</small>':'<small>Customer need not yet established</small>')+'</td><td>'+escapeHtml((()=>{try{return JSON.parse(v.qualification_json||"{}").recommended_next_action||"Contact or research to establish needs"}catch{return "Contact or research to establish needs"}})())+'</td><td><button type="button" class="text-action edit-lead-button" data-lead-id="'+escapeHtml(v.lead_id)+'">Edit</button><button class="text-action approve-review-lead-button" type="button" data-lead-id="'+escapeHtml(v.lead_id)+'">Approve &amp; Move to Qualified</button><button class="text-action reject-review-lead-button" type="button" data-lead-id="'+escapeHtml(v.lead_id)+'">Reject &amp; Move to Unqualified</button></td></tr>').join("")+'</tbody></table>':'<div class="sales-empty-state">No leads currently need review.</div>';
  addLeadTableSearch(host,"Search reviewed leads by name, company or email…");
 }catch(e){count.textContent="Unable to load review leads";host.textContent=e.message;}
}
async function loadQualificationProfile(){
 const form=document.getElementById("salesIcpForm");if(!form)return;const status=document.getElementById("salesIcpStatus");
 try{const r=await fetch("/api/sales/qualification-profile",{credentials:"same-origin"}),d=await r.json();if(!r.ok)throw new Error(d.error||"Could not load profile.");Object.entries(d.profile?.criteria||{}).forEach(([k,v])=>{const f=form.elements.namedItem(k);if(f)f.value=v||"";});status.textContent=d.profile?"Profile version "+d.profile.version+" loaded.":"No profile saved yet.";}catch(e){status.textContent=e.message;}
 const select=document.getElementById("qualificationLeadSelect");if(select){const r=await fetch("/api/sales/leads",{credentials:"same-origin"}),d=await r.json();if(r.ok)select.innerHTML='<option value="">Select a prospect…</option>'+(d.leads||[]).map(l=>'<option value="'+escapeHtml(l.id)+'">'+escapeHtml((l.first_name+" "+(l.last_name||"")).trim())+(l.company?" · "+escapeHtml(l.company):"")+'</option>').join("");}
}
document.getElementById("functionDetailContent").addEventListener("change",async e=>{
 const select=e.target.closest(".pipeline-stage-select");if(!select)return;const leadId=select.dataset.leadId,stage=select.value;select.disabled=true;
 try{const r=await fetch("/api/sales/pipeline",{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify({lead_id:leadId,stage})}),d=await r.json();if(!r.ok)throw new Error(d.error||"Could not update pipeline stage.");await loadSalesPipeline();await loadQualifiedLeads();await loadUnqualifiedLeads();}
 catch(err){const status=document.getElementById("salesPipelineCount");if(status)status.textContent="Pipeline update failed: "+err.message;await loadSalesPipeline();}
 finally{select.disabled=false;}
});
document.getElementById("functionDetailContent").addEventListener("submit",async e=>{
 if(e.target.id!=="salesIcpForm")return;e.preventDefault();const form=e.target,b=form.querySelector('button[type="submit"]'),s=document.getElementById("salesIcpStatus");b.disabled=true;s.textContent="Saving…";
 try{const r=await fetch("/api/sales/qualification-profile",{method:"PUT",headers:{"content-type":"application/json"},credentials:"same-origin",body:JSON.stringify({criteria:Object.fromEntries(new FormData(form).entries())})}),d=await r.json();if(!r.ok)throw new Error(d.error||"Could not save profile.");s.textContent="Saved · Profile version "+d.profile.version;}catch(err){s.textContent=err.message;}finally{b.disabled=false;}
});
document.getElementById("functionDetailContent").addEventListener("click",async e=>{
 const editButton=e.target.closest(".edit-lead-button");
 if(editButton){
  const leadId=editButton.dataset.leadId;editButton.disabled=true;
  try{
   const response=await fetch("/api/sales/leads?id="+encodeURIComponent(leadId),{credentials:"same-origin",cache:"no-store"}),data=await response.json();
   if(!response.ok)throw new Error(data.error||"Could not load lead details.");
   const lead=data.lead,overlay=document.createElement("div");overlay.className="lead-edit-overlay";
   overlay.innerHTML='<section class="lead-edit-dialog" role="dialog" aria-modal="true" aria-labelledby="leadEditTitle"><div class="lead-edit-heading"><div><div class="dash-eyebrow">LEAD DATABASE</div><h2 id="leadEditTitle">Edit lead details</h2></div><button type="button" class="lead-edit-close" aria-label="Close">×</button></div><form id="leadEditForm" class="lead-edit-form"><label>First name<input name="first_name" required maxlength="100"></label><label>Last name<input name="last_name" maxlength="100"></label><label>Company<input name="company" maxlength="160"></label><label>Email<input name="email" type="email" maxlength="254"></label><label>Phone<input name="phone" maxlength="40"></label><label>Job title<input name="job_title" maxlength="120"></label><label class="lead-edit-wide">Customer need<textarea name="customer_need" rows="4" maxlength="2000"></textarea></label><label class="lead-edit-wide">Contact permission<select name="contact_permission"><option value="unknown">Unknown — do not contact</option><option value="consent_given">Consent recorded</option><option value="existing_customer_basis">Existing customer basis</option><option value="legitimate_interest_reviewed">Legitimate interest reviewed</option><option value="do_not_contact">Do not contact</option></select></label><p class="lead-edit-message" role="status"></p><div class="lead-edit-actions"><button type="button" class="portal-button portal-button-secondary lead-edit-cancel">Cancel</button><button type="submit" class="portal-button portal-button-primary">Save changes</button></div></form></section>';
   document.body.appendChild(overlay);const form=overlay.querySelector("#leadEditForm");
   ["first_name","last_name","company","email","phone","job_title","customer_need","contact_permission"].forEach(key=>{form.elements.namedItem(key).value=lead[key]||(key==="contact_permission"?"unknown":"");});
   const close=()=>overlay.remove();overlay.querySelector(".lead-edit-close").addEventListener("click",close);overlay.querySelector(".lead-edit-cancel").addEventListener("click",close);overlay.addEventListener("click",event=>{if(event.target===overlay)close();});
   form.addEventListener("submit",async event=>{event.preventDefault();const save=form.querySelector('button[type="submit"]'),message=form.querySelector(".lead-edit-message");save.disabled=true;message.textContent="Saving changes…";
    try{const payload=Object.fromEntries(new FormData(form).entries());payload.id=leadId;const update=await fetch("/api/sales/leads",{method:"PUT",credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify(payload)}),result=await update.json();if(!update.ok)throw new Error(result.error||"Could not update lead.");message.textContent="Changes saved.";await Promise.all([loadSalesLeads(),loadQualifiedLeads(),loadReviewLeads(),loadUnqualifiedLeads(),loadSalesPipeline()]);setTimeout(close,450);}
    catch(error){message.textContent=error.message;save.disabled=false;}
   });
   form.elements.namedItem("first_name").focus();
  }catch(error){const count=document.getElementById("qualifiedLeadCount");if(count)count.textContent="Edit lead: "+error.message;}
  finally{editButton.disabled=false;}
  return;
 }
 const moveButton=e.target.closest(".move-to-review-button");
 if(moveButton){const leadId=moveButton.dataset.leadId;moveButton.disabled=true;try{const r=await fetch("/api/sales/review-leads",{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify({lead_id:leadId})});const responseText=await r.text();let d={};try{d=responseText?JSON.parse(responseText):{};}catch{throw new Error("The server returned an unexpected response (HTTP "+r.status+", "+(r.headers.get("content-type")||"unknown content type")+"). Please refresh and try again. If this continues, send this message to support.");}if(!r.ok)throw new Error(d.error||"Could not move this lead (HTTP "+r.status+").");if(d.success!==true)throw new Error(d.error||"The server did not confirm that the lead was moved.");await loadUnqualifiedLeads();await loadReviewLeads();}catch(error){moveButton.disabled=false;const count=document.getElementById("unqualifiedLeadCount");if(count)count.textContent=error.message;}return;}
 const approveReviewButton=e.target.closest(".approve-review-lead-button");
 if(approveReviewButton){
  const leadId=approveReviewButton.dataset.leadId;
  approveReviewButton.disabled=true;approveReviewButton.textContent="Approving…";
  const count=document.getElementById("reviewLeadCount");
  try{
   const r=await fetch("/api/sales/review-leads",{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify({action:"approve_qualified",lead_id:leadId})});
   const responseText=await r.text();let d={};try{d=responseText?JSON.parse(responseText):{};}catch{throw new Error("The server returned an unexpected response (HTTP "+r.status+"). Please refresh and try again.");}
   if(!r.ok)throw new Error(d.error||"Could not approve this lead (HTTP "+r.status+").");
   if(d.success!==true)throw new Error(d.error||"The server did not confirm approval.");
   await loadReviewLeads();await loadQualifiedLeads();await loadUnqualifiedLeads();await loadSalesPipeline();
  }catch(error){approveReviewButton.disabled=false;approveReviewButton.textContent="Approve & Move to Qualified";if(count)count.textContent=error.message;}
  return;
 }
 const rejectReviewButton=e.target.closest(".reject-review-lead-button");
 if(rejectReviewButton){
  const leadId=rejectReviewButton.dataset.leadId;
  rejectReviewButton.disabled=true;rejectReviewButton.textContent="Rejecting…";
  const count=document.getElementById("reviewLeadCount");
  try{
   const r=await fetch("/api/sales/review-leads",{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify({action:"reject_unqualified",lead_id:leadId})});
   const responseText=await r.text();let d={};try{d=responseText?JSON.parse(responseText):{};}catch{throw new Error("The server returned an unexpected response (HTTP "+r.status+"). Please refresh and try again.");}
   if(!r.ok)throw new Error(d.error||"Could not reject this lead (HTTP "+r.status+").");
   if(d.success!==true)throw new Error(d.error||"The server did not confirm rejection.");
   await loadReviewLeads();await loadQualifiedLeads();await loadUnqualifiedLeads();await loadSalesPipeline();
  }catch(error){rejectReviewButton.disabled=false;rejectReviewButton.textContent="Reject & Move to Unqualified";if(count)count.textContent=error.message;}
  return;
 }
 const meetingButton=e.target.closest(".meeting-decision-button");
 if(meetingButton){
  const appointmentId=meetingButton.dataset.appointmentId,decision=meetingButton.dataset.decision;
  const card=meetingButton.closest(".sales-pipeline-lead"),buttons=card?.querySelectorAll(".meeting-decision-button");
  buttons?.forEach(button=>button.disabled=true);
  const count=document.getElementById("salesAppointmentsCount");
  try{
   const response=await fetch("/api/sales/appointments/respond",{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify({appointment_id:appointmentId,decision})});
   const result=await response.json();
   if(!response.ok)throw new Error(result.error||"Could not process the meeting decision.");
   await loadSalesAppointments();await loadSalesPipeline();
   if(result.email_sent===false)throw new Error(result.error||"Approval saved, but the client email was not sent.");
   if(count)count.textContent=result.message||"Meeting decision saved.";
  }catch(error){
   if(count)count.textContent="Meeting action: "+error.message;
   buttons?.forEach(button=>button.disabled=false);
  }
  return;
 }
 const historyButton=e.target.closest(".sales-email-history-button");
 if(historyButton){
  const panel=historyButton.nextElementSibling;
  const leadId=historyButton.dataset.leadId;
  if(panel.hidden){
   panel.hidden=false;
   panel.innerHTML="Loading email history…";
   historyButton.disabled=true;
   try{
    const response=await fetch("/api/sales/email-history?lead_id="+encodeURIComponent(leadId),{credentials:"same-origin",cache:"no-store"});
    const data=await response.json();
    if(!response.ok)throw new Error(data.error||"Could not load email history.");
    const messages=data.messages||[];
    const activities=(data.activities||[]).filter(a=>a.activity_type==="sales_email_reply_received");
    const analyses=new Map();
    activities.forEach(a=>{
     try{
      const details=JSON.parse(a.details_json||"{}");
      analyses.set(details.gmail_message_id,details);
     }catch{}
    });
    panel.innerHTML=messages.length?messages.map(m=>{
     const analysis=analyses.get(m.gmail_message_id)||{};
     return '<div class="sales-email-entry"><strong>'+escapeHtml(m.direction==="inbound"?"Incoming email":"Outgoing email")+'</strong><small>'+escapeHtml(m.received_at||m.created_at||"")+'</small><p><strong>From:</strong> '+escapeHtml(m.sender_email||(m.direction==="outbound"?"Donninger.AI":""))+'</p><p><strong>To:</strong> '+escapeHtml(m.recipient_email||"")+'</p><p><strong>Subject:</strong> '+escapeHtml(m.subject||"(No subject)")+'</p><p>'+escapeHtml(m.body_text||"")+'</p>'+(analysis.summary?'<p><strong>AI summary:</strong> '+escapeHtml(analysis.summary)+'</p>':"")+(analysis.key_points?.length?'<p><strong>Key points:</strong> '+escapeHtml(analysis.key_points.join(" · "))+'</p>':"")+(analysis.suggested_reply?'<p><strong>Suggested reply (draft only):</strong><br>'+escapeHtml(analysis.suggested_reply)+'</p>':"")+'</div>';
    }).join(""):'<p>No emails recorded for this lead yet.</p>';
   }catch(error){
    panel.textContent=error.message;
   }finally{
    historyButton.disabled=false;
   }
  }else{
   panel.hidden=true;
  }
  return;
 }
 if(e.target.closest("#selectAllQualifiedLeads")){
  const master=document.getElementById("selectAllQualifiedLeads"),checks=[...document.querySelectorAll(".qualified-lead-select")];checks.forEach(box=>box.checked=master.checked);
  const selected=checks.filter(box=>box.checked).length,button=document.getElementById("contactQualifiedLeads");if(button){button.disabled=selected===0;button.textContent="Contact Selected Leads ("+selected+") ✉";}
 }
 if(e.target.closest(".qualified-lead-select")){
  const checks=[...document.querySelectorAll(".qualified-lead-select")],selected=checks.filter(box=>box.checked).length,master=document.getElementById("selectAllQualifiedLeads"),button=document.getElementById("contactQualifiedLeads");
  if(master){master.checked=selected===checks.length&&checks.length>0;master.indeterminate=selected>0&&selected<checks.length;}
  if(button){button.disabled=selected===0;button.textContent="Contact Selected Leads ("+selected+") ✉";}
 }
 if(e.target.closest("#contactQualifiedLeads")){
  const button=document.getElementById("contactQualifiedLeads"),composer=document.getElementById("salesOutreachComposer"),status=document.getElementById("salesOutreachStatus"),list=document.getElementById("salesOutreachDraftList");
  if(!button||!composer||!status||!list)return;
  const selected=[...document.querySelectorAll(".qualified-lead-select:checked")].map(box=>box.dataset.leadId).filter(Boolean);
  if(!selected.length){status.textContent="Select at least one qualified lead to contact.";composer.hidden=false;return;}
  button.disabled=true;composer.hidden=false;list.innerHTML="";
  status.textContent="Preparing personalised emails for "+selected.length+" selected lead(s) and sending through Gmail…";
  try{
   const r=await fetch("/api/sales/outreach/send",{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify({lead_ids:selected})});
   const d=await r.json();
   if(!r.ok&&!d.sent?.length){const detail=(Array.isArray(d.skipped)&&d.skipped.map(item=>item.reason).filter(Boolean).join(" "))||(Array.isArray(d.failed)&&d.failed.map(item=>item.reason).filter(Boolean).join(" "))||d.error||d.message;throw new Error(detail||"The email service rejected the request without providing a reason. No email was confirmed as sent.");}
   const sent=Array.isArray(d.sent)?d.sent:[],failed=Array.isArray(d.failed)?d.failed:[],skipped=Array.isArray(d.skipped)?d.skipped:[];
   const cards=sent.map(item=>'<article class="sales-email-draft-card"><strong>'+escapeHtml(item.name||"Lead")+'</strong><p><strong>To:</strong> '+escapeHtml(item.recipient||"")+'</p><p><strong>Subject:</strong> '+escapeHtml(item.subject||"")+'</p><span class="status-tag">SENT · GMAIL CONFIRMED</span></article>');
   const issues=[...failed.map(item=>({label:"Not sent",item})),...skipped.map(item=>({label:"Skipped",item}))];
   const issueCards=issues.map(entry=>'<article class="sales-email-draft-card"><strong>'+entry.label+': '+escapeHtml(entry.item.lead_id||"Lead")+'</strong><p>'+escapeHtml(entry.item.reason||"No further details were provided.")+'</p></article>');
   list.innerHTML=cards.concat(issueCards).join("");
   status.textContent=d.message||sent.length+" email(s) sent; "+failed.length+" failed; "+skipped.length+" skipped.";
   composer.scrollIntoView({behavior:"smooth",block:"nearest"});
  }catch(error){status.textContent=error.message;}
  finally{button.disabled=false;}
 }
 if(e.target.closest("#qualifyAllLeads")){
  const b=document.getElementById("qualifyAllLeads"),desc=document.getElementById("qualifiedLeadDefinition"),status=document.getElementById("bulkQualificationStatus"),rules=document.getElementById("extractedQualificationRules"),summary=document.getElementById("bulkQualificationSummary");
  if(desc.value.trim().length<20){status.textContent="Please describe a qualified lead in at least 20 characters.";desc.focus();return;}
  b.disabled=true;b.textContent="Qualifying leads…";rules.innerHTML="";summary.innerHTML="";
  let elapsed=0,totalLeads=0,finalResult=null,streamError=null;
  const overlay=document.createElement("div");overlay.className="qualification-loading-overlay";overlay.setAttribute("role","dialog");overlay.setAttribute("aria-modal","true");overlay.setAttribute("aria-live","polite");
  overlay.innerHTML='<div class="qualification-loading-panel"><div class="qualification-loading-orbit"><div class="qualification-orbit-core">D</div><span class="qualification-orbit-dot"></span></div><div class="qualification-loading-eyebrow">DONNINGER.AI · SALES INTELLIGENCE</div><h2>Turning leads into opportunities</h2><p class="qualification-loading-copy" id="qualificationLoadingCopy">Preparing your lead records for assessment…</p><div class="qualification-progress-track"><div class="qualification-progress-bar" id="qualificationProgressBar"></div></div><div class="qualification-progress-meta"><strong id="qualificationProgressCount">Preparing…</strong><span id="qualificationProgressPercent">0%</span></div><div class="qualification-loading-steps"><span data-step="1" class="active"><i>01</i> Read leads</span><span data-step="2"><i>02</i> Build rules</span><span data-step="3"><i>03</i> Assess fit</span><span data-step="4"><i>04</i> Save results</span></div><div class="qualification-loading-stage" id="qualificationLoadingStage">Connecting securely to the AI engine…</div><div class="qualification-loading-time" id="qualificationLoadingTime">Elapsed: 0:00</div><div class="qualification-insight"><span>WHAT THE AI CHECKS</span><p id="qualificationInsightText">A strong business fit is not automatically a sign that someone is ready to buy.</p></div><p class="qualification-loading-note">Your original lead records remain untouched. Only matching prospects are added to Qualified Leads.</p></div>';
  document.body.appendChild(overlay);
  const $=id=>overlay.querySelector("#"+id),timerLabel=$("qualificationLoadingTime"),stageLabel=$("qualificationLoadingStage"),copyLabel=$("qualificationLoadingCopy"),bar=$("qualificationProgressBar"),countLabel=$("qualificationProgressCount"),percentLabel=$("qualificationProgressPercent");
  const formatElapsed=n=>Math.floor(n/60)+":"+String(n%60).padStart(2,"0");
  const setStep=n=>overlay.querySelectorAll("[data-step]").forEach(el=>{const step=Number(el.dataset.step);el.classList.toggle("active",step===n);el.classList.toggle("done",step<n);});
  const insights=["A strong business fit is not automatically a sign that someone is ready to buy.","Missing information stays marked as unknown. The AI must not invent facts.","A real business with an unclear need goes to Needs Review, not Unqualified.","Only explicit disqualifiers should send a genuine business prospect to Unqualified."];
  let insightIndex=0;
  const insightTimer=setInterval(()=>{insightIndex=(insightIndex+1)%insights.length;$("qualificationInsightText").textContent=insights[insightIndex];},6500);
  const progressTimer=setInterval(()=>{elapsed++;timerLabel.textContent="Elapsed: "+formatElapsed(elapsed);},1000);
  const updateProgress=(processed,total,qualified,notQualified,failed,needsReview)=>{
   totalLeads=total||totalLeads;const pct=totalLeads?Math.round(processed/totalLeads*92):0;
   bar.style.width=pct+"%";percentLabel.textContent=pct+"%";countLabel.textContent=processed+" of "+totalLeads+" leads processed";
   stageLabel.textContent=qualified+" qualified · "+(needsReview||0)+" needs review · "+notQualified+" unqualified"+(failed?" · "+failed+" failed":"");
   status.textContent="AI assessed "+processed+" of "+totalLeads+" leads.";
  };
  status.textContent="AI qualification is starting…";
  try{
   const r=await fetch("/api/sales/qualify-batch",{method:"POST",headers:{"content-type":"application/json"},credentials:"same-origin",cache:"no-store",body:JSON.stringify({description:desc.value})});
   const contentType=r.headers.get("content-type")||"";
   if(!contentType.includes("application/x-ndjson")){const d=await r.json().catch(()=>({}));throw new Error(d.error||"The qualification service did not start.");}
   const reader=r.body.getReader(),decoder=new TextDecoder();let buffer="";
   const handleEvent=event=>{
    if(event.type==="started"){totalLeads=event.total||0;copyLabel.textContent="Reading "+totalLeads+" lead records and preparing the assessment…";countLabel.textContent="0 of "+totalLeads+" leads processed";setStep(1);}
    else if(event.type==="criteria"){
     setStep(3);copyLabel.textContent="Your qualification rules are ready. The AI is now checking each prospect against them.";stageLabel.textContent="Qualification criteria extracted · Profile "+event.profile_version;
     const c=event.criteria||{},list=a=>Array.isArray(a)&&a.length?'<ul>'+a.map(x=>'<li>'+escapeHtml(x)+'</li>').join("")+'</ul>':'<p>None specified.</p>';
     rules.innerHTML='<h4>Criteria extracted by AI</h4><p>'+escapeHtml(c.definition||"")+'</p><div class="extracted-rule-grid"><div><strong>Must have</strong>'+list(c.must_have)+'</div><div><strong>Positive signals</strong>'+list(c.strong_signals)+'</div><div><strong>Disqualifiers</strong>'+list(c.disqualifiers)+'</div><div><strong>Unknown information</strong><p>'+escapeHtml(c.unknown_handling||"Treated as unknown.")+'</p></div></div><p class="qualification-footnote">Threshold: '+escapeHtml(c.qualification_threshold||70)+'/100 · Profile version '+escapeHtml(event.profile_version)+'</p>';
    }else if(event.type==="progress"){setStep(3);copyLabel.textContent="Assessing prospect fit, matching signals and missing information…";updateProgress(event.processed,event.total,event.qualified_count||0,event.not_qualified_count||0,event.failed_count||0,event.needs_review_count||0);}
    else if(event.type==="complete"){finalResult=event.result;setStep(4);bar.style.width="100%";percentLabel.textContent="100%";countLabel.textContent=finalResult.checked+" of "+finalResult.source_lead_count+" leads assessed";copyLabel.textContent="Assessment complete. Your results have been saved.";stageLabel.textContent="Saving complete · "+finalResult.qualified_count+" qualified prospects";}
    else if(event.type==="error"){streamError=event.error||"Qualification failed.";}
   };
   while(true){const {value,done}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});const lines=buffer.split("\n");buffer=lines.pop()||"";for(const line of lines){if(line.trim())handleEvent(JSON.parse(line));}}
   buffer+=decoder.decode();if(buffer.trim())handleEvent(JSON.parse(buffer));
   if(streamError)throw new Error(streamError);
   if(!finalResult)throw new Error("The qualification stream ended before the results were confirmed. Refresh Qualified Leads before retrying.");
   const d=finalResult,stats='<div class="bulk-qualification-stats"><div><strong>'+d.checked+'</strong><span>Checked</span></div><div><strong>'+d.qualified_count+'</strong><span>Qualified</span></div><div><strong>'+(d.needs_review_count||0)+'</strong><span>Needs review</span></div><div><strong>'+d.not_qualified_count+'</strong><span>Unqualified</span></div><div><strong>'+d.failed_count+'</strong><span>Failed</span></div></div>';
   const rejected=(d.not_qualified||[]).map(x=>'<li><strong>'+escapeHtml(x.name||"Lead")+'</strong> · '+escapeHtml(x.fit_score)+'/100 — '+escapeHtml(x.summary||"Did not meet the criteria")+'</li>').join("");
   const review=(d.needs_review||[]).map(x=>'<li><strong>'+escapeHtml(x.name||"Lead")+'</strong> · '+escapeHtml(x.fit_score)+'/100 — '+escapeHtml(x.summary||"More information is needed")+"</li>").join("");
   const failed=(d.errors||[]).map(x=>'<li><strong>'+escapeHtml(x.name||x.lead_id||"Lead")+'</strong>: '+escapeHtml(x.error||"Unknown error")+'</li>').join("");
   summary.innerHTML=stats+'<p>Source database: '+escapeHtml(d.source_lead_count??d.checked)+' Lead Records · Model: '+escapeHtml(d.model||"Gemini")+'</p>'+(d.qualified_count?'<p>Qualified leads were saved to the separate database.</p>':'<p>No leads were confidently qualified. Check Needs Review before treating any prospect as unsuitable.</p>')+(review?'<details open><summary>Needs human review ('+(d.needs_review_count||0)+'</summary><ul>'+review+'</ul></details>':"")+(rejected?'<details open><summary>Unqualified ('+d.not_qualified_count+')</summary><ul>'+rejected+'</ul></details>':"")+(failed?'<details open><summary>Failed assessments ('+d.failed_count+')</summary><ul>'+failed+'</ul></details>':"");
   status.textContent="Qualification finished: "+d.checked+" records checked.";await loadSalesLeads();await loadQualifiedLeads();await loadReviewLeads();await loadUnqualifiedLeads();await loadSalesPipeline();
  }catch(err){status.textContent=err.message;summary.innerHTML='<p class="qualification-error">'+escapeHtml(err.message)+'</p>';}finally{clearInterval(progressTimer);clearInterval(insightTimer);overlay.classList.add("qualification-loading-finished");setTimeout(()=>overlay.remove(),900);b.disabled=false;b.innerHTML='Qualify Leads <span>✦</span>';}
 }
 if(e.target.closest("#refreshQualifiedLeads"))loadQualifiedLeads();
 if(e.target.closest("#refreshUnqualifiedLeads"))loadUnqualifiedLeads();
 if(e.target.closest("#refreshReviewLeads"))loadReviewLeads();
 if(e.target.closest("#refreshSalesPipeline"))loadSalesPipeline();
});


async function loadQualifiedLeads(){
 const count=document.getElementById("qualifiedLeadCount"),host=document.getElementById("qualifiedLeadTable");if(!host)return;count.textContent="Loading qualified leads…";
 try{
  const r=await fetch("/api/sales/qualified-leads",{credentials:"same-origin",cache:"no-store"}),d=await r.json();if(!r.ok)throw new Error(d.error||"Could not load qualified leads.");
  const rows=d.qualified_leads||[];count.textContent=rows.length+" qualified leads saved";
  host.innerHTML=rows.length?'<table class="sales-lead-table"><thead><tr><th><input type="checkbox" id="selectAllQualifiedLeads" aria-label="Select all qualified leads"></th><th>Prospect</th><th>Company</th><th>Contact</th><th>Fit score</th><th>Priority</th><th>Qualification</th></tr></thead><tbody>'+rows.map(v=>'<tr><td><input type="checkbox" class="qualified-lead-select" aria-label="Select '+escapeHtml(v.first_name+" "+(v.last_name||""))+'" data-lead-id="'+escapeHtml(v.lead_id)+'" data-email="'+escapeHtml(v.email||"")+'"></td><td><strong>'+escapeHtml(v.first_name+" "+(v.last_name||""))+'</strong></td><td>'+escapeHtml(v.company||"—")+'</td><td>'+escapeHtml(v.email||v.phone||"—")+'<button type="button" class="text-action edit-lead-button" data-lead-id="'+escapeHtml(v.lead_id)+'">Edit</button></td><td><strong>'+v.fit_score+'/100</strong></td><td><span class="priority-'+escapeHtml(v.priority)+'">'+escapeHtml(v.priority)+'</span></td><td>'+escapeHtml(v.qualification_summary||"—")+'</td></tr>').join("")+'</tbody></table>':'<div class="sales-empty-state">No leads have been saved as qualified yet. Run Qualify Leads to see the detailed assessment breakdown above.</div>';
  const bulk=document.getElementById("contactQualifiedLeads");if(bulk){bulk.disabled=!rows.length;bulk.textContent="Contact Selected Leads (0) ✉";}
   addLeadTableSearch(host,"Search qualified leads by name, company or email…");
 }catch(e){count.textContent="Unable to load qualified leads";host.textContent=e.message;}
}
