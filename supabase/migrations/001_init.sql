-- À coller dans Supabase > SQL Editor

create table if not exists public.accounts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  name       text not null,
  bank       text,
  created_at timestamptz not null default now()
);

create table if not exists public.fixed_expenses (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  account_id uuid references public.accounts(id) on delete cascade not null,
  name       text not null,
  amount     numeric(12, 2) not null,
  created_at timestamptz not null default now()
);

-- Sécurité : chaque utilisateur ne voit que ses données
alter table public.accounts       enable row level security;
alter table public.fixed_expenses enable row level security;

create policy "accounts rls"       on public.accounts       for all using (auth.uid() = user_id);
create policy "fixed_expenses rls" on public.fixed_expenses for all using (auth.uid() = user_id);
