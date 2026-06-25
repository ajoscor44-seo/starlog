-- ==========================================
-- SETUP DATABASE SCRIPT FOR DISCOUNTZAR PLUS
-- Run this script in the Supabase SQL Editor
-- ==========================================

-- 1. Create Profiles Table (Linked to Auth.Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    wallet_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies (idempotent - skip if already exist)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own profile' AND tablename = 'profiles') THEN
    EXECUTE 'CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile' AND tablename = 'profiles') THEN
    EXECUTE 'CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id)';
  END IF;
END $$;

-- 2. Create Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Deposit', 'Purchase', 'Refund')),
    amount NUMERIC(15, 2) NOT NULL,
    method TEXT,
    status TEXT NOT NULL DEFAULT 'SUCCESS',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on Transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Transactions Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own transactions' AND tablename = 'transactions') THEN
    EXECUTE 'CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id)';
  END IF;
END $$;

-- 3. Create Virtual Wallets Table (for PocketFi deposits)
CREATE TABLE IF NOT EXISTS public.virtual_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on Virtual Wallets
ALTER TABLE public.virtual_wallets ENABLE ROW LEVEL SECURITY;

-- Virtual Wallets Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own virtual wallet' AND tablename = 'virtual_wallets') THEN
    EXECUTE 'CREATE POLICY "Users can view own virtual wallet" ON public.virtual_wallets FOR SELECT USING (auth.uid() = user_id)';
  END IF;
END $$;

-- 4. Trigger to Auto-Create Profile on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone, wallet_balance)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Unnamed Client'),
        COALESCE(new.raw_user_meta_data->>'phone', ''),
        10000.00 -- Initial signup sandbox bonus of ₦10,000
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the Trigger (drop first to avoid conflict)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. RPC: Wallet Deposits
-- Drop first (required when changing function signature or return type)
DROP FUNCTION IF EXISTS public.process_deposit(TEXT, UUID, NUMERIC, TEXT);

CREATE FUNCTION public.process_deposit(
    p_tx_id TEXT,
    p_user_id UUID,
    p_amount NUMERIC,
    p_method TEXT
)
RETURNS VOID AS $$
BEGIN
    -- Check for duplicate transaction ID to prevent double deposits
    IF EXISTS (SELECT 1 FROM public.transactions WHERE id = p_tx_id) THEN
        RETURN;
    END IF;

    -- Insert Transaction Log
    INSERT INTO public.transactions (id, user_id, type, amount, method, status)
    VALUES (p_tx_id, p_user_id, 'Deposit', p_amount, p_method, 'SUCCESS');

    -- Update User Balance
    UPDATE public.profiles
    SET wallet_balance = wallet_balance + p_amount,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RPC: Wallet Purchases
-- Drop first (required when changing function signature or return type)
DROP FUNCTION IF EXISTS public.process_purchase(UUID, NUMERIC, TEXT, TEXT);

CREATE FUNCTION public.process_purchase(
    p_user_id UUID,
    p_amount NUMERIC,
    p_type TEXT,
    p_method TEXT
)
RETURNS VOID AS $$
DECLARE
    v_balance NUMERIC;
BEGIN
    -- Get current balance
    SELECT wallet_balance INTO v_balance FROM public.profiles WHERE id = p_user_id;

    IF v_balance IS NULL THEN
        RAISE EXCEPTION 'User profile not found';
    END IF;

    IF v_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient wallet balance';
    END IF;

    -- Deduct Balance
    UPDATE public.profiles
    SET wallet_balance = wallet_balance - p_amount,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_user_id;

    -- Record Transaction Log
    INSERT INTO public.transactions (id, user_id, type, amount, method, status)
    VALUES (
        'tx-' || substring(md5(random()::text) from 1 for 8),
        p_user_id,
        p_type,
        p_amount,
        p_method,
        'SUCCESS'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.process_deposit(TEXT, UUID, NUMERIC, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_purchase(UUID, NUMERIC, TEXT, TEXT) TO authenticated;
