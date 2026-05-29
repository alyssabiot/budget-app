'use client'
import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import PageHeader from '@/components/PageHeader'
import FlowForm, { type FlowFormPayload } from '@/components/forms/FlowForm'
import FlowRow from './FlowRow'
import type { Account, FlowKind, MonthlyFlow } from '@/types'

const SELECT_OUT = '*, accounts!monthly_flows_account_id_fkey(id, name, bank), target_account:accounts!monthly_flows_target_account_id_fkey(id, name)'

const KIND_OPTS: { value: FlowKind; label: string }[] = [
  { value: 'expense',  label: 'Frais' },
  { value: 'savings',  label: 'Épargne' },
  { value: 'income',   label: 'Revenu' },
  { value: 'transfer', label: 'Virement' },
]

type FormState = null | { mode: 'add' } | { mode: 'edit'; flow: MonthlyFlow }
type KindFilter = 'all' | FlowKind

export default function MovementsScreen() {
  const [flows, setFlows] = useState<MonthlyFlow[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [userId, setUserId] = useState('')
  const [form, setForm] = useState<FormState>(null)
  const [filter, setFilter] = useState('all')
  const [kindFilter, setKindFilter] = useState<KindFilter>('all')
  const supabase = createClient()

  async function reload(uid: string) {
    const [{ data: a }, { data: f }] = await Promise.all([
      supabase.from('accounts').select('id, name, bank, type, user_id, created_at, current_balance, balance_updated_at, interest_rate, cap').eq('user_id', uid).order('name'),
      supabase.from('monthly_flows').select(SELECT_OUT).eq('user_id', uid).order('created_at'),
    ])
    setAccounts((a ?? []) as Account[])
    setFlows((f ?? []) as unknown as MonthlyFlow[])
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      setUserId(data.user.id)
      reload(data.user.id)
    })
  }, [])

  async function onSave(payload: FlowFormPayload) {
    if (!userId) return
    if (form?.mode === 'edit') {
      await supabase.from('monthly_flows').update(payload).eq('id', form.flow.id)
    } else {
      await supabase.from('monthly_flows').insert({ ...payload, user_id: userId })
    }
    await reload(userId)
    setForm(null)
  }

  async function onDelete(id: string) {
    await supabase.from('monthly_flows').delete().eq('id', id)
    setFlows(prev => prev.filter(f => f.id !== id))
  }

  const filtered = flows.filter(f => {
    if (filter !== 'all' && f.account_id !== filter && f.target_account_id !== filter) return false
    if (kindFilter !== 'all' && f.kind !== kindFilter) return false
    return true
  })

  return (
    <div>
      <PageHeader
        title="Mouvements"
        subtitle={filtered.length > 0
          ? `${filtered.length} mouvement${filtered.length > 1 ? 's' : ''} récurrent${filtered.length > 1 ? 's' : ''} ce mois.`
          : 'Revenus, frais et épargne — tous comptes confondus.'}
        action={!form && (
          <button
            type="button"
            disabled={accounts.length === 0}
            onClick={() => setForm({ mode: 'add' })}
            className="btn-dark h-[42px] px-[18px] rounded-[13px] text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={17} strokeWidth={2.4} /> Nouveau mouvement
          </button>
        )}
      />

      {form && (
        <FlowForm
          initial={form.mode === 'edit' ? form.flow : null}
          accounts={accounts}
          onSave={onSave}
          onCancel={() => setForm(null)}
        />
      )}

      {accounts.length === 0 && !form && (
        <div className="bg-white border border-ink-100 rounded-[20px] px-5 py-10 text-center text-sm text-ink-400 mb-4">
          Crée d&apos;abord un compte avant d&apos;ajouter des mouvements.
        </div>
      )}

      {flows.length > 0 && (
        <div className="mb-4 flex gap-3 flex-wrap">
          {accounts.length > 1 && (
            <select
              className="bento-field max-w-[240px]"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              <option value="all">Tous les comptes</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          )}
          <select
            className="bento-field max-w-[240px]"
            value={kindFilter}
            onChange={e => setKindFilter(e.target.value as KindFilter)}
          >
            <option value="all">Tous les types</option>
            {KIND_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      )}

      {filtered.length === 0 && accounts.length > 0 ? (
        <div className="bg-white border border-ink-100 rounded-[20px] px-5 py-10 text-center text-sm text-ink-400">
          Aucun mouvement pour ce filtre.
        </div>
      ) : filtered.length > 0 ? (
        <div className="bg-white border border-ink-100 rounded-[20px] px-5">
          {filtered.map((f, i) => (
            <div key={f.id} className={i > 0 ? 'border-t border-ink-100' : ''}>
              <FlowRow
                flow={f}
                accounts={accounts}
                onEdit={() => setForm({ mode: 'edit', flow: f })}
                onDelete={() => onDelete(f.id)}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
