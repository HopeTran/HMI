ALTER TYPE order_status ADD VALUE 'arrived'; 
ALTER TYPE order_status ADD VALUE 'need_to_delivery'; 
alter table "order" add column if not exists customer_address text;
alter table "order" add column if not exists customer_phone text;
alter table "order" add column if not exists customer_name text;
alter table "order" add column if not exists total double precision;
alter table "order" add column if not exists delivery_fee double precision;
alter table "order" add column if not exists discount double precision;
alter table "order" add column if not exists discount_code text;
alter table "order" add column if not exists cancel_reason text;