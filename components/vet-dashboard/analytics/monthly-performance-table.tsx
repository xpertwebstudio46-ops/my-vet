import { Card } from '@/components/dashboard/ui'
import { monthlyAnalytics } from './data'

export function MonthlyPerformanceTable() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-gray-200/80 p-5">
        <h2 className="dashboard-outfit text-[16px] font-semibold text-black">
          Monthly performance
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead className="border-b text-[14px] font-semibold text-[#064071]">
            <tr>
              <th className="px-5 py-4">Month</th>
              <th className="px-5 py-4">Views</th>
              <th className="px-5 py-4">Phone clicks</th>
              <th className="px-5 py-4">Direction</th>
              <th className="px-5 py-4 text-[#064071]">Conversion</th>
            </tr>
          </thead>
          <tbody className="text-[14px] font-normal">
            {monthlyAnalytics.map((item, index) => (
              <tr
                key={item.month}
                className={
                  index === monthlyAnalytics.length - 1
                    ? ''
                    : 'border-b border-gray-200/80'
                }
              >
                <td className="px-5 py-4 font-semibold text-black">
                  {item.month}
                </td>
                <td className="px-5 py-4 text-muted-foreground">
                  {item.views.toLocaleString()}
                </td>
                <td className="px-5 py-4 text-muted-foreground">
                  {item.phoneClicks.toLocaleString()}
                </td>
                <td className="px-5 py-4 text-muted-foreground">
                  {item.directions.toLocaleString()}
                </td>
                <td className="px-5 py-4 font-semibold text-[#01AEAD]">
                  {item.conversion}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

