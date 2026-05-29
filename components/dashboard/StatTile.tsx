import type { LucideIcon } from 'lucide-react'
import Amount from '@/components/Amount'
import Chip, { type Category } from '@/components/Chip'

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
  icon: LucideIcon
}

export default function StatTile({ category, label, value, icon }: Props) {
  return (
    <div className={`${TILE_BG[category]} rounded-[22px] px-5 py-4 flex flex-col gap-3 min-w-0`}>
      <Chip category={category} icon={icon} />
      <div className="mt-auto">
        <p className="text-[12.5px] font-semibold uppercase tracking-wide text-ink-600">{label}</p>
        <Amount
          value={value}
          className={`font-display text-[27px] font-semibold leading-tight mt-1 ${TILE_INK[category]} block`}
        />
      </div>
    </div>
  )
}
