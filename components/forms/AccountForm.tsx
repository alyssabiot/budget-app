'use client'
import { useState } from 'react'
import { Field, FormCard } from './primitives'
import type { Account, AccountType } from '@/types'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export interface AccountFormPayload {
  name: string
  bank: string | null
  type: AccountType
  current_balance: number | null
  balance_updated_at: string | null
  interest_rate: number | null
  cap: number | null
}

interface Props {
  initial: Account | null
  onSave: (payload: AccountFormPayload) => void
  onCancel: () => void
}

export default function AccountForm({ initial, onSave, onCancel }: Props) {
  const [f, setF] = useState(() => ({
    name: initial?.name ?? '',
    bank: initial?.bank ?? '',
    type: (initial?.type ?? 'checking') as AccountType,
    balance: initial?.current_balance != null ? String(initial.current_balance) : '',
    date: initial?.balance_updated_at ? initial.balance_updated_at.slice(0, 10) : todayISO(),
    rate: initial?.interest_rate != null ? String(initial.interest_rate) : '',
    cap: initial?.cap != null ? String(initial.cap) : '',
  }))
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF(s => ({ ...s, [k]: v }))
  const canSave = !!f.name.trim()

  function save() {
    const isSavings = f.type === 'savings'
    onSave({
      name: f.name.trim(),
      bank: f.bank.trim() || null,
      type: f.type,
      current_balance: isSavings && f.balance ? parseFloat(f.balance) : null,
      balance_updated_at: isSavings && f.date ? new Date(f.date).toISOString() : null,
      interest_rate: isSavings && f.rate ? parseFloat(f.rate) : null,
      cap: isSavings && f.cap ? parseFloat(f.cap) : null,
    })
  }

  return (
    <FormCard
      title={initial ? 'Modifier le compte' : 'Nouveau compte'}
      onSave={save}
      onCancel={onCancel}
      saveLabel={initial ? 'Modifier' : 'Créer'}
      canSave={canSave}
    >
      <div className="flex gap-3.5 flex-wrap">
        <Field label="Nom du compte *">
          <input
            className="bento-field"
            placeholder="Compte principal"
            autoFocus
            value={f.name}
            onChange={e => set('name', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && canSave && save()}
          />
        </Field>
        <Field label="Banque">
          <input
            className="bento-field"
            placeholder="Boursorama, Crédit Mutuel…"
            value={f.bank}
            onChange={e => set('bank', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && canSave && save()}
          />
        </Field>
        <Field label="Type *" width="190px">
          <select
            className="bento-field"
            value={f.type}
            onChange={e => set('type', e.target.value as AccountType)}
          >
            <option value="checking">Compte courant</option>
            <option value="savings">Compte d&apos;épargne</option>
          </select>
        </Field>
      </div>

      {f.type === 'savings' && (
        <div className="flex gap-3.5 flex-wrap mt-3.5">
          <Field label="Solde actuel (€)" width="150px">
            <input
              type="number" min="0" step="0.01"
              className="bento-field"
              placeholder="0"
              value={f.balance}
              onChange={e => set('balance', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canSave && save()}
            />
          </Field>
          <Field label="Date du solde" width="170px">
            <input
              type="date"
              className="bento-field"
              value={f.date}
              onChange={e => set('date', e.target.value)}
            />
          </Field>
          <Field label="Taux annuel %" width="140px">
            <input
              type="number" min="0" step="0.01"
              className="bento-field"
              placeholder="3"
              value={f.rate}
              onChange={e => set('rate', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canSave && save()}
            />
          </Field>
          <Field label="Plafond (€)" width="150px">
            <input
              type="number" min="0" step="0.01"
              className="bento-field"
              placeholder="22 950"
              value={f.cap}
              onChange={e => set('cap', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canSave && save()}
            />
          </Field>
        </div>
      )}
    </FormCard>
  )
}
