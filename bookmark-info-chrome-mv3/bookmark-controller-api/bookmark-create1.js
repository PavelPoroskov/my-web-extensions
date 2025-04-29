import {
  createBookmarkIgnoreInController,
} from './bookmark-ignore.js'

let lastCreatedBkmParentId
let lastCreatedBkmUrl

export async function createBookmarkInCommonFolder({
  parentId,
  title,
  url,
  ignore = false,
}) {
  lastCreatedBkmParentId = parentId
  lastCreatedBkmUrl = url

  const bookmarkData = {
    index: 0,
    parentId,
    title,
    url
  }

  if (ignore) {
    // dated folder, to not add to tag list
    await createBookmarkIgnoreInController(bookmarkData)
  } else {
    // not dated folder, to add to tag list
    await chrome.bookmarks.create(bookmarkData)
  }
}

export function isBookmarkCreatedWithApi({ parentId, url }) {
  return parentId == lastCreatedBkmParentId && url == lastCreatedBkmUrl
}

