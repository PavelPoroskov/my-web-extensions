import {
  getHostSettings,
} from './url-settings.js'
import {
  isUrlMathPathnameAndSearchParams,
} from './url-search-is.js'

export function getAuthorUrlFromPostUrl(url) {
  const oUrl = new URL(url)
  let pathPartList = oUrl.pathname.split(/(\/)/).filter(Boolean)
  let iEnd = -1

  if (pathPartList.at(iEnd) == '/') {
    iEnd -= 1
  }
  if (pathPartList.at(iEnd)) {
    iEnd -= 1
  }
  if (pathPartList.at(iEnd) == '/') {
    iEnd -= 1
  }

  oUrl.pathname = pathPartList.slice(0, iEnd + 1).join('')

  return oUrl.toString()
}

export function getMatchedGetAuthor(url) {
  // logUAU('getMatchedGetAuthor () 00', url)
  const targetHostSettings = getHostSettings(url)

  if (!targetHostSettings?.getAuthor) {
    return
  }

  const getAuthorList = Array.isArray(targetHostSettings.getAuthor)
    ? targetHostSettings.getAuthor
    : [targetHostSettings.getAuthor]

  let matchedGetAuthor
  let iWhile = 0
  while (!matchedGetAuthor && iWhile < getAuthorList.length) {
    const { pagePattern } = getAuthorList[iWhile]

    if (isUrlMathPathnameAndSearchParams({ url, pattern: pagePattern })) {
      matchedGetAuthor = getAuthorList[iWhile]
    }

    iWhile += 1
  }

  return matchedGetAuthor
}
