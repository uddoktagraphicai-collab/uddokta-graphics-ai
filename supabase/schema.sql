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
  password_hash text not null default '',
  logo_url text not null default '',
  brand_unlocked boolean not null default false
);

alter table if exists members add column if not exists brand_unlocked boolean not null default false;

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

-- ব্র্যান্ড এডিট আনলক টগল RPC
create or replace function admin_toggle_brand_unlock(p_phone text, p_unlocked boolean)
returns json
language plpgsql
security definer
as $$
begin
  update members
  set brand_unlocked = p_unlocked,
      note = case 
        when p_unlocked and coalesce(note, '') not like '%[UNLOCKED]%' then trim(coalesce(note, '') || ' [UNLOCKED]')
        when not p_unlocked then trim(replace(coalesce(note, ''), '[UNLOCKED]', ''))
        else note
      end
  where phone = p_phone;

  return json_build_object('ok', true, 'unlocked', p_unlocked);
end;
$$;

-- ১৬. উইথড্র / সেটেলমেন্ট টেবিল (EPS ও ম্যানুয়াল ফান্ড উত্তোলন হিসাব)
create table if not exists withdrawals (
  id text primary key,
  created_at timestamptz not null default now(),
  withdrawn_date date not null default (now() at time zone 'Asia/Dhaka')::date,
  amount numeric not null check (amount > 0),
  source text not null default 'EPS',
  method text not null default 'ব্যাংক ট্রান্সফার',
  reference text not null default '',
  note text not null default ''
);
create index if not exists idx_withdrawals_date on withdrawals (withdrawn_date desc, created_at desc);

-- ড্যাশবোর্ড পরিসংখ্যান RPC (আজকের আয়, সেলস, নতুন মেম্বার, রিনিউয়াল তালিকা ও EPS ব্যালেন্স/উইথড্র হিসাব)
create or replace function get_admin_dashboard_stats()
returns json
language plpgsql
security definer
as $$
declare
  v_today date := (now() at time zone 'Asia/Dhaka')::date;
  v_today_rev numeric := 0;
  v_today_sales int := 0;
  v_today_new_members int := 0;
  v_eps_rev numeric := 0;
  v_manual_rev numeric := 0;
  v_eps_withdrawn numeric := 0;
  v_all_withdrawn numeric := 0;
  v_expiring_members json;
begin
  select coalesce(sum(amount), 0), count(*)
  into v_today_rev, v_today_sales
  from payments
  where status in ('success', 'সফল', 'পেইড')
    and (coalesce(done_at, created_at) at time zone 'Asia/Dhaka')::date = v_today;

  select
    coalesce(sum(case when not (coalesce(by, '') = 'admin' or coalesce(trx, '') like 'MANUAL-%' or coalesce(method, '') like '%ম্যানু%' or coalesce(method, '') like '%উপহার%') then amount else 0 end), 0),
    coalesce(sum(case when (coalesce(by, '') = 'admin' or coalesce(trx, '') like 'MANUAL-%' or coalesce(method, '') like '%ম্যানু%' or coalesce(method, '') like '%উপহার%') then amount else 0 end), 0)
  into v_eps_rev, v_manual_rev
  from payments
  where status in ('success', 'সফল', 'পেইড');

  select
    coalesce(sum(case when upper(coalesce(source, 'EPS')) = 'EPS' then amount else 0 end), 0),
    coalesce(sum(amount), 0)
  into v_eps_withdrawn, v_all_withdrawn
  from withdrawals;

  select count(*)
  into v_today_new_members
  from members
  where joined = v_today;

  select coalesce(json_agg(t), '[]'::json)
  into v_expiring_members
  from (
    select phone, coalesce(brand, '') as brand, coalesce(biz, '') as biz, expiry::text, (expiry - v_today) as days_left
    from members
    where status in ('paid', 'পেইড')
      and expiry >= v_today
      and expiry <= (v_today + interval '15 days')::date
    order by expiry asc
    limit 10
  ) t;

  return json_build_object(
    'today_rev', v_today_rev,
    'today_sales', v_today_sales,
    'today_new_members', v_today_new_members,
    'eps_total_rev', v_eps_rev,
    'manual_total_rev', v_manual_rev,
    'eps_withdrawn', v_eps_withdrawn,
    'eps_available_balance', (v_eps_rev - v_eps_withdrawn),
    'total_withdrawn', v_all_withdrawn,
    'net_available_balance', ((v_eps_rev + v_manual_rev) - v_all_withdrawn),
    'expiring_members', coalesce(v_expiring_members, '[]'::json)
  );
end;
$$;

-- উইথড্র তালিকা ও ব্যালেন্স সামারি RPC
create or replace function admin_get_withdrawals()
returns json
language plpgsql
security definer
as $$
declare
  v_eps_rev numeric := 0;
  v_manual_rev numeric := 0;
  v_eps_withdrawn numeric := 0;
  v_all_withdrawn numeric := 0;
  v_list json;
begin
  select
    coalesce(sum(case when not (coalesce(by, '') = 'admin' or coalesce(trx, '') like 'MANUAL-%' or coalesce(method, '') like '%ম্যানু%' or coalesce(method, '') like '%উপহার%') then amount else 0 end), 0),
    coalesce(sum(case when (coalesce(by, '') = 'admin' or coalesce(trx, '') like 'MANUAL-%' or coalesce(method, '') like '%ম্যানু%' or coalesce(method, '') like '%উপহার%') then amount else 0 end), 0)
  into v_eps_rev, v_manual_rev
  from payments
  where status in ('success', 'সফল', 'পেইড');

  select
    coalesce(sum(case when upper(coalesce(source, 'EPS')) = 'EPS' then amount else 0 end), 0),
    coalesce(sum(amount), 0)
  into v_eps_withdrawn, v_all_withdrawn
  from withdrawals;

  select coalesce(json_agg(w), '[]'::json)
  into v_list
  from (
    select id, created_at, withdrawn_date::text as withdrawn_date, amount, source, method, reference, note
    from withdrawals
    order by withdrawn_date desc, created_at desc
  ) w;

  return json_build_object(
    'ok', true,
    'summary', json_build_object(
      'eps_rev', v_eps_rev,
      'manual_rev', v_manual_rev,
      'eps_withdrawn', v_eps_withdrawn,
      'eps_balance', (v_eps_rev - v_eps_withdrawn),
      'total_rev', (v_eps_rev + v_manual_rev),
      'total_withdrawn', v_all_withdrawn,
      'total_balance', ((v_eps_rev + v_manual_rev) - v_all_withdrawn)
    ),
    'list', coalesce(v_list, '[]'::json)
  );
end;
$$;

-- নতুন উইথড্র / সেটেলমেন্ট রেকর্ড যোগ করার RPC
create or replace function admin_add_withdrawal(
  p_amount numeric,
  p_source text default 'EPS',
  p_method text default 'ব্যাংক ট্রান্সফার',
  p_reference text default '',
  p_note text default '',
  p_date text default ''
)
returns json
language plpgsql
security definer
as $$
declare
  v_id text;
  v_date date;
  v_src text;
  v_meth text;
