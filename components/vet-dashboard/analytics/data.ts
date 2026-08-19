export type AnalyticsStat = {
  label: string
  value: string
}

export type MonthlyAnalytics = {
  month: string
  views: number
  websiteClicks: number
  phoneClicks: number
  directions: number
  conversion: string
}

export const analyticsStats: AnalyticsStat[] = [
  { label: 'Profile views', value: '18,420' },
  { label: 'Search appearances', value: '42,890' },
  { label: 'Website clicks', value: '1,284' },
  { label: 'Phone clicks', value: '1,044' },
  { label: 'Direction requests', value: '936' },
]

export const monthlyAnalytics: MonthlyAnalytics[] = [
  { month: 'Mar', views: 2200, websiteClicks: 142, phoneClicks: 126, directions: 82, conversion: '9.4%' },
  { month: 'Apr', views: 2800, websiteClicks: 168, phoneClicks: 148, directions: 96, conversion: '10.1%' },
  { month: 'May', views: 2540, websiteClicks: 154, phoneClicks: 132, directions: 91, conversion: '9.8%' },
  { month: 'Jun', views: 3320, websiteClicks: 198, phoneClicks: 176, directions: 118, conversion: '10.6%' },
  { month: 'Jul', views: 3980, websiteClicks: 236, phoneClicks: 214, directions: 146, conversion: '11.3%' },
  { month: 'Aug', views: 4580, websiteClicks: 270, phoneClicks: 248, directions: 168, conversion: '12.0%' },
]
