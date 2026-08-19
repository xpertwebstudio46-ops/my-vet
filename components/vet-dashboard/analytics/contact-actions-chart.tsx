import { Card } from '@/components/dashboard/ui'
import { monthlyAnalytics } from './data'

export function ContactActionsChart() {
  const width = 420
  const height = 340
  const chart = { left: 44, right: 18, top: 34, bottom: 52 }
  const maxValue = 280
  const plotWidth = width - chart.left - chart.right
  const plotHeight = height - chart.top - chart.bottom
  const xAxisY = chart.top + plotHeight
  const groupWidth = plotWidth / monthlyAnalytics.length
  const barWidth = Math.min(18, groupWidth * 0.28)

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-gray-200/80 p-5">
        <h2 className="dashboard-outfit text-[16px] font-semibold text-black">
          Contact actions
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">6 months</p>
      </div>

      <div className="h-[340px] p-5">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full"
          role="img"
          aria-label="Contact actions over six months"
        >
          {[0, 70, 140, 210, 280].map((tick) => {
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
                  x={chart.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-500 text-[12px] font-medium"
                >
                  {tick}
                </text>
              </g>
            )
          })}

          {monthlyAnalytics.map((item, index) => {
            const centerX = chart.left + groupWidth * index + groupWidth / 2
            const websiteHeight = (item.websiteClicks / maxValue) * plotHeight
            const phoneHeight = (item.phoneClicks / maxValue) * plotHeight

            return (
              <g key={item.month}>
                <rect
                  x={centerX - barWidth - 2}
                  y={xAxisY - websiteHeight}
                  width={barWidth}
                  height={websiteHeight}
                  rx="5"
                  fill="#064071"
                />
                <rect
                  x={centerX + 2}
                  y={xAxisY - phoneHeight}
                  width={barWidth}
                  height={phoneHeight}
                  rx="5"
                  fill="#01AEAD"
                />
                <text
                  x={centerX}
                  y={height - 16}
                  textAnchor="middle"
                  className="fill-slate-500 text-[12px] font-semibold"
                >
                  {item.month}
                </text>
              </g>
            )
          })}
          <g transform={`translate(${chart.left} ${chart.top - 12})`}>
            <circle cx="0" cy="0" r="4" fill="#064071" />
            <text x="8" y="4" className="fill-slate-600 text-[11px] font-semibold">
              Website
            </text>
            <circle cx="78" cy="0" r="4" fill="#01AEAD" />
            <text x="86" y="4" className="fill-slate-600 text-[11px] font-semibold">
              Phone
            </text>
          </g>
        </svg>
      </div>
    </Card>
  )
}
