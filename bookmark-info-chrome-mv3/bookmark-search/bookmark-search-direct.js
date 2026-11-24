import {
  addFieldsToBookmarkList,
} from './bookmark-search-add-fields.js'
import {
  formatColorDirectiveValue,
} from '../shared/color.js'

export async function getDirectBookmarkList(url) {
  if (url.startsWith('chrome:') || url.startsWith('about:')) {
    return []
  }

  const bookmarkList = await chrome.bookmarks.search({ url });
  const listWithTemplate = await addFieldsToBookmarkList(bookmarkList, ['path'])

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
