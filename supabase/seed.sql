-- =====================================================================
--  উদ্যোক্তা গ্রাফিক্স AI — Production Seed Data for Supabase
-- =====================================================================

-- 1. Settings
INSERT INTO settings (key, value) VALUES
  ('price', '399'),
  ('monthly', '33'),
  ('days', '365'),
  ('base_command', 'MANDATORY — READ FIRST: Read this ENTIRE brief from the first line to the last line before you start. Do not begin the image until you have read every section. Every rule below is mandatory and must be applied 100%. Do not ask questions; create the design directly.

ROLE
You are a senior graphic designer for Bangladeshi brands. Create ONE finished, professional social media post, square 1:1 (1080x1080). It must feel premium, luxurious, calm and clean — never crowded, never cheap.

BRAND
- Product: {{product}}
- Brand name: {{brand}}
- Tagline: {{tagline}}
- Business type / mood: {{mood}}
- Brand colors (HEX): primary {{color1}}, secondary {{color2}}, tertiary {{color3}}
- LOGO: use the attached logo EXACTLY as it is — never redraw, recolor, crop or simplify it. Place it {{logo_position}}, {{logo_size}}, small and clean, with clear contrast.

TEXT ON THE DESIGN — ONLY these lines, nothing else
Write every line exactly as given (Bangla spelling unchanged, no English letters inside Bangla lines). Each line starts with its element (HEADLINE, SUB HEADLINE, PRICE …) and what that element means. Show every line as that element. Where each element sits and how it looks comes from the STYLE OF THIS TEMPLATE below. Do not add any other text.
{{texts}}

MASTER RULE 1 — HERO (first impression)
The product or main subject is the hero and the first thing the eye sees. Always in the foreground, sharp focus, clean, beautifully lit. Size: usually about 40–45% of the canvas; up to 60% only if the product type and scene need it. Never so big that the design feels crowded, never so small that the space looks empty. If a product/person photo is attached, use it unchanged — do not change its shape, label, colors, face, expression or clothing; only improve light and resize.

MASTER RULE 2 — BACKGROUND (dynamic story)
The background tells the story of THIS specific product or service: the environment where it belongs or is used. You decide the environment and its objects fresh for each topic — nothing is fixed. The entire background is shallow depth of field, heavily blurred, so only about 13–17% of its detail is visible. Light and mood must suit the topic. Clean, soft, uncluttered.

MASTER RULE 3 — TEXT HIERARCHY (by element)
1. Hero (image) — first.
2. HEADLINE — the largest text, maximum 2 lines, the first text the eye reads.
3. SUB HEADLINE, OFFER and PRICE — clearly smaller than the HEADLINE, the next things the eye reads. OFFER and PRICE can be shown in a brand color.
4. All other elements (SHORT TEXT, BULLET POINT, OLD PRICE, DATE / TIME, BADGE, BUTTON, PHONE, ADDRESS / WEBSITE) — small, clean and easy to scan, never competing with the HEADLINE.
All text sits together in one calm text area (about 20–25% of the canvas) on a rule-of-thirds position, related lines close, groups clearly separated. Phone, website or address lines may sit separately at the very bottom.
Use the label of each line to choose how it looks: a price as a clear number with টাকা, an old price with a thin strike-through next to the new price, a discount as a short percentage highlight, a countdown as a bold number, a date or duration in a small soft box, phone / website / address with tiny simple icons in one clean line.

MASTER RULE 4 — COLOR (brand consistency)
All text colors and accents come ONLY from the three brand colors above. Typical use: one headline line in the darkest brand color, the key word or second headline line in the primary brand color, divider and offer highlight in brand colors. If none of the brand colors is dark enough for readable text, use a very deep shade of the primary color. Never introduce unrelated colors. Text must have strong contrast and read instantly on a mobile screen.

MASTER RULE 5 — FONT
Use at most two clean, highly readable Bangla fonts that suit the STYLE OF THIS TEMPLATE: a bold display font for the HEADLINE and a clean regular font for the other elements. Never add any other font. Bangla letters must stay clean, correct and unbroken. Hierarchy comes from size and the brand colors.

MASTER RULE 6 — NEGATIVE SPACE AND BALANCE
The design must breathe. Keep generous negative space so hero, text and background feel balanced. Use strict rule of thirds. Balance color, contrast, light and proximity across the whole canvas. Use every element only where it helps balance — nothing extra.

MASTER RULE 7 — NEVER ADD
No caption or paragraph on the image. No text that is not in the TEXT list. No stickers, emojis, robots, cartoon characters, fake logos, watermarks or broken Bangla letters. No glow, neon, lens flare or heavy gradients. Decorative elements (frames, pins, icons, badges, shapes) only when the STYLE OF THIS TEMPLATE asks for them or a line''s role needs a tiny icon.

MASTER RULE 8 — HALAL MARKETING
Never show women or female figures on your own. Never show immodest or revealing clothing under any situation. For clothing use a mannequin or flat lay. If a human is needed, show only male hands or a man from behind. Only if the customer has explicitly asked for a person or attached their own photo, use it — and keep it fully modest.

STYLE OF THIS TEMPLATE
{{style}}
(If this style conflicts with any MASTER RULE, the MASTER RULES win.)

FINAL CHECK BEFORE YOU CREATE
Re-read the MASTER RULES once more and make sure every single one is applied in the design.

AFTER THE IMAGE
Write a short casual Bangla Facebook caption (3–4 lines) as normal chat text, NOT on the image. Write English words in Bangla letters (প্রোডাক্ট, অর্ডার, ডেলিভারি). End with one clear action: inbox or comment.'),
  ('app_url', ''),
  ('admin_password', 'admin1234'),

  -- খ. EPS অটোমেটিক পেমেন্ট গেটওয়ে কনফিগারেশন
  ('eps_mode', 'sandbox'),
  ('eps_merchant_id', ''),
  ('eps_store_id', ''),
  ('eps_username', ''),
  ('eps_password', ''),
  ('eps_hash_key', ''),
  ('eps_email', ''),

  -- গ. Cloudinary ইমেজ ও মিডিয়া স্টোরেজ কনফিগারেশন
  ('cloudinary_cloud_name', ''),
  ('cloudinary_api_key', ''),
  ('cloudinary_api_secret', ''),
  ('cloudinary_folder', 'uddokta_graphics_ai'),

  -- ঘ. BulkSMSBD ওটিপি গেটওয়ে কনফিগারেশন
  ('sms_api_token', ''),
  ('sms_sender_id', ''),
  ('sms_api_url', 'https://bulksmsbd.net/api/smsapi')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. Categories
INSERT INTO cats (id, name, sort, show) VALUES
  ('product', 'প্রোডাক্ট পোস্ট', 1, true),
  ('offer', 'অফার ও সেল', 2, true),
  ('festival', 'উৎসব ও সিজন', 3, true),
  ('announce', 'ঘোষণা ও ইভেন্ট', 4, true),
  ('trust', 'ভরসা ও রিভিউ', 5, true),
  ('service', 'সার্ভিস ও পার্সোনাল', 6, true),
  ('travel', 'ট্রাভেল ও ট্যুর', 7, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort = EXCLUDED.sort, show = EXCLUDED.show;

-- 3. Styles
INSERT INTO styles (id, cat, name, img, attach, logo, style, status, pop, sort, used, font1, font2) VALUES
  ('P1', 'product', 'প্রিমিয়াম লুক', 'images/samples/polli-premium.jpg', 'লোগো আর প্রোডাক্টের ছবি', 'top-left', 'Premium editorial product shot. Text group top-left, products lower-right on the rule-of-thirds line.', 'published', true, 1, 0, '', ''),
  ('P2', 'product', 'কোয়ালিটি ক্লোজআপ', 'images/samples/polli-quality.jpg', 'লোগো আর প্রোডাক্টের ছবি', 'top-left', 'Clean quality-focused shot. Text group on the left third, product on the right two-thirds, showing texture and label clearly.', 'published', false, 2, 0, '', ''),
  ('P3', 'product', 'কালেকশন বা কম্বো', 'images/samples/combo.jpg', 'লোগো আর সবগুলো প্রোডাক্টের ছবি', 'top-left', 'Collection layout. All attached products arranged neatly together with equal importance. Headline on top, offer line small at the bottom.', 'published', true, 3, 0, '', ''),
  ('P4', 'product', 'ম্যানিকিনে পোশাক', 'images/samples/feena-mannequin.jpg', 'লোগো আর পোশাকের ছবি', 'top-left', 'Clothing on a plain tailor mannequin (no face, no human), centered. Headline on top center, offer line small at the bottom right.', 'published', false, 4, 0, '', ''),
  ('P5', 'product', 'ব্যবহারের মুহূর্তে', 'images/samples/candy-travel.jpg', 'লোগো আর প্রোডাক্টের ছবি', 'top-left', 'Product in its real moment of use. Product sharp in the foreground, the usage scene behind it. Text group top-left.', 'published', false, 5, 0, '', ''),
  ('P6', 'product', 'অ্যাকশন শট', 'images/samples/amannah-action.jpg', 'লোগো আর প্রোডাক্টের ছবি', 'top-left', 'Dynamic action shot. The product with its contents in motion (splash, pour or burst) frozen in sharp detail. Text group on the left third.', 'published', false, 6, 0, '', ''),
  ('O1', 'offer', 'ডিসকাউন্ট অফার', 'images/samples/feena-offer.jpg', 'লোগো আর প্রোডাক্টের ছবি', 'top-left', 'Offer post. Product as hero in the center, headline on top, offer line small at the bottom with only the key word highlighted.', 'published', true, 7, 0, '', ''),
  ('O2', 'offer', 'ফ্রি ডেলিভারি', 'images/samples/feena-torso.jpg', 'লোগো আর প্রোডাক্টের ছবি', 'top-left', 'Free delivery offer. Product on the right two-thirds, text group on the left, offer line in a small soft pill at the lower left.', 'published', false, 8, 0, '', ''),
  ('F1', 'festival', 'উৎসবের উপহার', 'images/samples/polli-gift.jpg', 'লোগো আর প্রোডাক্টের ছবি', 'top-right', 'Festive gift presentation. Product inside an elegant gift box, text group on the right third. Respectful, premium festive mood.', 'published', false, 9, 0, '', ''),
  ('F2', 'festival', 'ছুটির দিনের পোস্ট', 'images/samples/amannah-bikel.jpg', 'লোগো আর প্রোডাক্টের ছবি', 'top-left', 'Holiday or weekend mood post. Product with a ready-to-enjoy serving in front, text group top-left, warm relaxed feeling.', 'published', false, 10, 0, '', ''),
  ('A1', 'announce', 'লাইভ বা ক্লাস', 'images/samples/event.jpg', 'শুধু লোগো', 'top-left', 'Event or live class poster. Big 2-line title in the upper area, a softly blurred scene related to the topic below, date line highlighted under the title.', 'published', false, 11, 0, '', ''),
  ('T1', 'trust', 'কোয়ালিটির প্রতিশ্রুতি', 'images/samples/polli-quality.jpg', 'লোগো আর প্রোডাক্টের ছবি', 'top-left', 'Trust-building post. Honest, clean product presentation that shows real quality. Text group on the left third with a promise headline.', 'published', false, 12, 0, '', ''),
  ('S1', 'service', 'সার্ভিস প্রোমো', 'images/samples/service.jpg', 'লোগো আর আপনার নিজের ছবি', 'top-left', 'Service promo. The attached personal photo (face unchanged) on one side, the service shown simply on the other side, headline on top, price small.', 'published', true, 13, 0, '', ''),
  ('S2', 'service', 'কনসেপ্ট বা এক্সপ্লেইনার', 'images/samples/ai-concept.jpg', 'শুধু লোগো', 'top-left', 'Concept explainer. A male hand holding a phone that shows the idea, sharp focus on the phone, blurred background, headline on the left.', 'published', false, 14, 0, '', ''),
  ('TR1', 'travel', 'ট্যুর প্যাকেজ', 'images/samples/tr-sajek.jpg', 'লোগো, চাইলে জায়গার ছবি', 'top-left', 'Aerial photo of the destination''s landscape with soft clouds on top. In the center a ticket-shaped frame holding a small photo of the place. Text group at the upper center. A brand-color gradient bar at the bottom for the contact line.', 'published', false, 15, 0, '', ''),
  ('TR2', 'travel', 'ট্যুর অফার (কাটা দাম)', 'images/samples/tr-offer.jpg', 'শুধু লোগো', 'top-right', 'Deep blue sky and sea of the destination. Big bold text group in the upper half, the scenic view fills the lower 40%. Contact lines small in white at the very bottom.', 'published', false, 16, 0, '', ''),
  ('G1', 'product', 'বড় সংখ্যার ফিচার', 'images/samples/gadget-watt.jpg', 'লোগো আর প্রোডাক্টের ছবি', 'top-right', 'Light blue clean gradient background. Product in the center. A huge vertical number behind the product with its unit beside it. Two small features with round icons at the bottom.', 'published', false, 17, 0, '', ''),
  ('FS1', 'offer', 'অফার কোণায়', 'images/samples/fashion-corner.jpg', 'লোগো আর প্রোডাক্টের ছবি', 'top-left', 'Soft cream fabric background with blurred pink flowers at the sides. Product on a plain tailor mannequin in the center. Text group at the upper center, offer in the lower right corner.', 'published', false, 18, 0, '', ''),
  ('L1', 'announce', 'নতুন এলাকায় সার্ভিস', 'images/samples/loc-pin.jpg', 'লোগো, চাইলে এলাকার ছবি', 'top-right', 'Aerial city photo of the area. A big glossy 3D red location pin in the center with soft speed-light streaks around it. One line on a brand-color ribbon at the top, the area name big below it. A clean white bar at the bottom with contact icons.', 'published', false, 19, 0, '', ''),
  ('C1', 'announce', 'কোর্স কাউন্টডাউন', 'images/samples/course-count.jpg', 'শুধু লোগো', 'top-left', 'Warm orange background. A male hand holding a phone. The phone screen is filled with a bold brand-color design and all text is stacked inside the screen from top to bottom, the course name on a contrasting ribbon.', 'published', false, 20, 0, '', ''),
  ('D1', 'service', 'ক্লিনিক সার্ভিস', 'images/samples/dental.jpg', 'শুধু লোগো', 'top-left', 'Light, airy blurred clinic background. A big clean 3D illustration of the treatment on the left. Text group on the upper right. A two-layer dark brand-color footer bar at the bottom for contact.', 'published', false, 21, 0, '', ''),
  ('AP1', 'offer', 'অ্যাপ থেকে অর্ডার অফার', 'images/samples/app-offer.jpg', 'লোগো আর অ্যাপের স্ক্রিনশট', 'top-left', 'Soft blurred home interior. A phone on the left showing the attached app screenshot. Headline on the upper left. Offer in two stacked pill boxes on the lower right, store buttons below them.', 'published', false, 22, 0, '', ''),
  ('SV1', 'service', 'সার্ভিস প্যাকেজ অফার', 'images/samples/service-pack.jpg', 'লোগো, চাইলে সার্ভিসের স্ক্রিনশট', 'top-center', 'Clean white background. Small top line, then a 3-line headline at the top center. On the left a phone showing the service; on the right a light brand-tint box with a huge price, under it two columns for package value and old price, and a clock icon with the deadline line at the end.', 'published', false, 23, 0, '', '')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, cat = EXCLUDED.cat, img = EXCLUDED.img, attach = EXCLUDED.attach, logo = EXCLUDED.logo, style = EXCLUDED.style, status = EXCLUDED.status, pop = EXCLUDED.pop, sort = EXCLUDED.sort, font1 = EXCLUDED.font1, font2 = EXCLUDED.font2;

-- 4. Style Fields
DELETE FROM fields;
INSERT INTO fields (sid, sort, el, ex, lim, req) VALUES
  ('P1', 1, 'headline', 'মোড়কেই আভিজাত্যের ছাপ', 30, true),
  ('P1', 2, 'sub', 'পল্লী বাজার গাওয়া ঘি', 60, false),
  ('P2', 1, 'headline', 'যা দেখছেন, তাই পাচ্ছেন', 30, true),
  ('P2', 2, 'sub', 'পল্লী বাজার গাওয়া ঘি', 60, false),
  ('P3', 1, 'headline', 'সফট কটন ফ্যাব্রিক', 30, true),
  ('P3', 2, 'sub', 'সব রঙে, সব সাইজে', 60, false),
  ('P3', 3, 'offer', '৩ পিসের কম্বোতে ফ্রি ডেলিভারি', 50, false),
  ('P4', 1, 'headline', 'সফট কটন ফ্যাব্রিক', 30, true),
  ('P4', 2, 'sub', 'পরতে ও খুলতে খুব সহজ', 60, false),
  ('P4', 3, 'offer', '৩ পিস নিলে হোম ডেলিভারি চার্জ ফ্রি', 50, false),
  ('P5', 1, 'headline', 'দীর্ঘ পথেও সতেজ থাকুন', 30, true),
  ('P5', 2, 'sub', 'অফিসিয়াল ট্যুরে নিন একটু বিরতি', 60, false),
  ('P6', 1, 'headline', 'মুচমুচে স্বাদের আসল জাদু', 30, true),
  ('P6', 2, 'sub', 'প্রতিটি ঝালমুড়িতে পারফেক্ট মশলার ব্যালেন্স', 60, false),
  ('O1', 1, 'headline', 'সফট কটন ফ্যাব্রিক', 30, true),
  ('O1', 2, 'sub', 'সামনের বাটনের সুবিধা', 60, false),
  ('O1', 3, 'offer', '৩ পিসের কম্বোতে হোম ডেলিভারি চার্জ ফ্রি', 50, false),
  ('O2', 1, 'headline', 'সফট কটন ফ্যাব্রিক', 30, true),
  ('O2', 2, 'sub', 'সামনের বাটনের সুবিধা', 60, false),
  ('O2', 3, 'offer', '৩ পিস নিলে ডেলিভারি চার্জ ফ্রি', 50, false),
  ('F1', 1, 'headline', 'বিশুদ্ধতার প্রিমিয়াম উপহার', 30, true),
  ('F1', 2, 'sub', 'পল্লী বাজার গাওয়া ঘি', 60, false),
  ('F1', 3, 'offer', 'ঈদ উপলক্ষে বিশেষ ছাড়', 50, false),
  ('F2', 1, 'headline', 'ছুটির বিকেলটা হোক একটু অন্যরকম', 30, true),
  ('F2', 2, 'sub', 'পরিবারের সবাই মিলে গল্প আর হাসি', 60, false),
  ('A1', 1, 'headline', 'ডিজাইন ফান্ডামেন্টাল', 30, true),
  ('A1', 2, 'sub', 'কোন গ্রাফিক্স কেন ভালো লাগে, শিখুন', 60, false),
  ('A1', 3, 'date', 'শুক্রবার রাত ৯টা', 40, false),
  ('T1', 1, 'headline', 'যা দেখছেন, তাই পাচ্ছেন', 30, true),
  ('T1', 2, 'sub', 'পল্লী বাজার গাওয়া ঘি', 60, false),
  ('S1', 1, 'headline', 'ফেসবুক পেজ সেটআপ', 30, true),
  ('S1', 2, 'sub', 'সাথে AI অটোমেশন', 60, false),
  ('S1', 3, 'price', 'স্পেশাল ৫০০০ টাকা', 20, false),
  ('S2', 1, 'headline', 'আপনার পছন্দের এআই টুলকে', 30, true),
  ('S2', 2, 'sub', 'বানিয়ে নিন পার্সোনাল ক্রিয়েটিভ অ্যাসিস্ট্যান্ট', 60, false),
  ('TR1', 1, 'headline', 'সাজেক ট্যুর', 20, true),
  ('TR1', 2, 'date', '৩ রাত ২ দিন', 15, true),
  ('TR1', 3, 'price', '৫৮৯৯ টাকা', 12, true),
  ('TR1', 4, 'address', 'www.mavericktravellers.com', 35, false),
  ('TR1', 5, 'phone', '09678-332211', 14, true),
  ('TR2', 1, 'short', 'সিলেট থেকে', 15, true),
  ('TR2', 2, 'headline', 'কক্সবাজার', 15, true),
  ('TR2', 3, 'short', 'গ্রুপ ট্যুর', 15, false),
  ('TR2', 4, 'date', '৪ রাত ৩ দিন (২৫-২৯ তারিখ)', 30, true),
  ('TR2', 5, 'offer', '২০% ডিসকাউন্ট', 15, false),
  ('TR2', 6, 'oldprice', '৬৫০০', 8, false),
  ('TR2', 7, 'price', '৫২০০ টাকা', 12, true),
  ('TR2', 8, 'phone', '01606 946215', 14, true),
  ('TR2', 9, 'address', '৬৪ স্বপ্নীল, মির্জাজাঙ্গাল, সিলেট', 45, false),
  ('G1', 1, 'headline', '750', 6, true),
  ('G1', 2, 'short', 'WATT', 8, true),
  ('G1', 3, 'bullet', '3 Speed Setting', 20, true),
  ('G1', 4, 'bullet', 'Anti-Skid Feet', 20, false),
  ('G1', 5, 'address', 'www.longwayindia.com', 30, false),
  ('FS1', 1, 'headline', 'সফট কটন ফ্যাব্রিক / সামনের বাটনের সুবিধা', 40, true),
  ('FS1', 2, 'short', 'পরতে ও খুলতে খুব সহজ...', 45, false),
  ('FS1', 3, 'short', '৩ পিসের কম্বো অর্ডার করলেই', 30, false),
  ('FS1', 4, 'offer', 'হোম ডেলিভারি চার্জ ফ্রি!', 25, false),
  ('L1', 1, 'badge', 'দ্রুতগতির ইন্টারনেট নিয়ে', 30, true),
  ('L1', 2, 'headline', 'আমরা এখন খিলগাঁও', 25, true),
  ('L1', 3, 'phone', '09639 395 555', 14, true),
  ('L1', 4, 'address', 'www.bornointernet.com', 35, false),
  ('L1', 5, 'address', '9/2 Secretariat Road, Dhaka', 45, false),
  ('C1', 1, 'date', 'আর মাত্র ১ দিন বাকি', 20, true),
  ('C1', 2, 'headline', 'গ্রাফিক ডিজাইন উইথ AI', 35, true),
  ('C1', 3, 'short', 'অনলাইন লাইভ ক্লাস', 20, false),
  ('C1', 4, 'date', 'ক্লাস শুরু রবিবার ১৬ই ফেব্রুয়ারী', 35, true),
  ('C1', 5, 'badge', 'সীমিত আসন', 15, false),
  ('C1', 6, 'phone', '01833-395075', 14, true),
  ('D1', 1, 'headline', 'ভাঙা বা ক্ষয়', 25, true),
  ('D1', 2, 'short', 'হওয়া দাঁত আবার স্বাভাবিক করুন', 40, true),
  ('D1', 3, 'short', 'ফিলিং হবে, বোঝাই যাবে না', 30, false),
  ('D1', 4, 'short', 'Specialized Dental Treatment...', 60, false),
  ('D1', 5, 'phone', '01613-772244', 14, true),
  ('D1', 6, 'phone', '01970-733334', 14, false),
  ('D1', 7, 'address', 'Cure medical center, Gulshan-2', 50, true),
  ('AP1', 1, 'headline', 'রেনিক্সের হলিস্টিক চিকিৎসা নিন এখন ঘরে বসে!', 45, true),
  ('AP1', 2, 'short', 'অ্যাপ থেকে অর্ডার করলে', 30, true),
  ('AP1', 3, 'offer', '১০% ডিসকাউন্ট', 15, true),
  ('AP1', 4, 'date', 'অফারটি চলবে ৫ জুলাই থেকে ৫ আগস্ট পর্যন্ত।', 50, false),
  ('AP1', 5, 'button', 'App Store ও Google Play', 30, true),
  ('SV1', 1, 'badge', 'স্মার্ট বিজনেস | স্মার্ট কনটেন্ট | স্মার্ট ভবিষ্যৎ', 50, false),
  ('SV1', 2, 'headline', 'ChatGPT-কেই বানিয়ে নিন আপনার গ্রাফিক ডিজাইনার...', 50, true),
  ('SV1', 3, 'sub', 'আপনার বিজনেসের তথ্য ও ব্র্যান্ড স্টাইল অনুযায়ী...', 80, false),
  ('SV1', 4, 'offer', 'শুক্রবারের স্পেশাল অফার', 25, true),
  ('SV1', 5, 'price', '৯৯৯ টাকা', 10, true),
  ('SV1', 6, 'short', '১৫,০০০ টাকা', 12, false),
  ('SV1', 7, 'oldprice', '২,৯৯৯ টাকা', 12, false),
  ('SV1', 8, 'date', 'অফার পেতে আগামী ২৪ ঘন্টার মধ্যে ফর্ম Submit করুন', 55, true);

-- 5. Business Types & Mood
INSERT INTO biz (name, mood, sort) VALUES
  ('খাবার ও অর্গানিক', 'warm natural kitchen or dining setting, soft daylight, wood and linen textures', 1),
  ('পোশাক', 'clean studio with soft fabric texture, gentle shadows', 2),
  ('জুয়েলারি', 'dark velvet or marble surface, small focused sparkle light, luxury feel', 3),
  ('কসমেটিক্স', 'soft pastel tones with water drops or flower accents, fresh and clean', 4),
  ('হারবাল ও হেলথ', 'clean white and leafy green, natural herbs, fresh and trustworthy', 5),
  ('গ্যাজেট', 'minimal modern tech desk, cool neutral tones, sharp clean light', 6),
  ('সার্ভিস', 'calm professional workspace, laptop and simple office props', 7),
  ('কোর্স ও ট্রেনিং', 'bright modern learning setup, notebook, laptop, clean desk', 8)
ON CONFLICT (name) DO UPDATE SET mood = EXCLUDED.mood, sort = EXCLUDED.sort;

-- 6. Posts
DELETE FROM posts;
INSERT INTO posts (sort, img, tag, title, link, show) VALUES
  (1, 'images/samples/event.jpg', 'ফেসবুক গ্রুপ', 'শুক্রবার রাত ৯টায় ডিজাইন ফান্ডামেন্টাল লাইভ ক্লাস', 'https://facebook.com', true),
  (2, 'images/samples/polli-premium.jpg', 'ব্লগ', 'পল্লী বাজারের নতুন প্যাকেজিংয়ের পেছনের গল্প', 'https://ecomdesignsolution.com', true),
  (3, 'images/samples/candy-travel.jpg', 'নতুন আপডেট', 'অ্যাপে "ব্যবহারের মুহূর্তে" নামে নতুন ডিজাইন যোগ হয়েছে', 'https://facebook.com', true);

-- 7. Contact
INSERT INTO contact (key, value) VALUES
  ('class_name', 'ডিজাইন ফান্ডামেন্টাল'),
  ('class_time', 'শুক্রবার, রাত ৯টা'),
  ('class_link', 'https://facebook.com'),
  ('whatsapp', '8801978376462'),
  ('group_link', 'https://facebook.com'),
  ('call', '01978376462'),
  ('call_time', 'সকাল ১০টা থেকে রাত ১০টা'),
  ('guide_title', 'কীভাবে ব্যবহার করবেন'),
  ('guide_sub', 'নিচের ভিডিওটা একবার দেখে নিন, তাহলেই পুরো অ্যাপ ব্যবহার করতে পারবেন'),
  ('guide_video', '')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 8. Policies
INSERT INTO policies (key, title, text, sort) VALUES
  ('terms', 'শর্তাবলি', 'EDS AI Brain হলো eCom Design Solution-এর একটা সেবা। এই অ্যাপ আপনার ব্র্যান্ডের তথ্য দিয়ে ChatGPT-তে ব্যবহারের জন্য কাস্টমাইজড কমান্ড তৈরি করে দেয়। ডিজাইন তৈরি হয় ChatGPT-তে, তাই ডিজাইনের মান ChatGPT-র ওপরও নির্ভর করে।

একটা অ্যাকাউন্ট একটা ব্র্যান্ডের জন্য। অন্যের ব্র্যান্ড বা অনুমতি ছাড়া অন্যের লোগো, ছবি বা ট্রেডমার্ক ব্যবহার করা যাবে না।

অশ্লীল, প্রতারণামূলক বা আইনবিরোধী কোনো কনটেন্ট বানাতে অ্যাপ ব্যবহার করা যাবে না। নিয়ম ভাঙলে আমরা অ্যাকাউন্ট বন্ধ করতে পারি।

মেম্বারশিপের মেয়াদ পেমেন্টের দিন থেকে ১ বছর। দাম ও সুবিধা পরিবর্তন হলে অ্যাপে জানিয়ে দেওয়া হবে।', 1),
  ('privacy', 'প্রাইভেসি পলিসি', 'আমরা আপনার মোবাইল নম্বর, ব্র্যান্ডের নাম, ট্যাগলাইন, ব্যবসার ধরন আর লোগোর কালার সংরক্ষণ করি, শুধু অ্যাপের সেবা দেওয়ার জন্য।

আপনার তথ্য আমরা কারো কাছে বিক্রি করি না। পেমেন্টের কার্ড বা অ্যাকাউন্টের তথ্য আমাদের কাছে আসে না, সেটা পেমেন্ট গেটওয়ে নিরাপদে সামলায়।

আপনি চাইলে আপনার অ্যাকাউন্টের তথ্য মুছে দেওয়ার অনুরোধ WhatsApp-এ করতে পারেন।', 2),
  ('refund', 'রিফান্ড পলিসি', 'মেম্বারশিপ নেওয়ার আগে অ্যাপটা ঘুরে দেখে সব স্টাইল আর কোন স্টাইলে কী লিখতে হয়, তা দেখে নেওয়ার সুযোগ আছে। তাই সাধারণত মেম্বারশিপের টাকা ফেরত দেওয়া হয় না।

ভুল করে দুইবার পেমেন্ট হলে বা টাকা কেটে মেম্বারশিপ চালু না হলে ৭ দিনের মধ্যে WhatsApp-এ জানান। যাচাই করে অতিরিক্ত টাকা ফেরত দেওয়া হবে।', 3)
ON CONFLICT (key) DO UPDATE SET title = EXCLUDED.title, text = EXCLUDED.text, sort = EXCLUDED.sort;

-- 9. Fixes
DELETE FROM fixes;
INSERT INTO fixes (sort, title, line) VALUES
  (1, 'লেখা ভেঙে গেছে', 'বাংলা লেখাগুলো ভেঙে গেছে। ডিজাইন একই রেখে শুধু লেখাগুলো সঠিক বাংলা বানানে, পরিষ্কার বোল্ড বাংলা ফন্টে আবার বসাও।'),
  (2, 'লোগো বদলে গেছে', 'লোগো বদলে গেছে। অ্যাটাচ করা লোগোটা হুবহু, কোনো পরিবর্তন ছাড়া আগের জায়গায় বসাও। বাকি সব একই রাখো।'),
  (3, 'প্রোডাক্ট ছোট করো', 'প্রোডাক্টটা একটু ছোট করো যাতে চারপাশে আরো ফাঁকা জায়গা থাকে। প্রোডাক্টের কিছুই বদলাবে না।'),
  (4, 'রং আরো উজ্জ্বল করো', 'পুরো ডিজাইনটা আরো উজ্জ্বল আর পরিষ্কার করো, ব্র্যান্ড কালার ঠিক রেখে।'),
  (5, 'লেখার জায়গা বাড়াও', 'লেখাগুলোর চারপাশে আরো জায়গা দাও, হেডলাইন একটু বড় আর পরিষ্কার করো।'),
  (6, 'নতুন আরেকটা স্টাইল দাও', 'একই লেখা, লোগো আর প্রোডাক্ট রেখে সম্পূর্ণ নতুন একটা লেআউট আর দৃশ্যে আরেকটা ভার্সন বানাও।');

-- 10. Base Command Version
INSERT INTO base_command_versions (created_by, note, body) VALUES ('Initial Setup', 'Production Base Command v1', 'MANDATORY — READ FIRST: Read this ENTIRE brief from the first line to the last line before you start. Do not begin the image until you have read every section. Every rule below is mandatory and must be applied 100%. Do not ask questions; create the design directly.

ROLE
You are a senior graphic designer for Bangladeshi brands. Create ONE finished, professional social media post, square 1:1 (1080x1080). It must feel premium, luxurious, calm and clean — never crowded, never cheap.

BRAND
- Product: {{product}}
- Brand name: {{brand}}
- Tagline: {{tagline}}
- Business type / mood: {{mood}}
- Brand colors (HEX): primary {{color1}}, secondary {{color2}}, tertiary {{color3}}
- LOGO: use the attached logo EXACTLY as it is — never redraw, recolor, crop or simplify it. Place it {{logo_position}}, {{logo_size}}, small and clean, with clear contrast.

TEXT ON THE DESIGN — ONLY these lines, nothing else
Write every line exactly as given (Bangla spelling unchanged, no English letters inside Bangla lines). Each line starts with its element (HEADLINE, SUB HEADLINE, PRICE …) and what that element means. Show every line as that element. Where each element sits and how it looks comes from the STYLE OF THIS TEMPLATE below. Do not add any other text.
{{texts}}

MASTER RULE 1 — HERO (first impression)
The product or main subject is the hero and the first thing the eye sees. Always in the foreground, sharp focus, clean, beautifully lit. Size: usually about 40–45% of the canvas; up to 60% only if the product type and scene need it. Never so big that the design feels crowded, never so small that the space looks empty. If a product/person photo is attached, use it unchanged — do not change its shape, label, colors, face, expression or clothing; only improve light and resize.

MASTER RULE 2 — BACKGROUND AND ENVIRONMENT (the product''s own world)
Build the background, scene and props from the product''s own world: what the product is, its raw ingredient, its source and its natural use setting (for example flowers and golden light for honey or mustard oil, a warm creamy dairy feel for ghee, a rustic earthy feel for date-palm jaggery). Background and scene colors come from that world, NEVER from the brand colors. The three brand colors are used for typography only: headline, sub headline and the thin text accents such as dividers and underlines. You decide the environment and its objects fresh for each product. The STYLE OF THIS TEMPLATE decides the layout, the role of each prop and any graphic backdrop shape, and those stay crisp. The natural scenery behind the product is shallow depth of field and softly blurred, so only about 13–17% of its detail is visible. Light and mood must suit the product. Clean, soft, uncluttered.

MASTER RULE 3 — TEXT HIERARCHY (by element)
1. Hero (image) — first.
2. HEADLINE — the largest text, maximum 2 lines, the first text the eye reads.
3. SUB HEADLINE, OFFER and PRICE — clearly smaller than the HEADLINE, the next things the eye reads. OFFER and PRICE can be shown in a brand color.
4. All other elements (SHORT TEXT, BULLET POINT, OLD PRICE, DATE / TIME, BADGE, BUTTON, PHONE, ADDRESS / WEBSITE) — small, clean and easy to scan, never competing with the HEADLINE.
All text sits together in one calm text area (about 20–25% of the canvas) on a rule-of-thirds position, related lines close, groups clearly separated. Phone, website or address lines may sit separately at the very bottom. Information panels, footer bars and icon boxes appear ONLY for the lines that are provided: if no phone, website or address line is given, do not draw any empty footer or panel and extend the scene to the bottom edge; if such lines are given, they must appear.
Use the label of each line to choose how it looks: a price as a clear number with টাকা, an old price with a thin strike-through next to the new price, a discount as a short percentage highlight, a countdown as a bold number, a date or duration in a small soft box, phone / website / address with tiny simple icons in one clean line.

MASTER RULE 4 — COLOR (brand consistency)
All text colors and accents come ONLY from the three brand colors above. Typical use: one headline line in the darkest brand color, the key word or second headline line in the primary brand color, divider and offer highlight in brand colors. If none of the brand colors is dark enough for readable text, use a very deep shade of the primary color. Never introduce unrelated colors. Text must have strong contrast and read instantly on a mobile screen.

MASTER RULE 5 — FONT
Use at most two clean, highly readable Bangla fonts that suit the STYLE OF THIS TEMPLATE: a bold display font for the HEADLINE and a clean regular font for the other elements. Never add any other font. Bangla letters must stay clean, correct and unbroken. Hierarchy comes from size and the brand colors.

MASTER RULE 6 — NEGATIVE SPACE AND BALANCE
The design must breathe. Keep generous negative space so hero, text and background feel balanced. Use strict rule of thirds. Balance color, contrast, light and proximity across the whole canvas. Use every element only where it helps balance — nothing extra.

MASTER RULE 7 — NEVER ADD
No caption or paragraph on the image. No text that is not in the TEXT list. No stickers, emojis, robots, cartoon characters, fake logos, watermarks or broken Bangla letters. No glow, neon, lens flare or heavy gradients. Decorative elements (frames, pins, icons, badges, shapes) only when the STYLE OF THIS TEMPLATE asks for them or a line''s role needs a tiny icon.

MASTER RULE 8 — HALAL MARKETING
Never show women or female figures on your own. Never show immodest or revealing clothing under any situation. For clothing use a mannequin or flat lay. If a human is needed, show only male hands or a man from behind. Only if the customer has explicitly asked for a person or attached their own photo, use it — and keep it fully modest.

STYLE OF THIS TEMPLATE
{{style}}
(If this style conflicts with any MASTER RULE, the MASTER RULES win.)

FINAL CHECK BEFORE YOU CREATE
Re-read the MASTER RULES once more and make sure every single one is applied in the design.

AFTER THE IMAGE
Write a short casual Bangla Facebook caption (3–4 lines) as normal chat text, NOT on the image. Write English words in Bangla letters (প্রোডাক্ট, অর্ডার, ডেলিভারি). End with one clear action: inbox or comment.');

-- =====================================================================
-- ১২. অ্যাপ ও ল্যান্ডিং পেজের সব ডিফল্ট টেক্সট (Texts Table)
-- =====================================================================
INSERT INTO texts (key, value) VALUES
  ('t7c65ea3d', 'দিন বাকি'), -- [মেনু ও নেভিগেশন] দিন বাকি
  ('tbc82fc73', 'মেম্বারশিপ নিন'), -- [মেনু ও নেভিগেশন] মেম্বারশিপ নিন
  ('t306387c1', 'মেম্বারশিপ চালু ·'), -- [মেনু ও নেভিগেশন] মেম্বারশিপ চালু ·
  ('t925d8832', 'মেম্বারশিপ নিন · ৳'), -- [মেনু ও নেভিগেশন] মেম্বারশিপ নিন · ৳
  ('t95c37f70', '/বছর'), -- [মেনু ও নেভিগেশন] /বছর
  ('t1de5edba', 'উ'), -- [মেনু ও নেভিগেশন] উ
  ('t5cf553ff', 'মেম্বারশিপ চালু'), -- [মেনু ও নেভিগেশন] মেম্বারশিপ চালু
  ('tdfca5565', 'মেয়াদ:'), -- [মেনু ও নেভিগেশন] মেয়াদ:
  ('t91e4d553', 'মেয়াদ শেষ'), -- [মেনু ও নেভিগেশন] মেয়াদ শেষ
  ('t806d0cd6', 'ঘুরে দেখছেন'), -- [মেনু ও নেভিগেশন] ঘুরে দেখছেন
  ('tb5cd28f6', 'মেয়াদ বাড়িয়ে নিন'), -- [মেনু ও নেভিগেশন] মেয়াদ বাড়িয়ে নিন
  ('tab1e6d53', 'সব স্টাইল লক করা'), -- [মেনু ও নেভিগেশন] সব স্টাইল লক করা
  ('t667044e8', '৳'), -- [মেনু ও নেভিগেশন] ৳
  ('t39e90da0', '/ বছর · প্রতিদিন ১ টাকা'), -- [মেনু ও নেভিগেশন] / বছর · প্রতিদিন ১ টাকা
  ('t527707e0', 'আপনার ব্র্যান্ড'), -- [মেনু ও নেভিগেশন] আপনার ব্র্যান্ড
  ('te5ff418f', 'লগআউট'), -- [মেনু ও নেভিগেশন] লগআউট
  ('tb5baccc8', 'অতিথি'), -- [মেনু ও নেভিগেশন] অতিথি
  ('t15b7f843', 'লগইন করা নেই'), -- [মেনু ও নেভিগেশন] লগইন করা নেই
  ('t86b9a1b4', 'লগইন'), -- [মেনু ও নেভিগেশন] লগইন
  ('t701f00f3', 'নতুন'), -- [মেনু ও নেভিগেশন] নতুন
  ('tcd1a5d7c', 'গাইড ও সাপোর্ট'), -- [মেনু ও নেভিগেশন] গাইড ও সাপোর্ট
  ('t3c51e190', 'ব্র্যান্ড এডিট'), -- [মেনু ও নেভিগেশন] ব্র্যান্ড এডিট
  ('tbae2d2ef', 'মেম্বারশিপের মেয়াদ শেষ'), -- [মেনু ও নেভিগেশন] মেম্বারশিপের মেয়াদ শেষ
  ('tef18c220', 'অ্যাপটা ঘুরে দেখছেন'), -- [মেনু ও নেভিগেশন] অ্যাপটা ঘুরে দেখছেন
  ('tc3e6ee6a', '/ বছর · প্রতিদিন মাত্র ১ টাকা'), -- [মেনু ও নেভিগেশন] / বছর · প্রতিদিন মাত্র ১ টাকা
  ('t704040d2', 'লগইন করুন'), -- [মেনু ও নেভিগেশন] লগইন করুন
  ('t05e84ffe', 'পলিসি'), -- [মেনু ও নেভিগেশন] পলিসি
  ('t8788c4ca', '১ · স্টাইল'), -- [মেনু ও নেভিগেশন] ১ · স্টাইল
  ('t765c038c', '২ · লেখা'), -- [মেনু ও নেভিগেশন] ২ · লেখা
  ('t3fbba423', '৩ · কমান্ড'), -- [মেনু ও নেভিগেশন] ৩ · কমান্ড
  ('t15ec6584', 'এডিট'), -- [হোম] এডিট
  ('t12119b8c', 'লোগো যুক্ত আছে'), -- [হোম] লোগো যুক্ত আছে
  ('t97b81d98', 'ব্র্যান্ডের রং'), -- [হোম] ব্র্যান্ডের রং
  ('tcc9293bb', 'লোগো'), -- [হোম] লোগো
  ('t35f7c58c', 'মেম্বারশিপ নেওয়ার পর এখানে আপনার লোগো, নাম আর রং বসবে'), -- [হোম] মেম্বারশিপ নেওয়ার পর এখানে আপ
  ('taeb09803', 'রং ১'), -- [হোম] রং ১
  ('t9056bba1', 'রং ২'), -- [হোম] রং ২
  ('ta58c1b16', 'রং ৩'), -- [হোম] রং ৩
  ('t7a4bc152', 'নতুন একটা ডিজাইন শুরু করুন'), -- [হোম] নতুন একটা ডিজাইন শুরু করুন
  ('t555fadf4', 'আপনার ব্র্যান্ডের রং আর লোগো কমান্ডে নিজে থেকেই বসে যাবে।'), -- [হোম] আপনার ব্র্যান্ডের রং আর লোগো ক
  ('tbf3bc1bf', 'স্টাইল বেছে নিন'), -- [হোম] স্টাইল বেছে নিন
  ('t0974fdc0', 'দরকারি ঘরগুলো পূরণ করুন'), -- [হোম] দরকারি ঘরগুলো পূরণ করুন
  ('t6d493797', 'কমান্ড কপি করে ChatGPT-তে দিন'), -- [হোম] কমান্ড কপি করে ChatGPT-তে দিন
  ('t316fbe7c', 'নতুন ডিজাইন বানান'), -- [হোম] নতুন ডিজাইন বানান
  ('t108a9c64', 'মেয়াদ বাড়িয়ে আবার শুরু করুন'), -- [হোম] মেয়াদ বাড়িয়ে আবার শুরু করুন
  ('t27428ec2', 'মেম্বারশিপ নিয়ে শুরু করুন'), -- [হোম] মেম্বারশিপ নিয়ে শুরু করুন
  ('tbc359041', '/ বছর · মাসে ৳'), -- [হোম] / বছর · মাসে ৳
  ('t337422af', '· প্রতিদিন মাত্র ১ টাকা'), -- [হোম] · প্রতিদিন মাত্র ১ টাকা
  ('tf0346f9f', 'মোবাইল নম্বর দিয়ে লগইন'), -- [হোম] মোবাইল নম্বর দিয়ে লগইন
  ('t84c4bec5', 'পেমেন্ট, তারপর মেম্বারশিপ চালু'), -- [হোম] পেমেন্ট, তারপর মেম্বারশিপ চালু
  ('t3d7dcb33', 'ব্র্যান্ড সেটআপ করে ডিজাইন শুরু'), -- [হোম] ব্র্যান্ড সেটআপ করে ডিজাইন শুর
  ('tbea7246b', 'আগে স্টাইলগুলো দেখুন'), -- [হোম] আগে স্টাইলগুলো দেখুন
  ('t92e2981f', 'সর্বশেষ আপডেট'), -- [হোম] সর্বশেষ আপডেট
  ('tc743244a', 'আজকে কোন *ডিজাইনটা* বানাবেন?'), -- [হোম] আজকে কোন *ডিজাইনটা* বানাবেন?
  ('ta78ba8e4', 'অ্যাপটা *ঘুরে দেখুন*'), -- [হোম] অ্যাপটা *ঘুরে দেখুন*
  ('t2ef7839e', 'স্টাইল বেছে নিন, কয়েকটা ঘর পূরণ করুন, কমান্ড রেডি।'), -- [হোম] স্টাইল বেছে নিন, কয়েকটা ঘর পূ
  ('t2bfbbdef', 'সব স্টাইল আর কোন স্টাইলে কী লিখতে হয়, দেখে নিন। কমান্ড বানাতে মেম্বারশিপ লাগবে।'), -- [হোম] সব স্টাইল আর কোন স্টাইলে কী লি
  ('t89f7a3bc', 'আপনার পেমেন্ট যাচাই হচ্ছে। চালু হলেই সব খুলে যাবে।'), -- [হোম] আপনার পেমেন্ট যাচাই হচ্ছে। চাল
  ('tc802677e', 'আসসালামু আলাইকুম'), -- [হোম] আসসালামু আলাইকুম
  ('tf04447c9', 'মেয়াদ বাড়ালে আবার সব স্টাইল খুলে যাবে'), -- [হোম] মেয়াদ বাড়ালে আবার সব স্টাইল 
  ('ta2a767e8', 'লোড হচ্ছে…'), -- [স্টাইল] লোড হচ্ছে…
  ('t05a1920d', 'সব'), -- [স্টাইল] সব
  ('ta23fec95', 'জনপ্রিয়'), -- [স্টাইল] জনপ্রিয়
  ('t7e00b8e6', 'এই ভাগে এখনো কোনো স্টাইল নেই'), -- [স্টাইল] এই ভাগে এখনো কোনো স্টাইল নেই
  ('tdfa5a366', 'সব *স্টাইল* দেখুন'), -- [স্টাইল] সব *স্টাইল* দেখুন
  ('tff935a29', 'একটা *স্টাইল* বেছে নিন'), -- [স্টাইল] একটা *স্টাইল* বেছে নিন
  ('t664d6768', 'যেকোনো স্টাইলে ট্যাপ করে দেখুন কী কী লিখতে হয়।'), -- [স্টাইল] যেকোনো স্টাইলে ট্যাপ করে দেখুন
  ('t05b40446', 'যেমন পোস্ট বানাতে চান, তেমন স্টাইলে ট্যাপ করুন।'), -- [স্টাইল] যেমন পোস্ট বানাতে চান, তেমন স্
  ('t706f9437', 'যেমন:'), -- [লেখার পেজ] যেমন:
  ('t34544152', 'ঐচ্ছিক'), -- [লেখার পেজ] ঐচ্ছিক
  ('tebbe473a', 'বদলান'), -- [লেখার পেজ] বদলান
  ('tb694c355', 'ChatGPT-তে সাথে দিবেন:'), -- [লেখার পেজ] ChatGPT-তে সাথে দিবেন:
  ('t3ab3cf34', 'এই স্টাইলে কিছু লিখতে হবে না। শুধু নিচের বাটনে চাপুন, তারপর ChatGPT-তে ছবি আর লোগো দিন।'), -- [লেখার পেজ] এই স্টাইলে কিছু লিখতে হবে না। 
  ('tc3a18770', 'মেম্বারশিপ নিয়ে কমান্ড বানান'), -- [লেখার পেজ] মেম্বারশিপ নিয়ে কমান্ড বানান
  ('t6248e81d', '/ বছর · প্রতিদিন মাত্র ১ টাকা · যত খুশি ডিজাইন'), -- [লেখার পেজ] / বছর · প্রতিদিন মাত্র ১ টাকা 
  ('t90b3fa5b', 'কাস্টমাইজড কমান্ড বানান'), -- [লেখার পেজ] কাস্টমাইজড কমান্ড বানান
  ('t41f304a5', 'আপনার ব্র্যান্ডের রং আর লোগোর নিয়ম কমান্ডে নিজে থেকেই যুক্ত হবে'), -- [লেখার পেজ] আপনার ব্র্যান্ডের রং আর লোগোর 
  ('t9895f452', 'লেখার ঘর'), -- [লেখার পেজ] লেখার ঘর
  ('tb821bf1e', 'লেখাগুলো দিন'), -- [লেখার পেজ] লেখাগুলো দিন
  ('t7b52d211', 'ধাপ ২/৩'), -- [লেখার পেজ] ধাপ ২/৩
  ('t8a7cd058', 'স্টাইলে ফিরে যান'), -- [লেখার পেজ] স্টাইলে ফিরে যান
  ('t20c50749', 'লেখাগুলো *দিন*'), -- [লেখার পেজ] লেখাগুলো *দিন*
  ('t481a3a77', 'যেটুকু লেখা ডিজাইনে থাকবে, শুধু সেটুকু লিখুন।'), -- [লেখার পেজ] যেটুকু লেখা ডিজাইনে থাকবে, শুধ
  ('tf21357fb', 'অন্য স্টাইল বেছে নিন'), -- [লেখার পেজ] অন্য স্টাইল বেছে নিন
  ('tebe29e6a', 'ডিজাইনের লেখা'), -- [লেখার পেজ] ডিজাইনের লেখা
  ('t1f84cfa2', 'এই স্টাইলে এই ঘরগুলো পূরণ করতে হবে। মেম্বারশিপ নিলে লিখতে পারবেন।'), -- [লেখার পেজ] এই স্টাইলে এই ঘরগুলো পূরণ করতে
  ('t34f77970', 'উদাহরণ দেখে নিজের মতো লিখুন। ঐচ্ছিক ঘর খালি রাখতে পারেন।'), -- [লেখার পেজ] উদাহরণ দেখে নিজের মতো লিখুন। ঐ
  ('t5b117ba5', '" ঘরটা লিখুন'), -- [লেখার পেজ] " ঘরটা লিখুন
  ('t3791b727', 'কমান্ড রেডি'), -- [কমান্ড রেডি] কমান্ড রেডি
  ('teea2d5c5', 'ধাপ ৩/৩'), -- [কমান্ড রেডি] ধাপ ৩/৩
  ('t19e67d85', 'লেখায় ফিরে যান'), -- [কমান্ড রেডি] লেখায় ফিরে যান
  ('t8fce7fcc', 'কাস্টমাইজড কমান্ড *রেডি*'), -- [কমান্ড রেডি] কাস্টমাইজড কমান্ড *রেডি*
  ('tef7841d5', 'আপনার কাস্টমাইজড কমান্ড'), -- [কমান্ড রেডি] আপনার কাস্টমাইজড কমান্ড
  ('t2c79a8ff', 'পুরোটাই কপি হবে'), -- [কমান্ড রেডি] পুরোটাই কপি হবে
  ('te73f05ac', 'কপি হয়নি। নিচের লেখায় চেপে ধরে "Select all", তারপর "Copy" করুন।'), -- [কমান্ড রেডি] কপি হয়নি। নিচের লেখায় চেপে ধ
  ('t430aa22c', 'নিচের বাটনে চেপে কমান্ড কপি করুন'), -- [কমান্ড রেডি] নিচের বাটনে চেপে কমান্ড কপি কর
  ('t27b0d1eb', 'ChatGPT খুলে কমান্ড পেস্ট করুন'), -- [কমান্ড রেডি] ChatGPT খুলে কমান্ড পেস্ট করুন
  ('t71aee20c', 'সাথে'), -- [কমান্ড রেডি] সাথে
  ('tab406271', 'অ্যাটাচ করে সেন্ড করুন'), -- [কমান্ড রেডি] অ্যাটাচ করে সেন্ড করুন
  ('tc56af407', 'কপি হয়েছে'), -- [কমান্ড রেডি] কপি হয়েছে
  ('t8e5f728a', 'https://chatgpt.com/'), -- [কমান্ড রেডি] https://chatgpt.com/
  ('t713a9b7e', 'ChatGPT-তে যান'), -- [কমান্ড রেডি] ChatGPT-তে যান
  ('t92ad8eea', 'কমান্ড কপি করুন'), -- [কমান্ড রেডি] কমান্ড কপি করুন
  ('t91abed36', 'ডিজাইনে কোনো সমস্যা হয়েছে?'), -- [কমান্ড রেডি] ডিজাইনে কোনো সমস্যা হয়েছে?
  ('t6987706c', 'রেডি লাইন কপি করে একই চ্যাটে দিন'), -- [কমান্ড রেডি] রেডি লাইন কপি করে একই চ্যাটে দ
  ('t326a08d3', 'কাস্টমাইজড কমান্ড কপি হয়েছে'), -- [কমান্ড রেডি] কাস্টমাইজড কমান্ড কপি হয়েছে
  ('tff61bb77', 'কপি হয়নি, নিচের লেখা থেকে কপি করুন'), -- [কমান্ড রেডি] কপি হয়নি, নিচের লেখা থেকে কপি
  ('t65c93e4d', 'ঠিক করুন'), -- [ডিজাইন ঠিক করুন] ঠিক করুন
  ('tfecdd8f6', 'কমান্ডে ফিরে যান'), -- [ডিজাইন ঠিক করুন] কমান্ডে ফিরে যান
  ('t5e13f3c1', 'ডিজাইন *ঠিক করুন*'), -- [ডিজাইন ঠিক করুন] ডিজাইন *ঠিক করুন*
  ('tad2e2804', 'যে সমস্যা হয়েছে সেটা চাপুন। লেখা কপি হবে, একই চ্যাটে পেস্ট করুন।'), -- [ডিজাইন ঠিক করুন] যে সমস্যা হয়েছে সেটা চাপুন। ল
  ('tbabd82c0', 'কপি'), -- [ডিজাইন ঠিক করুন] কপি
  ('tc442460f', 'লাইন কপি হয়েছে'), -- [ডিজাইন ঠিক করুন] লাইন কপি হয়েছে
  ('t2d3122fb', 'কপি হয়নি, আবার চাপুন'), -- [ডিজাইন ঠিক করুন] কপি হয়নি, আবার চাপুন
  ('t776bb62f', 'মাত্র *১ টাকায়* আপনার ব্র্যান্ডের প্রফেশনাল গ্রাফিক ডিজাইন'), -- [লগইন] মাত্র *১ টাকায়* আপনার ব্র্যান
  ('t91286b8e', 'পছন্দের স্টাইল বাছুন, দুই লাইন লিখুন, কাস্টমাইজড কমান্ড কপি করে ChatGPT-তে দিন।'), -- [লগইন] পছন্দের স্টাইল বাছুন, দুই লাইন
  ('tb2052257', 'ফিরে যান'), -- [লগইন] ফিরে যান
  ('tda667a11', 'মোবাইল নম্বর *দিন*'), -- [লগইন] মোবাইল নম্বর *দিন*
  ('t0fb4f1a1', 'যে নম্বর দিয়ে মেম্বারশিপ নেবেন, সেটা দিন।'), -- [লগইন] যে নম্বর দিয়ে মেম্বারশিপ নেবে
  ('t054b2631', 'মোবাইল নম্বর'), -- [লগইন] মোবাইল নম্বর
  ('t67d12dbe', 'চালিয়ে যান'), -- [লগইন] চালিয়ে যান
  ('t56007083', 'চালিয়ে গেলে আপনি'), -- [লগইন] চালিয়ে গেলে আপনি
  ('tb97fa88f', 'শর্তাবলি'), -- [লগইন] শর্তাবলি
  ('t098326f9', 'আর'), -- [লগইন] আর
  ('t419acdf7', 'প্রাইভেসি পলিসি'), -- [লগইন] প্রাইভেসি পলিসি
  ('ta418880d', 'মেনে নিচ্ছেন'), -- [লগইন] মেনে নিচ্ছেন
  ('t72203891', '১১ সংখ্যার সঠিক মোবাইল নম্বর দিন'), -- [লগইন] ১১ সংখ্যার সঠিক মোবাইল নম্বর দ
  ('t61693e01', 'অ্যাকাউন্টটা বন্ধ আছে, WhatsApp-এ যোগাযোগ করুন'), -- [লগইন] অ্যাকাউন্টটা বন্ধ আছে, WhatsAp
  ('tfdb31ebe', 'সব স্টাইল খোলা'), -- [মেম্বারশিপ ও পেমেন্ট] সব স্টাইল খোলা
  ('t7f56b9bd', 'যত খুশি ডিজাইনের কাস্টমাইজড কমান্ড'), -- [মেম্বারশিপ ও পেমেন্ট] যত খুশি ডিজাইনের কাস্টমাইজড কম
  ('t237c40ea', 'ডিজাইন ঠিক করার রেডি লাইন'), -- [মেম্বারশিপ ও পেমেন্ট] ডিজাইন ঠিক করার রেডি লাইন
  ('t5a04ad75', 'নতুন স্টাইল আসলে সাথে সাথে পাবেন'), -- [মেম্বারশিপ ও পেমেন্ট] নতুন স্টাইল আসলে সাথে সাথে পাব
  ('t823bc87c', 'আসসালামু আলাইকুম, আমি'), -- [মেম্বারশিপ ও পেমেন্ট] আসসালামু আলাইকুম, আমি
  ('tf4fc0064', '-এর মেম্বারশিপ নিতে চাই। আমার নম্বর:'), -- [মেম্বারশিপ ও পেমেন্ট] -এর মেম্বারশিপ নিতে চাই। আমার 
  ('t1dd64f9d', 'পেমেন্ট করুন · ৳'), -- [মেম্বারশিপ ও পেমেন্ট] পেমেন্ট করুন · ৳
  ('te835d181', 'পেমেন্ট হলেই মেম্বারশিপ নিজে থেকে চালু হবে।'), -- [মেম্বারশিপ ও পেমেন্ট] পেমেন্ট হলেই মেম্বারশিপ নিজে থ
  ('t44d56f65', 'সমস্যা হলে WhatsApp-এ মেসেজ দিন'), -- [মেম্বারশিপ ও পেমেন্ট] সমস্যা হলে WhatsApp-এ মেসেজ দি
  ('tea80659b', 'মেম্বারশিপ'), -- [মেম্বারশিপ ও পেমেন্ট] মেম্বারশিপ
  ('t05dd299b', 'পুরো বছরের ডিজাইন, *এক পেমেন্টে*'), -- [মেম্বারশিপ ও পেমেন্ট] পুরো বছরের ডিজাইন, *এক পেমেন্ট
  ('te8f6325d', 'সব স্টাইল খুলে যাবে, যত খুশি কাস্টমাইজড কমান্ড বানাতে পারবেন।'), -- [মেম্বারশিপ ও পেমেন্ট] সব স্টাইল খুলে যাবে, যত খুশি ক
  ('td7b944f3', 'বার্ষিক মেম্বারশিপ'), -- [মেম্বারশিপ ও পেমেন্ট] বার্ষিক মেম্বারশিপ
  ('te4e3d29a', '/ বছর'), -- [মেম্বারশিপ ও পেমেন্ট] / বছর
  ('tbfba3042', 'মাসে মাত্র'), -- [মেম্বারশিপ ও পেমেন্ট] মাসে মাত্র
  ('t0df3de41', '· প্রতিদিন মাত্র *১ টাকা*'), -- [মেম্বারশিপ ও পেমেন্ট] · প্রতিদিন মাত্র *১ টাকা*
  ('t6711ac3e', 'যা যা বানাতে পারবেন'), -- [মেম্বারশিপ ও পেমেন্ট] যা যা বানাতে পারবেন
  ('tf859e237', 'প্রোডাক্ট, অফার, উৎসব'), -- [মেম্বারশিপ ও পেমেন্ট] প্রোডাক্ট, অফার, উৎসব
  ('tbd3fc74a', 'টা স্টাইল, নতুন আসছে নিয়মিত।'), -- [মেম্বারশিপ ও পেমেন্ট] টা স্টাইল, নতুন আসছে নিয়মিত।
  ('t0433bd79', '-এর মেম্বারশিপের পেমেন্ট করেছি, কিন্তু চালু হয়নি। আমার নম্বর:'), -- [পেমেন্ট যাচাই] -এর মেম্বারশিপের পেমেন্ট করেছি
  ('tddd8a7fa', 'পেমেন্ট'), -- [পেমেন্ট যাচাই] পেমেন্ট
  ('t56a5f99c', 'পেমেন্ট যাচাই হচ্ছে'), -- [পেমেন্ট যাচাই] পেমেন্ট যাচাই হচ্ছে
  ('t4451375a', 'পেমেন্ট করে থাকলে কয়েক সেকেন্ডের মধ্যে মেম্বারশিপ চালু হয়ে যাবে। টাকা কাটা না হলে আবার পেমেন্ট করতে পারেন।'), -- [পেমেন্ট যাচাই] পেমেন্ট করে থাকলে কয়েক সেকেন্
  ('t11571235', 'চালু হয়েছে কিনা দেখুন'), -- [পেমেন্ট যাচাই] চালু হয়েছে কিনা দেখুন
  ('t3e637f70', 'আবার পেমেন্ট করুন'), -- [পেমেন্ট যাচাই] আবার পেমেন্ট করুন
  ('t928c6fb1', 'WhatsApp-এ জানান'), -- [পেমেন্ট যাচাই] WhatsApp-এ জানান
  ('tc0b3e194', 'এখনো চালু হয়নি। পেমেন্ট করে থাকলে একটু পরে আবার দেখুন।'), -- [পেমেন্ট যাচাই] এখনো চালু হয়নি। পেমেন্ট করে থ
  ('tb90a540c', 'চালু'), -- [মেম্বারশিপ চালু] চালু
  ('tf942219a', 'হয়েছে'), -- [মেম্বারশিপ চালু] হয়েছে
  ('t3a906776', 'এখন থেকে সব স্টাইল খোলা। ডিজাইন শুরু করুন।'), -- [মেম্বারশিপ চালু] এখন থেকে সব স্টাইল খোলা। ডিজাই
  ('t787cd6d8', 'পেমেন্ট সফল। এখন আপনার ব্র্যান্ড সেটআপ করে নিন, তারপর ডিজাইন শুরু।'), -- [মেম্বারশিপ চালু] পেমেন্ট সফল। এখন আপনার ব্র্যান
  ('te02414be', 'প্ল্যান'), -- [মেম্বারশিপ চালু] প্ল্যান
  ('t0fce3e67', 'টাকা'), -- [মেম্বারশিপ চালু] টাকা
  ('t0b41b6d2', 'মেয়াদ'), -- [মেম্বারশিপ চালু] মেয়াদ
  ('t1106742d', 'পর্যন্ত'), -- [মেম্বারশিপ চালু] পর্যন্ত
  ('t622af877', 'ডিজাইন শুরু করুন'), -- [মেম্বারশিপ চালু] ডিজাইন শুরু করুন
  ('td552eb86', 'ব্র্যান্ড সেটআপ করুন'), -- [মেম্বারশিপ চালু] ব্র্যান্ড সেটআপ করুন
  ('tfc8fd0be', 'চওড়া'), -- [ব্র্যান্ড সেটআপ] চওড়া
  ('tbdd31078', 'চৌকো'), -- [ব্র্যান্ড সেটআপ] চৌকো
  ('t67bca444', 'লম্বা'), -- [ব্র্যান্ড সেটআপ] লম্বা
  ('tc35c4b67', 'রঙে চেপে বদলাতে পারবেন'), -- [ব্র্যান্ড সেটআপ] রঙে চেপে বদলাতে পারবেন
  ('te19b54d7', 'লোগো দিলে রং নিজে থেকে বের হয়ে আসবে'), -- [ব্র্যান্ড সেটআপ] লোগো দিলে রং নিজে থেকে বের হয়
  ('tec0a11b4', 'ব্র্যান্ড সেটআপ'), -- [ব্র্যান্ড সেটআপ] ব্র্যান্ড সেটআপ
  ('t18968120', 'আপনার *ব্র্যান্ড* সেটআপ'), -- [ব্র্যান্ড সেটআপ] আপনার *ব্র্যান্ড* সেটআপ
  ('td0c3b535', 'শুধু একবার। এরপর প্রতিটা কমান্ডে এগুলো নিজে থেকেই বসে যাবে।'), -- [ব্র্যান্ড সেটআপ] শুধু একবার। এরপর প্রতিটা কমান্
  ('tdca652b2', 'লোগো নেওয়া হয়েছে ✓'), -- [ব্র্যান্ড সেটআপ] লোগো নেওয়া হয়েছে ✓
  ('t460c9379', 'লোগোর ছবি দিন'), -- [ব্র্যান্ড সেটআপ] লোগোর ছবি দিন
  ('tc5ea0ba4', 'লোগো থেকে রং নিজে বের হয়ে গেছে'), -- [ব্র্যান্ড সেটআপ] লোগো থেকে রং নিজে বের হয়ে গেছ
  ('t76422b4a', 'PNG বা JPG, সাদা বা স্বচ্ছ ব্যাকগ্রাউন্ড হলে ভালো'), -- [ব্র্যান্ড সেটআপ] PNG বা JPG, সাদা বা স্বচ্ছ ব্য
  ('t00685af0', 'বেছে নিন'), -- [ব্র্যান্ড সেটআপ] বেছে নিন
  ('t79ee0900', 'লোগোর আকার'), -- [ব্র্যান্ড সেটআপ] লোগোর আকার
  ('tef9bf36a', 'লোগো থেকে'), -- [ব্র্যান্ড সেটআপ] লোগো থেকে
  ('t149ae164', 'ব্র্যান্ডের তথ্য'), -- [ব্র্যান্ড সেটআপ] ব্র্যান্ডের তথ্য
  ('t580a7bdc', 'ব্র্যান্ডের নাম'), -- [ব্র্যান্ড সেটআপ] ব্র্যান্ডের নাম
  ('td6835426', 'পরে বদলানো যাবে না'), -- [ব্র্যান্ড সেটআপ] পরে বদলানো যাবে না
  ('tb64ace7b', 'যেমন: পল্লী বাজার'), -- [ব্র্যান্ড সেটআপ] যেমন: পল্লী বাজার
  ('t95505337', 'ট্যাগলাইন'), -- [ব্র্যান্ড সেটআপ] ট্যাগলাইন
  ('t238cd1bb', 'যেমন: খাঁটি গাওয়া ঘি আর অর্গানিক খাবার'), -- [ব্র্যান্ড সেটআপ] যেমন: খাঁটি গাওয়া ঘি আর অর্গা
  ('td62d06b4', 'ব্যবসার ধরন'), -- [ব্র্যান্ড সেটআপ] ব্যবসার ধরন
  ('t8fa7b0ec', 'সেভ করে শুরু করুন'), -- [ব্র্যান্ড সেটআপ] সেভ করে শুরু করুন
  ('t7adc25a0', 'ব্র্যান্ডের নাম দিন'), -- [ব্র্যান্ড সেটআপ] ব্র্যান্ডের নাম দিন
  ('tfa9b9ec1', 'ব্যবসার ধরন বেছে নিন'), -- [ব্র্যান্ড সেটআপ] ব্যবসার ধরন বেছে নিন
  ('t2fdc2806', 'ব্র্যান্ড সেভ হয়েছে ✓'), -- [ব্র্যান্ড সেটআপ] ব্র্যান্ড সেভ হয়েছে ✓
  ('t47905a16', 'স্বাগতম,'), -- [স্বাগতম বক্স] স্বাগতম,
  ('tc363b5b1', 'কীভাবে ব্যবহার করবেন, তার ছোট একটা ভিডিও গাইড পেজে আছে। প্রথমবার একবার দেখে নিন।'), -- [স্বাগতম বক্স] কীভাবে ব্যবহার করবেন, তার ছোট 
  ('t283c3bdd', 'ভিডিও দেখুন'), -- [স্বাগতম বক্স] ভিডিও দেখুন
  ('tee8d8e09', 'পরে দেখব'), -- [স্বাগতম বক্স] পরে দেখব
  ('t99711718', 'কীভাবে ব্যবহার করবেন'), -- [গাইড ও সাপোর্ট] কীভাবে ব্যবহার করবেন
  ('tdf3d19d8', 'ভিডিও শীঘ্রই আসছে'), -- [গাইড ও সাপোর্ট] ভিডিও শীঘ্রই আসছে
  ('t15f62a30', 'WhatsApp সাপোর্ট'), -- [গাইড ও সাপোর্ট] WhatsApp সাপোর্ট
  ('t092e4343', 'ডিজাইনে আটকে গেলে মেসেজ দিন'), -- [গাইড ও সাপোর্ট] ডিজাইনে আটকে গেলে মেসেজ দিন
  ('tf32a2f4e', 'কল করুন'), -- [গাইড ও সাপোর্ট] কল করুন
  ('t9b354e1e', 'ফেসবুক গ্রুপ'), -- [গাইড ও সাপোর্ট] ফেসবুক গ্রুপ
  ('t1440fc79', 'নিজের বানানো ডিজাইন শেয়ার করুন, মতামত নিন'), -- [গাইড ও সাপোর্ট] নিজের বানানো ডিজাইন শেয়ার করু
  ('t7a8616c6', 'পরের লাইভ ক্লাস'), -- [গাইড ও সাপোর্ট] পরের লাইভ ক্লাস
  ('tf814b430', 'জয়েন করুন'), -- [গাইড ও সাপোর্ট] জয়েন করুন
  ('tcc6099e0', 'নিচের ভিডিওটা একবার দেখে নিন, তাহলেই পুরো অ্যাপ ব্যবহার করতে পারবেন।'), -- [গাইড ও সাপোর্ট] নিচের ভিডিওটা একবার দেখে নিন, 
  ('td8f488d7', 'লগইন করলে এখানে আপনার ব্র্যান্ড, মেম্বারশিপ আর পেমেন্ট দেখা যাবে।'), -- [অ্যাকাউন্ট] লগইন করলে এখানে আপনার ব্র্যান্
  ('te23c569d', 'নেওয়া হয়নি'), -- [অ্যাকাউন্ট] নেওয়া হয়নি
  ('tc471512c', 'ব্র্যান্ড'), -- [অ্যাকাউন্ট] ব্র্যান্ড
  ('t30850dcc', 'মেম্বারশিপ চালু হলে ব্র্যান্ড সেটআপ করবেন।'), -- [অ্যাকাউন্ট] মেম্বারশিপ চালু হলে ব্র্যান্ড 
  ('tc9dfad7d', 'অবস্থা'), -- [অ্যাকাউন্ট] অবস্থা
  ('t9e6f5013', 'বাকি'), -- [অ্যাকাউন্ট] বাকি
  ('t79af515e', 'দিন'), -- [অ্যাকাউন্ট] দিন
  ('td42fb54e', 'মেয়াদ বাড়ান'), -- [অ্যাকাউন্ট] মেয়াদ বাড়ান
  ('tf3cd0bbd', 'পেমেন্টের অবস্থা দেখুন'), -- [অ্যাকাউন্ট] পেমেন্টের অবস্থা দেখুন
  ('t81b0f76c', 'পেমেন্টের তালিকা'), -- [অ্যাকাউন্ট] পেমেন্টের তালিকা
  ('tdb057a16', 'অন্যান্য'), -- [অ্যাকাউন্ট] অন্যান্য
  ('te1727a11', 'গাইড আর সাপোর্ট'), -- [অ্যাকাউন্ট] গাইড আর সাপোর্ট
  ('t72706eea', 'এখনো কোনো পেমেন্ট নেই'), -- [অ্যাকাউন্ট] এখনো কোনো পেমেন্ট নেই
  ('t54e54179', 'লোড করা যায়নি'), -- [অ্যাকাউন্ট] লোড করা যায়নি
  ('ted3b57ef', 'শীঘ্রই আসছে'), -- [পলিসি] শীঘ্রই আসছে
  ('t3117d148', 'লগআউট করবেন?'), -- [লগআউট] লগআউট করবেন?
  ('td2b63e14', 'আবার ঢুকতে মোবাইল নম্বর লাগবে। আপনার ব্র্যান্ড আর মেম্বারশিপ ঠিক থাকবে।'), -- [লগআউট] আবার ঢুকতে মোবাইল নম্বর লাগবে।
  ('tc2e8e6fc', 'লগআউট করুন'), -- [লগআউট] লগআউট করুন
  ('tca21daf1', 'বাতিল'), -- [লগআউট] বাতিল
  ('t8e30c14b', 'লগআউট হয়েছে'), -- [লগআউট] লগআউট হয়েছে
  ('td7866732', 'ইন্টারনেট সংযোগ নেই'), -- [ইন্টারনেট নেই] ইন্টারনেট সংযোগ নেই
  ('te11bb195', 'ইন্টারনেট চালু করে আবার চেষ্টা করুন।'), -- [ইন্টারনেট নেই] ইন্টারনেট চালু করে আবার চেষ্টা
  ('tbfbc9c0b', 'আবার চেষ্টা করুন'), -- [ইন্টারনেট নেই] আবার চেষ্টা করুন
  ('t3bd0acef', 'জানুয়ারি'), -- [সাধারণ বার্তা] জানুয়ারি
  ('ta15e222b', 'ফেব্রুয়ারি'), -- [সাধারণ বার্তা] ফেব্রুয়ারি
  ('t2d929504', 'মার্চ'), -- [সাধারণ বার্তা] মার্চ
  ('t6d596cff', 'এপ্রিল'), -- [সাধারণ বার্তা] এপ্রিল
  ('t2f4e0226', 'মে'), -- [সাধারণ বার্তা] মে
  ('tbc0c9bc6', 'জুন'), -- [সাধারণ বার্তা] জুন
  ('t8b7dbf28', 'জুলাই'), -- [সাধারণ বার্তা] জুলাই
  ('t405f1ca2', 'আগস্ট'), -- [সাধারণ বার্তা] আগস্ট
  ('t504232b6', 'সেপ্টেম্বর'), -- [সাধারণ বার্তা] সেপ্টেম্বর
  ('t65abe4cf', 'অক্টোবর'), -- [সাধারণ বার্তা] অক্টোবর
  ('tdfddf529', 'নভেম্বর'), -- [সাধারণ বার্তা] নভেম্বর
  ('ta04b807e', 'ডিসেম্বর'), -- [সাধারণ বার্তা] ডিসেম্বর
  ('t9cece10c', 'উদ্যোক্তা গ্রাফিক্স AI'), -- [সাধারণ বার্তা] উদ্যোক্তা গ্রাফিক্স AI
  ('t50b6ef8a', 'সার্ভার থেকে ভুল উত্তর:'), -- [সাধারণ বার্তা] সার্ভার থেকে ভুল উত্তর:
  ('t76afe202', 'সার্ভারে পৌঁছানো যাচ্ছে না, একটু পরে আবার চেষ্টা করুন'), -- [সাধারণ বার্তা] সার্ভারে পৌঁছানো যাচ্ছে না, এক
  ('tc51a0460', 'হোম'), -- [সাধারণ বার্তা] হোম
  ('te28e2a93', 'স্টাইল'), -- [সাধারণ বার্তা] স্টাইল
  ('t5ca7944f', 'গাইড'), -- [সাধারণ বার্তা] গাইড
  ('tfaa77e7f', 'অ্যাকাউন্ট'), -- [সাধারণ বার্তা] অ্যাকাউন্ট
  ('teeb7b158', 'এক ট্যাপে ফোনের হোম স্ক্রিনে যোগ হবে'), -- [সাধারণ বার্তা] এক ট্যাপে ফোনের হোম স্ক্রিনে য
  ('tfcdee2ff', 'ফেসবুকের ভেতরের ব্রাউজারে ইনস্টল হয় না। উপরের ⋮ মেনু থেকে "Chrome-এ খুলুন" চাপুন, তারপর এখানে এসে এটা চাপুন'), -- [সাধারণ বার্তা] ফেসবুকের ভেতরের ব্রাউজারে ইনস্
  ('tf2be94ed', 'Safari-র শেয়ার বাটন চেপে "Add to Home Screen" চাপুন'), -- [সাধারণ বার্তা] Safari-র শেয়ার বাটন চেপে "Add
  ('td2bfe5c7', 'Chrome-এর ⋮ মেনু থেকে "হোম স্ক্রিনে যোগ করুন" বা "ইনস্টল করুন" চাপুন'), -- [সাধারণ বার্তা] Chrome-এর ⋮ মেনু থেকে "হোম স্ক
  ('te04f7b25', 'অ্যাপ হিসেবে ইনস্টল করুন'), -- [সাধারণ বার্তা] অ্যাপ হিসেবে ইনস্টল করুন
  ('t9cfa3898', 'সার্ভার:'), -- [সাধারণ বার্তা] সার্ভার:
  ('t63de2ba5', 'কন্টেন্ট আসেনি'), -- [সাধারণ বার্তা] কন্টেন্ট আসেনি
  ('t5c67b0ef', 'পেমেন্ট হয়নি, টাকা কাটা হয়নি। আবার চেষ্টা করতে পারেন।'), -- [সাধারণ বার্তা] পেমেন্ট হয়নি, টাকা কাটা হয়নি
  ('L9cece10c', 'উদ্যোক্তা গ্রাফিক্স AI'), -- [ল্যান্ডিং · মেনু ও ফুটার] উদ্যোক্তা গ্রাফিক্স AI
  ('L5c9da3b7', 'কীভাবে কাজ করে'), -- [ল্যান্ডিং · মেনু ও ফুটার] কীভাবে কাজ করে
  ('Le28e2a93', 'স্টাইল'), -- [ল্যান্ডিং · মেনু ও ফুটার] স্টাইল
  ('Lf4ff07c8', 'রিভিউ'), -- [ল্যান্ডিং · মেনু ও ফুটার] রিভিউ
  ('Lcedb521e', 'দাম'), -- [ল্যান্ডিং · মেনু ও ফুটার] দাম
  ('L116b6557', 'প্রশ্নোত্তর'), -- [ল্যান্ডিং · মেনু ও ফুটার] প্রশ্নোত্তর
  ('L86b9a1b4', 'লগইন'), -- [ল্যান্ডিং · মেনু ও ফুটার] লগইন
  ('Lbc82fc73', 'মেম্বারশিপ নিন'), -- [ল্যান্ডিং · মেনু ও ফুটার] মেম্বারশিপ নিন
  ('L352c7e19', 'কাস্টমারদের রিভিউ দেখুন'), -- [ল্যান্ডিং · হিরো (সবার উপরে)] কাস্টমারদের রিভিউ দেখুন
  ('L9a6b7ddb', 'মাত্র *১ টাকায়* আপনার ব্র্যান্ডের
প্রফেশনাল গ্রাফিক ডিজাইন'), -- [ল্যান্ডিং · হিরো (সবার উপরে)] মাত্র *১ টাকায়* আপনার ব্র্যান
  ('L77fd1d32', 'নতুন উদ্যোক্তার প্রতিদিনের পোস্ট এখন সহজ। পছন্দের স্টাইল বাছুন, দুই লাইন লিখুন, কাস্টমাইজড কমান্ড কপি করে ChatGPT-তে দিন।'), -- [ল্যান্ডিং · হিরো (সবার উপরে)] নতুন উদ্যোক্তার প্রতিদিনের পোস
  ('L3caca433', 'অ্যাপটা ঘুরে দেখুন'), -- [ল্যান্ডিং · হিরো (সবার উপরে)] অ্যাপটা ঘুরে দেখুন
  ('L1dfa3d6a', '৳৩৯৯ / বছর · অটোমেটিক পেমেন্ট · সাথে সাথে চালু'), -- [ল্যান্ডিং · হিরো (সবার উপরে)] ৳৩৯৯ / বছর · অটোমেটিক পেমেন্ট 
  ('Lfc6a358a', 'জেনে রাখুন:'), -- [ল্যান্ডিং · হিরো (সবার উপরে)] জেনে রাখুন:
  ('L363a0682', 'ডিজাইন একটা ক্রিয়েটিভ স্কিল, কোনো টুলে একে বেঁধে রাখা যায় না। উদ্যোক্তা গ্রাফিক্স AI ডিজাইনারের বিকল্প না। এটা বানানো হয়েছে নতুন উদ্যোক্তাদের জন্য, যারা সুন্দর ডিজাইনের অভাবে সোশ্যাল মিডিয়ায় নিজের প্রোডাক্ট আর ব্র্যান্ড ঠিকমতো তুলে ধরতে পারছেন না। তাদের প্রতিদিনের কাজ সহজ করাই আমাদের উদ্দেশ্য।'), -- [ল্যান্ডিং · হিরো (সবার উপরে)] ডিজাইন একটা ক্রিয়েটিভ স্কিল, 
  ('L912edf36', 'এরকম ডিজাইন *আপনিও বানাবেন*'), -- [ল্যান্ডিং · নমুনা ডিজাইন] এরকম ডিজাইন *আপনিও বানাবেন*
  ('Lc4bffb6d', 'প্রতিটা ক্যাটাগরিতে আলাদা আলাদা স্টাইল। আপনার ব্র্যান্ড, আপনার কালার, আপনার প্রোডাক্ট।'), -- [ল্যান্ডিং · নমুনা ডিজাইন] প্রতিটা ক্যাটাগরিতে আলাদা আলাদ
  ('Lec37d03c', 'প্রোডাক্ট পোস্ট'), -- [ল্যান্ডিং · নমুনা ডিজাইন] প্রোডাক্ট পোস্ট
  ('Lce8e2c96', 'অফার ও সেল'), -- [ল্যান্ডিং · নমুনা ডিজাইন] অফার ও সেল
  ('L0201643d', 'উৎসব ও উপহার'), -- [ল্যান্ডিং · নমুনা ডিজাইন] উৎসব ও উপহার
  ('L11411b26', 'ঘোষণা ও ক্লাস'), -- [ল্যান্ডিং · নমুনা ডিজাইন] ঘোষণা ও ক্লাস
  ('Labb4ebf6', 'ফুড ও রেসিপি'), -- [ল্যান্ডিং · নমুনা ডিজাইন] ফুড ও রেসিপি
  ('Le978e553', 'লাইফস্টাইল'), -- [ল্যান্ডিং · নমুনা ডিজাইন] লাইফস্টাইল
  ('Le907c33b', 'সার্ভিস'), -- [ল্যান্ডিং · নমুনা ডিজাইন] সার্ভিস
  ('La672b48a', 'আইডিয়া ও কনসেপ্ট'), -- [ল্যান্ডিং · নমুনা ডিজাইন] আইডিয়া ও কনসেপ্ট
  ('L420579b0', 'উপরের সবগুলো আমাদের স্টাইল দিয়ে ChatGPT-তে বানানো নমুনা ডিজাইন।'), -- [ল্যান্ডিং · নমুনা ডিজাইন] উপরের সবগুলো আমাদের স্টাইল দিয
  ('Lfd2c2836', '৪ ধাপে *ডিজাইন রেডি*'), -- [ল্যান্ডিং · ৪ ধাপ] ৪ ধাপে *ডিজাইন রেডি*
  ('Labd7bad2', 'কোনো ডিজাইন সফটওয়্যার লাগবে না। মোবাইল থেকেই সব হবে।'), -- [ল্যান্ডিং · ৪ ধাপ] কোনো ডিজাইন সফটওয়্যার লাগবে ন
  ('L999f7cc6', 'ব্র্যান্ড একবার সেট করুন'), -- [ল্যান্ডিং · ৪ ধাপ] ব্র্যান্ড একবার সেট করুন
  ('Lfffe39e7', 'লোগো দিলেই আপনার ব্র্যান্ডের ৩টা কালার নিজে বের হয়ে যায়।'), -- [ল্যান্ডিং · ৪ ধাপ] লোগো দিলেই আপনার ব্র্যান্ডের ৩
  ('L0d15c4db', 'পছন্দের স্টাইল বাছুন'), -- [ল্যান্ডিং · ৪ ধাপ] পছন্দের স্টাইল বাছুন
  ('Lbd2a894a', 'প্রোডাক্ট, অফার, উৎসব, সার্ভিস: যেটা দরকার, সেই স্টাইল বাছুন।'), -- [ল্যান্ডিং · ৪ ধাপ] প্রোডাক্ট, অফার, উৎসব, সার্ভিস
  ('L6cfbaad4', 'শুধু দরকারি ঘরগুলো লিখুন'), -- [ল্যান্ডিং · ৪ ধাপ] শুধু দরকারি ঘরগুলো লিখুন
  ('L053e06a0', 'হেডলাইন, দাম, অফার: স্যাম্পল দেখে দুই-এক লাইন।'), -- [ল্যান্ডিং · ৪ ধাপ] হেডলাইন, দাম, অফার: স্যাম্পল দ
  ('L8f53e7f9', 'কাস্টমাইজড কমান্ড কপি করুন'), -- [ল্যান্ডিং · ৪ ধাপ] কাস্টমাইজড কমান্ড কপি করুন
  ('L7133927c', 'কাস্টমাইজড কমান্ড পেস্ট করুন, লোগো আর প্রোডাক্টের ছবি দিন। ডিজাইন রেডি।'), -- [ল্যান্ডিং · ৪ ধাপ] কাস্টমাইজড কমান্ড পেস্ট করুন, 
  ('Lb25a4e3b', 'ভালো প্রোডাক্ট আছে, শুধু *সুন্দর করে দেখাতে* পারছেন না?'), -- [ল্যান্ডিং · সমস্যা ও সমাধান] ভালো প্রোডাক্ট আছে, শুধু *সুন্
  ('L3cde1794', 'নতুন উদ্যোক্তাদের যে ৩টা ঝামেলা সবচেয়ে বেশি, সেগুলোর সহজ সমাধান।'), -- [ল্যান্ডিং · সমস্যা ও সমাধান] নতুন উদ্যোক্তাদের যে ৩টা ঝামেল
  ('Lb440835f', 'সমস্যা'), -- [ল্যান্ডিং · সমস্যা ও সমাধান] সমস্যা
  ('Lbb15bc8b', 'প্রতিদিন পোস্ট দিতে হয়, কিন্তু প্রতিবার ডিজাইনের খরচ সামলানো কঠিন'), -- [ল্যান্ডিং · সমস্যা ও সমাধান] প্রতিদিন পোস্ট দিতে হয়, কিন্ত
  ('L717169a8', 'সমাধান'), -- [ল্যান্ডিং · সমস্যা ও সমাধান] সমাধান
  ('L8fce5c72', 'প্রতিদিন মাত্র ১ টাকায় যত খুশি ডিজাইন'), -- [ল্যান্ডিং · সমস্যা ও সমাধান] প্রতিদিন মাত্র ১ টাকায় যত খুশ
  ('Lb2ff6aff', 'ChatGPT-তে কী লিখলে ভালো ডিজাইন আসে, জানা নেই'), -- [ল্যান্ডিং · সমস্যা ও সমাধান] ChatGPT-তে কী লিখলে ভালো ডিজাই
  ('L2d2ed60a', 'কাস্টমাইজড কমান্ড আমরা লিখে দিই, আপনি শুধু কপি করবেন'), -- [ল্যান্ডিং · সমস্যা ও সমাধান] কাস্টমাইজড কমান্ড আমরা লিখে দি
  ('Lede0b8bb', 'একেক পোস্টে একেক রঙ, ব্র্যান্ড চেনা যায় না'), -- [ল্যান্ডিং · সমস্যা ও সমাধান] একেক পোস্টে একেক রঙ, ব্র্যান্ড
  ('L5ff567d7', 'প্রতিটা ডিজাইন হবে আপনার ব্র্যান্ডের কালার টোন আর সিগনেচার স্টাইল বজায় রেখে'), -- [ল্যান্ডিং · সমস্যা ও সমাধান] প্রতিটা ডিজাইন হবে আপনার ব্র্য
  ('Le0384155', 'কাস্টমাররা *কী বলছেন*'), -- [ল্যান্ডিং · রিভিউ] কাস্টমাররা *কী বলছেন*
  ('L0b59cb68', 'আমাদের কাস্টমারদের পাঠানো আসল মেসেজের স্ক্রিনশট।'), -- [ল্যান্ডিং · রিভিউ] আমাদের কাস্টমারদের পাঠানো আসল 
  ('Lf1c6b3e5', 'কাস্টমারের রিভিউয়ের
স্ক্রিনশট ১'), -- [ল্যান্ডিং · রিভিউ] কাস্টমারের রিভিউয়ের
স্ক্রিনশট
  ('L94f07a36', 'কাস্টমারের ব্র্যান্ড'), -- [ল্যান্ডিং · রিভিউ] কাস্টমারের ব্র্যান্ড
  ('L82df8a9a', 'কাস্টমারের রিভিউয়ের
স্ক্রিনশট ২'), -- [ল্যান্ডিং · রিভিউ] কাস্টমারের রিভিউয়ের
স্ক্রিনশট
  ('Le5dfed57', 'কাস্টমারের রিভিউয়ের
স্ক্রিনশট ৩'), -- [ল্যান্ডিং · রিভিউ] কাস্টমারের রিভিউয়ের
স্ক্রিনশট
  ('L89e33271', 'কাস্টমারের রিভিউয়ের
স্ক্রিনশট ৪'), -- [ল্যান্ডিং · রিভিউ] কাস্টমারের রিভিউয়ের
স্ক্রিনশট
  ('L3d456c57', 'ছোট বাজেটে *পুরো বছরের* ডিজাইন'), -- [ল্যান্ডিং · দাম] ছোট বাজেটে *পুরো বছরের* ডিজাইন
  ('Ld7b944f3', 'বার্ষিক মেম্বারশিপ'), -- [ল্যান্ডিং · দাম] বার্ষিক মেম্বারশিপ
  ('L6960aaba', '৳৩৯৯'), -- [ল্যান্ডিং · দাম] ৳৩৯৯
  ('Le4e3d29a', '/ বছর'), -- [ল্যান্ডিং · দাম] / বছর
  ('Lbfba3042', 'মাসে মাত্র'), -- [ল্যান্ডিং · দাম] মাসে মাত্র
  ('Lf3e412ae', '৳৩৩'), -- [ল্যান্ডিং · দাম] ৳৩৩
  ('Lde7f2668', '· প্রতিদিন মাত্র'), -- [ল্যান্ডিং · দাম] · প্রতিদিন মাত্র
  ('L94c4d4e9', '১ টাকা'), -- [ল্যান্ডিং · দাম] ১ টাকা
  ('Lfdb31ebe', 'সব স্টাইল খোলা'), -- [ল্যান্ডিং · দাম] সব স্টাইল খোলা
  ('L7f56b9bd', 'যত খুশি ডিজাইনের কাস্টমাইজড কমান্ড'), -- [ল্যান্ডিং · দাম] যত খুশি ডিজাইনের কাস্টমাইজড কম
  ('L237c40ea', 'ডিজাইন ঠিক করার রেডি লাইন'), -- [ল্যান্ডিং · দাম] ডিজাইন ঠিক করার রেডি লাইন
  ('L5a04ad75', 'নতুন স্টাইল আসলে সাথে সাথে পাবেন'), -- [ল্যান্ডিং · দাম] নতুন স্টাইল আসলে সাথে সাথে পাব
  ('L42b772dc', 'অটোমেটিক পেমেন্ট:'), -- [ল্যান্ডিং · দাম] অটোমেটিক পেমেন্ট:
  ('L52ddc59d', 'বিকাশ, নগদসহ মোবাইল ব্যাংকিং বা কার্ড। পেমেন্ট হলেই সাথে সাথে মেম্বারশিপ চালু।'), -- [ল্যান্ডিং · দাম] বিকাশ, নগদসহ মোবাইল ব্যাংকিং ব
  ('L79862389', 'কেনার আগে অ্যাপটা ঘুরে দেখুন'), -- [ল্যান্ডিং · দাম] কেনার আগে অ্যাপটা ঘুরে দেখুন
  ('L4300ab0e', '· সব স্টাইল আর কোন স্টাইলে কী লিখতে হয়, দেখে নিতে পারবেন'), -- [ল্যান্ডিং · দাম] · সব স্টাইল আর কোন স্টাইলে কী 
  ('Ld949bef8', 'যা জানতে চান'), -- [ল্যান্ডিং · প্রশ্নোত্তর] যা জানতে চান
  ('L5096a685', 'ChatGPT-এর ফ্রি অ্যাকাউন্টে চলবে?'), -- [ল্যান্ডিং · প্রশ্নোত্তর] ChatGPT-এর ফ্রি অ্যাকাউন্টে চল
  ('Ld55fb0c6', 'চলবে। তবে ChatGPT-এর ফ্রি অ্যাকাউন্টে দিনে অল্প কয়েকটা ছবি বানানো যায়। নিয়মিত ডিজাইন করলে ChatGPT Plus সুবিধাজনক।'), -- [ল্যান্ডিং · প্রশ্নোত্তর] চলবে। তবে ChatGPT-এর ফ্রি অ্যা
  ('L6e720ddd', 'পেমেন্ট কীভাবে করব?'), -- [ল্যান্ডিং · প্রশ্নোত্তর] পেমেন্ট কীভাবে করব?
  ('L6ac27f21', 'অ্যাপেই অটোমেটিক পেমেন্ট: বিকাশ, নগদসহ মোবাইল ব্যাংকিং বা কার্ড দিয়ে। পেমেন্ট হলেই সাথে সাথে মেম্বারশিপ চালু, কাউকে কিছু পাঠাতে বা অপেক্ষা করতে হবে না।'), -- [ল্যান্ডিং · প্রশ্নোত্তর] অ্যাপেই অটোমেটিক পেমেন্ট: বিকা
  ('L799469ba', 'কেনার আগে দেখে নিতে পারব?'), -- [ল্যান্ডিং · প্রশ্নোত্তর] কেনার আগে দেখে নিতে পারব?
  ('Ld6aa5712', 'হ্যাঁ। অ্যাপটা ঘুরে দেখতে পারবেন: সব স্টাইল, আর কোন স্টাইলে কী লিখতে হয়। কাস্টমাইজড কমান্ড বানাতে মেম্বারশিপ লাগবে।'), -- [ল্যান্ডিং · প্রশ্নোত্তর] হ্যাঁ। অ্যাপটা ঘুরে দেখতে পারব
  ('L9ea921c8', 'লোগো আর প্রোডাক্টের ছবি কোথায় দেব?'), -- [ল্যান্ডিং · প্রশ্নোত্তর] লোগো আর প্রোডাক্টের ছবি কোথায়
  ('Le561135a', 'কাস্টমাইজড কমান্ড পেস্ট করার সময় ChatGPT-তেই লোগো আর প্রোডাক্টের ছবি অ্যাটাচ করবেন।'), -- [ল্যান্ডিং · প্রশ্নোত্তর] কাস্টমাইজড কমান্ড পেস্ট করার স
  ('L217be51c', 'ডিজাইন পছন্দ না হলে কী করব?'), -- [ল্যান্ডিং · প্রশ্নোত্তর] ডিজাইন পছন্দ না হলে কী করব?
  ('L7579c3d9', 'অ্যাপে রেডি লাইন আছে: "লেখা ভেঙে গেছে", "লেখার জায়গা বাড়াও" এরকম। কপি করে একই চ্যাটে দিলেই ঠিক হবে।'), -- [ল্যান্ডিং · প্রশ্নোত্তর] অ্যাপে রেডি লাইন আছে: "লেখা ভে
  ('Ldfe1bbda', 'এক অ্যাকাউন্টে কয়টা ব্র্যান্ড?'), -- [ল্যান্ডিং · প্রশ্নোত্তর] এক অ্যাকাউন্টে কয়টা ব্র্যান্ড
  ('Le2c352f3', 'একটা অ্যাকাউন্টে একটা ব্র্যান্ড। ব্র্যান্ডের নাম একবার দিলে আর বদলায় না।'), -- [ল্যান্ডিং · প্রশ্নোত্তর] একটা অ্যাকাউন্টে একটা ব্র্যান্
  ('L6d8fdbcf', 'মোবাইলে চলবে?'), -- [ল্যান্ডিং · প্রশ্নোত্তর] মোবাইলে চলবে?
  ('L22a8acd8', 'হ্যাঁ। মোবাইলের ব্রাউজারেই পুরো অ্যাপ চলে, আলাদা কোনো সফটওয়্যার লাগবে না।'), -- [ল্যান্ডিং · প্রশ্নোত্তর] হ্যাঁ। মোবাইলের ব্রাউজারেই পুর
  ('L1ab91c76', 'পুরো বছরের ডিজাইন, এক পেমেন্টে'), -- [ল্যান্ডিং · শেষের কল-টু-অ্যাকশন] পুরো বছরের ডিজাইন, এক পেমেন্টে
  ('Lb03cd3d0', '/ বছর · মাসে মাত্র ৳৩৩ · সব স্টাইল খোলা'), -- [ল্যান্ডিং · শেষের কল-টু-অ্যাকশন] / বছর · মাসে মাত্র ৳৩৩ · সব স্
  ('L56e8cc25', 'চেকআউট করুন'), -- [ল্যান্ডিং · শেষের কল-টু-অ্যাকশন] চেকআউট করুন
  ('L7a672637', 'অটোমেটিক পেমেন্ট · সাথে সাথে চালু'), -- [ল্যান্ডিং · শেষের কল-টু-অ্যাকশন] অটোমেটিক পেমেন্ট · সাথে সাথে চ
  ('Lb97fa88f', 'শর্তাবলি'), -- [ল্যান্ডিং · মেনু ও ফুটার] শর্তাবলি
  ('L419acdf7', 'প্রাইভেসি পলিসি'), -- [ল্যান্ডিং · মেনু ও ফুটার] প্রাইভেসি পলিসি
  ('Ld280386c', 'রিফান্ড পলিসি'), -- [ল্যান্ডিং · মেনু ও ফুটার] রিফান্ড পলিসি
  ('L2cf496e7', 'https://wa.me/8801978376462') -- [ল্যান্ডিং · মেনু ও ফুটার] https://wa.me/8801978376462
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

