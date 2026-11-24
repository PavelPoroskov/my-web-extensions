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
  console.log('getDirectBookmarkList listWithTemplate', listWithTemplate)

  const selectedBookmarkList = listWithTemplate
    .filter(({ parentTitle }) => !(parentTitle.endsWith(' #top') || parentTitle.includes(' #top ')))
    .map((bookmark) => ({
        id: bookmark.id,
        title: bookmark.title,
        parentId: bookmark.parentId,
        parentTitle: bookmark.parentTitleOnly,
        parentColor: formatColorDirectiveValue(bookmark.color),
        icon: bookmark.icon,
        path: bookmark.path,
        templateId: bookmark.templateId,
        templateTitle: bookmark.templateTitle,
        onlyTitle: bookmark.onlyTitle,
        isInternal: bookmark.isInternal,
      }));

  return selectedBookmarkList
}
