create table if not exists users (
  user_id serial primary key,
  email varchar(256) unique not null,
  api_key varchar(32) unique not null
);

create table if not exists linkedin (
    user_id int primary key references users(user_id) on delete cascade,
    token varchar(256) not null
);

