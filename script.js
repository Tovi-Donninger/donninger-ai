const menuToggle = document.getElementById('menuToggle');
const primaryNav = document.getElementById('primaryNav');
const modal = document.getElementById('assessmentModal');
const modalContent = document.getElementById('assessmentContent');
const closeAssessment = document.getElementById('assessmentClose');
let activeAssessment = null;
let currentStep = 0;
let answers = {};

menuToggle.addEventListener('click', () => {
  const open = primaryNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
primaryNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  primaryNav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));
document.getElementById('year').textContent = new Date().getFullYear();

const assessments = {
  business: {
    name: 'Business Automation Assessment',
    eyebrow: 'FOR EXISTING BUSINESSES',
    intro: 'Tell us how your business operates. We’ll identify practical opportunities to reduce repetitive work and improve day-to-day operations.',
    questions: [
      {id:'company',title:'First, what is your business called?',hint:'Optional — you can leave this blank.',type:'text',placeholder:'Business name'},
      {id:'industry',title:'Which industry best describes your business?',type:'select',required:true,options:['Professional services','Home services / trades','Retail / e-commerce','Healthcare / wellness','Hospitality / food','Technology / software','Manufacturing / logistics','Education / training','Real estate','Other']},
      {id:'team',title:'How many people work in the business?',type:'select',required:true,options:['Just me','2–5','6–15','16–50','51–200','More than 200']},
      {id:'functions',title:'Which parts of the business do you currently operate?',hint:'Select all that apply.',type:'checks',required:true,options:['Sales & lead generation','Marketing','Customer service','Human resources & recruitment','Finance & accounting','Operations & administration','Stock, suppliers & logistics','Management & reporting']},
      {id:'interestedFunctions',title:'Which business functions would you like to automate?',hint:'Select all that interest you, even if you are unsure whether automation is the right solution. We will compare your priorities with our independent recommendations.',type:'checks',required:true,options:['Sales & lead generation','Marketing','Customer service','Human resources & recruitment','Finance & accounting','Operations & administration','Stock, suppliers & logistics','Management & reporting']},
      {id:'tasks',title:'Where does your team spend too much time on repetitive work?',hint:'Choose any that sound familiar.',type:'checks',options:['Responding to enquiries and following up leads','Preparing quotes, proposals or invoices','Copying information between systems','Scheduling appointments, jobs or staff','Updating spreadsheets and reports','Answering common customer questions','Recruitment, onboarding or staff administration','Chasing payments and overdue accounts','Managing stock, orders or suppliers','We are not sure yet']},
      {id:'goal',title:'What would you most like to improve first?',type:'select',required:true,options:['Win more customers and respond faster','Reduce admin and operating costs','Improve customer experience','Make the team more productive','Improve visibility, reporting and decisions','Scale without immediately hiring more people','Not sure — show me the biggest opportunities']}
    ]
  },
  founder: {
    name: 'Entrepreneurship Assessment',
    eyebrow: 'FOR ASPIRING ENTREPRENEURS',
    intro: 'Share where you are with your idea. We’ll map the key steps, resources and business functions you may need to get started.',
    questions: [
      {id:'idea',title:'Describe your business idea in a sentence or two.',hint:'What would you sell or provide, and who would it help?',type:'textarea',required:true,placeholder:'My idea is…'},
      {id:'industry',title:'Which industry is closest to your idea?',type:'select',required:true,options:['Professional services','Home services / trades','Retail / e-commerce','Healthcare / wellness','Hospitality / food','Technology / software','Manufacturing / logistics','Education / training','Real estate','Other / not sure']},
      {id:'stage',title:'What stage are you at right now?',type:'select',required:true,options:['Just an idea','Researching the market','Planning the business','Building a product or service','Already launched','Already operating and looking to grow']},
      {id:'customer',title:'Who do you expect your customers to be?',type:'select',required:true,options:['Individuals / consumers (B2C)','Other businesses (B2B)','Both businesses and consumers','Not sure yet']},
      {id:'model',title:'How do you expect the business to make money?',type:'select',required:true,options:['One-time product or service sales','Recurring subscriptions or retainers','Projects, packages or contracts','Commission, marketplace or transaction fees','Advertising or audience-based revenue','Not sure yet']},
      {id:'resources',title:'What resources do you currently have?',hint:'Select all that apply.',type:'checks',options:['A clear idea and target customer','Industry knowledge or relevant experience','A co-founder or potential team','Some startup budget','An existing audience or customer network','A product, prototype or service ready to test','Time to work on the business','None of these yet']},
      {id:'support',title:'Which areas would you most need help with?',hint:'Choose all that apply.',type:'checks',options:['Validating demand and researching competitors','Business model and pricing','Marketing and finding customers','Sales and customer support','Finance, budgeting and accounting','Legal, registration and compliance','Website, technology and automation','Operations, suppliers and delivery','Business strategy and growth']}
    ]
  }
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function openAssessment(key) {
  activeAssessment = assessments[key];
  currentStep = 0;
  answers = {};
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden','false');
  document.body.classList.add('assessment-open');
  renderQuestion();
  closeAssessment.focus();
}
function closeModal() {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden','true');
  document.body.classList.remove('assessment-open');
}
closeAssessment.addEventListener('click', closeModal);
modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal(); });

