import { DateTime, Interval } from 'luxon'

/**
 * Generate a year group date range
 * @private
 * @param {object<Date>} startYear
 * @returns {object} Year group range
 */
const _getYearGroupRange = (startYear) => {
  const startDate = DateTime.fromISO(`${startYear}-09-01`)
  const endDate = DateTime.fromISO(`${startYear + 1}-08-31`)

  return {
    start: startDate.toISO(),
    end: endDate.toISO(),
    interval: Interval.fromDateTimes(startDate, endDate)
  }
}

/**
 * Year groups
 * @returns {object} Year groups
 */
export const yearGroups = () => {
  const year0 = 2017
  const yearGroups = {}

  for (let index = 0; index < 13; index++) {
    yearGroups[index] = _getYearGroupRange(year0 - index)
  }

  return yearGroups
}

/**
 * Get year group from date
 * @param {object<Date>} Date
 * @returns {object} Year group
 */
export const getYearGroup = (date) => {
  const dobDate = DateTime.fromISO(date)
  for (const [yearGroup, range] of Object.entries(yearGroups())) {
    if (range.interval.contains(dobDate)) {
      return yearGroup
    }
  }
}
