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

function isCorrectColorValue(str) {
  if (!str) {
    return false
  }

  return isLettersOnly(str) || isHexColorValue(str)
}

export function isCorrectColorDirectiveValue(str) {
  if (!str) {
    return false
  }

  const [bgColor, textColor] = str.split(':')

  return isCorrectColorValue(bgColor) && (textColor
    ?  isCorrectColorValue(textColor)
    : true
  )
}

function formatColor(str) {
  return isHexColorValue(str)
    ? `#${str}`
    : str
}

export function formatColorDirectiveValue(str) {
  if (!str) {
    return ''
  }

  const [bgColor, textColor] = str.split(':')
  const formattedBgColor = formatColor(bgColor)

  return textColor
    ? `${formattedBgColor}:${formatColor(textColor)}`
    : formattedBgColor
}
