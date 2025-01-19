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

export async function showAuthorBookmarks({ tabId, url }) {
  logUAU('showAuthorBookmarks () 00', tabId, url)
  const targetHostSettings = getHostSettings(url)

  if (targetHostSettings?.getAuthor) {
    const { pagePattern, authorSelector } = targetHostSettings.getAuthor

    if (isUrlMath({ url, pattern: pagePattern })) {
      await page.sendMeAuthor({ tabId, authorSelector })
    }
  }
}

export async function showAuthorBookmarksStep2({ tabId, authorUrl }) {
  logUAU('showAuthorBookmarksStep2 () 00', tabId, authorUrl)
  if (!authorUrl) {
    return
  }

  const url = removeQueryParamsIfTarget(authorUrl);
  const bookmarkInfo = await getBookmarkInfoUni({ url, useCache: true })

  const data = {
    authorBookmarkList: bookmarkInfo.bookmarkList,
  }
  logUAU('showAuthorBookmarksStep2 () 99 sendMessage', tabId, data);
  await page.updateBookmarkInfoInPage({ tabId, data })
}