document.querySelectorAll('[data-assessment]').forEach(button => button.addEventListener('click', () => {
  openAssessment(button.dataset.assessment === 'Entrepreneurship Assessment' ? 'founder' : 'business');
}));

function controlMarkup(q) {
  const value = answers[q.id];
  if (q.type === 'functionHours') {
    const selected = answers.functions || [];
    if (!selected.length) return '<p class="assessment-field-note">Select the business functions in the previous question to add hours here.</p>';
    const saved = value || {};
    return '<div class="function-hours-grid">'+selected.map(name=>'<label class="function-hours-field"><span>'+escapeHtml(name)+'</span><div><input type="number" min="0" max="10000" step="any" data-function-hours="'+escapeHtml(name)+'" value="'+escapeHtml(saved[name]??'')+'" placeholder="Hours / week"><small>hours per week</small></div></label>').join('')+'</div>';
  }
  if (q.type === 'select') {
    return '<select id="assessmentAnswer" name="answer" '+(q.required?'required':'')+'><option value="">Choose an option</option>'+q.options.map(option => '<option '+(value===option?'selected':'')+' value="'+escapeHtml(option)+'">'+escapeHtml(option)+'</option>').join('')+'</select>';
  }
  if (q.type === 'checks') {
    const selected = Array.isArray(value) ? value : [];
    return '<div class="assessment-check-grid">'+q.options.map((option,i) => '<label class="assessment-check"><input type="checkbox" name="answer" value="'+escapeHtml(option)+'" '+(selected.includes(option)?'checked':'')+'><span>'+escapeHtml(option)+'</span></label>').join('')+'</div>';
  }
  if (q.type === 'textarea') return '<textarea id="assessmentAnswer" name="answer" rows="4" '+(q.required?'required':'')+' placeholder="'+escapeHtml(q.placeholder||'')+'">'+escapeHtml(value||'')+'</textarea>';
  return '<input id="assessmentAnswer" name="answer" type="'+(q.type==='number'?'number':'text')+'" '+(q.required?'required':'')+' '+(q.type==='number'?'min="'+(q.min??0)+'" max="'+(q.max??100000)+'" step="any"':'')+' value="'+escapeHtml(value??'')+'" placeholder="'+escapeHtml(q.placeholder||'')+'">';
}
function saveCurrentAnswer() {
  const q = activeAssessment.questions[currentStep];
  if (q.type === 'functionHours') {
    const values = {};
    modalContent.querySelectorAll('[data-function-hours]').forEach(input => {
      if (input.value.trim() !== '') values[input.dataset.functionHours] = Math.max(0, Number(input.value));
    });
    answers.functionHours = values;
    return true;
  }
  if (q.type === 'checks') {
    answers[q.id] = [...modalContent.querySelectorAll('input[name="answer"]:checked')].map(input => input.value);
    if (q.required && !answers[q.id].length) return false;
  } else {
    const control = modalContent.querySelector('#assessmentAnswer');
    const value = control ? control.value.trim() : '';
    if (q.required && !value) { control?.focus(); return false; }
    if (q.type === 'number' && value !== '' && Number(value) < 0) return false;
    answers[q.id] = q.type === 'number' ? (value === '' ? '' : Number(value)) : value;
  }
  return true;
}
function renderQuestion() {
  const q = activeAssessment.questions[currentStep];
  const total = activeAssessment.questions.length;
  const progress = Math.round((currentStep / total) * 100);
  modalContent.innerHTML = '<div class="assessment-kicker">'+escapeHtml(activeAssessment.eyebrow)+'</div>'+
    '<h2 id="assessmentTitle">'+escapeHtml(activeAssessment.name)+'</h2>'+
    '<p class="assessment-intro">'+escapeHtml(activeAssessment.intro)+'</p>'+
    '<div class="assessment-progress-meta"><span>QUESTION '+(currentStep+1)+' OF '+total+'</span><span>'+Math.round(((currentStep+1)/total)*100)+'% complete</span></div>'+
    '<div class="assessment-progress"><span style="width:'+Math.round(((currentStep+1)/total)*100)+'%"></span></div>'+
    '<section class="assessment-question"><h3>'+escapeHtml(q.title)+'</h3>'+(q.hint?'<p>'+escapeHtml(q.hint)+'</p>':'')+controlMarkup(q)+'</section>'+
    '<div class="assessment-error" id="assessmentError" role="alert"></div>'+
    '<div class="assessment-actions">'+(currentStep>0?'<button class="assessment-back" type="button" id="assessmentBack">Back</button>':'<span class="assessment-privacy">Your answers are processed in this browser and are not saved or sent anywhere.</span>')+
    '<button class="button button-primary" type="button" id="assessmentNext">'+(currentStep===total-1?'Generate my report':'Continue')+' <span>→</span></button></div>';
  document.getElementById('assessmentNext').addEventListener('click', () => {
    if (!saveCurrentAnswer()) {
      document.getElementById('assessmentError').textContent = 'Please complete this question before continuing.';
      return;
    }
    if (currentStep < total-1) { currentStep++; renderQuestion(); }
    else renderReport();
  });
  document.getElementById('assessmentBack')?.addEventListener('click', () => { saveCurrentAnswer(); currentStep--; renderQuestion(); });
}
function renderDownloadReportSection() {
  return '<section class="report-section report-download-section"><div class="report-email-heading"><span class="assessment-kicker">YOUR REPORT · READY TO KEEP</span><h3>Download your professional report</h3><p>Save a polished copy of this assessment, including your recommendations, pricing breakdown and next steps. Add optional workload figures to include an illustrative savings analysis.</p></div><form id="downloadReportForm" class="email-report-form"><div class="email-report-metrics"><div><label for="reportHours">Hours per week spent on repetitive tasks <span>(optional)</span></label><input id="reportHours" name="hours" type="number" min="0.1" max="10000" step="0.5" placeholder="e.g. 25"></div><div><label for="reportHourlyCost">Approximate staff cost per hour (USD) <span>(optional)</span></label><input id="reportHourlyCost" name="hourlyCost" type="number" min="0.01" max="100000" step="0.5" placeholder="e.g. 18"></div></div><p class="email-report-note">Provide both figures to include 25%, 50% and 75% time-saving scenarios. These show potential staff capacity value, not guaranteed cash savings.</p><button class="button button-primary" type="submit">Download report as PDF <span>↓</span></button><p class="email-report-status" id="downloadReportStatus" role="status" aria-live="polite">Your browser will open its print window. Choose “Save as PDF” as the destination.</p></form></section>';
}
function bindDownloadReport() {
  const form=document.getElementById('downloadReportForm');
  if(!form)return;
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const hours=form.elements.hours.value===''?null:Number(form.elements.hours.value);
    const cost=form.elements.hourlyCost.value===''?null:Number(form.elements.hourlyCost.value);
    if((hours===null)!==(cost===null)){
      document.getElementById('downloadReportStatus').textContent='Please enter both figures to include the savings analysis, or leave both blank.';
      return;
    }
    let analysis=document.getElementById('reportSavingsAnalysis');
    if(hours!==null&&cost!==null){
      const rows=[25,50,75].map(percent=>{
        const weekly=hours*percent/100;
        const annual=weekly*cost*52;
        return '<tr><td>'+percent+'% scenario</td><td>'+weekly.toFixed(1)+' hours</td><td>$'+annual.toLocaleString('en-US',{maximumFractionDigits:0})+'</td></tr>';
      }).join('');
      const html='<section class="report-section report-savings-analysis" id="reportSavingsAnalysis"><h3>Illustrative time and cost scenarios</h3><p>Based on '+hours+' hours per week spent on repetitive tasks and an estimated staff cost of $'+cost.toFixed(2)+' per hour.</p><table class="report-savings-table"><thead><tr><th>Scenario</th><th>Time released / week</th><th>Annual capacity value</th></tr></thead><tbody>'+rows+'</tbody></table><p class="report-field-note">These scenarios estimate the value of staff capacity potentially released. They are not guaranteed cash savings, payroll reductions or promised results. Actual outcomes depend on the workflows selected, implementation, adoption and how released time is used.</p></section>';
      if(analysis)analysis.outerHTML=html;
      else form.insertAdjacentHTML('beforebegin',html);
    }else if(analysis){analysis.remove();}
    document.getElementById('downloadReportStatus').textContent='In the print window, select “Save as PDF” to download your report.';
    window.print();
  });
}
function renderReport() {
  const isBusiness = activeAssessment === assessments.business;
  const report = isBusiness ? buildBusinessReport() : buildFounderReport();
  const intro = '<div class="report-topline"><span class="assessment-kicker">YOUR DONNINGER.AI REPORT'+(isBusiness && report.clientName ? ' · PREPARED FOR '+escapeHtml(report.clientName) : '')+'</span><span class="report-date">'+new Date().toLocaleDateString()+'</span></div>'+
    '<h2 id="assessmentTitle">'+escapeHtml(report.title)+'</h2>'+
    '<p class="assessment-intro">'+escapeHtml(report.summary)+'</p>';
  const businessSections = isBusiness
    ? renderBusinessComparison(report)+renderBusinessPricing(report)
    : renderFounderSections(report);
  modalContent.innerHTML = intro+businessSections+
    '<section class="report-section report-notes"><h3>Important assessment notes</h3><p class="report-disclaimer">'+escapeHtml(report.disclaimer)+'</p></section>'+
    renderDownloadReportSection()+
    '<div class="assessment-actions report-actions"><button class="assessment-back" type="button" id="assessmentRestart">Start again</button><button class="button button-primary" type="button" id="assessmentPrint">Print / Save report <span>↗</span></button></div>';
  document.getElementById('assessmentRestart').addEventListener('click',()=>{currentStep=0;answers={};renderQuestion();});
  document.getElementById('assessmentPrint').addEventListener('click',()=>window.print());
  bindDownloadReport();
}
function renderFounderSections(report) {
  const idea = answers.idea || 'Business idea not specified';
  const context = [answers.industry,answers.stage,answers.customer,answers.model].filter(Boolean);
  const resources = answers.resources || [];
  const recommendations = (report.priorities||[]).slice(0,4);
  const opportunities = [
    {title:'Validate demand before investing heavily',body:'Use customer conversations and a small real-world test to confirm that people will pay for the proposed solution.'},
    {title:'Build a lean first version',body:'Start with the smallest useful offer and add systems only when real demand and repeatable processes justify them.'},
    {title:'Create measurable growth milestones',body:'Track enquiries, conversion, revenue, delivery costs and customer feedback from the beginning.'}
  ];
  return '<section class="report-section"><h3>1. What you told us</h3><div class="report-summary-panel"><strong>'+escapeHtml(idea)+'</strong><p>'+escapeHtml(context.join(' · ')||'Further business details can be confirmed during planning.')+'</p><small>'+escapeHtml(resources.length?resources.length+' resource area(s) already identified.':'Your available resources still need to be mapped.')+'</small></div></section>'+
    '<section class="report-section"><h3>2. What we recommend</h3>'+renderReportItems(recommendations,'We need a little more information before recommending a specific starting point.')+'</section>'+
    '<section class="report-section"><h3>3. Opportunities we identified</h3>'+renderReportItems(opportunities)+'</section>';
}
function renderReportItems(items,emptyText) {
  if(!items || !items.length) return '<p class="report-field-note">'+escapeHtml(emptyText||'No additional items were identified from the information provided.')+'</p>';
  return '<div class="report-recommendations">'+items.map((item,i)=>'<article><span>0'+(i+1)+'</span><div><strong>'+escapeHtml(item.title)+'</strong><p>'+escapeHtml(item.body)+'</p></div></article>').join('')+'</div>';
}

