import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import BlurToggle from './BlurToggle'

interface Props {
  title: string
  emoji?: string
  subtitle?: string
  back?: boolean
  backLabel?: string
  onBack?: () => void
  action?: ReactNode
}

export default function PageHeader({ title, emoji, subtitle, back, backLabel = 'Tableau de bord', onBack, action }: Props) {
  return (
    <div className="mb-6">
      {back && (
        <button
          onClick={onBack}
          type="button"
          className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-ink-400 hover:text-ink-700 transition-colors mb-3.5 whitespace-nowrap"
        >
          <ChevronLeft size={15} /> {backLabel}
        </button>
      )}
      <div className="flex items-start gap-2.5">
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-[30px] font-semibold text-ink-900 leading-tight">
            {title}{emoji ? ` ${emoji}` : ''}
          </h1>
          {subtitle && <p className="text-[14.5px] text-ink-400 mt-1">{subtitle}</p>}
        </div>
        {action}
        <BlurToggle />
      </div>
    </div>
  )
}
