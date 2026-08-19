'use client'

export function OpeningHoursToggle({
  active,
  onClick,
}: {
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={active ? 'Turn off' : 'Turn on'}
      onClick={onClick}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        active ? 'bg-[#01AEAD]' : 'bg-slate-300'
      }`}
    >
      <span
        className={`absolute left-1 top-1 size-4 rounded-full bg-white shadow-sm transition-transform ${
          active ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}
