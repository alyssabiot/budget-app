'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import AuthHero from '@/components/auth/AuthHero'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email ou mot de passe incorrect.')
      setLoading(false)
      return
    }

    await supabase.auth.getSession()
    window.location.replace('/dashboard')
  }

  return (
    <div className="min-h-screen flex bg-ink-50">
      <AuthHero />
      <div className="flex-1 flex justify-center px-6 pt-[20vh] pb-12">
        <div className="w-full max-w-md">
          <h1 className="font-display text-[40px] font-semibold text-ink-900 leading-tight mb-10">Connexion</h1>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">Email</label>
              <input
                type="email"
                className="bento-field"
                placeholder="toi@exemple.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">Mot de passe</label>
              <input
                type="password"
                className="bento-field"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-cat-expense-ink bg-cat-expense-soft rounded-[11px] px-3 py-2.5">
                {error}
              </p>
            )}
            <button type="submit" disabled={loading} className="btn-violet w-full justify-center">
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <p className="text-[14px] text-ink-400 text-center mt-8">
            Pas encore de compte ?{' '}
            <Link href="/auth/register" className="font-semibold text-cat-savings-ink hover:text-cat-savings-solid">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
