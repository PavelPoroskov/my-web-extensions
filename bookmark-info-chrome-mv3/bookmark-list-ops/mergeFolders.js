import {
  BOOKMARKS_BAR_FOLDER_ID,
  BOOKMARKS_MENU_FOLDER_ID,
  OTHER_BOOKMARKS_FOLDER_ID,
  normalizeTitle,
  trimTitle,
} from '../folder-api/index.js'
import {
  removeFolder,
  updateFolderIgnoreInController,
  moveNodeIgnoreInController,
} from '../bookmark-controller-api/index.js'


async function moveContent(fromFolderId, toFolderId) {
  const nodeList = await chrome.bookmarks.getChildren(fromFolderId)

  await nodeList.reduce(
    (promiseChain, node) => promiseChain.then(
      () => moveNodeIgnoreInController({ id: node.id, parentId: toFolderId })
    ),
    Promise.resolve(),
  );
}

async function mergeSubFolder(parentId) {
  // console.log('### mergeSubFolder 00,', parentId)
  const nodeList = await chrome.bookmarks.getChildren(parentId)
  const folderNodeList = nodeList.filter(({ url }) => !url)
  const nameSet = {}

  for (const node of folderNodeList) {
    const normalizedTitle = normalizeTitle(node.title)

    if (!nameSet[normalizedTitle]) {
      nameSet[normalizedTitle] = [node]
    } else {
      nameSet[normalizedTitle].push(node)
    }
  }
  // console.log('### mergeSubFolder 11: nameSet', nameSet)

  const notUniqList = Object.entries(nameSet).filter(([, nodeList]) => nodeList.length > 1)
  const moveTaskList = []
  for (const [, nodeList] of notUniqList) {
    const sortedList = nodeList.toSorted((a, b) => -a.title.localeCompare(b.title))
    const firstNode = sortedList[0]
    const restNodeList = nodeList.filter((item) => item.id != firstNode.id)

    for (const fromNode of restNodeList) {
      moveTaskList.push({
        fromNode,
        toNode: firstNode,
      })
    }
  }
  // console.log('### moveTaskList', moveTaskList.map(({ fromNode, toNode }) => `${fromNode.title} -> ${toNode.title}`))

  await moveTaskList.reduce(
    (promiseChain, { fromNode, toNode }) => promiseChain.then(
      () => moveContent(fromNode.id, toNode.id)
    ),
    Promise.resolve(),
  );

  await moveTaskList.reduce(
    (promiseChain, { fromNode }) => promiseChain.then(
      () => removeFolder(fromNode.id)
    ),
    Promise.resolve(),
  );
}

async function trimTitleInSubFolder(parentId) {
  const nodeList = await chrome.bookmarks.getChildren(parentId)
  const folderNodeList = nodeList.filter(({ url }) => !url)

  const renameTaskList = []
  for (const folderNode of folderNodeList) {

    const trimmedTitle = trimTitle(folderNode.title)
    if (folderNode.title !== trimmedTitle) {
      renameTaskList.push({
        id: folderNode.id,
        title: trimmedTitle,
      })
    }
  }

  await renameTaskList.reduce(
    (promiseChain, { id, title }) => promiseChain.then(
      () => updateFolderIgnoreInController({ id,  title })
    ),
    Promise.resolve(),
  );
}

export async function mergeFolders() {
  await mergeSubFolder(BOOKMARKS_BAR_FOLDER_ID)
  if (BOOKMARKS_MENU_FOLDER_ID) {
    await mergeSubFolder(BOOKMARKS_MENU_FOLDER_ID)
  }
  await mergeSubFolder(OTHER_BOOKMARKS_FOLDER_ID)

  await trimTitleInSubFolder(BOOKMARKS_BAR_FOLDER_ID)
  if (BOOKMARKS_MENU_FOLDER_ID) {
    await trimTitleInSubFolder(BOOKMARKS_MENU_FOLDER_ID)
  }
  await trimTitleInSubFolder(OTHER_BOOKMARKS_FOLDER_ID)
}
