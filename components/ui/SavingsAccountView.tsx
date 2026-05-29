'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import { Pencil, X, Check, ArrowRight } from 'lucide-react'
import SavingsSimulation from './SavingsSimulation'
import type { Account, MonthlyFlow } from '@/types'

interface Props {
  initialAccount: Account
  initialContributions: MonthlyFlow[]
  userId: string
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function SavingsAccountView({ initialAccount, initialContributions, userId }: Props) {
  const [account, setAccount] = useState(initialAccount)
  const [contribs] = useState(initialContributions)
  const [edit, setEdit] = useState(false)
  const [form, setForm] = useState({
    current_balance: account.current_balance != null ? String(account.current_balance) : '',
    balance_updated_at: account.balance_updated_at ? account.balance_updated_at.slice(0, 10) : todayISO(),
    interest_rate: account.interest_rate != null ? String(account.interest_rate) : '',
    cap: account.cap != null ? String(account.cap) : '',
  })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const monthlyContribution = contribs.reduce((s, c) => s + Number(c.amount), 0)

  async function save() {
    setLoading(true)
    const payload = {
      current_balance: form.current_balance ? parseFloat(form.current_balance) : null,
      balance_updated_at: form.balance_updated_at ? new Date(form.balance_updated_at).toISOString() : null,
      interest_rate: form.interest_rate ? parseFloat(form.interest_rate) : null,
      cap: form.cap ? parseFloat(form.cap) : null,
    }
    const { data } = await supabase.from('accounts').update(payload).eq('id', account.id).eq('user_id', userId).select().single()
    if (data) setAccount({ ...account, ...data })
    setLoading(false)
    setEdit(false)
  }

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-xs font-medium text-ink-400 uppercase tracking-wider mb-1">Solde actuel</p>
            <p className="font-display text-3xl text-ink-900">{formatCurrency(account.current_balance ?? 0)}</p>
            <p className="text-xs text-ink-400 mt-1">
              {account.balance_updated_at
                ? `Renseigné le ${new Date(account.balance_updated_at).toLocaleDateString('fr-FR')}`
                : 'Aucune date renseignée'}
              {account.interest_rate != null ? ` · taux ${account.interest_rate}% / an` : ''}
              {account.cap != null ? ` · plafond ${formatCurrency(account.cap)}` : ''}
            </p>
          </div>
          {!edit && (
            <button onClick={() => setEdit(true)} className="btn-ghost text-sm">
              <Pencil size={13} /> Modifier
            </button>
          )}
        </div>

        {edit && (
          <div className="border-t border-ink-100 pt-4">
            <div className="flex gap-3 mb-3 flex-wrap">
              <div className="w-32">
                <label className="label">Solde (€)</label>
                <input type="number" className="input" placeholder="0" min="0" step="0.01"
                  value={form.current_balance}
                  onChange={e => setForm({ ...form, current_balance: e.target.value })} />
              </div>
              <div className="w-40">
                <label className="label">Date du solde</label>
                <input type="date" className="input"
                  value={form.balance_updated_at}
                  onChange={e => setForm({ ...form, balance_updated_at: e.target.value })} />
              </div>
              <div className="w-32">
                <label className="label">Taux annuel %</label>
                <input type="number" className="input" placeholder="3" min="0" step="0.01"
                  value={form.interest_rate}
                  onChange={e => setForm({ ...form, interest_rate: e.target.value })} />
              </div>
              <div className="w-36">
                <label className="label">Plafond (€)</label>
                <input type="number" className="input" placeholder="22 950" min="0" step="0.01"
                  value={form.cap}
                  onChange={e => setForm({ ...form, cap: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setEdit(false)} className="btn-ghost text-sm"><X size={13} /> Annuler</button>
              <button onClick={save} disabled={loading} className="btn-primary text-sm">
                <Check size={13} /> Enregistrer
              </button>
            </div>
          </div>
        )}
      </div>

      <SavingsSimulation
        startBalance={account.current_balance ?? 0}
        monthlyContribution={monthlyContribution}
        annualRate={account.interest_rate}
        cap={account.cap}
      />

      <div>
        <h2 className="font-medium text-ink-700 text-sm mb-3">Contributions mensuelles</h2>
        {contribs.length === 0 ? (
          <div className="card p-6 text-center text-sm text-ink-400">
            Aucune contribution. Ajoutez un frais de type « épargne » depuis un compte courant ciblant ce compte.
          </div>
        ) : (
          <div className="card divide-y divide-ink-100">
            {contribs.map(c => (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-900">{c.name}</p>
                  {c.accounts && (
                    <p className="text-xs text-ink-400 inline-flex items-center gap-1">
                      <span>{c.accounts.name}</span><ArrowRight size={10} /><span>{account.name}</span>
                    </p>
                  )}
                </div>
                <span className="font-display text-ink-900 text-sm shrink-0">{formatCurrency(c.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
