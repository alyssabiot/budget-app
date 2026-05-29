import Link from 'next/link'
import { ChevronRight, PiggyBank } from 'lucide-react'
import Amount from '@/components/Amount'
import Chip from '@/components/Chip'

interface Props {
  id: string
  name: string
  bank: string | null
  balance: number
}

export default function SavingsRow({ id, name, bank, balance }: Props) {
  return (
    <Link
      href={`/accounts/${id}`}
      className="bg-white border border-ink-100 rounded-2xl px-5 py-4 flex items-center gap-4 hover:border-ink-200 hover:-translate-y-px transition-all"
    >
      <Chip category="savings" icon={PiggyBank} variant="soft" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[15px] text-ink-900">{name}</p>
        {bank && <p className="text-[12.5px] text-ink-400">{bank}</p>}
      </div>
      <div className="text-right shrink-0">
        <Amount value={balance} className="font-display text-lg font-semibold text-ink-900 block" />
        <p className="text-[11.5px] text-ink-400">Solde</p>
      </div>
      <ChevronRight size={17} className="text-ink-200" />
    </Link>
  )
}
