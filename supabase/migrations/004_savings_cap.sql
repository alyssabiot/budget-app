-- À coller dans Supabase > SQL Editor (après 003)
-- Plafond optionnel pour les comptes d'épargne (Livret A 22 950 €, LDDS 12 000 €…)
-- Au-delà du plafond, les versements ne sont plus comptabilisés mais les intérêts continuent.

alter table public.accounts
  add column if not exists cap numeric(12, 2);
