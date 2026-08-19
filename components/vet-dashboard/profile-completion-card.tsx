import { Card } from '@/components/dashboard/ui'
import { completionItems } from './data'

export function ProfileCompletionCard() {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="dashboard-outfit text-[16px] font-semibold text-black">
            Profile completion
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">78% complete</p>
        </div>
        <span className="text-2xl font-semibold text-[#01AEAD]">78%</span>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full w-[78%] rounded-full bg-[#01AEAD]" />
      </div>

      <ul className="mt-5 space-y-3">
        {completionItems.map((item) => (
          <li
            key={item.label}
            className={`flex items-start gap-2 text-sm ${
              item.done ? 'text-[#01AEAD]' : 'text-muted-foreground'
            }`}
          >
            <span
              className={`mt-1.5 size-2 rounded-full ${
                item.done ? 'bg-[#01AEAD]' : 'bg-slate-300'
              }`}
            />
            <span className={item.done ? 'font-semibold' : ''}>{item.label}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
