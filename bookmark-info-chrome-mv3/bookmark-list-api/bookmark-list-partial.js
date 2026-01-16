import {
  startPartialUrlSearch,
} from '../url-api/index.js'
import {
  addBookmarkParentInfo,
  addBookmarkColorInfo,
} from './bookmark-list-with-parent.js'
import {
  makeLogFunction,
  formatColor,
} from '../api-low/index.js'

const logBLP = makeLogFunction({ module: 'bookmark-list-partial.js' })

// TODO clear logic
//  showPartialBookmarks(
//    const bookmarkList = await getPartialBookmarkList ({ url, exactBkmIdList })
//  showAuthorBookmarksStep2(
//    getPartialBookmarkList({ url: cleanedAuthorUrl, pathnamePattern: matchedGetAuthor?.authorPattern })
export async function getPartialBookmarkList({ url, exactBkmIdList = [], pathnamePattern }) {
  // 1 < pathname.length : it is not root path
  //    for https://www.youtube.com/watch?v=qqqqq other conditions than 1 < pathname.length
  // urlForSearch !== url : original url has search params, ending /, index[.xxxx]
  //  original url can be normalized yet, but I want get url with search params, ending /, index[.xxxx]

  const {
    isSearchAvailable,
    urlForSearch,
    isUrlMatchToPartialUrlSearch,
  } = await startPartialUrlSearch({ url, pathnamePattern })
  logBLP('getPartialBookmarkList () 22 startPartialUrlSearch', { isSearchAvailable, urlForSearch })

  if (!isSearchAvailable) {
    return []
  }

  const bkmListForSubstring = await chrome.bookmarks.search(urlForSearch);
  logBLP('getPartialBookmarkList () 33 search(normalizedUrl)', bkmListForSubstring.length, bkmListForSubstring)

  const yetSet = new Set(exactBkmIdList)
  const partialBookmarkList = []
  bkmListForSubstring.forEach((bkm) => {
    if (bkm.url && isUrlMatchToPartialUrlSearch(bkm.url) && !yetSet.has(bkm.id)) {
      partialBookmarkList.push(bkm)
    }
  })

  const listWithParent = await addBookmarkParentInfo(partialBookmarkList)
  const listWithParent2 = await addBookmarkColorInfo(listWithParent)

  return listWithParent2
    .map((bookmark) => ({
        id: bookmark.id,
        url: bookmark.url,
        parentId: bookmark.parentId,
        parentTitle: bookmark.parentTitle,
        parentColor: formatColor(bookmark.templateColor || bookmark.parentColor),
    }));
}
