'use client'
import type { ReactNode } from 'react'
import { Check, X } from 'lucide-react'

interface FieldProps {
  label: string
  width?: string
  hint?: string
  children: ReactNode
}

export function Field({ label, width, hint, children }: FieldProps) {
  return (
    <div
      className="flex flex-col gap-1.5 min-w-0"
      style={width ? { flex: `0 0 ${width}` } : { flex: '1 1 140px' }}
    >
      <label className="text-xs font-semibold text-ink-600">{label}</label>
      {children}
      {hint && <p className="text-[11.5px] text-ink-400">{hint}</p>}
    </div>
  )
}

interface FormCardProps {
  title: string
  children: ReactNode
  onSave: () => void
  onCancel: () => void
  saveLabel: string
  canSave?: boolean
}

export function FormCard({ title, children, onSave, onCancel, saveLabel, canSave = true }: FormCardProps) {
  return (
    <div className="bg-white border border-cat-savings-soft rounded-[20px] px-6 py-5 mb-5 shadow-[0_8px_30px_-18px_rgba(0,0,0,0.25)]">
      <div className="font-display text-[17px] font-semibold text-ink-900 mb-4">{title}</div>
      {children}
      <div className="flex gap-2.5 justify-end mt-5">
        <button
          type="button"
          onClick={onCancel}
          className="btn-ghost inline-flex items-center gap-2 h-[42px] px-[18px] rounded-[13px] text-sm font-semibold"
        >
          <X size={17} strokeWidth={2.4} /> Annuler
        </button>
        <button
          type="button"
          onClick={canSave ? onSave : undefined}
          disabled={!canSave}
          className="btn-violet"
        >
          <Check size={17} strokeWidth={2.4} /> {saveLabel}
        </button>
      </div>
    </div>
  )
}
