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

async function moveNodeIgnoreInController({ id, parentId, index }) {
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

export async function moveFolderContentToStart(fromFolderId, toFolderId) {
  const nodeList = await chrome.bookmarks.getChildren(fromFolderId)
  const reversedNodeList = nodeList.toReversed()

  await reversedNodeList.reduce(
    (promiseChain, node) => promiseChain.then(
      () => moveNodeIgnoreInController({ id: node.id, parentId: toFolderId, index: 0 })
    ),
    Promise.resolve(),
  );
}

export async function updateFolderIgnoreInController({ id, title }) {
  ignoreBkmControllerApiActionSet.addIgnoreUpdate(id)
  await chrome.bookmarks.update(id, { title })
}

export async function updateFolder({ id, title }) {
  await chrome.bookmarks.update(id, { title })
}

export async function removeFolder(bkmId) {
  await chrome.bookmarks.remove(bkmId)
}

