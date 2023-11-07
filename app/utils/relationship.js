/**
 * Return fully resolved relationship name
 * @param {object} parentOrGuardian - Parent or guardian
 * @returns {string} Relationship name
 */
export const relationshipName = (parentOrGuardian) => {
  return parentOrGuardian.relationship === 'Other'
    ? `${parentOrGuardian.relationship} – ${parentOrGuardian.relationshipOther}`
    : parentOrGuardian.relationship
}
