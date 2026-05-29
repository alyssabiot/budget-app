'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

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

  if (done) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <h2 className="font-display text-2xl text-ink-900 mb-2">Compte créé !</h2>
        <p className="text-sm text-ink-400 mb-6">Vérifiez votre email pour confirmer votre compte.</p>
        <Link href="/auth/login" className="btn-primary">Se connecter</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-ink-50">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl text-ink-900 mb-1">Créer un compte</h1>
        <p className="text-sm text-ink-400 mb-8">C'est gratuit et prend 30 secondes</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" placeholder="vous@exemple.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label">Mot de passe</label>
            <input type="password" className="input" placeholder="8 caractères minimum"
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
            {loading ? 'Création…' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-sm text-ink-400 text-center mt-6">
          Déjà un compte ?{' '}
          <Link href="/auth/login" className="text-accent hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
