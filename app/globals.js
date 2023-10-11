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
   * Get health answer
   * @param {object} response - Consent response
   * @param {string} id - Question ID
   * @returns {string} Answer to health question
   */
  const getHealthAnswer = (response, id) => {
    const healthAnswer = response.healthAnswers[id]
    return !healthAnswer
      ? 'No'
      : `Yes – ${healthAnswer}`
  }

  /**
   * Health answer summary list rows
   * @param {object} campaign - Campaign
   * @param {object} patient - Patient
   * @returns {object} Parameters for summary list component
   */
  globals.healthAnswerRows = function (campaign, patient) {
    const rows = []

    for (const [id, question] of Object.entries(campaign.healthQuestions)) {
      const responsesWithAnswers = patient.responses.filter(response => response.healthAnswers)
      const uniqueResponses = _.uniqBy(responsesWithAnswers, `healthAnswers[${id}]`)

      let answer
      const answers = []
      for (const response of uniqueResponses) {
        if (patient.responses.length > 1) {
          const who = uniqueResponses.length > 1
            ? `${response.parentOrGuardian.relationship} responded: `
            : 'All responded: '

          answers.push(`<p>${who} ${getHealthAnswer(response, id)}</p>`)
        } else {
          answer = getHealthAnswer(response, id)
        }
      }

      rows.push({
        key: { text: question },
        value: { html: answers.join('\n') || answer }
      })
    }

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
        return { text: 'Get consent', colour: 'blue' }
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
   * Get consent outcome
   * @param {object} patient - Patient
   * @param {object} [consentRecord] - Consent record
   * @returns {object} Consent outcome properties
   */
  globals.consentOutcome = (patient, consentRecord) => {
    const { assessedAsNotGillickCompetent, consent } = patient
    const isGillickCompetent = consentRecord?.['gillick-competent'] === 'Yes'
    let colour
    let description

    if (consent.outcome === CONSENT_OUTCOME.NO_RESPONSE) {
      description = 'No-one responded to our requests for consent.'

      if (assessedAsNotGillickCompetent) {
        description += 'When assessed, the child was not Gillick competent.'
      } else if (isGillickCompetent) {
        description += 'The child was assessed as Gillick competent, but they refused consent.'
      }
    } else {
      // MenACWY only
      if (consent.outcome === CONSENT_OUTCOME.ONLY_MENACWY) {
        colour = 'purple'
        description = 'Parent or guardian gave consent for MenACWY.'
      } else {
        colour = 'orange'
        description = 'Parent or guardian refused to give consent for MenACWY.'
      }

      // 3-in-1 only
      if (consent.outcome === CONSENT_OUTCOME.ONLY_3_IN_1) {
        colour = 'purple'
        description = 'Parent or guardian gave consent for the 3-in-1 booster.'
      } else {
        colour = 'orange'
        description = 'Parent or guardian refused to give consent for the 3-in-1 booster.'
      }

      // Flu or HPV
      if (consent.outcome === CONSENT_OUTCOME.VALID) {
        if (isGillickCompetent) {
          description = 'The child was assessed as Gillick competent and they gave consent.'
        } else {
          description = false
        }
      } else {
        colour = 'orange'
        description = 'Parent or guardian refused to give consent'
      }
    }

    return { colour, description }
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
