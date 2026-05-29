'use client'
import { useState, useMemo } from 'react'
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
  const currentYear = new Date().getFullYear()
  const [years, setYears] = useState(5)
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

  const [hover, setHover] = useState<number | null>(null)

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
    <div className="card p-5">
      <h2 className="font-medium text-ink-700 text-sm mb-4">Simulation</h2>

      <div className="mb-5">
        <div className="flex items-baseline justify-between mb-2">
          <label className="label mb-0">Horizon</label>
          <span className="text-sm text-ink-700 font-medium">
            {years} {years > 1 ? 'ans' : 'an'} <span className="text-ink-400">· {currentYear + years}</span>
          </span>
        </div>
        <input type="range" min={1} max={MAX_YEARS} step={1}
          value={years} onChange={e => setYears(parseInt(e.target.value))}
          className="w-full accent-accent" />
        <div className="flex justify-between text-xs text-ink-400 mt-1">
          <span>{currentYear + 1}</span>
          <span>{currentYear + MAX_YEARS}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div>
          <p className="text-xs text-ink-400 mb-1">Solde projeté</p>
          <p className="font-display text-2xl text-ink-900">{formatCurrency(finalBalance)}</p>
        </div>
        <div>
          <p className="text-xs text-ink-400 mb-1">Total versé</p>
          <p className="font-display text-lg text-ink-700">{formatCurrency(totalContributed)}</p>
        </div>
        <div>
          <p className="text-xs text-ink-400 mb-1">Intérêts</p>
          <p className="font-display text-lg text-ink-700">{formatCurrency(interestsEarned)}</p>
        </div>
      </div>

      <div className="border-t border-ink-100 pt-4 relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="none" role="img" aria-label="Évolution du solde"
          onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
          <defs>
            <linearGradient id="savings-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>

          <path d={areaPath} fill="url(#savings-grad)" className="text-accent" />
          <path d={linePath} fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" className="text-accent" vectorEffect="non-scaling-stroke" />

          {capY != null && capY >= PAD_T && capY <= PAD_T + PLOT_H && (
            <g>
              <line
                x1={PAD_L} x2={PAD_L + PLOT_W} y1={capY} y2={capY}
                stroke="currentColor" strokeWidth={1} strokeDasharray="4 4" className="text-rose-500"
                vectorEffect="non-scaling-stroke"
              />
              <text x={PAD_L + PLOT_W - 4} y={capY - 4} textAnchor="end" fontSize={10} fill="currentColor" className="text-rose-500">
                Plafond {formatCurrency(cap!)}
              </text>
            </g>
          )}

          {tickYears.map(y => {
            const x = PAD_L + ((y * 12) / (fullSeries.length - 1)) * PLOT_W
            return (
              <g key={y}>
                <line x1={x} x2={x} y1={PAD_T} y2={PAD_T + PLOT_H} stroke="currentColor" strokeOpacity={0.08} className="text-ink-900" />
                <text x={x} y={H - 6} textAnchor="middle" fontSize={10} fill="currentColor" className="text-ink-400">
                  {currentYear + y}
                </text>
              </g>
            )
          })}

          {hover != null && (
            <g>
              <line
                x1={pts[hover][0]} x2={pts[hover][0]} y1={PAD_T} y2={PAD_T + PLOT_H}
                stroke="currentColor" strokeOpacity={0.25} strokeDasharray="3 3" className="text-ink-900"
                vectorEffect="non-scaling-stroke"
              />
              <circle cx={pts[hover][0]} cy={pts[hover][1]} r={4} fill="white" stroke="currentColor" strokeWidth={2} className="text-accent" vectorEffect="non-scaling-stroke" />
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
            <div className="font-display">{formatCurrency(fullSeries[hover])}</div>
          </div>
        )}
      </div>
    </div>
  )
}
