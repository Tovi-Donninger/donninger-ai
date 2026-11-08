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
      {id:'functionHours',title:'Roughly how many hours per week does each area take?',hint:'Enter your best estimate for each selected function. Leave blank if unsure; we will clearly label any fallback estimates.',type:'functionHours'},
      {id:'tasks',title:'Where does your team spend too much time on repetitive work?',hint:'Choose any that sound familiar.',type:'checks',options:['Responding to enquiries and following up leads','Preparing quotes, proposals or invoices','Copying information between systems','Scheduling appointments, jobs or staff','Updating spreadsheets and reports','Answering common customer questions','Recruitment, onboarding or staff administration','Chasing payments and overdue accounts','Managing stock, orders or suppliers','We are not sure yet']},
      {id:'hours',title:'Approximately how many team hours are spent on repetitive admin each week?',hint:'A rough estimate is fine. Enter 0 if you are unsure.',type:'number',required:true,min:0,max:10000,placeholder:'e.g. 25'},
      {id:'currency',title:'Which currency should we use in your report?',hint:'Choose the currency you use for staff costs and financial planning.',type:'select',required:true,options:['USD — US Dollar','EUR — Euro','GBP — British Pound','ILS — Israeli New Shekel','ZAR — South African Rand','CAD — Canadian Dollar','AUD — Australian Dollar','NZD — New Zealand Dollar','AED — UAE Dirham','SGD — Singapore Dollar','INR — Indian Rupee','JPY — Japanese Yen','CHF — Swiss Franc','SEK — Swedish Krona','NOK — Norwegian Krone','DKK — Danish Krone','BRL — Brazilian Real','MXN — Mexican Peso']},
      {id:'hourlyCost',title:'What is the approximate average hourly cost of that time?',hint:'Optional. Enter the amount in the currency you selected.',type:'number',min:0,max:100000,placeholder:'e.g. 20'},
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
function renderReport() {
  const isBusiness = activeAssessment === assessments.business;
  const report = isBusiness ? buildBusinessReport() : buildFounderReport();
  modalContent.innerHTML = '<div class="report-topline"><span class="assessment-kicker">YOUR DONNINGER.AI REPORT</span><span class="report-date">'+new Date().toLocaleDateString()+'</span></div>'+
    '<h2 id="assessmentTitle">'+escapeHtml(report.title)+'</h2>'+
    '<p class="assessment-intro">'+escapeHtml(report.summary)+'</p>'+
    '<div class="report-highlight"><span>'+escapeHtml(report.highlightLabel)+'</span><strong>'+escapeHtml(report.highlight)+'</strong><small>'+escapeHtml(report.highlightNote)+'</small></div>'+
    (isBusiness ? renderBusinessVisuals(report) : '')+
    '<div class="report-section"><h3>Your priority areas</h3><div class="report-recommendations">'+report.priorities.map((item,i)=>'<article><span>0'+(i+1)+'</span><div><strong>'+escapeHtml(item.title)+'</strong><p>'+escapeHtml(item.body)+'</p>'+renderAutomationLink(item.title)+'</div></article>').join('')+'</div></div>'+
    '<div class="report-section"><h3>Your next steps</h3><ol class="report-next-steps">'+report.steps.map(item=>'<li>'+escapeHtml(item)+'</li>').join('')+'</ol></div>'+
    renderFinalRecommendations(report,isBusiness)+
    '<p class="report-disclaimer">'+escapeHtml(report.disclaimer)+'</p>'+
    '<div class="assessment-actions report-actions"><button class="assessment-back" type="button" id="assessmentRestart">Start again</button><button class="button button-primary" type="button" id="assessmentPrint">Print / Save report <span>↗</span></button></div>';
  document.getElementById('assessmentRestart').addEventListener('click',()=>{currentStep=0;answers={};renderQuestion();});
  document.getElementById('assessmentPrint').addEventListener('click',()=>window.print());
}
const functionDetails = {
  'Sales & lead generation': {task:'Lead capture, qualification, follow-up reminders and quote preparation',rate:.25},
  'Marketing': {task:'Campaign scheduling, content repurposing, lead routing and performance reporting',rate:.2},
  'Customer service': {task:'Common-question responses, ticket sorting, appointment updates and service follow-ups',rate:.3},
  'Human resources & recruitment': {task:'CV organisation, candidate updates, interview scheduling and onboarding checklists',rate:.25},
  'Finance & accounting': {task:'Invoice preparation, receipt capture, payment reminders and reconciliations for human approval',rate:.2},
  'Operations & administration': {task:'Data entry, document generation, task routing and recurring reports',rate:.3},
  'Stock, suppliers & logistics': {task:'Order status updates, supplier reminders and low-stock alerts',rate:.2},
  'Management & reporting': {task:'KPI collation, dashboard updates and recurring management reports',rate:.2}
};
function calculateSavings() {
  const selected = answers.functions || [];
  const entered = answers.functionHours || {};
  const totalHours = Number(answers.hours || 0);
  const hasBreakdown = selected.some(name => Number(entered[name]) > 0);
  const allocated = {};
  if (hasBreakdown) {
    selected.forEach(name => allocated[name] = Number(entered[name] || 0));
  } else if (selected.length && totalHours > 0) {
    const weights = selected.map(name => ({name,weight:(functionDetails[name]?.rate || .2)}));
    const sum = weights.reduce((n,item)=>n+item.weight,0);
    weights.forEach(item=>allocated[item.name] = totalHours*item.weight/sum);
  }
  const currency = (answers.currency || 'USD — US Dollar').slice(0,3);
  const rate = Number(answers.hourlyCost || 0);
  const money = value => new Intl.NumberFormat(undefined,{style:'currency',currency,maximumFractionDigits:0}).format(value);
  const rows = selected.filter(name=>allocated[name]>0).map(name=>{
    const detail = functionDetails[name] || {task:'Review recurring workflows and identify suitable tasks',rate:.2};
    const weekly = allocated[name];
    const savedHours = weekly*detail.rate*46;
    return {name,task:detail.task,weekly,savedHours,value:rate?savedHours*rate:0,rate:detail.rate};
  }).sort((a,b)=>(rate?b.value-a.value:b.savedHours-a.savedHours));
  return {rows,totalHours:rows.reduce((n,row)=>n+row.savedHours,0),totalValue:rows.reduce((n,row)=>n+row.value,0),hasBreakdown,currency,rate,money};
}
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
  return '<a class="button button-primary report-explore-link" href="automation.html?function='+slug+'">Explore this automation <span aria-hidden="true">→</span></a>';
}
function packageRecommendations(isBusiness) {
  if (isBusiness) {
    const selected = answers.functions || [];
    const broad = selected.length >= 4 || selected.includes('Management & reporting');
    const specialist = selected.includes('Finance & accounting') || selected.includes('Human resources & recruitment') || selected.includes('Stock, suppliers & logistics');
    if (broad) return [{name:'Business Operations & Automation',why:'Your answers point to several departments and connected workflows that should be assessed together.',price:'Setup fee and monthly support: custom quote after a workflow review.'},{name:'Automation Starter',why:'A sensible first phase if you prefer to prove value with one or two workflows before expanding.',price:'Setup fee and monthly support: custom quote after scoping.'}];
    if (specialist) return [{name:'Department Automation',why:'A focused implementation for the specialist functions you selected, with appropriate human approval points.',price:'Setup fee and monthly support: custom quote after scoping.'}];
    return [{name:'Automation Starter',why:'A focused first implementation for the highest-priority repetitive workflows identified in this assessment.',price:'Setup fee and monthly support: custom quote after scoping.'}];
  }
  const stage = answers.stage || '';
  return [{name:'Entrepreneur Launch Foundations',why:'Helps validate the idea, shape the offer and establish the essential customer, finance and operating workflows before hiring.',price:'Project setup and ongoing support: custom quote based on your launch scope.'},{name:stage.includes('Already')?'Business Growth & Automation':'Founder AI Toolkit',why:'Adds practical AI-assisted workflows for marketing, sales, customer support and administration as the business needs them.',price:'Setup fee and monthly support: custom quote after scoping.'}];
}
function renderFinalRecommendations(report,isBusiness) {
  const packages = packageRecommendations(isBusiness);
  const selectedFunctions = answers.functions || [];
  const businessRecommendations = selectedFunctions.map((name,i) => {
    const detail = functionDetails[name] || {task:'Review recurring workflows and identify suitable tasks'};
    return '<article><span>0'+(i+1)+'</span><div><strong>'+escapeHtml(name)+'</strong><p>'+escapeHtml(detail.task)+'. We will map this process to your existing tools, define the right approval points and configure a workflow around the way your team operates.</p>'+renderAutomationLink(name)+'</div></article>';
  }).join('');
  const savingsBlock = isBusiness
    ? '<section class="report-section report-final"><h3>Your automation opportunity — and how we turn it into action</h3><p class="report-chart-intro">Your answers highlight the business functions where a tailored automation system could make day-to-day work simpler, more consistent and easier to manage. Rather than rely on generic savings promises, Donninger.AI starts by understanding your actual process, then scopes a practical solution around your team, tools and priorities.</p>'+
      (businessRecommendations?'<div class="report-recommendations">'+businessRecommendations+'</div>':'<p class="report-field-note">Your next step is to identify the recurring process that causes the most friction. We can help map it into a clear first automation project.</p>')+
      '<div class="report-total"><span>Your next step</span><strong>Get a tailored implementation plan</strong><small>We will review your priorities, confirm what can be automated with the available integrations, agree where your team stays in control and provide a clear setup and ongoing support quote before you decide.</small></div></section>'
    : '<section class="report-section report-final"><h3>Recommended functions to automate first</h3><p class="report-chart-intro">As a founder, use AI and automation to support these functions before committing to a full team. Keep legal, financial and customer-critical decisions under appropriate human oversight.</p><div class="report-recommendations">'+((answers.support&&answers.support.length)?answers.support:['Marketing and finding customers','Sales and customer support','Finance, budgeting and accounting','Operations, suppliers and delivery','Website, technology and automation']).slice(0,5).map((name,i)=>'<article><span>0'+(i+1)+'</span><div><strong>'+escapeHtml(name)+'</strong><p>Use lightweight AI tools and repeatable workflows to reduce founder admin; bring in a qualified person where specialist judgement or regulated advice is required.</p>'+renderAutomationLink(name)+'</div></article>').join('')+'</div></section>';
  const packageBlock = '<section class="report-section report-final"><h3>Recommended Donninger.AI package</h3><p class="report-chart-intro">These recommendations are matched to the needs identified in your answers. We will confirm the exact scope before any implementation.</p><div class="package-recommendations">'+packages.map((item,i)=>'<article class="package-card"><span>RECOMMENDED '+(i+1)+'</span><strong>'+escapeHtml(item.name)+'</strong><p>'+escapeHtml(item.why)+'</p><small>'+escapeHtml(item.price)+'</small></article>').join('')+'</div><p class="report-field-note">Package prices have not yet been finalised. We show a tailored quote rather than inventing a fee; the final proposal will state the one-time setup price and ongoing monthly cost before you commit.</p></section>';
  return savingsBlock+packageBlock;
}
function buildBusinessReport() {
  const hours = Number(answers.hours || 0);
  const low = Math.round(hours * .2 * 10)/10;
  const high = Math.round(hours * .3 * 10)/10;
  const annualLow = Math.round(low * 46);
  const annualHigh = Math.round(high * 46);
  const rate = Number(answers.hourlyCost || 0);
  const currency = (answers.currency || 'USD — US Dollar').slice(0,3);
  const money = value => new Intl.NumberFormat(undefined,{style:'currency',currency,maximumFractionDigits:0}).format(value);
  const functions = answers.functions || [];
  const tasks = answers.tasks || [];
  const recommendations = [];
  const add = (title,body) => recommendations.push({title,body});
  if (functions.includes('Sales & lead generation') || tasks.some(x=>x.includes('enquiries')||x.includes('leads'))) add('Lead response and sales follow-up','Create a consistent process to capture enquiries, send prompt replies, qualify leads and remind the team when a follow-up is due.');
  if (functions.includes('Customer service') || tasks.some(x=>x.includes('customer questions'))) add('Customer service workflows','Use a structured knowledge base and assisted responses for common questions, with clear hand-off to a person when needed.');
  if (functions.includes('Finance & accounting') || tasks.some(x=>x.includes('invoices')||x.includes('payments'))) add('Finance administration','Reduce repetitive invoice preparation, payment reminders and document handling while keeping approval and accounting controls in place.');
  if (functions.includes('Human resources & recruitment') || tasks.some(x=>x.includes('recruitment')||x.includes('staff administration'))) add('HR and recruitment administration','Standardise candidate communication, interview scheduling, onboarding checklists and routine employee administration.');
  if (functions.includes('Operations & administration') || tasks.some(x=>x.includes('systems')||x.includes('spreadsheets')||x.includes('reports'))) add('Connected operations and reporting','Connect the tools your team already uses, reduce duplicate data entry and automate routine status reports.');
  if (functions.includes('Stock, suppliers & logistics') || tasks.some(x=>x.includes('stock')||x.includes('suppliers'))) add('Supplier, stock and order workflows','Improve order tracking, supplier follow-ups and low-stock notifications using consistent shared records.');
  if (recommendations.length < 3) {
    add('Map the highest-volume manual process','Choose one recurring task, document its current steps and measure how often it happens before selecting an automation.');
    add('Connect your existing tools','Review where information is entered more than once and identify safe, reliable ways to connect those systems.');
  }
  const goalMap = {
    'Win more customers and respond faster':'Start with enquiry capture, lead qualification and follow-up speed.',
    'Reduce admin and operating costs':'Start with high-volume admin tasks that can be standardised and measured.',
    'Improve customer experience':'Start with response times, consistent service information and clear human hand-offs.',
    'Make the team more productive':'Start with repetitive workflows that interrupt staff and create avoidable handovers.',
    'Improve visibility, reporting and decisions':'Start by bringing key operational data into a consistent dashboard or report.',
    'Scale without immediately hiring more people':'Start with repeatable workflows that can handle more volume without adding the same amount of admin.',
    'Not sure — show me the biggest opportunities':'Start by measuring the time spent on the three most frequent manual tasks.'
  };
  const company = answers.company ? answers.company+' — ' : '';
  let highlight = hours ? annualLow+'–'+annualHigh+' hours / year' : 'Measure your manual workload first';
  let note = hours ? 'Illustrative capacity that may be released if suitable workflows reduce repetitive admin by 20–30%, over 46 working weeks.' : 'Add a weekly estimate of repetitive admin time to calculate an indicative opportunity.';
  if (rate && hours) {
    const moneyLow = money(annualLow*rate);
    const moneyHigh = money(annualHigh*rate);
    highlight = moneyLow+'–'+moneyHigh+' / year';
    note = 'Your current repetitive admin represents about '+money(hours*46*rate)+' in annual labour capacity. The range above models 20–30% of that value potentially released — not guaranteed cash savings.';
  }
  return {
    title:company+'Automation opportunity overview',
    summary:'Based on your answers, '+(answers.industry||'your business')+' has a starting point for improving '+(answers.goal||'day-to-day operations').toLowerCase()+'.',
    highlightLabel:'POTENTIAL ADMIN CAPACITY TO RECLAIM',
    highlight,highlightNote:note,
    priorities:recommendations.slice(0,4),
    chart:buildOpportunityChart(functions,annualLow,annualHigh,rate,currency),
    growth:buildGrowthOpportunities(answers.goal,functions),
    steps:[goalMap[answers.goal]||'Pick one high-volume manual workflow to examine first.','Map the current steps, tools involved, time spent and common errors.','Choose one small automation pilot and define how success will be measured.','Review the result before expanding to other departments.'],
    disclaimer:'This is an initial, rules-based assessment using the information you supplied. Time and value ranges are illustrative planning estimates, not a forecast or promise. Actual results depend on workflow suitability, software costs, adoption and oversight.'
  };
}
function buildOpportunityChart(functions,annualLow,annualHigh,rate,currency) {
  const weights = {
    'Sales & lead generation':18,'Marketing':13,'Customer service':15,
    'Human resources & recruitment':10,'Finance & accounting':12,
    'Operations & administration':16,'Stock, suppliers & logistics':9,
    'Management & reporting':7
  };
  const selected = functions.length ? functions : ['Operations & administration','Sales & lead generation','Customer service'];
  const total = selected.reduce((sum,name)=>sum+(weights[name]||10),0);
  let cursor = 0;
  const palette = ['#3478f6','#42c6d9','#6b83d9','#7b9bbd','#8b78c6','#42a58e','#e2a85b','#8795a8'];
  const items = selected.map((name,index)=>{
    const share = (weights[name]||10)/total;
    const start = cursor;
    cursor += share*100;
    return {name,share,colour:palette[index%palette.length],hoursLow:Math.round(annualLow*share),hoursHigh:Math.round(annualHigh*share),valueLow:Math.round(annualLow*share*rate),valueHigh:Math.round(annualHigh*share*rate),start,end:cursor};
  });
  return {items,currency};
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
  const chart = report.chart;
  if (!chart || !chart.items.length) return '';
  const stops = chart.items.map(item=>item.colour+' '+item.start+'% '+item.end+'%').join(',');
  const bars = chart.items.map(item=>{
    const value = item.hoursHigh ? Math.round(item.hoursHigh) : 0;
    const width = report.chart.items.reduce((max,x)=>Math.max(max,x.hoursHigh),0);
    const pct = width ? Math.max(4,value/width*100) : 0;
    const valueText = chart.items.length && Number(answers.hourlyCost||0)
      ? escapeHtml(new Intl.NumberFormat(undefined,{style:'currency',currency:chart.currency,maximumFractionDigits:0}).format(item.valueLow))+'–'+escapeHtml(new Intl.NumberFormat(undefined,{style:'currency',currency:chart.currency,maximumFractionDigits:0}).format(item.valueHigh))
      : item.hoursLow+'–'+item.hoursHigh+' hrs';
    return '<div class="report-bar-row"><div class="report-bar-label"><span>'+escapeHtml(item.name)+'</span><strong>'+valueText+'</strong></div><div class="report-bar-track"><i style="width:'+pct+'%;background:'+item.colour+'"></i></div></div>';
  }).join('');
  const legend = chart.items.map(item=>'<div class="report-legend-item"><i style="background:'+item.colour+'"></i><span>'+escapeHtml(item.name)+' <b>'+Math.round(item.share*100)+'%</b></span></div>').join('');
  const growth = report.growth.map((item,i)=>'<article class="growth-card"><span>GROWTH '+(i+1)+'</span><strong>'+escapeHtml(item.title)+'</strong><p>'+escapeHtml(item.body)+'</p></article>').join('');
  return '<section class="report-section"><h3>Where automation could release capacity</h3><p class="report-chart-intro">Illustrative allocation of the potential time opportunity across the business functions you selected. It is a planning model, not measured departmental waste.</p><div class="report-chart-grid"><article class="report-chart-card"><div class="report-chart-heading"><strong>Opportunity by function</strong><small>Share of estimated opportunity</small></div><div class="report-donut-wrap"><div class="report-donut" style="background:conic-gradient('+stops+')"><span>Potential<br>capacity</span></div><div class="report-legend">'+legend+'</div></div></article><article class="report-chart-card"><div class="report-chart-heading"><strong>Estimated annual capacity</strong><small>'+(Number(answers.hourlyCost||0)?'Indicative labour value':'Hours potentially reclaimed')+'</small></div><div class="report-bars">'+bars+'</div></article></div></section><section class="report-section"><h3>Where the business could grow</h3><p class="report-chart-intro">These are growth levers to investigate after improving the underlying workflows.</p><div class="growth-grid">'+growth+'</div></section>';
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
