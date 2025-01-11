import {
  ignoreBkmControllerApiActionSet,
} from '../data-structures/index.js';
import {
  getDatedFolder,
  isDatedFolderTemplate,
} from './folder-dated.js';
import {
  makeLogFunction,
} from '../api-low/index.js';

const logBA = makeLogFunction({ module: 'bookmark.api.js' })

let lastCreatedBkmParentId
let lastCreatedBkmUrl

export async function createBookmarkWithApi({
  index,
  parentId,
  title,
  url
}) {
  logBA('createBookmarkWithApi () 00', 'parentId', parentId)
  let actualParentId = parentId

  const [folderNode] = await chrome.bookmarks.get(parentId)
  logBA('createBookmarkWithApi () 22', 'folderNode', folderNode)
  if (isDatedFolderTemplate(folderNode.title)) {
    const datedFolder = await getDatedFolder(folderNode)
    logBA('createBookmarkWithApi () 33', 'datedFolder', datedFolder)
    actualParentId = datedFolder.id
  }

  const bookmarkList = await chrome.bookmarks.search({ url });
  const isExist = bookmarkList.some((bkm) => bkm.parentId == actualParentId)
  if (isExist) {
    return false
  }

  lastCreatedBkmParentId = actualParentId
  lastCreatedBkmUrl = url

  await chrome.bookmarks.create({
    index,
    parentId: actualParentId,
    title,
    url
  })

  return true
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
