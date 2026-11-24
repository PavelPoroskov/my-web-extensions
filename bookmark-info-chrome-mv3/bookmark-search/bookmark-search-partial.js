import {
  startPartialUrlSearch,
} from '../url-api/index.js'
import {
  addFieldsToBookmarkList,
} from './bookmark-search-add-fields.js'
import {
  formatColorDirectiveValue,
} from '../shared/color.js'
import {
  makeLogFunction,
} from '../api-low/index.js'

const logBLP = makeLogFunction({ module: 'bookmark-search-partial.js' })

export async function getPartialBookmarkList({ url, exactBkmIdList = [] }) {
  // 1 < pathname.length : it is not root path
  //    for https://www.youtube.com/watch?v=qqqqq other conditions than 1 < pathname.length
  // urlForSearch !== url : original url has search params, ending /, index[.xxxx]
  //  original url can be normalized yet, but I want get url with search params, ending /, index[.xxxx]

  const {
    isSearchAvailable,
    urlForSearch,
    isUrlMatchToPartialUrlSearch,
  } = await startPartialUrlSearch({ url })
  logBLP('22 startPartialUrlSearch', { isSearchAvailable, urlForSearch })

  if (!isSearchAvailable) {
    return []
  }

  const nodeListForSubstring = await chrome.bookmarks.search(urlForSearch);
  logBLP('33 search(normalizedUrl)', nodeListForSubstring.length, nodeListForSubstring)

  const yetSet = new Set(exactBkmIdList)
  const bookmarkList = nodeListForSubstring
    .filter((node) => !!node.url && !yetSet.has(node.id) && isUrlMatchToPartialUrlSearch(node.url))
  const listWithParent = await addFieldsToBookmarkList(bookmarkList)

  return listWithParent
    .filter(({ parentTitle }) => !(parentTitle.endsWith(' #top') || parentTitle.includes(' #top ')))
    .map((bookmark) => ({
        id: bookmark.id,
        url: bookmark.url,
        parentId: bookmark.parentId,
        parentTitle: bookmark.parentTitleOnly,
        parentColor: formatColorDirectiveValue(bookmark.color),
        icon: bookmark.icon,
    }));
}
