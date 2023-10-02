import getPatient from './patient.js'

export default (options) => {
  const children = []
  options = options || {}
  for (let i = 0; i < options.count; i++) {
    children.push(getPatient(options.child))
  }

  return children.sort((a, b) => a.fullName.localeCompare(b.fullName))
}
