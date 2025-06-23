export function getTitleDetails(title) {
  const partList = title
    .split(' ')
    .filter(Boolean)

  const objDirectives = {}
  let i = partList.length - 1

  while (-1 < i) {
    const lastWord = partList[i]
    const isDirective = lastWord.startsWith('#') || lastWord.startsWith(':')

    if (isDirective) {
      let key = lastWord.toLowerCase()
      let value = ''

      if (key.startsWith('#') && key != '#top') {
        key = '#color'
        value = key.slice(1).toUpperCase()
      }

      objDirectives[key] = value;
    } else {
      break
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
  const strDirectives = Object.entries(objDirectives)
    .toSorted((a,b) => a[0].localeCompare(b[0]))
    .map(([key,value]) => (key == '#color'
      ? `#${value}`
      : key
    ))
    .join(' ')

    return [onlyTitle, strDirectives].filter(Boolean).join(' ')
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
