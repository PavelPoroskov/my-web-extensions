import {
  getBookmarkListWithParent,
} from '../bookmark-list-api/bookmark-list-with-parent.js';
import {
  isDatedTitleForTemplate,
  compareDatedTitle,
} from '../folder-api/index.js';
import {
  removeBookmark,
} from './bookmark-ignore.js';

export async function getDatedBookmarkList({ url, template }) {
  const bookmarkListWithParent = await getBookmarkListWithParent(url)

  const selectedList = bookmarkListWithParent
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
