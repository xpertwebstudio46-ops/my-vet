export const SAVED_PRACTICE_IDS_KEY = 'my-vet:saved-practice-ids'
export const SAVED_PRACTICES_CHANGED_EVENT = 'my-vet:saved-practices-changed'

export function readSavedPracticeIds() {
  if (typeof window === 'undefined') return []

  try {
    const value = window.localStorage.getItem(SAVED_PRACTICE_IDS_KEY)
    const parsed: unknown = value ? JSON.parse(value) : []

    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : []
  } catch {
    return []
  }
}

export function writeSavedPracticeIds(ids: string[]) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(SAVED_PRACTICE_IDS_KEY, JSON.stringify(ids))
  window.dispatchEvent(new Event(SAVED_PRACTICES_CHANGED_EVENT))
}
