import {
  ignoreBkmControllerApiActionSet,
} from './ignoreBkmControllerApiActionSet.js'

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

  await chrome.bookmarks.move(id, options)
}

export async function moveBookmark({ id, parentId, index }) {
  await chrome.bookmarks.move(id, { parentId, index })
}

export async function removeBookmark(bkmId) {
  await chrome.bookmarks.remove(bkmId)
}
