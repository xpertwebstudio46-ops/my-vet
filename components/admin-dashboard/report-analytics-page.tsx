'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Download, Star } from 'lucide-react'
import { Card } from '@/components/dashboard/ui'

type BarChartItem = {
  label: string
  value: number
}

type ReviewTableItem = {
  id: string
  image: string
  reviewer: string
  practice: string
  rating: string
  reviews: number
}

const monthlySignups: BarChartItem[] = [
  { label: 'Mar', value: 184 },
  { label: 'Apr', value: 236 },
  { label: 'May', value: 214 },
  { label: 'Jun', value: 298 },
  { label: 'Jul', value: 336 },
  { label: 'Aug', value: 392 },
]

const revenueGrowth: BarChartItem[] = [
  { label: 'Mar', value: 24400 },
  { label: 'Apr', value: 31800 },
  { label: 'May', value: 44200 },
  { label: 'Jun', value: 49600 },
  { label: 'Jul', value: 63900 },
  { label: 'Aug', value: 78400 },
]

const websiteTraffic = [
  { label: 'Mon', visits: 42, searches: 25 },
  { label: 'Tue', visits: 58, searches: 35 },
  { label: 'Wed', visits: 52, searches: 31 },
  { label: 'Thu', visits: 70, searches: 42 },
  { label: 'Fri', visits: 82, searches: 49 },
  { label: 'Sat', visits: 76, searches: 46 },
  { label: 'Sun', visits: 88, searches: 58 },
]

const featuredReviews: ReviewTableItem[] = [
  {
    id: 'review-1',
    image: '/images/person-1.png',
    reviewer: 'Ava Thompson',
    practice: 'Oxford Pet Wellness',
    rating: '5.0',
    reviews: 438,
  },
  {
    id: 'review-2',
    image: '/images/person-2.png',
    reviewer: 'Noah Williams',
    practice: 'Jericho Animal Clinic',
    rating: '4.7',
    reviews: 296,
  },
  {
    id: 'review-3',
    image: '/images/person-3.png',
    reviewer: 'Sophia Martinez',
    practice: 'Summertown Vet Care',
    rating: '4.5',
    reviews: 118,
  },
  {
    id: 'review-4',
    image: '/images/person-4.png',
    reviewer: 'Liam Johnson',
    practice: 'Headington Pet Practice',
    rating: '4.3',
    reviews: 42,
  },
]

export function ReportAnalyticsPage() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-lg shadow-black/10 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="dashboard-heading text-[48px] font-semibold leading-tight text-black">
            Report and analytics
          </h1>
          <p className="dashboard-font mt-1 text-sm text-muted-foreground">
            Track growth, revenue, traffic and practice performance.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#064071] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#052f52]"
        >
          <Download className="size-4" />
          Export report
        </button>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="w-full overflow-hidden p-0">
          <div className="border-b border-gray-200/80 p-3">
            <h2 className="dashboard-outfit text-[16px] font-semibold text-black">
              Traffic chart
            </h2>
            <p className="dashboard-font mt-1 text-[13px] font-medium text-muted-foreground">
              Visits and directory searches this week
            </p>
          </div>
          <div className="p-2.5">
            <WebsiteTrafficLineChart />
          </div>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="border-b border-gray-200/80 p-3">
            <h2 className="dashboard-outfit text-[16px] font-semibold text-black">
              Monthly signup users
            </h2>
            <p className="dashboard-font mt-1 text-[13px] font-medium text-muted-foreground">
              Monthly performance
            </p>
          
          </div>
          <div className="p-0">
            <BarChart
              data={monthlySignups}
              color="#01AEAD"
              ariaLabel="Monthly signup users by month"
            
              variant="signup"
            />
          </div>
        </Card>
      </section>

      <section className="w-full">
        <Card className="w-full overflow-hidden p-0">
          <div className="border-b border-gray-200/80 p-3">
            <h2 className="dashboard-outfit text-[16px] font-semibold text-black">
              Revenue
            </h2>
            <p className="dashboard-font mt-1 text-[13px] font-medium text-muted-foreground">
              Monthly performance
            </p>
           
          </div>
          <div className="p-3">
            <BarChart
              data={revenueGrowth}
              color="#01AEAD"
              ariaLabel="Monthly revenue by month"
              valueFormatter={(value) => `$${Math.round(value / 1000)}k`}
              variant="revenue"
            />
          </div>
        </Card>
      </section>

      <Card className="w-full overflow-hidden p-0">
        <div className="border-b border-gray-200/80 p-5">
          <h2 className="dashboard-outfit text-[16px] font-normal text-black">
            Top practice review rating
          </h2>
          <p className="dashboard-font mt-1 text-[13px] font-medium text-muted-foreground">
            Review totals split into two table sections.
          </p>
        </div>
        <div className="bg-[#F8FAFC]">
          {featuredReviews.map((review, index) => (
            <ReviewTableRow
              key={review.id}
              review={review}
              index={index}
              isLast={index === featuredReviews.length - 1}
            />
          ))}
        </div>
      </Card>
    </div>
  )
}

