import { child } from './child.js'

export const children = options => {
  const children = []
  options = options || {}
  for (var i = 0; i < options.count; i++) {
    children.push(child(options.child))
  }

  return children.sort((a, b) => a.fullName.localeCompare(b.fullName))
}
