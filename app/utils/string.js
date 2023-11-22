/**
 * Generate random string
 * @param {number} [length] - Output length
 * @returns {string} Random string
 */
export const generateRandomString = (length) => {
  length = length || 3
  return Math.random().toString(36).slice(2, 2 + length).toUpperCase()
}
