const digitSet = new Set('0123456789')
const hexDigitSet = new Set('0123456789abcdef')
const letterSet = new Set('abcdefghijklmnopqrstuvwxy')

function isDigitValue(str) {
  const strLow = str.toLowerCase()

  return strLow.at(0) != '0' && Array.from(strLow)
    .every(letter =>  digitSet.has(letter))
}

function isHexDigitsOnly(str) {
  const strLow = str.toLowerCase()

  return Array.from(strLow)
    .every(letter =>  hexDigitSet.has(letter))
}

function isHexValue(str) {
  return str.at(0) != '0' && isHexDigitsOnly(str)
}

function isLettersOnly(str) {
  const strLow = str.toLowerCase()

  return Array.from(strLow)
    .every(letter =>  letterSet.has(letter))
}

function isHexColorValue(str) {
  return str.length === 6 && isHexDigitsOnly(str)
}

function isLettersColorValue(str) {
  return (0 < str.length && str.length <= 25) && isLettersOnly(str)
}

function isCorrectColorValue(str) {
  if (!str) {
    return false
  }

  return isLettersColorValue(str) || isHexColorValue(str)
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

function isCorrectIconValue(str) {
  if (!str) {
    return false
  }

  let strRest
  if (str.endsWith(';')) {
    strRest = str.slice(0, -1)
  } else {
    return false
  }

  if (strRest.startsWith('&#x')) {
    strRest = strRest.slice(3)
    return strRest.length === 4 && isHexValue(strRest)
  } else if (strRest.startsWith('&#')) {
    strRest = strRest.slice(2)
    return (strRest.length === 4 || strRest.length === 5) && isDigitValue(strRest)
  } else if (strRest.startsWith('&')) {
    strRest = strRest.slice(1)
    return strRest.length > 0 && isLettersOnly(strRest)
  } else {
    return false
  }
}

export function isCorrectIconDirectiveValue(str) {
  if (!str) {
    return false
  }

  const [iconCode, textColor] = str.split(':')

  return isCorrectIconValue(iconCode) && (textColor
    ?  isCorrectColorValue(textColor)
    : true
  )
}
