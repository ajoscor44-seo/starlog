create extension if not exists pg_net with schema extensions;

create or replace function public.notify_telegram_admin_on_insert()
returns trigger
language plpgsql
security definer
set search_path = public, auth, vault, extensions
as $$
declare
  row_data jsonb := to_jsonb(new);
  bot_token text;
  admin_chat_id text;
  customer_name text;
  customer_email text;
  notification_text text;
begin
  select decrypted_secret into bot_token
  from vault.decrypted_secrets
  where name = 'telegram_bot_token'
  limit 1;

  select decrypted_secret into admin_chat_id
  from vault.decrypted_secrets
  where name = 'telegram_admin_chat_id'
  limit 1;

  if coalesce(bot_token, '') = '' or coalesce(admin_chat_id, '') = '' then
    raise warning 'Telegram notification skipped: Vault secrets are missing';
    return new;
  end if;

  if tg_table_name = 'profiles' then
    select email into customer_email from auth.users where id = new.id;
    notification_text := concat_ws(E'\n',
      'NEW SIGNUP',
      'Name: ' || coalesce(row_data->>'full_name', row_data->>'username', 'Not provided'),
      'Username: ' || coalesce(row_data->>'username', 'Not provided'),
      'Email: ' || coalesce(customer_email, 'Not provided'),
      'Phone: ' || coalesce(row_data->>'phone', 'Not provided'),
      'User ID: ' || new.id::text,
      'Time: ' || coalesce(row_data->>'created_at', now()::text)
    );
  elsif tg_table_name in ('social_media_orders', 'otp_orders') then
    select p.full_name, u.email
      into customer_name, customer_email
    from public.profiles p
    left join auth.users u on u.id = p.id
    where p.id = (row_data->>'user_id')::uuid;

    if tg_table_name = 'social_media_orders' then
      notification_text := concat_ws(E'\n',
        'NEW ORDER',
        'Type: Digital service',
        'Customer: ' || coalesce(customer_name, customer_email, row_data->>'user_id'),
        'Service: ' || coalesce(row_data->>'plan_name', 'Unknown'),
        'Quantity: ' || coalesce(row_data->>'quantity', '1'),
        'Amount: NGN ' || coalesce(row_data->>'cost', '0'),
        'Status: ' || coalesce(row_data->>'status', 'processing'),
        'Order ID: ' || coalesce(row_data->>'id', 'Unknown')
      );
    else
      notification_text := concat_ws(E'\n',
        'NEW ORDER',
        'Type: OTP number',
        'Customer: ' || coalesce(customer_name, customer_email, row_data->>'user_id'),
        'Service: ' || coalesce(row_data->>'service', 'Unknown'),
        'Server: ' || coalesce(row_data->>'server', 'Unknown'),
        'Amount: NGN ' || coalesce(row_data->>'price_ngn', '0'),
        'Status: ' || coalesce(row_data->>'status', 'PENDING'),
        'Order ID: ' || coalesce(row_data->>'id', 'Unknown')
      );
    end if;
  else
    return new;
  end if;

  perform net.http_post(
    url := 'https://api.telegram.org/bot' || bot_token || '/sendMessage',
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := jsonb_build_object(
      'chat_id', admin_chat_id,
      'text', notification_text,
      'disable_web_page_preview', true
    )
  );

  return new;
exception when others then
  raise warning 'Telegram notification failed: %', sqlerrm;
  return new;
end;
$$;

drop trigger if exists telegram_admin_new_signup on public.profiles;
create trigger telegram_admin_new_signup
after insert on public.profiles
for each row execute function public.notify_telegram_admin_on_insert();

drop trigger if exists telegram_admin_new_social_order on public.social_media_orders;
create trigger telegram_admin_new_social_order
after insert on public.social_media_orders
for each row execute function public.notify_telegram_admin_on_insert();

drop trigger if exists telegram_admin_new_otp_order on public.otp_orders;
create trigger telegram_admin_new_otp_order
after insert on public.otp_orders
for each row execute function public.notify_telegram_admin_on_insert();
