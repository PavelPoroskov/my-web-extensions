import {
  searchBookmarksForUrl,
} from './bookmark-list-nodes.js'
import {
  addFieldsToBookmarkList,
} from './bookmark-list-add-fields.js'
import {
  formatColorDirectiveValue,
} from '../api-low/index.js'

export async function getDirectBookmarkList(url) {
  const bookmarkList = await searchBookmarksForUrl(url)
  const listWithTemplate = await addFieldsToBookmarkList(bookmarkList, ['path'])

  const selectedBookmarkList = listWithTemplate
    .map((bookmark) => ({
        id: bookmark.id,
        title: bookmark.title,
        parentId: bookmark.parentId,
        parentTitle: bookmark.parentTitle,
        parentColor: formatColorDirectiveValue(bookmark.color),
        icon: bookmark.icon,
        path: bookmark.path,
        templateId: bookmark.templateId,
        templateTitle: bookmark.templateTitle,
        isInternal: bookmark.isInternal,
      }));

  return selectedBookmarkList
}
