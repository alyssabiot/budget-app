export type AccountType = 'checking' | 'savings'
export type FlowKind = 'expense' | 'savings' | 'income' | 'transfer'

export interface Account {
  id: string
  user_id: string
  name: string
  bank: string | null
  type: AccountType
  current_balance: number | null
  balance_updated_at: string | null
  interest_rate: number | null
  cap: number | null
  created_at: string
  total?: number
}

export interface MonthlyFlow {
  id: string
  user_id: string
  account_id: string
  name: string
  amount: number
  kind: FlowKind
  target_account_id: string | null
  created_at: string
  accounts?: Pick<Account, 'id' | 'name' | 'bank'>
  target_account?: Pick<Account, 'id' | 'name'> | null
  source_account?: Pick<Account, 'id' | 'name'> | null
  direction?: 'out' | 'in'
}
