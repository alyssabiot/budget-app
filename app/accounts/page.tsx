import AccountsList from '@/components/ui/AccountsList'

export default function AccountsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl text-ink-900 mb-1">Comptes</h1>
      <p className="text-sm text-ink-400 mb-8">Gérez vos comptes courants</p>
      <AccountsList initialAccounts={[]} userId="" />
    </div>
  )
}