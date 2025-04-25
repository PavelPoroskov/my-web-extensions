import {
  getHostSettings,
} from './url-settings.js'
import {
  isUrlMath,
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

function cleanAuthorUrlRemoveLast(url) {
  const oUrl = new URL(url)
  const pathPartList = oUrl.pathname.split(/(\/)/).filter(Boolean)

  oUrl.pathname = pathPartList.slice(0, -1).join('')

  return oUrl.toString()
}

export function cleanAuthorUrl({ url, method }) {
  if (method == 'pathname-remove-last') {
    return cleanAuthorUrlRemoveLast(url)
  } else {
    return url
  }
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

    if (isUrlMath({ url, pattern: pagePattern })) {
      matchedGetAuthor = getAuthorList[iWhile]
    }

    iWhile += 1
  }

  return matchedGetAuthor
}

