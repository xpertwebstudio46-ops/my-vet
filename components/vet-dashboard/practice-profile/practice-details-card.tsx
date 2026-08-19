import { Card } from '@/components/dashboard/ui'
import { ProfileField, ProfileTextarea } from './profile-field'

export function PracticeDetailsCard() {
  return (
    <Card className="">
      <div className='p-5 border-b'>
      <h2 className="dashboard-outfit text-[16px] font-semibold text-black">
        Practice details
      </h2>
      </div>

      <div className="mt-1 grid gap-4 sm:grid-cols-2 p-5">
        <ProfileField
          label="Practice name"
          defaultValue="Green Paws Veterinary"
        />
        <ProfileField label="Contact person" defaultValue="Dr Amelia Carter" />
        <ProfileField
          label="Email address"
          type="email"
          defaultValue="hello@greenpawsvet.co.uk"
        />
        <ProfileField
          label="Phone number"
          type="tel"
          defaultValue="+44 1865 555 014"
        />
        <ProfileField
          label="Website URL"
          type="url"
          defaultValue="https://greenpawsvet.co.uk"
        />
        <ProfileField label="Town" defaultValue="Oxford" />
        <div className="sm:col-span-2">
          <ProfileTextarea
            label="About the practice"
            defaultValue="Green Paws Veterinary provides calm, practical and compassionate care for dogs, cats and small pets. Our team focuses on preventive health, clear communication and reliable follow-up support."
          />
        </div>
      </div>
    </Card>
  )
}
