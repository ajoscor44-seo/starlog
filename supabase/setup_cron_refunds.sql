-- 1. Enable pg_cron extension if not already present
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Create the cancel_and_refund_expired_orders function
CREATE OR REPLACE FUNCTION public.cancel_and_refund_expired_orders()
RETURNS void AS $$
DECLARE
    order_record RECORD;
    refund_ref TEXT;
BEGIN
    -- Find all otp_orders that are PENDING and have exceeded their 15-minute lease time
    FOR order_record IN 
        SELECT id, user_id, price_ngn, service 
        FROM public.otp_orders 
        WHERE status = 'PENDING' AND created_at < NOW() - INTERVAL '15 minutes'
    LOOP
        -- 1. Create a unique transaction reference for the refund
        refund_ref := 'dep-refund-' || order_record.id;
        
        -- 2. Execute process_deposit to refund the user's wallet
        BEGIN
            PERFORM public.process_deposit(
                refund_ref,
                order_record.user_id,
                order_record.price_ngn,
                'OTP Failed Refund (Auto-expired - ' || order_record.service || ')'
            );
        EXCEPTION WHEN OTHERS THEN
            -- If the transaction already exists or process_deposit fails, log the notice
            RAISE NOTICE 'Refund failed or transaction already exists for order %', order_record.id;
        END;
        
        -- 3. Update the order status to EXPIRED in the database
        UPDATE public.otp_orders 
        SET status = 'EXPIRED' 
        WHERE id = order_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Schedule the cron job to run every minute
-- Unschedule first if already exists
SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'cancel-expired-orders-cron';
SELECT cron.schedule('cancel-expired-orders-cron', '*/1 * * * *', 'SELECT public.cancel_and_refund_expired_orders();');
