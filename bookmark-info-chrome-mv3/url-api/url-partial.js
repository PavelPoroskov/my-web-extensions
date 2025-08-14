import {
  makeLogFunction,
} from '../api-low/index.js'

const logUP = makeLogFunction({ module: 'url-partial.js' })

function removeIndexFromPathname(pathname) {
  let list = pathname.split(/(\/)/)
  const last = list.at(-1)

  if (last.startsWith('index.') || last === 'index') {
    list = list.slice(0, -1)
  }

  return list.join('')
}

function removeLastSlashFromPathname(pathname) {
  return pathname.length > 1 && pathname.endsWith('/')
    ? pathname.slice(0, -1)
    : pathname
}

export const getPathnameForSearch = (pathname) => {
  let mPathname = pathname

  // no index in pathname
  mPathname = removeIndexFromPathname(mPathname)
  mPathname = removeLastSlashFromPathname(mPathname)

  return mPathname
}

export const pathToList = (pathname) => {
  let list = pathname.split(/(\/)/).filter(Boolean)

  if (1 < list.length && list.at(-1) === '/') {
    list = list.slice(0, -1)
  }

  return list
}
export const isPathPartMathToPatternPart = ({ patternPart, pathPart }) => {
  let result

  if (patternPart.startsWith(':@')) {
    result = pathPart && pathPart.startsWith('@')
  } else if (patternPart.startsWith(':')) {
    result = pathPart && pathPart != '/'
  } else {
    result = pathPart === patternPart
  }
  logUP('isPathPartMathToPatternPart () 11', patternPart, pathPart, result)

  return result
}

export const getPathnamePart = ({ pathname, pattern }) => {
  const pathAsList = pathToList(pathname)
  const patternAsList = pathToList(pattern)
  const resultPartList = []

  let isOk = patternAsList.length <= pathAsList.length

  let i = 0
  while (isOk && i < patternAsList.length) {
    isOk = isPathPartMathToPatternPart({ patternPart: patternAsList[i], pathPart: pathAsList[i] })
    if (isOk) {
      resultPartList.push(pathAsList[i])
    }
    i = i + 1
  }

  let resultPathname = isOk
    ? resultPartList.join('')
    : undefined

  return resultPathname
}
