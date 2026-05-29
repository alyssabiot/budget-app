import type { LucideIcon } from 'lucide-react'

export type Category = 'income' | 'expense' | 'savings' | 'remaining' | 'total'
export type ChipVariant = 'solid' | 'soft'

const SOLID_BG: Record<Category, string> = {
  income:    'bg-cat-income-solid',
  expense:   'bg-cat-expense-solid',
  savings:   'bg-cat-savings-solid',
  remaining: 'bg-cat-remaining-solid',
  total:     'bg-cat-total-solid',
}
const SOFT_BG: Record<Category, string> = {
  income:    'bg-cat-income-soft',
  expense:   'bg-cat-expense-soft',
  savings:   'bg-cat-savings-soft',
  remaining: 'bg-cat-remaining-soft',
  total:     'bg-cat-total-soft',
}
const SOFT_ICON: Record<Category, string> = {
  income:    'text-cat-income-solid',
  expense:   'text-cat-expense-solid',
  savings:   'text-cat-savings-solid',
  remaining: 'text-cat-remaining-solid',
  total:     'text-cat-total-solid',
}

interface Props {
  category: Category
  icon: LucideIcon
  variant?: ChipVariant
  size?: number
}

export default function Chip({ category, icon: Icon, variant = 'solid', size = 40 }: Props) {
  const bg = variant === 'solid' ? SOLID_BG[category] : SOFT_BG[category]
  const iconColor = variant === 'solid' ? 'text-white' : SOFT_ICON[category]
  return (
    <div
      className={`${bg} ${iconColor} flex items-center justify-center shrink-0 rounded-[13px]`}
      style={{ width: size, height: size }}
    >
      <Icon size={Math.round(size * 0.525)} strokeWidth={2.2} />
    </div>
  )
}
