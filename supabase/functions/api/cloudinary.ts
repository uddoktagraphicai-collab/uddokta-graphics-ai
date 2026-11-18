// =====================================================================
//  উদ্যোক্তা গ্রাফিক্স AI — Cloudinary Upload Helper (Zero Supabase Egress)
// =====================================================================

export interface CloudinaryUploadResult {
  ok: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

export interface CloudinaryDeleteResult {
  ok: boolean;
  result?: string;
  error?: string;
}

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folder: string;
  ready: boolean;
}

/**
 * Cloudinary URL থেকে নিরাপদে public_id এক্সট্র্যাক্ট করে
 */
export function extractPublicId(url?: string): string | null {
  if (!url || typeof url !== 'string') return null;
  if (!url.includes('res.cloudinary.com')) return null;

  try {
    const uploadIdx = url.indexOf('/upload/');
    if (uploadIdx === -1) return null;

    let pathAfterUpload = url.substring(uploadIdx + '/upload/'.length);
    pathAfterUpload = pathAfterUpload.split('?')[0].split('#')[0];

    const segments = pathAfterUpload.split('/');
    let startIdx = 0;
    while (startIdx < segments.length) {
      const seg = segments[startIdx];
      if (/^v\d+$/.test(seg)) {
        startIdx++;
        break;
      }
      if (seg.includes(',') || /^[a-z]{1,3}_/.test(seg)) {
        startIdx++;
        continue;
      }
      break;
    }

    const publicIdWithExt = segments.slice(startIdx).join('/');
    if (!publicIdWithExt) return null;

    const dotIdx = publicIdWithExt.lastIndexOf('.');
    if (dotIdx > 0) {
      return publicIdWithExt.substring(0, dotIdx);
    }
    return publicIdWithExt;
  } catch (_e) {
    return null;
  }
}

/**
 * SHA-1 হ্যাশ জেনারেটর (Web Crypto API)
 */
async function sha1(str: string): Promise<string> {
  const enc = new TextEncoder().encode(str);
  const hashBuf = await crypto.subtle.digest('SHA-1', enc);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Cloudinary কনফিগারেশন রিডার (Database Settings || Deno.env)
 */
export function getCloudinaryConfig(overrideMap?: Record<string, string>): CloudinaryConfig {
  const get = (k: string) =>
    (overrideMap && (overrideMap[k.toLowerCase()] || overrideMap[k])) ||
    Deno.env.get(k) ||
    '';

  const cloudName = get('CLOUDINARY_CLOUD_NAME');
  const apiKey = get('CLOUDINARY_API_KEY');
  const apiSecret = get('CLOUDINARY_API_SECRET');
  const folder = get('CLOUDINARY_FOLDER') || 'uddokta_graphics_ai';
  const ready = Boolean(cloudName && apiKey && apiSecret && !cloudName.includes('your_'));

  return { cloudName, apiKey, apiSecret, folder, ready };
}

function cleanPathSeg(p?: string): string {
  return String(p || '')
    .trim()
    .replace(/\\/g, '/')
    .replace(/[^a-zA-Z0-9/_-]/g, '_')
    .replace(/\/+/g, '/')
    .replace(/^\/+|\/+$/g, '');
}

function makeCleanStem(fileName?: string): string {
  const base = String(fileName || 'image')
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 48) || 'img';
  const rand = Math.random().toString(36).slice(2, 7);
  return /\d{10,}/.test(base) ? `${base}_${rand}` : `${base}_${Date.now()}_${rand}`;
}

/**
 * Cloudinary-তে ছবি আপলোড করে অপ্টিমাইজড লিঙ্ক প্রদান করে (বেস৬৪ ডাটা অথবা রিমোট ইমেজ লিঙ্ক)
 * প্যারেন্ট ফোল্ডার ও সাবফোল্ডার (Dynamic + Fixed Folder উভয় মোডে) সাপোর্ট করে
 */
