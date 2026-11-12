-- Server 2 (SMSPool) and Server 3 (Textverified) numbers were saved without
-- their country code. Server 2's country comes from the purchase that paid
-- for the order; an order is only changed when every matching purchase names
-- the same country. Server 3 only issues US numbers.
with s2 as (
  select o.id, o.user_id, o.price_ngn, o.created_at, regexp_replace(o.phone_number, '\D', '', 'g') d
  from public.otp_orders o
  where o.server = 'server2' and length(regexp_replace(o.phone_number, '\D', '', 'g')) <= 10
),
c as (
  select s2.id, s2.d,
         regexp_replace(regexp_replace(t.method, '^OTP Verification \(.* - (.*)\)$', '\1'), '\s*\(.*\)$', '') country
  from s2
  join public.transactions t
    on t.user_id = s2.user_id and t.type = 'Purchase' and t.amount = s2.price_ngn
   and t.method like 'OTP Verification (%'
   and t.method not like 'OTP Verification (Textverified%'
   and t.method not like 'OTP Verification (Server 4%'
   and t.created_at between s2.created_at - interval '10 minutes' and s2.created_at + interval '10 minutes'
),
resolved as (
  select id, min(d) d, min(country) country from c group by id having count(distinct country) = 1
),
coded as (
  select id, d,
         case country
           when 'United States' then '1' when 'Anguilla' then '1'
           when 'United Kingdom' then '44' when 'Nigeria' then '234' when 'Sweden' then '46'
         end cc
  from resolved
),
upd2 as (
  update public.otp_orders o set phone_number = '+' || coded.cc || ltrim(coded.d, '0')
  from coded where o.id = coded.id and coded.cc is not null
  returning o.id
),
upd3 as (
  update public.otp_orders set phone_number = '+1' || regexp_replace(phone_number, '\D', '', 'g')
  where server = 'server3' and length(regexp_replace(phone_number, '\D', '', 'g')) = 10
  returning id
)
select (select count(*) from upd2) as server2_fixed, (select count(*) from upd3) as server3_fixed;
