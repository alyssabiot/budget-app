export interface Account {
  id: string
  user_id: string
  name: string
  bank: string | null
  created_at: string
  total?: number
}

export interface FixedExpense {
  id: string
  user_id: string
  account_id: string
  name: string
  amount: number
  created_at: string
  accounts?: Pick<Account, 'id' | 'name' | 'bank'>
}
