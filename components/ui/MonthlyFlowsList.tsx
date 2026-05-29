'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import { Plus, Pencil, Trash2, X, Check, PiggyBank, ArrowRight, ArrowLeft, ArrowRightLeft, TrendingUp, TrendingDown } from 'lucide-react'
import type { MonthlyFlow, Account, FlowKind } from '@/types'

const EMPTY = {
  name: '',
  amount: '',
  account_id: '',
  kind: 'expense' as FlowKind,
  target_account_id: '',
}

const SELECT_OUT = '*, accounts!monthly_flows_account_id_fkey(id, name, bank), target_account:accounts!monthly_flows_target_account_id_fkey(id, name)'
const SELECT_IN  = '*, source_account:accounts!monthly_flows_account_id_fkey(id, name)'

interface Props {
  initialFlows: MonthlyFlow[]
  accounts: Account[]
  userId: string
  accountId?: string
  lockAccount?: boolean
}

function withDirection(rows: unknown[], direction: 'out' | 'in'): MonthlyFlow[] {
  return (rows as MonthlyFlow[]).map(r => ({ ...r, direction }))
}

export default function MonthlyFlowsList({ initialFlows, accounts: initialAccounts, userId: initialUserId, accountId, lockAccount }: Props) {
  const [flows, setFlows]         = useState(initialFlows)
  const [accounts, setAccounts]   = useState(initialAccounts)
  const [showForm, setShowForm]   = useState(false)
  const [editId, setEditId]       = useState<string | null>(null)
  const [form, setForm]           = useState({ ...EMPTY, account_id: accountId ?? '' })
  const [loading, setLoading]     = useState(false)
  const [userId, setUserId]       = useState(initialUserId)
  const [filterAccount, setFilterAccount] = useState(accountId ?? 'all')
  const supabase = createClient()

  async function reload(uid: string) {
    if (accountId) {
      const [{ data: out }, { data: incoming }] = await Promise.all([
        supabase.from('monthly_flows').select(SELECT_OUT).eq('account_id', accountId).order('created_at'),
        supabase.from('monthly_flows').select(SELECT_IN).eq('target_account_id', accountId).eq('kind', 'transfer').order('created_at'),
      ])
      setFlows([...withDirection(out ?? [], 'out'), ...withDirection(incoming ?? [], 'in')])
    } else {
      const { data: f } = await supabase.from('monthly_flows').select(SELECT_OUT).eq('user_id', uid).order('created_at')
      setFlows(withDirection(f ?? [], 'out'))
    }
  }

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      setUserId(data.user.id)

      const { data: acc } = await supabase.from('accounts')
        .select('id, name, bank, type, user_id, created_at')
        .eq('user_id', data.user.id).order('name')
      setAccounts((acc ?? []) as unknown as Account[])
      if (!form.account_id && acc && acc.length > 0) {
        setForm(fm => ({ ...fm, account_id: accountId ?? acc[0].id }))
      }
      await reload(data.user.id)
    })
  }, [])

  const checkingAccounts = accounts.filter(a => a.type === 'checking')
  const savingsAccounts  = accounts.filter(a => a.type === 'savings')

  function defaultTargetId(kind: FlowKind, sourceId: string): string {
    if (kind === 'savings') return savingsAccounts[0]?.id ?? ''
    if (kind === 'transfer') return checkingAccounts.find(a => a.id !== sourceId)?.id ?? ''
    return ''
  }

  function openAdd() {
    const defaultSourceId = accountId ?? checkingAccounts[0]?.id ?? accounts[0]?.id ?? ''
    setForm({ ...EMPTY, account_id: defaultSourceId, target_account_id: defaultTargetId('expense', defaultSourceId) })
    setEditId(null)
    setShowForm(true)
  }

  function openEdit(f: MonthlyFlow) {
    setForm({
      name: f.name,
      amount: String(f.amount),
      account_id: f.account_id,
      kind: f.kind,
      target_account_id: f.target_account_id ?? '',
    })
    setEditId(f.id)
    setShowForm(true)
  }

  function onKindChange(kind: FlowKind) {
    setForm(f => ({
      ...f,
      kind,
      target_account_id: kind === 'savings' || kind === 'transfer' ? (f.target_account_id || defaultTargetId(kind, f.account_id)) : '',
    }))
  }

  function cancel() { setShowForm(false); setEditId(null) }

  const requiresTarget = form.kind === 'savings' || form.kind === 'transfer'
  const canSave = !!(
    form.name.trim() &&
    form.amount &&
    form.account_id &&
    (!requiresTarget || (form.target_account_id && form.target_account_id !== form.account_id))
  )

  async function save() {
    if (!canSave) return
    setLoading(true)
    const payload = {
      name: form.name.trim(),
      amount: parseFloat(form.amount),
      account_id: form.account_id,
      user_id: userId,
      kind: form.kind,
      target_account_id: requiresTarget ? form.target_account_id : null,
    }

    if (editId) {
      await supabase.from('monthly_flows').update(payload).eq('id', editId)
    } else {
      await supabase.from('monthly_flows').insert(payload)
    }

    await reload(userId)
    setLoading(false)
    cancel()
  }

  async function remove(id: string) {
    await supabase.from('monthly_flows').delete().eq('id', id)
    setFlows(flows.filter(f => f.id !== id))
  }

  // Filtre dropdown (vue globale uniquement). En lockAccount les flows sont déjà scopés côté serveur (sortants + virements entrants).
  const filtered = lockAccount || filterAccount === 'all'
    ? flows
    : flows.filter(f => f.account_id === filterAccount)

  // Source du formulaire : revenu/épargne/virement → comptes courants ; frais → tous
  const sourceAccounts = form.kind === 'expense' ? accounts : checkingAccounts
  // Cible virement : comptes courants autres que la source
  const transferTargets = checkingAccounts.filter(a => a.id !== form.account_id)
  // En lockAccount on cache le sélecteur source, sauf quand on édite un virement entrant
  // (source ≠ compte courant affiché)
  const showSourceField = !lockAccount || (accountId != null && form.account_id !== '' && form.account_id !== accountId)

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
          <Plus size={14} /> Nouveau mouvement
        </button>
      </div>

      {accounts.length === 0 && (
        <div className="card p-6 text-center text-sm text-ink-400 mb-4">
          Créez d&apos;abord un compte avant d&apos;ajouter des mouvements.
        </div>
      )}

      {showForm && (
        <div className="card p-4 mb-4 border-accent/30">
          <div className="flex gap-3 mb-3 flex-wrap">
            <div className="flex-1 min-w-32">
              <label className="label">Libellé *</label>
              <input className="input" placeholder="Salaire, Loyer, Virement vers livret…" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                autoFocus onKeyDown={e => e.key === 'Enter' && save()} />
            </div>
            <div className="w-32">
              <label className="label">Montant (€) *</label>
              <input type="number" className="input" placeholder="0" min="0" step="0.01"
                value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && save()} />
            </div>
            <div className="w-32">
              <label className="label">Type *</label>
              <select className="input" value={form.kind}
                onChange={e => onKindChange(e.target.value as FlowKind)}>
                <option value="expense">Frais</option>
                <option value="savings">Épargne</option>
                <option value="income">Revenu</option>
                <option value="transfer">Virement</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mb-3 flex-wrap">
            {showSourceField && (
              <div className="flex-1 min-w-32">
                <label className="label">
                  {form.kind === 'savings' ? 'Compte source *'
                    : form.kind === 'income' ? 'Compte crédité *'
                    : form.kind === 'transfer' ? 'Compte source *'
                    : 'Compte *'}
                </label>
                <select className="input" value={form.account_id}
                  onChange={e => setForm({ ...form, account_id: e.target.value })}>
                  <option value="">Choisir…</option>
                  {sourceAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            )}
            {form.kind === 'savings' && (
              <div className="flex-1 min-w-32">
                <label className="label">Compte d&apos;épargne destination *</label>
                <select className="input" value={form.target_account_id}
                  onChange={e => setForm({ ...form, target_account_id: e.target.value })}>
                  <option value="">Choisir…</option>
                  {savingsAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                {savingsAccounts.length === 0 && (
                  <p className="text-xs text-ink-400 mt-1">Créez d&apos;abord un compte d&apos;épargne.</p>
                )}
              </div>
            )}
            {form.kind === 'transfer' && (
              <div className="flex-1 min-w-32">
                <label className="label">Compte destination *</label>
                <select className="input" value={form.target_account_id}
                  onChange={e => setForm({ ...form, target_account_id: e.target.value })}>
                  <option value="">Choisir…</option>
                  {transferTargets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                {transferTargets.length === 0 && (
                  <p className="text-xs text-ink-400 mt-1">Il faut au moins deux comptes courants pour faire un virement.</p>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <button onClick={cancel} className="btn-ghost text-sm"><X size={13} /> Annuler</button>
            <button onClick={save} disabled={loading || !canSave}
              className="btn-primary text-sm">
              <Check size={13} /> {editId ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="mb-3 px-1">
          <span className="text-xs text-ink-400">{filtered.length} mouvement{filtered.length > 1 ? 's' : ''}</span>
        </div>
      )}

      {filtered.length === 0 && accounts.length > 0 ? (
        <div className="card p-10 text-center text-sm text-ink-400">Aucun mouvement pour l&apos;instant.</div>
      ) : filtered.length > 0 ? (
        <div className="card divide-y divide-ink-100">
          {filtered.map(f => {
            const isIncomingTransfer = f.direction === 'in'
            const isPositive = f.kind === 'income' || isIncomingTransfer
            return (
              <div key={f.id} className="flex items-center gap-3 px-4 py-3 group hover:bg-ink-50 transition-colors">
                {f.kind === 'expense' && (
                  <div className="w-6 h-6 rounded bg-ink-100 flex items-center justify-center shrink-0" title="Frais">
                    <TrendingDown size={12} className="text-ink-500" />
                  </div>
                )}
                {f.kind === 'savings' && (
                  <div className="w-6 h-6 rounded bg-accent-light flex items-center justify-center shrink-0" title="Épargne">
                    <PiggyBank size={12} className="text-accent" />
                  </div>
                )}
                {f.kind === 'income' && (
                  <div className="w-6 h-6 rounded bg-emerald-50 flex items-center justify-center shrink-0" title="Revenu">
                    <TrendingUp size={12} className="text-emerald-600" />
                  </div>
                )}
                {f.kind === 'transfer' && (
                  <div className="w-6 h-6 rounded bg-amber-50 flex items-center justify-center shrink-0" title={isIncomingTransfer ? 'Virement entrant' : 'Virement sortant'}>
                    <ArrowRightLeft size={12} className="text-amber-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-900">{f.name}</p>
                  {isIncomingTransfer && f.source_account ? (
                    <p className="text-xs text-ink-400 inline-flex items-center gap-1">
                      <ArrowLeft size={10} /><span>{f.source_account.name}</span>
                    </p>
                  ) : !lockAccount && f.accounts ? (
                    <p className="text-xs text-ink-400 inline-flex items-center gap-1">
                      <span>{f.accounts.name}{f.accounts.bank ? ` · ${f.accounts.bank}` : ''}</span>
                      {(f.kind === 'savings' || f.kind === 'transfer') && f.target_account && (
                        <><ArrowRight size={10} /><span>{f.target_account.name}</span></>
                      )}
                    </p>
                  ) : lockAccount && (f.kind === 'savings' || f.kind === 'transfer') && f.target_account ? (
                    <p className="text-xs text-ink-400 inline-flex items-center gap-1">
                      <ArrowRight size={10} /><span>{f.target_account.name}</span>
                    </p>
                  ) : null}
                </div>
                <span className={`font-display text-sm mr-2 shrink-0 ${isPositive ? 'text-emerald-600' : 'text-ink-900'}`}>
                  {isPositive ? '+' : ''}{formatCurrency(f.amount)}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => openEdit(f)} className="p-1.5 rounded text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => remove(f.id)} className="p-1.5 rounded text-ink-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