const functionDetails = {
  'Sales & lead generation': {task:'Lead capture, qualification, follow-up reminders and quote preparation'},
  'Marketing': {task:'Campaign scheduling, content repurposing, lead routing and performance reporting'},
  'Customer service': {task:'Common-question responses, ticket sorting, appointment updates and service follow-ups'},
  'Human resources & recruitment': {task:'CV organisation, candidate updates, interview scheduling and onboarding checklists'},
  'Finance & accounting': {task:'Invoice preparation, receipt capture, payment reminders and reconciliations for human approval'},
  'Operations & administration': {task:'Data entry, document generation, task routing and recurring reports'},
  'Stock, suppliers & logistics': {task:'Order status updates, supplier reminders and low-stock alerts'},
  'Management & reporting': {task:'KPI collation, dashboard updates and recurring management reports'}
};
function automationSlugForRecommendation(label) {
  const value = String(label || '').toLowerCase();
  if (/sales|lead|customer acquisition|first sale/.test(value)) return 'sales';
  if (/marketing|campaign|content/.test(value)) return 'marketing';
  if (/customer service|customer support|customer experience|customer question/.test(value)) return 'customer-service';
  if (/human resources|\bhr\b|recruit|employee|onboarding|staff administration/.test(value)) return 'hr-recruitment';
  if (/finance|accounting|budget|invoice|payment/.test(value)) return 'finance';
  if (/stock|supplier|logistics|order|delivery|fulfilment/.test(value)) return 'stock-logistics';
  if (/operations|administration|workflow|business process|technology|website/.test(value)) return 'operations';
  if (/management|report|kpi|performance dashboard|business intelligence|strategy|growth plan/.test(value)) return 'management';
  return null;
}
function renderAutomationLink(label) {
  const slug = automationSlugForRecommendation(label);
  if (!slug) return '';
  return '<a class="button button-primary report-explore-link" href="automation.html?function='+slug+'">Explore this automation <span aria-hidden="true">→</span></a><button type="button" class="button cart-add-button" data-cart-add="'+slug+'">Add to cart</button>';
}
function packageRecommendations(isBusiness) {
  if (isBusiness) {
    const selected = answers.functions || [];
    const count = selected.length;
    if (count === 8) return [{name:'Complete Donninger.AI Platform',bundle:true,why:'All eight business functions, configured as one connected operating platform. Save $600 on setup and $60 per month compared with buying all eight separately. Includes ongoing maintenance, support, upkeep and additions to the Donninger.AI product offering.',price:'$1,000 one-time setup + $100/month. Third-party software and usage charges are separate where applicable.'}];
    return [{name:count>0?count+'-Function Automation Package':'Choose your first automation',why:count>0?'A focused implementation covering your '+count+' selected business functions, with agreed workflows, integrations and human approval controls.':'Select the business functions you want Donninger.AI to support. You can add more at any time.',price:count>0?'$'+(count*200)+' one-time setup + $'+(count*20)+'/month.':'$200 one-time setup + $20/month per function.'},{name:'Complete Donninger.AI Platform - Best Value',bundle:true,why:'Get all eight business functions in one connected package. Save $600 upfront plus $60 every month compared with buying all eight individually.',price:'$1,000 one-time setup + $100/month for all eight functions. Third-party software and usage charges are separate where applicable.'}];
  }
  const stage = answers.stage || '';
  return [{name:'Entrepreneur Launch Foundations',why:'Helps validate the idea, shape the offer and establish the essential customer, finance and operating workflows before hiring.',price:'Choose business functions as your needs become clear: $200 setup + $20/month per function.'},{name:stage.includes('Already')?'Business Growth & Automation':'Founder AI Toolkit',why:'Adds practical AI-assisted workflows for marketing, sales, customer support and administration as the business needs them.',price:'$200 one-time setup + $20/month per selected function.'},{name:'Complete Donninger.AI Platform - Best Value',bundle:true,why:'Bring all eight business functions together as your business grows, with one connected package and one monthly subscription. Save $600 upfront and $60 every month compared with purchasing all eight individually.',price:'$1,000 one-time setup + $100/month for all eight functions. Third-party software and usage charges are separate where applicable.'}];
}
function functionSlug(name) {
  return ({
    'Sales & lead generation':'sales',
    'Marketing':'marketing',
    'Customer service':'customer-service',
    'Human resources & recruitment':'hr-recruitment',
    'Finance & accounting':'finance',
    'Operations & administration':'operations',
    'Stock, suppliers & logistics':'stock-logistics',
    'Management & reporting':'management'
  })[name] || null;
}
function renderFunctionLinks(names,buttonLabel) {
  return names.map((name,i)=>{
    const slug=functionSlug(name);
    return '<article><span>0'+(i+1)+'</span><div><strong>'+escapeHtml(name)+'</strong><p>'+escapeHtml(functionDetails[name]?.task || 'Review the recurring workflows and controls in this area')+'.</p>'+(slug?'<a class="button button-primary report-explore-link" href="automation.html?function='+slug+'">'+escapeHtml(buttonLabel)+' <span aria-hidden="true">→</span></a><button type="button" class="button cart-add-button" data-cart-add="'+slug+'">Add to cart</button>':'')+'</div></article>';
  }).join('');
}
function renderBusinessComparison(report) {
  const requested=report.requestedFunctions||[];
  const recommended=report.recommendedFunctions||[];
  const additional=(report.growth||[]).slice(0,3);
  const requestedBlock=requested.length
    ? renderFunctionLinks(requested,'Explore this function')
    : '<p class="report-field-note">You did not select a specific function. We have considered the tasks and business goal you described.</p>';
  const recommendedBlock=recommended.length
    ? '<div class="report-recommendations">'+recommended.map((name,i)=>'<article><span>0'+(i+1)+'</span><div><strong>'+escapeHtml(name)+'</strong><p>'+escapeHtml(functionDetails[name]?.task||'Review the current workflow, tools and approval requirements.')+'</p>'+renderAutomationLink(name)+'</div></article>').join('')+'</div>'
    : '<p class="report-field-note">There is not yet enough evidence to recommend a specific function. We suggest mapping one repetitive workflow before selecting a package.</p>';
  return '<section class="report-section report-customer-wants"><h3>1. What you want</h3><p class="report-chart-intro">The business functions you specifically asked us to consider.</p>'+requestedBlock+'</section>'+
    '<section class="report-section report-our-recommendations"><h3>2. What we recommend</h3><p class="report-chart-intro">Our recommendations are based on the operational challenges and goals in your answers, not simply on the functions selected.</p>'+recommendedBlock+'</section>'+
    '<section class="report-section report-opportunities"><h3>3. Opportunities we identified</h3><p class="report-chart-intro">Potential ways to improve performance once the core workflows are working reliably.</p>'+renderReportItems(additional,'No additional growth opportunities stood out from the information provided.')+'</section>';
}
function calculateBusinessProposal(report) {
  const count=(report.recommendedFunctions||[]).length;
  const individualSetup=count*200;
  const individualMonthly=count*20;
  const recommendBundle=count>=6;
  return {count,individualSetup,individualMonthly,setup:recommendBundle?1000:individualSetup,monthly:recommendBundle?100:individualMonthly,totalFirstYear:(recommendBundle?1000:individualSetup)+(recommendBundle?100:individualMonthly)*12,recommendBundle};
}
function renderBusinessPricing(report) {
  const p=calculateBusinessProposal(report);
  const focusedSetup=p.individualSetup||0;
  const focusedMonthly=p.individualMonthly||0;
  const focusedYear=focusedSetup+focusedMonthly*12;
  const bundleYear=1000+100*12;
  const recommendedBundle=!!p.recommendBundle;
  const selectedLabel=p.count+' recommended function(s)';
  const focusedRow='<tr><td><strong>Focused proposal</strong><small>'+selectedLabel+'</small></td><td>$'+focusedSetup.toLocaleString()+'</td><td>$'+focusedMonthly.toLocaleString()+'</td><td>$'+focusedYear.toLocaleString()+'</td></tr>';
  const bundleRow='<tr><td><strong>Complete platform</strong><small>All eight functions · best value</small></td><td>$1,000</td><td>$100</td><td>$'+bundleYear.toLocaleString()+'</td></tr>';
  const recommendation=p.count
    ? (recommendedBundle?'Based on the number of functions recommended, the complete platform offers the stronger overall value.':'We recommend starting with the focused proposal. The complete platform remains available if you expect to use the additional functions.')
    : 'We are not recommending a paid package yet. It is better to clarify the first workflow before asking you to invest.';
  const chartMax=Math.max(focusedYear,bundleYear,1);
  const chart=p.count?'<div class="report-cost-chart"><div class="report-cost-chart-heading"><strong>First-year cost comparison</strong><span>Setup + 12 monthly payments</span></div><div class="report-cost-bar-row"><span>Focused</span><div><i style="width:'+Math.round(focusedYear/chartMax*100)+'%"></i></div><b>$'+focusedYear.toLocaleString()+'</b></div><div class="report-cost-bar-row bundle"><span>All eight</span><div><i style="width:'+Math.round(bundleYear/chartMax*100)+'%"></i></div><b>$'+bundleYear.toLocaleString()+'</b></div></div>':'';
  return '<section class="report-section report-final"><h3>Pricing breakdown</h3><p class="report-chart-intro">Published pricing in USD. First-year totals include setup and 12 monthly payments.</p><div class="report-pricing-table-wrap"><table class="report-pricing-table"><thead><tr><th>Package</th><th>Setup</th><th>Monthly</th><th>First year</th></tr></thead><tbody>'+focusedRow+bundleRow+'</tbody></table></div>'+chart+'<p class="report-pricing-recommendation">'+escapeHtml(recommendation)+'</p><div class="report-pricing-savings"><strong>Bundle saving when all eight functions are needed</strong><span>$600 less upfront and $60 less every month than buying all eight individually.</span></div><p class="report-field-note">The monthly fee includes maintenance, support, upkeep and additions to the Donninger.AI product offering. Third-party subscriptions, messaging charges and usage-based AI/API costs are separate and disclosed before commitment. Scope and integrations are confirmed before implementation.</p>'+(recommendedBundle?'<button type="button" class="button button-primary" data-cart-add-all>Add the recommended bundle to cart</button>':'')+'</section>';
}
function renderFinalRecommendations(report,isBusiness) {
  if (isBusiness) return renderBusinessComparison(report)+renderBusinessPricing(report);
  const packages=packageRecommendations(false);
  const packageBlock='<section class="report-section report-final"><h3>Recommended Donninger.AI package</h3><p class="report-chart-intro">These recommendations are matched to the needs identified in your answers. We will confirm the exact scope before any implementation.</p><div class="package-recommendations">'+packages.map((item,i)=>'<article class="package-card '+(item.bundle?'package-card-bundle':'')+'"><span>'+(item.bundle?'BEST VALUE - ALL EIGHT FUNCTIONS':'RECOMMENDED '+(i+1))+'</span><strong>'+escapeHtml(item.name)+'</strong><p>'+escapeHtml(item.why)+'</p><small>'+escapeHtml(item.price)+'</small>'+(item.bundle?'<button type="button" class="button button-primary cart-add-button" data-cart-add-all>Add the complete bundle to cart</button>':'')+'</article>').join('')+'</div></section>';
  return packageBlock;
}
function buildBusinessReport() {
  const operating=answers.functions||[];
  const requested=answers.interestedFunctions||[];
  const tasks=answers.tasks||[];
  const recommended=new Set();
  const add=(name)=>recommended.add(name);
  if (tasks.some(x=>x.includes('enquiries')||x.includes('leads')) || answers.goal==='Win more customers and respond faster') add('Sales & lead generation');
  if (tasks.some(x=>x.includes('customer questions')) || answers.goal==='Improve customer experience') add('Customer service');
  if (tasks.some(x=>x.includes('invoices')||x.includes('payments'))) add('Finance & accounting');
  if (tasks.some(x=>x.includes('recruitment')||x.includes('staff administration'))) add('Human resources & recruitment');
  if (tasks.some(x=>x.includes('systems')||x.includes('spreadsheets')||x.includes('reports')) || answers.goal==='Improve visibility, reporting and decisions') add('Management & reporting');
  if (tasks.some(x=>x.includes('stock')||x.includes('suppliers'))) add('Stock, suppliers & logistics');
  if (tasks.some(x=>x.includes('appointments')||x.includes('scheduling')||x.includes('Copying information')) || answers.goal==='Reduce admin and operating costs' || answers.goal==='Make the team more productive' || answers.goal==='Scale without immediately hiring more people') add('Operations & administration');
  if (tasks.some(x=>x.includes('quotes')||x.includes('proposals')) && !recommended.has('Sales & lead generation')) add('Sales & lead generation');
  if (operating.includes('Marketing') && (answers.goal==='Win more customers and respond faster' || tasks.some(x=>x.includes('spreadsheets')||x.includes('reports')))) add('Marketing');
  if (requested.length && recommended.size===0) {
    if (answers.goal==='Not sure — show me the biggest opportunities') add('Operations & administration');
    else requested.slice(0,2).forEach(add);
  }
  const recommendedFunctions=[...recommended];
  const recommendations=recommendedFunctions.map(name=>({title:name,body:functionDetails[name]?.task || 'Review this function’s recurring workflows, tools and approval requirements.'}));
  if (!recommendations.length) recommendations.push({title:'Map the highest-volume manual process',body:'Choose one recurring task, document its current steps and measure how often it happens before selecting an automation.'});
  const goalMap={
    'Win more customers and respond faster':'Start with enquiry capture, lead qualification and follow-up speed.',
    'Reduce admin and operating costs':'Start with high-volume admin tasks that can be standardised and measured.',
    'Improve customer experience':'Start with response times, consistent service information and clear human hand-offs.',
    'Make the team more productive':'Start with repetitive workflows that interrupt staff and create avoidable handovers.',
    'Improve visibility, reporting and decisions':'Start by bringing key operational data into a consistent dashboard or report.',
    'Scale without immediately hiring more people':'Start with repeatable workflows that can handle more volume without adding the same amount of admin.',
    'Not sure — show me the biggest opportunities':'Start by measuring the time spent on the three most frequent manual tasks.'
  };
  const company=answers.company?answers.company+' — ':'';
  return {
    clientName:answers.company?answers.company.trim():'',
    title:company+'Automation opportunity overview',
    summary:(answers.company?'Prepared for '+answers.company.trim()+'. ':'')+'Based on your answers, '+(answers.industry||'your business')+' should prioritise '+(recommendedFunctions.length?recommendedFunctions.slice(0,2).join(' and ').toLowerCase():'mapping its highest-friction workflow')+'. We have compared your requested functions with the needs indicated by your operational challenges and goals.',
    highlightLabel:'OUR TOP RECOMMENDATION',
    highlight:recommendations[0]?.title||'Map your highest-friction workflow',
    highlightNote:'Recommendations are based on the operational challenges and goals you described, not simply on which packages you selected.',
    priorities:recommendations.slice(0,4),
    requestedFunctions:requested,
    recommendedFunctions,
    chart:{items:operating.map(name=>({name,task:functionDetails[name]?.task||'Review recurring workflows'}))},
    growth:buildGrowthOpportunities(answers.goal,operating),
    steps:[goalMap[answers.goal]||'Pick one high-volume manual workflow to examine first.','Compare your requested functions with the operational needs identified in this report.','Map the current steps, tools involved, owners and approval points.','Configure a focused pilot and agree how success will be measured before expanding.'],
    disclaimer:'This is an initial, rules-based assessment based on the information you supplied. It is not a technical audit and does not promise savings or financial results. Recommendations should be validated against your actual workflows, software access, data quality, team capacity and applicable legal requirements.'
  };
}
function renderBusinessVisuals(report) {
  const items = (report.chart && report.chart.items) || [];
  const workflows = items.map((item,i)=>'<article class="growth-card"><span>AREA 0'+(i+1)+'</span><strong>'+escapeHtml(item.name)+'</strong><p>'+escapeHtml(item.task)+'.</p></article>').join('');
  const growth = report.growth.map((item,i)=>'<article class="growth-card"><span>GROWTH '+(i+1)+'</span><strong>'+escapeHtml(item.title)+'</strong><p>'+escapeHtml(item.body)+'</p></article>').join('');
  return (workflows?'<section class="report-section"><h3>Where we would focus first</h3><p class="report-chart-intro">These are the business areas you selected, with practical workflows to review during scoping. We will confirm which steps can be automated and which require a person’s approval.</p><div class="growth-grid">'+workflows+'</div></section>':'')+'<section class="report-section"><h3>Where the business could grow</h3><p class="report-chart-intro">These are growth levers to investigate after improving the underlying workflows.</p><div class="growth-grid">'+growth+'</div></section>';
}
function buildGrowthOpportunities(goal,functions) {
  const ideas = [];
  if (functions.includes('Sales & lead generation') || goal==='Win more customers and respond faster') ideas.push({title:'Convert more enquiries into customers',body:'Faster lead response, consistent follow-up and clearer pipeline visibility can help reduce missed opportunities.'});
  if (functions.includes('Customer service') || goal==='Improve customer experience') ideas.push({title:'Improve retention and repeat business',body:'Quicker answers, proactive updates and consistent service can strengthen customer experience and encourage repeat purchases.'});
  if (goal==='Scale without immediately hiring more people' || goal==='Make the team more productive') ideas.push({title:'Increase capacity without matching headcount growth',body:'Standardised workflows can help the current team handle more volume while managers monitor quality and workload.'});
  if (functions.includes('Management & reporting') || goal==='Improve visibility, reporting and decisions') ideas.push({title:'Make faster, better-informed decisions',body:'Reliable operational reporting can reveal bottlenecks, demand patterns and areas where resources are underused.'});
  if (functions.includes('Marketing')) ideas.push({title:'Make marketing more measurable',body:'Automated campaign tracking and lead attribution can show which channels generate qualified demand.'});
  if (ideas.length<3) ideas.push({title:'Free up time for higher-value work',body:'Redirect time released from repetitive administration towards customer relationships, service quality and business development.'});
  if (ideas.length<3) ideas.push({title:'Build a repeatable operating model',body:'Documenting and connecting core processes makes it easier to maintain consistency as the business grows.'});
  return ideas.slice(0,3);
}
function renderBusinessVisuals(report) {
  const items = (report.chart && report.chart.items) || [];
  const workflows = items.map((item,i)=>'<article class="growth-card"><span>AREA 0'+(i+1)+'</span><strong>'+escapeHtml(item.name)+'</strong><p>'+escapeHtml(item.task)+'.</p></article>').join('');
  const growth = report.growth.map((item,i)=>'<article class="growth-card"><span>GROWTH '+(i+1)+'</span><strong>'+escapeHtml(item.title)+'</strong><p>'+escapeHtml(item.body)+'</p></article>').join('');
  return (workflows?'<section class="report-section"><h3>Where we would focus first</h3><p class="report-chart-intro">These are the business areas you selected, with practical workflows to review during scoping. We will confirm which steps can be automated and which require a person’s approval.</p><div class="growth-grid">'+workflows+'</div></section>':'')+'<section class="report-section"><h3>Where the business could grow</h3><p class="report-chart-intro">These are growth levers to investigate after improving the underlying workflows.</p><div class="growth-grid">'+growth+'</div></section>';
}
function buildFounderReport() {
  const stage = answers.stage || 'Just an idea';
  const resources = answers.resources || [];
  const support = answers.support || [];
  const priorities = [];
  const add = (title,body)=>priorities.push({title,body});
  if (support.includes('Validating demand and researching competitors') || stage==='Just an idea' || stage==='Researching the market') add('Validate the problem and demand','Speak with potential customers, test whether the problem is important enough to pay to solve and compare existing alternatives.');
  if (support.includes('Business model and pricing') || answers.model==='Not sure yet') add('Define the business model and pricing','Clarify what customers receive, how you will charge, what it costs to deliver and what a sustainable margin could look like.');
  if (support.includes('Marketing and finding customers') || support.includes('Sales and customer support')) add('Build a simple customer acquisition plan','Choose one or two channels, define your ideal customer and create a repeatable process for enquiries, follow-up and sales.');
  if (support.includes('Finance, budgeting and accounting')) add('Build a basic financial plan','Estimate startup costs, monthly operating costs, pricing, expected sales and the cash runway needed to test the idea.');
  if (support.includes('Legal, registration and compliance')) add('Identify legal and compliance requirements','Check the business structure, registrations, licences, contracts, privacy and industry-specific requirements in your intended market.');
  if (support.includes('Website, technology and automation')) add('Build only the essential technology','Start with a clear website or landing page, simple customer records and a small number of tools that support the first sales.');
  if (support.includes('Operations, suppliers and delivery')) add('Design how the service will be delivered','Document fulfilment, suppliers, quality checks, customer communication and the steps required to deliver consistently.');
  if (support.includes('Business strategy and growth')) add('Set milestones and a growth plan','Define what a successful first 30, 60 and 90 days would look like, then review progress against real customer evidence.');
  if (priorities.length < 3) {
    add('Test with real potential customers','Get direct feedback from the people you expect to serve before investing heavily.');
    add('Keep the first version lean','Use simple tools and manual processes where sensible; automate only after a process is understood and repeated.');
    add('Track the numbers from day one','Record enquiries, conversion, revenue, costs and customer feedback to guide decisions.');
  }
  const stageText = stage==='Already launched' || stage==='Already operating and looking to grow' ? 'Your focus should shift towards validating what works, improving delivery and building repeatable growth.' : 'Your strongest next move is to reduce uncertainty before committing significant time or money.';
  const resourceText = resources.length ? 'You already have '+resources.length+' useful resource area(s) identified. Build around those strengths.' : 'Start by listing the skills, time, network and budget you can realistically commit.';
  return {
    title:'Your entrepreneurship roadmap',
    summary:'Your idea: '+(answers.idea||'Business idea')+' '+stageText,
    highlightLabel:'YOUR CURRENT STAGE',
    highlight:stage,
    highlightNote:resourceText,
    priorities:priorities.slice(0,4),
    steps:['Write down the customer problem and the specific outcome your offer will deliver.','Validate demand through conversations, competitor research and a small real-world test.','Create a lean budget and a simple plan for making the first sale.','Use AI and automation to support repeatable tasks, while keeping important customer and financial decisions under human control.'],
    disclaimer:'This is an initial, rules-based planning report, not legal, tax, investment or financial advice. Requirements vary by country and industry. Validate assumptions with customers and qualified local professionals before making major commitments.'
  };
}
