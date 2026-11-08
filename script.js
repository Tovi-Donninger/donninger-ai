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
    '<div class="report-section"><h3>Your priority areas</h3><div class="report-recommendations">'+report.priorities.map((item,i)=>'<article><span>0'+(i+1)+'</span><div><strong>'+escapeHtml(item.title)+'</strong><p>'+escapeHtml(item.body)+'</p></div></article>').join('')+'</div></div>'+
    '<div class="report-section"><h3>Your next steps</h3><ol class="report-next-steps">'+report.steps.map(item=>'<li>'+escapeHtml(item)+'</li>').join('')+'</ol></div>'+
    '<p class="report-disclaimer">'+escapeHtml(report.disclaimer)+'</p>'+
    '<div class="assessment-actions report-actions"><button class="assessment-back" type="button" id="assessmentRestart">Start again</button><button class="button button-primary" type="button" id="assessmentPrint">Print / Save report <span>↗</span></button></div>';
  document.getElementById('assessmentRestart').addEventListener('click',()=>{currentStep=0;answers={};renderQuestion();});
  document.getElementById('assessmentPrint').addEventListener('click',()=>window.print());
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
    note = 'Indicative labour-capacity value using your hourly cost and a 20–30% reduction assumption. This is not a guaranteed cash saving.';
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
  const legend = chart.items.map(item=>'<div class="report-legend-item"><i style="background:'+item.colour+'"></i><span>'+escapeHtml(item.name)+'</span></div>').join('');
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
