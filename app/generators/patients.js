import { patient } from './patient.js'

export const patients = options => {
  const patients = []
  options = options || {}
  for (var i = 0; i < options.count; i++) {
    patients.push(patient(options.patient))
  }

  return patients.sort((a, b) => a.fullName.localeCompare(b.fullName))
}
