'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import type { FixedExpense, Account } from '@/types'

const EMPTY = { name: '', amount: '', account_id: '' }

interface Props {
  initialExpenses: FixedExpense[]
  accounts: Account[]
  userId: string
  accountId?: string
  lockAccount?: boolean
}

export default function ExpensesList({ initialExpenses, accounts: initialAccounts, userId: initialUserId, accountId, lockAccount }: Props) {
  const [expenses, setExpenses]   = useState(initialExpenses)
  const [accounts, setAccounts]   = useState(initialAccounts)
  const [showForm, setShowForm]   = useState(false)
  const [editId, setEditId]       = useState<string | null>(null)
  const [form, setForm]           = useState({ ...EMPTY, account_id: accountId ?? '' })
  const [loading, setLoading]     = useState(false)
  const [userId, setUserId]       = useState(initialUserId)
  const [filterAccount, setFilterAccount] = useState(accountId ?? 'all')
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      setUserId(data.user.id)

      const [{ data: exp }, { data: acc }] = await Promise.all([
        accountId
          ? supabase.from('fixed_expenses').select('*, accounts(id, name, bank)').eq('account_id', accountId).order('created_at')
          : supabase.from('fixed_expenses').select('*, accounts(id, name, bank)').eq('user_id', data.user.id).order('created_at'),
        lockAccount
          ? { data: initialAccounts }
          : supabase.from('accounts').select('id, name, bank, user_id, created_at').eq('user_id', data.user.id).order('name'),
      ])

      setExpenses(exp ?? [])
      setAccounts(acc ?? [])
      if (!form.account_id && acc && acc.length > 0) {
        setForm(f => ({ ...f, account_id: accountId ?? acc[0].id }))
      }
    })
  }, [])

  function openAdd() {
    setForm({ ...EMPTY, account_id: accountId ?? (accounts[0]?.id ?? '') })
    setEditId(null)
    setShowForm(true)
  }

  function openEdit(e: FixedExpense) {
    setForm({ name: e.name, amount: String(e.amount), account_id: e.account_id })
    setEditId(e.id)
    setShowForm(true)
  }

  function cancel() { setShowForm(false); setEditId(null) }

  async function save() {
    if (!form.name.trim() || !form.amount || !form.account_id) return
    setLoading(true)
    const payload = { name: form.name.trim(), amount: parseFloat(form.amount), account_id: form.account_id, user_id: userId }

    if (editId) {
      await supabase.from('fixed_expenses').update(payload).eq('id', editId)
    } else {
      await supabase.from('fixed_expenses').insert(payload)
    }

    // Recharger toute la liste
    const { data: exp } = accountId
      ? await supabase.from('fixed_expenses').select('*, accounts(id, name, bank)').eq('account_id', accountId).order('created_at')
      : await supabase.from('fixed_expenses').select('*, accounts(id, name, bank)').eq('user_id', userId).order('created_at')

    setExpenses(exp ?? [])
    setLoading(false)
    cancel()
  }

  async function remove(id: string) {
    await supabase.from('fixed_expenses').delete().eq('id', id)
    setExpenses(expenses.filter(e => e.id !== id))
  }

  const filtered = filterAccount === 'all' ? expenses : expenses.filter(e => e.account_id === filterAccount)
  const total    = filtered.reduce((s, e) => s + e.amount, 0)

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {!lockAccount && accounts.length > 1 && (
          <select className="input w-auto text-sm"
            value={filterAccount} onChange={e => setFilterAccount(e.target.value)}>
            <option value="all">Tous les comptes</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        )}
        <div className="flex-1" />
        <button onClick={openAdd} disabled={accounts.length === 0} className="btn-primary text-sm">
          <Plus size={14} /> Nouveau frais
        </button>
      </div>

      {accounts.length === 0 && (
        <div className="card p-6 text-center text-sm text-ink-400 mb-4">
          Créez d'abord un compte avant d'ajouter des frais.
        </div>
      )}

      {showForm && (
        <div className="card p-4 mb-4 border-accent/30">
          <div className="flex gap-3 mb-3 flex-wrap">
            <div className="flex-1 min-w-32">
              <label className="label">Libellé *</label>
              <input className="input" placeholder="Loyer, EDF, Netflix…" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                autoFocus onKeyDown={e => e.key === 'Enter' && save()} />
            </div>
            <div className="w-32">
              <label className="label">Montant (€) *</label>
              <input type="number" className="input" placeholder="0" min="0" step="0.01"
                value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && save()} />
            </div>
            {!lockAccount && (
              <div className="flex-1 min-w-32">
                <label className="label">Compte *</label>
                <select className="input" value={form.account_id}
                  onChange={e => setForm({ ...form, account_id: e.target.value })}>
                  <option value="">Choisir…</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={cancel} className="btn-ghost text-sm"><X size={13} /> Annuler</button>
            <button onClick={save} disabled={loading || !form.name.trim() || !form.amount || !form.account_id}
              className="btn-primary text-sm">
              <Check size={13} /> {editId ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="flex items-baseline justify-between mb-3 px-1">
          <span className="text-xs text-ink-400">{filtered.length} frais</span>
          <span className="font-display text-lg text-ink-900">{formatCurrency(total)}</span>
        </div>
      )}

      {filtered.length === 0 && accounts.length > 0 ? (
        <div className="card p-10 text-center text-sm text-ink-400">Aucun frais fixe pour l'instant.</div>
      ) : filtered.length > 0 ? (
        <div className="card divide-y divide-ink-100">
          {filtered.map(e => (
            <div key={e.id} className="flex items-center gap-3 px-4 py-3 group hover:bg-ink-50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink-900">{e.name}</p>
                {!lockAccount && e.accounts && (
                  <p className="text-xs text-ink-400">{e.accounts.name}{e.accounts.bank ? ` · ${e.accounts.bank}` : ''}</p>
                )}
              </div>
              <span className="font-display text-ink-900 text-sm mr-2 shrink-0">{formatCurrency(e.amount)}</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button onClick={() => openEdit(e)} className="p-1.5 rounded text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-colors">
                  <Pencil size={13} />
                </button>
                <button onClick={() => remove(e.id)} className="p-1.5 rounded text-ink-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}