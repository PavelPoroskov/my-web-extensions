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

export async function moveBookmark({ id, parentId, index }) {
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
