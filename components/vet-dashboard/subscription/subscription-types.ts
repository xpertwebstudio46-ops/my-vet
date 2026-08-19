export type SubscriptionPlan = {
  id: string
  name: string
  price: string
  description: string
}

export type BillingHistoryItem = {
  id: string
  invoice: string
  date: string
  description: string
  amount: string
  status: 'Paid' | 'Refunded'
}
