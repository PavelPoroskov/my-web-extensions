import {
  createFolderIgnoreInController,
  copyFolderContentToStart,
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

export async function flatChildFolders({ folderId, isMovingFolder, level }) {
  logMF('flatChildFolders() 00')

  const moveList = []

  async function onFolderInFlatChildFolders({ folder }) {

    let isMovingCondition = (folder.parentId !== folderId)

    if (isMovingCondition && isMovingFolder != undefined) {
      isMovingCondition = await isMovingFolder(folder)
    }

    if (isMovingCondition) {
      moveList.push({
        id: folder.id,
        parentId: folderId,
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
    (promiseChain, { id, parentId }) => promiseChain.then(
      () => moveFolderIgnoreInController({ id, parentId })
    ),
    Promise.resolve(),
  );
}

export async function moveChildFolders({ fromId, toId, isMovingFolder, filterList, createToId }) {
  logMF('moveChildFolders() 00')
  let moveList = []

  async function onFolderInMoveChildFolders({ folder }) {
    let isMovingCondition

    if (isMovingFolder == undefined) {
      isMovingCondition = true
    } else {
      isMovingCondition = await isMovingFolder(folder)
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
    (promiseChain, { id }) => promiseChain.then(
      () => moveFolderIgnoreInController({ id, parentId: finalToId })
    ),
    Promise.resolve(),
  );
}

export async function copyChildFolders({ fromId, toId, isMovingFolder, getNewFolderTitle }) {
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

  await folderList.reduce(
    (promiseChain, fromFolder) => promiseChain.then(
      async () => {
        let toFolder = await findChildFolder({ title: fromFolder.title, parentId: toId })

        if (!toFolder) {
          toFolder = await createFolderIgnoreInController({ title: getNewFolderTitle(fromFolder), parentId: toId })
        }

        await copyFolderContentToStart(fromFolder.id, toFolder.id)
      }
    ),
    Promise.resolve(),
  );
}
