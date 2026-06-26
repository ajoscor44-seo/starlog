-- Create a table for public user profiles linked to Supabase Auth
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  followup_email_sent boolean default false not null,
  full_name text,
  phone text,
  wallet_balance numeric(10,2) default 0.00 not null
);

-- Enable Row Level Security (RLS) on profiles
alter table public.profiles enable row level security;

-- Set up RLS Policies
drop policy if exists "Profiles are viewable by owner." on public.profiles;
create policy "Profiles are viewable by owner." on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Users can update their own profile." on public.profiles;
create policy "Users can update their own profile." on public.profiles
  for update using (auth.uid() = id);

-- Create a trigger function to automatically create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
declare
    user_count integer;
    initial_balance numeric(15, 2) := 0.00;
begin
    -- Count existing profiles to check if we are within the first 29 users
    select count(*) into user_count from public.profiles;
    
    if user_count < 29 then
        initial_balance := 100.00; -- ₦100 welcome bonus for the first 29 users
    end if;

    insert into public.profiles (id, full_name, phone, wallet_balance)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'full_name', ''),
        coalesce(new.raw_user_meta_data->>'phone', ''),
        initial_balance
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
create policy "Users can view their own virtual wallets." on public.virtual_wallets
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own virtual wallets." on public.virtual_wallets;
create policy "Users can insert their own virtual wallets." on public.virtual_wallets
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own virtual wallets." on public.virtual_wallets;
create policy "Users can update their own virtual wallets." on public.virtual_wallets
  for update using (auth.uid() = user_id);

drop policy if exists "Users can view their own transactions." on public.transactions;
create policy "Users can view their own transactions." on public.transactions
  for select using (auth.uid() = user_id);

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
