import {
  ignoreBkmControllerApiActionSet,
} from './structure/ignoreBkmControllerApiActionSet.js';

let lastCreatedBkmParentId
let lastCreatedBkmUrl

export async function createBookmarkWithApi({
  index,
  parentId,
  title,
  url
}) {
  lastCreatedBkmParentId = parentId
  lastCreatedBkmUrl = url

  return await chrome.bookmarks.create({
    index,
    parentId,
    title,
    url
  })
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

export async function createFolderIgnoreInController({
  title,
  parentId,
  index,
}) {
  const options = { parentId, title }
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

export async function updateBookmarkIgnoreInController({ id, title, url }) {
  const options = {}
  if (title != undefined) {
    options.title = title
  }
  if (url != undefined) {
    options.url = url
  }
  if (Object.keys(options).length == 0) {
    return
  }

  ignoreBkmControllerApiActionSet.addIgnoreUpdate(id)
  await chrome.bookmarks.update(id, options)
}

export async function removeBookmarkIgnoreInController(bkmId) {
  ignoreBkmControllerApiActionSet.addIgnoreRemove(bkmId)
  await chrome.bookmarks.remove(bkmId)
}
