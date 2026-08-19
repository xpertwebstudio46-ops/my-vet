import { Card } from '@/components/dashboard/ui'
import { monthlyAnalytics } from './data'

export function ProfileViewsChart() {
  const width = 760
  const height = 340
  const chart = { left: 58, right: 28, top: 34, bottom: 52 }
  const maxValue = 5000
  const yTicks = [0, 1250, 2500, 3750, 5000]
  const plotWidth = width - chart.left - chart.right
  const plotHeight = height - chart.top - chart.bottom
  const xAxisY = chart.top + plotHeight

  function point(index: number, value: number) {
    const x =
      chart.left +
      (index * plotWidth) / Math.max(monthlyAnalytics.length - 1, 1)
    const y = xAxisY - (value / maxValue) * plotHeight

    return { x, y }
  }

  const linePath = monthlyAnalytics
    .map((item, index) => {
      const { x, y } = point(index, item.views)
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  const areaPath = `${linePath} L ${chart.left + plotWidth} ${xAxisY} L ${chart.left} ${xAxisY} Z`

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-gray-200/80 p-5">
        <h2 className="dashboard-outfit text-[16px] font-semibold text-black">
          Profile views
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">Last 6 months</p>
      </div>

      <div className="h-[340px] p-5">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full"
          role="img"
          aria-label="Profile views over the last six months"
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
                  className="fill-slate-500 text-[13px] font-medium"
                >
                  {tick.toLocaleString()}
                </text>
              </g>
            )
          })}

          <path d={areaPath} fill="#064071" opacity="0.08" />
          <path
            d={linePath}
            fill="none"
            stroke="#064071"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />

          {monthlyAnalytics.map((item, index) => {
            const { x, y } = point(index, item.views)

            return (
              <g key={item.month}>
                <circle cx={x} cy={y} r="5" fill="#064071" />
                <text
                  x={x}
                  y={height - 16}
                  textAnchor="middle"
                  className="fill-slate-500 text-[13px] font-semibold"
                >
                  {item.month}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </Card>
  )
}

