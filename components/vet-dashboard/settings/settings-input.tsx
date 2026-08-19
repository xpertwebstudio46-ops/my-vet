export function SettingsInput({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block text-sm font-medium text-black">
      {label}
      <input
        {...props}
        className="mt-2 h-11 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm outline-none focus:border-[#01AEAD] focus:ring-3 focus:ring-[#01AEAD]/15"
      />
    </label>
  )
}
