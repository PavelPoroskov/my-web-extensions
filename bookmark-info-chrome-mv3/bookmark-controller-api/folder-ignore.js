import {
  ignoreBkmControllerApiActionSet,
} from './ignoreBkmControllerApiActionSet.js'
import {
  makeLogFunction,
} from '../api-low/index.js'

const logFI = makeLogFunction({ module: 'folder-ignore.js' })

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

export async function updateFolderIgnoreInController({ id, title }) {
  ignoreBkmControllerApiActionSet.addIgnoreUpdate(id)
  await chrome.bookmarks.update(id, { title })
}

export async function moveNodeIgnoreInController({ id, parentId, index }) {
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

export async function moveFolderIgnoreInController({ id, parentId, index }) {
  logFI('moveFolderIgnoreInController 00')
  return await moveNodeIgnoreInController({ id, parentId, index })
}

export async function removeFolderIgnoreInController(bkmId) {
  ignoreBkmControllerApiActionSet.addIgnoreRemove(bkmId)
  await chrome.bookmarks.remove(bkmId)
}

