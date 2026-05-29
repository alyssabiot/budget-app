'use client'
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

interface BlurContextValue {
  blurred: boolean
  toggle: () => void
}

const BlurContext = createContext<BlurContextValue>({ blurred: false, toggle: () => {} })

const STORAGE_KEY = 'blur-amounts'

export function BlurProvider({ children }: { children: ReactNode }) {
  const [blurred, setBlurred] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') setBlurred(true)
    } catch { /* ignore */ }
  }, [])

  const toggle = useCallback(() => {
    setBlurred(prev => {
      const next = !prev
      try { localStorage.setItem(STORAGE_KEY, next ? '1' : '0') } catch { /* ignore */ }
      return next
    })
  }, [])

  return <BlurContext.Provider value={{ blurred, toggle }}>{children}</BlurContext.Provider>
}

export function useBlur() {
  return useContext(BlurContext)
}
