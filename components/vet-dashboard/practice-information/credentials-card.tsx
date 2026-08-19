import { Card } from '@/components/dashboard/ui'
import { InfoField } from './form-field'

export function CredentialsCard() {
  return (
    <Card className="p-5">
      <h2 className="dashboard-outfit text-[16px] font-semibold text-black">
        Credentials
      </h2>

      <div className="mt-5 grid gap-4">
        <InfoField
          label="Veterinary registration number"
          defaultValue="RCVS-48291"
        />
        <InfoField
          label="Years of experience"
          type="number"
          defaultValue="12"
        />
        <InfoField
          label="Emergency contact"
          type="tel"
          defaultValue="+44 1865 555 019"
        />
      </div>

      <p className="mt-4 text-xs font-medium text-muted-foreground">
        Shown when you are closed.
      </p>
    </Card>
  )
}
