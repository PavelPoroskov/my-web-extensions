import {
  BOOKMARKS_BAR_FOLDER_ID,
  BOOKMARKS_MENU_FOLDER_ID,
  OTHER_BOOKMARKS_FOLDER_ID,
  isTopFolder,
  isDatedFolderTitle,
  trimTitle,
} from '../folder-api/index.js';
import {
  moveFolderIgnoreInController,
  removeFolder,
  updateFolder,
} from '../bookmark-controller-api/index.js';
import {
  makeLogFunction,
} from '../api-low/index.js';
import {
  datedTemplate,
} from '../api/index.js';
import {
  traverseFolderRecursively,
} from './traverseFolder.js'

const logMF = makeLogFunction({ module: 'moveFolders.js' })

async function getFolderCorrectParentIdByTitle(title) {
  let parentId = OTHER_BOOKMARKS_FOLDER_ID
  let secondParentId

  if (isTopFolder(title)) {
    parentId = BOOKMARKS_BAR_FOLDER_ID
  }

  if (isDatedFolderTitle(title)) {
    parentId = BOOKMARKS_MENU_FOLDER_ID || BOOKMARKS_BAR_FOLDER_ID

    secondParentId = await datedTemplate.getParentIdForDatedTitle(title)
  }

  return {
    parentId,
    secondParentId,
  }
}

async function getFolderMovements() {

  const removeList = []
  const moveList = []
  const renameList = []

  async function onFolder({ folder, level, bookmarkList, folderListLength }) {
    logMF('onFolder() 00', folder.title)
    // level 0: ROOT_FOLDER_ID
    // level 1: BOOKMARKS_BAR_FOLDER_ID, BOOKMARKS_MENU_FOLDER_ID, OTHER_BOOKMARKS_FOLDER_ID
    if (!(2 <= level)) {
      return
    }

    // if (folder.id in BUILTIN_BROWSER_FOLDER_MAP) {
    //   return
    // }

    if (bookmarkList.length == 0 && folderListLength == 0 && isDatedFolderTitle(folder.title)) {
      removeList.push(folder.id)
      return
    }

    // logMF('orderChildren() 11 folder')
    // logMF(folder)
    logMF('onFolder() 11')
    const correct = await getFolderCorrectParentIdByTitle(folder.title)
    logMF('onFolder() 22', correct)

    let correctParentId = correct.parentId
    let isCorrect = folder.parentId == correctParentId
    if (!isCorrect && correct.secondParentId) {
      correctParentId = correct.secondParentId
      isCorrect = folder.parentId == correctParentId
    }
    if (!isCorrect) {
      logMF('onFolder() 33')
      logMF(correct)
      moveList.push({
        id: folder.id,
        parentId: correctParentId,
        level,
      })
    }


    const trimmedTitle = trimTitle(folder.title)

    if (folder.title !== trimmedTitle) {
      renameList.push({
        id: folder.id,
        title: trimmedTitle,
      })
    }
  }

  const [rootFolder] = await chrome.bookmarks.getTree()
  await traverseFolderRecursively({ folder: rootFolder, onFolder })

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
