# উদ্যোক্তা গ্রাফিক্স AI — Production Release Package

এই ফোল্ডারে সম্পূর্ণ অ্যাপ্লিকেশনটি **Google Apps Script সম্পূর্ণ বাদ দিয়ে** আধুনিক **Supabase (PostgreSQL + Edge Function)** এবং **Cloudinary (Zero Egress Image Storage)** দিয়ে ১০০% প্রোডাকশন-রেডি করে সাজানো হয়েছে।

---

## 📂 ফাইল ও কাঠামোর বিবরণ

```text
uddokta-graphics-release/
├── index.html                  # ল্যান্ডিং পেজ (ভিজিটর ও মেম্বারশিপ ফ্লো)
├── app.html                    # কাস্টমার অ্যাপ ও ইউজার ড্যাশবোর্ড
├── admin.html                  # অ্যাডমিন ড্যাশবোর্ড ও CMS প্যানেল
├── css/                        # সমস্ত স্টাইলশীট (index.css, app.css, admin.css)
├── js/                         # সমস্ত জাভাস্ক্রিপ্ট (index.js, app.js, admin.js)
├── images/                     # সমস্ত মিডিয়া ও এসেট
│   ├── logos/                  # ব্র্যান্ড লোগো
│   ├── samples/                # নমুনা ডিজাইনের সব ছবি
│   └── eps-*.png & icon-*.png  # ব্র্যান্ডিং ব্যাজ ও PWA আইকন
├── vercel.json                 # Vercel হোস্টিং ও হেডার্স কনফিগারেশন
├── manifest.json               # PWA কনফিগারেশন (মোবাইলে ইনস্টলযোগ্য)
├── sw.js                       # অফলাইন সার্ভিস ওয়ার্কার
├── .env.example                # সম্পূর্ণ প্রজেক্টের ভ্যারিয়েবল কনফিগারেশন
│
└── supabase/                   # Supabase Production Backend
    ├── config.toml             # Supabase ফাংশন কনফিগ
    ├── schema.sql              # সম্পূর্ণ PostgreSQL টেবিল স্কিমা (OTP সহ)
    ├── seed.sql                # শুরু করার জন্য প্রস্তুত সমস্ত ডেটা (২৩ স্টাইল, ৮৯ ঘর ইত্যাদি)
    └── functions/api/          # একক Supabase Edge Function (Apps Script বিকল্প)
        ├── index.ts            # মূল রাউটার (content, lp, login, cmd, EPS, Admin)
        ├── engine.ts           # ৩-স্তরের কমান্ড জেনারেটর ও বাংলা কাউন্টার
        ├── cloudinary.ts       # Cloudinary আপলোড হ্যান্ডলার (No Egress Cost)
        └── eps.ts              # EPS HMAC-SHA512 পেমেন্ট ইন্টিগ্রেশন
```

---

## 🚀 ৩ ধাপে লাইভ করার সম্পূর্ণ গাইড

### ধাপ ১: Supabase ডাটাবেস সেটআপ
1. [Supabase](https://supabase.com)-এ একটি নতুন প্রজেক্ট তৈরি করুন।
2. Supabase ড্যাশবোর্ডের **SQL Editor**-এ যান।
3. প্রথমে `supabase/schema.sql` ফাইলের কোড পেস্ট করে **Run** চাপুন (টেবিল তৈরি হবে)।
4. এরপর `supabase/seed.sql` ফাইলের কোড পেস্ট করে **Run** চাপুন (শুরুর সমস্ত স্টাইল ও সেটিংস লোড হবে)।

---

### ধাপ ২: Cloudinary ও Supabase সিক্রেট বসানো এবং ডিপ্লয়
1. `.env.example` ফাইলের মতো করে আপনার Supabase প্রজেক্টে সিক্রেটগুলো সেট করুন:
   ```bash
   # Supabase CLI দিয়ে অথবা Supabase ড্যাশবোর্ডের Edge Functions -> Secrets থেকে:
   supabase secrets set CLOUDINARY_CLOUD_NAME="your_cloud_name"
   supabase secrets set CLOUDINARY_API_KEY="your_api_key"
   supabase secrets set CLOUDINARY_API_SECRET="your_api_secret"
   supabase secrets set EPS_MERCHANT_ID="your_merchant_id"
   supabase secrets set EPS_STORE_ID="your_store_id"
   supabase secrets set EPS_USERNAME="your_username"
   supabase secrets set EPS_PASSWORD="your_password"
   supabase secrets set EPS_HASH_KEY="your_hash_key"
   supabase secrets set EPS_MODE="sandbox"
   supabase secrets set ADMIN_PASSWORD="your_admin_password"
   supabase secrets set APP_URL="https://app.yourclientdomain.com"
   ```
2. Edge Function ডিপ্লয় করুন:
   ```bash
   supabase functions deploy api --no-verify-jwt
   ```
   ডিপ্লয় হলে আপনি একটি লাইভ URL পাবেন, যেমন:
   `https://<project-ref>.supabase.co/functions/v1/api`

---

### ধাপ ৩: ফ্রন্টএন্ডে `API_URL` বসিয়ে Vercel-এ ডেপ্লয়
1. `index.html`, `app.html` এবং `admin.html` ফাইলের `API_URL` লাইনে আপনার নতুন Edge Function-এর লিংকটি বসান:
   ```javascript
   var API_URL = 'https://<your-project-ref>.supabase.co/functions/v1/api';
   ```
2. পুরো `uddokta-graphics-release` ফোল্ডারটি **Vercel**-এ ড্র্যাগ-অ্যান্ড-ড্রপ করুন অথবা গিটহাবে পুশ করে কানেক্ট করুন।
3. আপনার অ্যাপ সেকেন্ডের মধ্যে লাইভ এবং ১,০০০+ কনকারেন্ট ইউজার হ্যান্ডেল করতে প্রস্তুত!

---

## 🛡️ পারফরম্যান্স ও সিকিউরিটি সুবিধা
- **জিরো ইগ্রেস খরচ:** Cloudinary ইমেজ ব্যবহার করায় Supabase-এর ব্যান্ডউইথ খরচ হবে ০%।
- **এজ ক্যাশ (Edge Caching):** `content` এবং `lp` এপিআই-এ ৫ মিনিটের এজ ক্যাশ দেওয়া আছে, ফলে একসাথে হাজার হাজার ব্যবহারকারী ল্যান্ডিং পেজে আসলেও ডাটাবেস ক্র্যাশ করবে না।
- **নিরাপদ লগইন:** ৪-সংখ্যার SMS OTP এবং সেশন টোকেন দিয়ে সুরক্ষিত।
- **অটো রিনিউয়াল:** EPS-এ পেমেন্ট হলে স্বয়ংক্রিয়ভাবে মেম্বারশিপ ১ বছর বেড়ে যাবে।
