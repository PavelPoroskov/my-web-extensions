import {
  startPartialUrlSearch,
} from '../url-api/index.js'
import {
  addFieldsToBookmarkList,
} from './bookmark-search-add-fields.js'
import {
  formatColorDirectiveValue,
} from '../shared/color.js'

export async function getAuthorBookmarkList({ url, pathnamePattern }) {
  const {
    isSearchAvailable,
    urlForSearch,
    isUrlMatchToPartialUrlSearch,
  } = await startPartialUrlSearch({ url, pathnamePattern })

  if (!isSearchAvailable) {
    return []
  }

  const nodeListForSubstring = await chrome.bookmarks.search(urlForSearch);

  const bookmarkList = nodeListForSubstring
    .filter(({ url }) => !!url && isUrlMatchToPartialUrlSearch(url))
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
