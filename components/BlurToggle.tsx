'use client'
import { Eye, EyeOff } from 'lucide-react'
import { useBlur } from '@/lib/blur'

export default function BlurToggle() {
  const { blurred, toggle } = useBlur()
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={blurred ? 'Afficher les montants' : 'Masquer les montants'}
      title={blurred ? 'Afficher les montants' : 'Masquer les montants'}
      className="w-[42px] h-[42px] rounded-[13px] bg-white text-ink-600 border border-ink-200 flex items-center justify-center transition-colors hover:border-ink-400 hover:text-ink-900 shrink-0"
    >
      {blurred ? <Eye size={18} /> : <EyeOff size={18} />}
    </button>
  )
}
