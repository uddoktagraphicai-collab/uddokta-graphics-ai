-- =====================================================================
--  উদ্যোক্তা গ্রাফিক্স AI — Supabase PostgreSQL Production Schema
-- =====================================================================

-- ১. সেটিংস টেবিল (দাম, মেয়াদ, বেস কমান্ড, EPS পেমেন্ট, ক্লাউডিনারি, BulkSMSBD ইত্যাদি)
create table if not exists settings (
  key text primary key,
  value text not null default ''
);

-- সেটিংস টেবিলের গুরুত্বপূর্ণ কি-সমূহ (অ্যাডমিন সেটিংস ফর্ম অনুসারে):
-- ক. মেম্বারশিপ ও অ্যাপ: price, monthly, days, app_url, eps_email, admin_password, base_command
-- খ. EPS পেমেন্ট: eps_mode ('sandbox' | 'live'), eps_merchant_id, eps_store_id, eps_username, eps_password, eps_hash_key
-- গ. Cloudinary স্টোরেজ: cloudinary_cloud_name, cloudinary_api_key, cloudinary_api_secret, cloudinary_folder
-- ঘ. BulkSMSBD ওটিপি: sms_api_token, sms_sender_id, sms_api_url

-- ২. অ্যাপ ও ল্যান্ডিং পেজের লেখা (৩৪৭টি কি)
create table if not exists texts (
  key text primary key,
  value text not null default ''
);

-- ৩. ক্যাটাগরি টেবিল
create table if not exists cats (
  id text primary key,
  name text not null,
  sort int not null default 999,
  show boolean not null default true
);

-- ৪. স্টাইল টেবিল (রেসিপি, ক্লাউডিনারি ইমেজ ইত্যাদি)
create table if not exists styles (
  id text primary key,
  cat text references cats(id) on update cascade on delete set null,
  name text not null,
  img text not null default '',     -- ক্লাউডিনারি অপ্টিমাইজড ইমেজ URL
  attach text not null default '',  -- ChatGPT-তে কী সংযুক্ত করতে হবে
  logo text not null default 'top-left'
       check (logo in ('top-left','top-center','top-right','bottom-left','bottom-center','bottom-right',
                  'উপরে বামে','উপরে মাঝে','উপরে ডানে','নিচে বামে','নিচে মাঝে','নিচে ডানে')),
  style text not null default '',   -- স্টাইল রেসিপি
  status text not null default 'draft' check (status in ('published','draft','পাবলিশড','ড্রাফট')),
  pop boolean not null default false,
  sort int not null default 999,
  used int not null default 0,
  font1 text not null default '',   -- হেডলাইনের ফন্ট
  font2 text not null default ''    -- বাকি লেখার ফন্ট
);

-- ৫. স্টাইলের লেখার ঘর (Fields)
create table if not exists fields (
  id bigserial primary key,
  sid text not null references styles(id) on update cascade on delete cascade,
  sort int not null default 1,
  el text not null check (el in ('headline','sub','short','bullet','offer','price','oldprice','date','badge','button','phone','address')),
  ex text not null default '',      -- উদাহরণ লেখা
  lim int,                          -- বাংলা অক্ষরের সীমা
  req boolean not null default false
);
create index if not exists idx_fields_sid_sort on fields (sid, sort);

-- ৬. ব্যবসার ধরন ও মুড
create table if not exists biz (
  name text primary key,
  mood text not null default '',
  sort int not null default 999
);

-- ৭. মেম্বার টেবিল (ফোন নম্বর প্রাইমারি কি)
create table if not exists members (
  phone text primary key check (phone ~ '^01[0-9]{9}$'),
  brand text not null default '',
  tagline text not null default '',
  biz text not null default '',
  c1 text not null default '' check (c1 = '' or c1 ~ '^#[0-9A-Fa-f]{6}$'),
  c2 text not null default '' check (c2 = '' or c2 ~ '^#[0-9A-Fa-f]{6}$'),
  c3 text not null default '' check (c3 = '' or c3 ~ '^#[0-9A-Fa-f]{6}$'),
  shape text not null default 'square' check (shape in ('wide','square','tall')),
  status text not null default 'new' check (status in ('new','paid','blocked','নতুন','পেইড','বন্ধ')),
  expiry date,
  joined date not null default (now() at time zone 'Asia/Dhaka')::date,
  last_seen timestamptz,
  made int not null default 0,
  note text not null default '',
  verified boolean not null default false,
  password_hash text not null default ''
);

-- ৮. পেমেন্ট হিস্ট্রি (EPS Transactions)
create table if not exists payments (
  id text primary key,              -- tx = millisecond timestamp + ৩ অঙ্ক
  created_at timestamptz not null default now(),
  phone text not null references members(phone),
  method text not null default 'EPS',
  trx text,                         -- EPS-এর transaction id
  amount numeric not null,
  status text not null default 'pending' check (status in ('pending','success','cancelled','অপেক্ষায়','সফল','বাতিল')),
  done_at timestamptz,
  by text not null default '',
  note text not null default ''
);
create unique index if not exists idx_payments_trx on payments (trx) where trx is not null;
create index if not exists idx_payments_phone_created on payments (phone, created_at desc);

-- ৯. হোম পেজ আপডেট পোস্ট
create table if not exists posts (
  id bigserial primary key,
  sort int not null default 999,
  img text not null default '',
  tag text not null default '',
  title text not null default '',
  link text not null default '',
  show boolean not null default true
);

