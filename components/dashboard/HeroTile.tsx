import { Sparkles } from 'lucide-react'
import Amount from '@/components/Amount'
import Chip from '@/components/Chip'
import SegBar from './SegBar'

interface Props {
  remaining: number
  income: number
  expense: number
  savings: number
}

export default function HeroTile({ remaining, income, expense, savings }: Props) {
  return (
    <div className="bg-cat-remaining-soft rounded-3xl px-7 py-6 flex flex-col row-span-2">
      <Chip category="remaining" icon={Sparkles} />
      <p className="text-[13px] font-semibold uppercase tracking-wide text-ink-600 mt-5">
        Reste disponible
      </p>
      <Amount
        value={remaining}
        signed
        className="font-display text-[52px] font-semibold leading-none text-cat-remaining-ink mt-1.5 mb-1 block"
      />
      <p className="text-[13.5px] text-ink-600">
        sur <Amount value={income} /> de revenus ce mois
      </p>
      <div className="mt-auto pt-6">
        <SegBar income={income} expense={expense} savings={savings} />
      </div>
    </div>
  )
}
