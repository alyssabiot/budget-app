# Budget app

Application minimaliste de gestion de budget.
Stack : Next.js 14 + Supabase + Tailwind CSS · Hébergement gratuit sur Vercel.

---

## Démarrage en 3 étapes

### 1. Supabase
1. Crée un projet sur https://app.supabase.com
2. Dans **SQL Editor**, exécute `supabase/migrations/001_init.sql`
3. Récupère ton **Project URL** et **anon key** dans Project Settings > API

### 2. Variables d'environnement
```bash
cp .env.local.example .env.local
# Remplis NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 3. Lancer en local
```bash
npm install
npm run dev
# → http://localhost:3000
```

---

## Déploiement Vercel (gratuit)

1. Push sur GitHub
2. Import sur https://vercel.com
3. Ajoute les 2 variables d'env dans Settings > Environment Variables
4. Deploy

Dans Supabase > Authentication > URL Configuration :
- Site URL : `https://ton-app.vercel.app`
- Redirect URLs : `https://ton-app.vercel.app/**`

---

## Structure

```
app/
  auth/login        → Connexion
  auth/register     → Inscription
  dashboard         → Total par compte
  accounts          → Gérer les comptes
  accounts/[id]     → Détail d'un compte
  expenses          → Tous les frais fixes
components/
  layout/Sidebar    → Navigation
  ui/AccountsList   → CRUD comptes
  ui/ExpensesList   → CRUD frais fixes
supabase/
  migrations/001    → Tables + RLS
```
