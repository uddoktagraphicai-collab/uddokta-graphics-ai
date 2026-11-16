// =====================================================================
//  উদ্যোক্তা গ্রাফিক্স AI — Command Engine (TypeScript / Deno)
// =====================================================================

export const LOGO_POS: Record<string, string> = {
  'top-left': 'at the top-left corner with about 5% margin',
  'top-center': 'at the top center with about 5% margin',
  'top-right': 'at the top-right corner with about 5% margin',
  'bottom-left': 'at the bottom-left corner with about 5% margin',
  'bottom-center': 'at the bottom center with about 5% margin',
  'bottom-right': 'at the bottom-right corner with about 5% margin',
  // Bengali fallbacks
  'উপরে বামে': 'at the top-left corner with about 5% margin',
  'উপরে মাঝে': 'at the top center with about 5% margin',
  'উপরে ডানে': 'at the top-right corner with about 5% margin',
  'নিচে বামে': 'at the bottom-left corner with about 5% margin',
  'নিচে মাঝে': 'at the bottom center with about 5% margin',
  'নিচে ডানে': 'at the bottom-right corner with about 5% margin'
};

export const LOGO_SIZE: Record<string, string> = {
  wide: 'about 18–20% of the canvas width',
  square: 'about 12% of the canvas width',
  tall: 'about 8–10% of the canvas width',
  'চওড়া': 'about 18–20% of the canvas width',
  'চৌকো': 'about 12% of the canvas width',
  'লম্বা': 'about 8–10% of the canvas width'
};

export const FONTS = [
  'Hind Siliguri',
  'Anek Bangla',
  'Noto Serif Bengali',
  'Noto Sans Bengali',
  'Solaiman Lipi'
];

export const ELEMENTS_MAP: Record<string, { bn: string; en: string; mean: string; lim: number }> = {
  product: { bn: 'প্রোডাক্টের নাম', en: 'PRODUCT', mean: 'what the product is; never printed on the design', lim: 30 },
  headline: { bn: 'হেডলাইন', en: 'HEADLINE', mean: 'the main message of the design', lim: 30 },
  sub: { bn: 'সাব-হেডলাইন', en: 'SUB HEADLINE', mean: 'supports the headline, second most important', lim: 50 },
  short: { bn: 'ছোট লেখা', en: 'SHORT TEXT', mean: 'a short supporting line or detail', lim: 50 },
  bullet: { bn: 'বুলেট পয়েন্ট', en: 'BULLET POINT', mean: 'one point in a list of points', lim: 25 },
  offer: { bn: 'অফার', en: 'OFFER', mean: 'the offer, discount or highlight', lim: 20 },
  price: { bn: 'দাম', en: 'PRICE', mean: 'the current price', lim: 12 },
  oldprice: { bn: 'আগের দাম', en: 'OLD PRICE', mean: 'the old price before the offer', lim: 12 },
  date: { bn: 'তারিখ / সময়', en: 'DATE / TIME', mean: 'a date, time, duration or deadline', lim: 30 },
  badge: { bn: 'ব্যাজ', en: 'BADGE', mean: 'a very short tag of 1 to 3 words', lim: 15 },
  button: { bn: 'বাটনের লেখা', en: 'BUTTON', mean: 'a short call to action', lim: 20 },
  phone: { bn: 'ফোন নম্বর', en: 'PHONE', mean: 'a phone number', lim: 14 },
  address: { bn: 'ঠিকানা / ওয়েবসাইট', en: 'ADDRESS / WEBSITE', mean: 'an address, website or courier information', lim: 50 }
};

/**
 * বাংলা বর্ণ সঠিকভাবে গুনে বের করার ফাংশন
 */
export function graphemes(s: string): number {
  if (!s) return 0;
  try {
    // @ts-ignore: Intl.Segmenter is available in Deno
    const segmenter = new Intl.Segmenter('bn', { granularity: 'grapheme' });
    let count = 0;
    for (const _ of segmenter.segment(s)) count++;
    return count;
  } catch {
    // Fallback parser for Bengali combining characters
    let n = 0;
    let prevHasanta = false;
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i);
      const combining =
        (c >= 0x0981 && c <= 0x0983) ||
        (c >= 0x09bc && c <= 0x09d7 && c !== 0x09ce) ||
        c === 0x09e2 ||
        c === 0x09e3 ||
        c === 0x200c ||
        c === 0x200d;
      if (combining) {
        prevHasanta = c === 0x09cd;
        continue;
      }
      if (prevHasanta) {
        prevHasanta = false;
        continue;
      }
      n++;
    }
    return n;
  }
}

