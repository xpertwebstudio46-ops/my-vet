import { Modal } from '@/components/dashboard/modal'
import type { BlogPost } from './blog-types'

export function BlogDeleteModal({
  post,
  onClose,
  onConfirm,
}: {
  post: BlogPost
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <Modal open onClose={onClose} title="Delete blog?">
      <p className="text-sm text-muted-foreground">
        This will remove {post.title} from the dashboard table.
      </p>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 px-4 text-sm font-semibold text-[#064071] hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="inline-flex h-10 items-center justify-center rounded-md bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </Modal>
  )
}
