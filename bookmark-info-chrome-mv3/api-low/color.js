const hexDigitSet = new Set('0123456789abcdef')
const letterSet = new Set('abcdefghijklmnopqrstuvwxy')

function isLettersOnly(str) {
  if (!(str.length < 25)) {
    return false
  }

  const strLow = str.toLowerCase()

  return Array.from(strLow)
    .every(letter =>  letterSet.has(letter))
}

function isHexColorValue(str) {
  if (!str) {
    return str
  }

  if (!(str.length === 6)) {
    return false
  }

  const strLow = str.toLowerCase()

  return Array.from(strLow)
    .every(letter => hexDigitSet.has(letter))
}

export function isCorrectColorValue(str) {
  if (!str) {
    return false
  }

  return isLettersOnly(str) || isHexColorValue(str)
}

export function formatColor(str) {
  return isHexColorValue(str)
    ? `#${str}`
    : str
}
