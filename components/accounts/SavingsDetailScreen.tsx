'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Pencil, PiggyBank } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Amount from '@/components/Amount'
import BlurToggle from '@/components/BlurToggle'
import Chip from '@/components/Chip'
import FlowForm, { type FlowFormPayload } from '@/components/forms/FlowForm'
import FlowRow from '@/components/movements/FlowRow'
import SavingsEditForm, { type SavingsEditPayload } from '@/components/forms/SavingsEditForm'
import SavingsSimulation from './SavingsSimulation'
import type { Account, MonthlyFlow } from '@/types'

const SELECT_CONTRIB = '*, accounts!monthly_flows_account_id_fkey(id, name, bank)'

interface Props {
  initialAccount: Account
  initialContributions: MonthlyFlow[]
  userId: string
}

type FormState = null | { mode: 'edit'; flow: MonthlyFlow }

export default function SavingsDetailScreen({ initialAccount, initialContributions, userId }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [account, setAccount] = useState(initialAccount)
  const [contribs, setContribs] = useState(initialContributions)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<FormState>(null)

  useEffect(() => {
    supabase.from('accounts').select('*').eq('user_id', userId).order('name').then(({ data }) => {
      setAccounts((data ?? []) as Account[])
    })
  }, [userId])

  const monthlyContribution = contribs.reduce((s, c) => s + Number(c.amount), 0)

  async function onSaveAccount(payload: SavingsEditPayload) {
    const { data } = await supabase.from('accounts').update(payload).eq('id', account.id).eq('user_id', userId).select().single()
    if (data) setAccount({ ...account, ...(data as Account) })
    setEditing(false)
  }

  async function reloadContribs() {
    const { data } = await supabase.from('monthly_flows').select(SELECT_CONTRIB)
      .eq('target_account_id', account.id).eq('kind', 'savings').order('created_at')
    setContribs((data ?? []) as unknown as MonthlyFlow[])
  }

  async function onSaveFlow(payload: FlowFormPayload) {
    if (!form) return
    await supabase.from('monthly_flows').update(payload).eq('id', form.flow.id)
    await reloadContribs()
    setForm(null)
  }

  async function onDeleteFlow(id: string) {
    await supabase.from('monthly_flows').delete().eq('id', id)
    setContribs(prev => prev.filter(c => c.id !== id))
  }

  const balance = account.current_balance ?? 0
  const dateLabel = account.balance_updated_at
    ? new Date(account.balance_updated_at).toLocaleDateString('fr-FR')
    : null

  return (
    <div>
      <button
        type="button"
        onClick={() => router.push('/dashboard')}
        className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-ink-400 hover:text-ink-700 transition-colors mb-3.5 whitespace-nowrap"
      >
        <ChevronLeft size={15} /> Tableau de bord
      </button>

      <div className="flex items-center gap-3.5 mb-6">
        <Chip category="savings" icon={PiggyBank} variant="soft" size={46} />
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-[28px] font-semibold text-ink-900 leading-tight whitespace-nowrap">{account.name}</h1>
          {account.bank && <p className="text-sm text-ink-400 mt-0.5">{account.bank}</p>}
        </div>
        <BlurToggle />
      </div>

      <div className="bg-cat-savings-soft rounded-3xl px-7 py-6 mb-6">
        <div className="flex items-start">
          <div className="flex-1">
            <p className="text-[12.5px] font-semibold uppercase tracking-wide text-ink-600">Solde actuel</p>
            <Amount
              value={balance}
              className="font-display text-[44px] font-semibold text-cat-savings-ink leading-[1.05] my-1 block"
            />
            <p className="text-[13px] text-ink-600">
              {dateLabel ? `Renseigné le ${dateLabel}` : 'Aucune date renseignée'}
              {account.interest_rate != null && ` · taux ${account.interest_rate} % / an`}
              {account.cap != null && <> · plafond <Amount value={account.cap} /></>}
            </p>
          </div>
          {!editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="btn-violet"
            >
              <Pencil size={15} strokeWidth={2.4} /> Modifier
            </button>
          )}
        </div>
        {editing && (
          <SavingsEditForm
            initial={account}
            onSave={onSaveAccount}
            onCancel={() => setEditing(false)}
          />
        )}
      </div>

      <div className="mb-6">
        <SavingsSimulation
          startBalance={balance}
          monthlyContribution={monthlyContribution}
          annualRate={account.interest_rate}
          cap={account.cap}
        />
      </div>

      <h2 className="text-[12.5px] font-bold text-ink-400 uppercase tracking-wide mb-3 px-0.5">Contributions mensuelles</h2>

      {form && (
        <FlowForm
          initial={form.flow}
          accounts={accounts}
          onSave={onSaveFlow}
          onCancel={() => setForm(null)}
        />
      )}

      {contribs.length === 0 ? (
        <div className="bg-white border border-ink-100 rounded-[20px] px-5 py-6 text-center text-[13.5px] text-ink-400">
          Aucune contribution pour l’instant.
        </div>
      ) : (
        <div className="bg-white border border-ink-100 rounded-[20px] px-5">
          {contribs.map((c, i) => (
            <div key={c.id} className={i > 0 ? 'border-t border-ink-100' : ''}>
              <FlowRow
                flow={c}
                accounts={accounts}
                onEdit={() => setForm({ mode: 'edit', flow: c })}
                onDelete={() => onDeleteFlow(c.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
