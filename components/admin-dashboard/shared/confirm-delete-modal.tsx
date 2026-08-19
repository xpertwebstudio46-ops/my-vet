import { Modal } from '@/components/dashboard/modal'

export function ConfirmDeleteModal({
  title = 'Delete item?',
  description,
  confirmLabel = 'Delete',
  onClose,
  onConfirm,
}: {
  title?: string
  description: string
  confirmLabel?: string
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <Modal open onClose={onClose} title={title}>
      <p className="text-sm text-muted-foreground">{description}</p>
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
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