begin
  if p_amount is null or p_amount <= 0 then
    return json_build_object('ok', false, 'err', 'সঠিক টাকার পরিমাণ দিন (০-এর বেশি)');
  end if;

  v_id := 'wd' || floor(extract(epoch from now()) * 1000)::bigint::text || floor(random() * 900 + 100)::int::text;
  v_src := coalesce(nullif(trim(p_source), ''), 'EPS');
  v_meth := coalesce(nullif(trim(p_method), ''), 'ব্যাংক ট্রান্সফার');

  if trim(coalesce(p_date, '')) ~ '^\d{4}-\d{2}-\d{2}$' then
    v_date := trim(p_date)::date;
  else
    v_date := (now() at time zone 'Asia/Dhaka')::date;
  end if;

  insert into withdrawals (id, withdrawn_date, amount, source, method, reference, note)
  values (v_id, v_date, p_amount, v_src, v_meth, trim(coalesce(p_reference, '')), trim(coalesce(p_note, '')));

  insert into log (who, action, detail, at)
  values ('admin', 'উইথড্র / সেটেলমেন্ট রেকর্ড', format('টাকা: ৳%s · উৎস: %s · মাধ্যম: %s%s', p_amount, v_src, v_meth, case when trim(coalesce(p_reference, '')) <> '' then ' · রেফ: ' || trim(p_reference) else '' end), now());

  return json_build_object('ok', true, 'id', v_id);
end;
$$;

-- উইথড্র রেকর্ড ডিলিট করার RPC
create or replace function admin_delete_withdrawal(p_id text)
returns json
language plpgsql
security definer
as $$
declare
  v_row withdrawals%rowtype;
begin
  select * into v_row from withdrawals where id = trim(coalesce(p_id, ''));
  if not found then
    return json_build_object('ok', false, 'err', 'উইথড্র রেকর্ড পাওয়া যায়নি');
  end if;

  delete from withdrawals where id = v_row.id;

  insert into log (who, action, detail, at)
  values ('admin', 'উইথড্র রেকর্ড মুছে ফেলা হয়েছে', format('আইডি: %s · টাকা: ৳%s · উৎস: %s', v_row.id, v_row.amount, v_row.source), now());

  return json_build_object('ok', true);
end;
$$;

-- ১৭. লাইভ প্রোডাকশন ক্লিন রিসেট (সকল টেস্ট মেম্বার ও ট্রানজ্যাকশন ডেটা মুছে ফ্রেশ শুরু)
create or replace function admin_reset_test_data()
returns json
language plpgsql
security definer
as $$
declare
  v_del_pays int := 0;
  v_del_mems int := 0;
  v_del_otps int := 0;
  v_del_wds int := 0;
begin
  -- ১. প্রথমে পেমেন্ট ও উইথড্র হিস্ট্রি ডিলিট
  with p as (delete from payments where id is not null returning 1)
  select count(*) into v_del_pays from p;

  with w as (delete from withdrawals where id is not null returning 1)
  select count(*) into v_del_wds from w;

  -- ২. সব মেম্বার ডিলিট
  with m as (delete from members where phone is not null returning 1)
  select count(*) into v_del_mems from m;

  -- ৩. ওটিপি কোড ডিলিট
  with o as (delete from otp_codes where phone is not null returning 1)
  select count(*) into v_del_otps from o;

  -- ৪. স্টাইলের ব্যবহার কাউন্টার শূন্য করা
  update styles set used = 0 where id is not null;

  -- ৫. লগ ক্লিয়ার করে ফ্রেশ রিসেট এন্ট্রি রাখা
  delete from log where id is not null;
  insert into log (who, action, detail, at)
  values ('admin', 'সিস্টেম ফ্রেশ রিসেট', 'টেস্টিং মেম্বার, পেমেন্ট ও উইথড্র ডেটা মুছে প্রডাকশনের জন্য ফ্রেশ করা হয়েছে।', now());

  return json_build_object(
    'ok', true,
    'message', 'সব টেস্ট ডেটা সফলভাবে মুছে সিস্টেম ফ্রেশ করা হয়েছে',
    'deleted_payments', v_del_pays,
    'deleted_withdrawals', v_del_wds,
    'deleted_members', v_del_mems,
    'deleted_otps', v_del_otps
  );
end;
$$;

-- পাবলিক পেমেন্ট ও ট্র্যাকিং সেটিংস রিয়েলটাইম RPC (কোনো ক্যাশ ছাড়াই দাম, মেয়াদ, গেটওয়ে চার্জ % ও Meta Pixel ID রিটার্ন করে)
create or replace function get_public_pay_settings()
returns json
language plpgsql
security definer
as $$
declare
  v_price text;
  v_monthly text;
  v_days text;
  v_fee text;
  v_pixel text;
begin
  select value into v_price from settings where key = 'price';
  select value into v_monthly from settings where key = 'monthly';
  select value into v_days from settings where key = 'days';
  select value into v_fee from settings where key = 'gateway_fee';
  select value into v_pixel from settings where key = 'meta_pixel_id';

  return json_build_object(
    'ok', true,
    'price', coalesce(nullif(trim(v_price), ''), '399'),
    'monthly', coalesce(nullif(trim(v_monthly), ''), '33'),
    'days', coalesce(nullif(trim(v_days), ''), '365'),
    'gateway_fee', coalesce(nullif(trim(v_fee), ''), '0'),
    'meta_pixel_id', coalesce(trim(v_pixel), '')
  );
end;
$$;

grant execute on function check_member_auth(text) to anon, authenticated, service_role;
grant execute on function set_member_password(text, text) to anon, authenticated, service_role;
grant execute on function verify_member_password(text, text) to anon, authenticated, service_role;
grant execute on function admin_toggle_verify(text, boolean) to anon, authenticated, service_role;
grant execute on function admin_reset_member_auth(text) to anon, authenticated, service_role;
grant execute on function get_members_auth_map() to anon, authenticated, service_role;
grant execute on function admin_toggle_brand_unlock(text, boolean) to anon, authenticated, service_role;
grant execute on function get_admin_dashboard_stats() to anon, authenticated, service_role;
grant execute on function admin_reset_test_data() to anon, authenticated, service_role;
grant execute on function get_public_pay_settings() to anon, authenticated, service_role;
grant execute on function admin_get_withdrawals() to anon, authenticated, service_role;
grant execute on function admin_add_withdrawal(numeric, text, text, text, text, text) to anon, authenticated, service_role;
grant execute on function admin_delete_withdrawal(text) to anon, authenticated, service_role;

-- ১৮. BulkSMSBD লাইভ ব্যালেন্স, SMS ইউজেজ ট্র্যাকিং ও সিস্টেম হেলথ
create extension if not exists http with schema extensions;

