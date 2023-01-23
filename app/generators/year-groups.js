export const yearGroups = (type) => {
  switch (type) {
    case 'Flu':
      return [
        'Reception',
        'Year 1',
        'Year 2',
        'Year 3',
        'Year 4',
        'Year 5',
        'Year 6'
      ]
    case 'HPV':
      return [
        'Year 8',
        'Year 9'
      ]
    case '3-in-1 and MenACWY':
      return [
        'Year 9',
        'Year 10'
      ]
  }

  return []
}
