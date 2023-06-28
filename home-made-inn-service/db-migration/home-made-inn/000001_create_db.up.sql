create type week_day as enum ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN');

alter type week_day owner to home_made_inn_service;

create type hour_type as enum ('AM', 'PM');

alter type hour_type owner to home_made_inn_service;

create type order_status as enum ('wait_for_payment', 'processing', 'delivering', 'completed', 'canceled');

alter type order_status owner to home_made_inn_service;

create table if not exists "user"
(
    id text not null
        constraint user_pk
            primary key,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    deleted_at timestamp with time zone
);

alter table "user" owner to home_made_inn_service;

create table if not exists store
(
    id serial not null
        constraint store_pk
            primary key,
    user_id text
        constraint store_user_id_fk
            references "user",
    name text not null,
    description text,
    country_code text,
    address text,
    location text,
    phone text,
    photo text,
    general_available_from time,
    general_available_to time,
    tags text[],
    rating_score double precision,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    deleted_at timestamp with time zone,
    active boolean default false not null 
);

alter table store owner to home_made_inn_service;

create table if not exists platform_category
(
    id serial not null
        constraint category_pk
            primary key,
    name text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

alter table platform_category owner to home_made_inn_service;

create table if not exists product
(
    id serial not null
        constraint product_pk
            primary key,
    store_id integer not null,
    name text not null,
    description text,
    price double precision not null,
    photo text,
    inventory integer,
    is_general_meal boolean default true,
    rating_score double precision,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

alter table product owner to home_made_inn_service;

create table if not exists category
(
    id serial not null
        constraint store_category_pk
            primary key,
    store_id integer not null
        constraint store_category_store_id_fk
            references store,
    name text not null,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);

alter table category owner to home_made_inn_service;

create table if not exists cart
(
    user_id text not null
        constraint cart_user_id_fk
            references "user",
    product_id integer not null
        constraint cart_product_id_fk
            references product,
    quantity integer not null,
    constraint cart_pk
        primary key (user_id, product_id)
);

alter table cart owner to home_made_inn_service;

create table if not exists "order"
(
    id text not null
        constraint order_pk
            primary key,
    user_id text not null,
    subtotal double precision not null,
    status order_status not null,
    note text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    deleted_at timestamp with time zone
);

alter table "order" owner to home_made_inn_service;

create table if not exists order_detail
(
    order_id text not null
        constraint order_detail_order_id_fk
            references "order",
    product_id integer not null
        constraint order_detail_product_id_fk
            references product,
    quantity integer not null,
    price double precision not null,
    constraint order_detail_pk
        primary key (order_id, product_id)
);

alter table order_detail owner to home_made_inn_service;

create table if not exists ingredient
(
    id serial not null
        constraint ingredient_pk
            primary key,
    name text not null,
    description text
);

alter table ingredient owner to home_made_inn_service;

create table if not exists favorite_store
(
    user_id text not null
        constraint favorite_store_user_id_fk
            references "user",
    store_id integer not null
        constraint favorite_store_store_id_fk
            references store,
    constraint favorite_store_pk
        primary key (user_id, store_id)
);

alter table favorite_store owner to home_made_inn_service;

create table if not exists cuisine
(
    id serial not null
        constraint cuisine_pk
            primary key,
    name text not null
);

alter table cuisine owner to home_made_inn_service;

create table if not exists schedule_menu
(
    store_id integer not null
        constraint schedule_menu_store_id_fk
            references store,
    product_id integer not null
        constraint schedule_menu_product_id_fk
            references product,
    week_day week_day not null,
    price double precision not null,
    inventory integer,
    inventory_left integer,
    active boolean default true,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    constraint schedule_menu_pk
        primary key (store_id, product_id, week_day)
);

alter table schedule_menu owner to home_made_inn_service;

create table if not exists "operation_time"
(
    store_id integer not null
        constraint "operation_time_store_id_fk"
            references store,
    week_day week_day not null,
    hour_type hour_type not null,
    available_from time,
    available_to time,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    constraint "operation_time_pk"
        primary key (store_id, week_day, hour_type)
);

alter table operation_time owner to home_made_inn_service;

create table if not exists store_platform_category
(
    store_id integer not null
        constraint store_platform_category_store_id_fk
            references store,
    platform_category_id integer not null
        constraint store_platform_category_platform_category_id_fk
            references platform_category,
    constraint store_platform_category_pk
        primary key (store_id, platform_category_id)
);

alter table store_platform_category owner to home_made_inn_service;

create table if not exists store_cuisine
(
    store_id integer not null
        constraint store_cuisine_store_id_fk
            references store,
    cuisine_id integer not null
        constraint store_cuisine_cuisine_id_fk
            references cuisine,
    constraint store_cuisine_pk
        primary key (store_id, cuisine_id)
);

alter table store_cuisine owner to home_made_inn_service;

create table if not exists product_ingredient
(
    product_id integer not null
        constraint product_ingredient_product_id_fk
            references product,
    ingredient_id integer not null
        constraint product_ingredient_ingredient_id_fk
            references ingredient,
    constraint product_ingredient_pk
        primary key (product_id, ingredient_id)
);

alter table product_ingredient owner to home_made_inn_service;

create table if not exists category_product
(
    category_id integer not null
        constraint category_product_category_id_fk
            references category,
    product_id integer not null
        constraint category_product_product_id_fk
            references product,
    constraint category_product_pk
        primary key (category_id, product_id)
);

alter table category_product owner to home_made_inn_service;

create table if not exists schema_migrations
(
    version bigint  not null
        constraint schema_migrations_pkey
            primary key,
    dirty   boolean not null
);

alter table schema_migrations owner to home_made_inn_service;