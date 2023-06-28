alter table product add column if not exists parent_id int;

create table if not exists attribute
(
    id serial not null
        constraint attribute_id_pk
            primary key,
    name text,
    label text
);

alter table attribute owner to home_made_inn_service;

create table if not exists attribute_value
(
    id serial not null
        constraint attribute_value_id_pk
            primary key,
    attribute_id integer not null
        constraint value_attribute_id_fk
            references attribute,
    name text
);

alter table attribute_value owner to home_made_inn_service;