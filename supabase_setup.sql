-- Create a table for public user profiles linked to Supabase Auth
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  followup_email_sent boolean default false not null,
  full_name text,
  username text,
  phone text,
  is_admin boolean default false not null,
  api_key text,
  wallet_balance numeric(10,2) default 0.00 not null
);

-- Ensure columns exist if table was already created
alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists is_admin boolean default false not null;
alter table public.profiles add column if not exists api_key text;

-- Enable Row Level Security (RLS) on profiles
alter table public.profiles enable row level security;

-- Create a separate table for system administrators to prevent RLS recursive loops on profiles
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.admins enable row level security;

-- Admins policy
drop policy if exists "Admins can view admins" on public.admins;
create policy "Admins can view admins" on public.admins
  for select using (auth.uid() = user_id or exists (select 1 from public.admins where user_id = auth.uid()));

-- Helper function to check if a user is an administrator without causing infinite recursion
create or replace function public.is_admin(user_id uuid)
returns boolean as $$
begin
    -- 1. Direct JWT email bypass for primary administrators (zero database query, avoids recursion)
    if auth.jwt() ->> 'email' in ('joscor@wsv.com.ng', 'pauleke2004@gmail.com', 'dapopaulmayomi@gmail.com') then
        return true;
    end if;

    -- 2. Fallback to checking the admins table (prevents profiles recursion loop)
    return exists (
        select 1 from public.admins
        where user_id = $1
    );
end;
$$ language plpgsql security definer;

-- Ensure postgres superuser owns this security definer function to bypass RLS and prevent recursive loops
alter function public.is_admin(uuid) owner to postgres;

-- Set up RLS Policies
drop policy if exists "Profiles are viewable by owner." on public.profiles;
create policy "Profiles are viewable by owner or admin can read all" on public.profiles
  for select using (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists "Users can update their own profile." on public.profiles;
create policy "Users can update their own profile or admin can update all" on public.profiles
  for update using (auth.uid() = id or public.is_admin(auth.uid()));

-- Create a table for system configurations (rates, markup)
create table if not exists public.system_config (
  id text primary key,
  value numeric not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS and restrict config updates to admins only
alter table public.system_config enable row level security;

drop policy if exists "Config is viewable by everyone." on public.system_config;
create policy "Config is viewable by everyone." on public.system_config
  for select using (true);

-- Insert default configs if they don't exist
insert into public.system_config (id, value)
values 
  ('exchange_rate', 1350.00),
  ('profit_markup', 1.00)
on conflict (id) do nothing;

-- Create a trigger function to automatically create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, full_name, phone, wallet_balance)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'full_name', ''),
        coalesce(new.raw_user_meta_data->>'phone', ''),
        0.00
    );

    return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create a table for virtual bank accounts linked to user profiles
create table if not exists public.virtual_wallets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  bank_name text not null,
  account_number text not null unique,
  account_name text not null,
  business_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a table for user transaction logs (deposits, purchases, refunds)
create table if not exists public.transactions (
  id text primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount numeric(10,2) not null,
  type text not null,
  method text not null,
  status text not null default 'SUCCESS',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) on new tables
alter table public.virtual_wallets enable row level security;
alter table public.transactions enable row level security;

-- Set up RLS Policies
drop policy if exists "Users can view their own virtual wallets." on public.virtual_wallets;
create policy "Users can view their own virtual wallets or admin can view all" on public.virtual_wallets
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "Users can insert their own virtual wallets." on public.virtual_wallets;
create policy "Users can insert their own virtual wallets." on public.virtual_wallets
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own virtual wallets." on public.virtual_wallets;
create policy "Users can update their own virtual wallets." on public.virtual_wallets
  for update using (auth.uid() = user_id);

drop policy if exists "Users can view their own transactions." on public.transactions;
create policy "Users can view their own transactions or admin can view all" on public.transactions
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

