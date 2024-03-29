import filters from '@x-govuk/govuk-prototype-filters'
import _ from 'lodash'
import { healthQuestions } from './utils/campaign.js'
import { relationshipName } from './utils/relationship.js'
import { CONSENT_OUTCOME, PATIENT_OUTCOME, RESPONSE_CONSENT, RESPONSE_REFUSAL, VACCINATION_SITE, TRIAGE_OUTCOME, VACCINATION_OUTCOME } from './enums.js'

export default (_env) => {
  const globals = {
    CONSENT_OUTCOME,
    PATIENT_OUTCOME,
    RESPONSE_CONSENT,
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
   * @param {string} type - Campaign type
   * @param {Array} responses - Consent responses
   * @returns {object} Parameters for summary list component
   */
  globals.healthAnswerRows = function (type, responses) {
    const rows = []
    const questions = Object.entries(healthQuestions(type))

    for (const [id, question] of questions) {
      const responsesWithAnswers = responses.filter(response => response.healthAnswers)
      const uniqueResponses = _.uniqBy(responsesWithAnswers, `healthAnswers[${id}]`)

      let answer
      const answers = []
      for (const response of uniqueResponses) {
        const relationship = relationshipName(response.parentOrGuardian)

        if (responses.length > 1) {
          const who = uniqueResponses.length > 1
            ? `${relationship} responded: `
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
   * Get health questions used to triage patients in a campaign
   * @param {string} type - Campaign type
   * @returns {object} Health questions
   */
  globals.healthQuestions = (type) => healthQuestions(type)

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
        return { text: 'Check conflicting consent', colour: 'orange' }
      case consent.outcome === CONSENT_OUTCOME.REFUSED:
        return { text: 'Check refusal', colour: 'orange' }
      case consent.outcome === CONSENT_OUTCOME.FINAL_REFUSAL:
        return { text: 'Refusal confirmed', colour: 'red' }

      // Triage actions
      case consent.outcome === CONSENT_OUTCOME.GIVEN &&
        triage.outcome === TRIAGE_OUTCOME.NEEDS_TRIAGE:
        return { text: 'Triage', colour: 'blue' }
      case consent.outcome === CONSENT_OUTCOME.GIVEN &&
        triage.outcome === TRIAGE_OUTCOME.DO_NOT_VACCINATE:
        return { text: 'Do not vaccinate', colour: 'red' }

      // Record actions
      case consent.outcome === CONSENT_OUTCOME.GIVEN:
      case consent.outcome === CONSENT_OUTCOME.GIVEN &&
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
    let colour = 'blue'
    let description
    let respondents
    let text

    // Build list of relationships that have responded
    patient.responses.forEach(response => {
      const relationships = []
      if (response.parentOrGuardian.relationship) {
        const relationship = relationshipName(response.parentOrGuardian)
        relationships.push(relationship)
      }
      respondents = filters.formatList(relationships)
    })

    // No outcome yet
    if (patient.outcome !== PATIENT_OUTCOME.NO_OUTCOME_YET) {
      text = patient.outcome

      switch (patient.outcome) {
        case PATIENT_OUTCOME.COULD_NOT_VACCINATE:
          colour = 'red'
          break
        default:
          colour = 'green'
      }
    } else if (patient.triage.outcome && patient.consent.outcome === CONSENT_OUTCOME.GIVEN) {
      text = patient.triage.outcome
      const user = patient.triage.events.at(-1)?.user.fullName || 'Jane Doe'

      switch (patient.triage.outcome) {
        case TRIAGE_OUTCOME.NEEDS_TRIAGE:
          description = 'Responses to health questions need triage'
          break
        case TRIAGE_OUTCOME.DO_NOT_VACCINATE:
          colour = 'red'
          description = `Nurse ${user} decided that ${patient.fullName} should not be vaccinated.`
          break
        case TRIAGE_OUTCOME.DELAY_VACCINATION:
          colour = 'red'
          description = `Nurse ${user} decided that ${patient.fullName}’s vaccination should be delayed.`
          break
        default:
          colour = 'purple'
          description = `Nurse ${user} decided that ${patient.fullName} is safe to vaccinate.`
      }
    } else {
      colour = 'orange'
      text = patient.consent.outcome

      switch (patient.consent.outcome) {
        case CONSENT_OUTCOME.NO_RESPONSE:
          colour = 'blue'
          description = 'No-one responded to our requests for consent.'
          break
        case CONSENT_OUTCOME.ONLY_MENACWY:
          description = `${respondents} gave consent for MenACWY.`
          break
        case CONSENT_OUTCOME.ONLY_3_IN_1:
          description = `${respondents} gave consent for the 3-in-1 booster.`
          break
        case CONSENT_OUTCOME.INCONSISTENT:
          description = 'You can only vaccinate if all respondents give consent.'
          break
        case CONSENT_OUTCOME.GIVEN:
          colour = 'purple'
          description = `${patient.fullName} is ready to vaccinate`
          break
        default:
          description = `${respondents} refused to give consent.`
      }

      const { isGillickCompetent, isNotGillickCompetent } = patient.consent
      if (patient.consent.outcome === CONSENT_OUTCOME.NO_RESPONSE) {
        if (isNotGillickCompetent) {
          description += 'When assessed, the child was not Gillick competent.'
        } else if (isGillickCompetent) {
          description += 'The child was assessed as Gillick competent, but they refused consent.'
        }
      }
    }

    return { colour, description, text }
  }

  /**
   * Get consent summary
   * @param {object} patient - Patient
   * @returns {object} Text and icon for consent summary
   */
  globals.consentStatus = (patient) => {
    const { outcome } = patient.consent
    switch (outcome) {
      case (CONSENT_OUTCOME.NO_RESPONSE):
        return {
          text: `${outcome} yet`,
          icon: false,
          colour: false
        }
      case (CONSENT_OUTCOME.GIVEN):
        return {
          text: outcome,
          icon: 'tick',
          colour: 'green'
        }
      default:
        return {
          text: outcome,
          icon: 'cross',
          colour: 'red'
        }
    }
  }

  /**
   * Get consent response heading
   * @param {object} response - Consent response
   * @returns {string} Consent response heading
   */
  globals.responseHeading = (response) => {
    const { status, parentOrGuardian } = response
    const relationship = relationshipName(parentOrGuardian)

    const statusText = status === RESPONSE_CONSENT.NO_RESPONSE
      ? parentOrGuardian.fullName
      : `${status} by ${parentOrGuardian.fullName}`

    return relationship
      ? statusText + ` (${relationship})`
      : statusText
  }

  return globals
}
