import dayjs from 'dayjs'

export const MEAL_PERIODS = ['breakfast', 'lunch', 'dinner', 'late-night']

// Map a Date/dayjs into the default meal period suggestion.
export function mealPeriodForTime(time) {
  const t = dayjs(time)
  const minutes = t.hour() * 60 + t.minute()
  if (minutes >= 5 * 60 && minutes < 10 * 60 + 30) return 'breakfast'
  if (minutes >= 10 * 60 + 30 && minutes < 15 * 60) return 'lunch'
  if (minutes >= 15 * 60 && minutes < 22 * 60) return 'dinner'
  return 'late-night'
}

const DAY_KEYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

// Returns true if `time` falls within the restaurant's hours for that weekday.
// Handles overnight close (e.g. 08:00 -> 02:45).
export function isOpenAt(restaurant, time) {
  const t = dayjs(time)
  const dayKey = DAY_KEYS[t.day()]
  const hours = restaurant?.hours?.[dayKey]
  if (!hours || !hours.open || !hours.close) return false

  const minutes = t.hour() * 60 + t.minute()
  const open = parseHHMM(hours.open)
  const close = parseHHMM(hours.close)
  if (open === close) return true // open all day
  if (close > open) {
    return minutes >= open && minutes <= close
  }
  // overnight close past midnight
  return minutes >= open || minutes <= close
}

function parseHHMM(s) {
  const [h, m] = String(s).split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

export function formatHours(hours) {
  if (!hours) return 'Hours not available'
  if (hours.open === '00:00' && hours.close === '23:59') return 'Open 24 hours'
  return `${hours.open} – ${hours.close}`
}
