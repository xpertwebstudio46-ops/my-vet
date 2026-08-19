import {
  AtSign,
  BriefcaseBusiness,
  Camera,
  MessagesSquare,
  type LucideIcon,
} from 'lucide-react'
import { Card } from '@/components/dashboard/ui'

const socialFields: Array<{
  label: string
  icon: LucideIcon
  defaultValue: string
}> = [
  {
    label: 'Facebook',
    icon: MessagesSquare,
    defaultValue: 'https://facebook.com/greenpawsvet',
  },
  {
    label: 'Instagram',
    icon: Camera,
    defaultValue: 'https://instagram.com/greenpawsvet',
  },
  {
    label: 'X / Twitter',
    icon: AtSign,
    defaultValue: 'https://x.com/greenpawsvet',
  },
  {
    label: 'LinkedIn',
    icon: BriefcaseBusiness,
    defaultValue: 'https://linkedin.com/company/greenpawsvet',
  },
]

export function SocialMediaCard() {
  return (
    <Card className="">
      <div className=' border-b p-5'>

      <h2 className="dashboard-outfit text-[16px] font-semibold text-black">
        Social media
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
     Shown as icons on your listing
      </p>
      </div>

      <div className="mt-1 space-y-4 p-5">
        {socialFields.map((field) => {
          const Icon = field.icon

          return (
            <label key={field.label} className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-medium text-black">
                <Icon className="size-4 text-[#01AEAD]" />
                {field.label}
              </span>
              <input
                type="url"
                defaultValue={field.defaultValue}
                className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm outline-none focus:border-[#01AEAD] focus:ring-3 focus:ring-[#01AEAD]/15"
              />
            </label>
          )
        })}
      </div>
    </Card>
  )
}
