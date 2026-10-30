-- When an order fails after the wallet was charged, the original "Purchase"
-- transaction should read FAILED instead of SUCCESS (the refund is a
-- separate Deposit row).

-- 1. Remember which wallet debit paid for each OTP order.
alter table public.otp_orders add column if not exists purchase_tx_id text;

-- 2. Let the app mark its own refunded purchase as failed. Only purchases
--    that already have a matching refund can be marked, so this cannot be
--    used to hide a purchase that actually went through.
create or replace function public.mark_purchase_failed(p_tx_id text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.transactions t
  set status = 'FAILED'
  where t.id = p_tx_id
    and t.user_id = auth.uid()
    and t.type = 'Purchase'
    and t.status = 'SUCCESS'
    and exists (
      select 1 from public.transactions r
      where r.user_id = t.user_id
        and r.type = 'Deposit'
        and r.amount = t.amount
        and r.method ilike '%refund%'
        and r.created_at >= t.created_at
    );
end; $$;

revoke all on function public.mark_purchase_failed(text) from public, anon;
grant execute on function public.mark_purchase_failed(text) to authenticated;

-- 3. When an OTP order expires, is cancelled or refunded (by the app or by
--    the cancel_and_refund_expired_orders cron), fail its purchase.
create or replace function public.fail_purchase_for_unsuccessful_otp()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.purchase_tx_id is not null
     and upper(coalesce(new.status, '')) in ('EXPIRED', 'CANCELLED', 'CANCELED', 'REFUNDED', 'FAILED', 'TIMEOUT')
     and upper(coalesce(old.status, '')) is distinct from upper(new.status) then
    update public.transactions
    set status = 'FAILED'
    where id = new.purchase_tx_id and user_id = new.user_id and type = 'Purchase';
  end if;
  return new;
end; $$;

drop trigger if exists fail_purchase_for_unsuccessful_otp on public.otp_orders;
create trigger fail_purchase_for_unsuccessful_otp
  after update of status on public.otp_orders
  for each row execute function public.fail_purchase_for_unsuccessful_otp();

-- 4. Backfill existing unsuccessful OTP orders. Older orders have no
--    purchase_tx_id, so only link a purchase when it is the single
--    same-amount purchase by that user within 10 minutes of the order.
-- Matches are counted across orders of every status, so a purchase that
-- could belong to a completed order is never touched.
with candidates as (
  select o.id as order_id, o.status as order_status, t.id as tx_id,
         count(*) over (partition by o.id) as order_matches,
         count(*) over (partition by t.id) as tx_matches
  from public.otp_orders o
  join public.transactions t
    on t.user_id = o.user_id
   and t.type = 'Purchase'
   and t.amount = o.price_ngn
   and t.created_at between o.created_at - interval '10 minutes' and o.created_at + interval '10 minutes'
  where o.purchase_tx_id is null
)
update public.transactions t
set status = 'FAILED'
from candidates c
where t.id = c.tx_id
  and c.order_matches = 1 and c.tx_matches = 1
  and t.status = 'SUCCESS'
  and upper(coalesce(c.order_status, '')) in ('EXPIRED', 'CANCELLED', 'CANCELED', 'REFUNDED', 'FAILED', 'TIMEOUT');
