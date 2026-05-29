export function projectBalance(
  startBalance: number,
  monthlyContribution: number,
  annualRatePct: number | null,
  months: number,
  cap: number | null = null,
): { series: number[]; totalContributed: number } {
  const r = (annualRatePct ?? 0) / 100 / 12
  const series: number[] = []
  let balance = startBalance
  let totalContributed = 0
  for (let i = 1; i <= months; i++) {
    balance = balance * (1 + r)
    if (cap == null) {
      balance += monthlyContribution
      totalContributed += monthlyContribution
    } else if (balance < cap) {
      const before = balance
      balance = Math.min(balance + monthlyContribution, cap)
      totalContributed += balance - before
    }
    series.push(balance)
  }
  return { series, totalContributed }
}
