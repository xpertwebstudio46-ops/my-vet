import { ImagePlus } from 'lucide-react'

export function UploadMediaCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center shadow-lg shadow-black/10 hover:border-[#01AEAD] hover:bg-[#01AEAD]/5"
    >
      <span className="inline-flex size-14 items-center justify-center rounded-md bg-[#01AEAD]/10 text-[#01AEAD]">
        <ImagePlus className="size-6" />
      </span>
      <span className="mt-4 text-base font-semibold text-black">
        Upload new media
      </span>
      <span className="mt-1 text-sm text-muted-foreground">
        Add a JPEG, PNG, WebP or GIF image to your gallery.
      </span>
    </button>
  )
}