export async function uploadToCloudinary(
  fileOrUrl: string,
  fileName: string = 'image.jpg',
  overrideMap?: Record<string, string>,
  subfolder?: string
): Promise<CloudinaryUploadResult> {
  const cfg = getCloudinaryConfig(overrideMap);

  if (!cfg.ready) {
    return {
      ok: false,
      error: 'Cloudinary credentials missing or unconfigured (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)'
    };
  }

  const { cloudName, apiKey, apiSecret } = cfg;
  const rootFolder = cleanPathSeg(cfg.folder) || 'uddokta_graphics_ai';
  const sub = cleanPathSeg(subfolder);
  const targetFolder = sub ? `${rootFolder}/${sub}` : rootFolder;
  const stem = makeCleanStem(fileName);

  // বেস৬৪ অথবা রিমোট ওয়েব URL হ্যান্ডলিং
  let fileToUpload = String(fileOrUrl || '').trim();
  if (!/^https?:\/\//i.test(fileToUpload)) {
    fileToUpload = fileToUpload.startsWith('data:')
      ? fileToUpload
      : `data:image/jpeg;base64,${fileToUpload}`;
  }

  const doSignedUpload = async (useDynamicMode: boolean) => {
    const timestamp = Math.floor(Date.now() / 1000);
    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('api_key', apiKey);
    formData.append('timestamp', String(timestamp));

    let toSign = '';
    if (useDynamicMode) {
      // Dynamic Folder Mode (নতুন Cloudinary অ্যাকাউন্ট): asset_folder + full public_id
      const fullPublicId = `${targetFolder}/${stem}`;
      toSign = `asset_folder=${targetFolder}&public_id=${fullPublicId}&timestamp=${timestamp}${apiSecret}`;
      formData.append('asset_folder', targetFolder);
      formData.append('public_id', fullPublicId);
    } else {
      // Legacy Fixed Folder Mode ফলব্যাক
      toSign = `folder=${targetFolder}&public_id=${stem}&timestamp=${timestamp}${apiSecret}`;
      formData.append('folder', targetFolder);
      formData.append('public_id', stem);
    }

    const signature = await sha1(toSign);
    formData.append('signature', signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });
    const json = await res.json();
    return { res, json };
  };

  try {
    let { res, json } = await doSignedUpload(true);

    // পুরোনো Fixed Folder অ্যাকাউন্টে asset_folder রিজেক্ট করলে স্বয়ংক্রিয়ভাবে folder মোডে রিট্রাই
    if ((!res.ok || json?.error) && /asset_folder/i.test(String(json?.error?.message || ''))) {
      ({ res, json } = await doSignedUpload(false));
    }

    if (!res.ok || json.error) {
      return {
        ok: false,
        error: json.error?.message || `Cloudinary upload failed with status ${res.status}`
      };
    }

    // অটো কম্প্রেশন ও রেস্পন্সিভ ফরম্যাট ট্রান্সফর্মেশন যোগ করা
    let optimizedUrl = json.secure_url;
    if (optimizedUrl.includes('/upload/')) {
      optimizedUrl = optimizedUrl.replace('/upload/', '/upload/f_auto,q_auto/');
    }

    return {
      ok: true,
      url: optimizedUrl,
      publicId: json.public_id
    };
  } catch (err: any) {
    return {
      ok: false,
      error: err.message || 'Network error while uploading to Cloudinary'
    };
  }
}

/**
 * Cloudinary থেকে ফাইল পার্মানেন্টলি ডিলিট করে
 * publicIdOrUrl: ক্লাউডিনারির পাবলিক আইডি অথবা ক্লাউডিনারি ইমেজ URL
 */
export async function deleteFromCloudinary(
  publicIdOrUrl: string,
  overrideMap?: Record<string, string>
): Promise<CloudinaryDeleteResult> {
  const target = String(publicIdOrUrl || '').trim();
  if (!target) {
    return { ok: true, result: 'noop' };
  }

  // যদি সরাসরি পুরো URL দেওয়া থাকে, তাহলে সেখান থেকে public_id উদ্ধার করা
  let publicId: string | null = target;
  if (target.includes('/') && target.includes('res.cloudinary.com')) {
    publicId = extractPublicId(target);
  }

  if (!publicId) {
    // লোকাল ফাইল (যেমন images/samples/...) বা থার্ড-পার্টি লিঙ্ক হলে ক্লাউডিনারিতে ডিলিটের কিছু নেই
    return { ok: true, result: 'noop' };
  }

  const cfg = getCloudinaryConfig(overrideMap);
  if (!cfg.ready) {
    return {
      ok: false,
      error: 'Cloudinary credentials missing or unconfigured'
    };
  }

  const { cloudName, apiKey, apiSecret } = cfg;
  const timestamp = Math.floor(Date.now() / 1000);

  // destroy প্যারামিটার সিগনেচার (অ্যালফাবেটিক্যাল অর্ডারে)
  const toSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = await sha1(toSign);

  const formData = new FormData();
  formData.append('public_id', publicId);
  formData.append('api_key', apiKey);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      body: formData
    });

    const json = await res.json();
    if (!res.ok || json.error) {
      return {
        ok: false,
        error: json.error?.message || `Cloudinary destroy failed with status ${res.status}`
      };
    }

    return {
      ok: json.result === 'ok' || json.result === 'not found',
      result: json.result
    };
  } catch (err: any) {
    return {
      ok: false,
      error: err.message || 'Network error while deleting from Cloudinary'
    };
  }
}
