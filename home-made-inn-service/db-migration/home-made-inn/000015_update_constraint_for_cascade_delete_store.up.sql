ALTER TABLE store DROP CONSTRAINT store_user_id_fk;
ALTER TABLE store ADD CONSTRAINT store_user_id_fk FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;

ALTER TABLE store_cuisine DROP CONSTRAINT store_cuisine_store_id_fk;
ALTER TABLE store_cuisine ADD CONSTRAINT store_cuisine_store_id_fk FOREIGN KEY (store_id) REFERENCES store(id) ON DELETE CASCADE;

ALTER TABLE public.store_platform_category DROP CONSTRAINT store_platform_category_store_id_fk;
ALTER TABLE public.store_platform_category ADD CONSTRAINT store_platform_category_store_id_fk FOREIGN KEY (store_id) REFERENCES public.store(id) ON DELETE CASCADE;

ALTER TABLE public.schedule_menu DROP CONSTRAINT schedule_menu_store_id_fk;
ALTER TABLE public.schedule_menu ADD CONSTRAINT schedule_menu_store_id_fk FOREIGN KEY (store_id) REFERENCES public.store(id) ON DELETE CASCADE;

ALTER TABLE public.schedule_menu DROP CONSTRAINT schedule_menu_product_id_fk;
ALTER TABLE public.schedule_menu ADD CONSTRAINT schedule_menu_product_id_fk FOREIGN KEY (product_id) REFERENCES public.product(id) ON DELETE CASCADE;

ALTER TABLE public.operation_time DROP CONSTRAINT operation_time_store_id_fk;
ALTER TABLE public.operation_time ADD CONSTRAINT operation_time_store_id_fk FOREIGN KEY (store_id) REFERENCES public.store(id) ON DELETE CASCADE;

ALTER TABLE public.favorite_store DROP CONSTRAINT favorite_store_user_id_fk;
ALTER TABLE public.favorite_store ADD CONSTRAINT favorite_store_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;

ALTER TABLE public.favorite_store DROP CONSTRAINT favorite_store_store_id_fk;
ALTER TABLE public.favorite_store ADD CONSTRAINT favorite_store_store_id_fk FOREIGN KEY (store_id) REFERENCES public.store(id) ON DELETE CASCADE;

ALTER TABLE public.category_product DROP CONSTRAINT category_product_product_id_fk;
ALTER TABLE public.category_product ADD CONSTRAINT category_product_product_id_fk FOREIGN KEY (product_id) REFERENCES public.product(id) ON DELETE CASCADE;
ALTER TABLE public.category_product DROP CONSTRAINT category_product_category_id_fk;
ALTER TABLE public.category_product ADD CONSTRAINT category_product_category_id_fk FOREIGN KEY (category_id) REFERENCES public.category(id) ON DELETE CASCADE;

ALTER TABLE public.category DROP CONSTRAINT store_category_store_id_fk;
ALTER TABLE public.category ADD CONSTRAINT store_category_store_id_fk FOREIGN KEY (store_id) REFERENCES public.store(id) ON DELETE CASCADE;

ALTER TABLE public.cart_item DROP CONSTRAINT cart_user_id_fk;
ALTER TABLE public.cart_item ADD CONSTRAINT cart_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;
ALTER TABLE public.cart_item DROP CONSTRAINT cart_product_id_fk;
ALTER TABLE public.cart_item ADD CONSTRAINT cart_product_id_fk FOREIGN KEY (product_id) REFERENCES public.product(id) ON DELETE CASCADE;

ALTER TABLE public."order" DROP CONSTRAINT order_store_id_fk;
ALTER TABLE public."order" ADD CONSTRAINT order_store_id_fk FOREIGN KEY (store_id) REFERENCES public.store(id) ON DELETE CASCADE;

ALTER TABLE public.order_detail DROP CONSTRAINT order_detail_order_id_fk;
ALTER TABLE public.order_detail ADD CONSTRAINT order_detail_order_id_fk FOREIGN KEY (order_id) REFERENCES public."order"(id) ON DELETE CASCADE;

ALTER TABLE public.product_ingredient DROP CONSTRAINT product_ingredient_ingredient_id_fk;
ALTER TABLE public.product_ingredient ADD CONSTRAINT product_ingredient_ingredient_id_fk FOREIGN KEY (ingredient_id) REFERENCES public.ingredient(id) ON DELETE CASCADE;
ALTER TABLE public.product_ingredient DROP CONSTRAINT product_ingredient_product_id_fk;
ALTER TABLE public.product_ingredient ADD CONSTRAINT product_ingredient_product_id_fk FOREIGN KEY (product_id) REFERENCES public.product(id) ON DELETE CASCADE;

