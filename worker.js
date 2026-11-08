const SESSION_COOKIE = "donninger_admin_session";
const SESSION_SECONDS = 8 * 60 * 60;

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers }
  });
}
function bytesToBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function base64UrlToBytes(value) {
  const normal = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normal + "=".repeat((4 - normal.length % 4) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}
async function sign(value, secret) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return bytesToBase64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value))));
}
function constantTimeEqual(a, b) {
  const left = new TextEncoder().encode(a);
  const right = new TextEncoder().encode(b);
  let diff = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i++) diff |= (left[i % (left.length || 1)] || 0) ^ (right[i % (right.length || 1)] || 0);
  return diff === 0;
}
function cookieValue(request, name) {
  const header = request.headers.get("Cookie") || "";
  const part = header.split(";").map(v => v.trim()).find(v => v.startsWith(name + "="));
  return part ? part.slice(name.length + 1) : "";
}
async function makeSession(email, secret) {
  const payload = bytesToBase64Url(new TextEncoder().encode(JSON.stringify({ email, role: "admin", exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS })));
  return payload + "." + await sign(payload, secret);
}
async function readSession(request, secret) {
  const token = cookieValue(request, SESSION_COOKIE);
  if (!token || !secret) return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;
  if (!constantTimeEqual(signature, await sign(payload, secret))) return null;
  try {
    const data = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload)));
    if (!data.email || data.role !== "admin" || !Number.isInteger(data.exp) || data.exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch { return null; }
}
function cookie(token, maxAge) {
  return SESSION_COOKIE + "=" + token + "; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=" + maxAge;
}
function htmlEscape(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function reportEmailHtml(report) {
  const list=(items)=>items.length?items.map((item,i)=>"<tr><td style='padding:12px;border-bottom:1px solid #e8edf1;color:#168577;font-weight:700'>0"+(i+1)+"</td><td style='padding:12px;border-bottom:1px solid #e8edf1;color:#243b54'><strong>"+htmlEscape(item.title||item)+"</strong>"+(item.body?"<br><span style='color:#68798a;font-size:13px'>"+htmlEscape(item.body)+"</span>":"")+"</td></tr>").join(""):"<tr><td style='padding:12px;color:#68798a'>No specific functions were recommended yet.</td></tr>";
  const scenarios=Number.isFinite(report.hoursPerWeek)&&Number.isFinite(report.hourlyCost)
    ? "<h2 style='font-size:20px;color:#18334b'>Illustrative time and cost scenarios</h2><p style='color:#68798a'>Based on "+report.hoursPerWeek+" hours per week and an estimated staff cost of $"+report.hourlyCost.toFixed(2)+" per hour. These scenarios show the value of time potentially released; they are not guaranteed cash savings.</p><table width='100%' cellspacing='0' style='border-collapse:collapse'><tr style='background:#f1f7f7'><th align='left' style='padding:10px'>Time released</th><th align='right' style='padding:10px'>Hours / week</th><th align='right' style='padding:10px'>Indicative annual capacity value</th></tr>"+[25,50,75].map(p=>"<tr><td style='padding:10px;border-bottom:1px solid #e8edf1'>"+p+"% scenario</td><td align='right' style='padding:10px;border-bottom:1px solid #e8edf1'>"+(report.hoursPerWeek*p/100).toFixed(1)+"</td><td align='right' style='padding:10px;border-bottom:1px solid #e8edf1'>$"+(report.hoursPerWeek*p/100*report.hourlyCost*52).toLocaleString("en-US",{maximumFractionDigits:0})+"</td></tr>").join("")+"</table><p style='font-size:12px;color:#8795a3'>Capacity value is not necessarily a reduction in payroll or cash expenditure. Actual results depend on implementation, adoption, workflow volume and whether released time reduces costs or is redeployed productively.</p>"
    : "<h2 style='font-size:20px;color:#18334b'>Savings assessment</h2><p style='color:#68798a'>We have not assigned a dollar savings figure because baseline staff time and hourly cost were not supplied. During workflow discovery, we can measure task volumes, time per task and avoidable rework to build a defensible estimate.</p>";
  const setup=Number(report.setup)||0, monthly=Number(report.monthly)||0;
  return "<div style='margin:0;background:#f3f6f8;padding:30px 12px;font-family:Arial,sans-serif;color:#243b54'><div style='max-width:720px;margin:auto;background:#fff;border-radius:12px;overflow:hidden'><div style='padding:30px 34px;background:#142b43;color:#fff'><div style='font-size:12px;letter-spacing:3px;color:#7ed6c8;font-weight:bold'>DONNINGER.AI</div><h1 style='font-size:27px;margin:14px 0 8px'>Your business assessment report</h1><p style='margin:0;color:#d5e1e9'>Build smarter. Operate better. Grow faster.</p></div><div style='padding:30px 34px'><p style='color:#7b8997;font-size:12px'>"+htmlEscape(report.assessmentType)+" · "+new Date().toLocaleDateString("en-US")+"</p><h2 style='font-size:22px;color:#18334b'>"+htmlEscape(report.title)+"</h2><p style='line-height:1.7;color:#53677b'>"+htmlEscape(report.summary)+"</p><div style='padding:18px;background:#eff9f6;border-left:4px solid #169888;border-radius:6px'><small style='color:#168577;font-weight:bold'>TOP PRIORITY</small><div style='font-size:18px;font-weight:bold;margin-top:5px'>"+htmlEscape(report.highlight)+"</div></div><h2 style='font-size:20px;color:#18334b;margin-top:28px'>Recommended priorities</h2><table width='100%' cellspacing='0' style='border-collapse:collapse'>"+list(report.priorities||[])+"</table>"+(report.requestedFunctions?.length?"<h2 style='font-size:20px;color:#18334b;margin-top:28px'>Functions you asked us to review</h2><p style='color:#53677b'>"+report.requestedFunctions.map(htmlEscape).join(" · ")+"</p>":"")+(report.recommendedFunctions?.length?"<h2 style='font-size:20px;color:#18334b'>Functions we recommend prioritising</h2><p style='color:#53677b'>"+report.recommendedFunctions.map(htmlEscape).join(" · ")+"</p>":"")+"<h2 style='font-size:20px;color:#18334b;margin-top:28px'>Proposed investment</h2>"+(report.setup===null||report.setup===undefined?"<p style='color:#53677b'>For a founder report, costs depend on which functions you choose as the business develops. Published pricing starts at $200 one-time setup + $20/month per function. The complete eight-function bundle is $1,000 setup + $100/month.</p>":"<table width='100%' cellspacing='0' style='border-collapse:collapse;background:#f5f8fa'><tr><td style='padding:12px'>One-time setup</td><td align='right' style='padding:12px;font-weight:bold'>$"+setup.toLocaleString("en-US")+"</td></tr><tr><td style='padding:12px'>Monthly subscription</td><td align='right' style='padding:12px;font-weight:bold'>$"+monthly.toLocaleString("en-US")+"/month</td></tr><tr><td style='padding:12px'>First 12 months</td><td align='right' style='padding:12px;font-weight:bold'>$"+(Number(report.firstYear)||0).toLocaleString("en-US")+"</td></tr></table>")+"<p style='font-size:12px;color:#8795a3'>The all-eight bundle is $1,000 setup + $100/month. Buying all eight separately is $1,600 setup + $160/month, saving $600 upfront and $60/month with the bundle. Third-party software, messaging and usage-based AI/API charges are separate.</p>"+scenarios+"<h2 style='font-size:20px;color:#18334b'>Suggested next steps</h2><ol style='line-height:1.8;color:#53677b'>"+(report.steps||[]).map(x=>"<li>"+htmlEscape(x)+"</li>").join("")+"</ol><p style='font-size:12px;line-height:1.6;color:#8795a3;border-top:1px solid #e8edf1;padding-top:18px'>"+htmlEscape(report.disclaimer)+"</p><p style='font-size:12px;color:#53677b'>This assessment is an initial planning document, not a binding quotation or guarantee of savings. Final scope, integrations, access permissions and any third-party costs must be confirmed before implementation.</p></div><div style='padding:18px 34px;background:#f5f8fa;color:#8795a3;font-size:11px'>Donninger.AI · Build smarter. Operate better. Grow faster.</div></div></div>";
}
async function sendAssessmentEmail(request,env) {
  if(!env.RESEND_API_KEY||!env.REPORT_FROM_EMAIL)return json({error:"Email delivery is not configured yet. Please try again later."},503);
  let body;try{body=await request.json();}catch{return json({error:"Invalid request."},400);}
  const email=String(body.email||"").trim();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||body.consent!==true)return json({error:"Enter a valid email address and agree to receive the requested report."},400);
  const r=body.report||{};
  if(typeof r.summary!=="string"||r.summary.length>5000||!Array.isArray(r.priorities)||r.priorities.length>20)return json({error:"The report details were invalid. Please regenerate your report."},400);
  const payload={from:env.REPORT_FROM_EMAIL,to:[email],subject:"Your Donninger.AI business assessment report",html:reportEmailHtml(r)};
  const sent=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":"Bearer "+env.RESEND_API_KEY,"Content-Type":"application/json"},body:JSON.stringify(payload)});
  if(!sent.ok)return json({error:"We could not deliver the report right now. Please try again shortly."},502);
  return json({sent:true});
}
async function handleApi(request, env) {
  const url = new URL(request.url);
  if (url.pathname === "/api/reports/email" && request.method === "POST") return sendAssessmentEmail(request, env);
  if (url.pathname === "/api/auth/login" && request.method === "POST") {
    if (!env.DEV_ADMIN_PASSWORD || !env.SESSION_SECRET) return json({ error: "Development authentication is not configured. Add the required Worker secrets in Cloudflare." }, 503);
    if (!env.DEV_ADMIN_ENABLED || env.DEV_ADMIN_ENABLED !== "true") return json({ error: "Development administrator access is disabled." }, 403);
    if (!request.headers.get("content-type")?.includes("application/json")) return json({ error: "Invalid request." }, 415);
    let body;
    try { body = await request.json(); } catch { return json({ error: "Invalid request." }, 400); }
    const expectedEmail = (env.DEV_ADMIN_EMAIL || "admin@donninger.ai").trim().toLowerCase();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!constantTimeEqual(email, expectedEmail) || !constantTimeEqual(password, env.DEV_ADMIN_PASSWORD)) {
      return json({ error: "The email address or password is incorrect." }, 401);
    }
    const token = await makeSession(expectedEmail, env.SESSION_SECRET);
    return json({ authenticated: true, email: expectedEmail, role: "admin" }, 200, { "set-cookie": cookie(token, SESSION_SECONDS) });
  }
  if (url.pathname === "/api/auth/session" && request.method === "GET") {
    const session = await readSession(request, env.SESSION_SECRET);
    return json(session ? { authenticated: true, email: session.email, role: session.role } : { authenticated: false });
  }
  if (url.pathname === "/api/auth/logout" && request.method === "POST") {
    return json({ authenticated: false }, 200, { "set-cookie": cookie("", 0) });
  }
  return json({ error: "Not found." }, 404);
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) return handleApi(request, env);
    return env.ASSETS.fetch(request);
  }
};
