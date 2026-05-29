'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Building2, Pencil, PiggyBank, Trash2 } from 'lucide-react'
import Chip from '@/components/Chip'
import type { Account } from '@/types'

interface Props {
  account: Account
  onEdit: () => void
  onDelete: () => void
}

export default function AccountManageRow({ account: a, onEdit, onDelete }: Props) {
  const [hover, setHover] = useState(false)
  const isSavings = a.type === 'savings'

  return (
    <Link
      href={`/accounts/${a.id}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`bg-white rounded-2xl px-[18px] py-[15px] flex items-center gap-3.5 border transition-all cursor-pointer ${hover ? 'border-ink-200 -translate-y-px' : 'border-ink-100'}`}
    >
      {isSavings ? (
        <Chip category="savings" icon={PiggyBank} variant="soft" />
      ) : (
        <div className="w-10 h-10 rounded-[13px] bg-ink-50 text-ink-600 flex items-center justify-center shrink-0">
          <Building2 size={19} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[15px] text-ink-900">{a.name}</p>
        <p className="text-[12.5px] text-ink-400">{a.bank ?? 'Sans banque'}</p>
      </div>
      <div className={`flex gap-1 transition-opacity ${hover ? 'opacity-100' : 'opacity-0'}`}>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit() }}
          aria-label="Modifier"
          className="w-8 h-8 rounded-[9px] bg-ink-50 text-ink-600 hover:bg-ink-100 hover:text-ink-900 transition-colors flex items-center justify-center"
        >
          <Pencil size={15} />
        </button>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete() }}
          aria-label="Supprimer"
          className="w-8 h-8 rounded-[9px] bg-cat-expense-soft text-cat-expense-ink hover:bg-cat-expense-solid hover:text-white transition-colors flex items-center justify-center"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </Link>
  )
}
