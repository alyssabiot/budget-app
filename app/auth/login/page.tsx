'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

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
    <div className="min-h-screen flex items-center justify-center px-4 bg-ink-50">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl text-ink-900 mb-1">Connexion</h1>
        <p className="text-sm text-ink-400 mb-8">Accédez à vos frais fixes</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" placeholder="vous@exemple.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label">Mot de passe</label>
            <input type="password" className="input" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p className="text-sm text-ink-400 text-center mt-6">
          Pas de compte ?{' '}
          <Link href="/auth/register" className="text-accent hover:underline">Créer un compte</Link>
        </p>
      </div>
    </div>
  )
}