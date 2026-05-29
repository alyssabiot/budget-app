'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, Building2, Receipt, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/accounts',  label: 'Comptes',          icon: Building2 },
  { href: '/movements', label: 'Mouvements',       icon: Receipt },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const supabase = createClient()

  // Sur /accounts/[id], activer "Tableau de bord" (le back chevron pointe sur /dashboard).
  const activeHref = pathname.startsWith('/accounts/') && pathname !== '/accounts'
    ? '/dashboard'
    : pathname

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null))
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const initial = email?.[0]?.toUpperCase() ?? '?'

  return (
    <aside className="w-52 shrink-0 h-screen sticky top-0 flex flex-col border-r border-ink-100 bg-white px-3 py-6">
      <div className="px-3 mb-8">
        <span className="font-display text-xl text-ink-900">Budget app</span>
      </div>

      <nav className="flex-1 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = activeHref === href
          return (
            <Link key={href} href={href} className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              active
                ? 'bg-cat-remaining-soft text-cat-remaining-ink font-medium'
                : 'text-ink-500 hover:bg-ink-50 hover:text-ink-800',
            )}>
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-ink-100 mt-3 pt-3 flex items-center gap-3 px-2">
        <div className="w-[34px] h-[34px] rounded-full bg-cat-savings-solid text-white font-display text-[15px] font-semibold flex items-center justify-center shrink-0">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13.5px] font-semibold text-ink-800 truncate">{email ?? ''}</p>
          <p className="text-[11.5px] text-ink-400">Compte perso</p>
        </div>
        <button
          onClick={signOut}
          aria-label="Déconnexion"
          className="p-1.5 -mr-1 rounded-lg text-ink-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  )
}
