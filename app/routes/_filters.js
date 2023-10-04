import { CONSENT_OUTCOME, TRIAGE_OUTCOME, PATIENT_OUTCOME } from '../enums.js'
import _ from 'lodash'

const filters = {
  year: (children, yearGroup) => {
    return children.filter((patient) => {
      return patient.yearGroup === yearGroup
    })
  },
  actionNeeded: (children, action) => {
    return children.filter((patient) => {
      switch (action) {
        case 'get-consent':
          return patient.consent.outcome === CONSENT_OUTCOME.NO_RESPONSE
        case 'check-refusal':
          return patient.consent.outcome === CONSENT_OUTCOME.REFUSED
        case 'triage':
          return patient.triage.outcome === TRIAGE_OUTCOME.NEEDS_TRIAGE
        case 'vaccinate':
          return patient.triage.outcome === TRIAGE_OUTCOME.VACCINATE ||
            (patient.consent.outcome === CONSENT_OUTCOME.VALID &&
            patient.triage.outcome === TRIAGE_OUTCOME.NONE)
        default:
          return false
      }
    })
  },
  consentOutcome: (children, outcome) => {
    return children.filter((patient) => {
      return patient.consent.outcome === CONSENT_OUTCOME[outcome]
    })
  },
  triageOutcome: (children, outcome, req, res) => {
    return children.filter((patient) => {
      const triage = req.session.data.triage
      const triageRecord = triage && triage[res.locals.campaign.id]
      if (triageRecord && triageRecord[patient.nhsNumber]) {
        return triageRecord[patient.nhsNumber].outcome === TRIAGE_OUTCOME[outcome]
      }

      return patient.triage.outcome === TRIAGE_OUTCOME[outcome]
    })
  },
  triageNeeded: (children) => {
    return children.filter((patient) =>
      patient.consent.outcome === CONSENT_OUTCOME.VALID &&
      patient.triage.outcome === TRIAGE_OUTCOME.NEEDS_TRIAGE
    )
  },
  triageCompleted: (children) => {
    return children.filter((patient) =>
      patient.consent.outcome === CONSENT_OUTCOME.VALID &&
      patient.triage.outcome !== TRIAGE_OUTCOME.NEEDS_TRIAGE &&
      patient.triage.outcome !== TRIAGE_OUTCOME.NONE
    )
  },
  noTriageNeeded: (children) => {
    return children.filter((patient) =>
      patient.consent.outcome === CONSENT_OUTCOME.VALID &&
      patient.triage.outcome === TRIAGE_OUTCOME.NONE
    )
  },
  hasOutcome: (children, outcome) => {
    return children.filter((patient) => {
      return patient.outcome === PATIENT_OUTCOME[outcome]
    })
  }
}

const filter = (children, filterName, value, req, res) => {
  return filters[filterName](children, value, req, res)
}

const sort = (patients) => {
  return patients.sort((a, b) => a.fullName.localeCompare(b.fullName))
}

export default (req, res) => {
  const query = req.query
  const children = res.locals.campaign.children

  // Consent filters
  let noResponseResults = filter(children, 'consentOutcome', 'NO_RESPONSE')
  let consentValidResults = filter(children, 'consentOutcome', 'VALID')
  let consentRefusedResults = filter(children, 'consentOutcome', 'REFUSED')
  let consentConflictsResults = filter(children, 'consentOutcome', 'INCONSISTENT')

  // Triage filters
  let triageNeededResults = filter(children, 'triageNeeded')
  let triageCompletedResults = filter(children, 'triageCompleted')
  let noTriageNeededResults = filter(children, 'noTriageNeeded')

  // Record filters
  let vaccinatedResults = filter(children, 'hasOutcome', 'VACCINATED')
  let couldNotVaccinateResults = [
    ...filter(children, 'hasOutcome', 'COULD_NOT_VACCINATE'),
    ...filter(children, 'hasOutcome', 'NO_CONSENT')
  ]

  // Action needed filter
  let actionNeededResults = children.filter((c) => {
    return !vaccinatedResults.includes(c) &&
      !couldNotVaccinateResults.includes(c)
  })

  const activeFilters = Object.keys(filters).reduce((acc, f) => {
    if (query[f]) {
      acc[f] = query[f]
    }
    return acc
  }, {})

  if (!_.isEmpty(activeFilters)) {
    res.locals.activeFilters = activeFilters

    for (const f in activeFilters) {
      if (f === 'year') {
        noResponseResults = filter(noResponseResults, f, activeFilters[f], req, res)
        consentValidResults = filter(consentValidResults, f, activeFilters[f], req, res)
        consentRefusedResults = filter(consentRefusedResults, f, activeFilters[f], req, res)
        consentConflictsResults = filter(consentConflictsResults, f, activeFilters[f], req, res)
        triageNeededResults = filter(triageNeededResults, f, activeFilters[f], req, res)
        triageCompletedResults = filter(triageCompletedResults, f, activeFilters[f], req, res)
        noTriageNeededResults = filter(noTriageNeededResults, f, activeFilters[f], req, res)
        vaccinatedResults = filter(vaccinatedResults, f, activeFilters[f], req, res)
        couldNotVaccinateResults = filter(couldNotVaccinateResults, f, activeFilters[f], req, res)
      }
      actionNeededResults = filter(actionNeededResults, f, activeFilters[f], req, res)
    }
  }

  return {
    noResponse: {
      label: `No response (${noResponseResults.length})`,
      results: sort(noResponseResults),
      actionNeeded: true
    },
    consentValid: {
      label: `Consent given (${consentValidResults.length})`,
      results: sort(consentValidResults),
      actionNeeded: true
    },
    consentRefused: {
      label: `Consent refused (${consentRefusedResults.length})`,
      results: sort(consentRefusedResults),
      actionNeeded: true
    },
    consentConflicts: {
      label: `Consent conflicts (${consentConflictsResults.length})`,
      results: sort(consentConflictsResults),
      actionNeeded: true
    },
    triageNeeded: {
      label: `Triage needed (${triageNeededResults.length})`,
      results: sort(triageNeededResults),
      actionNeeded: true
    },
    triageCompleted: {
      label: `Triage completed (${triageCompletedResults.length})`,
      results: sort(triageCompletedResults),
      actionNeeded: true
    },
    noTriageNeeded: {
      label: `No triage needed (${noTriageNeededResults.length})`,
      results: sort(noTriageNeededResults),
      actionNeeded: true
    },
    vaccinated: {
      label: `Vaccinated (${vaccinatedResults.length})`,
      results: sort(vaccinatedResults)
    },
    couldNotVaccinate: {
      label: `Could not vaccinate (${couldNotVaccinateResults.length})`,
      results: sort(couldNotVaccinateResults)
    },
    actionNeeded: {
      label: `Action needed (${actionNeededResults.length})`,
      results: sort(actionNeededResults),
      actionNeeded: true,
      actionNeededFilter: true
    }
  }
}
