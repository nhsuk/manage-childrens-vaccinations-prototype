import { patient } from './patient.js'

export const patients = count => {
  const patients = []
  for (var i = 0; i < count; i++) {
    patients.push(patient())
  }

  return patients.sort((a, b) => a.fullName.localeCompare(b.fullName))
}
