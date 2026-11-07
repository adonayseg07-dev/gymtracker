-- GymTracker: ejecutar completo en Supabase > SQL Editor
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null, age int, weight numeric, height numeric,
  level text, time_training text, goal text,
  days int default 3, minutes int default 60,
  priorities text[] default '{}', limits text default '',
  updated_at timestamptz default now()
);
create table if not exists user_equipment (
  user_id uuid not null references auth.users(id) on delete cascade,
  equipment_id text not null,
  primary key (user_id, equipment_id)
);
create table if not exists routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  items jsonb not null default '[]',  -- [{id,sets,reps,rest}]
  created_at timestamptz default now()
);
create table if not exists workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  routine_name text,
  started_at timestamptz default now(),
  finished_at timestamptz,
  sets jsonb not null default '[]'    -- [{ex,n,weight,reps}]
);
create index if not exists routines_user_idx on routines(user_id);
create index if not exists workouts_user_date_idx on workouts(user_id, started_at desc);

alter table profiles enable row level security;
alter table user_equipment enable row level security;
alter table routines enable row level security;
alter table workouts enable row level security;

create policy "own profile" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own equipment" on user_equipment for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own routines" on routines for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own workouts" on workouts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
