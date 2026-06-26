create table if not exists users (
  user_id serial primary key,
  email varchar(256) unique not null
);

create table if not exists linkedin (
    user_id int primary key references users(user_id) on delete cascade,
    access_token varchar(1000) not null,
    expires_at int not null,
    author_urn varchar(100) not null
);

create table if not exists facebook (
    user_id int primary key references users(user_id) on delete cascade,
    access_token varchar(1000) not null,
    expires_at int not null,
    facebook_user_id varchar(100) not null
);

create table if not exists instagram (
    user_id int primary key references users(user_id) on delete cascade,
    access_token varchar(1000) not null,
    expires_at int not null,
    instagram_account_id varchar(100) not null
);

create table if not exists youtube (
    user_id int primary key references users(user_id) on delete cascade,
    access_token varchar(1000) not null,
    refresh_token varchar(1000) not null,
    expires_at int not null,
    channel_id varchar(100) not null
);

create table if not exists posts (
  user_id int references users(user_id) on delete cascade,
  
  post_id varchar(16) not null,
  -- App level enum
  provider int not null,

  post_date timestamp default current_timestamp,
  post_url varchar(1000) not null,

  primary key (user_id, post_id, provider)
);