function BarChart({
  data,
  color,
  ariaLabel,
  valueSuffix = '',
  valueFormatter,
  variant = 'signup',
}: {
  data: BarChartItem[]
  color: string
  ariaLabel: string
  valueSuffix?: string
  valueFormatter?: (value: number) => string
  variant?: 'signup' | 'revenue'
}) {
  const [activeIndex, setActiveIndex] = useState(data.length - 1)
  const chartConfig =
    variant === 'revenue'
      ? {
          width: 1120,
          height: 460,
          chart: { left: 92, right: 42, top: 44, bottom: 76 },
          wrapperClass: 'h-[420px]',
          barWidth: 96,
          barRadius: '10',
          idleOpacity: '0.82',
          tickClass: 'fill-slate-500 text-[15px] font-medium',
          valueClass: 'fill-slate-700 text-[15px] font-semibold',
          monthClass: 'fill-slate-500 text-[15px] font-semibold',
          valueOffset: 14,
          monthOffset: 28,
          topAccent: true,
        }
      : {
          width: 1000,
          height: 600,
          chart: { left: 110, right: 48, top: 64, bottom: 88 },
          wrapperClass: 'h-[300px]',
          barWidth: 58,
          barRadius: '5',
          idleOpacity: '0.68',
          tickClass: 'fill-slate-500 text-[25px] font-medium',
          valueClass: 'fill-slate-700 text-[25px] font-semibold',
          monthClass: 'fill-slate-500 text-[25px] font-semibold',
          valueOffset: 12,
          monthOffset: 30,
          topAccent: false,
        }
  const { width, height, chart } = chartConfig
  const maxValue = Math.max(...data.map((item) => item.value))
  const yTicks = [0, 25, 50, 75, 100]
  const plotWidth = width - chart.left - chart.right
  const plotHeight = height - chart.top - chart.bottom
  const xAxisY = chart.top + plotHeight
  const groupWidth = plotWidth / data.length
  const barWidth = Math.min(chartConfig.barWidth, groupWidth * 0.56)
  const formatValue =
    valueFormatter ??
    ((value: number) => `${value.toLocaleString()}${valueSuffix}`)

  return (
    <div className={`w-full overflow-hidden ${chartConfig.wrapperClass}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-full w-full"
        role="img"
        aria-label={ariaLabel}
        onMouseLeave={() => setActiveIndex(data.length - 1)}
      >
        {yTicks.map((percent) => {
          const tickValue = Math.round((maxValue * percent) / 100)
          const y = xAxisY - (percent / 100) * plotHeight

          return (
            <g key={percent}>
              <line
                x1={chart.left}
                y1={y}
                x2={width - chart.right}
                y2={y}
                stroke="#E5E7EB"
              />
              <text
                x={chart.left - 16}
                y={y + 4}
                textAnchor="end"
                className={chartConfig.tickClass}
              >
                {formatValue(tickValue)}
              </text>
            </g>
          )
        })}
        <line
          x1={chart.left}
          y1={chart.top}
          x2={chart.left}
          y2={xAxisY}
          stroke="#94A3B8"
          strokeWidth="1.5"
        />
        <line
          x1={chart.left}
          y1={xAxisY}
          x2={width - chart.right}
          y2={xAxisY}
          stroke="#94A3B8"
          strokeWidth="1.5"
        />
        {data.map((item, index) => {
          const centerX = chart.left + groupWidth * index + groupWidth / 2
          const barHeight = (item.value / maxValue) * plotHeight
          const isActive = activeIndex === index

          return (
            <g key={item.label}>
              <rect
                x={chart.left + groupWidth * index}
                y={chart.top}
                width={groupWidth}
                height={plotHeight}
                fill="transparent"
                className="cursor-pointer"
                tabIndex={0}
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
              />
              <rect
                x={centerX - barWidth / 2}
                y={xAxisY - barHeight}
                width={barWidth}
                height={barHeight}
                rx={chartConfig.barRadius}
                fill={color}
                opacity={isActive ? '1' : chartConfig.idleOpacity}
                pointerEvents="none"
              />
              {chartConfig.topAccent && (
                <rect
                  x={centerX - barWidth / 2}
                  y={xAxisY - barHeight}
                  width={barWidth}
                  height={Math.min(16, barHeight)}
                  rx="8"
                  fill="#064071"
                  opacity="0.24"
                  pointerEvents="none"
                />
              )}
              <text
                x={centerX}
                y={xAxisY - barHeight - chartConfig.valueOffset}
                textAnchor="middle"
                className={chartConfig.valueClass}
                opacity={isActive ? '1' : '0'}
              >
                {formatValue(item.value)}
              </text>
              <text
                x={centerX}
                y={height - chartConfig.monthOffset}
                textAnchor="middle"
                className={chartConfig.monthClass}
              >
                {item.label}
              </text>
            </g>
          )
        })}
        {/* <text
          x={width - chart.right}
          y={chart.top - 18}
          textAnchor="end"
          className="fill-slate-700 text-[25px] font-semibold"
        >
          {activeItem.label}: {formatValue(activeItem.value)}
        </text> */}
      </svg>
    </div>
  )
}

function WebsiteTrafficLineChart() {
  const [activeIndex, setActiveIndex] = useState(websiteTraffic.length - 1)
  const width = 1000
  const height = 600
  const chart = { left: 60, right: 34, top: 42, bottom: 62 }
  const maxValue = 100
  const yTicks = [0, 25, 50, 75, 100]
  const plotWidth = width - chart.left - chart.right
  const plotHeight = height - chart.top - chart.bottom
  const xAxisY = chart.top + plotHeight
  const activeItem = websiteTraffic[activeIndex]

  function getPoint(index: number, value: number) {
    const x =
      chart.left +
      (index * plotWidth) / Math.max(websiteTraffic.length - 1, 1)
    const y = xAxisY - (value / maxValue) * plotHeight

    return { x, y }
  }

  function pathFor(key: 'visits' | 'searches') {
    return websiteTraffic
      .map((item, index) => {
        const { x, y } = getPoint(index, item[key])
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .join(' ')
  }

  return (
    <div className="h-[300px] w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-full w-full"
        role="img"
        aria-label="Website visits and directory searches by day"
        onMouseLeave={() => setActiveIndex(websiteTraffic.length - 1)}
      >
        {yTicks.map((tick) => {
          const y = xAxisY - (tick / maxValue) * plotHeight

          return (
            <g key={tick}>
              <line
                x1={chart.left}
                y1={y}
                x2={width - chart.right}
                y2={y}
                stroke="#E5E7EB"
              />
              <text
                x={chart.left - 12}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-500 text-[25px] font-medium"
              >
                {tick}
              </text>
            </g>
          )
        })}
        {websiteTraffic.map((item, index) => {
          const { x } = getPoint(index, item.visits)
          const hitWidth = plotWidth / websiteTraffic.length

          return (
            <g key={item.label}>
              <line
                x1={x}
                y1={chart.top}
                x2={x}
                y2={xAxisY}
                stroke="#F1F5F9"
              />
              <rect
                x={x - hitWidth / 2}
                y={chart.top}
                width={hitWidth}
                height={plotHeight}
                fill="transparent"
                className="cursor-pointer"
                tabIndex={0}
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
              />
              <text
                x={x}
                y={height - 18}
                textAnchor="middle"
                className="fill-slate-500 text-[25px] font-medium"
              >
                {item.label}
              </text>
            </g>
          )
        })}
        <line
          x1={chart.left}
          y1={chart.top}
          x2={chart.left}
          y2={xAxisY}
          stroke="#94A3B8"
          strokeWidth="1.5"
        />
        <line
          x1={chart.left}
          y1={xAxisY}
          x2={width - chart.right}
          y2={xAxisY}
          stroke="#94A3B8"
          strokeWidth="1.5"
        />
        <path
          d={pathFor('visits')}
          fill="none"
          stroke="#064071"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />
        <path
          d={pathFor('searches')}
          fill="none"
          stroke="#01AEAD"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />
        {websiteTraffic.map((item, index) => {
          const visits = getPoint(index, item.visits)
          const searches = getPoint(index, item.searches)
          const isActive = activeIndex === index

          return (
            <g key={item.label}>
              {isActive && (
                <line
                  x1={visits.x}
                  y1={chart.top}
                  x2={visits.x}
                  y2={xAxisY}
                  stroke="#94A3B8"
                  strokeDasharray="4 5"
                />
              )}
              <circle
                cx={visits.x}
                cy={visits.y}
                r={isActive ? '7' : '5'}
                fill="#064071"
              />
              <circle
                cx={searches.x}
                cy={searches.y}
                r={isActive ? '7' : '5'}
                fill="#01AEAD"
              />
            </g>
          )
        })}
        <text
          x={width - chart.right}
          y={chart.top - 18}
          textAnchor="end"
          className="fill-slate-700 text-[25px] font-semibold"
        >
          {activeItem.label}: {activeItem.visits} visits, {activeItem.searches}{' '}
          searches
        </text>
      </svg>
    </div>
  )
}

function ReviewTableRow({
  review,
  index,
  isLast,
}: {
  review: ReviewTableItem
  index: number
  isLast: boolean
}) {
  return (
    <div
      className={`dashboard-font grid gap-4 px-5 py-4 md:grid-cols-[56px_56px_minmax(0,1fr)_auto] md:items-center ${
        isLast ? '' : 'border-b border-gray-200/80'
      }`}
    >
      <span className="flex size-12 items-center justify-center rounded-lg bg-[#01AEAD] text-sm font-semibold text-white">
        {index + 1}
      </span>

      <span className="relative size-14 shrink-0 overflow-hidden rounded-lg">
        <Image
          src={review.image}
          alt={review.reviewer}
          fill
          sizes="56px"
          className="object-cover"
        />
      </span>

      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-black">{review.practice}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Review by {review.reviewer}
        </p>
      </div>

      <div className="flex flex-col gap-2 md:items-end">
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
        <span className="flex items-center gap-1 text-warning">
          {Array.from({ length: 5 }).map((_, starIndex) => (
            <Star
              key={starIndex}
              className="size-4 fill-warning text-warning"
            />
          ))}
        </span>
          <span className="rounded-full px-2.5 py-1 text-[#425350]">
            {review.rating} 
          </span>
          <span className="rounded-full  px-2.5 py-1 text-muted-foreground">
            {review.reviews} reviews
          </span>
        </div>
      </div>
    </div>
  )
}
