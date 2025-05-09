import {
  pathToList,
  isPathPartMathToPatternPart,
} from './url-partial.js'
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

export const isPathnameMatchForPatternExactly = (pathname, pattern) => {
  logUIS('isPathnameMatchForPatternExactly () 00', pathname)
  logUIS('isPathnameMatchForPatternExactly () 00', pattern)

  if (pattern === '*') {
    return true
  }

  const pathAsList = pathToList(pathname)
  logUIS('isPathnameMatchForPatternExactly () 11 pathAsList', pathAsList)

  const patternAsList = pathToList(pattern)
  logUIS('isPathnameMatchForPatternExactly () 11 patternAsList', patternAsList)

  const isMath = 0 < patternAsList.length && pathAsList.length === patternAsList.length
    && patternAsList.every((patternPart, patternIndex) => isPathPartMathToPatternPart({ patternPart, pathPart: pathAsList[patternIndex] })
  )

  return isMath
}

function isSearchParamsMatchForPattern({ searchParams, searchParamsPattern }) {
  if (!searchParamsPattern) {
    return true
  }

  const keyList = searchParamsPattern
    .split('&')
    .map((keyValue) => keyValue.split('=')[0])

  return keyList
    .every((key) => searchParams.get(key) !== undefined)
}

export function isUrlMathPathnameAndSearchParams({ url, pattern }) {
  if (!pattern) {
    return false
  }

  const oUrl = new URL(url);
  const { pathname, searchParams } = oUrl;

  const [pathPattern, searchParamsPattern] = pattern.split('?')

  if (pathPattern) {
    if (!isPathnameMatchForPatternExactly(pathname, pathPattern)) {
      return false
    }
  }

  if (searchParamsPattern) {
    if (!isSearchParamsMatchForPattern({ searchParams, searchParamsPattern })) {
      return false
    }
  }

  return true
}
