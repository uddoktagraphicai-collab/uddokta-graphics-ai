// =====================================================================
//  উদ্যোক্তা গ্রাফিক্স AI — EPS (Easy Payment System) Handler
// =====================================================================

export interface EpsConfig {
  merchantId: string;
  storeId: string;
  user: string;
  pass: string;
  key: string;
  mode: 'sandbox' | 'live';
  base: string;
  ready: boolean;
  email?: string;
}

const EPS_BASE = {
  sandbox: 'https://sandboxpgapi.eps.com.bd',
  live: 'https://pgapi.eps.com.bd'
};

// মেমোরি ক্যাশ (৩০ মিনিট মেয়াদে টোকেন ক্যাশ রাখার জন্য)
let tokenCache: { token: string; expiresAt: number; mode: string } | null = null;

export function clearEpsTokenCache() {
  tokenCache = null;
}

export function getEpsConfig(overrideMap?: Record<string, string>): EpsConfig {
  const get = (k: string) =>
    (overrideMap && (overrideMap[k.toLowerCase()] || overrideMap[k])) ||
    Deno.env.get(k) ||
    '';

  const merchantId = get('EPS_MERCHANT_ID');
  const storeId = get('EPS_STORE_ID');
  const user = get('EPS_USERNAME');
  const pass = get('EPS_PASSWORD');
  const key = get('EPS_HASH_KEY');
  const mode = (get('EPS_MODE') || 'sandbox').toLowerCase() as 'sandbox' | 'live';

  const base = EPS_BASE[mode] || EPS_BASE.sandbox;
  const ready = Boolean(merchantId && storeId && user && pass && key);
  const email = get('EPS_EMAIL') || 'billing@uddoktagraphics.com';

  return {
    merchantId,
    storeId,
    user,
    pass,
    key,
    mode: mode === 'live' ? 'live' : 'sandbox',
    base,
    ready,
    email
  };
}

/**
 * EPS HMAC-SHA512 সিগনেচার হ্যাশ তৈরি (Web Crypto API)
 */
export async function epsHash(data: string, key: string): Promise<string> {
  const enc = new TextEncoder();
  const keyData = enc.encode(key);
  const messageData = enc.encode(data);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const bytes = new Uint8Array(signature);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * EPS এন্ডপয়েন্টে অথেনটিকেটেড রিকোয়েস্ট পাঠায়
 */
export async function epsFetch(
  c: EpsConfig,
  method: 'GET' | 'POST',
  path: string,
  hashData: string,
  body?: any,
  token?: string
) {
  const hash = await epsHash(hashData, c.key);
  const headers: Record<string, string> = {
    'x-hash': hash,
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const opt: RequestInit = {
    method,
    headers
  };

  if (body) {
    opt.body = JSON.stringify(body);
  }

  const res = await fetch(c.base + path, opt);
  const text = await res.text();

  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`EPS থেকে ভুল উত্তর (কোড ${res.status}): ${text.slice(0, 100)}`);
  }

  if (res.status >= 300) {
    throw new Error(
      `EPS সমস্যা (কোড ${res.status}): ${json.ErrorMessage || json.message || text.slice(0, 120)}`
    );
  }

  return json;
}

/**
 * EPS অথেনটিকেশন টোকেন আনে (৩০ মিনিট মেমোরি ক্যাশ)
 */
export async function getEpsToken(c: EpsConfig): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.mode === c.mode && tokenCache.expiresAt > now) {
    return tokenCache.token;
  }

  const res = await epsFetch(c, 'POST', '/v1/Auth/GetToken', c.user, {
    userName: c.user,
    password: c.pass
  });

  if (!res.token) {
    throw new Error('EPS লগইন ব্যর্থ: ' + (res.errorMessage || res.ErrorMessage || 'username/password যাচাই করুন'));
  }

  // ৩০ মিনিট (১৮০০ সেকেন্ড) মেয়াদের জন্য ক্যাশ
  tokenCache = {
    token: res.token,
    expiresAt: now + 25 * 60 * 1000,
    mode: c.mode
  };

  return res.token;
}

/**
 * পেমেন্ট সেশন শুরু করে (InitializeEPS)
 */
export async function initializePayment(
  c: EpsConfig,
  tx: string,
  price: number,
  member: { phone: string; brand?: string },
  returnUrl: string
) {
  if (!c.ready) {
    throw new Error('EPS সেটিংস কনফিগার করা নেই');
  }

  const token = await getEpsToken(c);

  const body = {
    merchantId: c.merchantId,
    storeId: c.storeId,
    CustomerOrderId: 'UG' + tx,
    merchantTransactionId: tx,
    transactionTypeId: 1,
    financialEntityId: 0,
    transitionStatusId: 0,
    ipAddress: '0.0.0.0',
    version: '1',
    totalAmount: price,
    successUrl: returnUrl,
    failUrl: returnUrl,
    cancelUrl: returnUrl,
    customerName: member.brand || 'Customer ' + member.phone.slice(-4),
    customerEmail: c.email || Deno.env.get('EPS_EMAIL') || 'billing@uddoktagraphics.com',
    customerAddress: 'Bangladesh',
    customerCity: 'Dhaka',
    customerState: 'Dhaka',
    customerPostcode: '1200',
    customerCountry: 'BD',
    customerPhone: member.phone,
    productName: 'উদ্যোক্তা গ্রাফিক্স AI মেম্বারশিপ',
    productProfile: 'general',
    productCategory: 'Membership',
    ProductList: [
      {
        ProductName: 'Membership',
        NoOfItem: '1',
        ProductProfile: 'general',
        ProductCategory: 'Membership',
        ProductPrice: String(price)
      }
    ]
  };

  const res = await epsFetch(c, 'POST', '/v1/EPSEngine/InitializeEPS', tx, body, token);

  if (res.ErrorMessage || !res.RedirectURL) {
    throw new Error('EPS পেমেন্ট শুরু হয়নি: ' + (res.ErrorMessage || 'Redirect URL পাওয়া যায়নি'));
  }

  return {
    redirectUrl: res.RedirectURL
  };
}

/**
 * EPS লেনদেনের অবস্থা যাচাই করে
 */
export async function checkTransactionStatus(c: EpsConfig, tx: string) {
  if (!c.ready) {
    throw new Error('EPS সেটিংস কনফিগার করা নেই');
  }

  const token = await getEpsToken(c);
  const path = `/v1/EPSEngine/CheckMerchantTransactionStatus?merchantTransactionId=${encodeURIComponent(tx)}`;
  const res = await epsFetch(c, 'GET', path, tx, null, token);

  return res;
}
