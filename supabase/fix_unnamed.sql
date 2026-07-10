-- 1. Sync any existing missing email addresses from auth.users to profiles
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND (p.email IS NULL OR p.email = '');

-- 2. Update new user trigger function to store the email address automatically during signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    user_count integer;
    initial_balance numeric(15, 2) := 0.00;
BEGIN
    SELECT count(*) INTO user_count FROM public.profiles;
    
    IF user_count < 29 THEN
        initial_balance := 100.00;
    END IF;

    INSERT INTO public.profiles (id, full_name, phone, wallet_balance, email)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', ''),
        COALESCE(new.raw_user_meta_data->>'phone', ''),
        initial_balance,
        new.email
    );

    IF initial_balance > 0 THEN
        INSERT INTO public.transactions (user_id, amount, type, method, status)
        VALUES (new.id, initial_balance, 'Deposit', 'Welcome Bonus', 'COMPLETED');
    END IF;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
