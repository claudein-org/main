create table if not exists users (
  user_id serial primary key,
  email varchar(256) unique not null
);

create table if not exists linkedin (
    user_id int primary key references users(user_id) on delete cascade,
    access_token varchar(1000) not null,
    expires_at int not null
);

create table if not exists posts (
  user_id int references users(user_id) on delete cascade,
  post_id int not null,
  
  -- APP level enum (linkedin, x, etc, currently only linkedin)
  app int not null,

  -- NULL if not posted yet
  post_date int null,
  link varchar(1000) null,

  primary key (user_id, post_id, app)
);