import { TRIAGE, OUTCOME, CONSENT, ACTION_NEEDED, ACTION_TAKEN } from '../enums.js'
import _ from 'lodash'

const filters = {
  year: (children, yearGroup) => {
    return children.filter((c) => {
      return c.yearGroup === yearGroup
    })
  },
  'triage-status': (children, triageStatus, req, res) => {
    return children.filter((c) => {
      const triage = req.session.data.triage
      const triageRecord = triage && triage[res.locals.campaign.id]
      if (triageRecord && triageRecord[c.nhsNumber]) {
        return triageRecord[c.nhsNumber].status === TRIAGE[triageStatus]
      }

      return c.triageStatus === TRIAGE[triageStatus]
    })
  },
  actionNeeded: (children, action) => {
    return children.filter((c) => {
      return c.actionNeeded === ACTION_NEEDED[action]
    })
  },
  actionTaken: (children, action) => {
    return children.filter((c) => {
      return c.actionTaken === ACTION_TAKEN[action]
    })
  },
  outcome: (children, outcome) => {
    return children.filter((c) => {
      return c.outcome === OUTCOME[outcome]
    })
  },
  medical: (children, medical) => {
    return children.filter((c) => {
      const hasAnswers = c.healthQuestions.hasAnswers && c.consent.consented
      return medical === 'true' ? hasAnswers : !hasAnswers
    })
  },
  consent: (children, consent) => {
    return children.filter((c) => {
      return c.consent.text === CONSENT[consent]
    })
  }
}

const filter = (children, filterName, value, req, res) => {
  return filters[filterName](children, value, req, res)
}

export default (req, res) => {
  const query = req.query
  const children = res.locals.campaign.children
  let vaccinatedChildren = filter(children, 'actionTaken', 'VACCINATED')
  let couldNotVaccinateChildren = [
    ...filter(children, 'actionTaken', 'COULD_NOT_VACCINATE'),
    ...filter(children, 'actionTaken', 'COULD_NOT_GET_CONSENT')
  ]

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
      vaccinatedChildren = filter(vaccinatedChildren, f, activeFilters[f], req, res)
      couldNotVaccinateChildren = filter(couldNotVaccinateChildren, f, activeFilters[f], req, res)
      actionNeededChildren = filter(actionNeededChildren, f, activeFilters[f], req, res)
      // filteredChildren = filter(filteredChildren, f, activeFilters[f], req, res)
    }
  }

  return {
    actionNeeded: actionNeededChildren,
    vaccinated: vaccinatedChildren,
    notVaccinated: couldNotVaccinateChildren
  }
}
