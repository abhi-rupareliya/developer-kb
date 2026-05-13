export type DateGroup = 'Today' | 'Yesterday' | 'Older'

export function getDateGroup(dateValue: string | Date, now = new Date()): DateGroup {
  const date = new Date(dateValue)
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)

  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfYesterday.getDate() - 1)

  if (date >= startOfToday) {
    return 'Today'
  }

  if (date >= startOfYesterday) {
    return 'Yesterday'
  }

  return 'Older'
}

export function formatCompactTimestamp(dateValue: string | Date): string {
  return new Date(dateValue).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

export function formatCompactDate(dateValue: string | Date): string {
  return new Date(dateValue).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
