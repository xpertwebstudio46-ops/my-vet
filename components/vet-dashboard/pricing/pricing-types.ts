export type PriceItem = {
  label: string
  price: string
}

export type PricingSection = {
  id: string
  title: string
  items: PriceItem[]
}

export type HealthPackage = {
  id: string
  name: string
  price: string
  description: string
}
