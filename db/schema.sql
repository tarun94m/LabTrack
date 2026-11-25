create table if not exists clinics (
  id serial primary key,
  name text not null,
  email text not null,
  country text not null
);
create table if not exists cases (
  id serial primary key,
  case_ref text unique not null,
  clinic_id int not null references clinics(id),
  patient_ref text not null,            -- initials / clinic ID only, no full names
  kind text not null,
  status text not null default 'received' check (status in ('received','in_progress','ready')),
  due_date date not null,               -- DATE, not timestamp: a calendar day has no time zone
  ready_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists notifications (
  id serial primary key,
  case_id int not null references cases(id) on delete cascade,
  kind text not null,
  to_email text not null,
  subject text not null,
  body text not null,
  mode text not null,                   -- 'test' | 'live'
  status text not null,                 -- 'recorded' | 'sent' | 'failed'
  error text,
  created_at timestamptz not null default now(),
  unique (case_id, kind)                -- one "ready" email per case, ever
);
