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
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbymKnZtBunB4bAFlawNumQ9c96x-hiYesFbcnOdTHcsohN06DXz22wSDcxoEN1EZoq8/exec";
async function handleReportSend(request, env) {
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(request.url).origin) return json({ error: "Request origin not allowed." }, 403);
  if (!env.DONNINGER_EMAIL_TOKEN) return json({ error: "Email service is not configured. Add the DONNINGER_EMAIL_TOKEN Worker secret." }, 503);
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 8 * 1024 * 1024) return json({ error: "The report is too large to email." }, 413);
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const rateKey = new Request("https://donninger-email-rate-limit.invalid/" + encodeURIComponent(ip));
  try {
    const cached = await caches.default.match(rateKey);
    const count = cached ? Number(await cached.text()) : 0;
    if (count >= 3) return json({ error: "Too many reports have been sent from this connection. Please try again in 10 minutes." }, 429);
    await caches.default.put(rateKey, new Response(String(count + 1), { headers: { "Cache-Control": "max-age=600" } }));
  } catch (error) {
    console.error("Email rate-limit check failed:", error);
  }
  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid request." }, 400); }
  const email = String(body.email || "").trim();
  const pdfBase64 = String(body.pdfBase64 || "");
  const filename = String(body.filename || "Assessment-Report.pdf").replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 100);
  const businessName = String(body.businessName || "your business").slice(0, 120);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Please enter a valid email address." }, 400);
  if (!pdfBase64 || pdfBase64.length > 7 * 1024 * 1024 || !/^[A-Za-z0-9+/]+={0,2}$/.test(pdfBase64)) return json({ error: "The PDF attachment is missing or too large." }, 400);
  try {
    const upstream = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: env.DONNINGER_EMAIL_TOKEN, email, pdfBase64, filename, businessName }),
      redirect: "follow"
    });
    const text = await upstream.text();
    let result;
    try { result = JSON.parse(text); } catch { result = null; }
    if (!upstream.ok || !result || result.success !== true) {
      console.error("Apps Script email service response:", upstream.status, text.slice(0, 500));
      return json({ error: result?.message || "The email service did not confirm delivery. Please try again." }, 502);
    }
    return json({ success: true, message: "Your assessment report has been emailed." });
  } catch (error) {
    console.error("Report email request failed:", error);
    return json({ error: "The email service could not be reached. Please try again." }, 502);
  }
}
async function handleApi(request, env) {
  const url = new URL(request.url);
  if (url.pathname === "/api/reports/send") return handleReportSend(request, env);
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
