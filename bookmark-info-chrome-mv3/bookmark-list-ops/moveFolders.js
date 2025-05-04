import {
  ROOT_FOLDER_ID,
  BOOKMARKS_BAR_FOLDER_ID,
  BOOKMARKS_MENU_FOLDER_ID,
  OTHER_BOOKMARKS_FOLDER_ID,
  getDatedTemplate,
  isTopFolder,
  isDatedFolderTitle,
} from '../folder-api/index.js';
import {
  moveFolderIgnoreInController,
  findOrCreateFolder,
} from '../bookmark-controller-api/index.js';
import {
  makeLogFunction,
} from '../api-low/index.js';
import {
  traverseFolderRecursively,
} from './traverseFolder.js'

const logMF = makeLogFunction({ module: 'moveFolders.js' })

const cacheForDatedTemplate = {}

async function getParentIdForDatedFolder(title) {
  const templateTitle = getDatedTemplate(title)

  let parentId = cacheForDatedTemplate[templateTitle]

  if (!parentId) {
    const parentFolder = await findOrCreateFolder(templateTitle)
    parentId = parentFolder.id
    cacheForDatedTemplate[templateTitle] = parentId
  }

  return parentId;
}

async function getFolderCorrectParentIdByTitle(title) {
  let parentId = OTHER_BOOKMARKS_FOLDER_ID
  let secondParentId

  if (isTopFolder(title)) {
    parentId = BOOKMARKS_BAR_FOLDER_ID
  }

  if (isDatedFolderTitle(title)) {
    parentId = BOOKMARKS_MENU_FOLDER_ID || BOOKMARKS_BAR_FOLDER_ID
    secondParentId = await getParentIdForDatedFolder(title)
  }

  return {
    parentId,
    secondParentId,
  }
}

const mapIdToParentId = {
  [BOOKMARKS_BAR_FOLDER_ID]: { parentId: ROOT_FOLDER_ID },
  [OTHER_BOOKMARKS_FOLDER_ID]: { parentId: ROOT_FOLDER_ID },
}
if (BOOKMARKS_MENU_FOLDER_ID) {
  mapIdToParentId[BOOKMARKS_MENU_FOLDER_ID] = { parentId: ROOT_FOLDER_ID }
}

async function getFolderCorrectParentId(folder) {
  return mapIdToParentId[folder.id] || (await getFolderCorrectParentIdByTitle(folder.title))
}

async function orderChildren(parentId) {
  if (!parentId) {
    return []
  }

  const moveList = []

  async function onFolder({ folder, level }) {
    // logMF('orderChildren() 11 folder')
    // logMF(folder)
    const correct = await getFolderCorrectParentId(folder)

    let correctParentId = correct.parentId
    let isCorrect = folder.parentId == correctParentId
    if (!isCorrect && correct.secondParentId) {
      correctParentId = correct.secondParentId
      isCorrect = folder.parentId == correctParentId
    }
    if (!isCorrect) {
      logMF('orderChildren() 22 correct')
      logMF(correct)
      moveList.push({
        id: folder.id,
        parentId: correctParentId,
        level,
      })
    }
  }

  const [rootFolder] = await chrome.bookmarks.getSubTree(parentId)
  await traverseFolderRecursively({ folder: rootFolder, onFolder })

  return moveList;
}

export async function moveFolders() {
  logMF('moveFolders() 00')

  const moveList1 = await orderChildren(BOOKMARKS_BAR_FOLDER_ID)
  logMF('moveFolders() 11')
  const moveList2 = await orderChildren(BOOKMARKS_MENU_FOLDER_ID)
  logMF('moveFolders() 22')
  const moveList3 = await orderChildren(OTHER_BOOKMARKS_FOLDER_ID)
  logMF('moveFolders() 33')

  const totalMoveList = [
    moveList1,
    moveList2,
    moveList3,
  ]
    .flat()
    .sort((a,b) => -(a.level - b.level))

  logMF('moveFolders() 44')
  logMF(totalMoveList)

  await totalMoveList.reduce(
    (promiseChain, { id, parentId }) => promiseChain.then(
      () => moveFolderIgnoreInController({ id, parentId })
    ),
    Promise.resolve(),
  );

  logMF('moveFolders() 99')
}
