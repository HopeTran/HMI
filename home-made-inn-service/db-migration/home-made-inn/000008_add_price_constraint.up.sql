-- Make sure exists data has price > 0 before run these commands 
-- update product  set price =1 where price =0; 
-- update schedule_menu  set price =1 where price =0; 
alter table product add constraint product_price_check check (price > 0);
alter table schedule_menu add constraint schedule_menu_price_check check (price > 0);