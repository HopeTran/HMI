alter table operation_time drop constraint operation_time_pk;

alter table operation_time
    add constraint operation_time_pk
        primary key (store_id, week_day);

alter table operation_time drop column hour_type;

drop type hour_type;