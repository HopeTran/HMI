ALTER TYPE order_status drop VALUE 'arrived'; 
ALTER TYPE order_status drop VALUE 'need_to_delivery'; 
alter table order drop column customer_address;
alter table order drop column customer_phone;
alter table order drop column customer_name;
alter table order drop column total;
alter table order drop column delivery_fee;
alter table order drop column discount;
alter table order drop column discount_code;
alter table order drop column cancel_reason;

