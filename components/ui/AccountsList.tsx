'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Pencil, Trash2, X, Check, Building2, PiggyBank } from 'lucide-react'
import type { Account, AccountType } from '@/types'

const EMPTY_FORM = {
  name: '',
  bank: '',
  type: 'checking' as AccountType,
  current_balance: '',
  balance_updated_at: '',
  interest_rate: '',
  cap: '',
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function AccountsList({ initialAccounts, userId: initialUserId }: { initialAccounts: Account[]; userId: string }) {
  const [accounts, setAccounts] = useState(initialAccounts)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId]     = useState<string | null>(null)
  const [form, setForm]         = useState({ ...EMPTY_FORM })
  const [loading, setLoading]   = useState(false)
  const [userId, setUserId]     = useState(initialUserId)
  const supabase = createClient()

  async function reload(uid: string) {
    const { data: accs } = await supabase
      .from('accounts').select('*').eq('user_id', uid).order('created_at')
    setAccounts((accs ?? []) as Account[])
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      setUserId(data.user.id)
      reload(data.user.id)
    })
  }, [])

  function openAdd() {
    setForm({ ...EMPTY_FORM, balance_updated_at: todayISO() })
    setEditId(null)
    setShowForm(true)
  }

  function openEdit(a: Account) {
    setForm({
      name: a.name,
      bank: a.bank ?? '',
      type: a.type,
      current_balance: a.current_balance != null ? String(a.current_balance) : '',
      balance_updated_at: a.balance_updated_at ? a.balance_updated_at.slice(0, 10) : todayISO(),
      interest_rate: a.interest_rate != null ? String(a.interest_rate) : '',
      cap: a.cap != null ? String(a.cap) : '',
    })
    setEditId(a.id)
    setShowForm(true)
  }

  function cancel() { setShowForm(false); setEditId(null) }

  async function save() {
    if (!form.name.trim()) return
    setLoading(true)
    const payload: Record<string, unknown> = {
      name: form.name.trim(),
      bank: form.bank.trim() || null,
      type: form.type,
    }
    if (form.type === 'savings') {
      payload.current_balance = form.current_balance ? parseFloat(form.current_balance) : null
      payload.balance_updated_at = form.balance_updated_at ? new Date(form.balance_updated_at).toISOString() : null
      payload.interest_rate = form.interest_rate ? parseFloat(form.interest_rate) : null
      payload.cap = form.cap ? parseFloat(form.cap) : null
    } else {
      payload.current_balance = null
      payload.balance_updated_at = null
      payload.interest_rate = null
      payload.cap = null
    }

    if (editId) {
      await supabase.from('accounts').update(payload).eq('id', editId)
    } else {
      await supabase.from('accounts').insert({ ...payload, user_id: userId })
    }
    await reload(userId)
    setLoading(false)
    cancel()
  }

  async function remove(id: string) {
    if (!confirm('Supprimer ce compte et tous ses mouvements ?')) return
    await supabase.from('accounts').delete().eq('id', id)
    setAccounts(accounts.filter(a => a.id !== id))
  }

  function row(a: Account) {
    const isSavings = a.type === 'savings'
    const Icon = isSavings ? PiggyBank : Building2
    return (
      <div key={a.id} className="card p-4 flex items-center gap-3 group">
        <div className="w-8 h-8 rounded-lg bg-ink-100 flex items-center justify-center shrink-0">
          <Icon size={14} className="text-ink-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-ink-900">{a.name}</p>
          {a.bank && <p className="text-xs text-ink-400">{a.bank}</p>}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => openEdit(a)} className="p-1.5 rounded text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-colors">
            <Pencil size={13} />
          </button>
          <button onClick={() => remove(a.id)} className="p-1.5 rounded text-ink-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    )
  }

  const checking = accounts.filter(a => a.type === 'checking')
  const savings  = accounts.filter(a => a.type === 'savings')

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={openAdd} className="btn-primary text-sm">
          <Plus size={14} /> Nouveau compte
        </button>
      </div>

      {showForm && (
        <div className="card p-4 mb-4 border-accent/30">
          <div className="flex gap-3 mb-3 flex-wrap">
            <div className="flex-1 min-w-32">
              <label className="label">Nom du compte *</label>
              <input className="input" placeholder="Compte principal" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                autoFocus onKeyDown={e => e.key === 'Enter' && save()} />
            </div>
            <div className="flex-1 min-w-32">
              <label className="label">Banque</label>
              <input className="input" placeholder="BNP, Crédit Agricole…" value={form.bank}
                onChange={e => setForm({ ...form, bank: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && save()} />
            </div>
            <div className="w-44">
              <label className="label">Type *</label>
              <select className="input" value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value as AccountType })}>
                <option value="checking">Compte courant</option>
                <option value="savings">Compte d&apos;épargne</option>
              </select>
            </div>
          </div>

          {form.type === 'savings' && (
            <div className="flex gap-3 mb-3 flex-wrap">
              <div className="w-32">
                <label className="label">Solde actuel (€)</label>
                <input type="number" className="input" placeholder="0" min="0" step="0.01"
                  value={form.current_balance}
                  onChange={e => setForm({ ...form, current_balance: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && save()} />
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
                  onChange={e => setForm({ ...form, interest_rate: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && save()} />
              </div>
              <div className="w-36">
                <label className="label">Plafond (€)</label>
                <input type="number" className="input" placeholder="22 950" min="0" step="0.01"
                  value={form.cap}
                  onChange={e => setForm({ ...form, cap: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && save()} />
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <button onClick={cancel} className="btn-ghost text-sm"><X size={13} /> Annuler</button>
            <button onClick={save} disabled={loading || !form.name.trim()} className="btn-primary text-sm">
              <Check size={13} /> {editId ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </div>
      )}

      {accounts.length === 0 && !showForm ? (
        <div className="card p-10 text-center text-sm text-ink-400">Aucun compte. Créez-en un pour commencer.</div>
      ) : (
        <div className="space-y-6">
          {checking.length > 0 && (
            <section>
              <h2 className="text-xs font-medium text-ink-400 uppercase tracking-wider mb-2 px-1">Comptes courants</h2>
              <div className="space-y-2">{checking.map(row)}</div>
            </section>
          )}
          {savings.length > 0 && (
            <section>
              <h2 className="text-xs font-medium text-ink-400 uppercase tracking-wider mb-2 px-1">Épargne</h2>
              <div className="space-y-2">{savings.map(row)}</div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
