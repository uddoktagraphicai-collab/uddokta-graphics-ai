// =====================================================================
//  উদ্যোক্তা গ্রাফিক্স AI — Supabase Edge Function API (Complete Backend)
//  Replaces Google Apps Script 100% with PostgreSQL + Cloudinary
// =====================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { buildCommand, formatFieldDefs, graphemes } from './engine.ts';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId, getCloudinaryConfig } from './cloudinary.ts';
import { getEpsConfig, initializePayment, checkTransactionStatus, clearEpsTokenCache, getEpsToken } from './eps.ts';

const DEFAULT_ALLOWED_ORIGINS = [
  'https://www.ecomdesignsolution.com',
  'https://ecomdesignsolution.com'
];

function getAllowedOrigins(): string[] {
  const envRaw = Deno.env.get('ALLOWED_ORIGINS') || '';
  const fromEnv = envRaw
    .split(',')
    .map((s) => s.trim().replace(/\/+$/, ''))
    .filter((s) => s && !s.includes('yourclientdomain.com'));
  return Array.from(new Set([...DEFAULT_ALLOWED_ORIGINS, ...fromEnv]));
}

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = (req.headers.get('origin') || '').trim().replace(/\/+$/, '');
  const allowed = getAllowedOrigins();
  const isLocalDev = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
  const allowOrigin = origin && (allowed.includes(origin) || isLocalDev)
    ? origin
    : DEFAULT_ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Vary': 'Origin'
  };
}

// ইন-মেমোরি স্লাইডিং উইন্ডো রেট লিমিটার (প্রতি আইসোলেটে ব্রুট-ফোর্স ও OTP বট সুরক্ষা)
const rateBuckets = new Map<string, number[]>();
function checkRateLimit(key: string, maxHits: number, windowMs: number): boolean {
  const now = Date.now();
  const cutoff = now - windowMs;
  const arr = (rateBuckets.get(key) || []).filter((ts) => ts > cutoff);
  if (arr.length >= maxHits) {
    rateBuckets.set(key, arr);
    return false;
  }
  arr.push(now);
  rateBuckets.set(key, arr);
  if (rateBuckets.size > 5000) {
    for (const [k, v] of rateBuckets.entries()) {
      if (!v.length || v[v.length - 1] < cutoff) rateBuckets.delete(k);
    }
  }
  return true;
}

function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip') || '';
  return (xff.split(',')[0] || 'unknown').trim().slice(0, 64);
}

function secureOtp4(): string {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return String(1000 + (arr[0] % 9000));
}

function timingSafeEqual(a: string, b: string): boolean {
  const ea = new TextEncoder().encode(a);
  const eb = new TextEncoder().encode(b);
  if (ea.length !== eb.length) return false;
  let diff = 0;
  for (let i = 0; i < ea.length; i++) diff |= ea[i] ^ eb[i];
  return diff === 0;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

async function hashPasswordPbkdf2(password: string): Promise<string> {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const keyMat = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, keyMat, 256);
  return `pbkdf2$${bytesToHex(salt)}$${bytesToHex(new Uint8Array(bits))}`;
}

async function verifyPasswordStored(password: string, stored: string): Promise<{ ok: boolean; needsUpgrade: boolean }> {
  if (!password || !stored) return { ok: false, needsUpgrade: false };
  if (stored.startsWith('pbkdf2$')) {
    const parts = stored.split('$');
    if (parts.length !== 3) return { ok: false, needsUpgrade: false };
    const salt = hexToBytes(parts[1]);
    const expectedHex = parts[2];
    const keyMat = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, keyMat, 256);
    const actualHex = bytesToHex(new Uint8Array(bits));
    return { ok: timingSafeEqual(actualHex, expectedHex), needsUpgrade: false };
  }
  // Legacy 64-char SHA-256 hash (auto-upgrades to PBKDF2 on successful login)
  if (/^[a-f0-9]{64}$/i.test(stored)) {
    const h = await sha256Hex(password);
    return { ok: timingSafeEqual(h, stored.toLowerCase()), needsUpgrade: true };
  }
  // Legacy plaintext (auto-upgrades to PBKDF2 on successful login)
  return { ok: timingSafeEqual(password, stored), needsUpgrade: true };
}

function isSafePublicUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
    const h = u.hostname.toLowerCase();
    if (
      h === 'localhost' ||
      h === '127.0.0.1' ||
      h === '::1' ||
      h === '0.0.0.0' ||
      h.endsWith('.local') ||
      h.endsWith('.internal') ||
      /^10\./.test(h) ||
      /^192\.168\./.test(h) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(h) ||
      /^169\.254\./.test(h)
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

async function fetchAllRows(
  supabase: any,
  table: string,
  orderCol?: string,
  ascending = false,
  maxRows = 10000
): Promise<any[]> {
  const pageSize = 1000;
  const all: any[] = [];
  for (let from = 0; from < maxRows; from += pageSize) {
    let q = supabase.from(table).select('*');
    if (orderCol) q = q.order(orderCol, { ascending });
    const { data, error } = await q.range(from, from + pageSize - 1);
    if (error || !data || data.length === 0) break;
    all.push(...data);
    if (data.length < pageSize) break;
  }
  return all;
}

const SECRET_SETTING_KEYS = new Set([
  'admin_password',
  'eps_password',
  'eps_hash_key',
  'cloudinary_api_secret',
  'sms_api_token',
  'brevo_api_key'
]);

const PUBLIC_SETTING_KEYS = [
  'price',
  'monthly',
  'days',
  'gateway_fee',
  'meta_pixel_id',
  'site_logo',
  'eps_checkout_banner',
  'eps_footer_desktop',
  'eps_footer_mobile'
];

function makeResponders(cors: Record<string, string>) {
  return {
    json(data: any, status = 200, extraHeaders: Record<string, string> = {}) {
      return new Response(JSON.stringify(data), {
        status,
        headers: {
          ...cors,
          'Content-Type': 'application/json',
          ...extraHeaders
        }
      });
    },
    html(content: string, status = 200) {
      return new Response(content, {
        status,
        headers: {
          ...cors,
          'Content-Type': 'text/html; charset=utf-8'
        }
      });
    }
  };
}

export interface SmsConfig {
  apiToken: string;
  senderId: string;
  apiUrl: string;
  otpTemplate: string;
  ready: boolean;
}

export function getSmsConfig(overrideMap?: Record<string, string>): SmsConfig {
  const get = (k: string) =>
    (overrideMap && (overrideMap[k.toLowerCase()] || overrideMap[k])) ||
    Deno.env.get(k) ||
    '';

  const apiToken = get('SMS_API_TOKEN');
  const senderId = get('SMS_SENDER_ID');
  const apiUrl = get('SMS_API_URL') || 'https://bulksmsbd.net/api/smsapi';
  const otpTemplate = get('SMS_OTP_TEMPLATE') || 'উদ্যোক্তা গ্রাফিক্স AI তে আপনার ওটিপি কোড: {otp}। মেয়াদ ৫ মিনিট।';
  const ready = Boolean(apiToken && !apiToken.includes('your_'));

  return { apiToken, senderId, apiUrl, otpTemplate, ready };
}

export interface BrevoConfig {
  apiKey: string;
  senderEmail: string;
  senderName: string;
  ready: boolean;
}

export function getBrevoConfig(overrideMap?: Record<string, string>): BrevoConfig {
  const get = (k: string) =>
    (overrideMap && (overrideMap[k.toLowerCase()] || overrideMap[k])) ||
    Deno.env.get(k) ||
    '';

  const apiKey = get('BREVO_API_KEY');
  const senderEmail = get('BREVO_SENDER_EMAIL');
  const senderName = get('BREVO_SENDER_NAME') || 'উদ্যোক্তা গ্রাফিক্স AI';
  const ready = Boolean(apiKey && !apiKey.includes('your_') && senderEmail && senderEmail.includes('@'));

  return { apiKey, senderEmail, senderName, ready };
}

export async function sendBrevoEmail(
  cfg: BrevoConfig,
  toEmail: string,
  otp: string,
  isTest = false
): Promise<{ ok: boolean; err?: string; id?: string }> {
  if (!cfg.ready) {
    return { ok: false, err: 'Brevo কনফিগারেশন অসম্পূর্ণ। API Key ও Sender Email চেক করুন।' };
  }

  const subject = isTest
    ? 'উদ্যোক্তা গ্রাফিক্স AI — Brevo টেস্ট ইমেইল'
    : `উদ্যোক্তা গ্রাফিক্স AI — ওটিপি কোড: ${otp}`;

  const htmlContent = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>${subject}</title></head>
<body style="margin:0;padding:24px;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid #e2e8f0;">
    <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:28px 24px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">উদ্যোক্তা গ্রাফিক্স AI</h1>
      <p style="margin:6px 0 0;color:#94a3b8;font-size:13px;">Ecom Design Solution</p>
    </div>
    <div style="padding:32px 28px;text-align:center;">
      <h2 style="margin:0 0 12px;font-size:18px;color:#0f172a;font-weight:600;">
        ${isTest ? 'Brevo টেস্ট কানেকশন সফল! 🎉' : 'আপনার ওটিপি ভেরিফিকেশন কোড'}
      </h2>
      <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.6;">
        ${isTest ? 'এটি একটি টেস্ট ইমেইল। আপনার Brevo API Key ও Sender Email একদম সঠিকভাবে কাজ করছে।' : 'উদ্যোক্তা গ্রাফিক্স AI-তে লগইন বা অ্যাকাউন্ট ভেরিফাই করতে নিচের ৪ ডিজিটের ওটিপি কোডটি ব্যবহার করুন:'}
      </p>
      <div style="margin:24px 0;display:inline-block;padding:16px 36px;background:#fff7ed;border:2px dashed #f97316;border-radius:12px;">
        <span style="font-size:36px;font-weight:800;letter-spacing:10px;color:#f97316;display:inline-block;padding-left:10px;">${otp}</span>
      </div>
      <p style="margin:16px 0 0;font-size:13px;color:#64748b;line-height:1.6;">
        ⏱️ এই কোডটির মেয়াদ <b>৫ মিনিট</b>।<br>
        🔒 নিরাপত্তার স্বার্থে এই কোডটি অন্য কারো সাথে শেয়ার করবেন না।
      </p>
      <div style="margin-top:24px;padding:14px 16px;background:#f8fafc;border-radius:10px;font-size:12.5px;color:#475569;text-align:left;line-height:1.6;border-left:4px solid #f97316;">
        💡 <b>প্রবাসী ভাইদের জন্য বিশেষ সুবিধা:</b> একবার ওটিপি দিয়ে পাসওয়ার্ড সেট করে নিলে পরবর্তীতে সৌদি আরব, ইউএই বা যেকোনো দেশ থেকে ওটিপি ছাড়াই সরাসরি পাসওয়ার্ড দিয়ে এক সেকেন্ডে লগইন করতে পারবেন।
      </div>
    </div>
    <div style="background:#f8fafc;padding:16px 24px;text-align:center;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;">
      © ${new Date().getFullYear()} উদ্যোক্তা গ্রাফিক্স AI · ecomdesignsolution.com
    </div>
  </div>
</body>
</html>`;

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': cfg.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: cfg.senderName || 'উদ্যোক্তা গ্রাফিক্স AI',
          email: cfg.senderEmail
        },
        to: [{ email: toEmail }],
        subject,
        htmlContent
      })
    });

    const resJson = await res.json().catch(() => null);
    if (!res.ok) {
      const errMsg = (resJson && (resJson.message || resJson.error)) || `Brevo HTTP ${res.status}`;
      return { ok: false, err: errMsg };
    }
    return { ok: true, id: resJson?.messageId };
  } catch (err: any) {
    return { ok: false, err: err.message || 'Brevo API নেটওয়ার্ক এরর' };
  }
}

function normIdentifier(input: string | null | undefined): { val: string; type: 'phone' | 'email' | '' } {
  const raw = String(input || '').trim().toLowerCase();
  if (!raw) return { val: '', type: '' };

  if (/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(raw)) {
    return { val: raw, type: 'email' };
  }

  let p = raw.replace(/\D/g, '');
  if (p.startsWith('880')) p = p.slice(2);
  if (/^01\d{9}$/.test(p)) {
    return { val: p, type: 'phone' };
  }

  return { val: '', type: '' };
}

function normPhone(p: string | null | undefined): string {
  const norm = normIdentifier(p);
  return norm.type === 'phone' ? norm.val : (norm.type === 'email' ? norm.val : '');
}

function todayDhaka(): string {
  // Asia/Dhaka date YYYY-MM-DD
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const dhaka = new Date(utc + 6 * 3600000);
  return dhaka.toISOString().slice(0, 10);
}

function addDays(ymd: string, n: number): string {
  const parts = ymd.split('-');
  const d = new Date(Date.UTC(+parts[0], +parts[1] - 1, +parts[2]));
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function diffDays(a: string, b: string): number {
  const pa = a.split('-'),
    pb = b.split('-');
  return Math.round(
    (Date.UTC(+pb[0], +pb[1] - 1, +pb[2]) - Date.UTC(+pa[0], +pa[1] - 1, +pa[2])) / 864e5
  );
}

async function sha256Hex(str: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function logActivity(supabase: any, action: string, detail: string, who = 'admin') {
  try {
    await supabase.from('log').insert({
      action: String(action || '').trim(),
      detail: String(detail || '').trim(),
      who: String(who || 'admin').trim(),
      at: new Date().toISOString()
    });
  } catch (e) {
    console.error('Activity log insert error:', e);
  }
}

function formatPubMember(m: any) {
  const today = todayDhaka();
  const left = m.expiry ? diffDays(today, m.expiry) : -1;
  const blocked = m.status === 'blocked' || m.status === 'বন্ধ';
  const paid = !blocked && (m.status === 'paid' || m.status === 'পেইড') && left >= 0;

  return {
    phone: m.phone,
    brand: m.brand || '',
    tagline: m.tagline || '',
    biz: m.biz || '',
    c1: m.c1 || '',
    c2: m.c2 || '',
    c3: m.c3 || '',
    shape: m.shape || 'square',
    logo_url: m.logo_url || '',
    paid,
    expired: !blocked && (m.status === 'paid' || m.status === 'পেইড') && left < 0,
    blocked,
    expiry: m.expiry || '',
    daysLeft: paid ? left : 0,
    left: 0,
    verified: Boolean(m.verified),
    hasPassword: Boolean(m.password_hash),
    brand_unlocked: Boolean(m.brand_unlocked)
  };
}

function formatAdminMember(m: any) {
  const pub = formatPubMember(m);
  const isBlocked = m.status === 'blocked' || m.status === 'বন্ধ';
  const isPaid = m.status === 'paid' || m.status === 'পেইড';
  const bnStatus = isBlocked ? 'বন্ধ' : isPaid ? 'পেইড' : 'নতুন';

  return {
    ...pub,
    status: bnStatus,
    joined: m.joined || '',
    last: m.last_seen ? String(m.last_seen) : (m.last || ''),
    made: Number(m.made) || 0,
    note: m.note || '',
    verified: Boolean(m.verified),
    hasPassword: Boolean(m.password_hash),
    brand_unlocked: Boolean(m.brand_unlocked)
  };
}

function formatAdminPayment(p: any) {
  const statusMap: Record<string, string> = {
    success: 'সফল',
    পেইড: 'সফল',
    সফল: 'সফল',
    cancelled: 'বাতিল',
    বাতিল: 'বাতিল',
    pending: 'অপেক্ষায়',
    অপেক্ষায়: 'অপেক্ষায়'
  };

  return {
    id: p.id,
    time: p.created_at || p.time || '',
    phone: p.phone,
    method: p.method || 'EPS',
    trx: p.trx || '',
    amount: p.amount,
    status: statusMap[p.status] || p.status || 'অপেক্ষায়',
    done_at: p.done_at,
    by: p.by || '',
    note: p.note || ''
  };
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  const { json } = makeResponders(corsHeaders);
  const clientIp = getClientIp(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  const url = new URL(req.url);

  // EPS Redirect Callback (?eps=back) — সর্বদা সার্ভার-সাইডে EPS API যাচাই করে স্ট্যাটাস নির্ধারণ
  if (url.searchParams.get('eps') === 'back') {
    const rawTx =
      url.searchParams.get('tx') ||
      url.searchParams.get('MerchantTransactionId') ||
      url.searchParams.get('merchantTransactionId') ||
      '';
    const m = rawTx.match(/^\d{10,}/);
    const tx = m ? m[0] : '';

    let verifyStatus = 'pending';
    if (tx) {
      try {
        const v = await verifyPayment(supabase, tx);
        verifyStatus = v.status || 'pending';
      } catch {}
    }

    const { data: stRow } = await supabase.from('settings').select('value').eq('key', 'app_url').single();
    let appUrl = stRow?.value || Deno.env.get('APP_URL') || '';
    if (!appUrl) {
      appUrl = 'https://www.ecomdesignsolution.com/app';
    }

    const isOk = verifyStatus === 'success' || verifyStatus === 'সফল';
    const isFail = verifyStatus === 'cancelled' || verifyStatus === 'বাতিল';

    const redirectLink = `${appUrl}${appUrl.includes('?') ? '&' : '?'}pay=back&st=${isOk ? 'ok' : isFail ? 'fail' : 'wait'}#${isOk ? 'paid' : 'member'}`;

    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectLink,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }

  // রিকোয়েস্ট বডি বা কুয়েরি পার্সিং (GET মেথড শুধুমাত্র পাবলিক রিড-অনলি অ্যাকশনের জন্য সীমাবদ্ধ)
  let q: any = {};
  if (req.method === 'GET') {
    const qParam = url.searchParams.get('q');
    if (qParam) {
      try {
        q = JSON.parse(qParam);
      } catch {
        return json({ ok: false, err: 'ভুল রিকোয়েস্ট' }, 400);
      }
      const getAct = String(q.action || '');
      if (getAct !== 'lp' && getAct !== 'content') {
        return json({ ok: false, err: 'এই অ্যাকশনের জন্য POST মেথড ব্যবহার করুন' }, 405);
      }
    } else {
      return json({ ok: true, msg: 'উদ্যোক্তা গ্রাফিক্স AI — Supabase API রানিং ✓' });
    }
  } else {
    try {
      q = await req.json();
    } catch {
      return json({ ok: false, err: 'ভুল রিকোয়েস্ট বডি' }, 400);
    }
  }

  const action = String(q.action || '');

  try {
    // -----------------------------------------------------------------
    // ১. পাবলিক কন্টেন্ট (Edge Caching সহ)
    // -----------------------------------------------------------------
    if (action === 'content') {
      const [
        { data: stList },
        { data: txtList },
        { data: catsList },
        { data: stylesList },
        { data: fieldsList },
        { data: bizList },
        { data: postsList },
        { data: contactList },
        { data: polList },
        { data: fixesList }
      ] = await Promise.all([
        supabase.from('settings').select('key,value').in('key', PUBLIC_SETTING_KEYS),
        supabase.from('texts').select('*'),
        supabase.from('cats').select('*').eq('show', true).order('sort'),
        supabase.from('styles').select('*').or('status.eq.published,status.eq.পাবলিশড').order('sort'),
        supabase.from('fields').select('*').order('sort'),
        supabase.from('biz').select('*').order('sort'),
        supabase.from('posts').select('*').eq('show', true).order('sort'),
        supabase.from('contact').select('*'),
        supabase.from('policies').select('*').order('sort'),
        supabase.from('fixes').select('*').order('sort')
      ]);

      const settingsMap: Record<string, string> = {};
      (stList || []).forEach((r: any) => (settingsMap[r.key] = r.value));

      const textsMap: Record<string, string> = {};
      (txtList || []).forEach((r: any) => (textsMap[r.key] = r.value));

      const contactMap: Record<string, string> = {};
      (contactList || []).forEach((r: any) => (contactMap[r.key] = r.value));

      const catIds = (catsList || []).map((c: any) => c.id);

      const tpls = (stylesList || [])
        .filter((s: any) => catIds.includes(s.cat))
        .map((s: any) => {
          const sFields = (fieldsList || []).filter((f: any) => f.sid === s.id);
          const fdef = formatFieldDefs(sFields);
          return {
            id: s.id,
            cat: s.cat,
            name: s.name,
            img: s.img,
            attach: s.attach,
            pop: Boolean(s.pop),
            fdef: fdef.map((f) => ({ name: f.name, ex: f.ex, lim: f.lim, req: f.req }))
          };
        });

      const rawGatewayFee = settingsMap.gateway_fee;
      const gatewayFeeVal = (rawGatewayFee !== undefined && rawGatewayFee !== null && String(rawGatewayFee).trim() !== '') ? String(rawGatewayFee).trim() : '0';

      const resData = {
        ok: true,
        settings: {
          price: settingsMap.price || '399',
          monthly: settingsMap.monthly || '33',
          days: settingsMap.days || '365',
          gateway_fee: gatewayFeeVal,
          meta_pixel_id: String(settingsMap.meta_pixel_id || '').trim(),
          site_logo: String(settingsMap.site_logo || '').trim(),
          eps_checkout_banner: String(settingsMap.eps_checkout_banner || '').trim(),
          eps_footer_desktop: String(settingsMap.eps_footer_desktop || '').trim(),
          eps_footer_mobile: String(settingsMap.eps_footer_mobile || '').trim()
        },
        texts: textsMap,
        cats: (catsList || []).map((c: any) => ({ id: c.id, name: c.name })),
        tpls,
        biz: (bizList || []).map((b: any) => b.name),
        posts: (postsList || []).map((p: any) => ({ img: p.img, tag: p.tag, title: p.title, link: p.link })),
        contact: contactMap,
        policies: (polList || []).map((p: any) => ({ key: p.key, title: p.title, text: p.text })),
        fixes: (fixesList || []).map((f: any) => ({ t: f.title, line: f.line }))
      };

      // Edge Caching (৫ মিনিট CDN ক্যাশ + ১০ মিনিট stale-while-revalidate — হাই ট্র্যাফিকে DB লোড ৯০%+ কমাবে)
      return json(resData, 200, {
        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
      });
    }

    if (action === 'lp') {
      const [{ data: cfgRow }, { data: txtList }, { data: pubStList }] = await Promise.all([
        supabase.from('landing_config').select('data').eq('id', 'main').single(),
        supabase.from('texts').select('key,value').like('key', 'L%'),
        supabase.from('settings').select('key,value').in('key', PUBLIC_SETTING_KEYS)
      ]);
      const tMap: Record<string, string> = {};
      (txtList || []).forEach((r: any) => {
        if (r.key && r.key.startsWith('L') && r.value) {
          tMap[r.key] = r.value;
        }
      });
      const pMap: Record<string, string> = {};
      (pubStList || []).forEach((r: any) => { pMap[r.key] = r.value || ''; });
      return json({
        ok: true,
        config: cfgRow?.data || null,
        t: tMap,
        pay: {
          price: pMap.price || '399',
          monthly: pMap.monthly || '33',
          days: pMap.days || '365',
          gateway_fee: pMap.gateway_fee || '0',
          meta_pixel_id: String(pMap.meta_pixel_id || '').trim(),
          site_logo: String(pMap.site_logo || '').trim(),
          eps_checkout_banner: String(pMap.eps_checkout_banner || '').trim(),
          eps_footer_desktop: String(pMap.eps_footer_desktop || '').trim(),
          eps_footer_mobile: String(pMap.eps_footer_mobile || '').trim()
        }
      }, 200, {
        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
      });
    }

    // -----------------------------------------------------------------
    // ২. কাস্টমার অথেন্টিকেশন ও ওটিপি (Phone OR Email Support)
    // -----------------------------------------------------------------
    const authId = normIdentifier(q.phone || q.email || q.identifier);
    const phone = authId.val;

    if (action === 'login') {
      if (!phone) return json({ ok: false, err: '১১ সংখ্যার সঠিক মোবাইল নম্বর অথবা ইমেইল এড্রেস দিন' });

      // IP-ভিত্তিক ওটিপি বট সুরক্ষা (প্রতি IP ১০ মিনিটে সর্বোচ্চ ৫টি ওটিপি)
      if (!checkRateLimit(`otp_ip:${clientIp}`, 5, 10 * 60 * 1000)) {
        return json({ ok: false, err: 'অতিরিক্ত ওটিপি অনুরোধ! অনুগ্রহ করে ১০ মিনিট পর আবার চেষ্টা করুন' }, 429);
      }

      // সার্ভার-সাইড OTP রেট লিমিট (৫৫ সেকেন্ডের মধ্যে একই নম্বরে/ইমেইলে পুনরায় OTP পাঠানো বন্ধ)
      const { data: prevOtp } = await supabase
        .from('otp_codes')
        .select('created_at')
        .eq('phone', phone)
        .single();
      if (prevOtp && prevOtp.created_at) {
        const elapsedSec = Math.floor((Date.now() - new Date(prevOtp.created_at).getTime()) / 1000);
        if (elapsedSec >= 0 && elapsedSec < 55) {
          return json({ ok: false, err: `অনুগ্রহ করে ${55 - elapsedSec} সেকেন্ড পর আবার ওটিপি চেষ্টা করুন` }, 429);
        }
      }

      // ক্রিপ্টোগ্রাফিকভাবে নিরাপদ ৪-সংখ্যার OTP তৈরি ও সেভ করা (ওটিপি যাচাইয়ের আগে members রো তৈরি নয়)
      const otp = secureOtp4();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      await supabase.from('otp_codes').upsert({
        phone,
        otp,
        expires_at: expiresAt,
        attempts: 0,
        created_at: new Date().toISOString()
      });

      if (authId.type === 'email') {
        // Brevo Email OTP Gateway কল
        const { data: stListForEmail } = await supabase
          .from('settings')
          .select('key,value')
          .in('key', ['brevo_api_key', 'brevo_sender_email', 'brevo_sender_name']);
        const stMapForEmail: Record<string, string> = {};
        (stListForEmail || []).forEach((r: any) => (stMapForEmail[r.key] = r.value));
        const brevoCfg = getBrevoConfig(stMapForEmail);

        if (!brevoCfg.ready) {
          return json({ ok: false, err: 'ইমেইল ওটিপি সার্ভিস এখনো কনফিগার করা হয়নি। অ্যাডমিন প্যানেল "সেটিংস" থেকে Brevo API Key ও Sender Email পূরণ করুন।' });
        }

        const mailRes = await sendBrevoEmail(brevoCfg, phone, otp);
        if (!mailRes.ok) {
          console.error('Brevo Gateway Error:', mailRes.err);
          return json({ ok: false, err: 'ইমেইল ওটিপি পাঠানো যায়নি: ' + (mailRes.err || 'Brevo ত্রুটি') });
        }
      } else {
        // SMS Gateway কল (BulkSMSBD - DB Settings || .env)
        const { data: stListForSms } = await supabase
          .from('settings')
          .select('key,value')
          .in('key', ['sms_api_token', 'sms_sender_id', 'sms_api_url', 'sms_otp_template']);
        const stMapForSms: Record<string, string> = {};
        (stListForSms || []).forEach((r: any) => (stMapForSms[r.key] = r.value));
        const smsCfg = getSmsConfig(stMapForSms);

        if (smsCfg.ready) {
          try {
            const tpl = smsCfg.otpTemplate || 'উদ্যোক্তা গ্রাফিক্স AI তে আপনার ওটিপি কোড: {otp}। মেয়াদ ৫ মিনিট।';
            const smsMsg = tpl.includes('{otp}') ? tpl.replace(/\{otp\}/g, otp) : `${tpl} ${otp}`;
            const formattedPhone = phone.startsWith('88') ? phone : `88${phone}`;
            await fetch(smsCfg.apiUrl, {
              method: 'POST',
              body: new URLSearchParams({
                api_key: smsCfg.apiToken,
                type: 'text',
                number: formattedPhone,
                senderid: smsCfg.senderId || '',
                message: smsMsg
              })
            });
          } catch (e) {
            console.error('BulkSMSBD Gateway Error:', e);
          }
        }
      }

      // ওটিপি যাচাইয়ের আগে কোনো ব্যক্তিগত মেম্বার তথ্য রিটার্ন করা হবে না
      return json({
        ok: true,
        otpSent: true,
        channel: authId.type
      });
    }

    if (action === 'verify_otp') {
      if (!phone) return json({ ok: false, err: 'সঠিক মোবাইল নম্বর অথবা ইমেইল দিন' });
      const enteredOtp = String(q.otp || '').trim();

      const { data: otpRow } = await supabase.from('otp_codes').select('*').eq('phone', phone).single();
      if (!otpRow) return json({ ok: false, err: 'কোনো ওটিপি অনুরোধ পাওয়া যায়নি। আবার চেষ্টা করুন।' });

      if (new Date(otpRow.expires_at).getTime() < Date.now()) {
        await supabase.from('otp_codes').delete().eq('phone', phone);
        return json({ ok: false, err: 'ওটিপির মেয়াদ শেষ হয়ে গেছে। আবার ওটিপি নিন।' });
      }

      if ((otpRow.attempts || 0) >= 5) {
        await supabase.from('otp_codes').delete().eq('phone', phone);
        return json({ ok: false, err: 'অনেকবার ভুল কোড দেওয়া হয়েছে। অনুগ্রহ করে নতুন ওটিপি নিন।' });
      }

      if (!timingSafeEqual(String(otpRow.otp), enteredOtp)) {
        await supabase.from('otp_codes').update({ attempts: (otpRow.attempts || 0) + 1 }).eq('phone', phone);
        return json({ ok: false, err: 'ভুল ওটিপি কোড! সঠিক কোডটি দিন।' });
      }

      await supabase.from('otp_codes').delete().eq('phone', phone);
      await supabase.from('otp_verified_tokens').delete().eq('phone', phone);
      const setupTok = `otp_${crypto.randomUUID().replace(/-/g, '')}${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
      await supabase.from('otp_verified_tokens').insert({
        token: setupTok,
        phone,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
      });

      return json({
        ok: true,
        setup_token: setupTok
      });
    }

    if (action === 'check_auth') {
      if (!phone) return json({ ok: false, err: 'সঠিক মোবাইল নম্বর অথবা ইমেইল দিন' });
      const { data: m } = await supabase
        .from('members')
        .select('verified, password_hash')
        .or(`phone.eq.${phone},email.eq.${phone}`)
        .maybeSingle();
      return json({
        ok: true,
        exists: Boolean(m),
        verified: Boolean(m && m.verified),
        hasPassword: Boolean(m && m.password_hash)
      });
    }

    if (action === 'set_password') {
      if (!phone) return json({ ok: false, err: 'সঠিক মোবাইল নম্বর অথবা ইমেইল দিন' });
      const pass = String(q.password || '').trim();
      if (!pass || pass.length < 6) return json({ ok: false, err: 'কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দিন' });
      const setupTok = String(q.setup_token || '').trim();

      if (!setupTok) {
        return json({ ok: false, err: 'অনুমোদিত নয়! পাসওয়ার্ড সেট বা রিসেট করতে ওটিপি যাচাই প্রয়োজন।' }, 401);
      }

      // সর্বদা বৈধ OTP setup_token বাধ্যতামূলক (কোনো বাইপাস অনুমোদিত নয়)
      const { data: tRow } = await supabase
        .from('otp_verified_tokens')
        .select('token, expires_at')
        .eq('token', setupTok)
        .eq('phone', phone)
        .single();
      if (!tRow || new Date(tRow.expires_at).getTime() <= Date.now()) {
        return json({ ok: false, err: 'ওটিপি সেশনের মেয়াদ শেষ বা অবৈধ! আবার ওটিপি যাচাই করুন।' }, 401);
      }
      await supabase.from('otp_verified_tokens').delete().eq('token', setupTok);

      const pHash = await hashPasswordPbkdf2(pass);
      const { data: existingMem } = await supabase
        .from('members')
        .select('phone, email')
        .or(`phone.eq.${phone},email.eq.${phone}`)
        .maybeSingle();

      let updated: any = null;
      let upErr: any = null;
      const memPhone = existingMem ? existingMem.phone : phone;

      if (existingMem) {
        const updatePayload: Record<string, any> = {
          password_hash: pHash,
          verified: true,
          last_seen: new Date().toISOString()
        };
        if (authId.type === 'email' && !existingMem.email) {
          updatePayload.email = phone;
        }
        const res = await supabase
          .from('members')
          .update(updatePayload)
          .eq('phone', memPhone)
          .select()
          .single();
        updated = res.data;
        upErr = res.error;
      } else {
        const res = await supabase
          .from('members')
          .insert({
            phone: memPhone,
            email: authId.type === 'email' ? phone : '',
            status: 'new',
            joined: todayDhaka(),
            made: 0,
            password_hash: pHash,
            verified: true,
            last_seen: new Date().toISOString()
          })
          .select()
          .single();
        updated = res.data;
        upErr = res.error;
      }

      if (upErr || !updated) return json({ ok: false, err: (upErr && upErr.message) || 'পাসওয়ার্ড সেট করা যায়নি' });
      // পাসওয়ার্ড বদলালে পুরোনো সেশন বাতিল করে নতুন সেশন টোকেন তৈরি
      await supabase.from('member_sessions').delete().eq('phone', memPhone);
      const sessTok = `ms_${crypto.randomUUID().replace(/-/g, '')}`;
      await supabase.from('member_sessions').insert({
        token: sessTok,
        phone: memPhone,
        expires_at: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
      });
      return json({ ok: true, member: formatPubMember(updated), session_token: sessTok });
    }

    if (action === 'login_password') {
      if (!phone) return json({ ok: false, err: 'সঠিক মোবাইল নম্বর অথবা ইমেইল দিন' });
      const pass = String(q.password || '').trim();
      if (!pass) return json({ ok: false, err: 'পাসওয়ার্ড লিখুন' });

      // ব্রুট-ফোর্স সুরক্ষা (প্রতি নম্বর/ইমেইল+IP ১৫ মিনিটে সর্বোচ্চ ৫ চেষ্টা)
      if (!checkRateLimit(`login:${phone}:${clientIp}`, 5, 15 * 60 * 1000)) {
        return json({ ok: false, err: 'অনেকবার ভুল পাসওয়ার্ড! ১৫ মিনিট পর আবার চেষ্টা করুন বা ওটিপি দিয়ে রিসেট করুন।' }, 429);
      }

      const { data: member } = await supabase
        .from('members')
        .select('*')
        .or(`phone.eq.${phone},email.eq.${phone}`)
        .maybeSingle();
      if (!member) return json({ ok: false, err: 'নম্বর/ইমেইল বা পাসওয়ার্ড সঠিক নয়' });

      if (!member.password_hash) {
        return json({ ok: false, needOtp: true, err: 'পাসওয়ার্ড সেট করা নেই, ওটিপি দিয়ে ভেরিফাই করুন' });
      }

      const ver = await verifyPasswordStored(pass, String(member.password_hash));
      if (!ver.ok) {
        return json({ ok: false, err: 'ভুল পাসওয়ার্ড' });
      }

      const memPhone = member.phone;
      const updateFields: Record<string, any> = { last_seen: new Date().toISOString() };
      if (ver.needsUpgrade) {
        updateFields.password_hash = await hashPasswordPbkdf2(pass);
      }
      if (authId.type === 'email' && !member.email) {
        updateFields.email = phone;
      }
      await supabase.from('members').update(updateFields).eq('phone', memPhone);

      const sessTok = `ms_${crypto.randomUUID().replace(/-/g, '')}`;
      await supabase.from('member_sessions').insert({
        token: sessTok,
        phone: memPhone,
        expires_at: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
      });
      return json({ ok: true, member: formatPubMember(member), session_token: sessTok });
    }

    if (!phone && !action.startsWith('a_')) {
      return json({ ok: false, err: 'সঠিক মোবাইল নম্বর অথবা ইমেইল দিন' });
    }

    // মেম্বার প্রটেক্টেড অ্যাকশনগুলোর জন্য বাধ্যতামূলক সেশন টোকেন যাচাই
    const memberProtectedActions = ['me', 'mypay', 'brand', 'cmd', 'my_history', 'clear_history', 'pay_start'];
    if (memberProtectedActions.includes(action)) {
      const mTok = String(q.tok || '').trim();
      if (!mTok) {
        return json({ ok: false, auth: false, err: 'লগইন সেশন পাওয়া যায়নি, আবার লগইন করুন' });
      }
      const { data: mSess } = await supabase
        .from('member_sessions')
        .select('token, expires_at, phone')
        .eq('token', mTok)
        .single();
      if (!mSess || new Date(mSess.expires_at).getTime() < Date.now()) {
        return json({ ok: false, auth: false, err: 'সেশনের মেয়াদ শেষ, আবার লগইন করুন' });
      }
      if (mSess.phone !== phone) {
        const { data: chkM } = await supabase.from('members').select('phone, email').eq('phone', mSess.phone).maybeSingle();
        if (!chkM || (chkM.phone !== phone && chkM.email !== phone)) {
          return json({ ok: false, auth: false, err: 'অননুমোদিত সেশন টোকেন' });
        }
      }
    }

    // -----------------------------------------------------------------
    // ৩. মেম্বার প্রোফাইল ও স্ট্যাটাস
    // -----------------------------------------------------------------
    if (action === 'me') {
      let { data: member } = await supabase
        .from('members')
        .select('*')
        .or(`phone.eq.${phone},email.eq.${phone}`)
        .maybeSingle();
      if (!member) return json({ ok: false, err: 'আগে লগইন করুন' });

      const memPhone = member.phone;
      // Pending পেমেন্ট ভেরিফাই
      const { data: pList } = await supabase
        .from('payments')
        .select('*')
        .eq('phone', memPhone)
        .eq('status', 'pending');

      if (pList && pList.length > 0) {
        for (const p of pList) {
          try {
            await verifyPayment(supabase, p.id);
          } catch {}
        }
        const { data: updatedMem } = await supabase.from('members').select('*').eq('phone', memPhone).single();
        if (updatedMem) member = updatedMem;
      }

      const { data: stillPending } = await supabase
        .from('payments')
        .select('id')
        .eq('phone', memPhone)
        .eq('status', 'pending');

      return json({
        ok: true,
        member: formatPubMember(member),
        pending: Boolean(stillPending && stillPending.length > 0)
      });
    }

    if (action === 'mypay') {
      const { data: pays } = await supabase
        .from('payments')
        .select('*')
        .eq('phone', phone)
        .neq('status', 'cancelled')
        .neq('status', 'বাতিল')
        .order('created_at', { ascending: false });

      const mapped = (pays || []).map((p: any) => ({
        date: String(p.created_at || p.time || '').slice(0, 10),
        method: p.method || 'EPS',
        amount: String(p.amount),
        status: p.status === 'success' || p.status === 'পেইড' ? 'সফল' : p.status === 'pending' ? 'অপেক্ষায়' : p.status
      }));

      return json({ ok: true, pays: mapped });
    }

    // -----------------------------------------------------------------
    // ৪. ব্র্যান্ড সেটআপ
    // -----------------------------------------------------------------
    if (action === 'brand') {
      let { data: member } = await supabase.from('members').select('*').eq('phone', phone).single();
      if (!member) return json({ ok: false, err: 'আগে লগইন করুন' });

      const pub = formatPubMember(member);
      if (!pub.paid) return json({ ok: false, err: 'আগে মেম্বারশিপ চালু করুন' });

      // ব্র্যান্ড লক চেক (যদি পূর্বে ব্র্যান্ড সেট করা থাকে এবং অ্যাডমিন আনলক না করে থাকে)
      if (member.brand && !member.brand_unlocked) {
        return json({ ok: false, err: 'আপনার ব্র্যান্ড তথ্য ইতোমধ্যে লক করা আছে। পরিবর্তনের জন্য অ্যাডমিনের সাথে যোগাযোগ করুন।' });
      }

      const name = (member.brand && !member.brand_unlocked ? member.brand : String(q.brand || member.brand || '')).trim().slice(0, 40);
      if (!name) return json({ ok: false, err: 'ব্র্যান্ডের নাম দিন' });

      const hex = (c: any) => {
        const s = String(c || '').trim();
        return /^#[0-9A-Fa-f]{6}$/.test(s) ? s.toUpperCase() : '';
      };

      let logoUrl = member.logo_url || '';
      const prevLogoUrl = member.logo_url || '';
      let stMapForLogo: Record<string, string> | null = null;
      if (q.logo !== undefined && typeof q.logo === 'string') {
        const rawLogo = q.logo.trim();
        if (rawLogo.startsWith('http://') || rawLogo.startsWith('https://')) {
          if (!isSafePublicUrl(rawLogo)) {
            return json({ ok: false, err: 'অবৈধ লোগো URL' });
          }
          logoUrl = rawLogo;
        } else if (rawLogo.startsWith('data:image/')) {
          if (!/^data:image\/(png|jpeg|jpg|webp);base64,/i.test(rawLogo)) {
            return json({ ok: false, err: 'শুধুমাত্র PNG, JPG বা WebP ফরম্যাটের লোগো আপলোড করা যাবে' });
          }
          if (rawLogo.length > 450000) {
            return json({ ok: false, err: 'লোগোর সাইজ অনেক বড় (সর্বোচ্চ ৩০০ KB অনুমোদিত)' });
          }
          try {
            const { data: stList } = await supabase.from('settings').select('*');
            stMapForLogo = {};
            (stList || []).forEach((r: any) => (stMapForLogo![r.key] = r.value));
            const cldCfg = getCloudinaryConfig(stMapForLogo);
            if (cldCfg.cloudName && cldCfg.apiKey && cldCfg.apiSecret) {
              const upRes = await uploadToCloudinary(rawLogo, `logo_${phone}_${Date.now()}.png`, stMapForLogo, 'member_logos');
              if (upRes.ok && upRes.url) {
                logoUrl = upRes.url;
                if (prevLogoUrl && prevLogoUrl !== logoUrl && prevLogoUrl.includes('res.cloudinary.com')) {
                  try { await deleteFromCloudinary(prevLogoUrl, stMapForLogo); } catch {}
                }
              } else {
                return json({ ok: false, err: 'লোগো আপলোড ব্যর্থ হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন' });
              }
            } else {
              logoUrl = rawLogo;
            }
          } catch {
            return json({ ok: false, err: 'লোগো আপলোড করতে সমস্যা হয়েছে, আবার চেষ্টা করুন' });
          }
        } else if (rawLogo === 'clear' || rawLogo === 'delete') {
          logoUrl = '';
          if (prevLogoUrl && prevLogoUrl.includes('res.cloudinary.com')) {
            try {
              if (!stMapForLogo) {
                const { data: stList } = await supabase.from('settings').select('*');
                stMapForLogo = {};
                (stList || []).forEach((r: any) => (stMapForLogo![r.key] = r.value));
              }
              await deleteFromCloudinary(prevLogoUrl, stMapForLogo);
            } catch {}
          }
        }
      }

      const updateData: any = {
        brand: name,
        tagline: String(q.tagline || '').trim().slice(0, 80),
        biz: String(q.biz || '').trim().slice(0, 40),
        c1: hex(q.c1),
        c2: hex(q.c2),
        c3: hex(q.c3),
        shape: ['wide', 'square', 'tall'].includes(q.shape) ? q.shape : 'square',
        logo_url: logoUrl,
        brand_unlocked: false
      };

      const { data: updatedMem, error: upErr } = await supabase
        .from('members')
        .update(updateData)
        .eq('phone', phone)
        .select()
        .single();

      if (upErr || !updatedMem) {
        return json({ ok: false, err: (upErr && upErr.message) || 'ব্র্যান্ড সেভ করা যায়নি' });
      }

      return json({ ok: true, member: formatPubMember(updatedMem) });
    }

    // -----------------------------------------------------------------
    // ৫. কমান্ড তৈরি (Command Generator Engine) & হিস্ট্রি সংরক্ষণ
    // -----------------------------------------------------------------
    if (action === 'cmd') {
      let { data: member } = await supabase.from('members').select('*').eq('phone', phone).single();
      if (!member) return json({ ok: false, err: 'আগে লগইন করুন' });

      const pub = formatPubMember(member);
      if (!pub.paid) return json({ ok: true, locked: true, member: pub });

      const { data: tpl } = await supabase
        .from('styles')
        .select('*')
        .eq('id', q.tid)
        .or('status.eq.published,status.eq.পাবলিশড')
        .single();

      if (!tpl) return json({ ok: false, err: 'স্টাইলটা পাওয়া যায়নি, অ্যাপ রিফ্রেশ করুন' });

      const { data: rawFields } = await supabase.from('fields').select('*').eq('sid', tpl.id).order('sort');
      const fdef = formatFieldDefs(rawFields || []);

      const { data: baseRow } = await supabase.from('settings').select('value').eq('key', 'base_command').single();
      const baseCommand = baseRow?.value || '';

      const { data: bizRows } = await supabase.from('biz').select('*');
      const bizMoodMap: Record<string, string> = {};
      (bizRows || []).forEach((b: any) => (bizMoodMap[b.name] = b.mood));

      const tplObj = {
        id: tpl.id,
        style: tpl.style || '',
        logo: tpl.logo || 'top-left',
        font1: tpl.font1,
        font2: tpl.font2,
        fdef
      };

      const res = buildCommand(tplObj, member, q.vals || {}, baseCommand, bizMoodMap);

      if (res.missing.length) {
        return json({ ok: false, err: `"${res.missing[0]}" ঘরটা লিখুন` });
      }
      if (res.tooLong.length) {
        return json({ ok: false, err: `"${res.tooLong[0]}" ঘরে লিমিটের চেয়ে বেশি লেখা হয়েছে, একটু ছোট করুন` });
      }

      // অ্যাটমিক কাউন্টার বৃদ্ধি (কনকারেন্ট রেস কন্ডিশন রোধ)
      const { error: incErr } = await supabase.rpc('increment_cmd_counters', {
        p_phone: phone,
        p_style_id: tpl.id
      });
      if (incErr) {
        await supabase.from('members').update({
          made: (Number(member.made) || 0) + 1,
          last_seen: new Date().toISOString()
        }).eq('phone', phone);
        await supabase.from('styles').update({
          used: (Number(tpl.used) || 0) + 1
        }).eq('id', tpl.id);
      }

      // ডিজাইন হিস্ট্রি সেভ (PostgreSQL design_history)
      try {
        await supabase.from('design_history').insert({
          phone: member.phone,
          tid: tpl.id,
          style_name: tpl.name || tpl.style || '',
          style_img: tpl.img || '',
          cmd: res.cmd,
          vals: q.vals || {}
        });
      } catch (hErr) {
        console.error('Design history save error:', hErr);
      }

      return json({ ok: true, cmd: res.cmd, member: pub });
    }

    // -----------------------------------------------------------------
    // ৫.১ আমার তৈরি ডিজাইন হিস্ট্রি (my_history, clear_history)
    // -----------------------------------------------------------------
    if (action === 'my_history') {
      let { data: member } = await supabase.from('members').select('*').eq('phone', phone).single();
      if (!member) return json({ ok: false, err: 'আগে লগইন করুন' });

      const limit = Math.min(Number(q.limit) || 30, 50);
      const { data: rows, error } = await supabase
        .from('design_history')
        .select('*')
        .eq('phone', phone)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) return json({ ok: false, err: error.message });
      return json({ ok: true, history: rows || [] });
    }

    if (action === 'clear_history') {
      let { data: member } = await supabase.from('members').select('*').eq('phone', phone).single();
      if (!member) return json({ ok: false, err: 'আগে লগইন করুন' });

      if (q.id) {
        await supabase.from('design_history').delete().eq('phone', phone).eq('id', q.id);
      } else {
        await supabase.from('design_history').delete().eq('phone', phone);
      }
      return json({ ok: true });
    }

    // -----------------------------------------------------------------
    // ৬. পেমেন্ট ইনিশিয়ালাইজেশন (pay_start)
    // -----------------------------------------------------------------
    if (action === 'pay_start') {
      let { data: member } = await supabase.from('members').select('*').eq('phone', phone).single();
      if (!member) return json({ ok: false, err: 'আগে লগইন করুন' });

      const pub = formatPubMember(member);
      if (pub.blocked) return json({ ok: false, err: 'অ্যাকাউন্টটা বন্ধ আছে' });

      const { data: stList } = await supabase.from('settings').select('*');
      const stMap: Record<string, string> = {};
      (stList || []).forEach((r: any) => (stMap[r.key] = r.value));

      const epsCfg = getEpsConfig(stMap);
      if (!epsCfg.ready) return json({ ok: false, err: 'পেমেন্ট গেটওয়ে কনফিগারেশন এখনো সম্পন্ন হয়নি' });

      const basePrice = Number(stMap.price) || 399;
      const rawFee = stMap.gateway_fee;
      const feePct = (rawFee !== undefined && rawFee !== null && String(rawFee).trim() !== '')
        ? Math.max(0, Number(rawFee) || 0)
        : 0;
      const feeAmt = (basePrice > 0 && feePct > 0)
        ? Math.ceil(Number(((basePrice * feePct) / 100).toFixed(4)))
        : 0;
      const totalPayable = basePrice + feeAmt;

      const tx = String(Date.now()) + String(Math.floor(100 + Math.random() * 900));
      
      // EPS requires returnUrl domain to match the registered merchant BaseUrl (e.g. ecomdesignsolution.com)
      let returnBase = '';
      const appUrlSetting = stMap.app_url || Deno.env.get('APP_URL') || '';
      if (appUrlSetting) {
        try {
          const u = new URL(appUrlSetting);
          const host = u.host.replace(/^www\./i, '');
          returnBase = `${u.protocol}//${host}/api`;
        } catch {}
      }
      if (!returnBase) {
        returnBase = 'https://ecomdesignsolution.com/api';
      }
      const returnUrl = `${returnBase}?eps=back&tx=${tx}`;

      try {
        const initRes = await initializePayment(epsCfg, tx, totalPayable, member, returnUrl);

        const feeNote = feeAmt > 0 ? `প্যাকেজ ৳${basePrice} + গেটওয়ে চার্জ (${feePct}%) ৳${feeAmt}` : '';
        const modeNote = epsCfg.mode === 'sandbox' ? 'টেস্ট (sandbox)' : '';
        const payNote = [feeNote, modeNote].filter(Boolean).join(' · ');

        const { error: payInsErr } = await supabase.from('payments').insert({
          id: tx,
          phone: member.phone,
          method: 'EPS',
          amount: totalPayable,
          status: 'pending',
          note: payNote
        });
        if (payInsErr) return json({ ok: false, err: 'পেমেন্ট রেকর্ড তৈরি ব্যর্থ: ' + payInsErr.message });

        return json({ ok: true, url: initRes.redirectUrl, basePrice, feePct, feeAmt, totalPayable });
      } catch (err: any) {
        return json({ ok: false, err: err.message || 'পেমেন্ট শুরু করা যায়নি' });
      }
    }

    // -----------------------------------------------------------------
    // ৭. অ্যাডমিন অ্যাকশনসমূহ (Admin CMS)
    // -----------------------------------------------------------------
    if (action.startsWith('a_')) {
      if (action === 'a_login') {
        // অ্যাডমিন লগইন ব্রুট-ফোর্স সুরক্ষা (প্রতি IP ১৫ মিনিটে সর্বোচ্চ ৫ চেষ্টা)
        if (!checkRateLimit(`admin_login:${clientIp}`, 5, 15 * 60 * 1000)) {
          return json({ ok: false, err: 'অতিরিক্ত ভুল অ্যাডমিন লগইন চেষ্টা! ১৫ মিনিট পর আবার চেষ্টা করুন।' }, 429);
        }

        const pass = String(q.pass || '');
        if (!pass) return json({ ok: false, err: 'পাসওয়ার্ড দিন' });

        const { data: pRow } = await supabase.from('settings').select('value').eq('key', 'admin_password').single();
        const dbPass = String(pRow?.value || '').trim();
        const envPass = String(Deno.env.get('ADMIN_PASSWORD') || '').trim();
        const envHash = String(Deno.env.get('ADMIN_PASSWORD_HASH') || '').trim();

        let isValid = false;
        let shouldUpgradeDbPass = false;

        // DB-তে পাসওয়ার্ড সেট করা থাকলে শুধুমাত্র সেটিই যাচাই হবে (স্থায়ী env ব্যাকডোর বন্ধ)
        if (dbPass) {
          const ver = await verifyPasswordStored(pass, dbPass);
          isValid = ver.ok;
          shouldUpgradeDbPass = ver.ok && ver.needsUpgrade;
        } else if (envPass) {
          const ver = await verifyPasswordStored(pass, envPass);
          isValid = ver.ok;
        } else if (envHash) {
          const passHash = await sha256Hex(pass);
          isValid = timingSafeEqual(passHash, envHash.toLowerCase());
        } else {
          return json({ ok: false, err: 'অ্যাডমিন পাসওয়ার্ড কনফিগার করা নেই' });
        }

        if (isValid) {
          if (shouldUpgradeDbPass) {
            try {
              const upgraded = await hashPasswordPbkdf2(pass);
              await supabase.from('settings').upsert({ key: 'admin_password', value: upgraded }, { onConflict: 'key' });
            } catch {}
          }
          // মেয়াদোত্তীর্ণ পুরোনো অ্যাডমিন সেশন পরিষ্কার
          await supabase.from('admin_sessions').delete().lt('expires_at', new Date().toISOString());
          const tok = `adm_${crypto.randomUUID().replace(/-/g, '')}`;
          await supabase.from('admin_sessions').insert({
            token: tok,
            expires_at: new Date(Date.now() + 6 * 3600 * 1000).toISOString()
          });
          await logActivity(supabase, 'অ্যাডমিন লগইন', 'অ্যাডমিন প্যানেলে সফলভাবে লগইন করা হয়েছে');
          return json({ ok: true, tok });
        }
        return json({ ok: false, err: 'ভুল অ্যাডমিন পাসওয়ার্ড' }, 401);
      }

      // টোকেন ভ্যালিডেশন
      const tok = q.tok;
      const { data: sess } = await supabase
        .from('admin_sessions')
        .select('*')
        .eq('token', tok)
        .single();

      if (!sess || new Date(sess.expires_at).getTime() < Date.now()) {
        return json({ ok: false, auth: false, err: 'লগইনের মেয়াদ শেষ, আবার লগইন করুন' });
      }

      if (action === 'a_logout') {
        await supabase.from('admin_sessions').delete().eq('token', tok);
        return json({ ok: true });
      }

      if (action === 'a_dash') {
        const today = todayDhaka();
        const weekAgo = addDays(today, -7);

        const [{ count: mCount }, memList, payList, { data: stList }] =
          await Promise.all([
            supabase.from('members').select('*', { count: 'exact', head: true }),
            fetchAllRows(supabase, 'members', 'joined', false),
            fetchAllRows(supabase, 'payments', 'created_at', false),
            supabase.from('styles').select('name, used').order('used', { ascending: false }).limit(6)
          ]);

        let paidCount = 0;
        let soonCount = 0;
        let totalMade = 0;
        let newWeekCount = 0;
        const brandOf: Record<string, string> = {};

        (memList || []).forEach((m: any) => {
          brandOf[m.phone] = m.brand || '';
          const pub = formatPubMember(m);
          if (pub.paid) {
            paidCount++;
            if (pub.daysLeft <= 15) soonCount++;
          }
          if (m.joined && m.joined >= weekAgo) {
            newWeekCount++;
          }
          totalMade += Number(m.made) || 0;
        });

        const successPays = (payList || []).filter((p: any) => p.status === 'success' || p.status === 'সফল' || p.status === 'পেইড');
        const pendingCount = (payList || []).filter((p: any) => p.status === 'pending' || p.status === 'অপেক্ষায়').length;
        const totalRev = successPays.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);

        // চলতি মাসের হিসাব (Dhaka Time Month YYYY-MM)
        const curMonthPrefix = today.slice(0, 7);
        const curMonthPays = successPays.filter((p: any) => {
          const rawDate = String(p.done_at || p.created_at || p.time || '');
          return rawDate.slice(0, 7) === curMonthPrefix;
        });
        const monthRev = curMonthPays.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);

        const recent = (payList || []).slice(0, 6).map((p: any) => ({
          ...formatAdminPayment(p),
          brand: brandOf[p.phone] || ''
        }));

        return json({
          ok: true,
          members: mCount || 0,
          paid: paidCount,
          soon: soonCount,
          newWeek: newWeekCount,
          made: totalMade,
          pending: pendingCount,
          revMonth: monthRev,
          revTotal: totalRev,
          top: stList || [],
          recent
        });
      }

      // সিস্টেম ও গেটওয়ে লাইভ হেলথ চেক (BulkSMSBD ব্যালেন্স, Cloudinary স্টোরেজ, Supabase পিং, EPS)
      if (action === 'a_health') {
        const t0 = Date.now();
        const { data: stList } = await supabase.from('settings').select('*');
        const dbMs = Date.now() - t0;
        const stMap: Record<string, string> = {};
        (stList || []).forEach((r: any) => (stMap[r.key] = r.value));

        const smsCfg = getSmsConfig(stMap);
        const cldCfg = getCloudinaryConfig(stMap);
        const epsCfg = getEpsConfig(stMap);

        const fetchWithTimeout = async (url: string, init: RequestInit = {}, ms = 6000) => {
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), ms);
          try {
            return await fetch(url, { ...init, signal: ctrl.signal });
          } finally {
            clearTimeout(timer);
          }
        };

        const checkSms = async () => {
          if (!smsCfg.ready) return { ready: false, ok: false, balance: null, estSms: null };
          try {
            const balUrl = `https://bulksmsbd.net/api/getBalanceApi?api_key=${encodeURIComponent(smsCfg.apiToken)}`;
            const res = await fetchWithTimeout(balUrl, { method: 'GET' });
            const txt = await res.text();
            let balNum: number | null = null;
            try {
              const j = JSON.parse(txt);
              const raw = j.balance ?? j.Balance ?? j.data?.balance ?? j.credit ?? null;
              if (raw !== null && raw !== undefined && String(raw).trim() !== '') {
                const parsed = parseFloat(String(raw).replace(/[^\d.-]/g, ''));
                if (!isNaN(parsed)) balNum = parsed;
              }
            } catch {
              const m = txt.match(/(\d+(?:\.\d+)?)/);
              if (m) balNum = parseFloat(m[1]);
            }
            const estSms = (balNum !== null && balNum >= 0) ? Math.floor(balNum / 0.35) : null;
            return { ready: true, ok: balNum !== null, balance: balNum, estSms, senderId: smsCfg.senderId || '' };
          } catch (e: any) {
            return { ready: true, ok: false, balance: null, estSms: null, err: e?.message || 'Timeout' };
          }
        };

        const checkCloudinary = async () => {
          if (!cldCfg.ready) return { ready: false, ok: false };
          try {
            const auth = btoa(`${cldCfg.apiKey}:${cldCfg.apiSecret}`);
            const res = await fetchWithTimeout(
              `https://api.cloudinary.com/v1_1/${encodeURIComponent(cldCfg.cloudName)}/usage`,
              { headers: { 'Authorization': `Basic ${auth}` } }
            );
            if (!res.ok) return { ready: true, ok: false, status: res.status };
            const j = await res.json();
            const bytes = Number(j?.storage?.usage) || 0;
            const resources = Number(j?.resources) || 0;
            const usedPct = Number(j?.credits?.used_percent ?? j?.storage?.used_percent ?? 0);
            const storageMB = Math.round((bytes / (1024 * 1024)) * 10) / 10;
            return {
              ready: true,
              ok: true,
              cloudName: cldCfg.cloudName,
              resources,
              storageMB,
              usedPct: Math.round(usedPct * 10) / 10
            };
          } catch (e: any) {
            return { ready: true, ok: false, err: e?.message || 'Timeout' };
          }
        };

        const [smsHealth, cldHealth] = await Promise.all([checkSms(), checkCloudinary()]);

        return json({
          ok: true,
          supabase: { ok: true, ms: dbMs },
          eps: { ready: epsCfg.ready, mode: epsCfg.mode },
          sms: smsHealth,
          cloudinary: cldHealth
        });
      }

      // Cloudinary ইমেজ আপলোড (বেস৬৪ ডাটা অথবা রিমোট ইমেজ লিঙ্ক + সাবফোল্ডার + পুরোনো ছবি অটো-ডিলিট)
      if (action === 'a_upload') {
        const { data: stListForUpload } = await supabase.from('settings').select('*');
        const stMapForUpload: Record<string, string> = {};
        (stListForUpload || []).forEach((r: any) => (stMapForUpload[r.key] = r.value));
        const fileOrUrl = String(q.url || q.data || '').trim();
        if (!fileOrUrl) {
          return json({ ok: false, err: 'কোনো ইমেজ ফাইল বা URL দেওয়া হয়নি' });
        }
        if (/^https?:\/\//i.test(fileOrUrl)) {
          if (!isSafePublicUrl(fileOrUrl)) {
            return json({ ok: false, err: 'অননুমোদিত রিমোট URL' });
          }
        } else if (fileOrUrl.startsWith('data:')) {
          if (!/^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(fileOrUrl)) {
            return json({ ok: false, err: 'শুধুমাত্র PNG, JPG, WebP বা GIF ছবি আপলোড করা যাবে' });
          }
          if (fileOrUrl.length > 7000000) {
            return json({ ok: false, err: 'ছবির সাইজ ৫ MB-এর বেশি হতে পারবে না' });
          }
        }
        const subfolder = String(q.subfolder || q.folder || '').trim();
        const uploadRes = await uploadToCloudinary(fileOrUrl, q.name || 'image.jpg', stMapForUpload, subfolder);
        if (!uploadRes.ok) {
          return json({ ok: false, err: uploadRes.error });
        }
        const oldUrl = String(q.oldUrl || '').trim();
        if (oldUrl && oldUrl !== uploadRes.url && oldUrl.includes('res.cloudinary.com')) {
          try { await deleteFromCloudinary(oldUrl, stMapForUpload); } catch {}
        }
        return json({ ok: true, url: uploadRes.url, id: uploadRes.publicId });
      }

      // Cloudinary থেকে ছবি সরাসরি ডিলিট করা
      if (action === 'a_cloudinary_delete') {
        const { data: stList } = await supabase.from('settings').select('*');
        const stMap: Record<string, string> = {};
        (stList || []).forEach((r: any) => (stMap[r.key] = r.value));
        const target = q.url || q.id;
        if (!target) return json({ ok: false, err: 'ডিলিট করার জন্য ছবির URL বা public_id দিন' });
        const delRes = await deleteFromCloudinary(target, stMap);
        return json({ ok: delRes.ok, err: delRes.error, result: delRes.result });
      }

      if (action === 'a_members') {
        const list = await fetchAllRows(supabase, 'members', 'joined', false);
        return json({ ok: true, list: (list || []).map(formatAdminMember) });
      }

      if (action === 'a_member_add') {
        const ph = normPhone(q.phone);
        if (!ph) return json({ ok: false, err: '১১ সংখ্যার সঠিক মোবাইল নম্বর দিন' });

        const { data: existing } = await supabase.from('members').select('phone').eq('phone', ph).single();
        if (existing) return json({ ok: false, err: 'এই নম্বরে আগেই মেম্বার আছে' });

        const days = Number(q.days) || 0;
        const isPaid = days > 0;
        const today = todayDhaka();
        const expiry = isPaid ? addDays(today, days) : null;
        const noteStr = String(q.note || '').trim();

        const { error } = await supabase.from('members').insert({
          phone: ph,
          status: isPaid ? 'paid' : 'new',
          expiry,
          joined: today,
          made: 0,
          note: noteStr
        });

        if (error) return json({ ok: false, err: error.message });

        // পেইড হলে এবং টাকার পরিমাণ বা অর্ডার তৈরির অনুরোধ থাকলে Payments টেবিলে ম্যানুয়াল অর্ডার রেকর্ড তৈরি
        const amount = Number(q.amount) || 0;
        const createOrder = q.create_order !== undefined ? Boolean(q.create_order) : (isPaid && amount > 0);
        if (isPaid && createOrder) {
          const method = String(q.method || 'ম্যানুয়াল (বিকাশ/নগদ)').trim();
          const trxCode = String(q.trx || '').trim() || ('MANUAL-' + Date.now().toString().slice(-6));
          const payId = 'tx' + Date.now() + Math.floor(Math.random() * 900 + 100);

          const { error: ordErr } = await supabase.from('payments').insert({
            id: payId,
            phone: ph,
            amount: amount,
            method: method,
            trx: trxCode,
            status: 'success',
            by: 'admin',
            done_at: new Date().toISOString(),
            note: noteStr ? `ম্যানুয়াল মেম্বার তৈরি: ${noteStr}` : 'অ্যাডমিন দ্বারা ম্যানুয়াল মেম্বার তৈরি'
          });
          if (ordErr) return json({ ok: false, err: 'মেম্বার তৈরি হয়েছে কিন্তু অর্ডার সেভ ব্যর্থ: ' + ordErr.message });
        }

        await logActivity(supabase, 'নতুন মেম্বার যুক্ত', `ফোন: ${ph} (${isPaid ? days + ' দিন পেইড' + (amount > 0 ? ', ৳' + amount : '') : 'নতুন'})`);
        return json({ ok: true });
      }

      if (action === 'a_member') {
        const mPhone = normPhone(q.phone);
        if (!mPhone) return json({ ok: false, err: 'সঠিক মোবাইল নম্বর দিন' });

        const s = q.set || {};
        const statusMap: Record<string, string> = {
          'নতুন': 'new',
          'new': 'new',
          'পেইড': 'paid',
          'paid': 'paid',
          'বন্ধ': 'blocked',
          'blocked': 'blocked'
        };

        const updatePayload: Record<string, any> = {};
        if (s.status !== undefined) {
          updatePayload.status = statusMap[s.status] || s.status;
        }
        if (s.expiry !== undefined) {
          if (s.expiry && !/^\d{4}-\d{2}-\d{2}$/.test(s.expiry)) {
            return json({ ok: false, err: 'তারিখ ঠিক নেই (YYYY-MM-DD)' });
          }
          updatePayload.expiry = s.expiry || null;
        }
        if (s.note !== undefined) updatePayload.note = String(s.note).trim();
        if (s.brand !== undefined) updatePayload.brand = String(s.brand).trim();
        if (s.tagline !== undefined) updatePayload.tagline = String(s.tagline).trim();
        if (s.biz !== undefined) updatePayload.biz = String(s.biz).trim();
        const hexNorm = (v: any) => {
          const x = String(v || '').trim();
          return /^#[0-9A-Fa-f]{6}$/.test(x) ? x.toUpperCase() : '';
        };
        const shapeMap: Record<string, string> = {
          wide: 'wide', square: 'square', tall: 'tall',
          'চওড়া': 'wide', 'চৌকো': 'square', 'লম্বা': 'tall'
        };
        if (s.c1 !== undefined) updatePayload.c1 = hexNorm(s.c1);
        if (s.c2 !== undefined) updatePayload.c2 = hexNorm(s.c2);
        if (s.c3 !== undefined) updatePayload.c3 = hexNorm(s.c3);
        if (s.shape !== undefined) updatePayload.shape = shapeMap[String(s.shape).trim()] || 'square';
        if (s.logo_url !== undefined) updatePayload.logo_url = String(s.logo_url).trim();
        if (s.verified !== undefined) updatePayload.verified = Boolean(s.verified);
        if (s.brand_unlocked !== undefined) updatePayload.brand_unlocked = Boolean(s.brand_unlocked);

        const { error } = await supabase.from('members').update(updatePayload).eq('phone', mPhone);
        if (error) return json({ ok: false, err: error.message });

        // মেম্বার ব্লক করা হলে তার সব অ্যাক্টিভ সেশন সাথে সাথে বাতিল করা
        if (updatePayload.status === 'blocked') {
          await supabase.from('member_sessions').delete().eq('phone', mPhone);
        }

        const changeDesc: string[] = [];
        if (s.status) changeDesc.push(`স্ট্যাটাস: ${s.status}`);
        if (s.expiry) changeDesc.push(`মেয়াদ: ${s.expiry}`);
        if (s.brand) changeDesc.push(`ব্র্যান্ড: ${s.brand}`);
        await logActivity(supabase, 'মেম্বার তথ্য আপডেট', `ফোন: ${mPhone} (${changeDesc.join(', ') || 'তথ্য সেভ'})`);

        return json({ ok: true });
      }

      // মেম্বারের ব্র্যান্ড এডিট আনলক/লক টগল
      if (action === 'a_member_brand_unlock') {
        const mPhone = normPhone(q.phone);
        if (!mPhone) return json({ ok: false, err: 'সঠিক মোবাইল নম্বর দিন' });
        const unlock = Boolean(q.unlocked);
        const { error } = await supabase.from('members').update({ brand_unlocked: unlock }).eq('phone', mPhone);
        if (error) return json({ ok: false, err: error.message });
        await logActivity(supabase, unlock ? 'ব্র্যান্ড এডিট আনলক করা হয়েছে' : 'ব্র্যান্ড এডিট লক করা হয়েছে', `ফোন: ${mPhone}`);
        return json({ ok: true, brand_unlocked: unlock });
      }

      if (action === 'a_member_history') {
        const mPhone = normPhone(q.phone);
        if (!mPhone) return json({ ok: false, err: 'সঠিক মোবাইল নম্বর দিন' });
        const { data: rows, error } = await supabase
          .from('design_history')
          .select('*')
          .eq('phone', mPhone)
          .order('created_at', { ascending: false })
          .limit(50);
        if (error) return json({ ok: false, err: error.message });
        return json({ ok: true, history: rows || [] });
      }

      if (action === 'a_member_reset_auth') {
        const mPhone = normPhone(q.phone);
        if (!mPhone) return json({ ok: false, err: 'সঠিক মোবাইল নম্বর দিন' });
        const { error } = await supabase
          .from('members')
          .update({ verified: false, password_hash: '' })
          .eq('phone', mPhone);
        if (error) return json({ ok: false, err: error.message });
        await supabase.from('otp_codes').delete().eq('phone', mPhone);
        await supabase.from('member_sessions').delete().eq('phone', mPhone);
        await supabase.from('otp_verified_tokens').delete().eq('phone', mPhone);
        await logActivity(supabase, 'মেম্বার অথেনটিকেশন রিসেট', `ফোন: ${mPhone}`);
        return json({ ok: true });
      }

      if (action === 'a_member_toggle_verify') {
        const mPhone = normPhone(q.phone);
        if (!mPhone) return json({ ok: false, err: 'সঠিক মোবাইল নম্বর দিন' });
        const isV = Boolean(q.verified);
        const { error } = await supabase
          .from('members')
          .update({ verified: isV })
          .eq('phone', mPhone);
        if (error) return json({ ok: false, err: error.message });
        await logActivity(supabase, isV ? 'মেম্বার ভেরিফাই' : 'মেম্বার আন-ভেরিফাই', `ফোন: ${mPhone}`);
        return json({ ok: true, verified: isV });
      }

      // মেম্বার ও তাদের সম্পূর্ণ ডেটা ডিলিট (Cascade Delete)
      if (action === 'a_member_del') {
        const mPhone = normPhone(q.phone);
        if (!mPhone) return json({ ok: false, err: 'সঠিক মোবাইল নম্বর দিন' });

        const { data: memRow } = await supabase.from('members').select('*').eq('phone', mPhone).single();
        if (!memRow) return json({ ok: false, err: 'মেম্বার পাওয়া যায়নি' });

        // ১. চাইল্ড রেকর্ডগুলো আগে মুছে ফেলা (FK Constraints সেফটি)
        await supabase.from('payments').delete().eq('phone', mPhone);
        await supabase.from('design_history').delete().eq('phone', mPhone);
        await supabase.from('otp_codes').delete().eq('phone', mPhone);
        await supabase.from('member_sessions').delete().eq('phone', mPhone);
        await supabase.from('otp_verified_tokens').delete().eq('phone', mPhone);

        // ২. ক্লাউডিনারি লোগো থাকলে মুছে ফেলা
        if (memRow.logo_url && memRow.logo_url.includes('res.cloudinary.com')) {
          try {
            const { data: stList } = await supabase.from('settings').select('*');
            const stMap: Record<string, string> = {};
            (stList || []).forEach((r: any) => (stMap[r.key] = r.value));
            await deleteFromCloudinary(memRow.logo_url, stMap);
          } catch {}
        }

        // ৩. মেম্বার টেবিল থেকে রেকর্ড মুছে ফেলা
        const { error: delErr } = await supabase.from('members').delete().eq('phone', mPhone);
        if (delErr) return json({ ok: false, err: delErr.message });

        await logActivity(supabase, 'মেম্বার অ্যাকাউন্ট মুছে ফেলা হয়েছে', `ফোন: ${mPhone}, ব্র্যান্ড: ${memRow.brand || '—'}`);
        return json({ ok: true });
      }

      if (action === 'a_payments') {
        const list = await fetchAllRows(supabase, 'payments', 'created_at', false);
        return json({ ok: true, list: (list || []).map(formatAdminPayment) });
      }

      if (action === 'a_pay_check') {
        const res = await verifyPayment(supabase, q.id);
        return json(res);
      }

      // পেমেন্ট ম্যানুয়াল অনুমোদন (অপেক্ষায় থাকা পেমেন্ট ম্যানুয়ালি পেইড ও মেম্বারশিপ সক্রিয় করা)
      if (action === 'a_pay_approve') {
        const payId = String(q.id || '').trim();
        if (!payId) return json({ ok: false, err: 'পেমেন্ট আইডি দিন' });

        const { data: payRow } = await supabase.from('payments').select('*').eq('id', payId).single();
        if (!payRow) return json({ ok: false, err: 'পেমেন্ট রেকর্ড পাওয়া যায়নি' });

        const { data: stList } = await supabase.from('settings').select('*');
        const stMap: Record<string, string> = {};
        (stList || []).forEach((r: any) => (stMap[r.key] = r.value));
        const packageDays = Number(stMap.days) || 365;

        const today = todayDhaka();
        const { data: mem } = await supabase.from('members').select('*').eq('phone', payRow.phone).single();
        const baseDate = mem?.expiry && mem.expiry > today && (mem.status === 'paid' || mem.status === 'পেইড') ? mem.expiry : today;
        const newExpiry = addDays(baseDate, packageDays);

        if (mem) {
          const { error: memUpErr } = await supabase.from('members').update({
            status: 'paid',
            expiry: newExpiry
          }).eq('phone', payRow.phone);
          if (memUpErr) return json({ ok: false, err: 'মেম্বারশিপ সক্রিয় ব্যর্থ: ' + memUpErr.message });
        }

        const manualTrx = payRow.trx || ('MANUAL-' + Date.now().toString().slice(-6));
        const manualMethod = (payRow.method && payRow.method !== 'EPS') ? payRow.method : 'ম্যানুয়াল (বিকাশ/নগদ)';
        const noteAdd = payRow.note ? (payRow.note + ' (অ্যাডমিন দ্বারা ম্যানুয়াল অনুমোদন)') : 'ম্যানুয়াল অনুমোদন (অ্যাডমিন)';

        const { error: payErr } = await supabase.from('payments').update({
          status: 'success',
          trx: manualTrx,
          method: manualMethod,
          done_at: new Date().toISOString(),
          by: 'admin',
          note: noteAdd
        }).eq('id', payId);

        if (payErr) return json({ ok: false, err: payErr.message });

        await logActivity(supabase, 'পেমেন্ট ম্যানুয়াল অনুমোদন', `আইডি: ${payId}, ফোন: ${payRow.phone}, টাকা: ৳${payRow.amount}`);
        return json({ ok: true, status: 'success' });
      }

      // মেম্বারের জন্য সরাসরি ম্যানুয়াল পেমেন্ট/অর্ডার এন্ট্রি
      if (action === 'a_pay_add') {
        const ph = normPhone(q.phone);
        if (!ph) return json({ ok: false, err: '১১ সংখ্যার সঠিক মোবাইল নম্বর দিন' });

        const { data: mem } = await supabase.from('members').select('*').eq('phone', ph).single();
        if (!mem) return json({ ok: false, err: 'মেম্বার পাওয়া যায়নি' });

        const amount = Number(q.amount);
        if (isNaN(amount) || amount < 0) return json({ ok: false, err: 'সঠিক টাকার পরিমাণ দিন' });

        const { data: stList } = await supabase.from('settings').select('*');
        const stMap: Record<string, string> = {};
        (stList || []).forEach((r: any) => (stMap[r.key] = r.value));
        const defaultDays = Number(stMap.days) || 365;
        const extendDays = q.days !== undefined ? (Number(q.days) || 0) : defaultDays;

        const payId = 'tx' + Date.now() + Math.floor(Math.random() * 900 + 100);
        const trxCode = String(q.trx || '').trim() || ('MANUAL-' + Date.now().toString().slice(-6));
        const method = String(q.method || 'ম্যানুয়াল (বিকাশ/নগদ)').trim();
        const note = String(q.note || '').trim();

        const { error: insErr } = await supabase.from('payments').insert({
          id: payId,
          phone: ph,
          amount: amount,
          method: method,
          trx: trxCode,
          status: 'success',
          by: 'admin',
          done_at: new Date().toISOString(),
          note: note ? `ম্যানুয়াল পেমেন্ট: ${note}` : 'অ্যাডমিন দ্বারা ম্যানুয়াল পেমেন্ট'
        });
        if (insErr) return json({ ok: false, err: insErr.message });

        if (extendDays > 0) {
          const today = todayDhaka();
          const baseDate = mem.expiry && mem.expiry > today && (mem.status === 'paid' || mem.status === 'পেইড') ? mem.expiry : today;
          const newExpiry = addDays(baseDate, extendDays);
          const { error: memUpErr } = await supabase.from('members').update({
            status: 'paid',
            expiry: newExpiry
          }).eq('phone', ph);
          if (memUpErr) return json({ ok: false, err: 'পেমেন্ট সেভ হয়েছে কিন্তু মেয়াদ আপডেট ব্যর্থ: ' + memUpErr.message });
        }

        await logActivity(supabase, 'ম্যানুয়াল পেমেন্ট এন্ট্রি', `ফোন: ${ph}, টাকা: ৳${amount}, মাধ্যম: ${method}`);
        return json({ ok: true, id: payId });
      }

      // পেমেন্ট/অর্ডার রেকর্ড ডিলিট (ড্যাশবোর্ড আয় রিক্যালকুলেট হবে)
      if (action === 'a_pay_del') {
        const payId = String(q.id || '').trim();
        if (!payId) return json({ ok: false, err: 'পেমেন্ট আইডি দিন' });

        const { data: payRow } = await supabase.from('payments').select('*').eq('id', payId).single();
        if (!payRow) return json({ ok: false, err: 'পেমেন্ট রেকর্ড পাওয়া যায়নি' });

        const { error: delErr } = await supabase.from('payments').delete().eq('id', payId);
        if (delErr) return json({ ok: false, err: delErr.message });

        await logActivity(supabase, 'পেমেন্ট রেকর্ড মুছে ফেলা হয়েছে', `আইডি: ${payId}, ফোন: ${payRow.phone}, টাকা: ৳${payRow.amount}, স্ট্যাটাস: ${payRow.status}`);
        return json({ ok: true });
      }

      if (action === 'a_data') {
        const tabs = q.tabs || [];
        const out: Record<string, any> = { ok: true };

        const { data: stList } = await supabase.from('settings').select('*');
        const stMap: Record<string, string> = {};
        (stList || []).forEach((r: any) => (stMap[r.key] = r.value));

        for (const t of tabs) {
          if (t === 'settings') {
            // সংবেদনশীল সিক্রেট কী কখনোই ব্রাউজারে প্লেইনটেক্সটে পাঠানো হবে না
            out.settings = (stList || []).filter((r: any) => !SECRET_SETTING_KEYS.has(String(r.key || '')));
          } else if (t === 'styles') {
            const { data: styles } = await supabase.from('styles').select('*').order('sort');
            out.styles = (styles || []).map((s: any) => ({
              ...s,
              status: s.status === 'published' || s.status === 'পাবলিশড' ? 'পাবলিশড' : 'ড্রাফট',
              order: String(s.sort || 999),
              pop: s.pop ? 'TRUE' : 'FALSE'
            }));
          } else if (t === 'fields') {
            const { data: fields } = await supabase.from('fields').select('*').order('sort');
            out.fields = (fields || []).map((f: any) => ({
              ...f,
              order: String(f.sort || 1)
            }));
          } else if (['cats', 'biz', 'posts', 'policies', 'fixes'].includes(t)) {
            const { data } = await supabase.from(t).select('*').order('sort');
            out[t] = (data || []).map((item: any) => ({
              ...item,
              order: String(item.sort || 999)
            }));
          } else if (t === 'log') {
            let { data: logRows } = await supabase.from('log').select('*').order('id', { ascending: false }).limit(300);
            if (!logRows || logRows.length === 0) {
              const initialSeeds = [
                {
                  action: 'সিস্টেম ইনিশিয়ালাইজেশন',
                  detail: 'উদ্যোক্তা গ্রাফিক্স AI ক্লাউড ডেটাবেস ও স্টোরেজ সফলভাবে চালু করা হয়েছে',
                  who: 'system',
                  at: new Date(Date.now() - 3600000 * 48).toISOString()
                },
                {
                  action: 'EPS কনফিগারেশন',
                  detail: 'EPS পেমেন্ট গেটওয়ে কনফিগার ও লাইভ সংযোগ সক্রিয় করা হয়েছে',
                  who: 'admin',
                  at: new Date(Date.now() - 3600000 * 24).toISOString()
                },
                {
                  action: 'BulkSMSBD ইন্টিগ্রেশন',
                  detail: 'Sender ID 8809617644517 ভেরিফাইড এবং ওটিপি এসএমএস টেস্ট সফল হয়েছে',
                  who: 'admin',
                  at: new Date(Date.now() - 3600000 * 5).toISOString()
                },
                {
                  action: 'অ্যাক্টিভিটি লগ ট্র্যাকিং সক্রিয়',
                  detail: 'অ্যাডমিন প্যানেল ও লাইভ অডিট লগ ট্র্যাকিং সিস্টেম চালু হয়েছে',
                  who: 'admin',
                  at: new Date().toISOString()
                }
              ];
              await supabase.from('log').insert(initialSeeds);
              const { data: seeded } = await supabase.from('log').select('*').order('id', { ascending: false }).limit(300);
              logRows = seeded || initialSeeds;
            }
            out.log = (logRows || []).map((l: any) => ({
              ...l,
              time: l.at || l.time
            }));
          } else if (['texts', 'contact'].includes(t)) {
            const { data } = await supabase.from(t).select('*');
            out[t] = data || [];
          }
        }

        const epsCfg = getEpsConfig(stMap);
        out.eps = {
          ready: epsCfg.ready,
          mode: epsCfg.mode,
          merchantId: epsCfg.merchantId ? '••••' + String(epsCfg.merchantId).slice(-4) : '',
          user: epsCfg.user || ''
        };

        const cldCfg = getCloudinaryConfig(stMap);
        out.cloudinary = {
          ready: cldCfg.ready,
          cloudName: cldCfg.cloudName || '',
          apiKey: cldCfg.apiKey ? '••••' + String(cldCfg.apiKey).slice(-4) : '',
          folder: cldCfg.folder || 'uddokta_graphics_ai'
        };

        const smsCfg = getSmsConfig(stMap);
        out.sms = {
          ready: smsCfg.ready,
          senderId: smsCfg.senderId || '',
          apiUrl: smsCfg.apiUrl || '',
          otpTemplate: smsCfg.otpTemplate || 'উদ্যোক্তা গ্রাফিক্স AI তে আপনার ওটিপি কোড: {otp}। মেয়াদ ৫ মিনিট।',
          apiToken: smsCfg.apiToken ? '••••' + String(smsCfg.apiToken).slice(-4) : ''
        };

        const brevoCfg = getBrevoConfig(stMap);
        out.brevo = {
          ready: brevoCfg.ready,
          senderEmail: brevoCfg.senderEmail || '',
          senderName: brevoCfg.senderName || 'উদ্যোক্তা গ্রাফিক্স AI',
          apiKey: brevoCfg.apiKey ? '••••' + String(brevoCfg.apiKey).slice(-4) : ''
        };

        out.webapp = url.origin + url.pathname;

        return json(out);
      }

      const toBool = (v: any): boolean => v === true || v === 'TRUE' || v === 'true' || v === 1 || v === '1';
      const LOGO_POS_MAP: Record<string, string> = {
        'top-left': 'top-left',
        'top-center': 'top-center',
        'top-right': 'top-right',
        'bottom-left': 'bottom-left',
        'bottom-center': 'bottom-center',
        'bottom-right': 'bottom-right',
        'উপরে বামে': 'top-left',
        'উপরে মাঝে': 'top-center',
        'উপরে ডানে': 'top-right',
        'নিচে বামে': 'bottom-left',
        'নিচে মাঝে': 'bottom-center',
        'নিচে ডানে': 'bottom-right'
      };
      const normLogoPos = (v: any): string => LOGO_POS_MAP[String(v || '').trim()] || 'top-left';
      const ALLOWED_FIELD_ELS = new Set([
        'product', 'headline', 'sub', 'short', 'bullet', 'offer',
        'price', 'oldprice', 'date', 'badge', 'button', 'phone', 'address'
      ]);

      if (action === 'a_save') {
        const tab = q.tab;
        const rows = q.rows || [];

        if (tab === 'settings') {
          const brandAssetKeys = new Set(['site_logo', 'eps_checkout_banner', 'eps_footer_desktop', 'eps_footer_mobile']);
          const hasBrandAssetUpdate = rows.some((r: any) => r && brandAssetKeys.has(String(r.key || '')));
          let prevSettingsMap: Record<string, string> = {};
          if (hasBrandAssetUpdate) {
            const { data: stList } = await supabase.from('settings').select('*');
            (stList || []).forEach((s: any) => { prevSettingsMap[s.key] = s.value || ''; });
          }

          for (const r of rows) {
            if (r.key) {
              const { error: uErr } = await supabase.from('settings').upsert({ key: r.key, value: r.value || '' }, { onConflict: 'key' });
              if (uErr) return json({ ok: false, err: 'সেটিংস সেভ ব্যর্থ: ' + uErr.message });
            }
          }

          // অ্যাপ লোগো বা EPS ব্যানার রিসেট/পরিবর্তন করলে আগের Cloudinary ছবিটি স্বয়ংক্রিয়ভাবে মুছে ফেলা
          if (hasBrandAssetUpdate) {
            for (const r of rows) {
              const k = String(r?.key || '');
              if (!brandAssetKeys.has(k)) continue;
              const prevUrl = String(prevSettingsMap[k] || '').trim();
              const nextUrl = String(r?.value || '').trim();
              if (prevUrl && prevUrl !== nextUrl && prevUrl.includes('res.cloudinary.com')) {
                try { await deleteFromCloudinary(prevUrl, prevSettingsMap); } catch {}
              }
            }
          }

          await logActivity(supabase, 'সিস্টেম সেটিংস পরিবর্তন', `${rows.length}টি সেটিংস সেভ করা হয়েছে`);
          return json({ ok: true });
        }

        if (tab === 'texts') {
          const cleanRows = rows
            .filter((r: any) => r && r.key && !String(r.key).startsWith('L'))
            .map((r: any) => ({ key: String(r.key).trim(), value: String(r.value || '').trim() }));
          const toUpsert = cleanRows.filter((r: any) => r.value !== '');
          const toDelete = cleanRows.filter((r: any) => r.value === '').map((r: any) => r.key);
          if (toDelete.length > 0) {
            const { error: dErr } = await supabase.from('texts').delete().in('key', toDelete);
            if (dErr) return json({ ok: false, err: 'লেখা রিসেট ব্যর্থ: ' + dErr.message });
          }
          if (toUpsert.length > 0) {
            for (let i = 0; i < toUpsert.length; i += 100) {
              const chunk = toUpsert.slice(i, i + 100);
              const { error: uErr } = await supabase.from('texts').upsert(chunk, { onConflict: 'key' });
              if (uErr) return json({ ok: false, err: 'লেখা সেভ ব্যর্থ: ' + uErr.message });
            }
          }
          await logActivity(supabase, 'অ্যাপের লেখা আপডেট', `${toUpsert.length}টি লেখা আপডেট করা হয়েছে`);
          return json({ ok: true });
        }

        if (tab === 'contact') {
          const cleanRows = rows
            .filter((r: any) => r && r.key)
            .map((r: any) => ({ key: String(r.key).trim(), value: String(r.value || '').trim() }));
          const { data: existing } = await supabase.from('contact').select('key');
          if (cleanRows.length > 0) {
            const { error: uErr } = await supabase.from('contact').upsert(cleanRows, { onConflict: 'key' });
            if (uErr) return json({ ok: false, err: 'যোগাযোগ সেভ ব্যর্থ: ' + uErr.message });
          }
          const keep = new Set(cleanRows.map((r: any) => r.key));
          const toRemove = (existing || []).map((r: any) => r.key).filter((k: string) => !keep.has(k));
          if (toRemove.length > 0) {
            const { error: dErr } = await supabase.from('contact').delete().in('key', toRemove);
            if (dErr) return json({ ok: false, err: 'যোগাযোগ আপডেট ব্যর্থ: ' + dErr.message });
          }
          await logActivity(supabase, 'গাইড ও যোগাযোগ আপডেট', `${cleanRows.length}টি যোগাযোগ ফিল্ড সেভ করা হয়েছে`);
          return json({ ok: true });
        }

        if (tab === 'policies') {
          const cleanRows = rows
            .filter((r: any) => r && r.key && r.title)
            .map((r: any, idx: number) => ({
              key: String(r.key).trim(),
              title: String(r.title).trim(),
              text: r.text || '',
              sort: Number(r.order || r.sort) || idx + 1
            }));
          const { data: existing } = await supabase.from('policies').select('key');
          if (cleanRows.length > 0) {
            const { error: uErr } = await supabase.from('policies').upsert(cleanRows, { onConflict: 'key' });
            if (uErr) return json({ ok: false, err: 'পলিসি সেভ ব্যর্থ: ' + uErr.message });
          }
          const keep = new Set(cleanRows.map((r: any) => r.key));
          const toRemove = (existing || []).map((r: any) => r.key).filter((k: string) => !keep.has(k));
          if (toRemove.length > 0) {
            const { error: dErr } = await supabase.from('policies').delete().in('key', toRemove);
            if (dErr) return json({ ok: false, err: 'পলিসি ডিলিট ব্যর্থ: ' + dErr.message });
          }
          await logActivity(supabase, 'পলিসি ও শর্তাবলি আপডেট', `${cleanRows.length}টি পলিসি সেভ করা হয়েছে`);
          return json({ ok: true });
        }

        if (tab === 'biz') {
          const cleanRows = rows
            .filter((r: any) => r && r.name)
            .map((r: any, idx: number) => ({
              name: String(r.name).trim(),
              mood: r.mood || '',
              sort: Number(r.order || r.sort) || idx + 1
            }));
          const { data: existing } = await supabase.from('biz').select('name');
          if (cleanRows.length > 0) {
            const { error: uErr } = await supabase.from('biz').upsert(cleanRows, { onConflict: 'name' });
            if (uErr) return json({ ok: false, err: 'ব্যবসার ধরন সেভ ব্যর্থ: ' + uErr.message });
          }
          const keep = new Set(cleanRows.map((r: any) => r.name));
          const toRemove = (existing || []).map((r: any) => r.name).filter((n: string) => !keep.has(n));
          if (toRemove.length > 0) {
            const { error: dErr } = await supabase.from('biz').delete().in('name', toRemove);
            if (dErr) return json({ ok: false, err: 'ব্যবসার ধরন ডিলিট ব্যর্থ: ' + dErr.message });
          }
          await logActivity(supabase, 'ব্যবসার ধরন আপডেট', `${cleanRows.length}টি ব্যবসার ধরন সেভ করা হয়েছে`);
          return json({ ok: true });
        }

        if (tab === 'cats') {
          // নিরাপদ upsert + শুধু বাদ পড়া ক্যাটাগরি ডিলিট (যাতে styles.cat FK ON DELETE SET NULL ট্রিগার না হয়)
          const cleanRows = rows
            .filter((r: any) => r && r.id && r.name)
            .map((r: any, idx: number) => ({
              id: String(r.id).trim(),
              name: String(r.name).trim(),
              show: toBool(r.show),
              sort: Number(r.order || r.sort) || idx + 1
            }));
          const { data: existing } = await supabase.from('cats').select('id');
          if (cleanRows.length > 0) {
            const { error: uErr } = await supabase.from('cats').upsert(cleanRows, { onConflict: 'id' });
            if (uErr) return json({ ok: false, err: 'ক্যাটাগরি সেভ ব্যর্থ: ' + uErr.message });
          }
          const keep = new Set(cleanRows.map((r: any) => r.id));
          const toRemove = (existing || []).map((r: any) => r.id).filter((cid: string) => !keep.has(cid));
          if (toRemove.length > 0) {
            const { error: dErr } = await supabase.from('cats').delete().in('id', toRemove);
            if (dErr) return json({ ok: false, err: 'ক্যাটাগরি ডিলিট ব্যর্থ: ' + dErr.message });
          }
          await logActivity(supabase, 'ক্যাটাগরি আপডেট', `${cleanRows.length}টি ক্যাটাগরি সেভ করা হয়েছে`);
          return json({ ok: true });
        }

        if (tab === 'posts') {
          // পুরনো পোস্টের পূর্ণ ব্যাকআপ নেওয়া যাতে ইনসার্ট ব্যর্থ হলে ডেটা না হারায়
          const { data: oldPosts } = await supabase.from('posts').select('sort,img,tag,title,link,show');

          const cleanRows = rows
            .filter((r: any) => r && r.title)
            .map((r: any, idx: number) => ({
              title: String(r.title).trim(),
              img: r.img || '',
              tag: r.tag || '',
              link: r.link || '',
              show: toBool(r.show),
              sort: Number(r.order || r.sort) || idx + 1
            }));

          const { error: delErr } = await supabase.from('posts').delete().gte('id', 0);
          if (delErr) return json({ ok: false, err: 'পোস্ট আপডেট ব্যর্থ: ' + delErr.message });

          if (cleanRows.length > 0) {
            const { error: insErr } = await supabase.from('posts').insert(cleanRows);
            if (insErr) {
              if (oldPosts && oldPosts.length > 0) {
                try { await supabase.from('posts').insert(oldPosts); } catch {}
              }
              return json({ ok: false, err: 'পোস্ট সেভ ব্যর্থ: ' + insErr.message });
            }
          }

          // পুরনো যেসব ছবি নতুন তালিকায় আর নেই, সেগুলো ক্লাউডিনারি থেকে মুছে ফেলা
          if (oldPosts && oldPosts.length > 0) {
            const newImgUrls = new Set(cleanRows.map((r: any) => r.img));
            const removedImgs = oldPosts
              .map((p: any) => p.img)
              .filter((img: string) => img && !newImgUrls.has(img));

            if (removedImgs.length > 0) {
              const { data: stList } = await supabase.from('settings').select('*');
              const stMap: Record<string, string> = {};
              (stList || []).forEach((r: any) => (stMap[r.key] = r.value));
              for (const imgUrl of removedImgs) {
                try { await deleteFromCloudinary(imgUrl, stMap); } catch {}
              }
            }
          }

          await logActivity(supabase, 'আপডেট পোস্ট সেভ', `${cleanRows.length}টি পোস্ট সেভ করা হয়েছে`);
          return json({ ok: true });
        }

        if (tab === 'fixes') {
          const { data: oldFixes } = await supabase.from('fixes').select('sort,title,line');
          const cleanRows = rows
            .filter((r: any) => r && r.title)
            .map((r: any, idx: number) => ({
              title: String(r.title).trim(),
              line: r.line || '',
              sort: Number(r.order || r.sort) || idx + 1
            }));

          const { error: delErr } = await supabase.from('fixes').delete().gte('id', 0);
          if (delErr) return json({ ok: false, err: 'ঠিক করার লাইন আপডেট ব্যর্থ: ' + delErr.message });

          if (cleanRows.length > 0) {
            const { error: insErr } = await supabase.from('fixes').insert(cleanRows);
            if (insErr) {
              if (oldFixes && oldFixes.length > 0) {
                try { await supabase.from('fixes').insert(oldFixes); } catch {}
              }
              return json({ ok: false, err: 'ঠিক করার লাইন সেভ ব্যর্থ: ' + insErr.message });
            }
          }
          await logActivity(supabase, 'ঠিক করার লাইন আপডেট', `${cleanRows.length}টি লাইন সেভ করা হয়েছে`);
          return json({ ok: true });
        }

        return json({ ok: true });
      }

      if (action === 'a_style_save') {
        const st = q.style || {};
        const id = String(st.id || '').trim().replace(/\s+/g, '-');
        const oldId = String(q.oldId || '').trim();
        if (!id) return json({ ok: false, err: 'স্টাইলের ID দিন' });
        if (!String(st.name || '').trim()) return json({ ok: false, err: 'স্টাইলের নাম দিন' });

        // ফিল্ডগুলো আগে ভ্যালিডেট করা
        const rawFields = Array.isArray(q.fields) ? q.fields : [];
        const fields = rawFields.map((f: any, idx: number) => {
          const el = String(f.el || '').trim();
          return {
            sid: id,
            sort: idx + 1,
            el,
            ex: String(f.ex || ''),
            lim: f.lim ? Number(f.lim) : null,
            req: toBool(f.req)
          };
        });
        for (const f of fields) {
          if (!ALLOWED_FIELD_ELS.has(f.el)) {
            return json({ ok: false, err: `অবৈধ এলিমেন্ট টাইপ: "${f.el}"` });
          }
        }

        // পুরনো স্টাইল রেকর্ড চেক (ইমেজ ও sort সংরক্ষণের জন্য)
        const checkId = oldId || id;
        const { data: oldStyleRecord } = await supabase.from('styles').select('id,img,sort').eq('id', checkId).maybeSingle();
        const oldImg = oldStyleRecord?.img;

        // নতুন স্টাইল হলে পরবর্তী sort সংখ্যা নির্ধারণ
        let sortVal = oldStyleRecord?.sort;
        if (sortVal == null) {
          const { data: maxRows } = await supabase.from('styles').select('sort').order('sort', { ascending: false }).limit(1);
          const maxSort = (maxRows && maxRows[0] && Number(maxRows[0].sort)) || 0;
          sortVal = maxSort + 1;
        }

        const rawStatus = String(st.status || 'draft').toLowerCase();
        const mappedStatus = rawStatus === 'published' || rawStatus === 'পাবলিশড' ? 'published' : 'draft';

        const styleRow = {
          id,
          name: String(st.name).trim(),
          cat: st.cat ? String(st.cat).trim() : null,
          img: st.img || '',
          attach: st.attach || '',
          logo: normLogoPos(st.logo),
          style: st.style || '',
          status: mappedStatus,
          pop: toBool(st.pop),
          sort: sortVal,
          font1: st.font1 || '',
          font2: st.font2 || ''
        };

        // ID পরিবর্তন হলে নিরাপদে rename করা (ON UPDATE CASCADE)
        if (oldId && oldId !== id) {
          const { data: conflict } = await supabase.from('styles').select('id').eq('id', id).maybeSingle();
          if (conflict) {
            return json({ ok: false, err: `"${id}" ID দিয়ে আরেকটি স্টাইল ইতিমধ্যে আছে` });
          }
          const { error: renErr } = await supabase.from('styles').update(styleRow).eq('id', oldId);
          if (renErr) return json({ ok: false, err: 'স্টাইল আপডেট ব্যর্থ: ' + renErr.message });
        } else {
          const { error: stErr } = await supabase.from('styles').upsert(styleRow, { onConflict: 'id' });
          if (stErr) return json({ ok: false, err: 'স্টাইল সেভ ব্যর্থ: ' + stErr.message });
        }

        // ফিল্ডস নিরাপদে আপডেট (ব্যর্থ হলে পুরনো ফিল্ড রিস্টোর)
        const { data: prevFields } = await supabase.from('fields').select('sid,sort,el,ex,lim,req').eq('sid', id);
        const { error: fDelErr } = await supabase.from('fields').delete().eq('sid', id);
        if (fDelErr) return json({ ok: false, err: 'এলিমেন্ট আপডেট ব্যর্থ: ' + fDelErr.message });

        if (fields.length) {
          const { error: fInsErr } = await supabase.from('fields').insert(fields);
          if (fInsErr) {
            if (prevFields && prevFields.length > 0) {
              try { await supabase.from('fields').insert(prevFields); } catch {}
            }
            return json({ ok: false, err: 'এলিমেন্ট সেভ ব্যর্থ: ' + fInsErr.message });
          }
        }

        // যদি ছবি পরিবর্তন করা হয়ে থাকে এবং আগের ছবিটি ক্লাউডিনারির হয়, তবে আগেরটি ক্লাউডিনারি থেকে মুছে ফেলা
        if (oldImg && oldImg !== styleRow.img) {
          const { data: stList } = await supabase.from('settings').select('*');
          const stMap: Record<string, string> = {};
          (stList || []).forEach((r: any) => (stMap[r.key] = r.value));
          try { await deleteFromCloudinary(oldImg, stMap); } catch {}
        }

        await logActivity(supabase, 'ডিজাইন স্টাইল সেভ', `স্টাইল: ${st.name || id} (ক্যাটাগরি: ${st.cat || 'সাধারণ'}, স্ট্যাটাস: ${mappedStatus})`);
        return json({ ok: true, id });
      }

      if (action === 'a_style_del') {
        const { data: styleToDelete } = await supabase.from('styles').select('img').eq('id', q.id).maybeSingle();
        const { error: dErr } = await supabase.from('styles').delete().eq('id', q.id);
        if (dErr) return json({ ok: false, err: 'স্টাইল মুছতে ব্যর্থ: ' + dErr.message });
        await supabase.from('fields').delete().eq('sid', q.id);

        // স্টাইলের সাথে থাকা ক্লাউডিনারি ইমেজ ক্লাউডিনারি থেকে ডিলিট করা
        if (styleToDelete?.img) {
          const { data: stList } = await supabase.from('settings').select('*');
          const stMap: Record<string, string> = {};
          (stList || []).forEach((r: any) => (stMap[r.key] = r.value));
          try { await deleteFromCloudinary(styleToDelete.img, stMap); } catch {}
        }

        await logActivity(supabase, 'ডিজাইন স্টাইল মুছে ফেলা', `স্টাইল আইডি: ${q.id}`);
        return json({ ok: true });
      }

      if (action === 'a_style_bulk') {
        const ids = q.ids || [];
        const op = q.op;
        if (!ids.length) return json({ ok: false, err: 'কোনো স্টাইল বাছা হয়নি' });

        if (op === 'delete') {
          const { data: stylesToDelete } = await supabase.from('styles').select('img').in('id', ids);
          const { error: bErr } = await supabase.from('styles').delete().in('id', ids);
          if (bErr) return json({ ok: false, err: 'বাল্ক ডিলিট ব্যর্থ: ' + bErr.message });
          await supabase.from('fields').delete().in('sid', ids);

          // নির্বাচিত স্টাইলগুলোর ক্লাউডিনারি ইমেজ স্বয়ংক্রিয়ভাবে মুছে ফেলা
          if (stylesToDelete && stylesToDelete.length > 0) {
            const { data: stList } = await supabase.from('settings').select('*');
            const stMap: Record<string, string> = {};
            (stList || []).forEach((r: any) => (stMap[r.key] = r.value));
            for (const item of stylesToDelete) {
              if (item.img) {
                try { await deleteFromCloudinary(item.img, stMap); } catch {}
              }
            }
          }
        } else if (op === 'publish') {
          const { error: bErr } = await supabase.from('styles').update({ status: 'published' }).in('id', ids);
          if (bErr) return json({ ok: false, err: 'পাবলিশ ব্যর্থ: ' + bErr.message });
        } else if (op === 'draft') {
          const { error: bErr } = await supabase.from('styles').update({ status: 'draft' }).in('id', ids);
          if (bErr) return json({ ok: false, err: 'ড্রাফট ব্যর্থ: ' + bErr.message });
        } else if (op === 'pop') {
          const { error: bErr } = await supabase.from('styles').update({ pop: true }).in('id', ids);
          if (bErr) return json({ ok: false, err: 'আপডেট ব্যর্থ: ' + bErr.message });
        } else if (op === 'unpop') {
          const { error: bErr } = await supabase.from('styles').update({ pop: false }).in('id', ids);
          if (bErr) return json({ ok: false, err: 'আপডেট ব্যর্থ: ' + bErr.message });
        } else if (op === 'cat' && q.cat) {
          const { error: bErr } = await supabase.from('styles').update({ cat: q.cat }).in('id', ids);
          if (bErr) return json({ ok: false, err: 'ক্যাটাগরি পরিবর্তন ব্যর্থ: ' + bErr.message });
        }

        await logActivity(supabase, 'স্টাইল বাল্ক অ্যাকশন', `অ্যাকশন: ${op}, মোট: ${ids.length}টি স্টাইল`);
        return json({ ok: true, n: ids.length });
      }

      if (action === 'a_style_order') {
        const ids = q.ids || [];
        for (let i = 0; i < ids.length; i++) {
          const { error: oErr } = await supabase.from('styles').update({ sort: i + 1 }).eq('id', ids[i]);
          if (oErr) return json({ ok: false, err: 'ক্রম পরিবর্তন ব্যর্থ: ' + oErr.message });
        }
        await logActivity(supabase, 'স্টাইল ক্রম পরিবর্তন', `${ids.length}টি স্টাইলের ক্রম সাজানো হয়েছে`);
        return json({ ok: true });
      }

      if (action === 'a_test') {
        let tplObj: any = null;

        if (q.style) {
          tplObj = {
            id: q.style.id || '',
            style: q.style.style || '',
            logo: q.style.logo || 'top-left',
            font1: q.style.font1,
            font2: q.style.font2,
            fdef: formatFieldDefs(q.fields || [])
          };
        } else if (q.sid) {
          const { data: stRow } = await supabase.from('styles').select('*').eq('id', q.sid).single();
          const { data: fRows } = await supabase.from('fields').select('*').eq('sid', q.sid).order('sort');
          if (stRow) {
            tplObj = {
              id: stRow.id,
              style: stRow.style || '',
              logo: stRow.logo || 'top-left',
              font1: stRow.font1,
              font2: stRow.font2,
              fdef: formatFieldDefs(fRows || [])
            };
          }
        }

        if (!tplObj) return json({ ok: false, err: 'স্টাইল পাওয়া যায়নি' });

        const baseCommand =
          q.base !== undefined
            ? q.base
            : (await supabase.from('settings').select('value').eq('key', 'base_command').single()).data?.value || '';

        const { data: bizRows } = await supabase.from('biz').select('*');
        const bizMoodMap: Record<string, string> = {};
        (bizRows || []).forEach((b: any) => (bizMoodMap[b.name] = b.mood));

        const res = buildCommand(tplObj, q.brand || {}, q.vals || {}, baseCommand, bizMoodMap);

        return json({
          ok: true,
          cmd: res.cmd,
          missing: res.missing,
          tooLong: res.tooLong,
          unknown: res.unknown
        });
      }

      if (action === 'a_eps') {
        const e = q.eps || {};
        const map: Record<string, string> = {
          merchantId: 'eps_merchant_id',
          storeId: 'eps_store_id',
          user: 'eps_username',
          pass: 'eps_password',
          key: 'eps_hash_key',
          mode: 'eps_mode'
        };

        for (const k in map) {
          if (e[k]) {
            const { error: uErr } = await supabase.from('settings').upsert({ key: map[k], value: String(e[k]).trim() }, { onConflict: 'key' });
            if (uErr) return json({ ok: false, err: 'EPS তথ্য সেভ ব্যর্থ: ' + uErr.message });
          }
        }
        clearEpsTokenCache();
        await logActivity(supabase, 'EPS কনফিগারেশন আপডেট', `EPS তথ্য সেভ করা হয়েছে (মোড: ${e.mode || 'sandbox'})`);
        return json({ ok: true });
      }

      if (action === 'a_eps_test') {
        const { data: stList } = await supabase.from('settings').select('*');
        const stMap: Record<string, string> = {};
        (stList || []).forEach((r: any) => (stMap[r.key] = r.value));

        const epsCfg = getEpsConfig(stMap);
        if (!epsCfg.ready) return json({ ok: false, err: 'আগে সব EPS তথ্য বসান' });

        clearEpsTokenCache();
        try {
          await getEpsToken(epsCfg);
          return json({ ok: true });
        } catch (err: any) {
          return json({ ok: false, err: err.message || 'EPS সংযোগ পরীক্ষা ব্যর্থ হয়েছে' });
        }
      }

      if (action === 'a_cloudinary') {
        const c = q.cloudinary || {};
        const map: Record<string, string> = {
          cloudName: 'cloudinary_cloud_name',
          apiKey: 'cloudinary_api_key',
          apiSecret: 'cloudinary_api_secret',
          folder: 'cloudinary_folder'
        };

        for (const k in map) {
          if (c[k]) {
            const { error: uErr } = await supabase.from('settings').upsert({ key: map[k], value: String(c[k]).trim() }, { onConflict: 'key' });
            if (uErr) return json({ ok: false, err: 'Cloudinary তথ্য সেভ ব্যর্থ: ' + uErr.message });
          }
        }
        await logActivity(supabase, 'Cloudinary কনফিগারেশন আপডেট', `ক্লাউড: ${c.cloudName || ''} কনফিগারেশন সেভ করা হয়েছে`);
        return json({ ok: true });
      }

      if (action === 'a_cloudinary_test') {
        const { data: stList } = await supabase.from('settings').select('*');
        const stMap: Record<string, string> = {};
        (stList || []).forEach((r: any) => (stMap[r.key] = r.value));

        const cldCfg = getCloudinaryConfig(stMap);
        if (!cldCfg.ready) return json({ ok: false, err: 'আগে Cloud Name, API Key ও Secret পূরণ করুন' });

        const testBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
        const res = await uploadToCloudinary(testBase64, 'test_connection.png', stMap, '_test');
        if (!res.ok) {
          return json({ ok: false, err: res.error || 'Cloudinary আপলোড ব্যর্থ হয়েছে' });
        }
        if (res.publicId) {
          try { await deleteFromCloudinary(res.publicId, stMap); } catch {}
        }
        return json({ ok: true, url: res.url });
      }

      if (action === 'a_sms') {
        const s = q.sms || {};
        const map: Record<string, string> = {
          token: 'sms_api_token',
          senderId: 'sms_sender_id',
          url: 'sms_api_url',
          template: 'sms_otp_template'
        };

        for (const k in map) {
          if (s[k] !== undefined && s[k] !== null && s[k] !== '') {
            const { error: uErr } = await supabase.from('settings').upsert({ key: map[k], value: String(s[k]).trim() }, { onConflict: 'key' });
            if (uErr) return json({ ok: false, err: 'SMS সেটিংস সেভ ব্যর্থ: ' + uErr.message });
          }
        }
        await logActivity(supabase, 'BulkSMSBD কনফিগারেশন আপডেট', `Sender ID: ${s.senderId || ''}, API Key ও টেমপ্লেট সেভ করা হয়েছে`);
        return json({ ok: true });
      }

      if (action === 'a_sms_test') {
        const { data: stList } = await supabase.from('settings').select('*');
        const stMap: Record<string, string> = {};
        (stList || []).forEach((r: any) => (stMap[r.key] = r.value));

        const smsCfg = getSmsConfig(stMap);
        if (!smsCfg.ready) return json({ ok: false, err: 'আগে BulkSMSBD API Key পূরণ করুন' });

        const targetPhone = normPhone(q.phone);
        if (!targetPhone) return json({ ok: false, err: 'সঠিক ১১ ডিজিটের ফোন নম্বর দিন (যেমন: 017xxxxxxxx)' });

        const sampleOtp = '1234';
        const tpl = smsCfg.otpTemplate || 'উদ্যোক্তা গ্রাফিক্স AI তে আপনার ওটিপি কোড: {otp}। মেয়াদ ৫ মিনিট।';
        const testMsg = tpl.includes('{otp}') ? tpl.replace(/\{otp\}/g, sampleOtp) : `${tpl} ${sampleOtp}`;
        try {
          const formattedPhone = targetPhone.startsWith('88') ? targetPhone : `88${targetPhone}`;
          const res = await fetch(smsCfg.apiUrl, {
            method: 'POST',
            body: new URLSearchParams({
              api_key: smsCfg.apiToken,
              type: 'text',
              number: formattedPhone,
              senderid: smsCfg.senderId || '',
              message: testMsg
            })
          });
          const txt = await res.text();
          let parsed: any = null;
          try { parsed = JSON.parse(txt); } catch (_) {}
          return json({ ok: true, raw: txt, data: parsed, sentMessage: testMsg });
        } catch (e: any) {
          return json({ ok: false, err: e.message || 'BulkSMSBD গেটওয়ে এরর' });
        }
      }

      if (action === 'a_brevo') {
        const b = q.brevo || {};
        const map: Record<string, string> = {
          apiKey: 'brevo_api_key',
          senderEmail: 'brevo_sender_email',
          senderName: 'brevo_sender_name'
        };

        for (const k in map) {
          if (b[k] !== undefined && b[k] !== null && b[k] !== '') {
            const { error: uErr } = await supabase.from('settings').upsert({ key: map[k], value: String(b[k]).trim() }, { onConflict: 'key' });
            if (uErr) return json({ ok: false, err: 'Brevo সেটিংস সেভ ব্যর্থ: ' + uErr.message });
          }
        }
        await logActivity(supabase, 'Brevo ইমেইল কনফিগারেশন আপডেট', `Sender: ${b.senderEmail || ''}, API Key সেভ করা হয়েছে`);
        return json({ ok: true });
      }

      if (action === 'a_email_test') {
        const { data: stList } = await supabase.from('settings').select('*');
        const stMap: Record<string, string> = {};
        (stList || []).forEach((r: any) => (stMap[r.key] = r.value));

        const brevoCfg = getBrevoConfig(stMap);
        if (!brevoCfg.ready) return json({ ok: false, err: 'আগে Brevo API Key ও Sender Email পূরণ ও সেভ করুন' });

        const toEmail = String(q.to || '').trim().toLowerCase();
        if (!toEmail || !toEmail.includes('@')) return json({ ok: false, err: 'সঠিক ইমেইল এড্রেস দিন' });

        const res = await sendBrevoEmail(brevoCfg, toEmail, '1234', true);
        return json(res);
      }

      if (action === 'a_pass') {
        const oldPass = String(q.old || '');
        const newPass = String(q.pass || '');
        if (newPass.length < 8) {
          return json({ ok: false, err: 'নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের দিন' });
        }

        const { data: pRow } = await supabase.from('settings').select('value').eq('key', 'admin_password').single();
        const dbPass = String(pRow?.value || '').trim();
        const envPass = String(Deno.env.get('ADMIN_PASSWORD') || '').trim();
        const envHash = String(Deno.env.get('ADMIN_PASSWORD_HASH') || '').trim();

        let oldMatches = false;
        if (dbPass) {
          oldMatches = (await verifyPasswordStored(oldPass, dbPass)).ok;
        } else if (envPass) {
          oldMatches = (await verifyPasswordStored(oldPass, envPass)).ok;
        } else if (envHash) {
          const oldHash = await sha256Hex(oldPass);
          oldMatches = timingSafeEqual(oldHash, envHash.toLowerCase());
        }

        if (!oldMatches) {
          return json({ ok: false, err: 'বর্তমান পাসওয়ার্ড মেলেনি' });
        }

        const hashedNew = await hashPasswordPbkdf2(newPass);
        const { error: pErr } = await supabase.from('settings').upsert({ key: 'admin_password', value: hashedNew }, { onConflict: 'key' });
        if (pErr) return json({ ok: false, err: 'পাসওয়ার্ড পরিবর্তন ব্যর্থ: ' + pErr.message });
        // বর্তমান সেশন ছাড়া বাকি সব পুরোনো অ্যাডমিন সেশন বাতিল করা
        await supabase.from('admin_sessions').delete().neq('token', tok);
        await logActivity(supabase, 'অ্যাডমিন পাসওয়ার্ড পরিবর্তন', 'অ্যাডমিন প্যানেলের পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে');
        return json({ ok: true });
      }

      if (action === 'a_landing') {
        const { data: row } = await supabase.from('landing_config').select('data').eq('id', 'main').single();
        return json({ ok: true, config: row?.data || {} });
      }

      if (action === 'a_landing_save') {
        const config = q.config;
        if (!config || typeof config !== 'object') {
          return json({ ok: false, err: 'কনফিগ ডাটা পাওয়া যায়নি' });
        }

        const { error } = await supabase
          .from('landing_config')
          .upsert({ id: 'main', data: config, updated_at: new Date().toISOString() }, { onConflict: 'id' });

        if (error) return json({ ok: false, err: error.message });

        const { error: stMirrorErr } = await supabase
          .from('settings')
          .upsert({ key: 'landing_config', value: JSON.stringify(config) }, { onConflict: 'key' });
        if (stMirrorErr) return json({ ok: false, err: stMirrorErr.message });

        await logActivity(supabase, 'ল্যান্ডিং পেজ কন্ট্রোল (CMS)', 'ল্যান্ডিং পেজের সেকশন ও কনটেন্ট পরিবর্তন করা হয়েছে');
        return json({ ok: true });
      }

      if (action === 'a_reset_test_data') {
        const { data, error } = await supabase.rpc('admin_reset_test_data', { p_tok: tok });
        if (error) return json({ ok: false, err: error.message });
        return json(data || { ok: true, message: 'সব টেস্ট ডেটা সফলভাবে মুছে সিস্টেম ফ্রেশ করা হয়েছে' });
      }
    }

    return json({ ok: false, err: 'অজানা কমান্ড বা অ্যাকশন' });
  } catch (err: any) {
    return json({ ok: false, err: err.message || 'সার্ভার প্রক্রিয়াকরণে সমস্যা হয়েছে' });
  }
});

