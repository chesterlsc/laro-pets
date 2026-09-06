-- Laro Pets orders (SPEC §6). Run in the Supabase SQL editor.
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_no text unique not null,
  created_at timestamptz not null default now(),
  status text not null check (status in ('pending_cod', 'pending_payment', 'paid', 'fulfilled', 'cancelled')),
  customer jsonb not null,
  address jsonb not null,
  items jsonb not null,
  subtotal int not null,
  shipping int not null,
  total int not null,
  payment_method text not null,
  payment_ref text,
  notes text
);

create index if not exists orders_order_no_idx on public.orders (order_no);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- Service role only: RLS on, no policies for anon/authenticated.
alter table public.orders enable row level security;
