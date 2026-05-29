-- À coller dans Supabase > SQL Editor (après 002_savings.sql)

-- 1) Renommer la table
alter table public.fixed_expenses rename to monthly_flows;

-- 2) Renommer les contraintes FK pour rester cohérent avec le nouveau nom
alter table public.monthly_flows
  rename constraint fixed_expenses_account_id_fkey to monthly_flows_account_id_fkey;
alter table public.monthly_flows
  rename constraint fixed_expenses_target_account_id_fkey to monthly_flows_target_account_id_fkey;

-- 3) Renommer la policy RLS
alter policy "fixed_expenses rls" on public.monthly_flows rename to "monthly_flows rls";

-- 4) Étendre kind pour accepter 'income'
alter table public.monthly_flows
  drop constraint if exists fixed_expenses_kind_check;
alter table public.monthly_flows
  add constraint monthly_flows_kind_check
  check (kind in ('expense', 'savings', 'income'));

-- 5) Adapter la contrainte de cohérence : seul 'savings' requiert un target
alter table public.monthly_flows
  drop constraint if exists fixed_expenses_savings_target_check;
alter table public.monthly_flows
  add constraint monthly_flows_savings_target_check
  check (kind != 'savings' or target_account_id is not null);
