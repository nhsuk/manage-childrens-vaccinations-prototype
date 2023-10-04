import { CONSENT_OUTCOME, TRIAGE_OUTCOME, PATIENT_OUTCOME, ACTION_NEEDED } from '../enums.js'
import _ from 'lodash'

const filters = {
  year: (children, yearGroup) => {
    return children.filter((c) => {
      return c.yearGroup === yearGroup
    })
  },
  triageOutcome: (children, triageOutcome, req, res) => {
    return children.filter((c) => {
      const triage = req.session.data.triage
      const triageRecord = triage && triage[res.locals.campaign.id]
      if (triageRecord && triageRecord[c.nhsNumber]) {
        return triageRecord[c.nhsNumber].outcome === TRIAGE_OUTCOME[triageOutcome]
      }

      return c.triage.outcome === TRIAGE_OUTCOME[triageOutcome]
    })
  },
  actionNeeded: (children, action) => {
    return children.filter((c) => {
      return c.actionNeeded === ACTION_NEEDED[action]
    })
  },
  noTriageNeeded: (children) => {
    return children.filter((c) => {
      return !c.triage.outcome && c.consent.outcome === CONSENT_OUTCOME.VALID
    })
  },
  triageNeeded: (children) => {
    return children.filter((c) => {
      return c.triage.outcome === TRIAGE_OUTCOME.NEEDS_TRIAGE
    })
  },
  triageCompleted: (children) => {
    return children.filter((c) => {
      return c.triage.outcome !== TRIAGE_OUTCOME.NEEDS_TRIAGE
    })
  },
  outcome: (children, outcome) => {
    return children.filter((c) => {
      return c.outcome === PATIENT_OUTCOME[outcome]
    })
  },
  medical: (children, medical) => {
    return children.filter((c) => {
      const answersNeedTriage = c.consent.answersNeedTriage && c.consent.outcome === CONSENT_OUTCOME.VALID
      return medical === 'true' ? answersNeedTriage : !answersNeedTriage
    })
  },
  consent: (children, consent) => {
    return children.filter((c) => {
      return c.consent.text === CONSENT_OUTCOME[consent]
    })
  }
}

const filter = (children, filterName, value, req, res) => {
  return filters[filterName](children, value, req, res)
}

const sort = (children) => {
  return children.sort((a, b) => a.fullName.localeCompare(b.fullName))
}

export default (req, res) => {
  const query = req.query
  const children = res.locals.campaign.children
  let vaccinatedChildren = filter(children, 'outcome', 'VACCINATED')
  let couldNotVaccinateChildren = [
    ...filter(children, 'outcome', 'COULD_NOT_VACCINATE'),
    ...filter(children, 'outcome', 'NO_CONSENT')
  ]

  couldNotVaccinateChildren = sort(couldNotVaccinateChildren)

  const getConsentChildren = filter(children, 'actionNeeded', 'GET_CONSENT')
  const checkRefusalChildren = filter(children, 'actionNeeded', 'CHECK_REFUSAL')

  let triageNeededChildren = filter(children, 'triageNeeded')
  let triageCompletedChildren = filter(children, 'triageCompleted')
  let chaseConsentChildren = sort([...getConsentChildren, ...checkRefusalChildren])
  let noTriageNeededChildren = filter(children, 'noTriageNeeded')

  let actionNeededChildren = children.filter((c) => {
    return !vaccinatedChildren.includes(c) &&
      !couldNotVaccinateChildren.includes(c)
  })

  const activeFilters = Object.keys(filters).reduce((acc, f) => {
    if (query[f]) {
      acc[f] = query[f]
    }
    return acc
  }, {})

  if (!_.isEmpty(activeFilters)) {
    res.locals.activeFilters = activeFilters

    // let filteredChildren = children
    for (const f in activeFilters) {
      if (f === 'year') {
        vaccinatedChildren = filter(vaccinatedChildren, f, activeFilters[f], req, res)
        couldNotVaccinateChildren = filter(couldNotVaccinateChildren, f, activeFilters[f], req, res)
        triageNeededChildren = filter(triageNeededChildren, f, activeFilters[f], req, res)
        triageCompletedChildren = filter(triageCompletedChildren, f, activeFilters[f], req, res)
        noTriageNeededChildren = filter(noTriageNeededChildren, f, activeFilters[f], req, res)
        chaseConsentChildren = filter(chaseConsentChildren, f, activeFilters[f], req, res)
      }
      actionNeededChildren = filter(actionNeededChildren, f, activeFilters[f], req, res)
    }
  }

  return {
    actionNeeded: actionNeededChildren,
    vaccinated: vaccinatedChildren,
    notVaccinated: couldNotVaccinateChildren,
    triageNeeded: triageNeededChildren,
    triageCompleted: triageCompletedChildren,
    noTriageNeeded: noTriageNeededChildren,
    chaseConsent: chaseConsentChildren
  }
}
