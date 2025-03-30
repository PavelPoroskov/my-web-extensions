import {
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

const cacheForDatedTemplate = {}

async function getParentIdForDatedFolder(title) {
  const templateTitle = getDatedTemplate(title)

  let parentId = cacheForDatedTemplate[templateTitle]

  if (!parentId) {
    parentId = await findOrCreateFolder(templateTitle)
    cacheForDatedTemplate[templateTitle] = parentId
  }

  return parentId;
}

async function getFolderCorrectParentId(title) {
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

async function orderChildren(parentId) {
  if (!parentId) {
    return []
  }

  const moveList = []

  async function traverseSubFolder(folderNode, folderLevel) {

    const correct = await getFolderCorrectParentId(folderNode.title)

    let correctParentId = correct.parentId
    let isCorrect = folderNode.parentId == correctParentId
    if (!isCorrect && correct.secondParentId) {
      correctParentId = correct.secondParentId
      isCorrect = folderNode.parentId == correctParentId
    }
    if (!isCorrect) {
      moveList.push({
        id: folderNode.id,
        parentId: correctParentId,
        level: folderLevel,
      })
    }

    const folderList = folderNode.children
      .filter(({ url }) => !url)

    await folderList.reduce(
      (promiseChain, node) => promiseChain.then(
        () => traverseSubFolder(node, folderLevel + 1)
      ),
      Promise.resolve(),
    );
  }

  const [rootFolder] = await chrome.bookmarks.getSubTree(parentId)
  const folderList = rootFolder.children.filter(({ url }) => !url)

  await folderList.reduce(
    (promiseChain, node) => promiseChain.then(
      () => traverseSubFolder(node, 1)
    ),
    Promise.resolve(),
  );

  return moveList;
}

export async function moveFolders() {

  const moveList1 = await orderChildren(BOOKMARKS_BAR_FOLDER_ID)
  const moveList2 = await orderChildren(BOOKMARKS_MENU_FOLDER_ID)
  const moveList3 = await orderChildren(OTHER_BOOKMARKS_FOLDER_ID)

  const totalMoveList = [
    moveList1,
    moveList2,
    moveList3,
  ]
    .flat()
    .sort((a,b) => -(a.level - b.level))

  await totalMoveList.reduce(
    (promiseChain, { id, parentId }) => promiseChain.then(
      () => moveFolderIgnoreInController({ id, parentId })
    ),
    Promise.resolve(),
  );
}
