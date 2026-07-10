-- Define the 5 target user IDs to delete
-- '47258577-bcf4-42bb-8d0b-4defa5d92064' (test_pocketfi_1@example.com)
-- '0051ed96-4f6c-4611-9f9d-3161fff0dc39' (admin_test@discountzar.com)
-- '92b3007c-58fe-4b3d-b84d-8e9144390f96' (test_debug_622803@example.com)
-- '50341a71-873d-4d3b-90c7-d317dbd4c6a2' (test_debug_77783@example.com)
-- '1a5b4852-3d79-47a5-9a3d-170c1cb076d8' (testadmin@example.com)

-- 1. Clear child records from tables that don't have CASCADE DELETE constraints
DELETE FROM public.social_media_orders 
WHERE user_id IN ('47258577-bcf4-42bb-8d0b-4defa5d92064', '0051ed96-4f6c-4611-9f9d-3161fff0dc39', '92b3007c-58fe-4b3d-b84d-8e9144390f96', '50341a71-873d-4d3b-90c7-d317dbd4c6a2', '1a5b4852-3d79-47a5-9a3d-170c1cb076d8');

DELETE FROM public.otp_orders 
WHERE user_id IN ('47258577-bcf4-42bb-8d0b-4defa5d92064', '0051ed96-4f6c-4611-9f9d-3161fff0dc39', '92b3007c-58fe-4b3d-b84d-8e9144390f96', '50341a71-873d-4d3b-90c7-d317dbd4c6a2', '1a5b4852-3d79-47a5-9a3d-170c1cb076d8');

DELETE FROM public.transactions 
WHERE user_id IN ('47258577-bcf4-42bb-8d0b-4defa5d92064', '0051ed96-4f6c-4611-9f9d-3161fff0dc39', '92b3007c-58fe-4b3d-b84d-8e9144390f96', '50341a71-873d-4d3b-90c7-d317dbd4c6a2', '1a5b4852-3d79-47a5-9a3d-170c1cb076d8');

DELETE FROM public.virtual_wallets 
WHERE user_id IN ('47258577-bcf4-42bb-8d0b-4defa5d92064', '0051ed96-4f6c-4611-9f9d-3161fff0dc39', '92b3007c-58fe-4b3d-b84d-8e9144390f96', '50341a71-873d-4d3b-90c7-d317dbd4c6a2', '1a5b4852-3d79-47a5-9a3d-170c1cb076d8');

-- 2. Delete the user records from auth.users (will cascade delete the public.profiles rows)
DELETE FROM auth.users 
WHERE id IN ('47258577-bcf4-42bb-8d0b-4defa5d92064', '0051ed96-4f6c-4611-9f9d-3161fff0dc39', '92b3007c-58fe-4b3d-b84d-8e9144390f96', '50341a71-873d-4d3b-90c7-d317dbd4c6a2', '1a5b4852-3d79-47a5-9a3d-170c1cb076d8');
