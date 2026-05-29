'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import { Plus, Pencil, Trash2, X, Check, Building2 } from 'lucide-react'
import Link from 'next/link'
import type { Account } from '@/types'

type EnrichedAccount = Account & { total: number }

export default function AccountsList({ initialAccounts, userId: initialUserId }: { initialAccounts: EnrichedAccount[]; userId: string }) {
  const [accounts, setAccounts] = useState(initialAccounts)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId]     = useState<string | null>(null)
  const [name, setName]         = useState('')
  const [bank, setBank]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [userId, setUserId]     = useState(initialUserId)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      setUserId(data.user.id)
      const { data: accounts } = await supabase
        .from('accounts')
        .select('*, fixed_expenses(amount)')
        .eq('user_id', data.user.id)
        .order('created_at')
      const enriched = (accounts ?? []).map(a => ({
        ...a,
        total: (a.fixed_expenses as { amount: number }[]).reduce((s, e) => s + e.amount, 0),
      }))
      setAccounts(enriched)
    })
  }, [])

  function openAdd() { setName(''); setBank(''); setEditId(null); setShowForm(true) }
  function openEdit(a: EnrichedAccount) { setName(a.name); setBank(a.bank ?? ''); setEditId(a.id); setShowForm(true) }
  function cancel() { setShowForm(false); setEditId(null) }

  async function save() {
    if (!name.trim()) return
    setLoading(true)
    if (editId) {
      const { data } = await supabase.from('accounts').update({ name: name.trim(), bank: bank.trim() || null })
        .eq('id', editId).select().single()
      if (data) setAccounts(accounts.map(a => a.id === editId ? { ...a, name: data.name, bank: data.bank } : a))
    } else {
      const { data } = await supabase.from('accounts').insert({ user_id: userId, name: name.trim(), bank: bank.trim() || null })
        .select().single()
      if (data) setAccounts([...accounts, { ...data, total: 0 }])
    }
    setLoading(false)
    cancel()
  }

  async function remove(id: string) {
    if (!confirm('Supprimer ce compte et tous ses frais fixes ?')) return
    await supabase.from('accounts').delete().eq('id', id)
    setAccounts(accounts.filter(a => a.id !== id))
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={openAdd} className="btn-primary text-sm">
          <Plus size={14} /> Nouveau compte
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="card p-4 mb-4 border-accent/30">
          <div className="flex gap-3 mb-3">
            <div className="flex-1">
              <label className="label">Nom du compte *</label>
              <input className="input" placeholder="Compte principal" value={name} onChange={e => setName(e.target.value)}
                autoFocus onKeyDown={e => e.key === 'Enter' && save()} />
            </div>
            <div className="flex-1">
              <label className="label">Banque</label>
              <input className="input" placeholder="BNP, Crédit Agricole…" value={bank} onChange={e => setBank(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && save()} />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={cancel} className="btn-ghost text-sm"><X size={13} /> Annuler</button>
            <button onClick={save} disabled={loading || !name.trim()} className="btn-primary text-sm">
              <Check size={13} /> {editId ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </div>
      )}

      {accounts.length === 0 && !showForm ? (
        <div className="card p-10 text-center text-sm text-ink-400">Aucun compte. Créez-en un pour commencer.</div>
      ) : (
        <div className="space-y-2">
          {accounts.map(a => (
            <div key={a.id} className="card p-4 flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-ink-100 flex items-center justify-center shrink-0">
                <Building2 size={14} className="text-ink-500" />
              </div>
              <Link href={`/accounts/${a.id}`} className="flex-1 min-w-0 hover:text-accent transition-colors">
                <p className="font-medium text-sm text-ink-900">{a.name}</p>
                {a.bank && <p className="text-xs text-ink-400">{a.bank}</p>}
              </Link>
              <span className="font-display text-ink-900 text-sm mr-2">{formatCurrency(a.total)}</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(a)} className="p-1.5 rounded text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-colors">
                  <Pencil size={13} />
                </button>
                <button onClick={() => remove(a.id)} className="p-1.5 rounded text-ink-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
