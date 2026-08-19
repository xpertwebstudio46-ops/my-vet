import { Card } from '@/components/dashboard/ui'
import type { VetSupportContact } from './help-support-data'

export function ContactSupportCard({
  contacts,
}: {
  contacts: VetSupportContact[]
}) {
  return (
    <Card className="h-fit overflow-hidden p-0">
      <div className="border-b border-gray-200/80 p-4">
        <h2 className="dashboard-outfit text-[16px] font-semibold text-black">
          Contact support
        </h2>
      </div>
      <ul className="flex flex-col gap-4 p-4">
        {contacts.map((contact) => (
          <li
            key={contact.value}
            className="flex items-center gap-3 rounded-md border border-gray-200 p-4"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#EEF7F5] text-[#01AEAD]">
              <contact.icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="dashboard-outfit text-[16px] font-semibold text-black">
                {contact.value}
              </p>
              <p className="dashboard-font text-xs text-muted-foreground">
                {contact.hint}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}