create table if not exists public.sms_logs (
  id bigint generated always as identity primary key,
  phone text not null,
  kind text not null default 'OTP',
  parts integer not null default 1,
  cost numeric(10,2) not null default 0.35,
  status text not null default 'সফল',
  note text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists idx_sms_logs_created_at on public.sms_logs(created_at desc);
alter table public.sms_logs enable row level security;

create or replace function public.fn_log_otp_sms()
returns trigger
language plpgsql
security definer
as $$
declare
  v_tpl text;
  v_sample text;
  v_len int;
  v_is_unicode boolean;
  v_parts int := 1;
  v_rate numeric(10,2) := 0.35;
  v_rate_txt text;
  v_has_tok text;
begin
  if tg_op = 'UPDATE' then
    if new.otp is not distinct from old.otp and new.expires_at is not distinct from old.expires_at then
      return new;
    end if;
  end if;

  select value into v_has_tok from public.settings where key = 'sms_api_token' limit 1;
  if coalesce(trim(v_has_tok), '') = '' then
    return new;
  end if;

  select value into v_tpl from public.settings where key = 'sms_otp_template' limit 1;
  v_tpl := coalesce(nullif(trim(v_tpl), ''), 'উদ্যোক্তা গ্রাফিক্স AI তে আপনার ওটিপি কোড: {otp}। মেয়াদ ৫ মিনিট।');
  v_sample := replace(v_tpl, '{otp}', coalesce(new.otp, '1234'));
  v_len := char_length(v_sample);
  v_is_unicode := v_sample ~ '[^\x00-\x7F]';
  if v_is_unicode then
    v_parts := case when v_len <= 70 then 1 else greatest(1, ceil(v_len::numeric / 67.0)::int) end;
  else
    v_parts := case when v_len <= 160 then 1 else greatest(1, ceil(v_len::numeric / 153.0)::int) end;
  end if;

  select value into v_rate_txt from public.settings where key = 'sms_rate' limit 1;
  begin
    if v_rate_txt is not null and trim(v_rate_txt) <> '' and trim(v_rate_txt)::numeric > 0 then
      v_rate := trim(v_rate_txt)::numeric;
    end if;
  exception when others then
    v_rate := 0.35;
  end;

  insert into public.sms_logs(phone, kind, parts, cost, status, note)
  values (coalesce(new.phone, ''), 'OTP', v_parts, round(v_parts * v_rate, 2), 'সফল', 'অটো ওটিপি ভেরিফিকেশন');

  return new;
end;
$$;

drop trigger if exists trg_log_otp_sms on public.otp_codes;
create trigger trg_log_otp_sms
after insert or update on public.otp_codes
for each row execute function public.fn_log_otp_sms();

create or replace function public.admin_get_live_health(p_tok text)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_t0 timestamptz := clock_timestamp();
  v_valid boolean;
  v_sms_token text;
  v_sms_sender text;
  v_sms_rate_txt text;
  v_sms_rate numeric(10,4) := 0.35;
  v_sms_bal numeric(12,2) := null;
  v_sms_ok boolean := false;
  v_sms_err text := null;
  v_sms_remaining int := null;
  v_total_sent int := 0;
  v_total_dispatches int := 0;
  v_today_sent int := 0;
  v_month_sent int := 0;
  v_total_cost numeric(12,2) := 0;
  v_recent jsonb := '[]'::jsonb;
  v_http_res extensions.http_response;
  v_body jsonb;
  v_raw_bal text;
  v_cld_name text;
  v_cld_key text;
  v_cld_sec text;
  v_cld_ok boolean := false;
  v_cld_ready boolean := false;
  v_cld_resources int := 0;
  v_cld_storage_mb numeric(12,1) := 0;
  v_cld_used_pct numeric(6,1) := 0;
  v_auth_b64 text;
  v_db_ms int;
  v_today_start timestamptz;
  v_month_start timestamptz;
begin
  select exists(
    select 1 from public.admin_sessions
    where token = p_tok and expires_at > now()
  ) into v_valid;

  if not v_valid then
    return jsonb_build_object('ok', false, 'auth', false, 'err', 'অ্যাডমিন সেশন বৈধ নয়');
  end if;

  select value into v_sms_token from public.settings where key = 'sms_api_token' limit 1;
  select value into v_sms_sender from public.settings where key = 'sms_sender_id' limit 1;
  select value into v_sms_rate_txt from public.settings where key = 'sms_rate' limit 1;

  begin
    if v_sms_rate_txt is not null and trim(v_sms_rate_txt) <> '' and trim(v_sms_rate_txt)::numeric > 0 then
      v_sms_rate := trim(v_sms_rate_txt)::numeric;
    end if;
  exception when others then
    v_sms_rate := 0.35;
  end;

  if coalesce(trim(v_sms_token), '') <> '' then
    begin
      perform extensions.http_set_curlopt('CURLOPT_TIMEOUT', '6');
      perform extensions.http_set_curlopt('CURLOPT_CONNECTTIMEOUT', '4');
      select * into v_http_res
      from extensions.http_get('https://bulksmsbd.net/api/getBalanceApi?api_key=' || trim(v_sms_token));

      if v_http_res.status >= 200 and v_http_res.status < 300 and v_http_res.content is not null then
        begin
          v_body := v_http_res.content::jsonb;
          v_raw_bal := coalesce(
            v_body->>'balance',
            v_body->>'Balance',
            v_body->'data'->>'balance',
            v_body->>'credit'
          );
          if v_raw_bal is not null and trim(v_raw_bal) <> '' then
            v_sms_bal := regexp_replace(v_raw_bal, '[^0-9.\-]', '', 'g')::numeric;
            v_sms_ok := true;
          else
            v_sms_err := coalesce(v_body->>'error_message', v_body->>'message', 'ব্যালেন্স পাওয়া যায়নি');
          end if;
        exception when others then
          v_raw_bal := (regexp_match(v_http_res.content, '([0-9]+(?:\.[0-9]+)?)'))[1];
          if v_raw_bal is not null then
            v_sms_bal := v_raw_bal::numeric;
            v_sms_ok := true;
          else
            v_sms_err := 'রেসপন্স পড়া যায়নি';
          end if;
        end;
      else
        v_sms_err := 'HTTP ' || coalesce(v_http_res.status::text, '0');
      end if;
    exception when others then
      v_sms_err := sqlerrm;
    end;
  end if;

  if v_sms_bal is not null and v_sms_bal >= 0 and v_sms_rate > 0 then
    v_sms_remaining := floor(v_sms_bal / v_sms_rate)::int;
  end if;

  v_today_start := date_trunc('day', now() at time zone 'Asia/Dhaka') at time zone 'Asia/Dhaka';
  v_month_start := date_trunc('month', now() at time zone 'Asia/Dhaka') at time zone 'Asia/Dhaka';

  select
    coalesce(sum(parts), 0)::int,
    count(*)::int,
    coalesce(sum(case when created_at >= v_today_start then parts else 0 end), 0)::int,
    coalesce(sum(case when created_at >= v_month_start then parts else 0 end), 0)::int,
    coalesce(sum(cost), 0)::numeric(12,2)
  into v_total_sent, v_total_dispatches, v_today_sent, v_month_sent, v_total_cost
  from public.sms_logs;

  select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) into v_recent
  from (
    select id, phone, kind, parts, cost, status, note, created_at
    from public.sms_logs
    order by created_at desc
    limit 20
  ) t;

  select value into v_cld_name from public.settings where key = 'cloudinary_cloud_name' limit 1;
  select value into v_cld_key from public.settings where key = 'cloudinary_api_key' limit 1;
  select value into v_cld_sec from public.settings where key = 'cloudinary_api_secret' limit 1;

  if coalesce(trim(v_cld_name), '') <> '' and coalesce(trim(v_cld_key), '') <> '' and coalesce(trim(v_cld_sec), '') <> '' then
    v_cld_ready := true;
    begin
      v_auth_b64 := replace(encode(convert_to(trim(v_cld_key) || ':' || trim(v_cld_sec), 'UTF8'), 'base64'), E'\n', '');
      select * into v_http_res
      from extensions.http((
        'GET',
        'https://api.cloudinary.com/v1_1/' || trim(v_cld_name) || '/usage',
        array[extensions.http_header('Authorization', 'Basic ' || v_auth_b64)],
        null,
        null
      )::extensions.http_request);

      if v_http_res.status >= 200 and v_http_res.status < 300 and v_http_res.content is not null then
        v_body := v_http_res.content::jsonb;
        v_cld_resources := coalesce((v_body->>'resources')::int, 0);
        v_cld_storage_mb := round(coalesce((v_body->'storage'->>'usage')::numeric, 0) / 1048576.0, 1);
        v_cld_used_pct := round(coalesce((v_body->'credits'->>'used_percent')::numeric, (v_body->'storage'->>'used_percent')::numeric, 0), 1);
        v_cld_ok := true;
      end if;
    exception when others then
      v_cld_ok := false;
    end;
  end if;

  v_db_ms := greatest(1, extract(milliseconds from (clock_timestamp() - v_t0))::int);

  return jsonb_build_object(
    'ok', true,
    'checked_at', now(),
    'supabase', jsonb_build_object('ok', true, 'ms', v_db_ms),
    'sms', jsonb_build_object(
      'ready', coalesce(trim(v_sms_token), '') <> '',
      'ok', v_sms_ok,
      'balance', v_sms_bal,
      'rate', v_sms_rate,
      'estSms', v_sms_remaining,
      'remaining_sms', v_sms_remaining,
      'total_sent', v_total_sent,
      'total_dispatches', v_total_dispatches,
      'today_sent', v_today_sent,
      'month_sent', v_month_sent,
      'total_cost', v_total_cost,
      'senderId', coalesce(v_sms_sender, ''),
      'recent', v_recent,
      'err', v_sms_err
    ),
    'cloudinary', jsonb_build_object(
      'ready', v_cld_ready,
      'ok', v_cld_ok,
      'cloudName', coalesce(v_cld_name, ''),
      'resources', v_cld_resources,
      'storageMB', v_cld_storage_mb,
      'usedPct', v_cld_used_pct
    )
  );
