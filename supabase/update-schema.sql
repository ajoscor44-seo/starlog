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
