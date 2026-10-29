import { MapPin } from 'lucide-react'
import { Card } from '@/components/dashboard/ui'
import { InfoField } from './form-field'

export function LocationCard() {
  return (
    <Card className="p-5">
      <h2 className="dashboard-outfit text-[16px] font-semibold text-black">
        Location
      </h2>

      <div className="mt-5">
        <InfoField
          label="Full address"
          defaultValue="42 Walton Street, Oxford, OX2 6AD"
        />
      </div>

    </Card>
  )
}
