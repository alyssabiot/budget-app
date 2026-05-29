'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { firstNameFromEmail } from '@/lib/utils'
import Link from 'next/link'
import { Coins, PiggyBank, Plus, Receipt, TrendingUp } from 'lucide-react'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import HeroTile from '@/components/dashboard/HeroTile'
import StatTile from '@/components/dashboard/StatTile'
import CheckingRow from '@/components/dashboard/CheckingRow'
import SavingsRow from '@/components/dashboard/SavingsRow'
import type { Account, FlowKind } from '@/types'

type Flow = { amount: number; kind: FlowKind; target_account_id: string | null }
type AccountWithFlows = Account & { monthly_flows: Flow[] }

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<AccountWithFlows[]>([])
  const [firstName, setFirstName] = useState('')
  const [loading, setLoading]   = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      setFirstName(firstNameFromEmail(data.user.email))
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

  const transferInByTarget = new Map<string, number>()
  for (const a of accounts) {
    for (const f of a.monthly_flows) {
      if (f.kind === 'transfer' && f.target_account_id) {
        transferInByTarget.set(f.target_account_id, (transferInByTarget.get(f.target_account_id) ?? 0) + Number(f.amount))
      }
    }
  }

  const monthLabel = new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(new Date())

  return (
    <div>
      <DashboardHeader firstName={firstName} monthLabel={monthLabel} />

      <div className="grid grid-cols-[1.45fr_1fr_1fr] gap-3.5 mb-6">
        <HeroTile
          remaining={remaining}
          income={totalIncome}
          expense={totalExpenses}
          savings={totalSavingsMonthly}
        />
        <StatTile category="income"  label="Revenus"        value={totalIncome}         icon={TrendingUp} />
        <StatTile category="expense" label="Frais"          value={totalExpenses}       icon={Receipt} />
        <StatTile category="savings" label="Épargne / mois" value={totalSavingsMonthly} icon={PiggyBank} />
        <StatTile category="savings" label="Épargne totale" value={totalSavingsBalance} icon={Coins} />
      </div>

      {accounts.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-ink-400 text-sm mb-4">Aucun compte pour l&apos;instant</p>
          <Link href="/accounts" className="btn-dark text-sm inline-flex items-center gap-2">
            <Plus size={14} /> Créer un compte
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {checking.length > 0 && (
            <section>
              <h2 className="text-[12.5px] font-bold text-ink-400 uppercase tracking-wide mb-3 px-0.5">Comptes courants</h2>
              <div className="flex flex-col gap-2.5">
                {checking.map(a => {
                  const incomeTotal  = a.monthly_flows.filter(f => f.kind === 'income').reduce((s, f) => s + Number(f.amount), 0)
                  const expenseTotal = a.monthly_flows.filter(f => f.kind === 'expense').reduce((s, f) => s + Number(f.amount), 0)
                  const savingsTotal = a.monthly_flows.filter(f => f.kind === 'savings').reduce((s, f) => s + Number(f.amount), 0)
                  const transferOut  = a.monthly_flows.filter(f => f.kind === 'transfer').reduce((s, f) => s + Number(f.amount), 0)
                  const transferIn   = transferInByTarget.get(a.id) ?? 0
                  const inflow       = incomeTotal + transferIn
                  const outflow      = expenseTotal + savingsTotal + transferOut
                  const accRemaining = inflow - outflow
                  return (
                    <CheckingRow
                      key={a.id}
                      id={a.id}
                      name={a.name}
                      bank={a.bank}
                      remaining={accRemaining}
                      inflow={inflow}
                      outflow={outflow}
                      overspend={accRemaining < 0}
                    />
                  )
                })}
              </div>
            </section>
          )}

          {savings.length > 0 && (
            <section>
              <h2 className="text-[12.5px] font-bold text-ink-400 uppercase tracking-wide mb-3 px-0.5">Épargne</h2>
              <div className="flex flex-col gap-2.5">
                {savings.map(a => (
                  <SavingsRow
                    key={a.id}
                    id={a.id}
                    name={a.name}
                    bank={a.bank}
                    balance={Number(a.current_balance ?? 0)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