end;
$$;

create or replace function public.admin_log_sms(
  p_tok text,
  p_phone text,
  p_kind text default 'TEST',
  p_parts integer default 1,
  p_status text default 'সফল',
  p_note text default ''
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_valid boolean;
  v_rate numeric(10,2) := 0.35;
  v_rate_txt text;
  v_parts int := greatest(1, coalesce(p_parts, 1));
begin
  select exists(
    select 1 from public.admin_sessions
    where token = p_tok and expires_at > now()
  ) into v_valid;

  if not v_valid then
    return jsonb_build_object('ok', false, 'auth', false, 'err', 'অ্যাডমিন সেশন বৈধ নয়');
  end if;

  select value into v_rate_txt from public.settings where key = 'sms_rate' limit 1;
  begin
    if v_rate_txt is not null and trim(v_rate_txt) <> '' and trim(v_rate_txt)::numeric > 0 then
      v_rate := trim(v_rate_txt)::numeric;
    end if;
  exception when others then
    v_rate := 0.35;
  end;

  insert into public.sms_logs(phone, kind, parts, cost, status, note)
  values (
    coalesce(trim(p_phone), ''),
    coalesce(nullif(trim(p_kind), ''), 'TEST'),
    v_parts,
    round(v_parts * v_rate, 2),
    coalesce(nullif(trim(p_status), ''), 'সফল'),
    coalesce(trim(p_note), '')
  );

  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.admin_save_sms_rate(p_tok text, p_rate numeric)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_valid boolean;
begin
  select exists(
    select 1 from public.admin_sessions
    where token = p_tok and expires_at > now()
  ) into v_valid;

  if not v_valid then
    return jsonb_build_object('ok', false, 'auth', false, 'err', 'অ্যাডমিন সেশন বৈধ নয়');
  end if;

  if p_rate is null or p_rate <= 0 or p_rate > 50 then
    return jsonb_build_object('ok', false, 'err', 'সঠিক SMS রেট দিন (০.০১ থেকে ৫০ টাকার মধ্যে)');
  end if;

  insert into public.settings(key, value)
  values ('sms_rate', p_rate::text)
  on conflict (key) do update set value = excluded.value;

  return jsonb_build_object('ok', true, 'rate', p_rate);
end;
$$;

grant execute on function public.admin_get_live_health(text) to anon, authenticated, service_role;
grant execute on function public.admin_log_sms(text, text, text, integer, text, text) to anon, authenticated, service_role;
grant execute on function public.admin_save_sms_rate(text, numeric) to anon, authenticated, service_role;

-- ১৯. অল-ইন-ওয়ান অ্যাডমিন মেম্বার যোগ (অটো মেয়াদ + পাসওয়ার্ড + ম্যানুয়াল ভেরিফাই + ম্যানুয়াল পেইড অর্ডার)
create or replace function public.admin_add_member_full(
  p_tok text,
  p_phone text,
  p_type text default 'paid',
  p_expiry date default null,
  p_days integer default 365,
  p_amount numeric default 0,
  p_method text default 'ম্যানুয়াল (বিকাশ)',
  p_trx text default '',
  p_note text default '',
  p_password text default '',
  p_verified boolean default true,
  p_create_order boolean default true
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_valid boolean;
  v_phone text;
  v_today date;
  v_is_paid boolean;
  v_expiry date := null;
  v_pass text;
  v_hash text := '';
  v_verified boolean;
  v_amt numeric(12,2);
  v_method text;
  v_trx text;
  v_note text;
  v_pay_id text := null;
begin
  select exists(
    select 1 from public.admin_sessions
    where token = p_tok and expires_at > now()
  ) into v_valid;

  if not v_valid then
    return jsonb_build_object('ok', false, 'auth', false, 'err', 'অ্যাডমিন সেশন বৈধ নয়');
  end if;

  v_phone := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  if length(v_phone) = 13 and left(v_phone, 2) = '88' then
    v_phone := substring(v_phone from 3);
  end if;
  if v_phone !~ '^01[0-9]{9}$' then
    return jsonb_build_object('ok', false, 'err', '১১ সংখ্যার সঠিক বাংলাদেশি মোবাইল নম্বর দিন');
  end if;

  if exists (select 1 from public.members where phone = v_phone) then
    return jsonb_build_object('ok', false, 'err', 'এই নম্বরে আগেই মেম্বার আছে');
  end if;

  v_today := (now() at time zone 'Asia/Dhaka')::date;
  v_is_paid := coalesce(p_type, 'paid') in ('paid', 'free');

  if v_is_paid then
    if p_expiry is not null then
      v_expiry := p_expiry;
    else
      v_expiry := v_today + greatest(1, coalesce(p_days, 365));
    end if;
  end if;

  v_pass := trim(coalesce(p_password, ''));
  if v_pass <> '' then
    if char_length(v_pass) < 4 then
      return jsonb_build_object('ok', false, 'err', 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে');
    end if;
    v_hash := encode(extensions.digest(convert_to(v_pass, 'UTF8'), 'sha256'), 'hex');
    v_verified := true;
  else
    v_verified := coalesce(p_verified, false);
  end if;

  v_note := trim(coalesce(p_note, ''));
  v_amt := greatest(0, coalesce(p_amount, 0));

  insert into public.members (phone, status, expiry, joined, made, note, verified, password_hash)
  values (
    v_phone,
    case when v_is_paid then 'paid' else 'new' end,
    v_expiry,
    v_today,
    0,
    v_note,
    v_verified,
    v_hash
  );

  if coalesce(p_type, 'paid') = 'paid' and coalesce(p_create_order, true) and v_amt > 0 then
    v_method := coalesce(nullif(trim(p_method), ''), 'ম্যানুয়াল (বিকাশ)');
    v_trx := coalesce(nullif(trim(p_trx), ''), 'MANUAL-' || to_char(now() at time zone 'Asia/Dhaka', 'YYMMDDHH24MISS'));
    v_pay_id := 'tx' || floor(extract(epoch from clock_timestamp()) * 1000)::bigint::text || floor(random() * 900 + 100)::int::text;

    insert into public.payments (id, created_at, phone, method, trx, amount, status, done_at, by, note)
    values (
      v_pay_id,
      now(),
      v_phone,
      v_method,
      v_trx,
      v_amt,
      'success',
      now(),
      'admin',
      coalesce(nullif(v_note, ''), 'অ্যাডমিন ম্যানুয়াল পেইড এন্ট্রি')
    );
  end if;

  insert into public.log (who, action, detail, at)
  values (
    'admin',
    'মেম্বার যোগ',
    format('ফোন: %s · টাইপ: %s · মেয়াদ: %s · ভেরিফাইড: %s%s',
      v_phone,
      coalesce(p_type, 'paid'),
      coalesce(v_expiry::text, 'নেই'),
      case when v_verified then 'হ্যাঁ' else 'না' end,
      case when v_pay_id is not null then format(' · অর্ডার: #%s (৳%s)', v_pay_id, v_amt) else '' end
    ),
    now()
  );

  return jsonb_build_object(
    'ok', true,
    'phone', v_phone,
    'status', case when v_is_paid then 'paid' else 'new' end,
    'expiry', v_expiry,
    'verified', v_verified,
    'has_password', v_hash <> '',
    'order_id', v_pay_id
  );
end;
$$;

-- ২০. বিদ্যমান মেম্বারকে প্রোফাইল থেকে পেইড করলে ম্যানুয়াল পেইড অর্ডার তৈরি RPC
create or replace function public.admin_create_manual_order(
  p_tok text,
  p_phone text,
  p_amount numeric,
  p_method text default 'ম্যানুয়াল (বিকাশ)',
  p_trx text default '',
  p_note text default ''
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_valid boolean;
  v_phone text;
  v_amt numeric(12,2);
  v_method text;
  v_trx text;
  v_pay_id text;
begin
  select exists(
    select 1 from public.admin_sessions
    where token = p_tok and expires_at > now()
  ) into v_valid;

  if not v_valid then
    return jsonb_build_object('ok', false, 'auth', false, 'err', 'অ্যাডমিন সেশন বৈধ নয়');
  end if;

  v_phone := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  if length(v_phone) = 13 and left(v_phone, 2) = '88' then
    v_phone := substring(v_phone from 3);
  end if;

  v_amt := greatest(0, coalesce(p_amount, 0));
  if v_amt <= 0 then
    return jsonb_build_object('ok', false, 'err', 'সঠিক টাকার পরিমাণ দিন');
  end if;

  v_method := coalesce(nullif(trim(p_method), ''), 'ম্যানুয়াল (বিকাশ)');
  v_trx := coalesce(nullif(trim(p_trx), ''), 'MANUAL-' || to_char(now() at time zone 'Asia/Dhaka', 'YYMMDDHH24MISS'));
  v_pay_id := 'tx' || floor(extract(epoch from clock_timestamp()) * 1000)::bigint::text || floor(random() * 900 + 100)::int::text;

  insert into public.payments (id, created_at, phone, method, trx, amount, status, done_at, by, note)
  values (
    v_pay_id,
    now(),
    v_phone,
    v_method,
    v_trx,
    v_amt,
    'success',
    now(),
    'admin',
    coalesce(nullif(trim(p_note), ''), 'প্রোফাইল থেকে ম্যানুয়াল পেইড অর্ডার')
  );

  insert into public.log (who, action, detail, at)
  values ('admin', 'ম্যানুয়াল পেইড অর্ডার', format('ফোন: %s · টাকা: ৳%s · মাধ্যম: %s · আইডি: #%s', v_phone, v_amt, v_method, v_pay_id), now());

  return jsonb_build_object('ok', true, 'order_id', v_pay_id);
end;
$$;

-- ২১. অ্যাডমিন প্রোফাইল থেকে সরাসরি মেম্বারের পাসওয়ার্ড সেট/রিসেট RPC
create or replace function public.admin_set_member_password(
  p_tok text,
  p_phone text,
  p_password text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_valid boolean;
  v_pass text;
  v_hash text;
begin
  select exists(
    select 1 from public.admin_sessions
    where token = p_tok and expires_at > now()
  ) into v_valid;

  if not v_valid then
    return jsonb_build_object('ok', false, 'auth', false, 'err', 'অ্যাডমিন সেশন বৈধ নয়');
  end if;

  v_pass := trim(coalesce(p_password, ''));
  if char_length(v_pass) < 4 then
    return jsonb_build_object('ok', false, 'err', 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে');
  end if;

  v_hash := encode(extensions.digest(convert_to(v_pass, 'UTF8'), 'sha256'), 'hex');

  update public.members
  set password_hash = v_hash, verified = true
  where phone = p_phone;

  if not found then
    return jsonb_build_object('ok', false, 'err', 'মেম্বার পাওয়া যায়নি');
  end if;

  insert into public.log (who, action, detail, at)
  values ('admin', 'মেম্বার পাসওয়ার্ড সেট', format('ফোন: %s (ভেরিফাইড ও পাসওয়ার্ড আপডেট)', p_phone), now());

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.admin_add_member_full(text, text, text, date, integer, numeric, text, text, text, text, boolean, boolean) to anon, authenticated, service_role;
grant execute on function public.admin_create_manual_order(text, text, numeric, text, text, text) to anon, authenticated, service_role;
grant execute on function public.admin_set_member_password(text, text, text) to anon, authenticated, service_role;

-- ২২. সিকিউরিটি হার্ডেনিং (মেম্বার সেশন, OTP সেটআপ টোকেন ও সব Admin RPC টোকেন লক)
create table if not exists public.member_sessions (
  token text primary key,
  phone text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days')
);
create index if not exists idx_member_sessions_phone on public.member_sessions(phone);
alter table public.member_sessions enable row level security;

create table if not exists public.otp_verified_tokens (
  token text primary key,
  phone text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '10 minutes')
);
create index if not exists idx_otp_verified_tokens_phone on public.otp_verified_tokens(phone);
alter table public.otp_verified_tokens enable row level security;

create or replace function public.is_valid_admin_token(p_tok text)
returns boolean
language sql
security definer
as $$
  select exists(
    select 1 from public.admin_sessions
    where token = p_tok and expires_at > now()
  );
$$;

create or replace function public.verify_member_otp_and_grant(p_phone text, p_otp text)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_phone text;
  v_otp text;
  v_row record;
  v_setup_tok text;
begin
  v_phone := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  if length(v_phone) = 13 and left(v_phone, 2) = '88' then v_phone := substring(v_phone from 3); end if;
  v_otp := trim(coalesce(p_otp, ''));
  if v_phone !~ '^01[0-9]{9}$' or v_otp = '' then
    return jsonb_build_object('ok', false, 'err', 'সঠিক নম্বর ও ওটিপি কোড দিন');
  end if;
  select * into v_row from public.otp_codes where phone = v_phone limit 1;
  if not found then return jsonb_build_object('ok', false, 'err', 'কোনো ওটিপি অনুরোধ পাওয়া যায়নি। আবার চেষ্টা করুন।'); end if;
  if v_row.expires_at < now() then
    delete from public.otp_codes where phone = v_phone;
    return jsonb_build_object('ok', false, 'err', 'ওটিপির মেয়াদ শেষ হয়ে গেছে। আবার ওটিপি নিন।');
  end if;
  if coalesce(v_row.attempts, 0) >= 5 then
    delete from public.otp_codes where phone = v_phone;
    return jsonb_build_object('ok', false, 'err', 'অনেকবার ভুল কোড দেওয়া হয়েছে। অনুগ্রহ করে নতুন ওটিপি নিন।');
  end if;
  if v_row.otp <> v_otp then
    update public.otp_codes set attempts = coalesce(attempts, 0) + 1 where phone = v_phone;
    return jsonb_build_object('ok', false, 'err', 'ভুল ওটিপি কোড! আপনার মোবাইলে আসা সঠিক কোডটি দিন।');
  end if;
  delete from public.otp_codes where phone = v_phone;
  delete from public.otp_verified_tokens where phone = v_phone or expires_at < now();
  v_setup_tok := 'otp_' || encode(extensions.gen_random_bytes(24), 'hex');
  insert into public.otp_verified_tokens (token, phone, expires_at) values (v_setup_tok, v_phone, now() + interval '10 minutes');
  return jsonb_build_object('ok', true, 'setup_token', v_setup_tok);
end;
$$;

drop function if exists public.set_member_password(text, text);
create or replace function public.set_member_password(p_phone text, p_password_hash text, p_setup_token text default null)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_phone text;
  v_hash text;
  v_mem record;
  v_tok_valid boolean := false;
  v_sess_tok text;
begin
  v_phone := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  if length(v_phone) = 13 and left(v_phone, 2) = '88' then v_phone := substring(v_phone from 3); end if;
  v_hash := trim(coalesce(p_password_hash, ''));
  if v_phone !~ '^01[0-9]{9}$' or length(v_hash) < 16 then
    return jsonb_build_object('ok', false, 'err', 'অবৈধ অনুরোধ');
  end if;
  if coalesce(trim(p_setup_token), '') <> '' then
    select exists(select 1 from public.otp_verified_tokens where token = trim(p_setup_token) and phone = v_phone and expires_at > now()) into v_tok_valid;
  end if;
  select phone, verified, password_hash into v_mem from public.members where phone = v_phone;
  if not v_tok_valid then
    if not found or not coalesce(v_mem.verified, false) or coalesce(trim(v_mem.password_hash), '') <> '' then
      return jsonb_build_object('ok', false, 'err', 'অনুমোদিত নয়! পাসওয়ার্ড সেট বা রিসেট করতে ওটিপি যাচাই প্রয়োজন।');
    end if;
  else
    delete from public.otp_verified_tokens where token = trim(p_setup_token);
  end if;
  update public.members set password_hash = v_hash, verified = true, last_seen = now() where phone = v_phone;
  if not found then
    insert into public.members (phone, verified, password_hash, status, joined, made, last_seen)
    values (v_phone, true, v_hash, 'new', (now() at time zone 'Asia/Dhaka')::date, 0, now());
  end if;
  delete from public.member_sessions where expires_at < now();
  v_sess_tok := 'ms_' || encode(extensions.gen_random_bytes(24), 'hex');
  insert into public.member_sessions (token, phone, expires_at) values (v_sess_tok, v_phone, now() + interval '30 days');
  return jsonb_build_object('ok', true, 'session_token', v_sess_tok);
end;
$$;

create or replace function public.verify_member_password(p_phone text, p_password_hash text)
returns json
language plpgsql
security definer
as $$
declare
  v_hash text;
  v_verified boolean;
  v_sess_tok text;
begin
  select password_hash, verified into v_hash, v_verified from public.members where phone = p_phone;
  if not found then return json_build_object('ok', false, 'err', 'নম্বরটি পাওয়া যায়নি'); end if;
  if v_hash is null or v_hash = '' then return json_build_object('ok', false, 'need_setup', true, 'err', 'পাসওয়ার্ড সেট করা নেই'); end if;
  if v_hash = p_password_hash then
    update public.members set last_seen = now() where phone = p_phone;
    delete from public.member_sessions where expires_at < now();
    v_sess_tok := 'ms_' || encode(extensions.gen_random_bytes(24), 'hex');
    insert into public.member_sessions (token, phone, expires_at) values (v_sess_tok, p_phone, now() + interval '30 days');
    return json_build_object('ok', true, 'session_token', v_sess_tok);
  else
    return json_build_object('ok', false, 'err', 'ভুল পাসওয়ার্ড');
  end if;
end;
$$;

create or replace function public.verify_member_session(p_phone text, p_session_token text)
returns jsonb
language plpgsql
security definer
as $$
declare v_ok boolean;
begin
  if coalesce(trim(p_phone), '') = '' or coalesce(trim(p_session_token), '') = '' then
    return jsonb_build_object('ok', false);
  end if;
  select exists(select 1 from public.member_sessions where token = trim(p_session_token) and phone = trim(p_phone) and expires_at > now()) into v_ok;
  return jsonb_build_object('ok', v_ok);
end;
$$;

create or replace function public.logout_member_session(p_session_token text)
returns jsonb
language plpgsql
security definer
as $$
begin
  if coalesce(trim(p_session_token), '') <> '' then
    delete from public.member_sessions where token = trim(p_session_token);
  end if;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.lock_member_brand(p_phone text, p_session_token text)
returns jsonb
language plpgsql
security definer
as $$
declare v_ok boolean;
begin
  select exists(select 1 from public.member_sessions where token = trim(coalesce(p_session_token, '')) and phone = trim(coalesce(p_phone, '')) and expires_at > now()) into v_ok;
  if not v_ok then return jsonb_build_object('ok', false, 'err', 'সেশন বৈধ নয়'); end if;
  update public.members set brand_unlocked = false, note = trim(replace(coalesce(note, ''), '[UNLOCKED]', '')) where phone = trim(p_phone);
  return jsonb_build_object('ok', true);
end;
$$;

drop function if exists public.admin_toggle_verify(text, boolean);
create or replace function public.admin_toggle_verify(p_tok text, p_phone text, p_verified boolean)
returns jsonb language plpgsql security definer as $$
begin
  if not public.is_valid_admin_token(p_tok) then return jsonb_build_object('ok', false, 'auth', false, 'err', 'অ্যাডমিন সেশন বৈধ নয়'); end if;
  update public.members set verified = p_verified where phone = p_phone;
  return jsonb_build_object('ok', true, 'verified', p_verified);
end; $$;

drop function if exists public.admin_reset_member_auth(text);
create or replace function public.admin_reset_member_auth(p_tok text, p_phone text)
returns jsonb language plpgsql security definer as $$
begin
  if not public.is_valid_admin_token(p_tok) then return jsonb_build_object('ok', false, 'auth', false, 'err', 'অ্যাডমিন সেশন বৈধ নয়'); end if;
  update public.members set verified = false, password_hash = '' where phone = p_phone;
  delete from public.otp_codes where phone = p_phone;
  delete from public.member_sessions where phone = p_phone;
  delete from public.otp_verified_tokens where phone = p_phone;
  return jsonb_build_object('ok', true);
end; $$;

drop function if exists public.get_members_auth_map();
create or replace function public.get_members_auth_map(p_tok text)
returns jsonb language plpgsql security definer as $$
declare v_res jsonb;
begin
  if not public.is_valid_admin_token(p_tok) then return jsonb_build_object('ok', false, 'auth', false, 'err', 'অ্যাডমিন সেশন বৈধ নয়'); end if;
  select coalesce(jsonb_object_agg(phone, jsonb_build_object('verified', coalesce(verified, false), 'has_password', (password_hash is not null and password_hash <> ''), 'brand_unlocked', coalesce(brand_unlocked, false))), '{}'::jsonb) into v_res from public.members;
  return v_res;
end; $$;

drop function if exists public.admin_toggle_brand_unlock(text, boolean);
create or replace function public.admin_toggle_brand_unlock(p_tok text, p_phone text, p_unlocked boolean)
returns jsonb language plpgsql security definer as $$
declare v_note text;
begin
  if not public.is_valid_admin_token(p_tok) then return jsonb_build_object('ok', false, 'auth', false, 'err', 'অ্যাডমিন সেশন বৈধ নয়'); end if;
  select coalesce(note, '') into v_note from public.members where phone = p_phone;
  if p_unlocked then
    if position('[UNLOCKED]' in v_note) = 0 then v_note := trim(v_note || ' [UNLOCKED]'); end if;
  else
    v_note := trim(replace(v_note, '[UNLOCKED]', ''));
  end if;
  update public.members set brand_unlocked = p_unlocked, note = v_note where phone = p_phone;
  return jsonb_build_object('ok', true, 'brand_unlocked', p_unlocked);
end; $$;

drop function if exists public.get_admin_dashboard_stats();
create or replace function public.get_admin_dashboard_stats(p_tok text)
returns jsonb language plpgsql security definer as $$
declare
  v_today date; v_today_rev numeric := 0; v_today_sales int := 0; v_today_new_members int := 0;
  v_eps_total_rev numeric := 0; v_manual_total_rev numeric := 0; v_eps_withdrawn numeric := 0; v_total_withdrawn numeric := 0; v_expiring jsonb;
begin
  if not public.is_valid_admin_token(p_tok) then return jsonb_build_object('ok', false, 'auth', false, 'err', 'অ্যাডমিন সেশন বৈধ নয়'); end if;
  v_today := (now() at time zone 'Asia/Dhaka')::date;
  select coalesce(sum(amount), 0), count(*) into v_today_rev, v_today_sales from public.payments where status in ('success', 'সফল', 'paid', 'পেইড') and (coalesce(done_at, created_at) at time zone 'Asia/Dhaka')::date = v_today;
  select count(*) into v_today_new_members from public.members where joined = v_today;
  select coalesce(sum(case when upper(coalesce(method, '')) like '%EPS%' then amount else 0 end), 0), coalesce(sum(case when upper(coalesce(method, '')) not like '%EPS%' then amount else 0 end), 0) into v_eps_total_rev, v_manual_total_rev from public.payments where status in ('success', 'সফল', 'paid', 'পেইড');
  select coalesce(sum(case when upper(coalesce(source, 'EPS')) = 'EPS' then amount else 0 end), 0), coalesce(sum(amount), 0) into v_eps_withdrawn, v_total_withdrawn from public.withdrawals;
  select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) into v_expiring from (select phone, brand, biz, expiry, (expiry - v_today) as days_left from public.members where status in ('paid', 'পেইড') and expiry is not null and expiry >= v_today and expiry <= (v_today + interval '7 days')::date order by expiry asc limit 15) t;
  return jsonb_build_object('ok', true, 'today_rev', v_today_rev, 'today_sales', v_today_sales, 'today_new_members', v_today_new_members, 'eps_total_rev', v_eps_total_rev, 'manual_total_rev', v_manual_total_rev, 'eps_withdrawn', v_eps_withdrawn, 'eps_available_balance', (v_eps_total_rev - v_eps_withdrawn), 'total_withdrawn', v_total_withdrawn, 'expiring_members', v_expiring);
end; $$;

drop function if exists public.admin_get_withdrawals();
create or replace function public.admin_get_withdrawals(p_tok text)
returns jsonb language plpgsql security definer as $$
declare v_list jsonb; v_eps_rev numeric := 0; v_manual_rev numeric := 0; v_eps_wd numeric := 0; v_manual_wd numeric := 0;
begin
  if not public.is_valid_admin_token(p_tok) then return jsonb_build_object('ok', false, 'auth', false, 'err', 'অ্যাডমিন সেশন বৈধ নয়'); end if;
  select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) into v_list from (select id, created_at, withdrawn_date, amount, source, method, reference, note from public.withdrawals order by withdrawn_date desc, created_at desc limit 300) t;
  select coalesce(sum(case when upper(coalesce(method, '')) like '%EPS%' then amount else 0 end), 0), coalesce(sum(case when upper(coalesce(method, '')) not like '%EPS%' then amount else 0 end), 0) into v_eps_rev, v_manual_rev from public.payments where status in ('success', 'সফল', 'paid', 'পেইড');
  select coalesce(sum(case when upper(coalesce(source, 'EPS')) = 'EPS' then amount else 0 end), 0), coalesce(sum(case when upper(coalesce(source, 'EPS')) <> 'EPS' then amount else 0 end), 0) into v_eps_wd, v_manual_wd from public.withdrawals;
  return jsonb_build_object('ok', true, 'list', v_list, 'summary', jsonb_build_object('eps_rev', v_eps_rev, 'manual_rev', v_manual_rev, 'eps_withdrawn', v_eps_wd, 'manual_withdrawn', v_manual_wd, 'total_withdrawn', (v_eps_wd + v_manual_wd), 'eps_balance', (v_eps_rev - v_eps_wd)));
end; $$;

drop function if exists public.admin_add_withdrawal(numeric, text, text, text, text, text);
create or replace function public.admin_add_withdrawal(p_tok text, p_amount numeric, p_source text default 'EPS', p_method text default 'ব্যাংক ট্রান্সফার', p_reference text default '', p_note text default '', p_date text default null)
returns jsonb language plpgsql security definer as $$
declare v_id text; v_dt date; v_src text;
begin
  if not public.is_valid_admin_token(p_tok) then return jsonb_build_object('ok', false, 'auth', false, 'err', 'অ্যাডমিন সেশন বৈধ নয়'); end if;
  if p_amount is null or p_amount <= 0 then return jsonb_build_object('ok', false, 'err', 'সঠিক টাকার পরিমাণ দিন'); end if;
  v_id := 'wd' || extract(epoch from now())::bigint::text || floor(random() * 900 + 100)::int::text;
  v_dt := coalesce(nullif(trim(p_date), '')::date, (now() at time zone 'Asia/Dhaka')::date);
  v_src := coalesce(nullif(trim(p_source), ''), 'EPS');
  insert into public.withdrawals (id, withdrawn_date, amount, source, method, reference, note) values (v_id, v_dt, p_amount, v_src, coalesce(nullif(trim(p_method), ''), 'ব্যাংক ট্রান্সফার'), coalesce(trim(p_reference), ''), coalesce(trim(p_note), ''));
  insert into public.log (who, action, detail, at) values ('admin', 'উইথড্র রেকর্ড যোগ', format('উৎস: %s · টাকা: ৳%s · মাধ্যম: %s · রেফ: %s', v_src, p_amount, coalesce(p_method, ''), coalesce(p_reference, '')), now());
  return jsonb_build_object('ok', true, 'id', v_id);
end; $$;

drop function if exists public.admin_delete_withdrawal(text);
create or replace function public.admin_delete_withdrawal(p_tok text, p_id text)
returns jsonb language plpgsql security definer as $$
declare v_row record;
begin
  if not public.is_valid_admin_token(p_tok) then return jsonb_build_object('ok', false, 'auth', false, 'err', 'অ্যাডমিন সেশন বৈধ নয়'); end if;
  select * into v_row from public.withdrawals where id = p_id;
  if not found then return jsonb_build_object('ok', false, 'err', 'উইথড্র রেকর্ড পাওয়া যায়নি'); end if;
  delete from public.withdrawals where id = p_id;
  insert into public.log (who, action, detail, at) values ('admin', 'উইথড্র রেকর্ড মুছে ফেলা হয়েছে', format('আইডি: %s · টাকা: ৳%s · উৎস: %s', v_row.id, v_row.amount, v_row.source), now());
  return jsonb_build_object('ok', true);
end; $$;

drop function if exists public.admin_reset_test_data();
create or replace function public.admin_reset_test_data(p_tok text)
returns jsonb language plpgsql security definer as $$
declare v_del_pays int := 0; v_del_mems int := 0; v_del_otps int := 0; v_del_wds int := 0; v_del_hist int := 0; v_del_sms int := 0;
begin
  if not public.is_valid_admin_token(p_tok) then return jsonb_build_object('ok', false, 'auth', false, 'err', 'অ্যাডমিন সেশন বৈধ নয়'); end if;
  with p as (delete from public.payments where id is not null returning 1) select count(*) into v_del_pays from p;
  with w as (delete from public.withdrawals where id is not null returning 1) select count(*) into v_del_wds from w;
  with h as (delete from public.design_history where id is not null returning 1) select count(*) into v_del_hist from h;
  with sl as (delete from public.sms_logs where id is not null returning 1) select count(*) into v_del_sms from sl;
  delete from public.member_sessions where token is not null;
  delete from public.otp_verified_tokens where token is not null;
  with m as (delete from public.members where phone is not null returning 1) select count(*) into v_del_mems from m;
  with o as (delete from public.otp_codes where phone is not null returning 1) select count(*) into v_del_otps from o;
  update public.styles set used = 0 where id is not null;
  delete from public.log where id is not null;
  insert into public.log (who, action, detail, at) values ('admin', 'সিস্টেম ফ্রেশ রিসেট', 'সব টেস্ট মেম্বার, পেমেন্ট, উইথড্র, ডিজাইন হিস্ট্রি ও SMS লগ মুছে প্রোডাকশনের জন্য ফ্রেশ করা হয়েছে।', now());
  return jsonb_build_object('ok', true, 'message', 'সব টেস্ট ডেটা সফলভাবে মুছে সিস্টেম ফ্রেশ করা হয়েছে', 'deleted_payments', v_del_pays, 'deleted_withdrawals', v_del_wds, 'deleted_members', v_del_mems, 'deleted_otps', v_del_otps, 'deleted_history', v_del_hist, 'deleted_sms_logs', v_del_sms);
end; $$;

grant execute on function public.verify_member_otp_and_grant(text, text) to anon, authenticated, service_role;
grant execute on function public.set_member_password(text, text, text) to anon, authenticated, service_role;
grant execute on function public.verify_member_password(text, text) to anon, authenticated, service_role;
grant execute on function public.verify_member_session(text, text) to anon, authenticated, service_role;
grant execute on function public.logout_member_session(text) to anon, authenticated, service_role;
grant execute on function public.lock_member_brand(text, text) to anon, authenticated, service_role;
grant execute on function public.admin_toggle_verify(text, text, boolean) to anon, authenticated, service_role;
grant execute on function public.admin_reset_member_auth(text, text) to anon, authenticated, service_role;
grant execute on function public.get_members_auth_map(text) to anon, authenticated, service_role;
grant execute on function public.admin_toggle_brand_unlock(text, text, boolean) to anon, authenticated, service_role;
grant execute on function public.get_admin_dashboard_stats(text) to anon, authenticated, service_role;
grant execute on function public.admin_get_withdrawals(text) to anon, authenticated, service_role;
grant execute on function public.admin_add_withdrawal(text, numeric, text, text, text, text, text) to anon, authenticated, service_role;
grant execute on function public.admin_delete_withdrawal(text, text) to anon, authenticated, service_role;
grant execute on function public.admin_reset_test_data(text) to anon, authenticated, service_role;
