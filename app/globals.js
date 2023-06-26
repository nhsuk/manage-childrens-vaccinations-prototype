import _ from 'lodash'
import { TRIAGE, CONSENT, OUTCOME, ACTION_NEEDED, ACTION_TAKEN } from './enums.js'

export default () => {
  const globals = {
    TRIAGE,
    CONSENT,
    OUTCOME,
    ACTION_NEEDED,
    ACTION_TAKEN
  }

  /**
   * Add your methods to the globals object below this comment block.
   *
   * @example
   * globals.sayHello = function (name) {
   *   return `Hello, ${name}!`
   * }
   *
   * Which in your templates would be used as:
   *
   * {{ sayHello("World") }} => Hello, World!
   */

  globals.d = function (keyPath) {
    const data = this.ctx.data
    return _.get(data, _.toPath(keyPath))
  }

  // get filter path
  globals.filterPath = (activeFilters, key, value) => {
    const complexFilters = false
    let path = '?'
    if (!complexFilters) {
      return `?${key}=${value}`
    }

    activeFilters = activeFilters || {}

    // if key is not in activeFilters, add it to path
    if (!activeFilters[key]) {
      path += `${key}=${value}&`
    }

    for (const f in activeFilters) {
      if (f === key) {
        path += `${f}=${value}&`
      } else {
        path += `${f}=${activeFilters[f]}&`
      }
    }

    return path.slice(0, -1)
  }

  const evaluateCondition = (data, condition) => {
    if (typeof condition === 'function' && condition()) {
      return true
    }

    if (typeof condition === 'string') {
      return !!_.get(data, _.toPath(condition))
    }

    if (typeof condition === 'object' && condition.data) {
      const sessionData = _.toPath(_.get(data, condition.data))

      if (condition.value || condition.values) {
        const includedValues = _.toPath(condition.value ? condition.value : condition.values)
        if (includedValues.some(v => sessionData.indexOf(v) >= 0)) {
          return true
        }
      }

      if (condition.excludedValue || condition.excludedValues) {
        const excludedValues = _.toPath(condition.excludedValue ? condition.excludedValue : condition.excludedValues)
        if (!excludedValues.some(v => sessionData.indexOf(v) >= 0)) {
          return true
        }
      }
    }

    return false
  }

  globals.decorateRows = function (rows) {
    const data = this.ctx.data

    rows = rows
      .filter(r => typeof r === 'object')
      .filter(r => typeof r.condition === 'undefined' || evaluateCondition(data, r.condition))
      .map(r => {
        if (typeof r.key === 'string') {
          if (!r.visuallyHiddenText) {
            r.visuallyHiddenText = r.key.toLowerCase()
          }

          r.key = {
            text: r.key
          }
        }

        if (typeof r.data === 'string' && !r.value) {
          r.value = _.get(data, _.toPath(r.data))
          delete r.data
        }

        if (typeof r.value === 'string') {
          r.value = {
            text: r.value
          }
        }

        if (r.href && !r.actions) {
          r.actions = {
            items: [{
              text: r.action || 'Change',
              visuallyHiddenText: r.visuallyHiddenText,
              href: r.href
            }]
          }

          delete r.visuallyHiddenText
          delete r.href
        }

        return r
      })

    return rows
  }

  // Keep the following line to return your globals to the app
  return globals
}
