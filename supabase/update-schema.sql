-- ==========================================
-- UPDATE SCHEMA SCRIPT FOR DISCOUNTZAR PLUS
-- Run this script in your Supabase SQL Editor
-- ==========================================

-- 1. Add the new columns to the existing profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Update the existing handle_new_user trigger function
-- This ensures future users automatically get the username, email, and is_admin defaults populated when they sign up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, username, email, phone, wallet_balance, is_admin)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Unnamed Client'),
        COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
        new.email,
        COALESCE(new.raw_user_meta_data->>'phone', ''),
        10000.00, -- Initial signup sandbox bonus of ₦10,000
        FALSE
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Add Social Media Orders table
CREATE TABLE IF NOT EXISTS public.social_media_orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    plan_id INTEGER NOT NULL,
    plan_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    cost DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending',
    account_details JSONB,
    ologstore_order_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for social_media_orders
ALTER TABLE public.social_media_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own social media orders" ON public.social_media_orders;
CREATE POLICY "Users can view own social media orders" 
ON public.social_media_orders FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own social media orders" ON public.social_media_orders;
CREATE POLICY "Users can insert own social media orders" 
ON public.social_media_orders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 4. Set up pg_net Webhooks for Email Notifications
-- ==========================================
-- NOTE: You must enable the pg_net extension in your Supabase project (Database -> Extensions) before running this.
-- Replace 'YOUR_SUPABASE_URL' and 'YOUR_ANON_KEY' with your actual project details.

CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function to trigger the resend-email-handler edge function
CREATE OR REPLACE FUNCTION public.trigger_resend_email()
RETURNS TRIGGER AS $$
DECLARE
  request_id BIGINT;
  edge_function_url TEXT := current_setting('custom.edge_function_base_url', true) || '/resend-email-handler';
  anon_key TEXT := current_setting('custom.anon_key', true);
BEGIN
  -- We assume you set custom.edge_function_base_url and custom.anon_key via SQL or you can hardcode them here.
  -- Example hardcoded fallback (replace with yours!):
  -- edge_function_url := 'https://[YOUR_PROJECT_REF].supabase.co/functions/v1/resend-email-handler';
  -- anon_key := '[YOUR_ANON_KEY]';

  SELECT net.http_post(
      url:='https://hpkpkkjmfpnbklpctyiy.supabase.co/functions/v1/resend-email-handler',
      headers:=jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer sb_publishable_GUGo72qM-m2_mMKxV2QyKQ_rDmE1LA_'
      ),
      body:=jsonb_build_object(
        'type', TG_OP,
        'table', TG_TABLE_NAME,
        'schema', TG_TABLE_SCHEMA,
        'record', row_to_json(NEW)
      )
  ) INTO request_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for the specific tables
DROP TRIGGER IF EXISTS on_profile_created_send_email ON public.profiles;
CREATE TRIGGER on_profile_created_send_email
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.trigger_resend_email();

DROP TRIGGER IF EXISTS on_transaction_created_send_email ON public.transactions;
CREATE TRIGGER on_transaction_created_send_email
  AFTER INSERT ON public.transactions
  FOR EACH ROW 
  WHEN (NEW.type IN ('Deposit', 'Purchase'))
  EXECUTE FUNCTION public.trigger_resend_email();

DROP TRIGGER IF EXISTS on_social_media_order_created_send_email ON public.social_media_orders;
CREATE TRIGGER on_social_media_order_created_send_email
  AFTER INSERT ON public.social_media_orders
  FOR EACH ROW EXECUTE FUNCTION public.trigger_resend_email();

