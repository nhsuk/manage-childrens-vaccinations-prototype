import { CONSENT_OUTCOME, TRIAGE_OUTCOME, PATIENT_OUTCOME } from '../enums.js'
import _ from 'lodash'

const filters = {
  year: (cohort, yearGroup) => {
    return cohort.filter((patient) => {
      return patient.yearGroup === yearGroup
    })
  },
  actionNeeded: (cohort, action) => {
    return cohort.filter(({ consent, triage }) => {
      switch (action) {
        case 'get-consent':
          return consent.outcome === CONSENT_OUTCOME.NO_RESPONSE
        case 'check-refusal':
          return consent.outcome === CONSENT_OUTCOME.REFUSED
        case 'triage':
          return triage.outcome === TRIAGE_OUTCOME.NEEDS_TRIAGE
        case 'vaccinate':
          if (triage.outcome) {
            return triage.outcome === TRIAGE_OUTCOME.VACCINATE &&
              consent.outcome === CONSENT_OUTCOME.GIVEN
          } else {
            return consent.outcome === CONSENT_OUTCOME.GIVEN
          }
        default:
          return false
      }
    })
  },
  consentOutcome: (cohort, value) => {
    return cohort.filter(({ consent }) =>
      consent?.outcome === CONSENT_OUTCOME[value]
    )
  },
  triageOutcome: (cohort, value) => {
    return cohort.filter(({ triage, outcome }) =>
      outcome === PATIENT_OUTCOME.NO_OUTCOME_YET &&
      triage.outcome === TRIAGE_OUTCOME[value]
    )
  },
  triageNeeded: (cohort) => {
    return cohort.filter(({ consent, triage, outcome }) =>
      outcome === PATIENT_OUTCOME.NO_OUTCOME_YET &&
      triage.outcome === TRIAGE_OUTCOME.NEEDS_TRIAGE &&
      consent.outcome === CONSENT_OUTCOME.GIVEN
    )
  },
  triageCompleted: (cohort) => {
    return cohort.filter(({ consent, triage }) =>
      (triage.outcome && triage.outcome !== TRIAGE_OUTCOME.NEEDS_TRIAGE) &&
      consent.outcome === CONSENT_OUTCOME.GIVEN
    )
  },
  noTriageNeeded: (cohort) => {
    return cohort.filter(({ consent, triage, outcome }) =>
      outcome === PATIENT_OUTCOME.NO_OUTCOME_YET &&
      !triage.outcome &&
      consent?.outcome === CONSENT_OUTCOME.GIVEN
    )
  },
  readyToVaccinate: (cohort) => {
    return cohort.filter(({ consent, triage, outcome }) =>
      (triage?.outcome === TRIAGE_OUTCOME.VACCINATE ||
      consent?.outcome === CONSENT_OUTCOME.GIVEN) &&
      outcome !== PATIENT_OUTCOME.VACCINATED
    )
  },
  vaccinateLater: (cohort) => {
    return cohort.filter(({ triage }) =>
      triage?.outcome === TRIAGE_OUTCOME.DELAY_VACCINATION
    )
  },
  hasOutcome: (cohort, value) => {
    return cohort.filter(({ outcome }) => {
      return outcome === PATIENT_OUTCOME[value]
    })
  }
}

const filter = (cohort, filterName, value, req, res) => {
  return filters[filterName](cohort, value, req, res)
}

const sort = (patients) => {
  return patients.sort((a, b) => a.fullName.localeCompare(b.fullName))
}

export default (req, res) => {
  const query = req.query
  const { cohort } = res.locals.session

  // Consent filters
  let noResponseResults = filter(cohort, 'consentOutcome', 'NO_RESPONSE')
  let consentValidResults = filter(cohort, 'consentOutcome', 'GIVEN')
  let consentRefusedResults = [
    ...filter(cohort, 'consentOutcome', 'REFUSED'),
    ...filter(cohort, 'consentOutcome', 'FINAL_REFUSAL')
  ]
  let consentConflictsResults = filter(cohort, 'consentOutcome', 'INCONSISTENT')

  // Triage filters
  let triageNeededResults = filter(cohort, 'triageNeeded')
  let triageCompletedResults = filter(cohort, 'triageCompleted')
  let noTriageNeededResults = filter(cohort, 'noTriageNeeded')

  // Record filters
  let vaccinatedResults = filter(cohort, 'hasOutcome', 'VACCINATED')
  const vaccinateLaterResults = filter(cohort, 'vaccinateLater')
  let couldNotVaccinateResults = filter(cohort, 'hasOutcome', 'COULD_NOT_VACCINATE')
  const readyToVaccinateResults = filter(cohort, 'readyToVaccinate')

  // Action needed filter
  let actionNeededResults = cohort.filter((c) => {
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
      results: sort(noResponseResults)
    },
    consentValid: {
      label: `Consent given (${consentValidResults.length})`,
      results: sort(consentValidResults)
    },
    consentRefused: {
      label: `Consent refused (${consentRefusedResults.length})`,
      results: sort(consentRefusedResults)
    },
    consentConflicts: {
      label: `Consent conflicts (${consentConflictsResults.length})`,
      results: sort(consentConflictsResults)
    },
    triageNeeded: {
      label: `Triage needed (${triageNeededResults.length})`,
      results: sort(triageNeededResults)
    },
    triageCompleted: {
      label: `Triage completed (${triageCompletedResults.length})`,
      results: sort(triageCompletedResults)
    },
    noTriageNeeded: {
      label: `No triage needed (${noTriageNeededResults.length})`,
      results: sort(noTriageNeededResults)
    },
    readyToVaccinate: {
      label: `Not vaccinated (${readyToVaccinateResults.length})`,
      results: sort(readyToVaccinateResults)
    },
    vaccinated: {
      label: `Vaccinated (${vaccinatedResults.length})`,
      results: sort(vaccinatedResults),
      statusColumn: 'Outcome'
    },
    vaccinateLater: {
      label: `Vaccinate later (${vaccinateLaterResults.length})`,
      results: sort(vaccinateLaterResults),
      statusColumn: 'Outcome'
    },
    couldNotVaccinate: {
      label: `Could not vaccinate (${couldNotVaccinateResults.length})`,
      results: sort(couldNotVaccinateResults),
      statusColumn: 'Outcome'
    },
    actionNeeded: {
      label: `Action needed (${actionNeededResults.length})`,
      results: sort(actionNeededResults),
      statusColumn: 'Action needed',
      actionNeededFilter: true
    }
  }
}
