import child from './child.js'

export default (options) => {
  const children = []
  options = options || {}
  for (let i = 0; i < options.count; i++) {
    children.push(child(options.child))
  }

  return children.sort((a, b) => a.fullName.localeCompare(b.fullName))
}
