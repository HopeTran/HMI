alter table operation_time drop constraint operation_time_pk;
alter table operation_time drop column id;
alter table operation_time add constraint operation_time_pk
        primary key (store_id, week_day);