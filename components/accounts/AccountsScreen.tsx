'use client'
import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import PageHeader from '@/components/PageHeader'
import AccountForm, { type AccountFormPayload } from '@/components/forms/AccountForm'
import AccountManageRow from './AccountManageRow'
import type { Account } from '@/types'

type FormState = null | { mode: 'add' } | { mode: 'edit'; account: Account }

export default function AccountsScreen() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [userId, setUserId] = useState('')
  const [form, setForm] = useState<FormState>(null)
  const supabase = createClient()

  async function reload(uid: string) {
    const { data } = await supabase.from('accounts').select('*').eq('user_id', uid).order('created_at')
    setAccounts((data ?? []) as Account[])
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      setUserId(data.user.id)
      reload(data.user.id)
    })
  }, [])

  async function onSave(payload: AccountFormPayload) {
    if (!userId) return
    if (form?.mode === 'edit') {
      await supabase.from('accounts').update(payload).eq('id', form.account.id)
    } else {
      await supabase.from('accounts').insert({ ...payload, user_id: userId })
    }
    await reload(userId)
    setForm(null)
  }

  async function onDelete(a: Account) {
    if (!confirm(`Supprimer « ${a.name} » et tous ses mouvements ?`)) return
    await supabase.from('accounts').delete().eq('id', a.id)
    setAccounts(prev => prev.filter(x => x.id !== a.id))
  }

  const checking = accounts.filter(a => a.type === 'checking')
  const savings  = accounts.filter(a => a.type === 'savings')

  return (
    <div>
      <PageHeader
        title="Comptes"
        subtitle="Gère tes comptes courants et ton épargne."
        action={!form && (
          <button
            type="button"
            onClick={() => setForm({ mode: 'add' })}
            className="btn-dark h-[42px] px-[18px] rounded-[13px] text-sm font-semibold"
          >
            <Plus size={17} strokeWidth={2.4} /> Nouveau compte
          </button>
        )}
      />

      {form && (
        <AccountForm
          initial={form.mode === 'edit' ? form.account : null}
          onSave={onSave}
          onCancel={() => setForm(null)}
        />
      )}

      {accounts.length === 0 && !form ? (
        <div className="bg-white border border-ink-100 rounded-[20px] px-5 py-10 text-center text-sm text-ink-400">
          Aucun compte. Crée-en un pour commencer.
        </div>
      ) : (
        <div className="flex flex-col gap-[26px]">
          {checking.length > 0 && (
            <section>
              <h2 className="text-[12.5px] font-bold text-ink-400 uppercase tracking-wide mb-3 px-0.5">Comptes courants</h2>
              <div className="flex flex-col gap-2.5">
                {checking.map(a => (
                  <AccountManageRow
                    key={a.id}
                    account={a}
                    onEdit={() => setForm({ mode: 'edit', account: a })}
                    onDelete={() => onDelete(a)}
                  />
                ))}
              </div>
            </section>
          )}
          {savings.length > 0 && (
            <section>
              <h2 className="text-[12.5px] font-bold text-ink-400 uppercase tracking-wide mb-3 px-0.5">Épargne</h2>
              <div className="flex flex-col gap-2.5">
                {savings.map(a => (
                  <AccountManageRow
                    key={a.id}
                    account={a}
                    onEdit={() => setForm({ mode: 'edit', account: a })}
                    onDelete={() => onDelete(a)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
