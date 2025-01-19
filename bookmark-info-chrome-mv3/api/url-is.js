import {
  makeLogFunction,
} from '../api-low/index.js'

const logUIS = makeLogFunction({ module: 'url-is.js' })

export function makeIsSearchParamMatch(patternList) {
  logUIS('makeIsSearchParamMatch () 00', patternList)
  const isFnList = []

  patternList.forEach((pattern) => {
    logUIS('makeIsSearchParamMatch () 11', 'pattern', pattern)
    const asteriskIndex = pattern.indexOf('*')
    const partsLength = pattern.split('*').length
    switch (true) {
      case asteriskIndex < 0: {
        const fullPattern = pattern
        isFnList.push((s) => s == fullPattern)
        logUIS('makeIsSearchParamMatch () 11', '(s) => s == fullPattern', fullPattern)
        break
      }
      case asteriskIndex == 0 && partsLength == 2: {
        if (pattern.length == 1) {
          isFnList.push(() => true)
          logUIS('makeIsSearchParamMatch () 11', '() => true', pattern)
        } else {
          const end = pattern.slice(asteriskIndex + 1)
          // isFnList.push((s) => s.endsWith(end) && end.length < s.length)
          isFnList.push((s) => s.endsWith(end))
          logUIS('makeIsSearchParamMatch () 11', '(s) => s.endsWith(end)', end)
        }
        break
      }
      case 0 < asteriskIndex && partsLength == 2: {
        const start = pattern.slice(0, asteriskIndex)
        if (asteriskIndex == pattern.length - 1) {
          isFnList.push((s) => s.startsWith(start))
          logUIS('makeIsSearchParamMatch () 11', '(s) => s.startsWith(start)', start)
        } else {
          const end = pattern.slice(asteriskIndex + 1)
          const minLength = start.length + end.length
          isFnList.push((s) => s.startsWith(start) && s.endsWith(end) && minLength <= s.length)
          logUIS('makeIsSearchParamMatch () 11', '(s) => s.startsWith(start) && s.endsWith(end) && minLength <= s.length', start, end)
        }
      }
    }
  })

  logUIS('makeIsSearchParamMatch () 99', 'isFnList.length', isFnList.length)
  return (name) => isFnList.some((isFn) => isFn(name))
}

export const isPathnameMatchForPattern = ({ pathname, patternList }) => {
  logUIS('isPathnameMatch () 00', pathname)
  logUIS('isPathnameMatch () 00', patternList)

  const pathToList = (pathname) => {
    let list = pathname.split(/(\/)/).filter(Boolean)

    if (1 < list.length && list.at(-1) === '/') {
      list = list.slice(0, -1)
    }

    return list
  }
  const isPartsEqual = (patternPart, pathPart) => {
    let result

    if (patternPart.startsWith(':')) {
      result = pathPart && pathPart != '/'
    } else {
      result = pathPart === patternPart
    }
    logUIS('isPartsEqual () 11', patternPart, pathPart, result)

    return result
  }

  if (patternList.includes('*')) {
    return true
  }

  let isMath = false
  const pathAsList = pathToList(pathname)
  logUIS('isPathnameMatch () 11 pathAsList', pathAsList)

  let i = 0
  while (!isMath && i < patternList.length) {
    const pattern = patternList[i]
    const patternAsList = pathToList(pattern)
    logUIS('isPathnameMatch () 11 patternAsList', patternAsList)

    isMath = patternAsList.length > 0 && pathAsList.length === patternAsList.length
      && patternAsList.every((patternPart, patternIndex) => isPartsEqual(patternPart, pathAsList[patternIndex])
    )
    i += 1
  }

  return isMath
}

export function isUrlMath({ url, pattern }) {
  if (!pattern) {
    return false
  }

  const oUrl = new URL(url);
  const { pathname } = oUrl;

  return isPathnameMatchForPattern({ pathname, patternList: [pattern] })
}
