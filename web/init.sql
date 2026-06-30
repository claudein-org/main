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
    user_id int references users(user_id) on delete cascade,
    page_id varchar(100) not null,
    page_name varchar(256) not null,
    access_token varchar(1000) not null,
    primary key (user_id, page_id)
);

create table if not exists instagram (
    user_id int references users(user_id) on delete cascade,
    instagram_account_id varchar(100) not null,
    username varchar(100) not null,
    access_token varchar(1000) not null,
    expires_at int not null,
    primary key (user_id, instagram_account_id)
);

-- dev.to (Forem) uses a static personal API key, not OAuth: no token expiry.
create table if not exists devto (
    user_id int primary key references users(user_id) on delete cascade,
    api_key varchar(1000) not null,
    devto_user_id varchar(100) not null
);

create table if not exists youtube (
    user_id int references users(user_id) on delete cascade,
    channel_id varchar(100) not null,
    channel_title varchar(256) not null,
    channel_thumbnail varchar(1000) not null,
    access_token varchar(1000) not null,
    refresh_token varchar(1000) not null,
    expires_at int not null,
    primary key (user_id, channel_id)
);

create table if not exists instagram_containers (
  container_id serial primary key,
  user_id int references users(user_id) on delete cascade,
  post_id varchar(16) not null,
  creation_id varchar(100) not null,
  -- 1=pending, 2=ready, 3=published, 4=failed
  status int not null default 1,
  error_message text,
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp
);

-- One row per published item (a post on a specific account). Carries the
-- provider-native id every analytics API is keyed on; replaces the old `posts`
-- table (which had no account_id and no provider_post_id).
create table if not exists published_posts (
  id               bigserial primary key,
  user_id          int not null references users(user_id) on delete cascade,

  -- App level enum (1 LinkedIn, 2 Facebook, 3 Instagram, 4 YouTube, 5 DEV.to)
  provider         int not null,
  -- author_urn / page_id / instagram_account_id / channel_id / devto_user_id
  account_id       varchar(100) not null,

  -- the provider's own id: URN / fb post id / ig media id / yt video id / devto article id
  provider_post_id varchar(200) not null,
  -- our local content hash; NULL for posts discovered via sync (not published by us)
  local_post_id    varchar(16),
  -- 1 = published by this app, 2 = discovered via provider sync
  origin           int not null default 1,

  post_url         varchar(1000) not null,
  post_date        timestamp not null default current_timestamp,
  synced_at        timestamp,

  unique (user_id, provider, account_id, provider_post_id)
);

create index if not exists published_posts_local_idx
  on published_posts (user_id, provider, account_id, local_post_id);

-- Daily normalised metric snapshot, one row per published item per day. The
-- analytics dashboard reads from here; the sync job writes here.
create table if not exists post_metrics (
  published_post_id bigint not null references published_posts(id) on delete cascade,
  captured_on       date not null,

  impressions int,
  reach       int,
  reactions   int,
  comments    int,
  shares      int,
  saves       int,
  clicks      int,

  extra       jsonb,

  updated_at  timestamp not null default current_timestamp,
  primary key (published_post_id, captured_on)
);