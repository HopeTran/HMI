create table if not exists product_attribute
(
    id serial not null
        constraint attribute_value_id_pk
            primary key,
    attribute_id integer not null
        constraint attribute_id_fk
            references attribute,
    attribute_value_id integer not null
        constraint attribute_value_id_fk
            references attribute_value,
    product_id integer not null
        constraint product_id_fk
            references product,
    store_id integer not null
        constraint store_id_fk
            references store,
    inventory integer,
    inventory_left integer,
    price integer,
    product_code text,
);

alter table product_attribute owner to home_made_inn_service;