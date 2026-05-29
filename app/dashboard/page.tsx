'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { Building2, PiggyBank, Plus, AlertTriangle } from 'lucide-react'
import type { Account, FlowKind } from '@/types'

type Flow = { amount: number; kind: FlowKind; target_account_id: string | null }
type AccountWithFlows = Account & { monthly_flows: Flow[] }

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<AccountWithFlows[]>([])
  const [loading, setLoading]   = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const { data: acc } = await supabase
        .from('accounts')
        .select('*, monthly_flows!monthly_flows_account_id_fkey(amount, kind, target_account_id)')
        .eq('user_id', data.user.id)
        .order('created_at')
      setAccounts((acc ?? []) as unknown as AccountWithFlows[])
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="text-sm text-ink-400">Chargement…</div>

  const checking = accounts.filter(a => a.type === 'checking')
  const savings  = accounts.filter(a => a.type === 'savings')

  const sumKind = (kind: FlowKind) => checking.reduce((s, a) =>
    s + a.monthly_flows.filter(f => f.kind === kind).reduce((x, f) => x + Number(f.amount), 0), 0)

  const totalIncome   = sumKind('income')
  const totalExpenses = sumKind('expense')
  const totalSavingsMonthly = sumKind('savings')
  const totalSavingsBalance = savings.reduce((s, a) => s + Number(a.current_balance ?? 0), 0)
  // Virements internes : s'annulent au niveau utilisateur (sources et cibles sont des comptes courants)
  const remaining = totalIncome - totalExpenses - totalSavingsMonthly

  const contribByTarget = new Map<string, number>()
  const transferInByTarget = new Map<string, number>()
  for (const a of accounts) {
    for (const f of a.monthly_flows) {
      if (f.kind === 'savings' && f.target_account_id) {
        contribByTarget.set(f.target_account_id, (contribByTarget.get(f.target_account_id) ?? 0) + Number(f.amount))
      } else if (f.kind === 'transfer' && f.target_account_id) {
        transferInByTarget.set(f.target_account_id, (transferInByTarget.get(f.target_account_id) ?? 0) + Number(f.amount))
      }
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl text-ink-900">Tableau de bord</h1>
        <p className="text-sm text-ink-400 mt-1">Vue d&apos;ensemble de votre budget</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-5 flex flex-col">
          <p className="text-xs font-medium text-ink-400 uppercase tracking-wider mb-1">Revenus mensuels</p>
          <p className="font-display text-2xl text-emerald-600 mt-auto">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="card p-5 flex flex-col">
          <p className="text-xs font-medium text-ink-400 uppercase tracking-wider mb-1">Frais mensuels</p>
          <p className="font-display text-2xl text-ink-900 mt-auto">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="card p-5 flex flex-col">
          <p className="text-xs font-medium text-ink-400 uppercase tracking-wider mb-1">Épargne mensuelle</p>
          <p className="font-display text-2xl text-ink-900 mt-auto">{formatCurrency(totalSavingsMonthly)}</p>
        </div>
        <div className="card p-5 flex flex-col">
          <p className="text-xs font-medium text-ink-400 uppercase tracking-wider mb-1">Reste disponible</p>
          <p className={`font-display text-2xl mt-auto ${remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {remaining > 0 ? '+' : ''}{formatCurrency(remaining)}
          </p>
        </div>
        <div className="card p-5 flex flex-col">
          <p className="text-xs font-medium text-ink-400 uppercase tracking-wider mb-1">Épargne totale</p>
          <p className="font-display text-2xl text-ink-900 mt-auto">{formatCurrency(totalSavingsBalance)}</p>
        </div>
      </div>

      {accounts.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-ink-400 text-sm mb-4">Aucun compte pour l&apos;instant</p>
          <Link href="/accounts" className="btn-primary text-sm inline-flex items-center gap-2">
            <Plus size={14} /> Créer un compte
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {checking.length > 0 && (
            <section>
              <h2 className="text-xs font-medium text-ink-400 uppercase tracking-wider mb-2 px-1">Comptes courants</h2>
              <div className="space-y-3">
                {checking.map(a => {
                  const incomeTotal  = a.monthly_flows.filter(f => f.kind === 'income').reduce((s, f) => s + Number(f.amount), 0)
                  const expenseTotal = a.monthly_flows.filter(f => f.kind === 'expense').reduce((s, f) => s + Number(f.amount), 0)
                  const savingsTotal = a.monthly_flows.filter(f => f.kind === 'savings').reduce((s, f) => s + Number(f.amount), 0)
                  const transferOut  = a.monthly_flows.filter(f => f.kind === 'transfer').reduce((s, f) => s + Number(f.amount), 0)
                  const transferIn   = transferInByTarget.get(a.id) ?? 0
                  const inflow       = incomeTotal + transferIn
                  const outflow      = expenseTotal + savingsTotal + transferOut
                  const remaining    = inflow - outflow
                  const overspend    = remaining < 0
                  return (
                    <Link key={a.id} href={`/accounts/${a.id}`}
                      className="card p-5 flex items-center gap-4 hover:border-ink-200 transition-colors block">
                      <div className="w-9 h-9 rounded-lg bg-ink-100 flex items-center justify-center shrink-0">
                        <Building2 size={16} className="text-ink-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-ink-900 text-sm inline-flex items-center gap-1.5">
                          {a.name}
                          {overspend && (
                            <span title={`Sorties (${formatCurrency(outflow)}) supérieures aux entrées (${formatCurrency(inflow)})`}>
                              <AlertTriangle size={13} className="text-rose-500" />
                            </span>
                          )}
                        </p>
                        {a.bank && <p className="text-xs text-ink-400">{a.bank}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`font-display text-lg ${remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {remaining > 0 ? '+' : ''}{formatCurrency(remaining)}
                        </p>
                        <p className="text-xs text-ink-400">Reste disponible</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {savings.length > 0 && (
            <section>
              <h2 className="text-xs font-medium text-ink-400 uppercase tracking-wider mb-2 px-1">Épargne</h2>
              <div className="space-y-3">
                {savings.map(a => {
                  const monthly = contribByTarget.get(a.id) ?? 0
                  return (
                    <Link key={a.id} href={`/accounts/${a.id}`}
                      className="card p-5 flex items-center gap-4 hover:border-ink-200 transition-colors block">
                      <div className="w-9 h-9 rounded-lg bg-accent-light flex items-center justify-center shrink-0">
                        <PiggyBank size={16} className="text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-ink-900 text-sm">{a.name}</p>
                        {a.bank && <p className="text-xs text-ink-400">{a.bank}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-display text-lg text-ink-900">{formatCurrency(a.current_balance ?? 0)}</p>
                        {monthly > 0 && <p className="text-xs text-ink-400">+{formatCurrency(monthly)} / mois</p>}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
