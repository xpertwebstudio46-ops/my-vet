import Image from 'next/image'
import { Upload } from 'lucide-react'
import { Card } from '@/components/dashboard/ui'

export function ProfileHeroCard() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="relative h-[260px] bg-slate-100">
        <Image
          src="/images/profile-banner.png"
          alt="Practice cover"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/10" />
        <span className="absolute -bottom-14 left-5 z-10 size-28 overflow-hidden rounded-md border-4 border-white bg-white shadow-lg shadow-black/20">
          <Image
            src="/images/practice-1.png"
            alt="Green Paws Veterinary"
            fill
            sizes="112px"
            className="object-cover"
          />
          <button
            type="button"
            aria-label="Upload practice image"
            className="absolute bottom-2 right-2 flex size-8 items-center justify-center rounded-md bg-white text-[#064071] shadow-md shadow-black/20 hover:bg-[#EEF7F5]"
          >
            <Upload className="size-4" />
          </button>
        </span>
      </div>

      <div className="bg-white px-5 pb-5 pt-20">
        <div className="max-w-3xl">
          <h2 className="dashboard-outfit text-[22px] font-semibold text-[#01AEAD]">
            Green Paws Veterinary
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Friendly small animal practice offering preventive care, diagnostics
            and trusted support for pet owners in Oxford.
          </p>
        </div>
      </div>
    </Card>
  )
}
