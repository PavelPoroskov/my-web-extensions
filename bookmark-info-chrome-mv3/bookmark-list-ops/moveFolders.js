import {
  isDatedFolderTitle,
  trimTitle,
} from '../folder-api/index.js'
import {
  moveFolderIgnoreInController,
  removeFolder,
  updateFolder,
} from '../bookmark-controller-api/index.js'
import {
  folderCreator,
} from '../folder-creator-api/index.js'
import {
  makeLogFunction,
} from '../api-low/index.js'
import {
  traverseTreeRecursively,
} from './traverseFolder.js'

const logMF = makeLogFunction({ module: 'moveFolders.js' })

async function getFolderMovements() {

  const removeList = []
  const moveList = []
  const renameList = []
  const datedRootOldId = await folderCreator.findDatedRootOld()

  async function onFolder({ folder, level, bookmarkList, folderListLength }) {
    logMF('onFolder() 00', folder.title, folder.id)

    // level 0: ROOT_FOLDER_ID
    // level 1: BOOKMARKS_BAR_FOLDER_ID, BOOKMARKS_MENU_FOLDER_ID, OTHER_BOOKMARKS_FOLDER_ID
    if (level < 2) {
      return
    }

    if (bookmarkList.length == 0 && folderListLength == 0 && isDatedFolderTitle(folder.title)) {
      removeList.push(folder.id)
      return
    }

    const folderInfo = await folderCreator.getFolderInfoWithParentId(folder.title)

    switch (folderInfo.folderType) {
      case 'dated folder': {
        const correctParentSet = new Set([folderInfo.parentId])
        if (datedRootOldId) {
          correctParentSet.add(datedRootOldId)
        }

        if (!correctParentSet.has(folder.parentId)) {
          moveList.push({
            id: folder.id,
            parentId: folderInfo.parentId,
            level,
          })
        }

        break
      }
      default: {
        if (folder.parentId !== folderInfo.parentId) {
          moveList.push({
            id: folder.id,
            parentId: folderInfo.parentId,
            level,
          })
        }
      }
    }

    const trimmedTitle = trimTitle(folder.title)

    if (folder.title !== trimmedTitle) {
      renameList.push({
        id: folder.id,
        title: trimmedTitle,
      })
    }
  }

  await traverseTreeRecursively({ onFolder })

  return {
    removeList,
    moveList,
    renameList,
  };
}

export async function moveFolders() {
  logMF('moveFolders() 00')

  const {
    removeList,
    moveList,
    renameList,
  } = await getFolderMovements()

  const sortedMoveList = moveList
    .sort((a,b) => -(a.level - b.level))

  logMF('moveFolders() 44')
  logMF(sortedMoveList)

  await removeList.reduce(
    (promiseChain, folderId) => promiseChain.then(
      () => removeFolder(folderId)
    ),
    Promise.resolve(),
  );

  await sortedMoveList.reduce(
    (promiseChain, { id, parentId }) => promiseChain.then(
      () => moveFolderIgnoreInController({ id, parentId })
    ),
    Promise.resolve(),
  );

  await renameList.reduce(
    (promiseChain, { id, title }) => promiseChain.then(
      () => updateFolder({ id,  title })
    ),
    Promise.resolve(),
  );

  logMF('moveFolders() 99')
}
