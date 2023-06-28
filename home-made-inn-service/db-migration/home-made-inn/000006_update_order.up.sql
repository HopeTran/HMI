alter table "order" add column if not exists rating double precision;
alter table "order" add column if not exists store_id integer not null constraint order_store_id_fk references store;