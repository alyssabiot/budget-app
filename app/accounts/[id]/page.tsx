import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { notFound } from 'next/navigation'
import ExpensesList from '@/components/ui/ExpensesList'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function AccountDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return notFound()

  const [{ data: account }, { data: expenses }] = await Promise.all([
    supabase.from('accounts').select('*').eq('id', params.id).eq('user_id', user.id).single(),
    supabase.from('fixed_expenses').select('*').eq('account_id', params.id).order('created_at'),
  ])

  if (!account) return notFound()

  const total = (expenses ?? []).reduce((s, e) => s + e.amount, 0)

  return (
    <div>
      <Link href="/accounts" className="inline-flex items-center gap-1 text-sm text-ink-400 hover:text-ink-700 mb-6 transition-colors">
        <ChevronLeft size={14} /> Comptes
      </Link>

      <div className="mb-8">
        <h1 className="font-display text-2xl text-ink-900">{account.name}</h1>
        {account.bank && <p className="text-sm text-ink-400 mt-0.5">{account.bank}</p>}
      </div>

      <div className="card p-5 mb-6">
        <p className="text-xs font-medium text-ink-400 uppercase tracking-wider mb-1">Total frais fixes</p>
        <p className="font-display text-3xl text-ink-900">{formatCurrency(total)}</p>
      </div>

      <h2 className="font-medium text-ink-700 text-sm mb-3">Frais fixes ({(expenses ?? []).length})</h2>
      <ExpensesList
        initialExpenses={expenses ?? []}
        accountId={account.id}
        userId={user.id}
        accounts={[{ id: account.id, name: account.name, bank: account.bank, user_id: user.id, created_at: account.created_at }]}
        lockAccount
      />
    </div>
  )
}