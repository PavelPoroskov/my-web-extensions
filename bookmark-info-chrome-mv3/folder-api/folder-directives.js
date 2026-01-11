
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

export function getTitleDetails(title) {
  const partList = title
    .split(' ')
    .filter(Boolean)

  const objDirectives = {}
  let i = partList.length - 1

  while (-1 < i) {
    const lastWord = partList[i]
    const isDirective = lastWord.startsWith('#')

    if (!isDirective) {
      break
    }

    const directive = lastWord.slice(1)
    const [directiveName, directiveValue] = directive.split(':')
    const directiveNameLow = directiveName !== undefined ? directiveName.toLowerCase() : undefined

    let value

    switch (directiveNameLow) {
      case 'top': {
        value = ''
        break
      }
      case 'c':
      case 'color': {
        if (isCorrectColorValue(directiveValue)) {
          value = directiveValue
        }
        break
      }
      case 'o':
      case 'order': {
        value = directiveValue
        break
      }
      case 'g':
      case 'group': {
        value = directiveValue
        break
      }
    }

    if (directiveNameLow !== undefined && value !== undefined) {
      objDirectives[directiveNameLow] = value;
    }

    i = i - 1
  }

  const wordList = partList.slice(0, i+1)
  const onlyTitle = wordList.join(' ')

  return {
    onlyTitle,
    objDirectives,
  }
}

export function getTitleWithDirectives({ onlyTitle, objDirectives }) {
  const objFilteredDirectives = Object.assign({}, objDirectives)
  const keyList = Object.keys(objFilteredDirectives)
  keyList.forEach(key => {
    const keyLow = key.toLowerCase()
    if (key !== keyLow) {
      objFilteredDirectives[keyLow] = objFilteredDirectives[key];
      delete objFilteredDirectives[key]
    }
  })

  const orderValue = objFilteredDirectives['o']
  delete objFilteredDirectives['o']
  const orderStr = orderValue && `#o:${orderValue}`

  const strDirectives = Object.entries(objFilteredDirectives)
    .toSorted((a,b) => a[0].localeCompare(b[0]))
    .map(([key,value]) => (value ? `#${key}:${value}` : `#${key}`))
    .join(' ')

  return [onlyTitle, orderStr, strDirectives].filter(Boolean).join(' ')
}

export function isChangesInDirectives({ oldDirectives, newDirectives }) {
  for (const key in newDirectives) {

    if (!(key in oldDirectives)) {
      return true
    }

    if (oldDirectives[key] != newDirectives[key]) {
      return true
    }
  }

  return false
}
