import { TRIAGE } from '../enums.js'
import _ from 'lodash'

const filters = {
  year: (children, yearGroup) => {
    return children.filter((c) => {
      return c.yearGroup === yearGroup
    })
  },
  'triage-status': (children, triageStatus) => {
    return children.filter((c) => {
      return c.triageStatus === TRIAGE[triageStatus]
    })
  }
}

const filter = (children, filterName, value) => {
  return filters[filterName](children, value)
}

export default (query, children) => {
  const activeFilters = Object.keys(filters).reduce((acc, f) => {
    if (query[f]) {
      acc[f] = query[f]
    }
    return acc
  }, {})

  if (_.isEmpty(activeFilters)) {
    return false
  }

  let filteredChildren = children
  for (const f in activeFilters) {
    filteredChildren = filter(filteredChildren, f, activeFilters[f])
  }

  return filteredChildren
}
