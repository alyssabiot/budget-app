'use client'
import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { Field } from './primitives'
import type { Account } from '@/types'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export interface SavingsEditPayload {
  current_balance: number | null
  balance_updated_at: string | null
  interest_rate: number | null
  cap: number | null
}

interface Props {
  initial: Account
  onSave: (payload: SavingsEditPayload) => void
  onCancel: () => void
}

export default function SavingsEditForm({ initial, onSave, onCancel }: Props) {
  const [f, setF] = useState({
    balance: initial.current_balance != null ? String(initial.current_balance) : '',
    date: initial.balance_updated_at ? initial.balance_updated_at.slice(0, 10) : todayISO(),
    rate: initial.interest_rate != null ? String(initial.interest_rate) : '',
    cap: initial.cap != null ? String(initial.cap) : '',
  })
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF(s => ({ ...s, [k]: v }))

  function save() {
    onSave({
      current_balance: f.balance ? parseFloat(f.balance) : null,
      balance_updated_at: f.date ? new Date(f.date).toISOString() : null,
      interest_rate: f.rate ? parseFloat(f.rate) : null,
      cap: f.cap ? parseFloat(f.cap) : null,
    })
  }

  return (
    <div className="border-t border-ink-100 mt-4 pt-4">
      <div className="flex gap-3.5 flex-wrap">
        <Field label="Solde (€)" width="150px">
          <input
            type="number" min="0" step="0.01"
            className="bento-field"
            value={f.balance}
            onChange={e => set('balance', e.target.value)}
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
            value={f.rate}
            onChange={e => set('rate', e.target.value)}
          />
        </Field>
        <Field label="Plafond (€)" width="150px">
          <input
            type="number" min="0" step="0.01"
            className="bento-field"
            placeholder="aucun"
            value={f.cap}
            onChange={e => set('cap', e.target.value)}
          />
        </Field>
      </div>
      <div className="flex gap-2.5 justify-end mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-ghost inline-flex items-center gap-2 h-[42px] px-[18px] rounded-[13px] text-sm font-semibold"
        >
          <X size={17} strokeWidth={2.4} /> Annuler
        </button>
        <button
          type="button"
          onClick={save}
          className="btn-violet"
        >
          <Check size={17} strokeWidth={2.4} /> Enregistrer
        </button>
      </div>
    </div>
  )
}
