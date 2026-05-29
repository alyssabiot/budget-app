import ExpensesList from '@/components/ui/ExpensesList'

export default function ExpensesPage() {
  return (
    <div>
      <h1 className="font-display text-2xl text-ink-900 mb-1">Frais fixes</h1>
      <p className="text-sm text-ink-400 mb-8">Tous vos frais fixes, tous comptes confondus</p>
      <ExpensesList initialExpenses={[]} accounts={[]} userId="" />
    </div>
  )
}