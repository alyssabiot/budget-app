import { PiggyBank, Sparkles, TrendingUp, Wallet } from 'lucide-react'

export default function AuthHero() {
  return (
    <div className="hidden md:flex md:w-1/2 bg-cat-remaining-soft px-12 lg:px-16 pt-[20vh] pb-12 flex-col relative">
      <div className="absolute top-12 lg:top-16 left-12 lg:left-16 flex items-center gap-3">
        <div className="w-12 h-12 rounded-[14px] bg-cat-remaining-solid text-white flex items-center justify-center">
          <Wallet size={22} strokeWidth={2.2} />
        </div>
        <span className="font-display text-[34px] font-semibold text-ink-900">Budget app</span>
      </div>

      <div>
        <h2 className="font-display text-[44px] lg:text-[56px] font-semibold text-ink-900 leading-[1.05] max-w-xl">
          Ton budget, sans prise de tête.
        </h2>
        <p className="text-[17px] text-ink-600 mt-5 max-w-lg">
          Suis tes revenus, tes frais fixes et ton épargne d&apos;un coup d&apos;œil et vois où va vraiment ton argent.
        </p>

        <div className="mt-10 max-w-md space-y-3">
          <div className="bg-white rounded-[22px] px-6 py-5">
            <div className="w-11 h-11 rounded-[13px] bg-cat-remaining-solid text-white flex items-center justify-center mb-4">
              <Sparkles size={22} strokeWidth={2.2} />
            </div>
            <p className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-600">Reste disponible</p>
            <p className="font-display text-[40px] font-semibold text-cat-remaining-ink leading-none mt-1">
              +750 €
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-[22px] px-5 py-4">
              <div className="w-9 h-9 rounded-[11px] bg-cat-income-solid text-white flex items-center justify-center mb-3">
                <TrendingUp size={18} strokeWidth={2.2} />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">Revenus</p>
              <p className="font-display text-[26px] font-semibold text-cat-income-ink leading-tight mt-0.5">3 200 €</p>
            </div>
            <div className="bg-white rounded-[22px] px-5 py-4">
              <div className="w-9 h-9 rounded-[11px] bg-cat-savings-solid text-white flex items-center justify-center mb-3">
                <PiggyBank size={18} strokeWidth={2.2} />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">Épargne</p>
              <p className="font-display text-[26px] font-semibold text-cat-savings-ink leading-tight mt-0.5">14 320 €</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
