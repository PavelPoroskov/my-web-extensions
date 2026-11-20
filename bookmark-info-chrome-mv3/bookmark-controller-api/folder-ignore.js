import {
  ignoreBkmControllerApiActionSet,
} from './ignoreBkmControllerApiActionSet.js'
import {
  makeLogFunction,
} from '../api-low/index.js'
import {
  createBookmarkIgnoreInController,
} from './bookmark-ignore.js'
const logFI = makeLogFunction({ module: 'folder-ignore.js' })

export async function createFolderIgnoreInController({
  title,
  parentId,
  index,
  parentTitleForDebug,
}) {
  logFI('CREATE FOLDER ', title, ' -> ', parentTitleForDebug)
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

export async function moveFolderIgnoreInController({ id, parentId, index, titleForDebug, parentTitleForDebug }) {
  logFI('MOVE FOLDER ', titleForDebug, ' -> ', parentTitleForDebug)
  // logFI('moveFolderIgnoreInController 00', id, parentId)
  return await moveNodeIgnoreInController({ id, parentId, index })
}

// eslint-disable-next-line no-unused-vars
export async function moveFolderContentToEnd(fromFolderId, toFolderId) {
  const nodeList = await chrome.bookmarks.getChildren(fromFolderId)

  await nodeList.reduce(
    (promiseChain, node) => promiseChain.then(
      () => moveNodeIgnoreInController({ id: node.id, parentId: toFolderId })
    ),
    Promise.resolve(),
  );
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

export async function copyFolderContentToStart(fromFolderId, toFolderId) {
  const fromNodeList = await chrome.bookmarks.getChildren(fromFolderId)
  const fromBookmarkList = fromNodeList.filter(({ url }) => !!url)

  const toNodeList = await chrome.bookmarks.getChildren(toFolderId)
  const toBookmarkList = toNodeList.filter(({ url }) => !!url)
  const toSet = new Set(toBookmarkList.map(({ url }) => url))

  const addList = fromBookmarkList.filter(({ url }) => !toSet.has(url))
  // console.log('copyFolderContentToStart', 'addList.length', addList.length)

  await addList.toReversed().reduce(
    (promiseChain, node) => promiseChain.then(
      () => createBookmarkIgnoreInController({ url: node.url, title: node.title,  parentId: toFolderId, index: 0 })
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

