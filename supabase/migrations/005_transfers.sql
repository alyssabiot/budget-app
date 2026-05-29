-- À coller dans Supabase > SQL Editor (après 004)
-- Virements internes entre comptes courants : nouveau kind = 'transfer'.

-- 1) Étendre kind pour accepter 'transfer'
alter table public.monthly_flows
  drop constraint if exists monthly_flows_kind_check;
alter table public.monthly_flows
  add constraint monthly_flows_kind_check
  check (kind in ('expense', 'savings', 'income', 'transfer'));

-- 2) Étendre la contrainte de cohérence : savings et transfer requièrent un target
alter table public.monthly_flows
  drop constraint if exists monthly_flows_savings_target_check;
alter table public.monthly_flows
  add constraint monthly_flows_target_check
  check (kind not in ('savings', 'transfer') or target_account_id is not null);