-- Create a function to process user purchases securely and atomically via RPC
drop function if exists public.process_purchase(uuid, numeric, text, text);
create or replace function public.process_purchase(
  p_user_id uuid,
  p_amount numeric,
  p_type text,
  p_method text
)
returns boolean
language plpgsql
security definer
as $$
declare
  current_balance numeric;
begin
  -- Get and lock profile row to prevent race conditions
  select wallet_balance into current_balance
  from public.profiles
  where id = p_user_id
  for update;

  if p_amount <= 0 then
    raise exception 'Invalid amount. Must be greater than 0.';
  end if;

  if current_balance is null then
    raise exception 'Profile not found';
  end if;

  if current_balance < p_amount then
    raise exception 'Insufficient balance';
  end if;

  -- Deduct balance
  update public.profiles
  set wallet_balance = wallet_balance - p_amount
  where id = p_user_id;

  -- Insert transaction
  insert into public.transactions (id, user_id, amount, type, method, status)
  values (
    'tx-' || substring(md5(random()::text) from 1 for 8),
    p_user_id,
    p_amount,
    p_type,
    p_method,
    'SUCCESS'
  );

  return true;
end;
$$;

-- Create a function to process webhook deposits securely and atomically via RPC
drop function if exists public.process_deposit(text, uuid, numeric, text);
create or replace function public.process_deposit(
  p_tx_id text,
  p_user_id uuid,
  p_amount numeric,
  p_method text
)
returns boolean
language plpgsql
security definer
as $$
begin
  if p_amount <= 0 then
    return false; -- Invalid deposit amount
  end if;

  -- Check if transaction has already been processed to prevent duplication
  if exists (select 1 from public.transactions where id = p_tx_id) then
    return false;
  end if;

  -- Increment balance
  update public.profiles
  set wallet_balance = wallet_balance + p_amount
  where id = p_user_id;

  -- Insert transaction
  insert into public.transactions (id, user_id, amount, type, method, status)
  values (
    p_tx_id,
    p_user_id,
    p_amount,
    'Deposit',
    p_method,
    'SUCCESS'
  );

  return true;
end;
$$;

-- Enable Supabase Realtime replication on profiles and transactions for instant UI syncing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'transactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'virtual_wallets'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.virtual_wallets;
  END IF;
END $$;

