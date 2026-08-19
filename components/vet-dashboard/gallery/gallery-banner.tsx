import { Download } from 'lucide-react'

export function GalleryBanner({ onUpload }: { onUpload: () => void }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-lg shadow-black/10 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="dashboard-heading text-[48px] font-semibold leading-tight text-black">
          Gallery
        </h1>
        <p className="dashboard-font mt-1 max-w-2xl text-sm text-muted-foreground">
          Manage practice photos and videos shown on your public listing.
        </p>
      </div>

      <button
        type="button"
        onClick={onUpload}
        className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-md bg-[#064071] px-4 text-sm font-semibold text-white hover:bg-[#052f52]"
      >
        <Download className="size-4" />
        Upload Media
      </button>
    </section>
  )
}
