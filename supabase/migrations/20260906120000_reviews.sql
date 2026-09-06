-- Customer reviews. Written by the site (service role), moderated by the owner in the Table Editor:
-- set status = 'approved' to publish; the home page revalidates within 5 minutes.
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  name text not null,
  city text,
  stars int not null check (stars between 1 and 5),
  title text,
  body text not null,
  print text check (print in ('fish', 'duck')),
  order_no text,
  verified boolean not null default false,
  photo_url text,
  helpful int not null default 0,
  owner_reply text,
  source text not null default 'site'
);
create index if not exists reviews_status_created_idx on public.reviews (status, created_at desc);
create index if not exists reviews_stars_idx on public.reviews (stars);
alter table public.reviews enable row level security;
-- No policies on purpose: only the service-role key (server) can read or write.
