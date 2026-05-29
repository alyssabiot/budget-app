import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { notFound } from 'next/navigation'
import MonthlyFlowsList from '@/components/ui/MonthlyFlowsList'
import SavingsAccountView from '@/components/ui/SavingsAccountView'
import Link from 'next/link'
import { ChevronLeft, PiggyBank, AlertTriangle } from 'lucide-react'
import type { MonthlyFlow } from '@/types'

export default async function AccountDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.error('[accounts/[id]] no authenticated user')
    return notFound()
  }

  const { data: account, error } = await supabase
    .from('accounts').select('*').eq('id', params.id).eq('user_id', user.id).single()

  if (error || !account) {
    console.error('[accounts/[id]] account fetch failed', { id: params.id, userId: user.id, error })
    return notFound()
  }

  const isSavings = account.type === 'savings'

  if (isSavings) {
    const { data: contribs } = await supabase
      .from('monthly_flows')
      .select('*, accounts!monthly_flows_account_id_fkey(id, name, bank)')
      .eq('target_account_id', account.id)
      .eq('kind', 'savings')
      .order('created_at')

    return (
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-ink-400 hover:text-ink-700 mb-6 transition-colors">
          <ChevronLeft size={14} /> Tableau de bord
        </Link>

        <div className="mb-8 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent-light flex items-center justify-center">
            <PiggyBank size={16} className="text-accent" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-ink-900">{account.name}</h1>
            {account.bank && <p className="text-sm text-ink-400 mt-0.5">{account.bank}</p>}
          </div>
        </div>

        <SavingsAccountView
          initialAccount={account}
          initialContributions={(contribs ?? []) as unknown as MonthlyFlow[]}
          userId={user.id}
        />
      </div>
    )
  }

  const [{ data: outFlows }, { data: inFlows }] = await Promise.all([
    supabase
      .from('monthly_flows')
      .select('*, target_account:accounts!monthly_flows_target_account_id_fkey(id, name)')
      .eq('account_id', params.id)
      .order('created_at'),
    supabase
      .from('monthly_flows')
      .select('*, source_account:accounts!monthly_flows_account_id_fkey(id, name)')
      .eq('target_account_id', params.id)
      .eq('kind', 'transfer')
      .order('created_at'),
  ])

  const out = (outFlows ?? []) as unknown as MonthlyFlow[]
  const incoming = (inFlows ?? []) as unknown as MonthlyFlow[]
  const sumKind = (kind: MonthlyFlow['kind']) => out.filter(f => f.kind === kind).reduce((s, f) => s + Number(f.amount), 0)
  const incomeTotal   = sumKind('income')
  const expenseTotal  = sumKind('expense')
  const savingsTotal  = sumKind('savings')
  const transferOut   = sumKind('transfer')
  const transferIn    = incoming.reduce((s, f) => s + Number(f.amount), 0)
  const transferNet   = transferIn - transferOut
  const inflowTotal   = incomeTotal + transferIn
  const outflowTotal  = expenseTotal + savingsTotal + transferOut
  const overspend     = outflowTotal > inflowTotal ? outflowTotal - inflowTotal : 0
  const remaining     = inflowTotal - outflowTotal
  const flowsList = [
    ...out.map(f => ({ ...f, direction: 'out' as const })),
    ...incoming.map(f => ({ ...f, direction: 'in' as const })),
  ]

  return (
    <div>
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-ink-400 hover:text-ink-700 mb-6 transition-colors">
        <ChevronLeft size={14} /> Tableau de bord
      </Link>

      <div className="mb-8">
        <h1 className="font-display text-2xl text-ink-900">{account.name}</h1>
        {account.bank && <p className="text-sm text-ink-400 mt-0.5">{account.bank}</p>}
      </div>

      {overspend > 0 && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4">
          <AlertTriangle size={16} className="text-rose-600 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-rose-900">Sorties supérieures aux entrées</p>
            <p className="text-rose-700 mt-0.5">
              Les sorties mensuelles ({formatCurrency(outflowTotal)}) dépassent les entrées ({formatCurrency(inflowTotal)}) de {formatCurrency(overspend)}.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-5 flex flex-col">
          <p className="text-xs font-medium text-ink-400 uppercase tracking-wider mb-1">Revenus mensuels</p>
          <p className="font-display text-2xl text-emerald-600 mt-auto">{formatCurrency(incomeTotal)}</p>
        </div>
        <div className="card p-5 flex flex-col">
          <p className="text-xs font-medium text-ink-400 uppercase tracking-wider mb-1">Frais mensuels</p>
          <p className="font-display text-2xl text-ink-900 mt-auto">{formatCurrency(expenseTotal)}</p>
        </div>
        <div className="card p-5 flex flex-col">
          <p className="text-xs font-medium text-ink-400 uppercase tracking-wider mb-1">Épargne mensuelle</p>
          <p className="font-display text-2xl text-ink-900 mt-auto">{formatCurrency(savingsTotal)}</p>
        </div>
        <div className="card p-5 flex flex-col">
          <p className="text-xs font-medium text-ink-400 uppercase tracking-wider mb-1">Virements</p>
          <p className={`font-display text-2xl mt-auto ${transferNet > 0 ? 'text-emerald-600' : transferNet < 0 ? 'text-ink-900' : 'text-ink-400'}`}>
            {transferNet > 0 ? '+' : ''}{formatCurrency(transferNet)}
          </p>
        </div>
        <div className="card p-5 flex flex-col">
          <p className="text-xs font-medium text-ink-400 uppercase tracking-wider mb-1">Reste disponible</p>
          <p className={`font-display text-2xl mt-auto ${remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {remaining > 0 ? '+' : ''}{formatCurrency(remaining)}
          </p>
        </div>
      </div>

      <h2 className="font-medium text-ink-700 text-sm mb-3">Mouvements</h2>
      <MonthlyFlowsList
        initialFlows={flowsList}
        accountId={account.id}
        userId={user.id}
        accounts={[account]}
        lockAccount
      />
    </div>
  )
}
