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
  return '<section class="report-download-section"><div><span class="report-download-kicker"><span>DONNINGER.AI</span><span class="report-kicker-separator">·</span><span>YOUR REPORT</span></span><h3>Your report is ready</h3><p>Download a professionally formatted PDF with a consistent four-page layout.</p></div><button class="button button-primary" type="button" id="downloadReportPdf">Download PDF <span>↓</span></button></section>';
}
let pdfLibraryPromise;
function loadPdfLibrary() {
  if (window.PDFLib) return Promise.resolve(window.PDFLib);
  if (!pdfLibraryPromise) pdfLibraryPromise = new Promise((resolve,reject) => {
    const script=document.createElement('script');
    script.src='https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';
    script.async=true;
    script.onload=()=>window.PDFLib?resolve(window.PDFLib):reject(new Error('The PDF library did not load.'));
    script.onerror=()=>reject(new Error('Could not load the PDF generator. Check your internet connection and try again.'));
    document.head.appendChild(script);
  });
  return pdfLibraryPromise;
}
let pdfJsPromise;
function loadPdfJs() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if (!pdfJsPromise) pdfJsPromise = new Promise((resolve,reject) => {
    const script=document.createElement('script');
    script.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async=true;
    script.onload=()=>{
      if (!window.pdfjsLib) { reject(new Error('The PDF flattening library did not load.')); return; }
      window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(window.pdfjsLib);
    };
    script.onerror=()=>reject(new Error('Could not load the PDF flattening library. Check your internet connection and try again.'));
    document.head.appendChild(script);
  });
  return pdfJsPromise;
}
function pdfWinAnsiText(value) {
  return String(value??'')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g,'')
    .replace(/[’‘]/g,"'")
    .replace(/[“”]/g,'"')
    .replace(/[–—]/g,'-')
    .replace(/[…]/g,'...')
    .replace(/[•·]/g,'-')
    .replace(/[^\x20-\x7E\n]/g,' ')
    .replace(/[ \t]+/g,' ')
    .trim();
}
function safePdfText(value,max=900) {
  const text=pdfWinAnsiText(value).replace(/\r/g,'').replace(/\n{3,}/g,'\n\n').trim();
  if (text.length<=max) return text;
  return text.slice(0,Math.max(0,max-3)).trimEnd()+'...';
}
function pdfFilename(report) {
  const base=(report.clientName||report.title||'Donninger-AI-Assessment').toString()
    .normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').slice(0,55);
  return (base||'Donninger-AI-Assessment')+'-Assessment-Report.pdf';
}
async function createAssessmentPdf(report,isBusiness) {
  const PDFLib=await loadPdfLibrary();
  const {PDFDocument,StandardFonts,rgb}=PDFLib;
  const pdf=await PDFDocument.create();
  pdf.setTitle(pdfWinAnsiText((report.title||'Donninger.AI Assessment')+' | Donninger.AI'));
  pdf.setAuthor('Donninger.AI');
  pdf.setSubject(pdfWinAnsiText('Donninger.AI assessment report'));
  const regular=await pdf.embedFont(StandardFonts.Helvetica);
  const bold=await pdf.embedFont(StandardFonts.HelveticaBold);
  const W=595.28,H=841.89,LEFT=48,RIGHT=547,CONTENT=499;
  const ink=rgb(.12,.22,.32),muted=rgb(.39,.47,.55),teal=rgb(.10,.52,.48),pale=rgb(.94,.97,.98),line=rgb(.85,.89,.92),white=rgb(1,1,1);
  const drawText=(page,text,x,top,size=9,font=regular,color=ink)=>{
    page.drawText(pdfWinAnsiText(text),{x,y:H-top-size,size,font,color,maxWidth:CONTENT});
  };
  const rect=(page,x,top,width,height,fill=pale,border=line)=>{
    page.drawRectangle({x,y:H-top-height,width,height,color:fill,borderColor:border,borderWidth:.7});
  };
  const heading=(page,text,top)=>{
    page.drawText(pdfWinAnsiText(text),{x:LEFT,y:H-top-17,size:15,font:bold,color:ink});
    page.drawRectangle({x:LEFT,y:H-top-23,width:CONTENT,height:1,color:line});
  };
  const addField=(page,name,value,x,top,width,height,opts={})=>{
    const size=opts.fontSize||9;
    const font=opts.bold?bold:regular;
    const max=opts.maxLength||Math.max(80,Math.floor(width*height/size*.65));
    const raw=safePdfText(value,max);
    const padding=opts.padding??7;
    const maxWidth=width-padding*2;
    const lineHeight=size*1.42;
    const lines=[];
    String(raw).split(/\\n/).forEach(paragraph=>{
      const words=paragraph.split(/\\s+/).filter(Boolean);
      if(!words.length){lines.push('');return;}
      let lineText='';
      words.forEach(word=>{
        const candidate=lineText?lineText+' '+word:word;
        if(font.widthOfTextAtSize(candidate,size)<=maxWidth){lineText=candidate;return;}
        if(lineText) lines.push(lineText);
        lineText=word;
      });
      if(lineText) lines.push(lineText);
    });
    const maxLines=Math.max(1,Math.floor((height-padding*2)/lineHeight));
    const visible=lines.slice(0,maxLines);
    if(lines.length>maxLines&&visible.length){
      let last=visible[visible.length-1];
      while(last.length>1&&font.widthOfTextAtSize(last+'...',size)>maxWidth) last=last.slice(0,-1);
      visible[visible.length-1]=last+'...';
    }
    page.drawRectangle({x,y:H-top-height,width,height,color:white,borderColor:line,borderWidth:.65});
    visible.forEach((lineText,i)=>{
      if(lineText) page.drawText(lineText,{x:x+padding,y:H-top-padding-size-i*lineHeight,size,font,color:opts.color||ink});
    });
  };
  const addLabel=(page,label,x,top)=>{
    page.drawText(pdfWinAnsiText(label.toUpperCase()),{x,y:H-top-7,size:7,font:bold,color:muted});
  };
  const addHeader=(page,section,pageNo)=>{
    page.drawRectangle({x:0,y:H-9,width:W,height:9,color:teal});
    page.drawText('D.',{x:LEFT,y:H-48,size:24,font:bold,color:teal});
    page.drawText('DONNINGER.AI',{x:LEFT+34,y:H-35,size:10,font:bold,color:ink});
    page.drawText('BUSINESS AUTOMATION & GROWTH',{x:LEFT+34,y:H-47,size:6,font:regular,color:muted});
    page.drawText('CONFIDENTIAL ASSESSMENT',{x:405,y:H-38,size:6,font:bold,color:muted});
    page.drawRectangle({x:LEFT,y:H-60,width:CONTENT,height:1.2,color:ink});
    page.drawText(pdfWinAnsiText(section.toUpperCase()),{x:LEFT,y:H-78,size:7,font:bold,color:teal,characterSpacing:.7});
    page.drawRectangle({x:LEFT,y:35,width:CONTENT,height:.7,color:line});
    page.drawText('DONNINGER.AI  -  CONFIDENTIAL',{x:LEFT,y:21,size:6,font:bold,color:muted});
    page.drawText('PAGE '+pageNo+' OF 4',{x:500,y:21,size:6,font:bold,color:muted});
  };
  const addPage=(section,pageNo)=>{
    const page=pdf.addPage([W,H]); addHeader(page,section,pageNo); return page;
  };
  const company=answers.company||report.clientName||'Not provided';
  const industry=answers.industry||'Not provided';
  const team=answers.team||'Not provided';
  const goal=answers.goal||'Not specified';
  const date=new Date().toLocaleDateString();
  const title=report.title|| (isBusiness?'Business automation assessment':'Entrepreneurship assessment');
  const methodology=isBusiness
    ? 'This report is based on the business details, existing functions, automation interests, repetitive tasks and primary goal supplied in the assessment. We compared the requested areas with the operational signals in your answers. Recommendations are rules-based indicators for further discovery; they are not the result of an AI technical audit.'
    : 'This report is based on the business idea, market, stage, expected customer, revenue model, resources and support areas supplied in the assessment. The roadmap prioritises validation and practical next steps. It is an initial planning aid, not professional legal, tax or financial advice.';
  const p1=addPage('Assessment overview',1);
  drawText(p1,'YOUR PERSONALised REPORT'.toUpperCase(),LEFT,100,8,bold,teal);
  addField(p1,'report_title',title,LEFT,118,CONTENT,48,{fontSize:16,bold:true,maxLength:180});
  addLabel(p1,'Prepared for',LEFT,184);
  addField(p1,'client_name',company,LEFT,196,CONTENT,28,{fontSize:10,bold:true,maxLength:100});
  addLabel(p1,'Industry / sector',LEFT,238);
  addField(p1,'industry',industry,LEFT,250,CONTENT,27,{maxLength:100});
  if(isBusiness){
    addLabel(p1,'Team size',LEFT,292); addField(p1,'team_size',team,LEFT,304,CONTENT,27,{maxLength:70});
    addLabel(p1,'Primary business goal',LEFT,346); addField(p1,'business_goal',goal,LEFT,358,CONTENT,42,{maxLength:180});
  } else {
    addLabel(p1,'Business stage',LEFT,292); addField(p1,'business_stage',answers.stage||'Not provided',LEFT,304,CONTENT,27,{maxLength:100});
    addLabel(p1,'Expected customer',LEFT,346); addField(p1,'target_customer',answers.customer||'Not provided',LEFT,358,CONTENT,42,{maxLength:150});
  }
  heading(p1,'Executive summary',425);
  const executiveSummary = isBusiness
    ? (()=>{const requested=report.requestedFunctions||[];const recommended=report.recommendedFunctions||[];const focus=recommended.length?recommended.slice(0,3).join(', '):'mapping the highest-friction manual workflow';return 'This assessment reviewed '+industry.toLowerCase()+' operations for a team of '+team.toLowerCase()+', with the stated goal of '+goal.toLowerCase()+'. '+(requested.length?'You asked us to consider '+requested.length+' function(s): '+requested.join(', ')+'. ':'You did not select a specific function to automate. ')+(recommended.length?'The answers indicate that the strongest areas to investigate are '+focus+'. ':'There is not yet enough evidence to recommend a paid automation package. ')+'These are preliminary, rules-based recommendations and must be validated against your actual workflows, systems and costs.';})()
    : (()=>{const priorities=report.priorities||[];return 'Your idea is: '+safePdfText(answers.idea||'Not provided',180)+'. You are currently at the '+(answers.stage||'early planning')+' stage, aiming to serve '+(answers.customer||'a customer group still to be defined').toLowerCase()+'. '+(priorities.length?'The first priorities identified are '+priorities.slice(0,3).map(x=>x.title).join(', ')+'. ':'The next step is to clarify the customer problem and test demand. ')+'Use the roadmap to reduce uncertainty, validate assumptions and build in stages before committing significant resources.';})();
  addField(p1,'executive_summary',executiveSummary,LEFT,458,CONTENT,88,{fontSize:9.5,maxLength:650});
  heading(p1,'How to use this report',572);
  const reportGuidance = isBusiness
    ? '1. Check the “Business at a glance” table against your current operations. 2. Compare your requested functions with our independent recommendations. 3. Review the workflows and confirm that the examples match your processes. 4. Use the pricing breakdown as an initial estimate only. Before proceeding, Donninger.AI will confirm scope, integrations, approvals, data access and any third-party or usage-based costs with you.'
    : '1. Read the priorities and roadmap in order. 2. Speak with potential customers and test whether they will pay for the solution. 3. Validate competitors, costs, pricing and local legal requirements. 4. Start with the smallest practical version, measure real results and revise the plan as you learn. Don’t treat assumptions in this report as guaranteed outcomes or professional legal, tax or financial advice.';
  addField(p1,'report_guidance',reportGuidance,LEFT,605,CONTENT,112,{fontSize:8.5,maxLength:900});
  addField(p1,'report_date',date,LEFT,746,CONTENT,22,{fontSize:8,maxLength:40});
  addLabel(p1,'Report date',LEFT,735);

  if(isBusiness){
    const p2=addPage('Business function comparison',2);
    heading(p2,'Your business at a glance',100);
    drawText(p2,'A comparison of what is currently in place, what you asked to automate and what the assessment recommends exploring.',LEFT,132,8,regular,muted);
    const tableX=LEFT,tableTop=164,rowH=36;
    const colWidths=[220,82,94,103];
    const colX=[tableX,tableX+colWidths[0],tableX+colWidths[0]+colWidths[1],tableX+colWidths[0]+colWidths[1]+colWidths[2]];
    rect(p2,tableX,tableTop,CONTENT,34,ink,ink);
    const headerLabels=['BUSINESS FUNCTION','IN PLACE','REQUESTED','RECOMMENDED'];
    headerLabels.forEach((label,i)=>{
      const size=i===0?7:6.3;
      const textWidth=bold.widthOfTextAtSize(label,size);
      const x=i===0?colX[i]+9:colX[i]+(colWidths[i]-textWidth)/2;
      p2.drawText(pdfWinAnsiText(label),{x,y:H-tableTop-22,size,font:bold,color:white});
    });
    const all=['Sales & lead generation','Marketing','Customer service','Human resources & recruitment','Finance & accounting','Operations & administration','Stock, suppliers & logistics','Management & reporting'];
    all.forEach((name,i)=>{
      const top=tableTop+34+i*rowH;
      rect(p2,tableX,top,CONTENT,rowH,i%2?white:pale,line);
      p2.drawText(pdfWinAnsiText(name),{x:tableX+9,y:H-top-22,size:7.5,font:bold,color:ink});
      const statuses=[
        (answers.functions||[]).includes(name),
        (report.requestedFunctions||[]).includes(name),
        (report.recommendedFunctions||[]).includes(name)
      ];
      statuses.forEach((active,j)=>{
        const x=colX[j+1],w=colWidths[j+1];
        const label=active?'YES':'—';
        const color=active?(j===2?teal:ink):muted;
        if(active) p2.drawRectangle({x:x+14,y:H-(top+9)-18,width:w-28,height:18,color:j===2?rgb(.87,.95,.93):rgb(.91,.94,.96)});
        const tw=bold.widthOfTextAtSize(label,7);
        p2.drawText(pdfWinAnsiText(label),{x:x+(w-tw)/2,y:H-top-21,size:7,font:bold,color});
      });
    });
    heading(p2,'What you asked us to consider',526);
    addField(p2,'requested_functions',(report.requestedFunctions||[]).join(' • ')||'No specific functions selected.',LEFT,558,CONTENT,60,{fontSize:9,maxLength:400});
    heading(p2,'What the assessment recommends',635);
    addField(p2,'recommended_functions',(report.recommendedFunctions||[]).join(' • ')||'No paid function is recommended yet. Map a repetitive workflow before selecting a package.',LEFT,667,CONTENT,95,{fontSize:9,maxLength:600});

    const p3=addPage('Recommendations & opportunities',3);
    heading(p3,'Recommended areas to investigate',100);
    const recs=report.recommendedFunctions||[];
    const recList=recs.length?recs.map((name,i)=>(i+1)+'. '+name+': '+(functionDetails[name]?.task||'Review the current workflow, tools, ownership and approval requirements.')).join('\n\n'):'No specific paid function is recommended from the information currently available. Start by mapping one repetitive workflow and confirming its frequency, tools, owner and approval steps.';
    addField(p3,'recommendation_detail',recList,LEFT,133,CONTENT,235,{fontSize:9,maxLength:1800});
    heading(p3,'Growth opportunities',397);
    const growth=(report.growth||[]);
    const growthText=growth.length?growth.map((g,i)=>(i+1)+'. '+g.title+': '+g.body).join('\n\n'):'No additional growth opportunities were identified from the answers supplied.';
    addField(p3,'growth_opportunities',growthText,LEFT,430,CONTENT,150,{fontSize:9,maxLength:1100});
    heading(p3,'How we reached these findings',609);
    const methodText=[
      answers.company?'Business: '+answers.company:'',
      answers.industry?'Industry: '+answers.industry:'',
      answers.team?'Team size: '+answers.team:'',
      'Current functions: '+((answers.functions||[]).join(', ')||'Not specified'),
      'Tasks highlighted: '+((answers.tasks||[]).join(', ')||'Not specified'),
      'Primary goal: '+goal,
      methodology
    ].filter(Boolean).join('\n');
    addField(p3,'methodology',methodText,LEFT,642,CONTENT,126,{fontSize:7.5,maxLength:1100});

    const p4=addPage('Pricing & important information',4);
    heading(p4,'Indicative pricing breakdown',100);
    const count=(report.recommendedFunctions||[]).length;
    const individualSetup=count*200,individualMonthly=count*20;
    const useBundle=count>=6;
    const tableY=143;
    const headers=[['PACKAGE',LEFT+6],['SETUP',LEFT+260],['MONTHLY',LEFT+330],['FIRST YEAR',LEFT+415]];
    rect(p4,LEFT,tableY,CONTENT,30,ink,ink);
    headers.forEach(([t,x])=>p4.drawText(pdfWinAnsiText(t),{x,y:H-tableY-19,size:7,font:bold,color:white}));
    const priceRows=[
      ['Focused proposal ('+count+' functions)','$'+individualSetup.toLocaleString(),'$'+individualMonthly.toLocaleString(),'$'+(individualSetup+individualMonthly*12).toLocaleString()],
      ['Complete platform (8 functions)','$1,000','$100','$2,200']
    ];
    priceRows.forEach((row,i)=>{
      const top=tableY+30+i*38; rect(p4,LEFT,top,CONTENT,38,i%2?white:pale,line);
      p4.drawText(pdfWinAnsiText(row[0]),{x:LEFT+6,y:H-top-23,size:7,font:bold,color:ink});
      row.slice(1).forEach((v,j)=>p4.drawText(pdfWinAnsiText(v),{x:[LEFT+260,LEFT+330,LEFT+415][j],y:H-top-23,size:7,font:regular,color:ink}));
    });
    heading(p4,'Assessment recommendation',260);
    addField(p4,'pricing_recommendation',count
      ? (useBundle?'Based on the number of functions recommended, the complete platform bundle is the stronger overall value.':'Start with the focused proposal. The complete platform remains available if you expect to use the additional functions.')
      : 'We are not recommending a paid package yet. Clarify the first workflow before making an investment.',LEFT,293,CONTENT,62,{fontSize:9,maxLength:300});
    heading(p4,'Pricing terms',380);
    addField(p4,'pricing_terms','Each individual function is $200 one-time setup plus $20 per month. The complete eight-function bundle is $1,000 setup plus $100 per month. The monthly fee covers maintenance, support, upkeep and additions to the Donninger.AI product offering. Third-party subscriptions, messaging charges and usage-based AI/API costs are separate and disclosed before commitment. Implementation scope and integrations are confirmed before work begins.',LEFT,413,CONTENT,108,{fontSize:8,maxLength:900});
    heading(p4,'Important assessment notes',546);
    addField(p4,'disclaimer',report.disclaimer||'This assessment is an initial opportunity review and does not guarantee savings or financial results.',LEFT,579,CONTENT,100,{fontSize:8,maxLength:800});
    addField(p4,'client_notes','',LEFT,704,CONTENT,64,{fontSize:8,maxLength:400});
    addLabel(p4,'Additional information',LEFT,692);
  } else {
    const p2=addPage('Your priorities',2);
    heading(p2,'What you told us',100);
    addField(p2,'business_idea',answers.idea||'Not provided',LEFT,133,CONTENT,95,{fontSize:10,maxLength:700});
    heading(p2,'Resources already available',253);
    addField(p2,'available_resources',(answers.resources||[]).join(' • ')||'No resources selected yet.',LEFT,286,CONTENT,75,{fontSize:9,maxLength:500});
    heading(p2,'Areas where you want support',386);
    addField(p2,'support_areas',(answers.support||[]).join(' • ')||'No support areas selected yet.',LEFT,419,CONTENT,90,{fontSize:9,maxLength:600});
    heading(p2,'Your current position',534);
    addField(p2,'founder_context',['Stage: '+(answers.stage||'Not specified'),'Target customer: '+(answers.customer||'Not specified'),'Revenue model: '+(answers.model||'Not specified'),'Industry: '+industry].join('\n'),LEFT,567,CONTENT,105,{fontSize:9,maxLength:500});

    const p3=addPage('Recommended priorities & roadmap',3);
    heading(p3,'Recommended priorities',100);
    const priorities=(report.priorities||[]);
    const priorityText=priorities.map((item,i)=>(i+1)+'. '+item.title+': '+item.body).join('\n\n');
    addField(p3,'founder_priorities',priorityText||'Your answers did not identify specific priorities yet.',LEFT,133,CONTENT,240,{fontSize:9,maxLength:1700});
    heading(p3,'Practical next steps',405);
    addField(p3,'founder_roadmap',(report.steps||[]).map((step,i)=>(i+1)+'. '+step).join('\n\n'),LEFT,438,CONTENT,210,{fontSize:9,maxLength:1300});
    heading(p3,'Planning notes',681);
    addField(p3,'founder_notes','Use this space to record assumptions, questions and decisions as you validate the business idea.',LEFT,714,CONTENT,54,{fontSize:8,maxLength:350});

    const p4=addPage('Important information',4);
    heading(p4,'Assessment approach',100);
    addField(p4,'founder_methodology',methodology,LEFT,133,CONTENT,120,{fontSize:9,maxLength:800});
    heading(p4,'Important assessment notes',282);
    addField(p4,'founder_disclaimer',report.disclaimer||'This is an initial planning report, not professional advice.',LEFT,315,CONTENT,120,{fontSize:9,maxLength:800});
  }
  // Rasterise every finished page into a new image-only PDF, removing editable text objects and form fields.
  const sourceBytes=await pdf.save();
  const pdfjs=await loadPdfJs();
  const source=await pdfjs.getDocument({data:sourceBytes}).promise;
  const flattened=await PDFDocument.create();
  flattened.setTitle((report.title||'Donninger.AI Assessment')+' | Donninger.AI');
  flattened.setAuthor('Donninger.AI');
  flattened.setSubject('Static, flattened Donninger.AI assessment report');
  for(let pageNumber=1;pageNumber<=source.numPages;pageNumber++){
    const sourcePage=await source.getPage(pageNumber);
    const viewport=sourcePage.getViewport({scale:2});
    const canvas=document.createElement('canvas');
    canvas.width=Math.ceil(viewport.width); canvas.height=Math.ceil(viewport.height);
    const context=canvas.getContext('2d',{alpha:false});
    await sourcePage.render({canvasContext:context,viewport,background:'rgb(255,255,255)'}).promise;
    const binary=atob(canvas.toDataURL('image/png').split(',')[1]);
    const imageBytes=new Uint8Array(binary.length);
    for(let i=0;i<binary.length;i++) imageBytes[i]=binary.charCodeAt(i);
    const image=await flattened.embedPng(imageBytes);
    const page=flattened.addPage([W,H]);
    page.drawImage(image,{x:0,y:0,width:W,height:H});
    canvas.width=canvas.height=1;
    sourcePage.cleanup();
  }
  const bytes=await flattened.save();
  const blob=new Blob([bytes],{type:'application/pdf'});
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');
  link.href=url; link.download=pdfFilename(report);
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function bindDownloadReport() {
  const buttons=[document.getElementById('downloadReportPdf'),document.getElementById('assessmentPrint')].filter(Boolean);
  buttons.forEach(button=>button.addEventListener('click',async()=>{
    const report=activeAssessment===assessments.business?buildBusinessReport():buildFounderReport();
    const isBusiness=activeAssessment===assessments.business;
    const original=button.innerHTML;
    button.disabled=true; button.textContent='Preparing your PDF…';
    try { await createAssessmentPdf(report,isBusiness); button.textContent='PDF downloaded'; }
    catch(error) { console.error(error); button.textContent='Download failed'; window.alert(error.message||'The PDF could not be created. Please try again.'); }
    finally { setTimeout(()=>{button.disabled=false;button.innerHTML=original;},1800); }
  }));
}
function renderReport() {
  const isBusiness = activeAssessment === assessments.business;
  const report = isBusiness ? buildBusinessReport() : buildFounderReport();
  const intro = '<div class="report-document-brand"><span class="report-brand-mark">D.</span><div><strong>DONNINGER.AI</strong><small>BUSINESS AUTOMATION & GROWTH</small></div><span class="report-document-label">CONFIDENTIAL ASSESSMENT</span></div><div class="report-topline"><span class="assessment-kicker">YOUR DONNINGER.AI REPORT'+(isBusiness && report.clientName ? ' · PREPARED FOR '+escapeHtml(report.clientName) : '')+'</span><span class="report-date">'+new Date().toLocaleDateString()+'</span></div>'+
    '<h2 id="assessmentTitle">'+escapeHtml(report.title)+'</h2>'+
    '<p class="assessment-intro">'+escapeHtml(report.summary)+'</p>';
  const businessSections = isBusiness
    ? renderBusinessComparison(report)+renderBusinessPricing(report)
    : renderFounderSections(report);
  modalContent.innerHTML = intro+businessSections+
    '<section class="report-section report-notes"><h3>Important assessment notes</h3><p class="report-disclaimer">'+escapeHtml(report.disclaimer)+'</p></section>'+
    renderDownloadReportSection()+
    '<div class="assessment-actions report-actions"><button class="assessment-back" type="button" id="assessmentRestart">Start again</button><button class="button button-primary" type="button" id="assessmentPrint">Download PDF <span>↓</span></button></div>';
  document.getElementById('assessmentRestart').addEventListener('click',()=>{currentStep=0;answers={};renderQuestion();});
  
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
function renderBusinessMethodology(report) {
  const operating=answers.functions||[];
  const requested=report.requestedFunctions||[];
  const tasks=answers.tasks||[];
  const company=answers.company?answers.company.trim():'your business';
  const team=answers.team?(' with a team size of '+answers.team.toLowerCase()):'';
  const industry=answers.industry?answers.industry.toLowerCase():'the industry you selected';
  const context=operating.length
    ? 'You told us that '+company+' operates in '+industry+team+'. The functions currently in place are '+operating.join(', ')+'. This gives us a picture of the business areas that already exist and where workflows may cross between teams.'
    : 'You told us that '+company+' operates in '+industry+team+'. You did not identify any current business functions, so this report focuses on the activities and priorities you described rather than assuming a department or system is already in place.';
  const priorities=requested.length
    ? 'You specifically asked us to consider '+requested.join(', ')+'. '
    : 'You did not select a specific function to automate. ';
  const taskText=tasks.length
    ? 'You also highlighted '+tasks.join(', ').toLowerCase()+'. '
    : 'You did not identify a particular repetitive task, so the assessment relies more heavily on your stated business goal. ';
  const goal=answers.goal?answers.goal.toLowerCase():'your wider business priorities';
  const recommendations=report.recommendedFunctions||[];
  const decision=recommendations.length
    ? 'We then compared those signals with your stated goal — '+goal+' — and identified '+recommendations.join(', ')+' as the strongest areas to investigate first. A function is recommended where the task or goal gives us a practical reason to explore it; your selections alone do not automatically determine the recommendation.'
    : 'Your answers did not provide enough evidence to recommend a specific paid function confidently. Rather than inventing a need, we recommend mapping one repetitive workflow and confirming its volume, tools, owners and approval steps first.';
  return '<section class="report-section report-methodology"><h3>How we reached these findings</h3><p>'+escapeHtml(context)+'</p><p>'+escapeHtml(priorities+taskText)+'</p><p>'+escapeHtml(decision)+'</p><p class="report-method-note">Assessment approach: your answers are evaluated using a transparent, rules-based set of business workflow indicators. This is an initial opportunity assessment, not an AI-led technical audit or a guarantee of savings.</p></section>';
}
function renderFunctionComparisonChart(report) {
  const operating=answers.functions||[];
  const requested=report.requestedFunctions||[];
  const recommended=report.recommendedFunctions||[];
  const all=['Sales & lead generation','Marketing','Customer service','Human resources & recruitment','Finance & accounting','Operations & administration','Stock, suppliers & logistics','Management & reporting'];
  const rows=all.map(name=>{
    const current=operating.includes(name), wants=requested.includes(name), rec=recommended.includes(name);
    return '<div class="function-compare-row"><strong>'+escapeHtml(name)+'</strong><span class="function-compare-status '+(current?'is-active':'')+'">'+(current?'✓ Current':'—')+'</span><span class="function-compare-status '+(wants?'is-wanted':'')+'">'+(wants?'✓ Selected':'—')+'</span><span class="function-compare-status '+(rec?'is-recommended':'')+'">'+(rec?'✓ Recommended':'—')+'</span></div>';
  }).join('');
  return '<section class="report-section report-function-comparison"><h3>Business function comparison</h3><p class="report-chart-intro">This overview compares the functions you currently operate, the areas you asked us to automate, and the areas our assessment independently recommends exploring. A dash means that the category was not selected or recommended — it does not mean the business is missing that capability.</p><div class="function-compare-legend"><span><i class="legend-current"></i> Currently operate</span><span><i class="legend-wanted"></i> Want to automate</span><span><i class="legend-recommended"></i> Our recommendation</span></div><div class="function-compare-table"><div class="function-compare-head"><span>Business function</span><span>Current</span><span>Your choice</span><span>Our view</span></div>'+rows+'</div></section>';
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
  return renderBusinessMethodology(report)+renderFunctionComparisonChart(report)+
    '<section class="report-section report-customer-wants"><h3>1. What you want</h3><p class="report-chart-intro">The business functions you specifically asked us to consider.</p>'+requestedBlock+'</section>'+
    '<section class="report-section report-our-recommendations"><h3>2. What we recommend</h3><p class="report-chart-intro">These recommendations are based on the tasks, current business structure and goal you described — not simply on the functions selected.</p>'+recommendedBlock+'</section>'+
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
  const focusedRow=p.count?'<tr><td><strong>Focused proposal</strong><small>'+selectedLabel+'</small></td><td>$'+focusedSetup.toLocaleString()+'</td><td>$'+focusedMonthly.toLocaleString()+'</td><td>$'+focusedYear.toLocaleString()+'</td></tr>':'<tr><td><strong>Focused starting point</strong><small>Pricing applies once a suitable function is confirmed</small></td><td>—</td><td>—</td><td>—</td></tr>';
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