-- Create OTP Orders Table
CREATE TABLE IF NOT EXISTS public.otp_orders (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    phone_number TEXT NOT NULL,
    server TEXT NOT NULL,
    service TEXT NOT NULL,
    price_ngn NUMERIC(15, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    otp_code TEXT,
    sms_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.otp_orders ENABLE ROW LEVEL SECURITY;

-- OTP Orders Policies
DROP POLICY IF EXISTS "Users can view own otp_orders" ON public.otp_orders;
CREATE POLICY "Users can view own otp_orders or admin can read all" ON public.otp_orders
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can insert own otp_orders" ON public.otp_orders;
CREATE POLICY "Users can insert own otp_orders" ON public.otp_orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users/Admins can update otp_orders" ON public.otp_orders;
CREATE POLICY "Users/Admins can update otp_orders" ON public.otp_orders
    FOR UPDATE USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Automatically sync profiles.is_admin changes to the admins table to bypass RLS recursion loops
CREATE OR REPLACE FUNCTION public.sync_profile_admins()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_admin = true THEN
        INSERT INTO public.admins (user_id)
        VALUES (NEW.id)
        ON CONFLICT (user_id) DO NOTHING;
    ELSE
        DELETE FROM public.admins
        WHERE user_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync on insert/update of is_admin
DROP TRIGGER IF EXISTS sync_profile_admins_trigger ON public.profiles;
CREATE TRIGGER sync_profile_admins_trigger
    AFTER INSERT OR UPDATE OF is_admin ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_profile_admins();

-- Perform backfill for any existing admins in profiles table
INSERT INTO public.admins (user_id)
SELECT id FROM public.profiles WHERE is_admin = true
ON CONFLICT (user_id) DO NOTHING;


-- =========================================================================
-- STARLOG CUSTOM LOCAL SOCIAL LOGS AND STOCK INVENTORY MANAGER SCHEMA
-- =========================================================================

-- Create table for local social media logs (listings)
create table if not exists public.local_social_logs (
  id uuid default gen_random_uuid() primary key,
  category text not null,
  name text not null,
  price numeric(10,2) not null,
  description text,
  image text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on local_social_logs
alter table public.local_social_logs enable row level security;

-- Policies for local_social_logs
drop policy if exists "Allow public select on local_social_logs" on public.local_social_logs;
create policy "Allow public select on local_social_logs" on public.local_social_logs
  for select using (true);

drop policy if exists "Allow admin modifications on local_social_logs" on public.local_social_logs;
create policy "Allow admin modifications on local_social_logs" on public.local_social_logs
  for all using (public.is_admin(auth.uid()));

-- Create table for credentials items in stock
create table if not exists public.local_social_log_items (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.local_social_logs(id) on delete cascade not null,
  account_data text not null, -- format: "username:password|2fa" or raw credentials
  is_sold boolean default false not null,
  sold_to uuid references public.profiles(id) on delete set null,
  sold_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on local_social_log_items
alter table public.local_social_log_items enable row level security;

-- Policies for local_social_log_items
drop policy if exists "Allow admins all access on items" on public.local_social_log_items;
create policy "Allow admins all access on items" on public.local_social_log_items
  for all using (public.is_admin(auth.uid()));

drop policy if exists "Allow users to select their own purchased items" on public.local_social_log_items;
create policy "Allow users to select their own purchased items" on public.local_social_log_items
  for select using (auth.uid() = sold_to);

-- Create secure atomic local purchase function
create or replace function public.buy_local_social_log(
  p_user_id uuid,
  p_product_id uuid,
  p_cost numeric,
  p_plan_name text
)
returns json
language plpgsql
security definer
as $$
declare
  v_item_id uuid;
  v_account_data text;
  v_order_id uuid;
  v_current_balance numeric;
begin
  -- 1. Check user balance and lock row
  select wallet_balance into v_current_balance from public.profiles where id = p_user_id for update;
  if v_current_balance is null or v_current_balance < p_cost then
    return json_build_object('success', false, 'error', 'Insufficient balance');
  end if;

  -- 2. Find and lock an unsold item
  select id, account_data into v_item_id, v_account_data
  from public.local_social_log_items
  where product_id = p_product_id and is_sold = false
  limit 1
  for update skip locked;

  if v_item_id is null then
    return json_build_object('success', false, 'error', 'Out of stock');
  end if;

  -- 3. Deduct wallet balance
  update public.profiles set wallet_balance = wallet_balance - p_cost where id = p_user_id;

  -- 4. Mark item as sold
  update public.local_social_log_items
  set is_sold = true, sold_to = p_user_id, sold_at = now()
  where id = v_item_id;

  -- 5. Insert transaction log
  insert into public.transactions (id, user_id, amount, type, method, status)
  values (
    'tx-' || substring(md5(random()::text) from 1 for 8),
    p_user_id,
    p_cost,
    'debit',
    'Purchased Social Log: ' || p_plan_name,
    'SUCCESS'
  );

  -- 6. Insert social media order record
  v_order_id := gen_random_uuid();
  insert into public.social_media_orders (id, user_id, plan_id, plan_name, quantity, cost, status, account_details, ologstore_order_id)
  values (
    v_order_id,
    p_user_id,
    p_product_id::text,
    p_plan_name,
    1,
    p_cost,
    'completed',
    json_build_object('Credentials', v_account_data),
    'local_' || substring(md5(random()::text) from 1 for 8)
  );

  return json_build_object('success', true, 'order_id', v_order_id, 'credentials', v_account_data);
exception when others then
  return json_build_object('success', false, 'error', SQLERRM);
end;
$$;

-- Add database realtime publication tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'local_social_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.local_social_logs;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'local_social_log_items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.local_social_log_items;
  END IF;
END $$;
