export default (type) => {
  switch (type) {
    case 'Flu':
      return [
        { name: 'Reception', number: 0 },
        { name: 'Year 1', number: 1 },
        { name: 'Year 2', number: 2 },
        { name: 'Year 3', number: 3 },
        { name: 'Year 4', number: 4 },
        { name: 'Year 5', number: 5 },
        { name: 'Year 6', number: 6 }
      ]
    case 'HPV':
      return [
        { name: 'Year 8', number: 8 },
        { name: 'Year 9', number: 9 }
      ]
    case '3-in-1 and MenACWY':
      return [
        { name: 'Year 9', number: 9 },
        { name: 'Year 10', number: 10 }
      ]
  }

  return []
}
