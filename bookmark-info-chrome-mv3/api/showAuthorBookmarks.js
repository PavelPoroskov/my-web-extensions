import {
  getPartialBookmarkList,
} from './get-bookmarks.api.js'
import {
  getAuthorUrlFromPostUrl,
  getMatchedGetAuthor,
  removeHashAndSearchParams,
} from '../url-api/index.js'
import { page } from '../api-mid/index.js'
import {
  makeLogFunction,
} from '../api-low/index.js'

const logSHA = makeLogFunction({ module: 'showAuthorBookmarks.js' })

export async function showAuthorBookmarksStep2({ tabId, url, authorUrl }) {
  logSHA('showAuthorBookmarksStep2 () 00', tabId, authorUrl, url)
  let authorBookmarkList = []

  if (authorUrl) {
    let cleanedAuthorUrl = removeHashAndSearchParams(authorUrl);
    const matchedGetAuthor = getMatchedGetAuthor(url)

    authorBookmarkList = await getPartialBookmarkList({
      url: cleanedAuthorUrl,
      pathnamePattern: matchedGetAuthor?.authorPattern,
    })
  }

  const data = {
    authorBookmarkList,
  }
  logSHA('showAuthorBookmarksStep2 () 99 sendMessage', tabId, data);
  await page.updateBookmarkInfoInPage({ tabId, data })
}

export async function showAuthorBookmarks({ tabId, url }) {
  const matchedGetAuthor = getMatchedGetAuthor(url)
  logSHA('showAuthorBookmarks () 00', tabId, url, matchedGetAuthor)

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
