import {
  makeLogFunction,
} from '../api-low/index.js';
import {
  tagList,
} from '../data-structures/index.js';
import {
  isDatedTitleForTemplate,
} from '../folder-api/index.js';
import {
  getDatedFolder,
} from './folder-create.js';
import {
  createBookmarkInCommonFolder,
} from './bookmark-create1.js';
import {
  moveBookmarkIgnoreInController,
} from './bookmark-ignore.js';

const logBDT = makeLogFunction({ module: 'bookmark-dated.js' })

async function removePreviousDatedBookmarks({ url, template }) {
  const bookmarkList = await chrome.bookmarks.search({ url });
  logBDT('removePreviousDatedBookmarks () 00', bookmarkList)

  const parentIdList = bookmarkList.map(({ parentId }) => parentId)
  const uniqueParentIdList = Array.from(new Set(parentIdList))
  const parentFolderList = await chrome.bookmarks.get(uniqueParentIdList)

  const parentMap = Object.fromEntries(
    parentFolderList
      .map(({ id, title}) => [id, title])
  )

  const removeFolderList = bookmarkList
    .map(({ id, parentId }) => ({ id, parentTitle: parentMap[parentId] }))
    .filter(({ parentTitle }) => isDatedTitleForTemplate({ title: parentTitle, template }))
    .toSorted((a,b) => a.parentTitle.localeCompare(b.parentTitle))
    .slice(1)
  logBDT('removePreviousDatedBookmarks () 00', 'removeFolderList', removeFolderList)

  if (removeFolderList.length == 0) {
    return
  }

  await Promise.all(
    removeFolderList.map(
      ({ id }) => chrome.bookmarks.remove(id)
    )
  )
}

export async function removeDatedBookmarksForTemplate({ url, template }) {
  const bookmarkList = await chrome.bookmarks.search({ url });
  logBDT('removePreviousDatedBookmarks () 00', bookmarkList)

  const parentIdList = bookmarkList.map(({ parentId }) => parentId)
  const uniqueParentIdList = Array.from(new Set(parentIdList))
  const parentFolderList = await chrome.bookmarks.get(uniqueParentIdList)

  const parentMap = Object.fromEntries(
    parentFolderList
      .map(({ id, title}) => [id, title])
  )

  const removeFolderList = bookmarkList
    .map(({ id, parentId }) => ({ id, parentTitle: parentMap[parentId] }))
    .filter(({ parentTitle }) => isDatedTitleForTemplate({ title: parentTitle, template }))

  await Promise.all(
    removeFolderList.map(
      ({ id }) => chrome.bookmarks.remove(id)
    )
  )
}

export async function createBookmarkInDatedTemplate({
  parentId,
  parentTitle,
  title,
  url
}) {
  const datedFolder = await getDatedFolder(parentTitle, parentId)
  logBDT('createBookmarkInDatedTemplate () 11', 'datedFolder', datedFolder)

  const result = await createBookmarkInCommonFolder({ parentId: datedFolder.id, title, url })

  await tagList.addRecentTagFromFolder({ id: parentId, title: parentTitle })
  removePreviousDatedBookmarks({ url, template: parentTitle })

  return result
}

export async function moveBookmarkInDatedTemplate({
  parentId,
  parentTitle,
  bookmarkId,
  url,
  isSingle,
}) {
  const datedFolder = await getDatedFolder(parentTitle, parentId)
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
