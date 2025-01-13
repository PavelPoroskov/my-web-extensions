import {
  tagList,
} from '../data-structures/index.js';
import {
  getDatedFolder,
  isDatedFolderTemplate,
  removePreviousDatedBookmarks,
} from '../folder-api/index.js';
import {
  ignoreBkmControllerApiActionSet,
  makeLogFunction,
} from '../api-low/index.js';

const logBA = makeLogFunction({ module: 'bookmark.api.js' })


let lastCreatedBkmParentId
let lastCreatedBkmUrl

export async function createBookmarkInCommonFolder({
  parentId,
  title,
  url
}) {
  const bookmarkList = await chrome.bookmarks.search({ url });
  const isExist = bookmarkList.some((bkm) => bkm.parentId == parentId)
  if (isExist) {
    return
  }

  lastCreatedBkmParentId = parentId
  lastCreatedBkmUrl = url

  return await chrome.bookmarks.create({
    index: 0,
    parentId,
    title,
    url
  })
}

export async function createBookmarkInDatedTemplate({
  parentId,
  parentTitle,
  title,
  url
}) {
  const datedFolder = await getDatedFolder(parentTitle)
  logBA('createBookmarkInDatedTemplate () 11', 'datedFolder', datedFolder)

  const result = await createBookmarkInCommonFolder({ parentId: datedFolder.id, title, url })

  await tagList.addRecentTagFromFolder({ id: parentId, title: parentTitle })
  removePreviousDatedBookmarks({ url, template: parentTitle })

  return result
}

export async function createBookmark({ parentId, title, url }) {
  const [folderNode] = await chrome.bookmarks.get(parentId)
  const isDatedTemplate = isDatedFolderTemplate(folderNode.title)

  let result
  if (isDatedTemplate) {
    result = await createBookmarkInDatedTemplate({
      parentId,
      parentTitle: folderNode.title,
      title,
      url,
    })
  } else {
    result = await createBookmarkInCommonFolder({ parentId, title, url })
  }

  return result
}

export function isBookmarkCreatedWithApi({ parentId, url }) {
  return parentId == lastCreatedBkmParentId && url == lastCreatedBkmUrl
}

export async function createBookmarkIgnoreInController({
  title,
  url,
  parentId,
  index,
}) {
  const options = { url, parentId, title }
  if (index != undefined) {
    options.index = index
  }

  ignoreBkmControllerApiActionSet.addIgnoreCreate(options)

  return await chrome.bookmarks.create(options)
}

export async function moveBookmarkIgnoreInController({ id, parentId, index }) {
  const options = {}
  if (parentId != undefined) {
    options.parentId = parentId
  }
  if (index != undefined) {
    options.index = index
  }
  if (Object.keys(options).length == 0) {
    return
  }

  ignoreBkmControllerApiActionSet.addIgnoreMove(id)

  return await chrome.bookmarks.move(id, options)
}

export async function removeBookmarkIgnoreInController(bkmId) {
  ignoreBkmControllerApiActionSet.addIgnoreRemove(bkmId)
  await chrome.bookmarks.remove(bkmId)
}

export async function moveBookmarkInDatedTemplate({
  parentId,
  parentTitle,
  bookmarkId,
  url,
}) {
  const datedFolder = await getDatedFolder(parentTitle)
  logBA('moveBookmarkInDatedTemplate () 11', 'datedFolder', datedFolder)

  // await chrome.bookmarks.move(bookmarkId, { parentId: datedFolder.id, index: 0 })
  await moveBookmarkIgnoreInController({ id: bookmarkId, parentId: datedFolder.id, index: 0 })

  await tagList.addRecentTagFromFolder({ id: parentId, title: parentTitle })
  removePreviousDatedBookmarks({ url, template: parentTitle })
}
