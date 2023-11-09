/**
 * Return fully resolved relationship name
 * @param {object} parentOrGuardian - Parent or guardian
 * @returns {string|undefined} Relationship name
 */
export const relationshipName = (parentOrGuardian) => {
  if (!parentOrGuardian.relationship) {
    return
  }

  return parentOrGuardian.relationship === 'Other'
    ? `${parentOrGuardian.relationship} – ${parentOrGuardian.relationshipOther}`
    : parentOrGuardian.relationship
}
