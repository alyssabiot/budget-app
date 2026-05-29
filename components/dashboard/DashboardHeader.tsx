import BlurToggle from '@/components/BlurToggle'

interface Props {
  firstName: string
  monthLabel: string
}

export default function DashboardHeader({ firstName, monthLabel }: Props) {
  const greeting = firstName ? `Bonjour ${firstName}` : 'Bonjour'
  return (
    <div className="mb-6 flex items-start">
      <div className="flex-1 min-w-0">
        <h1 className="font-display text-[30px] font-semibold text-ink-900 leading-tight">
          {greeting} 👋
        </h1>
        <p className="text-[14.5px] text-ink-400 mt-1">
          Voici ton budget de {monthLabel}.
        </p>
      </div>
      <BlurToggle />
    </div>
  )
}
