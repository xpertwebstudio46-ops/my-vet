export function ProfileField({
  label,
  type = 'text',
  defaultValue,
  placeholder,
}: {
  label: string
  type?: string
  defaultValue?: string
  placeholder?: string
}) {
  return (
    <label className="block text-sm font-medium text-black">
      {label}
      <input
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-2 h-11 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm outline-none focus:border-[#01AEAD] focus:ring-3 focus:ring-[#01AEAD]/15"
      />
    </label>
  )
}

export function ProfileTextarea({
  label,
  defaultValue,
}: {
  label: string
  defaultValue?: string
}) {
  return (
    <label className="block text-sm font-medium text-black">
      {label}
      <textarea
        defaultValue={defaultValue}
        rows={5}
        className="mt-2 w-full resize-none rounded-lg border border-gray-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-[#01AEAD] focus:ring-3 focus:ring-[#01AEAD]/15"
      />
    </label>
  )
}
