'use client'
import { useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowRightLeft, Pencil, PiggyBank, Receipt, Trash2, TrendingUp } from 'lucide-react'
import Amount from '@/components/Amount'
import Chip, { type Category } from '@/components/Chip'
import type { Account, FlowKind, MonthlyFlow } from '@/types'

export const FLOW_META: Record<FlowKind, { category: Category; icon: typeof TrendingUp; label: string }> = {
  income:   { category: 'income',   icon: TrendingUp,     label: 'Revenu' },
  expense:  { category: 'expense',  icon: Receipt,        label: 'Frais' },
  savings:  { category: 'savings',  icon: PiggyBank,      label: 'Épargne' },
  transfer: { category: 'total',    icon: ArrowRightLeft, label: 'Virement' },
}

interface Props {
  flow: MonthlyFlow
  accounts: Account[]
  incoming?: boolean
  hideSource?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

export default function FlowRow({ flow: f, accounts, incoming, hideSource, onEdit, onDelete }: Props) {
  const [hover, setHover] = useState(false)
  const meta = FLOW_META[f.kind]
  const positive = f.kind === 'income' || incoming
  const sourceName = accounts.find(a => a.id === f.account_id)?.name
  const targetName = f.target_account_id ? accounts.find(a => a.id === f.target_account_id)?.name : null
  const showActions = onEdit || onDelete

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex items-center gap-3.5 px-1 py-3"
    >
      <Chip category={meta.category} icon={meta.icon} variant="soft" size={36} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[14.5px] text-ink-900">{f.name}</p>
        <div className="text-xs text-ink-400 inline-flex items-center gap-1.5 mt-0.5">
          {incoming ? (
            <>
              <ArrowLeft size={11} />
              <span>{sourceName}</span>
            </>
          ) : (
            <>
              {!hideSource && <span>{sourceName}</span>}
              {targetName && <ArrowRight size={11} />}
              {targetName && <span>{targetName}</span>}
            </>
          )}
        </div>
      </div>
      <Amount
        value={f.amount}
        signed={positive}
        className={`font-display text-base font-semibold ${positive ? 'text-cat-income-ink' : 'text-ink-900'}`}
      />
      <div className={`flex gap-1 w-[68px] justify-end transition-opacity ${hover && showActions ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            aria-label="Modifier"
            className="w-[30px] h-[30px] rounded-lg bg-ink-50 text-ink-600 hover:bg-ink-100 hover:text-ink-900 transition-colors flex items-center justify-center"
          >
            <Pencil size={14} />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            aria-label="Supprimer"
            className="w-[30px] h-[30px] rounded-lg bg-cat-expense-soft text-cat-expense-ink hover:bg-cat-expense-solid hover:text-white transition-colors flex items-center justify-center"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
