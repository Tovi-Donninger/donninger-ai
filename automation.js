const functionPages = {
  sales: {
    title:'Sales & Lead Generation Automation',
    intro:'Turn incoming interest into an organised, consistent sales process — from the first enquiry to the next follow-up.',
    overview:'Sales teams can lose valuable time moving information between inboxes, spreadsheets and customer systems. We map how enquiries arrive, how leads are qualified and how follow-up happens, then design workflows that reduce manual administration and help your team respond consistently.',
    tasks:['Capture enquiries from website forms and other connected channels in one organised lead record.','Send an immediate acknowledgement and route each enquiry to the right person or team.','Use agreed criteria to organise and prioritise leads for human review.','Create follow-up tasks and reminders when a prospect has not received a response.','Prepare draft emails, call summaries, meeting notes and quote information.','Update pipeline stages and produce routine sales activity reports.'],
    method:['Map your current enquiry sources, sales stages and hand-off points.','Agree lead fields, qualification rules, response templates and approval steps.','Connect suitable forms, inboxes and customer-management tools.','Test the workflow with real scenarios and refine it with your team.','Track response time, follow-up completion and conversion trends.'],
    oversight:'Your team keeps control of relationship-building, pricing, negotiation and final sales decisions. AI-generated lead scores or draft communications should support judgement, not make commitments or send sensitive offers without an agreed approval process.',
    outcomes:['Faster first response','Fewer missed follow-ups','Clearer pipeline visibility','More selling time']
  },
  marketing: {
    title:'Marketing Automation',
    intro:'Make marketing more consistent and measurable, while keeping your brand voice and strategy in human hands.',
    overview:'Marketing often involves repeating the same coordination work across content calendars, email lists, campaigns and reports. We identify where information is copied or tasks are delayed, then create a practical system to help plan, produce, distribute and measure marketing activity.',
    tasks:['Build and maintain a shared content and campaign calendar.','Create first drafts of social posts, email campaigns and marketing variations from approved brand guidance.','Schedule approved content across supported channels.','Organise incoming campaign leads and route them to sales.','Trigger welcome, information and follow-up email sequences where consent and applicable rules allow.','Compile campaign performance and lead-source reports.'],
    method:['Review your audience, channels, brand guidelines and current campaign process.','Choose the repetitive coordination tasks that are safe and useful to automate.','Create reusable content workflows, approval steps and campaign templates.','Connect supported marketing tools and test scheduling, tracking and hand-offs.','Review engagement and qualified-lead metrics to improve future campaigns.'],
    oversight:'People remain responsible for positioning, brand reputation, factual claims, creative direction and final approval. Campaigns must respect consent, privacy, platform rules and local marketing laws. Automation should not mean sending more low-quality messages.',
    outcomes:['More consistent publishing','Less campaign administration','Faster content preparation','Clearer campaign measurement']
  },
  'customer-service': {
    title:'Customer Service Automation',
    intro:'Help customers get timely, consistent answers and make it easier for your team to manage requests from start to resolution.',
    overview:'Customer service teams repeatedly answer common questions, search for order information and transfer requests between people. We organise reliable information and design assisted workflows that handle routine steps while making it clear when a person needs to take over.',
    tasks:['Answer approved frequently asked questions using a maintained knowledge base.','Collect key details before a request reaches a team member.','Categorise and route incoming support requests by topic or urgency.','Send acknowledgement messages and status updates for supported processes.','Create summaries of customer conversations and suggested next actions.','Send feedback requests after a case is resolved.'],
    method:['Review enquiry channels, common request types and escalation rules.','Create or organise an approved source of customer-facing information.','Design response flows, routing rules and clear human hand-offs.','Test accuracy, edge cases and escalation behaviour before launch.','Monitor resolution time, repeat contacts and customer feedback.'],
    oversight:'A human should handle complaints, sensitive personal information, unusual cases, refunds outside agreed rules and situations requiring empathy or discretion. AI responses need clear boundaries and an easy route to a real person.',
    outcomes:['Quicker routine responses','More consistent information','Better request visibility','Less repetitive support work']
  },
  'hr-recruitment': {
    title:'HR & Recruitment Automation',
    intro:'Reduce coordination and administration across recruitment and employee processes, while keeping people decisions human.',
    overview:'Recruitment and HR administration involve many repeated communications, documents, reminders and scheduling steps. We can help organise those workflows so candidates and employees receive timely updates and HR teams spend less time chasing information.',
    tasks:['Organise applications and candidate information in a consistent tracker.','Acknowledge applications and send approved process updates.','Coordinate interview availability and send calendar invitations.','Prepare interview packs, role summaries and structured interview questions.','Generate onboarding checklists, document requests and reminder sequences.','Track routine training, policy acknowledgement and employee lifecycle tasks.'],
    method:['Map the candidate or employee journey and identify administrative bottlenecks.','Agree standard templates, access permissions and retention requirements.','Build scheduling, reminders, document and status workflows.','Test with sample records and confirm access is limited to authorised users.','Measure administration time, candidate communication delays and process completion.'],
    oversight:'Hiring, promotion, performance, disciplinary and termination decisions must remain with accountable people. Automated tools should not make opaque candidate rankings or decisions. HR data is sensitive and must be handled with appropriate privacy, security, fairness and legal safeguards.',
    outcomes:['Less scheduling administration','More timely candidate updates','Consistent onboarding steps','Clearer HR task tracking']
  },
  finance: {
    title:'Finance & Accounting Automation',
    intro:'Streamline routine finance administration and improve visibility, without handing financial control to an automated system.',
    overview:'Many finance workflows rely on collecting documents, entering data, checking due dates and chasing approvals. We design controlled workflows that reduce manual handling, organise records and flag items for review by the right person.',
    tasks:['Collect and organise invoices, receipts and supporting documents.','Extract draft transaction details for review before posting to accounting software.','Route invoices through agreed approval steps.','Prepare payment reminders and customer statement drafts.','Flag missing documents, unusual values or overdue items for human review.','Compile cash-flow, expense and accounts-receivable summaries from connected records.'],
    method:['Understand your current accounting tools, approval limits and document flow.','Identify repetitive data handling and establish clear validation rules.','Connect suitable document capture, task and accounting workflows.','Test accuracy, permissions, exception handling and audit trails.','Review processing time, overdue items and correction rates with your finance lead.'],
    oversight:'Payments, reconciliations, tax treatment, financial reporting and accounting judgements require authorised human review. We do not replace accountants or provide regulated financial advice. Access controls and audit trails are essential.',
    outcomes:['Less manual document handling','Faster approval routing','More visible overdue items','Better organised finance records']
  },
  operations: {
    title:'Operations & Administration Automation',
    intro:'Connect everyday processes so information moves between people and systems with less copying, chasing and rework.',
    overview:'Operational friction often comes from disconnected tools, repeated data entry and unclear ownership of routine tasks. We look at how work moves through the business and build practical workflows around the systems you already use where possible.',
    tasks:['Turn submitted forms or requests into assigned tasks with owners and due dates.','Move approved information between connected business tools.','Generate recurring documents, checklists and status updates.','Send reminders when a task is waiting, overdue or ready for the next step.','Create standard operating procedure drafts and searchable internal guidance.','Compile routine operational reports from available business data.'],
    method:['Map the process from request to completion, including exceptions and hand-offs.','Remove unnecessary steps before automating the remaining workflow.','Define data fields, permissions, ownership and notification rules.','Build and test the workflow with the people who use it.','Monitor completion time, errors and bottlenecks, then improve it.'],
    oversight:'Exceptions, safety issues, unusual customer situations and decisions with financial or legal consequences need a responsible person. Automation should make ownership clearer, not create a process nobody is accountable for.',
    outcomes:['Less duplicate data entry','Clearer task ownership','Fewer manual reminders','More reliable process visibility']
  },
  'stock-logistics': {
    title:'Stock, Suppliers & Logistics Automation',
    intro:'Improve visibility over stock, orders and supplier communication by connecting routine updates and alerts.',
    overview:'Stock and logistics teams often work across supplier emails, spreadsheets, order systems and delivery updates. We can help consolidate routine information and create alerts so people can spot issues earlier and spend less time checking status manually.',
    tasks:['Create low-stock alerts using agreed thresholds and reliable inventory data.','Prepare purchase-order drafts for review when replenishment conditions are met.','Track order milestones and flag late or missing supplier updates.','Send approved order and delivery status messages to customers or internal teams.','Maintain supplier contact, lead-time and order-history records.','Produce stock movement, fulfilment and supplier performance summaries.'],
    method:['Review inventory sources, supplier processes and order fulfilment steps.','Confirm which system is the trusted source for stock and order data.','Set alert thresholds, exception rules and approval points.','Connect available inventory, purchasing and communication tools.','Test stock accuracy, late-order scenarios and reporting before rollout.'],
    oversight:'People remain responsible for purchase commitments, supplier negotiations, stock adjustments and decisions where inaccurate data could disrupt operations. Automated orders should only be enabled after controls and approval limits are agreed.',
    outcomes:['Earlier stock warnings','Fewer manual status checks','More consistent supplier follow-up','Improved order visibility']
  },
  management: {
    title:'Management & Reporting Automation',
    intro:'Give decision-makers a clearer, more regular view of business performance without spending hours assembling reports.',
    overview:'Managers often collect updates from different departments, reconcile spreadsheets and prepare recurring reports by hand. We can help bring approved information together, highlight changes and prepare a consistent management view.',
    tasks:['Collect agreed metrics from connected systems and department updates.','Refresh recurring KPI dashboards and management reports.','Flag unusual movements or missing data for investigation.','Prepare meeting summaries, action lists and follow-up reminders.','Track strategic initiatives, owners, milestones and due dates.','Generate department-level snapshots using consistent definitions.'],
    method:['Agree which metrics matter, how they are defined and who owns each source.','Check data quality and resolve conflicting or duplicated records.','Build a repeatable reporting workflow and dashboard structure.','Add review steps for anomalies, commentary and management sign-off.','Refine the reporting pack based on decisions it helps the team make.'],
    oversight:'Dashboards and AI summaries can contain incomplete or misleading data if sources are wrong. Managers must review context, challenge anomalies and make the decisions. Sensitive commercial and employee data should only be available to authorised users.',
    outcomes:['Less time compiling reports','More consistent KPI visibility','Earlier awareness of exceptions','Clearer action tracking']
  }
};
const escapeText = value => String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const key = new URLSearchParams(window.location.search).get('function') || 'sales';
const item = functionPages[key] || functionPages.sales;
document.title = item.title + ' | Donninger.AI';
document.getElementById('functionTitle').textContent = item.title;
document.getElementById('functionIntro').textContent = item.intro;
document.getElementById('functionOverview').textContent = item.overview;
document.getElementById('functionOversight').textContent = item.oversight;
document.getElementById('functionTasks').innerHTML = item.tasks.map(task=>'<li>'+escapeText(task)+'</li>').join('');
document.getElementById('functionMethod').innerHTML = item.method.map(step=>'<li>'+escapeText(step)+'</li>').join('');
document.getElementById('functionOutcomes').innerHTML = item.outcomes.map((outcome,index)=>'<article><span>0'+(index+1)+'</span><strong>'+escapeText(outcome)+'</strong></article>').join('');
document.getElementById('year').textContent = new Date().getFullYear();
const functionMenuToggle = document.getElementById('functionMenuToggle');
const functionNav = document.querySelector('.function-page .nav');
functionMenuToggle.addEventListener('click',()=>{
  const isOpen = functionNav.classList.toggle('open');
  functionMenuToggle.setAttribute('aria-expanded',String(isOpen));
  functionMenuToggle.setAttribute('aria-label',isOpen?'Close navigation':'Open navigation');
});
functionNav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
  functionNav.classList.remove('open');
  functionMenuToggle.setAttribute('aria-expanded','false');
}));
