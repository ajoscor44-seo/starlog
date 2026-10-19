-- One-level referral programme. Referrers earn NGN 500 after the referred
-- account completes its first successful purchase.
alter table public.profiles add column if not exists referral_code text;
create unique index if not exists profiles_referral_code_key on public.profiles (referral_code);

update public.profiles
set referral_code = 'STAR' || upper(substr(replace(id::text, '-', ''), 1, 8))
where referral_code is null;

alter table public.profiles alter column referral_code set not null;

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles(id) on delete cascade,
  referred_id uuid not null unique references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'rewarded')),
  reward_amount numeric(10,2) not null default 500,
  created_at timestamptz not null default now(),
  rewarded_at timestamptz,
  check (referrer_id <> referred_id)
);

alter table public.referrals enable row level security;
drop policy if exists "Users can view their referrals" on public.referrals;
create policy "Users can view their referrals" on public.referrals for select
using (auth.uid() = referrer_id or auth.uid() = referred_id or public.is_admin(auth.uid()));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  new_code text := 'STAR' || upper(substr(replace(new.id::text, '-', ''), 1, 8));
  requested_code text := upper(nullif(trim(new.raw_user_meta_data->>'referral_code'), ''));
  referring_user uuid;
begin
  select id into referring_user from public.profiles where referral_code = requested_code;
  insert into public.profiles (id, full_name, username, phone, wallet_balance, referral_code)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), coalesce(new.raw_user_meta_data->>'username', ''), coalesce(new.raw_user_meta_data->>'phone', ''), 0, new_code);
  if referring_user is not null and referring_user <> new.id then
    insert into public.referrals (referrer_id, referred_id) values (referring_user, new.id) on conflict (referred_id) do nothing;
  end if;
  return new;
end; $$;

create or replace function public.reward_first_purchase_referral()
returns trigger language plpgsql security definer set search_path = public as $$
declare referral_row public.referrals%rowtype;
begin
  if new.status <> 'SUCCESS' or lower(new.type) <> 'purchase' then return new; end if;
  select * into referral_row from public.referrals where referred_id = new.user_id and status = 'pending' for update;
  if not found then return new; end if;
  update public.referrals set status = 'rewarded', rewarded_at = now() where id = referral_row.id;
  update public.profiles set wallet_balance = wallet_balance + referral_row.reward_amount where id = referral_row.referrer_id;
  insert into public.transactions (id,user_id,amount,type,method,status)
  values ('ref-' || referral_row.id::text, referral_row.referrer_id, referral_row.reward_amount, 'Deposit', 'Referral reward', 'SUCCESS')
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists reward_referral_after_purchase on public.transactions;
create trigger reward_referral_after_purchase after insert on public.transactions
for each row execute function public.reward_first_purchase_referral();
