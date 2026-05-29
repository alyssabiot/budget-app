'use client'
import { useState } from 'react'
import { Field, FormCard } from './primitives'
import type { Account, FlowKind, MonthlyFlow } from '@/types'

export interface FlowFormPayload {
  name: string
  amount: number
  kind: FlowKind
  account_id: string
  target_account_id: string | null
}

interface Props {
  initial: MonthlyFlow | null
  accounts: Account[]
  lockAccountId?: string
  onSave: (payload: FlowFormPayload) => void
  onCancel: () => void
}

const KIND_OPTS: { value: FlowKind; label: string }[] = [
  { value: 'expense', label: 'Frais' },
  { value: 'savings', label: 'Épargne' },
  { value: 'income',  label: 'Revenu' },
  { value: 'transfer', label: 'Virement' },
]

export default function FlowForm({ initial, accounts, lockAccountId, onSave, onCancel }: Props) {
  const checking = accounts.filter(a => a.type === 'checking')
  const savings  = accounts.filter(a => a.type === 'savings')

  function defaultTarget(kind: FlowKind, src: string): string {
    if (kind === 'savings') return savings[0]?.id ?? ''
    if (kind === 'transfer') return checking.find(a => a.id !== src)?.id ?? ''
    return ''
  }

  const initSrc = lockAccountId ?? initial?.account_id ?? checking[0]?.id ?? accounts[0]?.id ?? ''

  const [f, setF] = useState(() => initial ? {
    name: initial.name,
    amount: String(initial.amount),
    kind: initial.kind,
    account: initial.account_id,
    target: initial.target_account_id ?? '',
  } : {
    name: '',
    amount: '',
    kind: 'expense' as FlowKind,
    account: initSrc,
    target: defaultTarget('expense', initSrc),
  })
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF(s => ({ ...s, [k]: v }))

  function onKind(kind: FlowKind) {
    setF(s => ({
      ...s,
      kind,
      target: (kind === 'savings' || kind === 'transfer')
        ? (s.target || defaultTarget(kind, s.account))
        : '',
    }))
  }

  const requiresTarget = f.kind === 'savings' || f.kind === 'transfer'
  const sourceOpts = f.kind === 'expense' ? accounts : checking
  const transferTargets = checking.filter(a => a.id !== f.account)
  const showSource = !lockAccountId || f.account !== lockAccountId
  const canSave = !!(f.name.trim() && f.amount && parseFloat(f.amount) > 0 && f.account &&
    (!requiresTarget || (f.target && f.target !== f.account)))

  function save() {
    onSave({
      name: f.name.trim(),
      amount: parseFloat(f.amount),
      kind: f.kind,
      account_id: f.account,
      target_account_id: requiresTarget ? f.target : null,
    })
  }

  const srcLabel = f.kind === 'savings' ? 'Compte source *'
    : f.kind === 'income' ? 'Compte crédité *'
    : f.kind === 'transfer' ? 'Compte source *'
    : 'Compte *'

  return (
    <FormCard
      title={initial ? 'Modifier le mouvement' : 'Nouveau mouvement'}
      onSave={save}
      onCancel={onCancel}
      saveLabel={initial ? 'Modifier' : 'Ajouter'}
      canSave={canSave}
    >
      <div className="flex gap-3.5 flex-wrap">
        <Field label="Libellé *">
          <input
            className="bento-field"
            placeholder="Salaire, Loyer, Virement…"
            autoFocus
            value={f.name}
            onChange={e => set('name', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && canSave && save()}
          />
        </Field>
        <Field label="Montant (€) *" width="140px">
          <input
            type="number" min="0" step="0.01"
            className="bento-field"
            placeholder="0"
            value={f.amount}
            onChange={e => set('amount', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && canSave && save()}
          />
        </Field>
        <Field label="Type *" width="150px">
          <select
            className="bento-field"
            value={f.kind}
            onChange={e => onKind(e.target.value as FlowKind)}
          >
            {KIND_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
      </div>

      {(showSource || f.kind === 'savings' || f.kind === 'transfer') && (
        <div className="flex gap-3.5 flex-wrap mt-3.5">
          {showSource && (
            <Field label={srcLabel}>
              <select
                className="bento-field"
                value={f.account}
                onChange={e => set('account', e.target.value)}
              >
                <option value="">Choisir…</option>
                {sourceOpts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </Field>
          )}
          {f.kind === 'savings' && (
            <Field label="Compte d&apos;épargne destination *">
              {savings.length > 0 ? (
                <select
                  className="bento-field"
                  value={f.target}
                  onChange={e => set('target', e.target.value)}
                >
                  <option value="">Choisir…</option>
                  {savings.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              ) : (
                <div className="text-sm text-ink-400 py-2.5">Crée d&apos;abord un compte d&apos;épargne.</div>
              )}
            </Field>
          )}
          {f.kind === 'transfer' && (
            <Field label="Compte destination *">
              {transferTargets.length > 0 ? (
                <select
                  className="bento-field"
                  value={f.target}
                  onChange={e => set('target', e.target.value)}
                >
                  <option value="">Choisir…</option>
                  {transferTargets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              ) : (
                <div className="text-sm text-ink-400 py-2.5">Il faut deux comptes courants.</div>
              )}
            </Field>
          )}
        </div>
      )}
    </FormCard>
  )
}
