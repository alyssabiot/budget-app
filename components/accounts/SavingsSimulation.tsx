'use client'
import { useMemo, useState } from 'react'
import Amount from '@/components/Amount'
import { useBlur } from '@/lib/blur'
import { formatCurrency } from '@/lib/utils'
import { projectBalance } from '@/lib/savings'

interface Props {
  startBalance: number
  monthlyContribution: number
  annualRate: number | null
  cap?: number | null
}

const MAX_YEARS = 30
const W = 600
const H = 200
const PAD_T = 12
const PAD_R = 12
const PAD_B = 24
const PAD_L = 12
const PLOT_W = W - PAD_L - PAD_R
const PLOT_H = H - PAD_T - PAD_B

export default function SavingsSimulation({ startBalance, monthlyContribution, annualRate, cap = null }: Props) {
  const { blurred } = useBlur()
  const currentYear = new Date().getFullYear()
  const [years, setYears] = useState(10)
  const [hover, setHover] = useState<number | null>(null)
  const months = years * 12

  const { series, totalContributed } = useMemo(
    () => projectBalance(startBalance, monthlyContribution, annualRate, months, cap),
    [startBalance, monthlyContribution, annualRate, months, cap],
  )

  const finalBalance = series[series.length - 1] ?? startBalance
  const interestsEarned = finalBalance - startBalance - totalContributed

  const fullSeries = useMemo(() => [startBalance, ...series], [series, startBalance])
  const minY = Math.min(...fullSeries)
  const maxY = Math.max(...fullSeries, cap ?? -Infinity)
  const rangeY = maxY - minY || 1
  const capY = cap != null ? PAD_T + (1 - (cap - minY) / rangeY) * PLOT_H : null

  const pts = useMemo(() => fullSeries.map((v, i) => {
    const x = PAD_L + (i / (fullSeries.length - 1)) * PLOT_W
    const y = PAD_T + (1 - (v - minY) / rangeY) * PLOT_H
    return [x, y] as const
  }), [fullSeries, minY, rangeY])

  const linePath = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L ${pts[pts.length - 1][0].toFixed(1)} ${(PAD_T + PLOT_H).toFixed(1)} L ${pts[0][0].toFixed(1)} ${(PAD_T + PLOT_H).toFixed(1)} Z`

  const tickYears = useMemo(() => {
    const candidates = years <= 5 ? [1, 2, 3, 4, 5] : years <= 10 ? [2, 5, 10] : years <= 20 ? [5, 10, 15, 20] : [5, 10, 15, 20, 25, 30]
    return candidates.filter(y => y <= years)
  }, [years])

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const xRel = (e.clientX - rect.left) / rect.width
    if (xRel < 0 || xRel > 1) { setHover(null); return }
    const svgX = xRel * W
    const ratio = Math.max(0, Math.min(1, (svgX - PAD_L) / PLOT_W))
    const idx = Math.round(ratio * (fullSeries.length - 1))
    setHover(Math.max(0, Math.min(fullSeries.length - 1, idx)))
  }

  const hoverLabel = useMemo(() => {
    if (hover == null) return null
    if (hover === 0) return 'Aujourd’hui'
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() + hover)
    return d.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
  }, [hover])

  return (
    <div className="bg-white border border-ink-100 rounded-[22px] px-6 py-5">
      <h3 className="font-display text-[17px] font-semibold text-ink-900 mb-4">Simulation</h3>

      <div className="mb-5">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-[12.5px] font-semibold text-ink-600">Horizon</span>
          <span className="text-sm font-semibold text-ink-800 whitespace-nowrap">
            {years} {years > 1 ? 'ans' : 'an'} <span className="text-ink-400 font-medium">· {currentYear + years}</span>
          </span>
        </div>
        <input
          type="range" min={1} max={MAX_YEARS} step={1}
          value={years}
          onChange={e => setYears(parseInt(e.target.value))}
          className="w-full cursor-pointer [accent-color:oklch(var(--cat-savings-solid))]"
        />
        <div className="flex justify-between text-[11.5px] text-ink-400 mt-0.5">
          <span>{currentYear + 1}</span>
          <span>{currentYear + MAX_YEARS}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <div>
          <p className="text-xs text-ink-400 mb-0.5">Solde projeté</p>
          <Amount value={finalBalance} className="font-display text-2xl font-semibold text-cat-savings-ink block" />
        </div>
        <div>
          <p className="text-xs text-ink-400 mb-0.5">Total versé</p>
          <Amount value={totalContributed} className="font-display text-lg font-semibold text-ink-800 block" />
        </div>
        <div>
          <p className="text-xs text-ink-400 mb-0.5">Intérêts</p>
          <Amount value={interestsEarned} className="font-display text-lg font-semibold text-cat-income-ink block" />
        </div>
      </div>

      <div className="border-t border-ink-100 pt-4 relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" preserveAspectRatio="none" role="img" aria-label="Évolution du solde"
          onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
          <path d={areaPath} fill="oklch(var(--cat-savings-soft))" />
          <path d={linePath} fill="none" stroke="oklch(var(--cat-savings-solid))" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />

          {capY != null && capY >= PAD_T && capY <= PAD_T + PLOT_H && (
            <g>
              <line
                x1={PAD_L} x2={PAD_L + PLOT_W} y1={capY} y2={capY}
                stroke="oklch(var(--cat-remaining-solid))" strokeWidth={1} strokeDasharray="4 4"
                vectorEffect="non-scaling-stroke"
              />
              <text x={PAD_L + PLOT_W - 4} y={capY - 4} textAnchor="end" fontSize={10} fill="oklch(var(--cat-remaining-ink))" style={blurred ? { filter: 'blur(4px)' } : undefined}>
                Plafond {formatCurrency(cap!)}
              </text>
            </g>
          )}

          {tickYears.map(y => {
            const x = PAD_L + ((y * 12) / (fullSeries.length - 1)) * PLOT_W
            return (
              <g key={y}>
                <line x1={x} x2={x} y1={PAD_T} y2={PAD_T + PLOT_H} stroke="#181714" strokeOpacity={0.07} />
                <text x={x} y={H - 6} textAnchor="middle" fontSize={10} fill="#9e9b91">
                  {currentYear + y}
                </text>
              </g>
            )
          })}

          {hover != null && (
            <g>
              <line
                x1={pts[hover][0]} x2={pts[hover][0]} y1={PAD_T} y2={PAD_T + PLOT_H}
                stroke="#2a2925" strokeOpacity={0.25} strokeDasharray="3 3"
                vectorEffect="non-scaling-stroke"
              />
              <circle cx={pts[hover][0]} cy={pts[hover][1]} r={4} fill="white" stroke="oklch(var(--cat-savings-solid))" strokeWidth={2} vectorEffect="non-scaling-stroke" />
            </g>
          )}
        </svg>

        {hover != null && (
          <div
            className="absolute pointer-events-none -translate-x-1/2 -translate-y-full bg-ink-900 text-white text-xs rounded-md px-2 py-1.5 shadow-lg whitespace-nowrap"
            style={{
              left: `${(pts[hover][0] / W) * 100}%`,
              top: `calc(1rem + ${(pts[hover][1] / H) * 100}% - 8px)`,
            }}
          >
            <div className="text-ink-400 capitalize">{hoverLabel}</div>
            <Amount value={fullSeries[hover]} className="font-display block" />
          </div>
        )}
      </div>
    </div>
  )
}
