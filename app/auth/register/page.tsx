'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import AuthHero from '@/components/auth/AuthHero'

export default function RegisterPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [done, setDone]         = useState(false)
  const [loading, setLoading]   = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Minimum 8 caractères.'); return }
    setLoading(true)
    const { error } = await createClient().auth.signUp({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else setDone(true)
  }

  return (
    <div className="min-h-screen flex bg-ink-50">
      <AuthHero />
      <div className="flex-1 flex justify-center px-6 pt-[20vh] pb-12">
        <div className="w-full max-w-md">
          {done ? (
            <div>
              <h1 className="font-display text-[40px] font-semibold text-ink-900 leading-tight">Compte créé !</h1>
              <p className="text-[15px] text-ink-400 mt-2 mb-8">
                Vérifie ton email pour confirmer ton compte, puis connecte-toi.
              </p>
              <Link href="/auth/login" className="btn-violet w-full justify-center">
                Se connecter
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-[40px] font-semibold text-ink-900 leading-tight mb-10">Créer un compte</h1>

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
                    placeholder="8 caractères minimum"
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
                  {loading ? 'Création…' : 'Créer mon compte'}
                </button>
              </form>

              <p className="text-[14px] text-ink-400 text-center mt-8">
                Déjà un compte ?{' '}
                <Link href="/auth/login" className="font-semibold text-cat-savings-ink hover:text-cat-savings-solid">
                  Se connecter
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
