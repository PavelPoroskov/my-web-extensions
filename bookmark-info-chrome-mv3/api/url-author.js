import {
  getHostSettings,
} from './url.api.js'
import {
  isUrlMath,
} from './url-is.js'
import {
  removeQueryParamsIfTarget,
} from './clear-url.api.js'
import {
  getBookmarkInfoUni,
} from './get-bookmarks.api.js'
import { page } from './page.api.js'
import {
  makeLogFunction,
} from '../api-low/index.js'

const logUAU = makeLogFunction({ module: 'url-author.js' })

function getAuthorUrlFromPostUrl(url) {
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

function cleanAuthorUrl({ url, method }) {
  if (method == 'pathname-remove-last') {
    return cleanAuthorUrlRemoveLast(url)
  } else {
    return url
  }
}

function getMatchedGetAuthor(url) {
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

export async function showAuthorBookmarksStep2({ tabId, url, authorUrl }) {
  logUAU('showAuthorBookmarksStep2 () 00', tabId, authorUrl, url)
  let authorBookmarkList = []

  if (authorUrl) {
    let cleanedAuthorUrl = removeQueryParamsIfTarget(authorUrl);

    const matchedGetAuthor = getMatchedGetAuthor(url)
    if (matchedGetAuthor?.cleanAuthorUrlMethod) {
      // https://www.linkedin.com/company/companyOne/life -> https://www.linkedin.com/company/companyOne
      cleanedAuthorUrl = cleanAuthorUrl({
        url: cleanedAuthorUrl,
        method: matchedGetAuthor.cleanAuthorUrlMethod,
      })
    }

    logUAU('showAuthorBookmarksStep2 () 11', 'cleanedAuthorUrl', cleanedAuthorUrl)
    const bookmarkInfo = await getBookmarkInfoUni({ url: cleanedAuthorUrl, useCache: true })
    authorBookmarkList = bookmarkInfo.bookmarkList
  }

  const data = {
    authorBookmarkList,
  }
  logUAU('showAuthorBookmarksStep2 () 99 sendMessage', tabId, data);
  await page.updateBookmarkInfoInPage({ tabId, data })
}

export async function showAuthorBookmarks({ tabId, url }) {
  const matchedGetAuthor = getMatchedGetAuthor(url)
  logUAU('showAuthorBookmarks () 00', tabId, url, matchedGetAuthor)

  switch (true) {
    case !!matchedGetAuthor?.authorSelector: {
      await page.sendMeAuthor({
        tabId,
        authorSelector: matchedGetAuthor.authorSelector,
      })
      break
    }
    case !!matchedGetAuthor: {
      showAuthorBookmarksStep2({
        tabId,
        url,
        authorUrl: getAuthorUrlFromPostUrl(url),
      })
      break
    }
    default:
      showAuthorBookmarksStep2({ tabId })
  }
}
