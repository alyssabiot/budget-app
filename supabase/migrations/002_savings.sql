-- À coller dans Supabase > SQL Editor (après 001_init.sql)

-- Type de compte (courant vs épargne) + champs spécifiques épargne
alter table public.accounts
  add column if not exists type text not null default 'checking'
    check (type in ('checking', 'savings')),
  add column if not exists current_balance numeric(12, 2),
  add column if not exists balance_updated_at timestamptz,
  add column if not exists interest_rate numeric(5, 2);

-- Les frais peuvent être soit une dépense, soit une épargne vers un compte cible
alter table public.fixed_expenses
  add column if not exists kind text not null default 'expense'
    check (kind in ('expense', 'savings')),
  add column if not exists target_account_id uuid references public.accounts(id) on delete set null;

-- Cohérence : si kind = 'savings', target_account_id doit être renseigné
alter table public.fixed_expenses
  drop constraint if exists fixed_expenses_savings_target_check;
alter table public.fixed_expenses
  add constraint fixed_expenses_savings_target_check
  check (kind = 'expense' or target_account_id is not null);
