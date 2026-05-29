import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CheckingDetailScreen from '@/components/accounts/CheckingDetailScreen'
import SavingsDetailScreen from '@/components/accounts/SavingsDetailScreen'
import type { Account, MonthlyFlow } from '@/types'

export default async function AccountDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.error('[accounts/[id]] no authenticated user')
    return notFound()
  }

  const { data: account, error } = await supabase
    .from('accounts').select('*').eq('id', params.id).eq('user_id', user.id).single()

  if (error || !account) {
    console.error('[accounts/[id]] account fetch failed', { id: params.id, userId: user.id, error })
    return notFound()
  }

  if (account.type === 'savings') {
    const { data: contribs } = await supabase
      .from('monthly_flows')
      .select('*, accounts!monthly_flows_account_id_fkey(id, name, bank)')
      .eq('target_account_id', account.id)
      .eq('kind', 'savings')
      .order('created_at')

    return (
      <SavingsDetailScreen
        initialAccount={account as Account}
        initialContributions={(contribs ?? []) as unknown as MonthlyFlow[]}
        userId={user.id}
      />
    )
  }

  const [{ data: outFlows }, { data: inFlows }] = await Promise.all([
    supabase
      .from('monthly_flows')
      .select('*, accounts!monthly_flows_account_id_fkey(id, name, bank), target_account:accounts!monthly_flows_target_account_id_fkey(id, name)')
      .eq('account_id', params.id)
      .order('created_at'),
    supabase
      .from('monthly_flows')
      .select('*, source_account:accounts!monthly_flows_account_id_fkey(id, name)')
      .eq('target_account_id', params.id)
      .eq('kind', 'transfer')
      .order('created_at'),
  ])

  const out = ((outFlows ?? []) as unknown as MonthlyFlow[]).map(f => ({ ...f, direction: 'out' as const }))
  const incoming = ((inFlows ?? []) as unknown as MonthlyFlow[]).map(f => ({ ...f, direction: 'in' as const }))

  return (
    <CheckingDetailScreen
      initialAccount={account as Account}
      initialFlows={[...out, ...incoming]}
      userId={user.id}
    />
  )
}
