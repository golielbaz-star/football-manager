-- Groups table
create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  admin_phone text unique not null,
  admin_name text not null,
  city text not null,
  location_name text not null,
  game_day text not null,
  game_time text not null,
  players_per_team int not null default 5,
  max_teams int not null default 2,
  created_at timestamptz default now()
);

-- Players table
create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  name text not null,
  admin_phone text not null references groups(admin_phone),
  age int,
  fitness_level int check (fitness_level between 1 and 5),
  skill_level int check (skill_level between 1 and 5),
  is_goalkeeper boolean default false,
  created_at timestamptz default now(),
  unique(phone, admin_phone)
);

-- Game sessions
create table if not exists game_sessions (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id),
  date date not null,
  status text not null default 'upcoming' check (status in ('upcoming', 'active', 'completed')),
  created_at timestamptz default now()
);

-- RSVPs
create table if not exists rsvps (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references game_sessions(id),
  player_id uuid not null references players(id),
  attending boolean,
  arrived boolean default false,
  created_at timestamptz default now(),
  unique(session_id, player_id)
);

-- Enable RLS
alter table groups enable row level security;
alter table players enable row level security;
alter table game_sessions enable row level security;
alter table rsvps enable row level security;

-- Open policies (adjust for production)
create policy "allow all groups" on groups for all using (true) with check (true);
create policy "allow all players" on players for all using (true) with check (true);
create policy "allow all sessions" on game_sessions for all using (true) with check (true);
create policy "allow all rsvps" on rsvps for all using (true) with check (true);

-- Enable realtime
alter publication supabase_realtime add table rsvps;
