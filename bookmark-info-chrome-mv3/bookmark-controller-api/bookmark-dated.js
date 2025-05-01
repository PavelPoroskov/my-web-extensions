import {
  tagList,
} from '../api-mid/index.js';
import {
  makeLogFunction,
} from '../api-low/index.js';
import {
  isDatedTitleForTemplate,
} from '../folder-api/index.js';
import {
  findOrCreateDatedFolder,
} from './folder-create.js';
import {
  moveBookmarkIgnoreInController,
  removeBookmark,
} from './bookmark-ignore.js';

const logBDT = makeLogFunction({ module: 'bookmark-dated.js' })

export async function getDatedBookmarks({ url, template }) {
  const bookmarkList = await chrome.bookmarks.search({ url });
  logBDT('getDatedBookmarks () 00', bookmarkList)

  const parentIdList = bookmarkList.map(({ parentId }) => parentId)
  const uniqueParentIdList = Array.from(new Set(parentIdList))
  if (uniqueParentIdList.length == 0) {
    return []
  }

  const parentFolderList = await chrome.bookmarks.get(uniqueParentIdList)

  const parentMap = Object.fromEntries(
    parentFolderList
      .map(({ id, title }) => [id, isDatedTitleForTemplate({ title, template })])
  )

  const selectedList = bookmarkList
    .filter(({ parentId }) => parentMap[parentId] == true)

  return selectedList
}

export async function removePreviousDatedBookmarks({ url, template }) {
  const bookmarkList = await getDatedBookmarks({ url, template })

  const removeFolderList = bookmarkList
    .toSorted((a,b) => a.parentTitle.localeCompare(b.parentTitle))
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
  const removeFolderList = await getDatedBookmarks({ url, template })

  await Promise.all(
    removeFolderList.map(
      ({ id }) => removeBookmark(id)
    )
  )
}

export async function moveBookmarkInDatedTemplate({
  parentId,
  parentTitle,
  bookmarkId,
  url,
  isSingle,
}) {
  const datedFolder = await findOrCreateDatedFolder({ templateTitle: parentTitle, templateId: parentId })
  logBDT('moveBookmarkInDatedTemplate () 11', 'datedFolder', datedFolder)

  // await chrome.bookmarks.move(bookmarkId, { parentId: datedFolder.id, index: 0 })
  await moveBookmarkIgnoreInController({
    id: bookmarkId,
    parentId: datedFolder.id,
    index: isSingle? 0 : undefined,
  })

  await tagList.addRecentTagFromFolder({ id: parentId, title: parentTitle })
  removePreviousDatedBookmarks({ url, template: parentTitle })
}
