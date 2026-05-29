'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { Building2, Plus } from 'lucide-react'

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const { data: acc } = await supabase
        .from('accounts')
        .select('*, fixed_expenses(amount)')
        .eq('user_id', data.user.id)
        .order('created_at')
      setAccounts((acc ?? []).map(a => ({
        ...a,
        total: (a.fixed_expenses as { amount: number }[]).reduce((s, e) => s + e.amount, 0),
      })))
      setLoading(false)
    })
  }, [])

  const grandTotal = accounts.reduce((s, a) => s + a.total, 0)

  if (loading) return <div className="text-sm text-ink-400">Chargement…</div>

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl text-ink-900">Tableau de bord</h1>
        <p className="text-sm text-ink-400 mt-1">Total de vos frais fixes par compte</p>
      </div>

      <div className="card p-6 mb-6">
        <p className="text-xs font-medium text-ink-400 uppercase tracking-wider mb-1">Total mensuel tous comptes</p>
        <p className="font-display text-4xl text-ink-900">{formatCurrency(grandTotal)}</p>
      </div>

      {accounts.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-ink-400 text-sm mb-4">Aucun compte pour l'instant</p>
          <Link href="/accounts" className="btn-primary text-sm inline-flex items-center gap-2">
            <Plus size={14} /> Créer un compte
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map(a => (
            <Link key={a.id} href={`/accounts/${a.id}`}
              className="card p-5 flex items-center gap-4 hover:border-ink-200 transition-colors block">
              <div className="w-9 h-9 rounded-lg bg-ink-100 flex items-center justify-center shrink-0">
                <Building2 size={16} className="text-ink-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-ink-900 text-sm">{a.name}</p>
                {a.bank && <p className="text-xs text-ink-400">{a.bank}</p>}
              </div>
              <div className="text-right shrink-0">
                <p className="font-display text-lg text-ink-900">{formatCurrency(a.total)}</p>
                <p className="text-xs text-ink-400">{(a.fixed_expenses as unknown[]).length} frais</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}