import { z } from 'zod'

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)
export const emergencyWeeklyHoursSchema = z.array(z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  isClosed: z.boolean(),
  is24Hours: z.boolean().default(false),
  opensAt: time.nullable(),
  closesAt: time.nullable(),
}).refine((day) => day.isClosed || day.is24Hours || (day.opensAt !== null && day.closesAt !== null && day.opensAt !== day.closesAt), {
  message: 'Choose 24-hour cover or provide different start and end times for available days',
})).length(7).refine((days) => new Set(days.map((day) => day.dayOfWeek)).size === 7, 'Provide each weekday exactly once')
