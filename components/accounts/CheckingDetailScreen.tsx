'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Amount from '@/components/Amount'
import PageHeader from '@/components/PageHeader'
import PastelStat from '@/components/PastelStat'
import FlowForm, { type FlowFormPayload } from '@/components/forms/FlowForm'
import FlowRow from '@/components/movements/FlowRow'
import type { Account, FlowKind, MonthlyFlow } from '@/types'

const SELECT_OUT = '*, accounts!monthly_flows_account_id_fkey(id, name, bank), target_account:accounts!monthly_flows_target_account_id_fkey(id, name)'
const SELECT_IN  = '*, source_account:accounts!monthly_flows_account_id_fkey(id, name)'

type FormState = null | { mode: 'add' } | { mode: 'edit'; flow: MonthlyFlow }

interface Props {
  initialAccount: Account
  initialFlows: MonthlyFlow[]
  userId: string
}

function withDirection(rows: MonthlyFlow[], direction: 'out' | 'in'): MonthlyFlow[] {
  return rows.map(r => ({ ...r, direction }))
}

export default function CheckingDetailScreen({ initialAccount, initialFlows, userId }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [account] = useState(initialAccount)
  const [flows, setFlows] = useState(initialFlows)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [form, setForm] = useState<FormState>(null)

  useEffect(() => {
    supabase.from('accounts').select('*').eq('user_id', userId).order('name').then(({ data }) => {
      setAccounts((data ?? []) as Account[])
    })
  }, [userId])

  async function reload() {
    const [{ data: out }, { data: incoming }] = await Promise.all([
      supabase.from('monthly_flows').select(SELECT_OUT).eq('account_id', account.id).order('created_at'),
      supabase.from('monthly_flows').select(SELECT_IN).eq('target_account_id', account.id).eq('kind', 'transfer').order('created_at'),
    ])
    setFlows([
      ...withDirection((out ?? []) as unknown as MonthlyFlow[], 'out'),
      ...withDirection((incoming ?? []) as unknown as MonthlyFlow[], 'in'),
    ])
  }

  async function onSave(payload: FlowFormPayload) {
    if (form?.mode === 'edit') {
      await supabase.from('monthly_flows').update(payload).eq('id', form.flow.id)
    } else {
      await supabase.from('monthly_flows').insert({ ...payload, user_id: userId })
    }
    await reload()
    setForm(null)
  }

  async function onDelete(id: string) {
    await supabase.from('monthly_flows').delete().eq('id', id)
    setFlows(prev => prev.filter(f => f.id !== id))
  }

  const out = flows.filter(f => f.direction !== 'in')
  const sumKind = (k: FlowKind) => out.filter(f => f.kind === k).reduce((s, f) => s + Number(f.amount), 0)
  const incomeTotal  = sumKind('income')
  const expenseTotal = sumKind('expense')
  const savingsTotal = sumKind('savings')
  const transferOut  = sumKind('transfer')
  const transferIn   = flows.filter(f => f.direction === 'in').reduce((s, f) => s + Number(f.amount), 0)
  const transferNet  = transferIn - transferOut
  const inflow       = incomeTotal + transferIn
  const outflow      = expenseTotal + savingsTotal + transferOut
  const remaining    = inflow - outflow
  const overspend    = remaining < 0

  return (
    <div>
      <PageHeader
        title={account.name}
        subtitle={account.bank ?? undefined}
        back
        onBack={() => router.push('/dashboard')}
        action={!form && (
          <button
            type="button"
            onClick={() => setForm({ mode: 'add' })}
            className="btn-dark h-[42px] px-[18px] rounded-[13px] text-sm font-semibold"
          >
            <Plus size={17} strokeWidth={2.4} /> Nouveau mouvement
          </button>
        )}
      />

      {form && (
        <FlowForm
          initial={form.mode === 'edit' ? form.flow : null}
          accounts={accounts}
          lockAccountId={form.mode === 'add' ? account.id : undefined}
          onSave={onSave}
          onCancel={() => setForm(null)}
        />
      )}

      {overspend && (
        <div className="flex items-start gap-3 bg-cat-expense-soft rounded-2xl px-[18px] py-3.5 mb-5">
          <AlertTriangle size={18} className="text-cat-expense-solid mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-sm text-cat-expense-ink">Sorties supérieures aux entrées</p>
            <p className="text-[13px] text-ink-600 mt-0.5">
              Les sorties (<Amount value={outflow} />) dépassent les entrées (<Amount value={inflow} />) de <Amount value={-remaining} />.
            </p>
          </div>
        </div>
      )}

      <div
        className="grid gap-3 mb-7"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}
      >
        <PastelStat category="income"    label="Revenus"     value={incomeTotal} />
        <PastelStat category="expense"   label="Frais"       value={expenseTotal} />
        <PastelStat category="savings"   label="Épargne"     value={savingsTotal} />
        <PastelStat category="total"     label="Virements"   value={transferNet} signed />
        <PastelStat category="remaining" label="Reste dispo" value={remaining} signed />
      </div>

      <h2 className="text-[12.5px] font-bold text-ink-400 uppercase tracking-wide mb-3 px-0.5">Mouvements</h2>
      {flows.length === 0 ? (
        <div className="bg-white border border-ink-100 rounded-[20px] px-5 py-9 text-center text-sm text-ink-400">
          Aucun mouvement sur ce compte.
        </div>
      ) : (
        <div className="bg-white border border-ink-100 rounded-[20px] px-5">
          {flows.map((f, i) => (
            <div key={f.id} className={i > 0 ? 'border-t border-ink-100' : ''}>
              <FlowRow
                flow={f}
                accounts={accounts}
                incoming={f.direction === 'in'}
                hideSource
                onEdit={() => setForm({ mode: 'edit', flow: f })}
                onDelete={() => onDelete(f.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
