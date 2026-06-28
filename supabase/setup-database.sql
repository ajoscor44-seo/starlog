-- ==========================================
-- SETUP DATABASE SCRIPT FOR DISCOUNTZAR PLUS
-- Run this script in the Supabase SQL Editor
-- ==========================================

-- 1. Create Profiles Table (Linked to Auth.Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    username TEXT UNIQUE,
    email TEXT,
    phone TEXT,
    wallet_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    is_admin BOOLEAN DEFAULT FALSE,
    api_key TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to check if a user is an administrator without causing infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- 1. Direct JWT email bypass for primary administrator (zero database query, avoids recursion)
    IF auth.jwt() ->> 'email' = 'dapopaulmayomi@gmail.com' THEN
        RETURN TRUE;
    END IF;

    -- 2. Fallback to checking the profiles table using table owner credentials (bypasses RLS)
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND is_admin = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure postgres superuser owns this security definer function to bypass RLS and prevent recursive loops
ALTER FUNCTION public.is_admin(uuid) OWNER TO postgres;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile or admin can read all" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile or admin can update all" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_admin(auth.uid()));

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
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions or admin can view all" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

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
DROP POLICY IF EXISTS "Users can view own virtual wallet" ON public.virtual_wallets;
CREATE POLICY "Users can view own virtual wallet or admin can view all" ON public.virtual_wallets
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- 4. Trigger to Auto-Create Profile on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_count INTEGER;
    initial_balance NUMERIC(15, 2) := 0.00;
BEGIN
    -- Count existing profiles to check if we are within the first 29 users
    SELECT COUNT(*) INTO user_count FROM public.profiles;
    
    IF user_count < 29 THEN
        initial_balance := 100.00; -- ₦100 welcome bonus for the first 29 users
    END IF;

    INSERT INTO public.profiles (id, full_name, username, email, phone, wallet_balance, is_admin, api_key)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Unnamed Client'),
        COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
        new.email,
        COALESCE(new.raw_user_meta_data->>'phone', ''),
        initial_balance,
        FALSE,
        'dz_live_' || substring(md5(random()::text) from 1 for 24)
    );

    -- If user received a welcome bonus, log it as a Deposit transaction so it shows in Order History
    IF initial_balance > 0 THEN
        INSERT INTO public.transactions (id, user_id, amount, type, method, status, created_at)
        VALUES (
            'bonus-welcome-' || new.id,
            new.id,
            initial_balance,
            'Deposit',
            'Welcome Bonus — ₦100 Sign-up Credit 🎉',
            'SUCCESS',
            NOW()
        );
    END IF;

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

-- 8. Create OTP Orders Table
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