export interface FieldDef {
  el: string;
  name: string;
  en: string;
  mean: string;
  ex: string;
  lim: number;
  req: boolean;
}

export function formatFieldDefs(rawFields: any[]): FieldDef[] {
  const sorted = [...rawFields].sort((a, b) => (Number(a.sort) || 1) - (Number(b.sort) || 1));
  const counts: Record<string, number> = {};
  const seen: Record<string, number> = {};
  sorted.forEach((f) => {
    counts[f.el] = (counts[f.el] || 0) + 1;
  });

  return sorted.map((f) => {
    const elMeta = ELEMENTS_MAP[f.el] || {
      bn: f.el,
      en: f.el.toUpperCase(),
      mean: 'text element',
      lim: 50
    };
    let numStr = '';
    if (counts[f.el] > 1) {
      seen[f.el] = (seen[f.el] || 0) + 1;
      const n = seen[f.el];
      numStr = ' ' + '০১২৩৪৫৬৭৮৯'.charAt(n);
    }
    return {
      el: f.el,
      name: elMeta.bn + numStr,
      en: elMeta.en + (numStr ? ' ' + seen[f.el] : ''),
      mean: elMeta.mean,
      ex: f.ex || '',
      lim: Number(f.lim) || elMeta.lim,
      req: f.req === true || f.req === 'true' || f.req === 'TRUE'
    };
  });
}

/**
 * পূর্ণাঙ্গ কাস্টমাইজড কমান্ড তৈরি করে
 */
export function buildCommand(
  template: {
    id: string;
    style: string;
    logo: string;
    font1?: string;
    font2?: string;
    fdef: FieldDef[];
  },
  member: {
    brand?: string;
    tagline?: string;
    biz?: string;
    c1?: string;
    c2?: string;
    c3?: string;
    shape?: string;
  },
  values: Record<string, string>,
  baseCommand: string,
  bizMoodMap: Record<string, string>
) {
  const lines: string[] = [];
  const missing: string[] = [];
  const tooLong: string[] = [];

  template.fdef.forEach((f, idx) => {
    const v = String(values[idx] || '').trim();
    if (!v) {
      if (f.req) missing.push(f.name);
      return;
    }
    if (graphemes(v) > f.lim) {
      tooLong.push(f.name);
    }
    lines.push(`- ${f.en} (${f.mean}): "${v}"`);
  });

  const shapeKey = member.shape || 'square';
  const logoPosKey = template.logo || 'top-left';

  // Product ভ্যালু নির্ধারণ: সদস্যের প্রোডাক্ট, অথবা প্রোডাক্ট ফিল্ড, অথবা হেডলাইন ফিল্ড, অথবা ব্যবসার ধরন
  let productVal = (member as any).product || '';
  if (!productVal && template.fdef) {
    template.fdef.forEach((f, i) => {
      if (!productVal && f.el === 'product') {
        productVal = values[i] || '';
      }
    });
    if (!productVal) {
      template.fdef.forEach((f, i) => {
        if (!productVal && f.el === 'headline') {
          productVal = values[i] || '';
        }
      });
    }
  }
  if (!productVal) {
    productVal = (member as any).biz || template.name || 'the advertised product';
  }

  const map: Record<string, string> = {
    product: productVal,
    brand: member.brand || '—',
    tagline: member.tagline || '—',
    mood: (member.biz && bizMoodMap[member.biz]) || 'clean and simple',
    color1: member.c1 || '#F39200',
    color2: member.c2 || '#1D1D21',
    color3: member.c3 || '#FFFFFF',
    colors: [member.c1, member.c2, member.c3].filter(Boolean).join(', ') || '#F39200, #1D1D21, #FFFFFF',
    logo_position: LOGO_POS[logoPosKey] || LOGO_POS['top-left'],
    logo_size: LOGO_SIZE[shapeKey] || LOGO_SIZE['square'],
    texts: lines.length
      ? lines.join('\n')
      : '(No text on this design — show only the product and the logo.)',
    style: template.style || '',
    font_head:
      template.font1 && FONTS.includes(template.font1)
        ? template.font1
        : 'choose the best fit among the five allowed fonts for this style',
    font_body:
      template.font2 && FONTS.includes(template.font2)
        ? template.font2
        : 'choose the best fit among the five allowed fonts for this style'
  };

  let cmd = String(baseCommand || '').split('{{style}}').join(map.style);
  for (const k in map) {
    cmd = cmd.split(`{{${k}}}`).join(map[k]);
  }

  const unknown = cmd.match(/\{\{\w+\}\}/g) || [];

  return {
    cmd,
    missing,
    tooLong,
    unknown
  };
}
