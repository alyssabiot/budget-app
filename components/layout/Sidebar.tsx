'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, Building2, Receipt, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/accounts',  label: 'Comptes',          icon: Building2 },
  { href: '/movements', label: 'Mouvements',        icon: Receipt },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()

  async function signOut() {
    await createClient().auth.signOut()
    router.push('/auth/login')
  }

  return (
    <aside className="w-52 shrink-0 h-screen sticky top-0 flex flex-col border-r border-ink-100 bg-white px-3 py-6">
      <div className="px-3 mb-8">
        <span className="font-display text-xl text-ink-900">Budget app</span>
      </div>

      <nav className="flex-1 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              active ? 'bg-accent-light text-accent font-medium' : 'text-ink-500 hover:bg-ink-50 hover:text-ink-800'
            )}>
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </nav>

      <button onClick={signOut} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-ink-400 hover:text-red-500 hover:bg-red-50 transition-colors w-full">
        <LogOut size={15} />
        Déconnexion
      </button>
    </aside>
  )
}