/**
 * EPS লেনদেন স্ট্যাটাস ভেরিফাই ও মেম্বারশিপ অ্যাক্টিভেশন
 */
async function verifyPayment(supabase: any, tx: string) {
  const { data: stList } = await supabase.from('settings').select('*');
  const stMap: Record<string, string> = {};
  (stList || []).forEach((r: any) => (stMap[r.key] = r.value));

  const epsCfg = getEpsConfig(stMap);
  if (!epsCfg.ready) return { ok: false, err: 'EPS সেটিংস বসানো নেই' };

  const { data: p } = await supabase.from('payments').select('*').eq('id', tx).single();
  if (!p) return { ok: false, err: 'পেমেন্ট রেকর্ড পাওয়া যায়নি' };

  if (p.status !== 'pending' && p.status !== 'অপেক্ষায়') {
    return { ok: true, status: p.status };
  }

  const res = await checkTransactionStatus(epsCfg, tx);
  const statusStr = String(res.Status || '').toLowerCase();

  if (statusStr === 'success') {
    // EPS থেকে পরিশোধিত টাকার পরিমাণ যাচাই
    const paidAmt = Number(res.TotalAmount ?? res.totalAmount ?? res.Amount ?? res.amount);
    if (!isNaN(paidAmt) && paidAmt > 0 && paidAmt + 0.01 < Number(p.amount || 0)) {
      return { ok: false, err: 'পেমেন্টের টাকার পরিমাণ মেলেনি' };
    }

    const finEntity = String(res.FinancialEntity || '').trim();
    const methodLabel = finEntity ? (finEntity.toUpperCase().includes('EPS') ? finEntity : `EPS (${finEntity})`) : 'EPS';

    // অ্যাটমিক স্ট্যাটাস লক: শুধু pending থাকা অবস্থাতেই success হবে — ডাবল মেয়াদ বৃদ্ধি (race condition) প্রতিরোধ
    const { data: claimed, error: pErr } = await supabase
      .from('payments')
      .update({
        status: 'success',
        trx: res.EpsTransactionId || res.EPSTransactionId || '',
        method: methodLabel,
        done_at: new Date().toISOString()
      })
      .eq('id', tx)
      .in('status', ['pending', 'অপেক্ষায়'])
      .select('id');

    if (pErr) return { ok: false, err: 'পেমেন্ট স্ট্যাটাস আপডেট ব্যর্থ: ' + pErr.message };
    if (!claimed || claimed.length === 0) {
      // অন্য একটি কনকারেন্ট রিকোয়েস্ট ইতিমধ্যে এটি প্রসেস করে ফেলেছে
      return { ok: true, status: 'success' };
    }

    const { data: mem } = await supabase.from('members').select('*').eq('phone', p.phone).single();
    const today = todayDhaka();
    const pkgDays = Number(stMap.days) || 365;
    const baseDate = mem?.expiry && mem.expiry > today && (mem.status === 'paid' || mem.status === 'পেইড') ? mem.expiry : today;
    const newExpiry = addDays(baseDate, pkgDays);

    const { error: mErr } = await supabase.from('members').update({
      expiry: newExpiry,
      status: 'paid'
    }).eq('phone', p.phone);
    if (mErr) return { ok: false, err: 'মেম্বারশিপ আপডেট ব্যর্থ: ' + mErr.message };

    return { ok: true, status: 'success' };
  } else if (/fail|cancel|declin|expire|reject/.test(statusStr)) {
    await supabase.from('payments').update({
      status: 'cancelled',
      note: `EPS: ${res.Status}`,
      done_at: new Date().toISOString()
    }).eq('id', tx).in('status', ['pending', 'অপেক্ষায়']);
    return { ok: true, status: 'cancelled' };
  }

  return { ok: true, status: p.status };
}
