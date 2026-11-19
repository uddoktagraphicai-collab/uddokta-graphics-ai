-- =====================================================================
--  উদ্যোক্তা গ্রাফিক্স AI — Security & Performance Hardening Migration
--  নিরাপদ ও Idempotent (বারবার চালালেও কোনো ডেটা মুছবে না)
--  Supabase Dashboard -> SQL Editor-এ পেস্ট করে Run করুন
-- =====================================================================

-- ১. অনুপস্থিত টেবিলগুলো (landing_config, design_history) নিশ্চিত করা ও RLS চালু করা
create table if not exists public.landing_config (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.landing_config enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'landing_config' and policyname = 'landing_config_public_read'
  ) then
    create policy landing_config_public_read on public.landing_config
      for select to anon, authenticated
      using (id = 'main');
  end if;
end $$;

create table if not exists public.design_history (
  id bigserial primary key,
  phone text not null,
  tid text not null default '',
  style_name text not null default '',
  style_img text not null default '',
  cmd text not null default '',
  vals jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.design_history enable row level security;

-- ২. withdrawals টেবিলে RLS বাধ্যতামূলক চালু করা
alter table if exists public.withdrawals enable row level security;

-- ৩. is_valid_admin_token ও সরাসরি পাসওয়ার্ড RPC থেকে anon/authenticated অ্যাক্সেস প্রত্যাহার
revoke all on function public.is_valid_admin_token(text) from public, anon, authenticated;
grant execute on function public.is_valid_admin_token(text) to service_role;

revoke all on function public.verify_member_password(text, text) from public, anon, authenticated;
grant execute on function public.verify_member_password(text, text) to service_role;

-- ৪. check_member_auth হার্ডেনিং (last_seen ও brand_unlocked লিক বন্ধ + search_path ফিক্স)
create or replace function public.check_member_auth(p_phone text)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_rec record;
begin
  select phone, verified, (password_hash is not null and password_hash <> '') as has_password
  into v_rec
  from public.members
  where phone = p_phone;

  if not found then
    return json_build_object('exists', false, 'verified', false, 'has_password', false);
  else
    return json_build_object(
      'exists', true,
      'verified', coalesce(v_rec.verified, false),
      'has_password', coalesce(v_rec.has_password, false)
    );
  end if;
end;
$$;
grant execute on function public.check_member_auth(text) to anon, authenticated, service_role;

-- ৫. set_member_password হার্ডেনিং (OTP setup_token সর্বদা বাধ্যতামূলক, কোনো বাইপাস নেই)
create or replace function public.set_member_password(p_phone text, p_password_hash text, p_setup_token text default null)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_phone text;
  v_hash text;
  v_tok_valid boolean := false;
  v_sess_tok text;
begin
  v_phone := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  if length(v_phone) = 13 and left(v_phone, 2) = '88' then v_phone := substring(v_phone from 3); end if;
  v_hash := trim(coalesce(p_password_hash, ''));
  if v_phone !~ '^01[0-9]{9}$' or length(v_hash) < 16 then
    return jsonb_build_object('ok', false, 'err', 'অবৈধ অনুরোধ');
  end if;

  if coalesce(trim(p_setup_token), '') = '' then
    return jsonb_build_object('ok', false, 'err', 'অনুমোদিত নয়! পাসওয়ার্ড সেট বা রিসেট করতে ওটিপি যাচাই প্রয়োজন।');
  end if;

  select exists(
    select 1 from public.otp_verified_tokens
    where token = trim(p_setup_token) and phone = v_phone and expires_at > now()
  ) into v_tok_valid;

  if not v_tok_valid then
    return jsonb_build_object('ok', false, 'err', 'ওটিপি সেশনের মেয়াদ শেষ বা অবৈধ! আবার ওটিপি যাচাই করুন।');
  end if;

  delete from public.otp_verified_tokens where token = trim(p_setup_token);

  update public.members set password_hash = v_hash, verified = true, last_seen = now() where phone = v_phone;
  if not found then
    insert into public.members (phone, verified, password_hash, status, joined, made, last_seen)
    values (v_phone, true, v_hash, 'new', (now() at time zone 'Asia/Dhaka')::date, 0, now());
  end if;

  delete from public.member_sessions where phone = v_phone or expires_at < now();
  v_sess_tok := 'ms_' || encode(extensions.gen_random_bytes(24), 'hex');
  insert into public.member_sessions (token, phone, expires_at) values (v_sess_tok, v_phone, now() + interval '30 days');
  return jsonb_build_object('ok', true, 'session_token', v_sess_tok);
end;
$$;
revoke all on function public.set_member_password(text, text, text) from public, anon, authenticated;
grant execute on function public.set_member_password(text, text, text) to service_role;

-- ৬. EPS বনাম ম্যানুয়াল আয় হিসাবের বাগ ফিক্স (bKash/Nagad/Visa EPS পেমেন্ট সঠিকভাবে EPS আয়ে গণনা হবে)
create or replace function public.get_admin_dashboard_stats(p_tok text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_today date;
  v_today_rev numeric := 0;
  v_today_sales int := 0;
  v_today_new_members int := 0;
  v_eps_total_rev numeric := 0;
  v_manual_total_rev numeric := 0;
  v_eps_withdrawn numeric := 0;
  v_total_withdrawn numeric := 0;
  v_expiring jsonb;
begin
  if not public.is_valid_admin_token(p_tok) then
    return jsonb_build_object('ok', false, 'auth', false, 'err', 'অ্যাডমিন সেশন বৈধ নয়');
  end if;

  v_today := (now() at time zone 'Asia/Dhaka')::date;

  select coalesce(sum(amount), 0), count(*)
  into v_today_rev, v_today_sales
  from public.payments
  where status in ('success', 'সফল', 'paid', 'পেইড')
    and (coalesce(done_at, created_at) at time zone 'Asia/Dhaka')::date = v_today;

  select count(*) into v_today_new_members from public.members where joined = v_today;

  select
    coalesce(sum(case when not (coalesce(by, '') = 'admin' or coalesce(trx, '') like 'MANUAL-%' or coalesce(method, '') like '%ম্যানু%' or coalesce(method, '') like '%উপহার%') then amount else 0 end), 0),
    coalesce(sum(case when (coalesce(by, '') = 'admin' or coalesce(trx, '') like 'MANUAL-%' or coalesce(method, '') like '%ম্যানু%' or coalesce(method, '') like '%উপহার%') then amount else 0 end), 0)
  into v_eps_total_rev, v_manual_total_rev
  from public.payments
  where status in ('success', 'সফল', 'paid', 'পেইড');

  select
    coalesce(sum(case when upper(coalesce(source, 'EPS')) = 'EPS' then amount else 0 end), 0),
    coalesce(sum(amount), 0)
  into v_eps_withdrawn, v_total_withdrawn
  from public.withdrawals;

  select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
  into v_expiring
  from (
    select phone, brand, biz, expiry, (expiry - v_today) as days_left
    from public.members
    where status in ('paid', 'পেইড')
      and expiry is not null
      and expiry >= v_today
      and expiry <= (v_today + interval '15 days')::date
    order by expiry asc
    limit 15
  ) t;

  return jsonb_build_object(
    'ok', true,
    'today_rev', v_today_rev,
    'today_sales', v_today_sales,
    'today_new_members', v_today_new_members,
    'eps_total_rev', v_eps_total_rev,
    'manual_total_rev', v_manual_total_rev,
    'eps_withdrawn', v_eps_withdrawn,
    'eps_available_balance', (v_eps_total_rev - v_eps_withdrawn),
    'total_withdrawn', v_total_withdrawn,
    'net_available_balance', ((v_eps_total_rev + v_manual_total_rev) - v_total_withdrawn),
    'expiring_members', v_expiring
  );
end;
$$;

create or replace function public.admin_get_withdrawals(p_tok text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_list jsonb;
  v_eps_rev numeric := 0;
  v_manual_rev numeric := 0;
  v_eps_wd numeric := 0;
  v_manual_wd numeric := 0;
begin
  if not public.is_valid_admin_token(p_tok) then
    return jsonb_build_object('ok', false, 'auth', false, 'err', 'অ্যাডমিন সেশন বৈধ নয়');
  end if;

  select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
  into v_list
  from (
    select id, created_at, withdrawn_date, amount, source, method, reference, note
    from public.withdrawals
    order by withdrawn_date desc, created_at desc
    limit 300
  ) t;

  select
    coalesce(sum(case when not (coalesce(by, '') = 'admin' or coalesce(trx, '') like 'MANUAL-%' or coalesce(method, '') like '%ম্যানু%' or coalesce(method, '') like '%উপহার%') then amount else 0 end), 0),
    coalesce(sum(case when (coalesce(by, '') = 'admin' or coalesce(trx, '') like 'MANUAL-%' or coalesce(method, '') like '%ম্যানু%' or coalesce(method, '') like '%উপহার%') then amount else 0 end), 0)
  into v_eps_rev, v_manual_rev
  from public.payments
  where status in ('success', 'সফল', 'paid', 'পেইড');

  select
    coalesce(sum(case when upper(coalesce(source, 'EPS')) = 'EPS' then amount else 0 end), 0),
    coalesce(sum(case when upper(coalesce(source, 'EPS')) <> 'EPS' then amount else 0 end), 0)
  into v_eps_wd, v_manual_wd
  from public.withdrawals;

  return jsonb_build_object(
    'ok', true,
    'list', v_list,
    'summary', jsonb_build_object(
      'eps_rev', v_eps_rev,
      'manual_rev', v_manual_rev,
      'eps_withdrawn', v_eps_wd,
      'manual_withdrawn', v_manual_wd,
      'total_withdrawn', (v_eps_wd + v_manual_wd),
      'eps_balance', (v_eps_rev - v_eps_wd),
      'total_rev', (v_eps_rev + v_manual_rev),
      'total_balance', ((v_eps_rev + v_manual_rev) - (v_eps_wd + v_manual_wd))
    )
  );
end;
$$;

-- ৭. অ্যাটমিক কমান্ড কাউন্টার RPC (কনকারেন্ট রেস কন্ডিশন রোধ)
create or replace function public.increment_cmd_counters(p_phone text, p_style_id text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.members
  set made = coalesce(made, 0) + 1,
      last_seen = now()
  where phone = p_phone;

  update public.styles
  set used = coalesce(used, 0) + 1
  where id = p_style_id;
end;
$$;
revoke all on function public.increment_cmd_counters(text, text) from public, anon, authenticated;
grant execute on function public.increment_cmd_counters(text, text) to service_role;

-- ৮. হাই-ট্র্যাফিক (৫০০+ ডেইলি ইউজার) ডাটাবেস ইনডেক্সসমূহ
create index if not exists idx_members_status_expiry on public.members (status, expiry);
create index if not exists idx_members_joined on public.members (joined desc);
create index if not exists idx_payments_status_created on public.payments (status, created_at desc);
create index if not exists idx_payments_status_done on public.payments (status, done_at desc);
create index if not exists idx_log_at on public.log (at desc);
create index if not exists idx_member_sessions_expires on public.member_sessions (expires_at);
create index if not exists idx_admin_sessions_expires on public.admin_sessions (expires_at);
create index if not exists idx_otp_codes_expires on public.otp_codes (expires_at);
create index if not exists idx_styles_cat_status_sort on public.styles (cat, status, sort);
create index if not exists idx_design_history_phone_created on public.design_history (phone, created_at desc);

-- =====================================================================
-- Dual Authentication (Phone OR Email) Support & Brevo Integration
-- =====================================================================

-- ১. otp_codes টেবিলে ফোন বা ইমেইল উভয়ের জন্য কনস্ট্রেইন্ট রিল্যাক্স করা
alter table public.otp_codes drop constraint if exists otp_codes_phone_check;
alter table public.otp_codes add constraint otp_codes_phone_check 
  check (phone ~ '^01[0-9]{9}$' or phone ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- ২. members টেবিলে ফোন বা ইমেইল উভয়ের জন্য কনস্ট্রেইন্ট রিল্যাক্স করা এবং email কলাম নিশ্চিত করা
alter table public.members drop constraint if exists members_phone_check;
alter table public.members add constraint members_phone_check 
  check (phone ~ '^01[0-9]{9}$' or phone ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

alter table public.members add column if not exists email text;
create unique index if not exists idx_members_email on public.members (lower(email)) where email is not null and email <> '';

-- ৩. check_member_auth RPC আপডেট (ফোন নম্বর বা ইমেইল উভয়ের জন্য কাজ করবে)
create or replace function public.check_member_auth(p_phone text)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_raw text;
  v_phone text;
  v_rec record;
begin
  v_raw := lower(trim(coalesce(p_phone, '')));
  if v_raw ~* '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$' then
    v_phone := v_raw;
  else
    v_phone := regexp_replace(v_raw, '[^0-9]', '', 'g');
    if length(v_phone) = 13 and left(v_phone, 2) = '88' then v_phone := substring(v_phone from 3); end if;
  end if;

  select phone, verified, (password_hash is not null and password_hash <> '') as has_password, coalesce(brand_unlocked, false) as brand_unlocked, last_seen
  into v_rec
  from public.members
  where phone = v_phone or lower(coalesce(email, '')) = v_phone
  limit 1;
  
  if not found then
    return json_build_object('exists', false, 'verified', false, 'has_password', false, 'brand_unlocked', false, 'last_seen', null);
  else
    return json_build_object('exists', true, 'verified', coalesce(v_rec.verified, false), 'has_password', v_rec.has_password, 'brand_unlocked', v_rec.brand_unlocked, 'last_seen', v_rec.last_seen);
  end if;
end;
$$;

-- ৪. verify_member_otp_and_grant RPC আপডেট (ফোন নম্বর বা ইমেইল উভয়ের জন্য নিরাপদ ওটিপি যাচাই)
create or replace function public.verify_member_otp_and_grant(p_phone text, p_otp text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_raw text;
  v_phone text;
  v_otp text;
  v_row record;
  v_setup_tok text;
begin
  v_raw := lower(trim(coalesce(p_phone, '')));
  v_otp := trim(coalesce(p_otp, ''));

  if v_raw ~* '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$' then
    v_phone := v_raw;
  else
    v_phone := regexp_replace(v_raw, '[^0-9]', '', 'g');
    if length(v_phone) = 13 and left(v_phone, 2) = '88' then v_phone := substring(v_phone from 3); end if;
    if v_phone !~ '^01[0-9]{9}$' then
      return jsonb_build_object('ok', false, 'err', 'সঠিক মোবাইল নম্বর অথবা ইমেইল এড্রেস দিন');
    end if;
  end if;

  if v_otp = '' then
    return jsonb_build_object('ok', false, 'err', 'ওটিপি কোড লিখুন');
  end if;

  select * into v_row
  from public.otp_codes
  where phone = v_phone
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'err', 'কোনো ওটিপি অনুরোধ পাওয়া যায়নি। আবার চেষ্টা করুন।');
  end if;

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
    return jsonb_build_object('ok', false, 'err', 'ভুল ওটিপি কোড! সঠিক কোডটি দিন।');
  end if;

  delete from public.otp_codes where phone = v_phone;
  delete from public.otp_verified_tokens where phone = v_phone;

  v_setup_tok := 'otp_' || encode(gen_random_bytes(24), 'hex');
  insert into public.otp_verified_tokens(token, phone, expires_at)
  values (v_setup_tok, v_phone, now() + interval '10 minutes');

  return jsonb_build_object('ok', true, 'setup_token', v_setup_tok);
end;
$$;
