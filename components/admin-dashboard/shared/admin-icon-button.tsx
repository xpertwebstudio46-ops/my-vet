export function AdminIconButton({
  label,
  children,
  onClick,
}: {
  label: string
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="inline-flex size-8 items-center justify-center rounded-md border border-gray-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-[#064071]"
    >
      {children}
    </button>
  )
}
