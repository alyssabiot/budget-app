import Amount from './Amount'
import type { Category } from './Chip'

const TILE_BG: Record<Category, string> = {
  income:    'bg-cat-income-soft',
  expense:   'bg-cat-expense-soft',
  savings:   'bg-cat-savings-soft',
  remaining: 'bg-cat-remaining-soft',
  total:     'bg-cat-total-soft',
}
const TILE_INK: Record<Category, string> = {
  income:    'text-cat-income-ink',
  expense:   'text-cat-expense-ink',
  savings:   'text-cat-savings-ink',
  remaining: 'text-cat-remaining-ink',
  total:     'text-cat-total-ink',
}

interface Props {
  category: Category
  label: string
  value: number
  signed?: boolean
}

export default function PastelStat({ category, label, value, signed }: Props) {
  return (
    <div className={`${TILE_BG[category]} rounded-[18px] px-[18px] py-4 flex flex-col gap-1.5 min-w-0`}>
      <p className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-600">{label}</p>
      <Amount
        value={value}
        signed={signed}
        className={`font-display text-2xl font-semibold leading-tight ${TILE_INK[category]} block`}
      />
    </div>
  )
}
