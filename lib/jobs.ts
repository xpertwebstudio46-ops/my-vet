export const jobTypes = { FULL_TIME: 'Full time', PART_TIME: 'Part time', CONTRACT: 'Contract', LOCUM: 'Locum' } as const
export type JobType = keyof typeof jobTypes
export type Job = {
  id: string; title: string; description: string; location: string; type: JobType;
  salary: string | null; closingDate: string | null; status: 'OPEN' | 'CLOSED'; createdAt: string;
  practice?: { id: string; name: string; slug: string; city: string; logoUrl: string | null };
  _count?: { applications: number };
}
export type Application = {
  id: string; jobId: string; name: string; email: string; phone: string | null; coverLetter: string;
  cvUrl: string | null; status: 'SUBMITTED' | 'SHORTLISTED' | 'REJECTED' | 'HIRED' | 'WITHDRAWN'; createdAt: string; job?: Job;
}
export type JobsResult = { items: Job[]; total: number; page: number; totalPages: number }
export const jobFieldClass = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100'
export const jobButtonClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#064071] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#08558f] disabled:cursor-wait disabled:opacity-50'
export function jobError(error: unknown) { return error instanceof Error ? error.message : 'Something went wrong. Please try again.' }
