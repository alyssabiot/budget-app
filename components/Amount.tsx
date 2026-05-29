'use client'
import { formatCurrency } from '@/lib/utils'
import { useBlur } from '@/lib/blur'

interface Props {
  value: number
  signed?: boolean
  className?: string
}

export default function Amount({ value, signed = false, className = '' }: Props) {
  const { blurred } = useBlur()
  const formatted = (signed && value > 0 ? '+' : '') + formatCurrency(value)
  const blurClass = blurred ? 'blur-[5px] select-none' : ''
  return <span className={`${className} ${blurClass}`.trim()}>{formatted}</span>
}
