'use client'

export function SettingsToggle({
  active,
  onClick,
}: {
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      onClick={onClick}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        active ? 'bg-[#01AEAD]' : 'bg-slate-300'
      }`}
    >
      <span
        className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${
          active ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}