-- ১০. যোগাযোগ ও গাইড
create table if not exists contact (
  key text primary key,
  value text not null default ''
);

-- ১১. পলিসি (শর্তাবলি, প্রাইভেসি, রিফান্ড)
create table if not exists policies (
  key text primary key,
  title text not null,
  text text not null default '',
  sort int not null default 999
);

-- ১২. ডিজাইন ঠিক করার লাইন (Fixes)
create table if not exists fixes (
  id bigserial primary key,
  sort int not null default 999,
  title text not null,
  line text not null default ''
);

-- ১৩. অ্যাক্টিভিটি লগ
create table if not exists log (
  id bigserial primary key,
  at timestamptz not null default now(),
  who text not null default '',
  action text not null default '',
  detail text not null default ''
);

-- ১৪. বেস কমান্ডের ভার্সন হিস্ট্রি
create table if not exists base_command_versions (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  created_by text not null default '',
  note text not null default '',
  body text not null
);

-- ১৫. SMS OTP টেবিল (নিরাপদ লগইনের জন্য)
create table if not exists otp_codes (
  phone text primary key check (phone ~ '^01[0-9]{9}$'),
  otp text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  created_at timestamptz not null default now()
);

-- ১৬. অ্যাডমিন সেশন টেবিল
create table if not exists admin_sessions (
  token text primary key,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

-- Row Level Security (RLS) সক্রিয়করণ
alter table settings enable row level security;
alter table texts enable row level security;
alter table cats enable row level security;
alter table styles enable row level security;
alter table fields enable row level security;
alter table biz enable row level security;
alter table members enable row level security;
alter table payments enable row level security;
alter table posts enable row level security;
alter table contact enable row level security;
alter table policies enable row level security;
alter table fixes enable row level security;
alter table log enable row level security;
alter table base_command_versions enable row level security;
alter table otp_codes enable row level security;
alter table admin_sessions enable row level security;

-- ১৭. বিকাশ-মডেল অথেনটিকেশন ও অ্যাডমিন ভেরিফিকেশন কন্ট্রোল RPC ফাংশনসমূহ
create or replace function check_member_auth(p_phone text)
returns json
language plpgsql
security definer
as $$
declare
  v_rec record;
begin
  select phone, verified, (password_hash is not null and password_hash <> '') as has_password
  into v_rec
  from members
  where phone = p_phone;
  
  if not found then
    return json_build_object('exists', false, 'verified', false, 'has_password', false);
  else
    return json_build_object('exists', true, 'verified', coalesce(v_rec.verified, false), 'has_password', coalesce(v_rec.has_password, false));
  end if;
end;
$$;

create or replace function set_member_password(p_phone text, p_password_hash text)
returns json
language plpgsql
security definer
as $$
begin
  update members 
  set password_hash = p_password_hash, verified = true 
  where phone = p_phone;
  
  if not found then
    insert into members (phone, verified, password_hash, status, joined, made)
    values (p_phone, true, p_password_hash, 'new', (now() at time zone 'Asia/Dhaka')::date, 0);
  end if;
  
  return json_build_object('ok', true);
end;
$$;

create or replace function verify_member_password(p_phone text, p_password_hash text)
returns json
language plpgsql
security definer
as $$
declare
  v_hash text;
  v_verified boolean;
begin
  select password_hash, verified into v_hash, v_verified
  from members
  where phone = p_phone;
  
  if not found then
    return json_build_object('ok', false, 'err', 'নম্বরটি পাওয়া যায়নি');
  end if;
  
  if v_hash is null or v_hash = '' then
    return json_build_object('ok', false, 'need_setup', true, 'err', 'পাসওয়ার্ড সেট করা নেই');
  end if;
  
  if v_hash = p_password_hash then
    update members set last_seen = now() where phone = p_phone;
    return json_build_object('ok', true);
  else
    return json_build_object('ok', false, 'err', 'ভুল পাসওয়ার্ড');
  end if;
end;
$$;

create or replace function admin_toggle_verify(p_phone text, p_verified boolean)
returns json
language plpgsql
security definer
as $$
begin
  update members set verified = p_verified where phone = p_phone;
  return json_build_object('ok', true, 'verified', p_verified);
end;
$$;

create or replace function admin_reset_member_auth(p_phone text)
returns json
language plpgsql
security definer
as $$
begin
  update members set verified = false, password_hash = '' where phone = p_phone;
  return json_build_object('ok', true);
end;
$$;

create or replace function get_members_auth_map()
returns json
language sql
security definer
as $$
  select coalesce(
    json_object_agg(
      phone, 
      json_build_object(
        'verified', coalesce(verified, false), 
        'has_password', (password_hash is not null and password_hash <> '')
      )
    ),
    '{}'::json
  )
  from members;
$$;

grant execute on function check_member_auth(text) to anon, authenticated, service_role;
grant execute on function set_member_password(text, text) to anon, authenticated, service_role;
grant execute on function verify_member_password(text, text) to anon, authenticated, service_role;
grant execute on function admin_toggle_verify(text, boolean) to anon, authenticated, service_role;
grant execute on function admin_reset_member_auth(text) to anon, authenticated, service_role;
grant execute on function get_members_auth_map() to anon, authenticated, service_role;
