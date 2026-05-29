import MonthlyFlowsList from '@/components/ui/MonthlyFlowsList'

export default function MovementsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl text-ink-900 mb-1">Mouvements</h1>
      <p className="text-sm text-ink-400 mb-8">Revenus, frais et épargne — tous comptes confondus</p>
      <MonthlyFlowsList initialFlows={[]} accounts={[]} userId="" />
    </div>
  )
}
