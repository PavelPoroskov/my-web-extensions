import {
  getBookmarkListDirty,
  makeLogFunction,
} from '../api-low/index.js';
import {
  isDatedTitleForTemplate,
  compareDatedTitle,
} from '../folder-api/index.js';
import {
  removeBookmark,
} from './bookmark-ignore.js';

const logBDT = makeLogFunction({ module: 'bookmark-dated.js' })

export async function getDatedBookmarkList({ url, template }) {
  const bookmarkList = await chrome.bookmarks.search({ url });
  logBDT('getDatedBookmarkList () 00', bookmarkList)

  const parentIdList = bookmarkList.map(({ parentId }) => parentId)
  const uniqueParentIdList = Array.from(new Set(parentIdList))
  if (uniqueParentIdList.length == 0) {
    return []
  }

  const parentFolderList = await getBookmarkListDirty(uniqueParentIdList)

  const parentMap = Object.fromEntries(
    parentFolderList
      .map(({ id, title}) => [id, title])
  )

  const selectedList = bookmarkList
    .map(({ id, parentId }) => ({ id, parentTitle: parentMap[parentId] }))
    .filter(({ parentTitle }) => isDatedTitleForTemplate({ title: parentTitle, template }))

  return selectedList
}

export async function removePreviousDatedBookmarks({ url, template }) {
  const bookmarkList = await getDatedBookmarkList({ url, template })

  const removeFolderList = bookmarkList
    .toSorted((a,b) => compareDatedTitle(a.parentTitle, b.parentTitle))
    .slice(1)

  if (removeFolderList.length == 0) {
    return
  }

  await Promise.all(
    removeFolderList.map(
      ({ id }) => removeBookmark(id)
    )
  )
}

export async function removeDatedBookmarksForTemplate({ url, template }) {
  const removeFolderList = await getDatedBookmarkList({ url, template })

  await Promise.all(
    removeFolderList.map(
      ({ id }) => removeBookmark(id)
    )
  )
}
