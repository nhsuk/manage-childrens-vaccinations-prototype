import _ from 'lodash'
import { DateTime } from 'luxon'

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
   * Formatted date with day of the week
   * @param {string} string - ISO date, for example 07-12-2021
   * @returns {string} Formatted date, for example Sunday 7 December 2021
   */
  filters.dateWithDayOfWeek = string => {
    console.log('string', string)
    return DateTime.fromISO(string).toFormat('EEEE d MMMM yyyy')
  }

  /**
   * Formatted NHS number
   * @param {string} nhsNumber - NHS Number
   * @returns {string} Formatted NHS number
   */
  filters.formatNHSNumber = string => {
    const numberArray = string.split('')
    numberArray.splice(3, 0, ' ')
    numberArray.splice(8, 0, ' ')
    return numberArray.join('')
  }

  /**
   * Return unique object values from array
   * @param {Array} array - Array to interrogate
   * @param {string} value - Value
   * @returns {Array} Array with unique object values
   */
  filters.uniqueFromArrayBy = (array, value) => {
    return _.uniqBy(array, value)
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
