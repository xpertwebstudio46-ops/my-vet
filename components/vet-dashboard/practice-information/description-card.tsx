import { Card } from '@/components/dashboard/ui'

export function DescriptionCard() {
  return (
    <Card className="p-5">
      <h2 className="dashboard-outfit text-[16px] font-semibold text-black">
        Description
      </h2>

      <label className="mt-5 block text-sm font-medium text-black">
        Practice description
        <textarea
          rows={8}
          defaultValue="Green Paws Veterinary provides calm, practical and compassionate care for dogs, cats and small pets. Our team focuses on preventive health, clear communication and reliable follow-up support."
          className="mt-2 w-full resize-none rounded-lg border border-gray-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-[#01AEAD] focus:ring-3 focus:ring-[#01AEAD]/15"
        />
      </label>

      <p className="mt-2 text-xs font-medium text-muted-foreground">
        Approve message before publishing changes to your public listing.
      </p>
    </Card>
  )
}
