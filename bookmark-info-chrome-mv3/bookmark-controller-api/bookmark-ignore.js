import {
  ignoreBkmControllerApiActionSet,
} from './ignoreBkmControllerApiActionSet.js'
import {
  makeLogFunction,
} from '../api-low/index.js'

const logBI = makeLogFunction({ module: 'bookmark-ignore.js' })

export async function createBookmarkIgnoreInController({
  title,
  url,
  parentId,
  index,
}) {
  logBI('createBookmarkIgnoreInController 00', url)
  const options = { url, parentId, title }
  if (index != undefined) {
    options.index = index
  }

  ignoreBkmControllerApiActionSet.addIgnoreCreate(options)

  await chrome.bookmarks.create(options)
  logBI('createBookmarkIgnoreInController 99')
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

export async function removeBookmark(bkmId) {
  await chrome.bookmarks.remove(bkmId)
}
