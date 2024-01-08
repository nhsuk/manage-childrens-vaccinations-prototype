import { DateTime } from 'luxon'
import prototypeFilters from '@x-govuk/govuk-prototype-filters/index.js'
import { relationshipName } from './utils/relationship.js'
import { VACCINATION_OUTCOME } from './enums.js'
const { plural } = prototypeFilters

export default (_env) => {
  const filters = {}

  /**
   * Add your methods to the filters object below this comment block.
   *
   * @example
   * filters.sayHello = function (name) {
   *   return `Hello, ${name}!`
   * }
   *
   * Which in your templates would be used as:
   *
   * {{ "World" | sayHello }} => Hello, World!
   *
   * @see {@link https://mozilla.github.io/nunjucks/api#custom-filters}
   */

  /**
   * Get age from date
   * @param {object<Date>} date
   * @returns {number} Age in years
   */
  filters.age = date => {
    const today = new Date()
    const birth = new Date(date)
    const month = today.getMonth() - birth.getMonth()

    let age = today.getFullYear() - birth.getFullYear()
    if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    return age
  }

  /**
   * Format date with day of the week
   * @param {string} string - ISO date, for example 07-12-2021
   * @returns {string} Formatted date, for example Sunday 7 December 2021
   */
  filters.dateWithDayOfWeek = string => {
    return DateTime.fromISO(string).toFormat('EEEE d MMMM yyyy')
  }

  /**
   * Format dosage
   * @param {number} number - Dosage
   * @param {object} vaccination - Vaccination record
   * @returns {string} Formatted NHS number
   */
  filters.formatDose = (number, vaccination) => {
    const text = vaccination.outcome === VACCINATION_OUTCOME.PART_VACCINATED
      ? 'Half'
      : 'Full'

    const dose = vaccination.outcome === VACCINATION_OUTCOME.PART_VACCINATED
      ? number / 2
      : number

    return `${text} (${dose}ml)`
  }

  /**
   * Format NHS number
   * @param {string} nhsNumber - NHS number
   * @returns {string} Formatted NHS number
   */
  filters.formatNHSNumber = string => {
    const numberArray = string.split('')
    numberArray.splice(3, 0, ' ')
    numberArray.splice(8, 0, ' ')
    return numberArray.join('')
  }

  /**
   * Get patient record from NHS number
   * @param {string} nhsNumber - NHS number
   * @param {object} session - Session
   * @returns {object} Patient record
   */
  filters.patientFromNHSNumber = (string, session) => {
    return session.cohort.find(patient => patient.nhsNumber === string)
  }

  /**
   * Get the plural word form for an item for a given number,
   * but returning ‘No’ if that number is 0
   * @param {number} number - Number
   * @param {object} singular - Singular
   * @returns {string} Pluralised number
   */
  filters.plural = (number, singular, kwargs) => {
    let pluralised = plural(number, singular, kwargs)

    if (number === 0) {
      pluralised = pluralised.replace('0', 'No')
    }

    return pluralised
  }

  /**
   * Convert div.nhsuk-card to form.nhsuk-card
   * @param {string} string - HTML
   * @returns {string} Formatted HTML
   */
  filters.formCard = function (string) {
    const { filters } = this.ctx.settings.nunjucksEnv
    const html = string
      .replace(/^\n\n<div class="nhsuk-card/, '<form method="post" class="nhsuk-card')
      .replace(/<\/div>\n$/, '</form>')

    return filters.safe(html)
  }

  /**
   * Return fully resolved relationship name
   * @param {object} object - Object containing parent or guardian
   * @returns {string} Relationship name
   */
  filters.relationshipName = (object) => {
    return relationshipName(object)
  }

  /**
   * Return array without empty values
   * @param {Array} array - Array to filter
   * @returns {Array} Filtered array
   */
  filters.removeEmptyFromArray = (array) => {
    return array.filter(item => item)
  }

  return filters
}
