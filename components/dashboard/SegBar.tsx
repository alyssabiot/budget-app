import Amount from '@/components/Amount'

interface Props {
  income: number
  expense: number
  savings: number
}

export default function SegBar({ income, expense, savings }: Props) {
  const remaining = Math.max(income - expense - savings, 0)
  const pct = (v: number) => (income > 0 ? (v / income) * 100 : 0)

  const segments = [
    { value: expense,   pct: pct(expense),   label: 'Frais',   barClass: 'bg-cat-expense-solid',   dotClass: 'bg-cat-expense-solid' },
    { value: savings,   pct: pct(savings),   label: 'Épargne', barClass: 'bg-cat-savings-solid',   dotClass: 'bg-cat-savings-solid' },
    { value: remaining, pct: pct(remaining), label: 'Reste',   barClass: 'bg-cat-remaining-solid', dotClass: 'bg-cat-remaining-solid' },
  ]

  return (
    <div>
      <div className="flex h-3.5 rounded-lg overflow-hidden gap-[3px]">
        {income === 0 ? (
          <div className="flex-1 bg-ink-100" />
        ) : (
          segments.map((s, i) => (
            <div key={i} className={s.barClass} style={{ width: `${s.pct}%` }} />
          ))
        )}
      </div>
      <div className="flex gap-4 flex-wrap mt-3">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-[3px] ${s.dotClass}`} />
            <span className="text-[13px] text-ink-600">{s.label}</span>
            <Amount value={s.value} className="text-[13px] font-bold text-ink-800" />
          </div>
        ))}
      </div>
    </div>
  )
}
