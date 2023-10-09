import _ from 'lodash'
import { CONSENT_OUTCOME, PATIENT_OUTCOME, RESPONSE_REFUSAL, VACCINATION_SITE, TRIAGE_OUTCOME, VACCINATION_OUTCOME } from './enums.js'

export default (env) => {
  const globals = {
    CONSENT_OUTCOME,
    PATIENT_OUTCOME,
    RESPONSE_REFUSAL,
    TRIAGE_OUTCOME,
    VACCINATION_SITE,
    VACCINATION_OUTCOME
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

  /**
   * Action needed filters
   * @returns {object} Actions needed
   */
  globals.actionsFilter = {
    'get-consent': 'Get consent',
    'check-refusal': 'Check refusal',
    triage: 'Triage',
    vaccinate: 'Vaccinate'
  }

  /**
   * Action properties
   * @param {object} patient - Patient
   * @returns {object} Action properties
   */
  globals.action = (patient) => {
    const { consent, triage } = patient

    switch (true) {
      // Consent actions
      case consent.outcome === CONSENT_OUTCOME.NO_RESPONSE:
        return { text: 'Get consent', colour: 'yellow' }
      case consent.outcome === CONSENT_OUTCOME.INCONSISTENT:
        return { text: 'Review conflicting consent', colour: 'orange' }
      case consent.outcome === CONSENT_OUTCOME.REFUSED:
        return { text: 'Check refusal', colour: 'orange' }
      case consent.outcome === CONSENT_OUTCOME.FINAL_REFUSAL:
        return { text: 'Refused, do not contact', colour: 'red' }

      // Triage actions
      case consent.outcome === CONSENT_OUTCOME.VALID &&
        triage.outcome === TRIAGE_OUTCOME.NEEDS_TRIAGE:
        return { text: 'Triage', colour: 'blue' }
      case consent.outcome === CONSENT_OUTCOME.VALID &&
        triage.outcome === TRIAGE_OUTCOME.DO_NOT_VACCINATE:
        return { text: 'Do not vaccinate', colour: 'red' }

      // Record actions
      case consent.outcome === CONSENT_OUTCOME.VALID:
      case consent.outcome === CONSENT_OUTCOME.VALID &&
        triage.outcome === TRIAGE_OUTCOME.VACCINATE:
        return { text: 'Vaccinate', colour: 'purple' }

      // Default to no action
      default:
        return { text: 'No action needed', colour: 'white' }
    }
  }

  /**
   * Outcome properties
   * @param {object} patient - Patient
   * @returns {object} Outcome properties
   */
  globals.outcome = (patient) => {
    switch (patient.outcome) {
      case PATIENT_OUTCOME.VACCINATED:
        return { text: patient.outcome, colour: 'green' }
      case PATIENT_OUTCOME.COULD_NOT_VACCINATE:
      case PATIENT_OUTCOME.NO_CONSENT:
        return { text: patient.outcome, colour: 'red' }
      default:
        return { text: patient.outcome, colour: 'white' }
    }
  }

  /**
   * Output local data within a view
   */
  globals.inspect = function (data) {
    const { filters } = this.ctx.settings.nunjucksEnv
    const json = JSON.stringify(data, null, 2)
    return filters.safe(`<pre>${json}</pre>`)
  }

  return globals
}
