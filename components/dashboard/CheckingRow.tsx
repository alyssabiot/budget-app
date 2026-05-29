import Link from 'next/link'
import { AlertTriangle, Building2, ChevronRight } from 'lucide-react'
import Amount from '@/components/Amount'
import { formatCurrency } from '@/lib/utils'

interface Props {
  id: string
  name: string
  bank: string | null
  remaining: number
  inflow: number
  outflow: number
  overspend: boolean
}

export default function CheckingRow({ id, name, bank, remaining, inflow, outflow, overspend }: Props) {
  const colorClass = remaining < 0 ? 'text-cat-expense-ink' : 'text-cat-income-ink'
  return (
    <Link
      href={`/accounts/${id}`}
      className="bg-white border border-ink-100 rounded-2xl px-5 py-4 flex items-center gap-4 hover:border-ink-200 hover:-translate-y-px transition-all"
    >
      <div className="w-10 h-10 rounded-[13px] bg-ink-50 text-ink-600 flex items-center justify-center shrink-0">
        <Building2 size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[15px] text-ink-900 inline-flex items-center gap-1.5">
          {name}
          {overspend && (
            <span title={`Sorties (${formatCurrency(outflow)}) supérieures aux entrées (${formatCurrency(inflow)})`}>
              <AlertTriangle size={13} className="text-cat-expense-solid" />
            </span>
          )}
        </p>
        {bank && <p className="text-[12.5px] text-ink-400">{bank}</p>}
      </div>
      <div className="text-right shrink-0">
        <Amount value={remaining} signed className={`font-display text-lg font-semibold block ${colorClass}`} />
        <p className="text-[11.5px] text-ink-400">Reste dispo</p>
      </div>
      <ChevronRight size={17} className="text-ink-200" />
    </Link>
  )
}
