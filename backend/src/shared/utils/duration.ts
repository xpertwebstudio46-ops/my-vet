const multipliers = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 } as const

export function durationToMilliseconds(value: string) {
  const match = /^(\d+)([smhd])$/.exec(value)
  if (!match?.[1] || !match[2]) throw new Error(`Invalid duration: ${value}`)
  return Number(match[1]) * multipliers[match[2] as keyof typeof multipliers]
}
