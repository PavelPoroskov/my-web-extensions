import {
  createFolderIgnoreInController,
  createBookmarkIgnoreInController,
  moveFolderIgnoreInController,
} from '../bookmark-controller-api/index.js'
import {
  makeLogFunction,
} from '../api-low/index.js'
import {
  traverseChildFoldersRecursively,
  traverseChildFolders,
} from './traverseFolder.js'
import {
  findChildFolder,
} from './folder-directives.js'

const logMF = makeLogFunction({ module: 'moveFolders.js' })

export async function flatChildFolders({ folderId, isMovingFolder, level, titleForDebug }) {
  logMF('flatChildFolders() 00')

  const moveList = []

  async function onFolderInFlatChildFolders({ folder }) {

    let isMovingCondition = (folder.parentId !== folderId)

    if (isMovingCondition && isMovingFolder != undefined) {
      isMovingCondition = isMovingFolder(folder)
    }

    if (isMovingCondition) {
      moveList.push({
        ...folder,
        level,
      })
    }
  }

  await traverseChildFoldersRecursively({ folderId, onFolder: onFolderInFlatChildFolders })

  logMF('flatChildFolders() 22')
  const sortedMoveList = moveList
    .sort((a,b) => -(a.level - b.level))

  logMF('flatChildFolders() 33')
  await sortedMoveList.reduce(
    (promiseChain, folder) => promiseChain.then(
      () => moveFolderIgnoreInController({
        id: folder.id,
        parentId: folderId,
        titleForDebug: folder.title,
        parentTitleForDebug: titleForDebug
      })
    ),
    Promise.resolve(),
  );
}

export async function moveChildFolders({ fromId, toId, isMovingFolder, filterList, createToId, titleForDebug }) {
  logMF('moveChildFolders() 00')
  let moveList = []

  async function onFolderInMoveChildFolders({ folder }) {
    let isMovingCondition

    if (isMovingFolder == undefined) {
      isMovingCondition = true
    } else {
      isMovingCondition = isMovingFolder(folder)
      // logMF('onFolderInMoveChildFolders() 11', 'isMovingFolder', folder.title, isMovingCondition)
    }

    if (isMovingCondition) {
      moveList.push(folder)
    }
  }

  await traverseChildFolders({ folderId: fromId, onFolder: onFolderInMoveChildFolders })

  logMF('moveChildFolders() 11')
  if (filterList != undefined) {
    moveList = filterList(moveList)
  }

  let finalToId = toId

  logMF('moveChildFolders() 22')
  if (!finalToId && !!createToId) {
    finalToId = await createToId()
  }

  logMF('moveChildFolders() 33')
  await moveList.reduce(
    (promiseChain, folder) => promiseChain.then(
      () => moveFolderIgnoreInController({
        id: folder.id,
        parentId: finalToId,
        titleForDebug: folder.title,
        parentTitleForDebug: titleForDebug
      })
    ),
    Promise.resolve(),
  );
}

async function copyFolderContentToStart(fromFolderId, toFolderId) {
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

export async function copyChildFolders({ fromId, toId, isMovingFolder, getNewFolderTitle, titleForDebug }) {
  let folderList = []

  async function onFolderInCopyChildFolders({ folder }) {
    let isMovingCondition

    if (isMovingFolder == undefined) {
      isMovingCondition = true
    } else {
      isMovingCondition = isMovingFolder(folder)
      // logMF('onFolderInCopyChildFolders() 11', 'isMovingFolder', folder.title, isMovingCondition)
    }

    if (isMovingCondition) {
      folderList.push(folder)
    }
  }

  await traverseChildFolders({ folderId: fromId, onFolder: onFolderInCopyChildFolders })

  logMF('copyChildFolders() 11 folderList', folderList)
  await folderList.reduce(
    (promiseChain, fromFolder) => promiseChain.then(
      async () => {
        logMF('copyChildFolders() 22.1 fromFolder.title', fromFolder.title)
        let toFolder = await findChildFolder({ title: fromFolder.title, parentId: toId })

        if (!toFolder) {
          logMF('copyChildFolders() 22.2 fromFolder.title', fromFolder.title)
          toFolder = await createFolderIgnoreInController({
            title: getNewFolderTitle(fromFolder),
            parentId: toId,
            parentTitleForDebug: titleForDebug,
          })
        }

        await copyFolderContentToStart(fromFolder.id, toFolder.id)
      }
    ),
    Promise.resolve(),
  );
}
